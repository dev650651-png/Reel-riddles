// ScooterAnswer (Part 2 of ScooterProfit). Every time comes from words.json (snapshot of public/words.json for this voice).
import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadPoppins } from "../../lib/fonts";
import { Character, Dust, FlyingNotes, INK, Pose, PriceTag, Scooter } from "../../lib/cartoon";
import { bounceHeight, fallTime, keys, rand, smooth, squash } from "../../lib/physics";
import { Cam, Chip, Finish, FollowButton, shake, Tile } from "../../lib/ui";
import { GROUND, makeMusicVol, makeW, World } from "../../lib/scene";
import wordsData from "./words.json";

loadPoppins();

const WORDS = wordsData.words as { word: string; start: number; end: number }[];
const W = makeW(WORDS);
const FPS = 30;
export const SCOOTER_ANSWER_DURATION = Math.ceil((wordsData.duration + 2) * FPS);

const T = {
  ek1: W("एक"), purre1: W("पूरे"), do1: W("दो"), dekho: W("देखो"), diye: W("दिए"), aath: W("आठ"), das1: W("दस"), atharah1: W("अठारह"),
  aur2: W("और", 2), mile: W("मिले"), nau: W("नौ"), gyarah: W("ग्यारह"), bees1: W("बीस"), bees2: W("बीस", 2), do2: W("दो", 2),
  par: W("पर"), ruko: W("रुको"), ek2: W("एक", 2), nuksan: W("नुकसान"), nahi3: W("नहीं", 3), das2: W("दस", 2), pehle: W("पहले"),
  gin: W("गिन"), aasan: W("आसान"), do3: W("दो", 3), saude: W("सौदे"), ek3: W("एक", 3), fayda2: W("फ़ायदा", 2), agli: W("अगली"),
  sahi: W("सही"), comment: W("कमेंट"), aur5: W("और", 5), follow: W("फ़ॉलो"), karo: W("करो"),
};
const CUTS = [0, T.dekho, T.aur2, T.bees2, T.par, T.nahi3, T.aasan, T.agli, T.aur5];

// medium shot: head around y 1000-1100 on screen, clear of chips above
const midCam = (t: number, t0: number, x0: number, x1: number): Cam => ({ x: keys(t - t0, [[0, x0], [4, x1]]), y: -110, s: keys(t - t0, [[0, 1.14], [4, 1.2]]) });

// ================================================================ scenes
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const jump = t < 0.55 ? Math.max(0, 230 * (1 - ((t + 0.3) / 0.85) ** 2)) : bounceHeight(t - 0.55, 0, 0.3);
  const again = t > T.do1 ? bounceHeight(t - T.do1, 160, 0.3) : 0;
  return (
    <World cam={{ x: 0, y: keys(t, [[0, -260], [T.dekho, -230]]), s: keys(t, [[0, 1.12], [T.dekho, 1.18]]) }} t={t}>
      <Scooter x={800} y={GROUND} />
      <Character kind="pappu" x={430} y={GROUND + 10} t={t} pose={{ armF: 160, armB: 160, mouth: "grin", brows: 14 }} hop={jump + again} sq={t < 0.55 ? [0.95, 1.06] : squash(t - 0.55, 0.16)} />
      <Coins t={t} t0={0.55} x={430} y={1200} />
      {t > T.do1 && <Coins t={t} t0={T.do1 + fallTime(160)} x={430} y={1200} />}
    </World>
  );
};

const Paid: React.FC<{ t: number }> = ({ t }) => {
  const pose: Pose = t < T.diye - 0.2 ? { armF: 30, mouth: "smile", look: [-1, -0.4] } : t < T.atharah1 ? { armB: 90, holdB: t < T.diye + 0.1 ? "notes" : null, mouth: "flat", look: [-1, -0.4] } : { armB: 20, armF: 20, mouth: "o", brows: 18, look: [-1, -0.6] };
  return (
    <World cam={midCam(t, T.dekho, 60, 90)} t={t}>
      <Character kind="pappu" x={800} y={GROUND + 10} t={t} pose={pose} phase={1} />
      {t >= T.diye && <FlyingNotes t={t} t0={T.diye} from={[620, 1150]} to={[-200, 1000]} />}
    </World>
  );
};

