// ScooterProfit (Part 1). Every time below comes from words.json (snapshot of public/words.json for this voice).
import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadPoppins } from "../../lib/fonts";
import { BazaarBack, Bunting, CartoonDefs, Character, DroppingTag, Dust, FlyingNotes, Foreground, Ground, INK, Pose, PriceTag, Scooter } from "../../lib/cartoon";
import { bounceHeight, fallTime, keys, smooth, squash } from "../../lib/physics";
import { Cam, Chip, Finish, FollowButton, layer, shake, Tile } from "../../lib/ui";
import wordsData from "./words.json";

loadPoppins();

type Word = { word: string; start: number; end: number };
const WORDS = wordsData.words as Word[];
const W = (word: string, nth = 1): number => {
  const hit = WORDS.filter((w) => w.word === word)[nth - 1];
  if (!hit) throw new Error(`"${word}" #${nth} missing from words.json`);
  return hit.start;
};

const FPS = 30;
export const SCOOTER_PROFIT_DURATION = Math.ceil((wordsData.duration + 2) * FPS);

// ---- spoken cue times (seconds)
const T = {
  batao: W("बताओ"), kitna: W("कितना"), sunday: W("संडे"), pappu2: W("पप्पू", 2), kharida: W("ख़रीदा"), aath: W("आठ"),
  phir: W("फिर"), vahi: W("वही"), golu: W("गोलू"), bech1: W("बेच"), nau: W("नौ"), agle: W("अगले"), pappu3: W("पप्पू", 3),
  vapas: W("वापस"), kharid2: W("ख़रीद"), das: W("दस"), aur: W("और"), use2: W("उसे", 2), bech2: W("बेच", 2), gyarah: W("ग्यारह"),
  ab: W("अब"), socho: W("सोचो"), kul: W("कुल"), A: W("ए"), B: W("बी"), C: W("सी"), D: W("डी"), dhyan: W("ध्यान"),
  fanste: W("फँसते"), comment: W("कमेंट"), sahi: W("सही"), agli: W("अगली"), follow: W("फ़ॉलो"), karo: W("करो"),
};
const CUTS = [0, T.sunday, T.pappu2, T.phir, T.agle, T.aur, T.ab, T.A, T.dhyan, T.sahi];
const GROUND = 1560;

// ---- helpers
const World: React.FC<{ cam: Cam; t: number; dim?: number; children: React.ReactNode; fg?: boolean }> = ({ cam, t, dim, children, fg = true }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <CartoonDefs />
    <g transform={layer(cam, 0.5)}>
      <BazaarBack t={t} dim={dim} />
    </g>
    <g transform={layer(cam, 0.8)}>
      <Bunting t={t} />
    </g>
    <g transform={layer(cam, 1)}>
      <Ground />
      {children}
    </g>
    {fg && (
      <g transform={layer(cam, 1.3)}>
        <Foreground t={t} />
      </g>
    )}
  </svg>
);

const walkHop = (t: number) => Math.abs(Math.sin(t * 11)) * 18;

