// MelaAnswer (Part 2 of MelaBridge). Times come from words.json (snapshot of public/words.json for this voice).
// Pappu's bridge position is derived from the story clock (8:00 to cross), so picture and maths always agree.
import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadPoppins } from "../../lib/fonts";
import { Character, INK } from "../../lib/cartoon";
import { bounceHeight, keys, rand, smooth, squash } from "../../lib/physics";
import { Cam, Chip, Finish, FollowButton, shake, Tile } from "../../lib/ui";
import { makeMusicVol, makeW } from "../../lib/scene";
import { B0, B1, BridgeWorld, BY, deckY, Load } from "../MelaBridge/BridgeWorld";
import wordsData from "./words.json";

loadPoppins();

const WORDS = wordsData.words as { word: string; start: number; end: number }[];
const W = makeW(WORDS);
const FPS = 30;
export const MELA_ANSWER_DURATION = Math.ceil((wordsData.duration + 2) * FPS);

const T = {
  sahi: W("सही"), bee: W("बी"), kaka2: W("काका", 2), andar: W("अंदर"), chal: W("चल"), chaar: W("चार"), tak: W("तक"), raha: W("रहा"),
  phir: W("फिर"), palta: W("पलटा"), laga: W("लगा"), kaka4: W("काका", 4), koi: W("कोई"), unhe: W("उन्हें"), mele3: W("मेले", 3),
  vapas: W("वापस"), bacha: W("बचा"), teen: W("तीन"), agli1: W("अगली"), pappu3: W("पप्पू", 3), mele5: W("मेले", 5),
  agli2: W("अगली", 2), sahi2: W("सही", 2), comment: W("कमेंट"), aur4: W("और", 4), follow: W("फ़ॉलो"), karo2: W("करो", 2),
};
const CUTS = [0, T.kaka2, T.chaar, T.phir, T.kaka4, T.unhe, T.bacha, T.agli2, T.aur4];
const camAt = (cx: number, cy: number, s: number): Cam => ({ x: cx - 540, y: cy - 960, s });
const S_BRIDGE = 0.8;
const walk = (t: number, speed = 11) => Math.abs(Math.sin(t * speed)) * 14;

// ---- story clock (seconds of story time) and Pappu's progress (seconds of walking done, of 480)
const lerpK = (t: number, a: number, b: number, v0: number, v1: number) => v0 + (v1 - v0) * smooth((t - a) / (b - a));
const clock = (t: number) =>
  t < T.chaar ? 0 : t < T.raha ? lerpK(t, T.chaar, T.raha, 0, 290) : t < T.palta ? 290 : t < T.laga ? lerpK(t, T.palta, T.laga, 290, 300) : t < T.teen ? 300 : lerpK(t, T.teen, T.pappu3, 300, 500);
const progress = (t: number) => {
  const c = clock(t);
  if (c <= 290) return c; // forward to 4:50
  if (c <= 300) return 290 - (c - 290); // back toward Kaka for 10 s -> 280 at 5:00
  return Math.min(480, 280 + (c - 300)); // forward again: 280 + 200 = 480 at 8:20
};
const px = (t: number) => B0 + ((B1 - B0) * progress(t)) / 480;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const moving = (t: number) => Math.abs(progress(t + 0.05) - progress(t - 0.05)) > 0.01;

// ================================================================ scenes
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const jump = t < 0.6 ? Math.max(0, 240 * (1 - ((t + 0.3) / 0.9) ** 2)) : bounceHeight(t - 0.6, 0, 0.3);
  const again = t > T.bee ? bounceHeight(t - T.bee, 150, 0.3) : 0;
  return (
    <BridgeWorld cam={camAt(keys(t, [[0, 1880], [T.kaka2, 1840]]), 380, keys(t, [[0, 0.75], [T.kaka2, 0.78]]))} t={t} clock={0}
      front={
        <>
          <Character kind="pappu" x={1700} y={BY + 8} s={0.8} t={t} pose={{ armF: 160, armB: 160, mouth: "grin", brows: 14 }} hop={jump + again} sq={t < 0.6 ? [0.95, 1.06] : squash(t - 0.6, 0.15)} />
          <Confetti t={t} t0={0.6} x={1700} y={600} />
          {t > T.bee && <Confetti t={t} t0={T.bee} x={1700} y={600} />}
        </>
      }
    />
  );
};

