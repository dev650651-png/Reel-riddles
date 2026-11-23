// MelaBridge (Part 1). Every time comes from words.json (snapshot of public/words.json for this voice).
import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadPoppins } from "../../lib/fonts";
import { Character, Dust, INK } from "../../lib/cartoon";
import { bounceHeight, keys, smooth, squash } from "../../lib/physics";
import { Cam, Chip, Finish, FollowButton, shake, Tile } from "../../lib/ui";
import { makeMusicVol, makeW } from "../../lib/scene";
import { B0, B1, BridgeWorld, BY, deckY, Load } from "./BridgeWorld";
import wordsData from "./words.json";

loadPoppins();

const WORDS = wordsData.words as { word: string; start: number; end: number }[];
const W = makeW(WORDS);
const FPS = 30;
export const MELA_BRIDGE_DURATION = Math.ceil((wordsData.duration + 2) * FPS);

const T = {
  nadi: W("नदी"), band: W("बंद"), pul3: W("पुल", 3), aath2: W("आठ", 2), kinare: W("किनारे"), ramlal: W("रामलाल"), har2: W("हर", 2),
  paanch2: W("पाँच", 2), jhankte: W("झाँकते"), pul4: W("पुल", 4), dikhe: W("दिखे"), vapas: W("वापस"), bhaaga: W("भागा"),
  charm: W("चरमराएगा"), chhupne: W("छुपने"), kya: W("क्या"), A: W("ए"), B: W("बी"), C: W("सी"), D: W("डी"), soch: W("सोच"),
  comment: W("कमेंट"), sahi: W("सही"), agli: W("अगली"), follow: W("फ़ॉलो"), karo: W("करो"),
};
const CUTS = [0, T.nadi, T.pul3, T.kinare, T.pul4, T.bhaaga, T.A, T.soch, T.sahi];
const camAt = (cx: number, cy: number, s: number, rot = 0): Cam => ({ x: cx - 540, y: cy - 960, s, rot });
const S_BRIDGE = 0.8; // people on the bridge
const walk = (t: number, speed = 11) => Math.abs(Math.sin(t * speed)) * 14;

// ================================================================ scenes
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const px = 800 + t * 22;
  const door = smooth((t + 0.15) / 0.3);
  const kx = keys(t, [[0, 10], [0.4, 110]]);
  const loads: Load[] = [{ x: px, d: 34 + walk(t) }];
  return (
    <BridgeWorld cam={camAt(keys(t, [[0, 560], [4.3, 600]]), 640, keys(t, [[0, 0.75], [4.3, 0.78]]))} t={t} loads={loads} door={door} clock={t * 30}
      front={
        <>
          <Character kind="kaka" x={kx} y={BY + 8} s={0.78} t={t} pose={{ armB: 20, holdF: "lathi", armF: 25, whistle: true, mouth: "o", brows: 14, look: [1, 0] }} sq={squash(t - 0.4, 0.12)} />
          <Character kind="pappu" x={px} y={deckY(px, loads, t) + 4} s={S_BRIDGE} t={t} pose={{ armF: 40 + Math.sin(t * 11) * 25, armB: 40 - Math.sin(t * 11) * 25, mouth: t < 1.2 ? "smile" : "o", brows: t < 1.2 ? 0 : 16, look: t < 1.2 ? [1, 0] : [-1, 0] }} hop={walk(t)} />
        </>
      }
    />
  );
};

const Wide: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - T.nadi;
  const down = t < T.band ? 0 : Math.min(1, ((t - T.band) / 0.18) ** 2) - Math.sin(Math.min(1, (t - T.band) / 0.5) * Math.PI * 3) * 0.08 * Math.exp(-(t - T.band) * 4);
  return (
    <BridgeWorld cam={camAt(keys(lt, [[0, 1500], [1.8, 680]]), 700, 0.6)} t={t} barrier={down} door={0} clock={0}
      front={<Character kind="pappu" x={keys(lt, [[0, -60], [1.6, 60]])} y={BY + 8} s={S_BRIDGE * 1.1} t={t} pose={{ armF: 30, mouth: t < T.band ? "grin" : "o", brows: t < T.band ? 6 : 20, look: [1, -0.3] }} hop={lt < 1.6 ? walk(t) : 0} />}
    />
  );
};