// ================================================================ scenes
const Hook: React.FC<{ t: number }> = ({ t }) => {
  // frame 0 is mid-action: scooter already falling, Pappu mid-jump
  const h = 620;
  const t0 = -0.18;
  const dt = t - t0;
  const hit = fallTime(h);
  const sh = shake(dt - hit, 18);
  const cam: Cam = { x: keys(t, [[0, 0], [T.sunday, 20]]) + sh[0], y: keys(t, [[0, -170], [T.sunday, -110]]) + sh[1], s: keys(t, [[0, 1.0], [T.sunday, 1.08]]) };
  const jump = t < 0.5 ? Math.max(0, 260 * (1 - ((t + 0.25) / 0.75) ** 2)) : bounceHeight(t - 0.5, 0, 0.3);
  const pose: Pose = t < T.batao ? { armF: 150, armB: 150, mouth: "grin", brows: 10 } : { armF: 70, armB: 70, mouth: "o", brows: 18, look: [0.4, -0.6] };
  const tags = ["8,000", "9,000", "10,000", "11,000"];
  return (
    <World cam={cam} t={t}>
      {tags.map((tx, i) => {
        const a = t * 0.9 + i * (Math.PI / 2);
        return <PriceTag key={tx} x={700 + Math.cos(a) * 200} y={830 + Math.sin(a) * 90} s={0.75} rot={Math.sin(t * 3 + i) * 14} text={`RS ${tx}`} />;
      })}
      <Scooter x={640} y={GROUND} hop={bounceHeight(dt, h, 0.25)} sq={squash(dt - hit, 0.3)} wheel={t * 200} />
      <Dust x={640} y={GROUND} dt={dt - hit} size={1.3} />
      <Character kind="pappu" x={300} y={GROUND + 10} s={0.95} t={t} pose={pose} hop={jump} sq={t < 0.5 ? [0.95, 1.06] : squash(t - 0.5, 0.18)} />
    </World>
  );
};

const BazaarWide: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - T.sunday;
  const cam: Cam = { x: keys(lt, [[0, -160], [1.4, 60]]), y: 40, s: 1.0 };
  const px = 80 + lt * 210;
  return (
    <World cam={cam} t={t}>
      <Scooter x={720} y={GROUND} wheel={0} />
      <PriceTag x={720} y={1150} s={0.85} rot={Math.sin(t * 4) * 6} text="SALE" color="#FF8FA3" />
      <Character kind="pappu" x={px} y={GROUND + 10} s={0.9} t={t} pose={{ armF: 30 + Math.sin(t * 11) * 20, armB: 30 - Math.sin(t * 11) * 20, mouth: "smile", look: [1, 0] }} hop={walkHop(t)} />
    </World>
  );
};

const Buy: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - T.pappu2;
  const cam: Cam = { x: keys(lt, [[0, 40], [3.2, 90]]), y: keys(lt, [[0, 120], [3.2, 180]]), s: keys(lt, [[0, 1.12], [3.2, 1.2]]) };
  const paying = t >= T.kharida - 0.25;
  const pose: Pose = t < T.kharida - 0.25
    ? { armF: 25, mouth: "smile", look: [1, 0.2] }
    : t < T.aath + 0.3
      ? { armF: 85, mouth: "flat", holdF: t < T.kharida + 0.1 ? "notes" : null, look: [1, 0] }
      : { armF: 150, armB: 20, mouth: "grin", brows: 10, look: [0.5, -0.3] };
  return (
    <World cam={cam} t={t}>
      <Scooter x={680} y={GROUND} />
      <Character kind="pappu" x={300} y={GROUND + 10} s={0.95} t={t} pose={pose} />
      {paying && <FlyingNotes t={t} t0={T.kharida} from={[470, 1180]} to={[1250, 1000]} />}
      <DroppingTag t={t} t0={T.aath - 0.26} x={640} y={1300} text="RS 8,000" />
    </World>
  );
};