const StartScene: React.FC<{ t: number }> = ({ t }) => {
  const goIn = smooth((t - T.kaka2) / 0.6);
  const door = 1 - smooth((t - T.andar - 0.1) / 0.2);
  const x = px(t);
  const pOn = t >= T.chal;
  const loads: Load[] = pOn ? [{ x, d: 34 }] : [];
  return (
    <BridgeWorld cam={camAt(keys(t - T.kaka2, [[0, 380], [2.7, 440]]), 640, 0.8)} t={t} loads={loads} door={door} clock={0}
      front={
        <>
          {goIn < 0.98 && <Character kind="kaka" x={110 - 110 * goIn} y={BY + 8} s={0.8} t={t} pose={{ armF: 20, holdF: "lathi", mouth: "flat", look: [-1, 0] }} hop={goIn > 0 ? walk(t) : 0} />}
          <Character kind="pappu" x={pOn ? Math.max(x, B0 + 40) : B0 - 60} y={(pOn ? deckY(B0 + 40, loads, t) : BY) + 6} s={S_BRIDGE} t={t} phase={1}
            pose={{ armF: 30 + (pOn ? Math.sin(t * 11) * 20 : 0), armB: 30 - (pOn ? Math.sin(t * 11) * 20 : 0), mouth: "smile", look: pOn ? [1, 0] : [-1, 0] }} hop={pOn ? walk(t) : 0} />
        </>
      }
    />
  );
};

const BridgeScene: React.FC<{ t: number; cam: Cam; kaka?: "hidden" | "out" | "think"; bubble?: boolean }> = ({ t, cam, kaka = "hidden", bubble = false }) => {
  const x = px(t);
  const loads: Load[] = [{ x, d: 36 + (moving(t) ? walk(t, 14) : 0) }];
  const backward = clock(t) > 290 && clock(t) <= 300 && moving(t);
  const turnDt = t - T.palta;
  const out = kaka !== "hidden";
  const door = out ? smooth((t - T.kaka4 + 0.1) / 0.15) : 0;
  const kx = out ? keys(t, [[T.kaka4 - 0.1, 30], [T.kaka4 + 0.1, 130]]) : 0;
  const pointing = kaka === "think" && t >= T.vapas;
  const pPose = t < T.phir
    ? { armF: 40 + Math.sin(t * 14) * 25, armB: 40 - Math.sin(t * 14) * 25, mouth: "smile" as const, look: [1, 0] as [number, number] }
    : t < T.palta ? { armF: 20, armB: 20, mouth: "o" as const, brows: 16, look: [0, -0.4] as [number, number] }
      : t < T.kaka4 ? { armF: 30, armB: 30, mouth: "smile" as const, look: [-1, 0] as [number, number] }
        : t < T.vapas ? { armF: 20, armB: 20, mouth: "flat" as const, look: [-1, 0] as [number, number], brows: 6 }
          : { armF: 150, armB: 30, mouth: "grin" as const, look: [1, -0.2] as [number, number], brows: 10 };
  return (
    <BridgeWorld cam={cam} t={t} loads={loads} door={door} clock={clock(t) * 6}
      front={
        <>
          {out && (
            <Character kind="kaka" x={kx} y={BY + 8} s={0.8} t={t} sq={squash(t - T.kaka4 - 0.1, 0.12)}
              pose={pointing ? { armF: 150, holdB: "lathi", mouth: "smile", brows: 8, look: [1, -0.3] } : kaka === "think" ? { armF: 160, holdB: "lathi", mouth: "flat", brows: 10, look: [0.4, -0.9], tilt: -6 } : { armF: 95, holdB: "lathi", whistle: true, mouth: "o", brows: 18, look: [1, 0] }} />
          )}
          {bubble && <ThoughtBubble t={t} at={T.mele3} />}
          <Character kind="pappu" x={x} y={deckY(x, loads, t) + 6} s={S_BRIDGE} t={t} phase={1} pose={pPose}
            hop={moving(t) ? walk(t, 14) : 0} sq={turnDt > 0 && turnDt < 0.6 ? squash(turnDt, 0.15) : [1, 1]} />
          {backward || (t > T.palta && t < T.kaka4) ? (
            <g opacity={Math.min(1, (t - T.palta) / 0.2)}>
              <path d={`M ${x + 90} ${BY - 600} Q ${x + 60} ${BY - 760} ${x - 20} ${BY - 700} L ${x - 110} ${BY - 650}`} fill="none" stroke="#1D8BD1" strokeWidth={22} strokeLinecap="round" />
              <path d={`M ${x - 160} ${BY - 625} L ${x - 90} ${BY - 690} L ${x - 75} ${BY - 610} Z`} fill="#1D8BD1" stroke={INK} strokeWidth={6} />
            </g>
          ) : null}
          {pointing && (
            <g opacity={Math.min(1, (t - T.vapas) / 0.2)}>
              <path d={`M ${x - 120} ${BY - 640} L ${x + 160} ${BY - 640}`} stroke="#2ECC71" strokeWidth={22} strokeLinecap="round" />
              <path d={`M ${x + 210} ${BY - 640} L ${x + 140} ${BY - 685} L ${x + 140} ${BY - 595} Z`} fill="#2ECC71" stroke={INK} strokeWidth={6} />
            </g>
          )}
        </>
      }
    />
  );
};