const Crossing: React.FC<{ t: number }> = ({ t }) => {
  const p = smooth((t - T.aath2) / 1.0);
  const gx = B0 + (B1 - B0) * p;
  const loads: Load[] = t > T.aath2 ? [{ x: gx, d: 30 }] : [];
  return (
    <BridgeWorld cam={camAt(870, 700, 0.68)} t={t} loads={loads} clock={0}
      front={
        <>
          {t > T.aath2 && <Character kind="pappu" x={gx} y={deckY(gx, loads, t) + 4} s={S_BRIDGE * 0.9} t={t} pose={{ armF: 40 + Math.sin(t * 16) * 25, armB: 40 - Math.sin(t * 16) * 25, mouth: "smile", look: [1, 0] }} hop={p < 1 ? walk(t, 16) : 0} />}
          {t <= T.aath2 && <Character kind="pappu" x={B0 - 60} y={BY + 8} s={S_BRIDGE} t={t} pose={{ armF: 60, mouth: "smile", look: [1, -0.4] }} />}
          <path d={`M ${B0} ${BY - 620} L ${B1} ${BY - 620}`} stroke={INK} strokeWidth={10} strokeDasharray="34 22" opacity={0.8} />
          <path d={`M ${B1 - 10} ${BY - 650} L ${B1 + 40} ${BY - 620} L ${B1 - 10} ${BY - 590} Z`} fill={INK} />
        </>
      }
    />
  );
};

const ChowkiScene: React.FC<{ t: number }> = ({ t }) => {
  const goIn = smooth((t - T.har2) / 0.5); // Kaka walks into the chowki
  const out = t >= T.jhankte - 0.12;
  const door = out ? smooth((t - T.jhankte + 0.12) / 0.15) : 1 - smooth((t - T.har2 - 0.4) / 0.2);
  const spin = t > T.har2 + 0.5 && !out ? (t - T.har2 - 0.5) * 300 : 0; // clock races through 5 minutes
  const kx = out ? keys(t, [[T.jhankte - 0.12, 40], [T.jhankte + 0.1, 170]]) : -100 + 140 * goIn;
  const showKaka = out || goIn < 0.95;
  const pose = out
    ? { armF: 25, holdF: "lathi" as const, armB: 120, whistle: true, mouth: "o" as const, brows: 20, look: [1, 0] as [number, number] }
    : { armF: 25, holdF: "lathi" as const, armB: 15, mouth: (t < T.ramlal + 0.6 ? "smile" : "flat") as "smile" | "flat", look: [t < T.har2 ? -0.3 : 1, 0] as [number, number] };
  return (
    <BridgeWorld cam={camAt(keys(t - T.kinare, [[0, 60], [3.6, 30]]), 700, keys(t - T.kinare, [[0, 1.0], [3.6, 1.06]]))} t={t} door={door} clock={spin}
      front={showKaka ? <Character kind="kaka" x={kx} y={BY + 8} s={0.95} t={t} pose={pose} sq={out ? squash(t - T.jhankte - 0.1, 0.14) : [1, 1]} hop={!out && goIn > 0 && goIn < 0.95 ? walk(t) : 0} /> : null}
    />
  );
};

const TestWalker: React.FC<{ t: number }> = ({ t }) => {
  const seen = t >= T.dikhe;
  const back = t >= T.vapas;
  const gx = back ? 650 - (t - T.vapas) * 260 : seen ? 650 : keys(t, [[T.pul4, 480], [T.dikhe, 650]]);
  const loads: Load[] = [{ x: gx, d: 38 }];
  const startle = seen ? bounceHeight(t - T.dikhe - 0.1, 90, 0.3) : 0;
  return (
    <BridgeWorld cam={camAt(440, 700, 0.75)} t={t} loads={loads} door={1} clock={0}
      front={
        <>
          <Character kind="kaka" x={110} y={BY + 8} s={0.8} t={t} pose={seen ? { armF: back ? 150 : 95, holdB: "lathi", armB: 20, whistle: !back, mouth: back ? "flat" : "o", brows: -6, look: [1, 0] } : { armF: 20, holdB: "lathi", mouth: "flat", look: [1, 0] }} />
          <Character kind="golu" x={gx} y={deckY(gx, loads, t) + 4} s={S_BRIDGE} t={t} phase={2} pose={seen ? { armF: 20, armB: 20, mouth: back ? "worried" : "o", brows: 22, look: [-1, 0], sweat: true } : { armF: 30 + Math.sin(t * 11) * 20, armB: 30 - Math.sin(t * 11) * 20, mouth: "grin", look: [1, 0] }} hop={(!seen || back ? walk(t) : 0) + startle} />
          {back && (
            <g opacity={Math.min(1, (t - T.vapas) / 0.2)}>
              <path d={`M ${gx + 130} ${BY - 600} Q ${gx} ${BY - 700} ${gx - 110} ${BY - 610}`} fill="none" stroke="#E63946" strokeWidth={22} strokeLinecap="round" />
              <path d={`M ${gx - 160} ${BY - 610} L ${gx - 90} ${BY - 655} L ${gx - 90} ${BY - 565} Z`} fill="#E63946" stroke={INK} strokeWidth={6} />
            </g>
          )}
        </>
      }
    />
  );
};