const SellGolu: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - T.phir;
  const cam: Cam = { x: keys(lt, [[0, 0], [3.3, 60]]), y: 120, s: keys(lt, [[0, 1.08], [3.3, 1.14]]) };
  const goluIn = smooth((t - T.golu) / 0.35);
  const leave = Math.max(0, t - (T.nau + 0.45));
  const gx = 1300 - 480 * goluIn + leave * leave * 1400;
  const sx = 560 + leave * leave * 1400;
  const golu: Pose = t < T.bech1 - 0.2 ? { armF: 20, mouth: "smile", look: [-1, 0] } : t < T.bech1 + 0.25 ? { armB: 90, holdB: "notes", mouth: "grin", look: [-1, 0] } : { armB: 20, armF: 140, mouth: "grin" };
  const pappu: Pose = t < T.vahi ? { armF: 30, mouth: "smile", look: [1, 0] } : t < T.bech1 + 0.3 ? { armF: 95, mouth: "grin", look: [1, 0], brows: 8 } : { armF: 60, holdF: "notes", mouth: "grin", brows: 12 };
  const goluHop = goluIn < 1 && t > T.golu ? walkHop(t) : 0;
  return (
    <World cam={cam} t={t}>
      <Character kind="golu" x={gx} y={GROUND + 10} s={0.9} t={t} pose={golu} hop={goluHop} phase={2} sq={t > T.golu + 0.35 ? squash(t - T.golu - 0.35, 0.12) : [1, 1]} />
      <Scooter x={sx} y={GROUND} wheel={leave * 900} />
      {leave > 0 && <Dust x={sx - 250} y={GROUND} dt={leave % 0.7} size={0.7} />}
      <Character kind="pappu" x={230} y={GROUND + 10} s={0.95} t={t} pose={pappu} />
      {t >= T.bech1 && <FlyingNotes t={t} t0={T.bech1} from={[gx - 200, 1150]} to={[380, 1200]} />}
      <DroppingTag t={t} t0={T.nau - 0.26} x={540} y={1300} text="RS 9,000" />
    </World>
  );
};

const BuyBack: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - T.agle;
  const cam: Cam = { x: keys(lt, [[0, 80], [3.6, 20]]), y: 130, s: keys(lt, [[0, 1.1], [3.6, 1.16]]) };
  const pIn = smooth((t - T.pappu3) / 0.4);
  const px = -250 + 480 * pIn;
  const pappu: Pose = t < T.vapas ? { armF: 40, mouth: "smile", look: [1, 0] } : t < T.kharid2 ? { armF: 30, mouth: "o", brows: 22, look: [1, -0.2] } : t < T.das + 0.3 ? { armF: 90, holdF: t < T.kharid2 + 0.1 ? "notes" : null, mouth: "worried", brows: 18 } : { armF: 30, mouth: "o", brows: 24, look: [0.3, -0.8] };
  const golu: Pose = t < T.das ? { armB: 30, mouth: "smile", look: [-1, 0] } : { armB: 60, armF: 150, mouth: "grin", brows: 14 };
  return (
    <World cam={cam} t={t}>
      <Character kind="golu" x={830} y={GROUND + 10} s={0.9} t={t} pose={golu} phase={2} />
      <Scooter x={640} y={GROUND} />
      <Character kind="pappu" x={px} y={GROUND + 10} s={0.95} t={t} pose={pappu} hop={pIn < 1 && t > T.pappu3 ? walkHop(t) : 0} />
      {t >= T.kharid2 && <FlyingNotes t={t} t0={T.kharid2} from={[px + 180, 1150]} to={[720, 1100]} />}
      <DroppingTag t={t} t0={T.das - 0.26} x={560} y={1290} text="RS 10,000" />
    </World>
  );
};

const SellAuntie: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - T.aur;
  const cam: Cam = { x: keys(lt, [[0, -40], [3.3, 30]]), y: 120, s: keys(lt, [[0, 1.08], [3.3, 1.16]]) };
  const aIn = smooth((t - T.use2 + 0.4) / 0.4);
  const ax = 1350 - 500 * aIn;
  const polish = t < T.use2;
  const pappu: Pose = polish ? { armF: 70 + Math.sin(t * 16) * 18, mouth: "smile", look: [1, 0.5] } : t < T.gyarah + 0.3 ? { armF: 60, mouth: "grin", look: [1, 0] } : { armF: 160, armB: 160, mouth: "grin", brows: 16, holdF: "notes" };
  const auntie: Pose = t < T.bech2 - 0.2 ? { armB: 20, armF: 25, holdF: "bag", mouth: "smile", look: [-1, 0] } : { armB: 95, armF: 25, holdF: "bag", holdB: t < T.bech2 + 0.1 ? "notes" : null, mouth: "grin", look: [-1, 0] };
  const celebrate = t > T.gyarah + 0.3 ? bounceHeight(t - T.gyarah - 0.3, 120, 0.3) : 0;
  return (
    <World cam={cam} t={t}>
      <Scooter x={560} y={GROUND} />
      <Character kind="pappu" x={250} y={GROUND + 10} s={0.95} t={t} pose={pappu} hop={celebrate} />
      <Character kind="auntie" x={ax} y={GROUND + 10} s={0.9} t={t} pose={auntie} phase={4} hop={aIn < 1 && t > T.use2 - 0.4 ? walkHop(t) : 0} />
      {t >= T.bech2 && <FlyingNotes t={t} t0={T.bech2} from={[ax - 200, 1150]} to={[400, 1180]} />}
      <DroppingTag t={t} t0={T.gyarah - 0.26} x={560} y={1290} text="RS 11,000" />
    </World>
  );
};