const Finale: React.FC<{ t: number }> = ({ t }) => {
  const arrived = t >= T.pappu3;
  const x = arrived ? keys(t, [[T.pappu3, B1], [T.mele5, 1680]]) : px(t);
  const onBridge = x < B1;
  const loads: Load[] = onBridge ? [{ x, d: 36 + walk(t, 14) }] : [];
  const jumpY = arrived ? Math.sin(smooth((t - T.pappu3) / (T.mele5 - T.pappu3)) * Math.PI) * 160 : 0;
  const land = t >= T.mele5 ? bounceHeight(t - T.mele5, 120, 0.3) : 0;
  return (
    <BridgeWorld cam={camAt(keys(t, [[T.bacha, 760], [T.teen, 760], [T.mele5, 1600]]), 600, 0.75)} t={t} loads={loads} clock={0}
      front={
        <>
          <Character kind="pappu" x={x} y={(onBridge ? deckY(x, loads, t) : BY) + 6} s={S_BRIDGE} t={t} phase={1}
            pose={t >= T.mele5 ? { armF: 160, armB: 160, mouth: "grin", brows: 14 } : { armF: 40 + Math.sin(t * 14) * 25, armB: 40 - Math.sin(t * 14) * 25, mouth: "grin", look: [1, 0] }}
            hop={(t >= T.teen && !arrived ? walk(t, 14) : 0) + jumpY + land} />
          {t >= T.mele5 && <Confetti t={t} t0={T.mele5} x={1680} y={650} />}
        </>
      }
    />
  );
};

const AtMela: React.FC<{ t: number; outro?: boolean }> = ({ t, outro }) => {
  const wave = outro && t > T.karo2 + 0.4;
  return (
    <BridgeWorld cam={camAt(outro ? 1900 : 1820, outro ? 520 : 420, outro ? 1.0 : 0.82)} t={t} clock={0}
      front={<Character kind="pappu" x={outro ? 1660 : 1700} y={BY + 8} s={0.95} t={t} pose={wave ? { armF: 150 + Math.sin(t * 12) * 18, mouth: "grin", brows: 10 } : outro ? { armF: 40, armB: 150, mouth: "grin", look: [0.4, -0.6], brows: 12 } : t < T.sahi2 ? { armF: 150, mouth: "o", brows: 18, look: [0, -0.9] } : { armF: 60, armB: 150, mouth: "grin", brows: 10, look: [0.5, -0.4] }} />}
    />
  );
};

// ================================================================ props
const Confetti: React.FC<{ t: number; t0: number; x: number; y: number }> = ({ t, t0, x, y }) => {
  const dt = t - t0;
  if (dt < 0 || dt > 1.6) return null;
  return (
    <g>
      {Array.from({ length: 26 }).map((_, i) => {
        const a = rand(i) * Math.PI * 2;
        const v = 500 + rand(i + 1) * 700;
        const cx = x + Math.cos(a) * v * dt;
        const cy = y + Math.sin(a) * v * dt * 0.7 - 300 * dt + 900 * dt * dt;
        return <rect key={i} x={cx} y={cy} width={22} height={34} fill={["#E63946", "#FFB703", "#2A9D8F", "#8E44AD", "#1D8BD1"][i % 5]} transform={`rotate(${dt * 700 + i * 40} ${cx} ${cy})`} opacity={1 - smooth((dt - 1.1) / 0.5)} />;
      })}
    </g>
  );
};