const Got: React.FC<{ t: number }> = ({ t }) => {
  const pose: Pose = t < T.mile - 0.1 ? { armF: 30, mouth: "smile", look: [1, -0.4] } : t < T.bees1 ? { armF: 80, holdF: t > T.mile + 0.5 ? "notes" : null, mouth: "grin", look: [1, -0.4] } : { armF: 150, armB: 150, holdF: "notes", mouth: "grin", brows: 14 };
  return (
    <World cam={midCam(t, T.aur2, -60, -30)} t={t}>
      <Character kind="pappu" x={260} y={GROUND + 10} t={t} pose={pose} phase={2} hop={t > T.bees1 ? bounceHeight(t - T.bees1, 120, 0.3) : 0} />
      {t >= T.mile && <FlyingNotes t={t} t0={T.mile} from={[1300, 1000]} to={[440, 1150]} />}
    </World>
  );
};

const Calc: React.FC<{ t: number }> = ({ t }) => {
  const win = T.do2 - 0.1;
  const sh = shake(t - win, 14);
  return (
    <World cam={{ x: sh[0], y: -120 + sh[1], s: keys(t - T.bees2, [[0, 1.12], [3.3, 1.2]]) }} t={t}>
      <Scooter x={820} y={GROUND} />
      <Character kind="pappu" x={400} y={GROUND + 10} t={t} pose={t < win ? { armF: 100, mouth: "flat", look: [0.3, -0.9] } : { armF: 165, armB: 165, mouth: "grin", brows: 16 }} hop={t > win ? bounceHeight(t - win, 200, 0.3) : 0} />
      {t > win && <Coins t={t} t0={win + fallTime(200)} x={400} y={1200} />}
    </World>
  );
};

const ReHook: React.FC<{ t: number }> = ({ t }) => {
  const sh = shake(t - T.par, 30);
  const sh2 = shake(t - T.nuksan, 18);
  return (
    <World cam={{ x: sh[0] + sh2[0], y: -110 + sh[1] + sh2[1], s: keys(t - T.par, [[0, 1.3], [0.3, 1.16], [3.6, 1.22]]) }} t={t} dim={0.45}>
      <Character kind="golu" x={800} y={GROUND + 10} s={0.95} t={t} phase={2} pose={{ armB: 40, armF: 20, mouth: "grin", brows: -6, look: [-1, 0], tilt: -6 }} />
      <Character kind="pappu" x={290} y={GROUND + 10} t={t} pose={{ armF: 160, armB: 15, mouth: "worried", brows: 20, sweat: true, look: [1, -0.3] }} />
    </World>
  );
};

const Explain: React.FC<{ t: number }> = ({ t }) => (
  <World cam={midCam(t, T.nahi3, -40, -10)} t={t}>
    <Character kind="pappu" x={300} y={GROUND + 10} t={t} pose={t < T.pehle ? { armF: 75, mouth: "flat", brows: -4, look: [1, -0.6] } : { armF: 120, mouth: "smile", brows: 10, look: [1, -0.8] }} />
  </World>
);

const TwoDeals: React.FC<{ t: number }> = ({ t }) => (
  <World cam={{ x: 0, y: -100, s: keys(t - T.aasan, [[0, 1.12], [4, 1.18]]) }} t={t}>
    <Character kind="pappu" x={540} y={GROUND + 10} t={t} pose={t < T.fayda2 ? { armF: 100, armB: 100, mouth: "smile", look: [0, -0.9] } : { armF: 165, armB: 165, mouth: "grin", brows: 16 }} hop={t > T.fayda2 ? bounceHeight(t - T.fayda2, 160, 0.3) : 0} />
    {t > T.fayda2 && <Coins t={t} t0={T.fayda2 + fallTime(160)} x={540} y={1200} />}
  </World>
);

const Tease: React.FC<{ t: number }> = ({ t }) => (
  <World cam={{ ...midCam(t, T.agli, 0, 20), y: -190 }} t={t}>
    <Character kind="pappu" x={540} y={GROUND + 10} t={t} pose={t < T.sahi ? { armF: 150, mouth: "o", brows: 20, look: [0, -0.9] } : { armF: 60, armB: 150, mouth: "grin", brows: 10, look: [0.5, -0.4] }} />
  </World>
);