const ReHook: React.FC<{ t: number }> = ({ t }) => {
  const run = Math.min(t, T.charm) - T.bhaaga;
  const px = 820 + run * 90;
  const crackDt = t - T.charm;
  const sh = shake(crackDt, 26);
  const sh2 = shake(t - T.kya, 20);
  const frozen = t >= T.charm;
  const loads: Load[] = [{ x: px, d: 40 + (frozen ? 0 : walk(t, 18) * 1.5) }];
  const look: [number, number] = t < T.chhupne ? [0, 0.6] : Math.floor((t - T.chhupne) / 0.5) % 2 ? [1, 0] : [-1, 0];
  const c = camAt(px + 20, 760, keys(t - T.bhaaga, [[0, 0.9], [1.2, 0.98], [4.4, 1.02]]));
  return (
    <BridgeWorld cam={{ ...c, x: c.x + sh[0] + sh2[0], y: c.y + sh[1] + sh2[1] }} t={t} loads={loads} broken={{ x: px + 130, dt: crackDt }} dim={0.35} door={0} clock={0}
      front={
        <>
          <Dust x={px + 130} y={deckY(px + 130, loads, t)} dt={crackDt} size={0.9} />
          <Character kind="pappu" x={px} y={deckY(px, loads, t) + 4} s={S_BRIDGE} t={t} pose={frozen ? { armF: 100, armB: 100, mouth: "worried", brows: 22, sweat: true, look } : { armF: 60 + Math.sin(t * 18) * 40, armB: 60 - Math.sin(t * 18) * 40, mouth: "grin", look: [1, 0] }} hop={frozen ? 0 : walk(t, 18)} sq={frozen ? squash(crackDt, 0.12) : [1, 1]} />
        </>
      }
    />
  );
};

const Think: React.FC<{ t: number }> = ({ t }) => {
  const px = 900;
  const loads: Load[] = [{ x: px, d: 34 }];
  const look: [number, number] = t < T.B ? [-0.6, -0.9] : t < T.C ? [0.6, -0.9] : t < T.D ? [-0.6, -0.7] : t < T.soch ? [0.6, -0.7] : [0, -0.3];
  const scene7 = t >= T.soch;
  const punch = scene7 ? smooth((t - T.soch) / 0.25) : 0;
  return (
    <BridgeWorld cam={camAt(880, 820 + punch * 30, 1.0 + punch * 0.1)} t={t} loads={loads} door={0} clock={0}
      front={<Character kind="pappu" x={px} y={deckY(px, loads, t) + 4} s={S_BRIDGE} t={t} pose={scene7 ? { armF: 150, mouth: "smile", brows: 8, look: [0.5, -0.6] } : { armF: 150, mouth: "flat", look, brows: 6, tilt: look[0] * 6 }} />}
    />
  );
};

const Outro: React.FC<{ t: number }> = ({ t }) => {
  const wave = t > T.karo + 0.4;
  return (
    <BridgeWorld cam={camAt(keys(t - T.sahi, [[0, 260], [6, 290]]), 520, 1.0)} t={t} door={0} clock={0}
      front={<Character kind="pappu" x={60} y={BY + 8} s={0.95} t={t} pose={wave ? { armF: 150 + Math.sin(t * 12) * 18, mouth: "grin", brows: 10 } : t < T.agli ? { armF: 120, mouth: "smile", look: [0.6, -0.8] } : { armF: 40, armB: 150, mouth: "grin", look: [0.4, -0.6], brows: 12 }} />}
    />
  );
};

// ================================================================ sound
type Sfx = [number, string, number];
const SFX: Sfx[] = [
  [0, "whoosh", 0.22], [0.05, "whistle", 0.16], [0.3, "thud", 0.18],
  ...CUTS.slice(1).map((c): Sfx => [c - 0.08, "whoosh", 0.2]),
  [T.nadi + 0.2, "pop", 0.2],
  [T.band, "slam", 0.2], [T.band, "pop", 0.22],
  [T.aath2, "pop", 0.22], [T.aath2 + 0.1, "whoosh", 0.12],
  [T.ramlal, "pop", 0.2],
  [T.har2 + 0.5, "thud", 0.15],
  [T.har2 + 0.6, "tick", 0.25], [T.har2 + 0.9, "tick", 0.25], [T.har2 + 1.2, "tick", 0.25],
  [T.paanch2, "pop", 0.22],
  [T.jhankte - 0.12, "thud", 0.2], [T.jhankte, "whistle", 0.2],
  [T.dikhe, "whistle", 0.2], [T.dikhe + 0.1, "pop", 0.15],
  [T.vapas, "whoosh", 0.15], [T.vapas, "pop", 0.22],
  [T.bhaaga, "creak", 0.2],
  [T.charm, "creak", 0.25], [T.charm, "splash", 0.12], [T.charm + 0.6, "splash", 0.14], [T.charm, "pop", 0.22],
  [T.kya, "slam", 0.28],
  [T.A, "pop", 0.22], [T.B, "pop", 0.22], [T.C, "pop", 0.22], [T.D, "pop", 0.22],
  [T.soch, "pop", 0.2], [T.comment, "pop", 0.22],
  [T.sahi, "pop", 0.2], [T.agli, "sparkle", 0.2],
  [T.follow, "pop", 0.22], [T.karo, "click", 0.3], [T.karo + 0.05, "ding", 0.15],
];
const musicVol = makeMusicVol(WORDS, FPS);

