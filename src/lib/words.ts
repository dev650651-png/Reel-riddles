// Helpers to time everything from public/words.json (written by tools/word_times.py).
// Usage in a video:  import words from "../../../public/words.json";  const f = wordFrame(words, "riddle");
export type Word = { word: string; start: number; end: number };
export type Line = { start: number; end: number; text: string };
export type WordsFile = { source: string; audio: string; duration: number; words: Word[]; lines: Line[] };

const clean = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/** Frame where the nth (1-based) occurrence of `word` starts. Throws if missing: never guess times. */
export const wordFrame = (data: WordsFile, word: string, fps = 30, nth = 1): number => {
  const hits = data.words.filter((w) => clean(w.word) === clean(word));
  const hit = hits[nth - 1];
  if (!hit) throw new Error(`"${word}" #${nth} not in words.json (source: ${data.source})`);
  return Math.round(hit.start * fps);
};

/** Frame where line i (0-based) starts; used when only silencedetect line times exist. */
export const lineFrame = (data: WordsFile, i: number, fps = 30): number => {
  const l = data.lines[i];
  if (!l) throw new Error(`line ${i} not in words.json`);
  return Math.round(l.start * fps);
};

/** Video length: voice end + 2 s tail (Part 1 rule). */
export const durationFromVoice = (data: WordsFile, fps = 30, tailSec = 2): number =>
  Math.ceil((data.duration + tailSec) * fps);