const ThoughtBubble: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  if (t < at - 0.3) return null;
  const p = Math.min(1, (t - at + 0.3) / 0.3);
  return (
    <g transform={`translate(380,${BY - 790}) scale(${p})`}>
      <circle cx={-110} cy={190} r={14} fill="#fff" stroke={INK} strokeWidth={6} />
      <circle cx={-70} cy={150} r={22} fill="#fff" stroke={INK} strokeWidth={6} />
      <ellipse cx={30} cy={40} rx={170} ry={110} fill="#fff" stroke={INK} strokeWidth={9} />
      <g transform={`translate(-30,40) rotate(${t * 40})`}>
        <circle r={60} fill="none" stroke="#E63946" strokeWidth={8} />
        {[0, 60, 120].map((a) => <line key={a} x1={-60} y1={0} x2={60} y2={0} stroke="#FFB703" strokeWidth={6} transform={`rotate(${a})`} />)}
      </g>
      <path d="M 50 100 L 100 10 L 150 100 Z" fill="#E63946" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 75 100 L 100 10 L 125 100 Z" fill="#FFF1D6" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

const ClockChip: React.FC<{ t: number; label?: string }> = ({ t, label }) => {
  const c = clock(t);
  const ticking = moving(t);
  return (
    <div style={{ position: "absolute", left: 60, top: 120, display: "flex", alignItems: "center", gap: 14, background: "#fff", border: `9px solid ${INK}`, borderRadius: 60, padding: "6px 30px 2px 16px", boxShadow: "0 10px 0 rgba(26,16,48,0.45)", transform: `scale(${ticking ? 1 + Math.sin(t * 30) * 0.02 : 1})` }}>
      <svg width={70} height={70} viewBox="-35 -35 70 70">
        <circle r={28} fill="#FFE14D" stroke={INK} strokeWidth={6} />
        <rect x={-6} y={-38} width={12} height={10} fill={INK} />
        <line x1={0} y1={0} x2={0} y2={-20} stroke="#E63946" strokeWidth={6} strokeLinecap="round" transform={`rotate(${c * 6})`} />
      </svg>
      <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 72, color: INK, fontVariantNumeric: "tabular-nums" }}>{label ?? fmt(c)}</div>
    </div>
  );
};

const MysteryBox: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  if (t < at) return null;
  const p = Math.min(1, (t - at) / 0.2);
  return (
    <svg width={380} height={340} style={{ position: "absolute", left: 350, top: 380, transform: `scale(${p}) rotate(${Math.sin(t * 16) * 5}deg)` }} viewBox="0 0 380 340">
      <rect x={20} y={90} width={340} height={230} rx={20} fill="#8E44AD" stroke={INK} strokeWidth={12} />
      <rect x={0} y={50} width={380} height={70} rx={16} fill="#A569BD" stroke={INK} strokeWidth={12} transform={`rotate(${Math.sin(t * 10) * 4} 190 85)`} />
      <rect x={165} y={50} width={50} height={270} fill="#FFC233" stroke={INK} strokeWidth={8} />
      <text x={190} y={270} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={150} fill="#FFE14D" stroke={INK} strokeWidth={10} paintOrder="stroke">?</text>
    </svg>
  );
};

const Bubble: React.FC<{ t: number; at: number; y: number }> = ({ t, at, y }) => {
  if (t < at) return null;
  const p = Math.min(1, (t - at) / 0.2);
  const b = Math.abs(Math.sin((t - at) * 6)) * 14;
  return (
    <svg width={190} height={170} style={{ position: "absolute", left: 60, top: y - b, transform: `scale(${p})` }} viewBox="0 0 190 170">
      <path d="M 20 20 L 170 20 Q 180 20 180 30 L 180 110 Q 180 120 170 120 L 80 120 L 40 160 L 50 120 L 20 120 Q 10 120 10 110 L 10 30 Q 10 20 20 20 Z" fill="#fff" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
      {[55, 95, 135].map((x, i) => <circle key={x} cx={x} cy={70 - Math.max(0, Math.sin(t * 8 - i)) * 8} r={12} fill={INK} />)}
    </svg>
  );
};