const Outro: React.FC<{ t: number }> = ({ t }) => {
  const wave = t > T.karo + 0.4;
  return (
    <World cam={{ x: keys(t - T.aur5, [[0, -20], [5, 0]]), y: -150, s: 1.1 }} t={t}>
      <Scooter x={800} y={GROUND} />
      <Character kind="pappu" x={250} y={GROUND + 10} s={0.95} t={t} pose={wave ? { armF: 150 + Math.sin(t * 12) * 18, mouth: "grin", brows: 10 } : { armF: 40, armB: 150, mouth: "grin", look: [0.4, -0.6], brows: 12 }} />
    </World>
  );
};

/** Gold coin burst on landing. */
const Coins: React.FC<{ t: number; t0: number; x: number; y: number }> = ({ t, t0, x, y }) => {
  const dt = t - t0;
  if (dt < 0 || dt > 1.1) return null;
  return (
    <g>
      <Dust x={x} y={GROUND} dt={dt} size={0.9} />
      {Array.from({ length: 10 }).map((_, i) => {
        const vx = (rand(i) < 0.5 ? -1 : 1) * (300 + rand(i + 2) * 700);
        const vy = -500 - rand(i + 5) * 400; // low spray along the ground, never up past the face
        const cx = x + vx * dt;
        const cy = Math.min(GROUND - 30, GROUND - 40 + vy * dt + 0.5 * 3600 * dt * dt);
        return (
          <g key={i} transform={`translate(${cx},${cy}) scale(${Math.abs(Math.cos(dt * 12 + i))},1)`} opacity={1 - smooth((dt - 0.7) / 0.4)}>
            <circle r={30} fill="#FFC233" stroke={INK} strokeWidth={7} />
            <circle r={16} fill="none" stroke="#E0A100" strokeWidth={5} />
          </g>
        );
      })}
    </g>
  );
};

// ================================================================ screen-space props
const DropTag: React.FC<{ t: number; at: number; x: number; y: number; text: string; color?: string; s?: number }> = ({ t, at, x, y, text, color = "#FFFFFF", s = 1.15 }) => {
  if (t < at) return null;
  const dt = t - at;
  const h = 420;
  const yy = -bounceHeight(dt, h, 0.3);
  const [sx, sy] = squash(dt - fallTime(h), 0.25);
  return (
    <svg width={420} height={150} viewBox="-210 -75 420 150" style={{ position: "absolute", left: x, top: y + yy, overflow: "visible" }}>
      <g transform={`translate(0,50) scale(${sx},${sy}) translate(0,-50)`}>
        <PriceTag x={0} y={0} text={text} color={color} s={s} rot={Math.sin(dt * 9) * 8 * Math.exp(-dt * 2)} />
      </g>
    </svg>
  );
};

const Balloon: React.FC<{ t: number; at: number; popAt: number; x: number; y: number }> = ({ t, at, popAt, x, y }) => {
  if (t < at) return null;
  if (t >= popAt) {
    const dt = t - popAt;
    if (dt > 0.5) return null;
    return (
      <svg width={400} height={400} viewBox="-200 -200 400 400" style={{ position: "absolute", left: x - 200, top: y - 200 }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const r = 60 + dt * 500;
          return <path key={i} d="M -14 -6 L 14 -6 L 6 10 Z" fill="#E63946" stroke={INK} strokeWidth={4} transform={`translate(${Math.cos(a) * r},${Math.sin(a) * r + dt * dt * 600}) rotate(${i * 40 + dt * 600})`} opacity={1 - dt / 0.5} />;
        })}
      </svg>
    );
  }
  const p = Math.min(1, (t - at) / 0.25);
  const bob = Math.sin(t * 3) * 14;
  return (
    <svg width={300} height={420} viewBox="0 0 300 420" style={{ position: "absolute", left: x - 150, top: y - 160 + bob + (1 - p) * 120, opacity: p }}>
      <path d="M 150 300 Q 130 350 160 410" fill="none" stroke={INK} strokeWidth={5} />
      <ellipse cx={150} cy={160} rx={130} ry={145} fill="#E63946" stroke={INK} strokeWidth={10} />
      <ellipse cx={105} cy={100} rx={26} ry={42} fill="#fff" opacity={0.45} />
      <path d="M 135 300 L 165 300 L 150 285 Z" fill="#E63946" stroke={INK} strokeWidth={6} />
      <text x={150} y={180} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={64} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke">-1,000</text>
    </svg>
  );
};