const ReHook: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - T.ab;
  const sh = shake(t - T.kul, 30);
  const cam: Cam = { x: 0 + sh[0], y: keys(t, [[T.ab, -60], [T.kul, -80], [T.kul + 0.2, -100]]) + sh[1], s: keys(t, [[T.ab, 1.12], [T.kul, 1.18], [T.kul + 0.2, 1.3]]) };
  const qm = [T.ab, T.socho, T.kul];
  return (
    <World cam={cam} t={t} dim={0.45}>
      <ellipse cx={540} cy={GROUND} rx={420} ry={70} fill="#FFE9A8" opacity={0.35} />
      <Character kind="pappu" x={540} y={GROUND + 10} s={1} t={t} pose={{ armF: 165, armB: 15, mouth: t < T.kul ? "worried" : "o", brows: t < T.kul ? -6 : 24, look: [0.2, -0.9], tilt: Math.sin(lt * 5) * 6, sweat: true }} />
      {qm.map((q, i) => {
        if (t < q) return null;
        const p = Math.min(1, (t - q) / 0.25);
        return (
          <text key={i} x={[250, 830, 870][i]} y={[900, 880, 1110][i] - p * 40 + Math.sin(t * 4 + i) * 10} fontFamily="Poppins" fontWeight={800} fontSize={150 * p} fill="#FFE14D" stroke={INK} strokeWidth={10} paintOrder="stroke" textAnchor="middle" transform={`rotate(${(i - 1) * 12} ${[250, 830, 870][i]} 900)`}>
            ?
          </text>
        );
      })}
    </World>
  );
};

const Options: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - T.A;
  const cam: Cam = { x: keys(lt, [[0, 0], [5, 20]]), y: keys(lt, [[0, -110], [5, -90]]), s: keys(lt, [[0, 1.2], [5, 1.26]]) };
  const look: [number, number] = t < T.B ? [-0.8, -0.9] : t < T.C ? [0.8, -0.9] : t < T.D ? [-0.8, -0.5] : [0.8, -0.5];
  return (
    <World cam={cam} t={t}>
      <Character kind="pappu" x={540} y={GROUND + 10} s={1} t={t} pose={{ armF: 150, armB: 12, mouth: "flat", look, brows: 6, tilt: look[0] * 6 }} />
    </World>
  );
};

const Stuck: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - T.dhyan;
  const punch = keys(t, [[T.fanste - 0.1, 0], [T.fanste + 0.15, 1]]);
  const cam: Cam = { x: 0, y: -110 + punch * 20, s: 1.24 + punch * 0.12 + lt * 0.01 };
  const stuck = t >= T.fanste;
  return (
    <World cam={cam} t={t}>
      <Character kind="pappu" x={540} y={GROUND + 10} s={1} t={t} pose={stuck ? { armF: 100, armB: 100, mouth: "worried", brows: -8, sweat: true, look: [0, 0.4] } : { armF: 150, mouth: "flat", look: [0.6, -0.8], brows: 4 }} sq={stuck ? squash(t - T.fanste, 0.1) : [1, 1]} />
    </World>
  );
};