// ================================================================ sound
type Sfx = [number, string, number];
const SFX: Sfx[] = [
  [0, "slam", 0.22], [0, "ding", 0.18], [0.1, "sparkle", 0.15], [0.6, "thud", 0.18],
  [T.sahi, "pop", 0.2], [T.bee, "sparkle", 0.2], [T.bee, "ding", 0.15],
  ...CUTS.slice(1).map((c): Sfx => [c - 0.08, "whoosh", 0.2]),
  [T.andar + 0.2, "thud", 0.18],
  [T.chal, "pop", 0.2],
  [T.chaar, "tick", 0.22], [T.chaar + 0.5, "tick", 0.22], [T.chaar + 1.0, "tick", 0.22], [T.chaar + 1.5, "tick", 0.22], [T.chaar + 2.0, "tick", 0.22], [T.chaar + 2.5, "tick", 0.22],
  [T.tak, "pop", 0.22],
  [T.palta, "whoosh", 0.18], [T.palta, "pop", 0.22],
  [T.kaka4 - 0.1, "thud", 0.2], [T.kaka4, "whistle", 0.2], [T.kaka4, "slam", 0.2],
  [T.koi, "pop", 0.22],
  [T.mele3 - 0.3, "pop", 0.18],
  [T.vapas, "pop", 0.22], [T.vapas + 0.1, "whistle", 0.12],
  [T.teen, "pop", 0.22],
  [T.teen + 0.4, "tick", 0.2], [T.teen + 0.9, "tick", 0.2], [T.teen + 1.4, "tick", 0.2], [T.teen + 1.9, "tick", 0.2], [T.teen + 2.4, "tick", 0.2],
  [T.agli1, "pop", 0.2],
  [T.mele5, "thud", 0.2], [T.mele5, "sparkle", 0.22], [T.mele5 + 0.05, "ding", 0.15],
  [T.agli2, "pop", 0.22], [T.agli2, "thud", 0.12],
  [T.sahi2, "pop", 0.2], [T.comment, "pop", 0.22],
  [T.follow, "pop", 0.22], [T.karo2, "click", 0.3], [T.karo2 + 0.05, "ding", 0.15],
];
const musicVol = makeMusicVol(WORDS, FPS);