const DealCard: React.FC<{ t: number; at: number; plusAt: number; x: number; title: string; buy: string; sell: string; merge: number }> = ({ t, at, plusAt, x, title, buy, sell, merge }) => {
  if (t < at) return null;
  const p = Math.min(1, (t - at) / 0.2);
  const dx = (540 - 220 - x) * merge;
  return (
    <div style={{ position: "absolute", left: x + dx, top: 300, width: 440, transform: `scale(${p * (1 - merge * 0.2)}) rotate(${Math.sin(t * 3 + x) * 1.5}deg)`, opacity: 1 - merge * 0.9 }}>
      <div style={{ background: "#fff", border: `9px solid ${INK}`, borderRadius: 30, boxShadow: "0 12px 0 rgba(26,16,48,0.45)", padding: "14px 10px", textAlign: "center", fontFamily: "Poppins", fontWeight: 800, color: INK }}>
        <div style={{ fontSize: 52 }}>{title}</div>
        <div style={{ fontSize: 40, color: "#C0392B" }}>KHARIDA {buy}</div>
        <div style={{ fontSize: 40, color: "#1E8449" }}>BECHA {sell}</div>
      </div>
      {t >= plusAt && (
        <div style={{ position: "absolute", left: 90, top: 250, width: 260, textAlign: "center", transform: `scale(${Math.min(1, (t - plusAt) / 0.15)})`, background: "#2ECC71", border: `9px solid ${INK}`, borderRadius: 26, fontFamily: "Poppins", fontWeight: 800, fontSize: 64, color: "#fff", WebkitTextStroke: `8px ${INK}`, paintOrder: "stroke fill" }}>
          +1,000
        </div>
      )}
    </div>
  );
};

const MysteryBox: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  if (t < at) return null;
  const p = Math.min(1, (t - at) / 0.2);
  const jig = Math.sin(t * 16) * 5;
  return (
    <svg width={380} height={340} style={{ position: "absolute", left: 350, top: 360, transform: `scale(${p}) rotate(${jig}deg)` }} viewBox="0 0 380 340">
      <rect x={20} y={90} width={340} height={230} rx={20} fill="#8E44AD" stroke={INK} strokeWidth={12} />
      <rect x={0} y={50} width={380} height={70} rx={16} fill="#A569BD" stroke={INK} strokeWidth={12} transform={`rotate(${Math.sin(t * 10) * 4} 190 85)`} />
      <rect x={165} y={50} width={50} height={270} fill="#FFC233" stroke={INK} strokeWidth={8} />
      <text x={190} y={270} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={150} fill="#FFE14D" stroke={INK} strokeWidth={10} paintOrder="stroke">?</text>
    </svg>
  );
};

const Bubble: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  if (t < at) return null;
  const p = Math.min(1, (t - at) / 0.2);
  const b = Math.abs(Math.sin((t - at) * 6)) * 14;
  return (
    <svg width={190} height={170} style={{ position: "absolute", left: 60, top: 720 - b, transform: `scale(${p})` }} viewBox="0 0 190 170">
      <path d="M 20 20 L 170 20 Q 180 20 180 30 L 180 110 Q 180 120 170 120 L 80 120 L 40 160 L 50 120 L 20 120 Q 10 120 10 110 L 10 30 Q 10 20 20 20 Z" fill="#fff" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
      {[55, 95, 135].map((x, i) => <circle key={x} cx={x} cy={70 - Math.max(0, Math.sin(t * 8 - i)) * 8} r={12} fill={INK} />)}
    </svg>
  );
};