// ================================================================ composition
export const MelaBridge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const scene = CUTS.filter((c) => t >= c).length - 1;
  const S = [Hook, Wide, Crossing, ChowkiScene, TestWalker, ReHook, Think, Think, Outro][scene];
  const c = { t, fps };
  const tiles = [
    { l: "A", tx: "TURANT CHALO", col: "#E63946", at: T.A },
    { l: "B", tx: "PALAT KE KAKA KI OR", col: "#1D8BD1", at: T.B },
    { l: "C", tx: "5 MIN, PHIR LAUTO", col: "#2A9D8F", at: T.C },
    { l: "D", tx: "PURI TAAQAT SE BHAAGO", col: "#8E44AD", at: T.D },
  ];
  return (
    <AbsoluteFill style={{ background: "#9FDCFF" }}>
      <S t={t} />
      {scene === 0 && (
        <>
          <Chip {...c} at={-1} y={140} size={108} text="8 MIN KA PUL" bg="#FFE14D" rot={-3} />
          <Chip {...c} at={-1} y={330} size={78} text={"MELA KAISE\nPAHUNCHE?"} bg="#FF5A5F" color="#FFFFFF" rot={2} />
        </>
      )}
      {scene === 1 && <Chip {...c} at={T.band} y={180} text="PUL BAND HAI" bg="#FF5A5F" color="#FFFFFF" />}
      {scene === 2 && (
        <>
          <Chip {...c} at={T.aath2} y={180} text={"CROSSING:\n8 MIN"} bg="#FFFFFF" />
        </>
      )}
      {scene === 3 && (
        <>
          <Chip {...c} at={T.ramlal} until={T.paanch2} y={170} text="RAMLAL KAKA" bg="#FFFFFF" />
          <Chip {...c} at={T.paanch2} y={170} text={"HAR 5 MIN:\nKAKA BAHAR"} bg="#FFE14D" />
        </>
      )}
      {scene === 4 && <Chip {...c} at={T.vapas} y={170} size={76} text={"JIDHAR SE AAYA,\nWAPAS!"} bg="#FFFFFF" />}
      {scene === 5 && (
        <>
          <Chip {...c} at={T.charm} y={160} size={84} text="BHAAGE TO CHARR!" bg="#FFE14D" />
          <Chip {...c} at={T.kya} y={340} size={96} text={"PAPPU\nKYA KARE?"} bg="#FF5A5F" color="#FFFFFF" slam />
        </>
      )}
      {scene === 6 &&
        tiles.map((tl, i) => (
          <Tile key={tl.l} {...c} at={tl.at} letter={tl.l} text={tl.tx} color={tl.col} x={60} y={130 + i * 155} w={840} h={140} />
        ))}
      {scene === 7 && (
        <>
          <Chip {...c} at={T.soch} y={170} size={84} text="SOCH KE BATAO" bg="#FFE14D" />
          <Chip {...c} at={T.comment} y={360} x={270} size={70} text="COMMENT KARO" bg="#FFFFFF" />
          {t >= T.comment && <Bubble t={t} at={T.comment} />}
        </>
      )}
      {scene === 8 && (
        <>
          <AnswerBox t={t} />
          <Chip {...c} at={T.agli} y={560} size={84} text={"ANSWER\nNEXT REEL"} bg="#FFE14D" />
          <Chip {...c} at={T.follow} y={990} x={450} size={50} text="@DAILY.RIDDLES.12" bg="#FFFFFF" rot={0} />
          <FollowButton {...c} at={T.follow} tap={T.karo} x={470} y={1120} />
        </>
      )}
      <Finish frame={frame} vignette={0.45} />
      <Html5Audio src={staticFile("voice/mela_bridge.wav")} volume={1} />
      <Html5Audio src={staticFile("music/loop.wav")} loop volume={musicVol} />
      {SFX.map(([s, f, v], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s * fps))} durationInFrames={Math.round(2 * fps)} layout="none">
          <Html5Audio src={staticFile(`sfx/${f}.wav`)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const Bubble: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const p = Math.min(1, (t - at) / 0.2);
  const b = Math.abs(Math.sin((t - at) * 6)) * 14;
  return (
    <svg width={190} height={170} style={{ position: "absolute", left: 60, top: 340 - b, transform: `scale(${p})` }} viewBox="0 0 190 170">
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