// ================================================================ composition
export const MelaAnswer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const scene = CUTS.filter((c) => t >= c).length - 1;
  const c = { t, fps };
  const sh = shake(t - T.kaka4, 26);
  const view = (() => {
    switch (scene) {
      case 0: return <Hook t={t} />;
      case 1: return <StartScene t={t} />;
      case 2: return <BridgeScene t={t} cam={camAt(keys(t, [[T.chaar, 420], [T.raha, 600]]), 640, 0.75)} />;
      case 3: return <BridgeScene t={t} cam={camAt(600, 640, keys(t, [[T.phir, 0.75], [T.palta, 0.8]]))} />;
      case 4: { const cm = camAt(560, 640, 0.75); return <BridgeScene t={t} kaka="out" cam={{ ...cm, x: cm.x + sh[0], y: cm.y + sh[1] }} />; }
      case 5: return <BridgeScene t={t} kaka="think" bubble cam={camAt(560, 640, keys(t, [[T.unhe, 0.75], [T.bacha, 0.78]]))} />;
      case 6: return <Finale t={t} />;
      case 7: return <AtMela t={t} />;
      default: return <AtMela t={t} outro />;
    }
  })();
  const tiles = [
    { l: "A", tx: "TURANT CHALO", col: "#E63946" },
    { l: "B", tx: "PALAT KE KAKA KI OR", col: "#1D8BD1" },
    { l: "C", tx: "5 MIN, PHIR LAUTO", col: "#2A9D8F" },
    { l: "D", tx: "PURI TAAQAT SE BHAAGO", col: "#8E44AD" },
  ];
  return (
    <AbsoluteFill style={{ background: "#9FDCFF" }}>
      {view}
      {scene === 0 && (
        <>
          <Chip {...c} at={-1} pulseAt={T.bee} y={120} size={112} text="JAWAB: B!" bg="#2ECC71" color="#FFFFFF" rot={-3} />
          <Chip {...c} at={-1} y={290} size={62} text="KAKA KI MADAD SE" bg="#FFE14D" rot={2} />
          {tiles.map((tl, i) => (
            <Tile key={tl.l} {...c} at={tl.l === "B" ? -0.12 : -1} letter={tl.l} text={tl.tx} color={tl.col} x={60} y={420 + i * 112} w={840} h={100}
              glow={tl.l === "B"} cross={tl.l === "B" ? 0 : Math.min(1, Math.max(0, (t + 0.1 - i * 0.15) / 0.5))} />
          ))}
        </>
      )}
      {scene >= 1 && scene <= 6 && <ClockChip t={t} label={scene === 1 && t < T.chal ? "0:00" : undefined} />}
      {scene === 1 && (
        <>
          <Chip {...c} at={T.andar} until={T.chal} y={290} x={60} size={70} text="KAKA ANDAR" bg="#FFFFFF" />
          <Chip {...c} at={T.chal} y={290} x={60} size={70} text="PAPPU CHALA!" bg="#FFE14D" />
        </>
      )}
      {scene === 2 && <Chip {...c} at={T.tak} y={290} x={60} size={70} text="4:50 TAK AAGE" bg="#FFFFFF" />}
      {scene === 3 && <Chip {...c} at={T.palta} y={290} x={60} size={80} text="PALAT JAO!" bg="#1D8BD1" color="#FFFFFF" />}
      {scene === 4 && (
        <>
          <Chip {...c} at={T.kaka4} until={T.koi} y={280} size={96} text="5:00 KAKA BAHAR!" bg="#FF5A5F" color="#FFFFFF" slam />
          <Chip {...c} at={T.koi} y={280} size={80} text="KOI AA RAHA HAI!" bg="#FFE14D" />
        </>
      )}
      {scene === 5 && (
        <>
          <Chip {...c} at={T.mele3} until={T.vapas} y={280} size={80} text={"\"MELE SE AAYA?\""} bg="#FFFFFF" />
          <Chip {...c} at={T.vapas} y={280} size={76} text={"WAPAS MELE\nKI OR!"} bg="#2ECC71" color="#FFFFFF" />
        </>
      )}
      {scene === 6 && (
        <>
          <Chip {...c} at={T.teen} until={T.agli1} y={280} size={70} text={"BACHA:\n3 MIN 20 SEC"} bg="#FFFFFF" />
          <Chip {...c} at={T.agli1} until={T.mele5} y={280} size={70} text={"AGLI JHAANK\n10:00"} bg="#FF5A5F" color="#FFFFFF" />
          <Chip {...c} at={T.mele5} y={280} size={84} text={"8:20\nMELE MEIN!"} bg="#2ECC71" color="#FFFFFF" />
        </>
      )}
      {scene === 7 && (
        <>
          <Chip {...c} at={T.agli2} y={140} size={80} text={"NEXT REEL:\nNAYI PAHELI"} bg="#FFE14D" />
          <MysteryBox t={t} at={T.agli2} />
          <Chip {...c} at={T.sahi2} until={T.comment} y={740} x={70} size={60} text="SAHI THA?" bg="#FFFFFF" />
          <Chip {...c} at={T.comment} y={740} x={270} size={60} text="COMMENT KARO" bg="#FFFFFF" />
          <Bubble t={t} at={T.comment} y={730} />
        </>
      )}
      {scene === 8 && (
        <>
          <Chip {...c} at={T.aur4} y={200} size={80} text={"AISI AUR\nPAHELIYAN"} bg="#FFE14D" />
          <Chip {...c} at={T.follow} y={990} x={450} size={50} text="@DAILY.RIDDLES.12" bg="#FFFFFF" rot={0} />
          <FollowButton {...c} at={T.follow} tap={T.karo2} x={470} y={1120} />
        </>
      )}
      <Finish frame={frame} vignette={0.45} />
      <Html5Audio src={staticFile("voice/mela_answer.wav")} volume={1} />
      <Html5Audio src={staticFile("music/loop.wav")} loop volume={musicVol} />
      {SFX.map(([s, f, v], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s * fps))} durationInFrames={Math.round(2 * fps)} layout="none">
          <Html5Audio src={staticFile(`sfx/${f}.wav`)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