const Outro: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - T.sahi;
  const cam: Cam = { x: keys(lt, [[0, -20], [6, 0]]), y: -150, s: keys(lt, [[0, 1.08], [6, 1.12]]) };
  const wave = t > T.karo + 0.4;
  return (
    <World cam={cam} t={t}>
      <Scooter x={800} y={GROUND} />
      <Character kind="pappu" x={250} y={GROUND + 10} s={0.95} t={t} pose={wave ? { armF: 150 + Math.sin(t * 12) * 18, mouth: "grin", brows: 10 } : t < T.agli ? { armF: 120, mouth: "smile", look: [0.6, -0.8] } : { armF: 40, armB: 150, mouth: "grin", look: [0.4, -0.6], brows: 12 }} />
    </World>
  );
};

// ================================================================ sound
type Sfx = [number, string, number]; // [seconds, file, volume]
const SFX: Sfx[] = [
  [0, "whoosh", 0.25],
  [-0.18 + fallTime(620), "thud", 0.3],
  [T.kitna, "pop", 0.22],
  ...CUTS.slice(1).map((c): Sfx => [c - 0.08, "whoosh", 0.2]),
  [T.sunday, "pop", 0.22],
  [T.kharida, "ding", 0.18],
  [T.aath - 0.26 + fallTime(900), "thud", 0.25],
  [T.aath, "pop", 0.22],
  [T.golu, "whoosh", 0.12],
  [T.bech1, "ding", 0.18],
  [T.nau - 0.26 + fallTime(900), "thud", 0.25],
  [T.nau, "pop", 0.22],
  [T.nau + 0.45, "whoosh", 0.15],
  [T.agle, "tick", 0.25], [T.agle + 0.12, "tick", 0.25], [T.agle + 0.24, "tick", 0.25], [T.agle + 0.1, "pop", 0.2],
  [T.pappu3, "whoosh", 0.1],
  [T.kharid2, "ding", 0.18],
  [T.das - 0.26 + fallTime(900), "thud", 0.25],
  [T.das, "pop", 0.22],
  [T.aur, "pop", 0.2],
  [T.use2 - 0.4, "whoosh", 0.1],
  [T.bech2, "ding", 0.18],
  [T.gyarah - 0.26 + fallTime(900), "thud", 0.25],
  [T.gyarah, "pop", 0.22],
  [T.gyarah + 0.35, "sparkle", 0.15],
  [T.ab, "tick", 0.25], [T.socho, "tick", 0.25],
  [T.kul, "slam", 0.3],
  [T.A, "pop", 0.22], [T.B, "pop", 0.22], [T.C, "pop", 0.22], [T.D, "pop", 0.22],
  [T.dhyan, "pop", 0.2],
  [T.fanste, "buzzer", 0.12],
  [T.comment, "pop", 0.22],
  [T.sahi, "pop", 0.2],
  [T.agli, "sparkle", 0.2],
  [T.follow, "pop", 0.22],
  [T.karo, "click", 0.3], [T.karo + 0.05, "ding", 0.15],
];

// Music: about 10% while the voice speaks, 18% in gaps (smoothed).
const speaking = (s: number) => WORDS.some((w) => s >= w.start - 0.1 && s <= w.end + 0.2);
const musicVol = (f: number) => {
  let v = 0;
  for (let k = -4; k <= 4; k++) v += speaking((f + k) / FPS) ? 0.1 : 0.18;
  return v / 9;
};