// ================================================================ sound
type Sfx = [number, string, number];
const tagLand = (at: number) => at + fallTime(420);
const SFX: Sfx[] = [
  [0, "slam", 0.25], [0, "ding", 0.18], [0.1, "whoosh", 0.15], [0.55, "thud", 0.2],
  [T.ek1, "buzzer", 0.1],
  [T.do1, "sparkle", 0.18],
  ...CUTS.slice(1).map((c): Sfx => [c - 0.08, "whoosh", 0.2]),
  [T.dekho, "pop", 0.22],
  [T.diye, "whoosh", 0.1],
  [tagLand(T.aath), "thud", 0.22], [T.aath, "pop", 0.15],
  [tagLand(T.das1), "thud", 0.22], [T.das1, "pop", 0.15],
  [T.atharah1, "pop", 0.22],
  [T.aur2, "pop", 0.22],
  [T.mile, "ding", 0.18],
  [tagLand(T.nau), "thud", 0.22], [T.nau, "pop", 0.15],
  [tagLand(T.gyarah), "thud", 0.22], [T.gyarah, "pop", 0.15],
  [T.bees1, "pop", 0.22],
  [T.bees2, "pop", 0.22],
  [T.do2 - 0.1, "slam", 0.18], [T.do2, "sparkle", 0.2], [T.do2 + 0.1, "ding", 0.15],
  [T.par, "slam", 0.28],
  [T.ek2, "pop", 0.15],
  [T.nuksan, "pop", 0.22],
  [T.nahi3, "pop", 0.22],
  [T.das2, "whoosh", 0.15],
  [T.pehle, "pop", 0.22],
  [T.gin, "pop", 0.3], [T.gin, "splash", 0.12],
  [T.aasan, "pop", 0.22],
  [T.saude, "pop", 0.2], [T.saude + 0.15, "pop", 0.2],
  [T.ek3, "ding", 0.15], [T.ek3 + 0.2, "ding", 0.15],
  [T.fayda2, "sparkle", 0.2],
  [T.agli, "pop", 0.22], [T.agli, "thud", 0.15],
  [T.sahi, "pop", 0.22],
  [T.comment, "pop", 0.22],
  [T.follow, "pop", 0.22],
  [T.karo, "click", 0.3], [T.karo + 0.05, "ding", 0.15],
];
const musicVol = makeMusicVol(WORDS, FPS);

