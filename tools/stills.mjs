#!/usr/bin/env node
// Renders a list of frames of one composition and tiles them into a contact sheet (4 per row).
//   tools/stills <CompositionId> <frames...> [--out out/sheet.png] [--cols 4] [--width 360]
// A frame can be a frame number (45), seconds (1.5s), or a word from public/words.json
// (@riddle, or @riddle#2 for its 2nd occurrence; the frame is the word's start).
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  if (i === -1) return def;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const out = path.resolve(opt("--out", path.join(root, "out", "sheet.png")));
const cols = Number(opt("--cols", 4));
const tileW = Number(opt("--width", 360));
const [compId, ...specs] = args;
if (!compId || specs.length === 0) {
  console.error("usage: tools/stills <CompositionId> <frame|1.5s|@word ...> [--out file.png] [--cols 4]");
  process.exit(1);
}

const browserPath = execFileSync("bash", [path.join(root, "tools/find_browser")], { encoding: "utf8" }).trim();
console.log("bundling...");
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), rspack: true });
const browser = await openBrowser("chrome", { browserExecutable: browserPath });
const composition = await selectComposition({ serveUrl, id: compId, puppeteerInstance: browser, browserExecutable: browserPath });
const fps = composition.fps;

let words = null;
const toFrame = (s) => {
  if (s.startsWith("@")) {
    words ??= JSON.parse(fs.readFileSync(path.join(root, "public/words.json"), "utf8"));
    const [w, nth = "1"] = s.slice(1).split("#");
    const clean = (x) => x.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
    const hits = (words.words ?? []).filter((x) => clean(x.word) === clean(w));
    const hit = hits[Number(nth) - 1];
    if (!hit) throw new Error(`word "${w}" #${nth} not found in public/words.json`);
    return Math.round(hit.start * fps);
  }
  if (s.endsWith("s")) return Math.round(parseFloat(s) * fps);
  return parseInt(s, 10);
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "stills-"));
const files = [];
for (const [i, spec] of specs.entries()) {
  const frame = Math.min(composition.durationInFrames - 1, Math.max(0, toFrame(spec)));
  const file = path.join(tmp, `${String(i).padStart(3, "0")}.png`);
  await renderStill({ composition, serveUrl, output: file, frame, puppeteerInstance: browser, browserExecutable: browserPath, overwrite: true });
  files.push({ file, label: `${spec} f${frame} ${(frame / fps).toFixed(2)}s` });
  console.log(`still ${i + 1}/${specs.length}: ${spec} -> frame ${frame}`);
}
await browser.close({ silent: true });

// Tile with ffmpeg: scale each, burn in a label, xstack into rows of `cols`.
const rows = Math.ceil(files.length / cols);
const tileH = Math.round((tileW * composition.height) / composition.width);
const inputs = files.flatMap((f) => ["-i", f.file]);
const font = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
let fc = "";
files.forEach((f, i) => {
  const text = f.label.replace(/[:'\\%]/g, " ");
  fc += `[${i}:v]scale=${tileW}:${tileH},drawbox=x=0:y=0:w=iw:h=34:color=black@0.6:t=fill,drawtext=fontfile=${font}:text='${text}':x=8:y=8:fontsize=18:fontcolor=white[t${i}];`;
});
// pad with black tiles to fill the last row
const total = rows * cols;
for (let i = files.length; i < total; i++) fc += `color=c=black:s=${tileW}x${tileH}:d=1[t${i}];`;
const layout = Array.from({ length: total }, (_, i) => `${(i % cols) * tileW}_${Math.floor(i / cols) * tileH}`).join("|");
fc += Array.from({ length: total }, (_, i) => `[t${i}]`).join("") + `xstack=inputs=${total}:layout=${layout}:fill=black[o]`;
fs.mkdirSync(path.dirname(out), { recursive: true });
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...inputs, "-filter_complex", fc, "-map", "[o]", "-frames:v", "1", out], { stdio: "inherit" });
fs.rmSync(tmp, { recursive: true, force: true });
fs.rmSync(serveUrl, { recursive: true, force: true });
console.log(`contact sheet: ${out} (${files.length} stills, ${cols} per row)`);