// ================================================================ composition
export const ScooterProfit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const scene = CUTS.filter((c) => t >= c).length - 1;
  const Scenes = [Hook, BazaarWide, Buy, SellGolu, BuyBack, SellAuntie, ReHook, Options, Stuck, Outro];
  const S = Scenes[scene];
  const c = { t, fps };
  const tileW = 430;
  const big = t < T.dhyan; // tiles big in Options, small in Stuck
  const tiles = [
    { l: "A", tx: "RS 1,000", c: "#E63946", at: T.A },
    { l: "B", tx: "ZERO PROFIT", c: "#1D8BD1", at: T.B },
    { l: "C", tx: "RS 2,000", c: "#2A9D8F", at: T.C },
    { l: "D", tx: "RS 3,000", c: "#8E44AD", at: T.D },
  ];
  return (
    <AbsoluteFill style={{ background: "#FFC98B" }}>
      <S t={t} />
      {/* ---- chips (screen space) */}
      {scene === 0 && (
        <>
          <Chip {...c} at={-1} y={150} size={112} text={"1 SCOOTER,\n4 SAUDE"} bg="#FFE14D" rot={-3} />
          <Chip {...c} at={-1} pulseAt={T.kitna} y={470} size={92} text="KITNA PROFIT?" bg="#FF5A5F" color="#FFFFFF" rot={2} />
        </>
      )}
      {scene === 1 && <Chip {...c} at={T.sunday} y={180} text="SUNDAY BAZAAR" bg="#FFE14D" />}
      {scene === 2 && <Chip {...c} at={T.aath} y={180} text={"KHARIDA:\nRS 8,000"} bg="#FFFFFF" />}
      {scene === 3 && <Chip {...c} at={T.nau} y={180} text={"BECHA:\nRS 9,000"} bg="#7BD389" />}
      {scene === 4 && (
        <>
          <Chip {...c} at={T.agle + 0.1} until={T.das} y={180} text="1 HAFTE BAAD" bg="#FFE14D" />
          {t < T.das && <Calendar t={t} at={T.agle} />}
          <Chip {...c} at={T.das} y={180} text={"WAPAS LIYA:\nRS 10,000"} bg="#FFFFFF" />
        </>
      )}
      {scene === 5 && (
        <>
          <Chip {...c} at={T.aur} until={T.gyarah} y={180} text="AAKHRI SAUDA" bg="#FFE14D" />
          <Chip {...c} at={T.gyarah} y={180} text={"PHIR BECHA:\nRS 11,000"} bg="#7BD389" />
        </>
      )}
      {scene === 6 && (
        <>
          {[["8,000", "#FFFFFF"], ["9,000", "#7BD389"], ["10,000", "#FFFFFF"], ["11,000", "#7BD389"]].map(([v, col], i) => (
            <MiniTag key={v} t={t} at={T.ab + i * 0.12} x={70 + (i % 2) * 450} y={560 + Math.floor(i / 2) * 120} text={`RS ${v}`} color={col} />
          ))}
          <Chip {...c} at={T.kul} y={190} size={104} text={"KUL PROFIT\nKITNA?"} bg="#FF5A5F" color="#FFFFFF" slam />
        </>
      )}
      {(scene === 7 || scene === 8) &&
        tiles.map((tl, i) => (
          <Tile key={tl.l} {...c} at={tl.at} letter={tl.l} text={tl.tx} color={tl.c}
            x={60 + (i % 2) * (tileW + 20)} y={big ? 170 + Math.floor(i / 2) * 200 : 150 + Math.floor(i / 2) * 150}
            w={tileW} h={big ? 170 : 130} wobble={scene === 8 && t < T.fanste ? 2.5 : 0} />
        ))}
      {scene === 8 && (
        <>
          <Chip {...c} at={T.dhyan} until={T.fanste} y={480} size={78} text="SOCH KE BATAO" bg="#FFE14D" />
          <Chip {...c} at={T.fanste} until={T.comment} y={480} size={78} text="YAHIN FASTE HAIN!" bg="#FF5A5F" color="#FFFFFF" />
          <Chip {...c} at={T.comment} y={480} size={78} text="COMMENT KARO" bg="#FFFFFF" />
          {t >= T.comment && <Bubble t={t} at={T.comment} />}
        </>
      )}
      {scene === 9 && (
        <>
          <AnswerBox t={t} />
          <Chip {...c} at={T.agli} y={560} size={84} text={"ANSWER\nNEXT REEL"} bg="#FFE14D" />
          <Chip {...c} at={T.follow} y={990} x={450} size={50} text="@DAILY.RIDDLES.12" bg="#FFFFFF" rot={0} />
          <FollowButton {...c} at={T.follow} tap={T.karo} x={470} y={1120} />
        </>
      )}
      <Finish frame={frame} />
      {/* ---- sound */}
      <Html5Audio src={staticFile("voice/scooter_profit.wav")} volume={1} />
      <Html5Audio src={staticFile("music/loop.wav")} loop volume={musicVol} />
      {SFX.map(([s, f, v], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s * fps))} durationInFrames={Math.round(2 * fps)} layout="none">
          <Html5Audio src={staticFile(`sfx/${f}.wav`)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// ================================================================ small screen-space props
const MiniTag: React.FC<{ t: number; at: number; x: number; y: number; text: string; color: string }> = ({ t, at, x, y, text, color }) => {
  if (t < at) return null;
  const p = Math.min(1, (t - at) / 0.15);
  return (
    <svg width={460} height={120} style={{ position: "absolute", left: x, top: y + (1 - p) * -40, opacity: p }} viewBox="-230 -60 460 120">
      <PriceTag x={0} y={0} text={text} color={color} s={1.2} rot={Math.sin(t * 3 + x) * 3} />
    </svg>
  );
};

const Calendar: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const flips = Math.min(3, Math.floor((t - at) / 0.12));
  const p = Math.min(1, (t - at) / 0.2);
  return (
    <svg width={300} height={300} style={{ position: "absolute", left: 90, top: 380, transform: `scale(${p}) rotate(-6deg)` }} viewBox="0 0 300 300">
      <rect x={20} y={40} width={260} height={240} rx={24} fill="#fff" stroke={INK} strokeWidth={10} />
      <rect x={20} y={40} width={260} height={70} rx={20} fill="#E63946" stroke={INK} strokeWidth={10} />
      <circle cx={90} cy={40} r={14} fill={INK} />
      <circle cx={210} cy={40} r={14} fill={INK} />
      <text x={150} y={92} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={42} fill="#fff">SUN</text>
      <text x={150} y={240} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={120} fill={INK}>{[1, 3, 5, 8][flips]}</text>
    </svg>
  );
};

const Bubble: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const p = Math.min(1, (t - at) / 0.2);
  const b = Math.abs(Math.sin((t - at) * 6)) * 14;
  return (
    <svg width={190} height={170} style={{ position: "absolute", left: 60, top: 600 - b, transform: `scale(${p})` }} viewBox="0 0 190 170">
      <path d="M 20 20 L 170 20 Q 180 20 180 30 L 180 110 Q 180 120 170 120 L 80 120 L 40 160 L 50 120 L 20 120 Q 10 120 10 110 L 10 30 Q 10 20 20 20 Z" fill="#fff" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
      {[55, 95, 135].map((x, i) => <circle key={x} cx={x} cy={70 - Math.max(0, Math.sin(t * 8 - i)) * 8} r={12} fill={INK} />)}
    </svg>
  );
};

const AnswerBox: React.FC<{ t: number }> = ({ t }) => {
  const p = Math.min(1, (t - T.sahi) / 0.2);
  const jig = Math.sin(t * 14) * 3;
  return (
    <svg width={380} height={340} style={{ position: "absolute", left: 300, top: 180, transform: `scale(${p}) rotate(${jig}deg)` }} viewBox="0 0 380 340">
      <rect x={20} y={40} width={340} height={280} rx={36} fill="#2A9D8F" stroke={INK} strokeWidth={12} />
      <text x={190} y={250} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={220} fill="#FFE14D" stroke={INK} strokeWidth={10} paintOrder="stroke">?</text>
      <path d="M 280 70 Q 280 20 320 20 Q 360 20 360 70" fill="none" stroke={INK} strokeWidth={14} />
      <rect x={262} y={64} width={116} height={86} rx={16} fill="#FFB703" stroke={INK} strokeWidth={10} />
    </svg>
  );
};