// ================================================================ composition
export const ScooterAnswer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const scene = CUTS.filter((c) => t >= c).length - 1;
  const S = [Hook, Paid, Got, Calc, ReHook, Explain, TwoDeals, Tease, Outro][scene];
  const c = { t, fps };
  const tiles = [
    { l: "A", tx: "RS 1,000", col: "#E63946" },
    { l: "B", tx: "ZERO PROFIT", col: "#1D8BD1" },
    { l: "C", tx: "RS 2,000", col: "#2A9D8F" },
    { l: "D", tx: "RS 3,000", col: "#8E44AD" },
  ];
  return (
    <AbsoluteFill style={{ background: "#FFC98B" }}>
      <S t={t} />
      {scene === 0 && (
        <>
          <Chip {...c} at={-1} pulseAt={T.do1} y={130} size={96} text="JAWAB: RS 2,000" bg="#2ECC71" color="#FFFFFF" rot={-2} />
          <Chip {...c} at={-1} pulseAt={T.ek1} y={290} size={70} text="1,000 NAHI!" bg="#FF5A5F" color="#FFFFFF" rot={2} />
          {tiles.map((tl, i) => (
            <Tile key={tl.l} {...c} at={tl.l === "C" ? -0.12 : -1} letter={tl.l} text={tl.tx} color={tl.col}
              x={60 + (i % 2) * 450} y={400 + Math.floor(i / 2) * 145} w={430} h={128}
              glow={tl.l === "C"} cross={tl.l === "A" ? Math.min(1, (t + 0.1) / 0.6) : tl.l === "C" ? 0 : Math.min(1, Math.max(0, (t - 0.6) / 0.5))} />
          ))}
        </>
      )}
      {scene === 1 && (
        <>
          <Chip {...c} at={T.dekho} y={150} x={70} size={84} text="PAISE DIYE" bg="#FF5A5F" color="#FFFFFF" />
          <DropTag t={t} at={T.aath} x={70} y={330} text="RS 8,000" />
          <DropTag t={t} at={T.das1} x={70} y={480} text="RS 10,000" />
          <Chip {...c} at={T.atharah1} y={650} x={80} size={80} text="= 18,000" bg="#FFE14D" />
        </>
      )}
      {scene === 2 && (
        <>
          <Chip {...c} at={T.aur2} y={150} x={400} size={84} text="PAISE MILE" bg="#2ECC71" color="#FFFFFF" />
          <DropTag t={t} at={T.nau} x={430} y={330} text="RS 9,000" color="#7BD389" />
          <DropTag t={t} at={T.gyarah} x={430} y={480} text="RS 11,000" color="#7BD389" />
          <Chip {...c} at={T.bees1} y={650} x={440} size={80} text="= 20,000" bg="#FFE14D" />
        </>
      )}
      {scene === 3 && (
        <>
          <Chip {...c} at={T.bees2} y={170} size={84} text={"20,000\n- 18,000"} bg="#FFFFFF" />
          <Chip {...c} at={T.do2 - 0.1} y={480} size={96} text="PROFIT: RS 2,000" bg="#2ECC71" color="#FFFFFF" slam />
        </>
      )}
      {scene === 4 && (
        <>
          <Chip {...c} at={T.par} y={160} size={110} text="RUKO!" bg="#FFE14D" slam />
          <Chip {...c} at={T.nuksan} y={380} size={84} text={"1,000 KA\nNUKSAAN?"} bg="#FF5A5F" color="#FFFFFF" slam />
          <Balloon t={t} at={T.ek2} popAt={1e9} x={780} y={700} />
        </>
      )}
      {scene === 5 && (
        <>
          <Chip {...c} at={T.nahi3} until={T.pehle} y={160} size={96} text="NAHI!" bg="#FFFFFF" />
          <Chip {...c} at={T.pehle} y={160} size={84} text="PEHLE HI GINA!" bg="#FFE14D" />
          <div style={{ position: "absolute", left: 470, top: 340, width: 450, height: 360, border: `9px dashed ${INK}`, borderRadius: 30, background: "rgba(255,255,255,0.75)" }}>
            <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 52, color: "#C0392B", textAlign: "center", marginTop: 14 }}>PAISE DIYE</div>
            <svg width={432} height={260} viewBox="-216 -130 432 260" style={{ position: "absolute", top: 80, left: 0, overflow: "visible" }}>
              <PriceTag x={0} y={-40} text="RS 8,000" s={0.95} />
              {(() => {
                const p = smooth((t - T.das2) / 0.5);
                return <PriceTag x={-420 * (1 - p)} y={70 - Math.sin(p * Math.PI) * 160} text="RS 10,000" s={0.95} rot={(1 - p) * -30} />;
              })()}
            </svg>
          </div>
          <Balloon t={t} at={-1} popAt={T.gin} x={830} y={840} />
        </>
      )}
      {scene === 6 && (
        <>
          <Chip {...c} at={T.aasan} y={150} size={84} text="DO ALAG SAUDE" bg="#FFE14D" />
          <DealCard t={t} at={T.saude} plusAt={T.ek3} x={50} title="SAUDA 1" buy="8,000" sell="9,000" merge={smooth((t - T.fayda2) / 0.3)} />
          <DealCard t={t} at={T.saude + 0.15} plusAt={T.ek3 + 0.2} x={540} title="SAUDA 2" buy="10,000" sell="11,000" merge={smooth((t - T.fayda2) / 0.3)} />
          <Chip {...c} at={T.fayda2 + 0.15} y={420} size={110} text="+2,000" bg="#2ECC71" color="#FFFFFF" slam />
        </>
      )}
      {scene === 7 && (
        <>
          <Chip {...c} at={T.agli} y={150} size={80} text={"NEXT REEL:\nTEDHI PAHELI"} bg="#FFE14D" />
          <MysteryBox t={t} at={T.agli} />
          <Chip {...c} at={T.sahi} until={T.comment} y={720} x={70} size={64} text="SAHI THA?" bg="#FFFFFF" />
          <Chip {...c} at={T.comment} y={720} x={270} size={64} text="COMMENT KARO" bg="#FFFFFF" />
          <Bubble t={t} at={T.comment} />
        </>
      )}
      {scene === 8 && (
        <>
          <Chip {...c} at={T.aur5} y={200} size={80} text={"AISI AUR\nPAHELIYAN"} bg="#FFE14D" />
          <Chip {...c} at={T.follow} y={990} x={450} size={50} text="@DAILY.RIDDLES.12" bg="#FFFFFF" rot={0} />
          <FollowButton {...c} at={T.follow} tap={T.karo} x={470} y={1120} />
        </>
      )}
      <Finish frame={frame} />
      <Html5Audio src={staticFile("voice/scooter_answer.wav")} volume={1} />
      <Html5Audio src={staticFile("music/loop.wav")} loop volume={musicVol} />
      {SFX.map(([s, f, v], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s * fps))} durationInFrames={Math.round(2 * fps)} layout="none">
          <Html5Audio src={staticFile(`sfx/${f}.wav`)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
