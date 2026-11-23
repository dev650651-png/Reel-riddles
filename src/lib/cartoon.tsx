// Chunky cartoon kit (SVG, 1080x1920 world units). Thick dark outlines, big heads, always-alive idle motion.
import React from "react";
import { bounceHeight, clamp, fallTime, rand, smooth, squash } from "./physics";

export const INK = "#1a1030";
export const SW = 9; // outline width

// ---------------------------------------------------------------- characters
export type Mouth = "grin" | "smile" | "o" | "worried" | "flat";
export type Pose = {
  armF?: number; // arm on +x side, degrees raised outward from hanging down
  armB?: number; // arm on -x side
  mouth?: Mouth;
  brows?: number; // raise in px (negative = frown)
  look?: [number, number]; // pupil direction -1..1
  tilt?: number; // head tilt degrees
  lean?: number; // body lean degrees
  holdF?: "notes" | "bag" | "lathi" | null;
  holdB?: "notes" | "bag" | "lathi" | null;
  sweat?: boolean;
  whistle?: boolean;
};

type Kind = "pappu" | "golu" | "auntie" | "kaka";
const LOOK: Record<Kind, { skin: string; top: string; bottom: string; w: number; hair: string }> = {
  pappu: { skin: "#C98B5B", top: "#FFC233", bottom: "#F4F1E8", w: 250, hair: "#2B1B17" },
  golu: { skin: "#D9A06B", top: "#4FA8EC", bottom: "#3B4A6B", w: 320, hair: "#2B1B17" },
  auntie: { skin: "#B97A4F", top: "#E8457F", bottom: "#E8457F", w: 270, hair: "#1E1414" },
  kaka: { skin: "#C68A5E", top: "#C2A46B", bottom: "#A88B55", w: 220, hair: "#EDEDED" },
};

const Arm: React.FC<{ x: number; angle: number; side: 1 | -1; color: string; skin: string; hold?: Pose["holdF"] }> = ({
  x, angle, side, color, skin, hold,
}) => {
  const L = 195;
  return (
    <g transform={`translate(${x},-450) rotate(${-angle * side})`}>
      <line x1={0} y1={0} x2={0} y2={L - 20} stroke={INK} strokeWidth={62} strokeLinecap="round" />
      <line x1={0} y1={0} x2={0} y2={L - 20} stroke={color} strokeWidth={44} strokeLinecap="round" />
      <circle cx={0} cy={L} r={30} fill={skin} stroke={INK} strokeWidth={SW} />
      {hold === "notes" && (
        <g transform={`translate(0,${L + 10}) rotate(${angle * side})`}>
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-48 + i * 6} y={-30 - i * 8} width={96} height={52} rx={6} fill="#7BD389" stroke={INK} strokeWidth={6} />
          ))}
          <circle cx={12} cy={-30} r={13} fill="#4DAA5E" stroke={INK} strokeWidth={4} />
        </g>
      )}
      {hold === "lathi" && (
        <g transform={`translate(0,${L}) rotate(${angle * side})`}>
          <line x1={0} y1={-120} x2={0} y2={250} stroke={INK} strokeWidth={26} strokeLinecap="round" />
          <line x1={0} y1={-120} x2={0} y2={250} stroke="#8B5A2B" strokeWidth={14} strokeLinecap="round" />
        </g>
      )}
      {hold === "bag" && (
        <g transform={`translate(0,${L}) rotate(${angle * side})`}>
          <path d="M -30 -6 Q 0 -40 30 -6" fill="none" stroke={INK} strokeWidth={8} />
          <circle cx={-20} cy={6} r={22} fill="#3FA34D" stroke={INK} strokeWidth={6} />
          <circle cx={18} cy={2} r={20} fill="#E2442F" stroke={INK} strokeWidth={6} />
          <path d="M -70 10 L 70 10 L 55 120 L -55 120 Z" fill="#8BC34A" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        </g>
      )}
    </g>
  );
};

const MouthShape: React.FC<{ m: Mouth; y: number }> = ({ m, y }) => {
  switch (m) {
    case "grin":
      return (
        <g transform={`translate(0,${y})`}>
          <path d="M -72 0 Q 0 82 72 0 Z" fill="#7A1F2B" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M -60 4 L 60 4 L 52 18 Q 0 30 -52 18 Z" fill="#fff" />
          <path d="M -30 38 Q 0 52 30 38" fill="#E86A7A" />
        </g>
      );
    case "o":
      return <ellipse cx={0} cy={y + 22} rx={26} ry={32} fill="#7A1F2B" stroke={INK} strokeWidth={SW} />;
    case "worried":
      return <path d={`M -52 ${y + 30} Q -26 ${y + 10} 0 ${y + 30} Q 26 ${y + 50} 52 ${y + 30}`} fill="none" stroke={INK} strokeWidth={SW + 2} strokeLinecap="round" />;
    case "flat":
      return <line x1={-40} y1={y + 28} x2={40} y2={y + 28} stroke={INK} strokeWidth={SW + 2} strokeLinecap="round" />;
    default:
      return <path d={`M -56 ${y + 6} Q 0 ${y + 56} 56 ${y + 6}`} fill="none" stroke={INK} strokeWidth={SW + 2} strokeLinecap="round" />;
  }
};

export const Character: React.FC<{
  kind: Kind;
  x: number;
  y: number;
  s?: number;
  t: number; // absolute seconds
  pose?: Pose;
  phase?: number;
  hop?: number; // px above ground (jumps)
  sq?: [number, number]; // squash
}> = ({ kind, x, y, s = 1, t, pose = {}, phase = 0, hop = 0, sq = [1, 1] }) => {
  const k = LOOK[kind];
  const breathe = Math.sin(t * 2.4 + phase);
  const sway = Math.sin(t * 1.7 + phase * 1.3) * 1.8 + (pose.lean ?? 0);
  const bt = (t + phase * 0.77) % 3.1;
  const blink = bt < 0.14 ? 1 - Math.abs(bt - 0.07) / 0.07 : 0;
  const [lx, ly] = pose.look ?? [0, 0];
  const brows = pose.brows ?? 0;
  const armF = (pose.armF ?? 12) + Math.sin(t * 2.4 + phase + 1) * 3;
  const armB = (pose.armB ?? 12) + Math.sin(t * 2.4 + phase + 2) * 3;
  const w = k.w;
  const headY = -640 + breathe * 4;
  const eyeRy = 44 * (1 - blink * 0.92);
  return (
    <g transform={`translate(${x},${y - hop})`}>
      <ellipse cx={0} cy={hop} rx={160 * s * clamp(1 - hop / 900, 0.4, 1)} ry={24 * s} fill="rgba(40,20,10,0.28)" />
      <g transform={`scale(${s * sq[0]},${s * sq[1]}) rotate(${sway})`}>
        {/* legs / skirt */}
        {kind === "auntie" ? (
          <path d={`M ${-w / 2 + 10} -230 L ${w / 2 - 10} -230 L ${w / 2 + 30} -8 Q 0 10 ${-w / 2 - 30} -8 Z`} fill="#C9356A" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        ) : (
          <g>
            <rect x={-78} y={-215} width={58} height={205} rx={22} fill={k.bottom} stroke={INK} strokeWidth={SW} />
            <rect x={20} y={-215} width={58} height={205} rx={22} fill={k.bottom} stroke={INK} strokeWidth={SW} />
            <ellipse cx={-42} cy={-10} rx={52} ry={24} fill="#5B3A29" stroke={INK} strokeWidth={SW} />
            <ellipse cx={56} cy={-10} rx={52} ry={24} fill="#5B3A29" stroke={INK} strokeWidth={SW} />
          </g>
        )}
        <Arm x={-w / 2 + 18} angle={armB} side={-1} color={k.top} skin={k.skin} hold={pose.holdB} />
        {/* torso (breathes) */}
        <g transform={`translate(0,-200) scale(${1 - breathe * 0.008},${1 + breathe * 0.02}) translate(0,200)`}>
          <rect x={-w / 2} y={-490} width={w} height={300} rx={80} fill={kind === "golu" ? "url(#checks)" : k.top} stroke={INK} strokeWidth={SW} />
          {kind === "pappu" && (
            <g>
              <path d="M 0 -490 L 0 -380" stroke={INK} strokeWidth={6} />
              <circle cx={0} cy={-450} r={7} fill={INK} />
              <circle cx={0} cy={-415} r={7} fill={INK} />
              <rect x={40} y={-430} width={58} height={50} rx={8} fill="#F2A900" stroke={INK} strokeWidth={6} />
              <rect x={48} y={-452} width={42} height={26} rx={4} fill="#7BD389" stroke={INK} strokeWidth={4} />
            </g>
          )}
          {kind === "auntie" && <path d={`M ${-w / 2 + 20} -480 L ${w / 2 - 10} -250 L ${w / 2 - 60} -210 L ${-w / 2 + 10} -420 Z`} fill="#3FB27F" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />}
        </g>
        <rect x={-42} y={-520} width={84} height={60} fill={k.skin} stroke={INK} strokeWidth={SW} />
        {/* head */}
        <g transform={`translate(0,${headY}) rotate(${pose.tilt ?? 0})`}>
          {kind === "auntie" && <circle cx={-110} cy={-120} r={66} fill={k.hair} stroke={INK} strokeWidth={SW} />}
          {kind === "pappu" &&
            Array.from({ length: 9 }).map((_, i) => {
              const a = (-170 + i * 20) * (Math.PI / 180);
              return <circle key={i} cx={Math.cos(a) * 150} cy={Math.sin(a) * 150 + 6} r={52} fill={k.hair} stroke={INK} strokeWidth={SW} />;
            })}
          <circle cx={-166} cy={8} r={36} fill={k.skin} stroke={INK} strokeWidth={SW} />
          <circle cx={166} cy={8} r={36} fill={k.skin} stroke={INK} strokeWidth={SW} />
          {kind === "auntie" && (
            <g>
              <circle cx={-166} cy={52} r={13} fill="#FFC233" stroke={INK} strokeWidth={5} />
              <circle cx={166} cy={52} r={13} fill="#FFC233" stroke={INK} strokeWidth={5} />
            </g>
          )}
          <circle cx={0} cy={0} r={168} fill={k.skin} stroke={INK} strokeWidth={SW} />
          {kind === "pappu" &&
            [-70, -10, 50].map((cx, i) => <circle key={i} cx={cx} cy={-138} r={44} fill={k.hair} />)}
          {kind === "golu" && <path d="M -165 -40 Q -160 -175 0 -172 Q 160 -175 165 -40 Q 120 -110 0 -112 Q -120 -110 -165 -40 Z" fill={k.hair} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />}
          {kind === "kaka" && (
            <g>
              {[-1, 1].map((sd) => [0, 1, 2].map((j) => <circle key={`${sd}${j}`} cx={sd * (150 - j * 8)} cy={-60 + j * 34} r={34} fill={k.hair} stroke={INK} strokeWidth={6} />))}
              <path d="M -150 -88 Q -150 -190 0 -192 Q 150 -190 150 -88 Q 80 -120 0 -118 Q -80 -120 -150 -88 Z" fill="#B39457" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
              <rect x={-160} y={-100} width={320} height={26} rx={12} fill="#8C7343" stroke={INK} strokeWidth={6} />
            </g>
          )}
          {kind === "auntie" && <path d="M -168 10 Q -170 -170 0 -170 Q 170 -170 168 10 Q 150 -95 8 -112 L 0 -96 L -8 -112 Q -150 -95 -168 10 Z" fill={k.hair} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />}
          {/* cheeks */}
          <circle cx={-98} cy={48} r={28} fill="#FF6B6B" opacity={0.3} />
          <circle cx={98} cy={48} r={28} fill="#FF6B6B" opacity={0.3} />
          {/* eyes */}
          {[-58, 58].map((ex) => (
            <g key={ex}>
              <ellipse cx={ex} cy={-12} rx={36} ry={eyeRy} fill="#fff" stroke={INK} strokeWidth={SW - 2} />
              {blink < 0.6 && <circle cx={ex + lx * 13} cy={-8 + ly * 14} r={17} fill={INK} />}
              {blink < 0.6 && <circle cx={ex + lx * 13 + 6} cy={-14 + ly * 14} r={5} fill="#fff" />}
            </g>
          ))}
          {/* brows */}
          <path d={`M -95 ${-72 - brows} Q -58 ${-92 - brows} -22 ${-76 - brows * 0.6}`} fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
          <path d={`M 95 ${-72 - brows} Q 58 ${-92 - brows} 22 ${-76 - brows * 0.6}`} fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
          {kind === "auntie" && <circle cx={0} cy={-62} r={11} fill="#D7263D" />}
          <path d="M -6 18 Q 4 44 18 30" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
          {kind === "golu" && <path d="M -88 52 Q -44 22 0 44 Q 44 22 88 52 Q 64 76 0 62 Q -64 76 -88 52 Z" fill={k.hair} stroke={INK} strokeWidth={6} strokeLinejoin="round" />}
          {kind === "kaka" && (
            <g>
              <path d="M -100 52 Q -50 18 0 42 Q 50 18 100 52 Q 70 80 0 62 Q -70 80 -100 52 Z" fill="#F4F4F4" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
              {[-58, 58].map((gx) => <circle key={gx} cx={gx} cy={-12} r={50} fill="rgba(200,230,255,0.18)" stroke={INK} strokeWidth={8} />)}
              <line x1={-8} y1={-16} x2={8} y2={-16} stroke={INK} strokeWidth={8} />
            </g>
          )}
          <MouthShape m={pose.mouth ?? "smile"} y={kind === "golu" || kind === "kaka" ? 78 : 62} />
          {pose.whistle && (
            <g transform={`translate(0,${(kind === "golu" || kind === "kaka" ? 78 : 62) + 20})`}>
              <rect x={10} y={-16} width={78} height={34} rx={12} fill="#D7DCE3" stroke={INK} strokeWidth={6} />
              <circle cx={70} cy={0} r={8} fill={INK} />
            </g>
          )}
          {pose.sweat && <path d="M 140 -90 Q 160 -50 140 -40 Q 120 -50 140 -90 Z" fill="#7FD3FF" stroke={INK} strokeWidth={5} />}
        </g>
        <Arm x={w / 2 - 18} angle={armF} side={1} color={k.top} skin={k.skin} hold={pose.holdF} />
      </g>
    </g>
  );
};

/** Pattern defs used by the characters; render once inside every <svg>. */
export const CartoonDefs: React.FC = () => (
  <defs>
    <pattern id="checks" width={48} height={48} patternUnits="userSpaceOnUse">
      <rect width={48} height={48} fill="#4FA8EC" />
      <rect width={24} height={48} fill="#3D8FD1" opacity={0.6} />
      <rect width={48} height={24} fill="#3D8FD1" opacity={0.6} />
    </pattern>
    <radialGradient id="sun" cx="0.25" cy="0.1" r="0.8">
      <stop offset="0" stopColor="#FFF3C4" stopOpacity={0.9} />
      <stop offset="1" stopColor="#FFF3C4" stopOpacity={0} />
    </radialGradient>
  </defs>
);

// ---------------------------------------------------------------- scooter
export const Scooter: React.FC<{ x: number; y: number; s?: number; wheel?: number; sq?: [number, number]; hop?: number }> = ({
  x, y, s = 1, wheel = 0, sq = [1, 1], hop = 0,
}) => {
  const Wheel = ({ cx }: { cx: number }) => (
    <g transform={`translate(${cx},-62) rotate(${wheel})`}>
      <circle r={62} fill="#2A2233" stroke={INK} strokeWidth={SW} />
      <circle r={28} fill="#C9CED6" stroke={INK} strokeWidth={6} />
      {[0, 60, 120].map((a) => (
        <line key={a} x1={-26} y1={0} x2={26} y2={0} stroke={INK} strokeWidth={5} transform={`rotate(${a})`} />
      ))}
    </g>
  );
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={250 * s * clamp(1 - hop / 900, 0.4, 1)} ry={26 * s} fill="rgba(40,20,10,0.3)" />
      <g transform={`translate(0,${-hop}) scale(${s * sq[0]},${s * sq[1]})`}>
        <Wheel cx={-150} />
        <Wheel cx={165} />
        <ellipse cx={-130} cy={-150} rx={120} ry={78} fill="#7FD6B5" stroke={INK} strokeWidth={SW} />
        <path d="M -175 -150 Q -150 -185 -110 -170" fill="none" stroke="#5DB896" strokeWidth={10} strokeLinecap="round" />
        <path d="M -60 -185 L 40 -185 L 40 -110 L -60 -110 Z" fill="#7FD6B5" stroke={INK} strokeWidth={SW} />
        <rect x={-50} y={-126} width={190} height={24} rx={8} fill="#5A5266" stroke={INK} strokeWidth={SW} />
        <path d="M 112 -110 L 140 -330 Q 152 -352 182 -346 L 214 -132 Q 200 -92 160 -92 Z" fill="#7FD6B5" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M 102 -64 Q 166 -150 230 -64 Z" fill="#7FD6B5" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <rect x={-210} y={-262} width={190} height={44} rx={22} fill="#4A2F2F" stroke={INK} strokeWidth={SW} />
        <line x1={140} y1={-340} x2={236} y2={-362} stroke={INK} strokeWidth={18} strokeLinecap="round" />
        <circle cx={198} cy={-322} r={24} fill="#FFF6C0" stroke={INK} strokeWidth={SW} />
        <path d="M -190 -120 L -160 -128 L -150 -112" fill="none" stroke="#4E9C80" strokeWidth={6} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- props
export const PriceTag: React.FC<{ x: number; y: number; text: string; rot?: number; s?: number; color?: string }> = ({
  x, y, text, rot = 0, s = 1, color = "#FFE14D",
}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -150 0 L -110 -50 L 150 -50 L 150 50 L -110 50 Z" fill={color} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <circle cx={-112} cy={0} r={12} fill="#fff" stroke={INK} strokeWidth={6} />
    <text x={22} y={16} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={46} fill={INK}>
      {text}
    </text>
  </g>
);

/** Tag dropped from height h at time t0 onto ground y. Returns element + impact time. */
export const DroppingTag: React.FC<{ t: number; t0: number; x: number; y: number; h?: number; text: string; color?: string }> = ({
  t, t0, x, y, h = 900, text, color,
}) => {
  if (t < t0) return null;
  const dt = t - t0;
  const hit = fallTime(h);
  const yy = y - bounceHeight(dt, h, 0.3);
  const [sx, sy] = squash(dt - hit, 0.3);
  return (
    <g>
      <Dust x={x} y={y + 50} dt={dt - hit} size={0.8} />
      <g transform={`translate(${x},${yy + 50}) scale(${sx},${sy}) translate(0,-50)`}>
        <PriceTag x={0} y={0} text={text} rot={Math.sin(dt * 9) * 10 * Math.exp(-dt * 2)} color={color} />
      </g>
    </g>
  );
};

/** Dust puff at impact. dt = seconds since impact. */
export const Dust: React.FC<{ x: number; y: number; dt: number; size?: number }> = ({ x, y, dt, size = 1 }) => {
  if (dt < 0 || dt > 0.7) return null;
  const p = smooth(dt / 0.7);
  return (
    <g opacity={1 - p}>
      {Array.from({ length: 9 }).map((_, i) => {
        const dir = (i / 8) * 2 - 1;
        const r = (24 + rand(i) * 26) * size * (0.6 + p);
        return (
          <circle key={i} cx={x + dir * (60 + 220 * p) * size} cy={y - 10 - rand(i + 9) * 60 * p * size - Math.abs(dir) * 10} r={r} fill="#E9D3B0" stroke="#B99A72" strokeWidth={4} />
        );
      })}
    </g>
  );
};

/** Notes flying in an arc from (x0,y0) to (x1,y1), starting at t0. */
export const FlyingNotes: React.FC<{ t: number; t0: number; from: [number, number]; to: [number, number] }> = ({ t, t0, from, to }) => (
  <g>
    {[0, 1, 2, 3].map((i) => {
      const p = (t - t0 - i * 0.06) / 0.5;
      if (p < 0 || p > 1) return null;
      const e = smooth(p);
      const x = from[0] + (to[0] - from[0]) * e;
      const y = from[1] + (to[1] - from[1]) * e - Math.sin(Math.PI * e) * 220;
      return (
        <g key={i} transform={`translate(${x},${y}) rotate(${p * 540 + i * 40})`}>
          <rect x={-48} y={-26} width={96} height={52} rx={6} fill="#7BD389" stroke={INK} strokeWidth={6} />
          <circle cx={0} cy={0} r={13} fill="#4DAA5E" stroke={INK} strokeWidth={4} />
        </g>
      );
    })}
  </g>
);

// ---------------------------------------------------------------- bazaar background
const STALL_COLORS = [
  ["#E63946", "#FFF1D6"],
  ["#2A9D8F", "#FFF1D6"],
  ["#F4A261", "#FFF1D6"],
  ["#6A4C93", "#FFE14D"],
  ["#1D8BD1", "#FFF1D6"],
];

export const BazaarBack: React.FC<{ t: number; dim?: number }> = ({ t, dim = 0 }) => (
  <g>
    <rect x={-800} y={-400} width={2700} height={2600} fill="#FFC98B" />
    <rect x={-800} y={-400} width={2700} height={1300} fill="#FFDDA8" />
    {/* far buildings */}
    {Array.from({ length: 10 }).map((_, i) => {
      const bx = -700 + i * 270;
      const bh = 380 + rand(i) * 260;
      return (
        <g key={i}>
          <rect x={bx} y={1060 - bh} width={250} height={bh} fill={["#F2B880", "#E9A36F", "#F6C99A"][i % 3]} stroke="#C98552" strokeWidth={6} />
          {[0, 1].map((r) => [0, 1, 2].map((c) => (
            <rect key={`${r}${c}`} x={bx + 30 + c * 72} y={1060 - bh + 50 + r * 110} width={44} height={64} rx={6} fill="#B8703F" opacity={0.55} />
          )))}
        </g>
      );
    })}
    {/* stalls */}
    {Array.from({ length: 8 }).map((_, i) => {
      const sx = -600 + i * 330;
      const [c1, c2] = STALL_COLORS[i % STALL_COLORS.length];
      const flap = Math.sin(t * 2 + i) * 4;
      return (
        <g key={i}>
          <rect x={sx + 10} y={1000} width={14} height={420} fill="#6B4226" />
          <rect x={sx + 286} y={1000} width={14} height={420} fill="#6B4226" />
          <rect x={sx} y={1230} width={310} height={190} rx={10} fill="#A9683B" stroke={INK} strokeWidth={7} />
          {Array.from({ length: 6 }).map((_, j) => (
            <circle key={j} cx={sx + 40 + j * 46} cy={1222} r={26} fill={["#E2442F", "#FFB703", "#3FA34D", "#FB8500"][(i + j) % 4]} stroke={INK} strokeWidth={5} />
          ))}
          {Array.from({ length: 6 }).map((_, j) => (
            <path key={j} d={`M ${sx - 10 + j * 55} 960 L ${sx + 45 + j * 55} 960 L ${sx + 45 + j * 55} ${1050 + flap} Q ${sx + 17 + j * 55} ${1075 + flap} ${sx - 10 + j * 55} ${1050 + flap} Z`} fill={j % 2 ? c1 : c2} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          ))}
        </g>
      );
    })}
    <rect x={-800} y={0} width={2700} height={1600} fill="url(#sun)" />
    {dim > 0 && <rect x={-800} y={-400} width={2700} height={2600} fill="#1a1030" opacity={dim} />}
  </g>
);

export const Bunting: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {[0, 1].map((row) => {
      const y0 = 760 + row * 120;
      return (
        <g key={row}>
          <path d={`M -700 ${y0} Q 540 ${y0 + 140} 1800 ${y0}`} fill="none" stroke="#6B4226" strokeWidth={5} />
          {Array.from({ length: 26 }).map((_, i) => {
            const x = -650 + i * 95;
            const u = (x + 700) / 2500;
            const y = y0 + 2 * u * (1 - u) * 140 * 2 * 0.5 + 4;
            const swing = Math.sin(t * 3 + i * 0.7 + row) * 8;
            return (
              <path key={i} d={`M ${x - 28} ${y} L ${x + 28} ${y} L ${x + swing} ${y + 62} Z`} fill={["#E63946", "#FFB703", "#2A9D8F", "#8E44AD", "#1D8BD1"][(i + row) % 5]} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            );
          })}
        </g>
      );
    })}
  </g>
);

export const Ground: React.FC = () => (
  <g>
    <rect x={-800} y={1420} width={2700} height={800} fill="#D9A36A" />
    <rect x={-800} y={1420} width={2700} height={26} fill="#B9854F" />
    {Array.from({ length: 14 }).map((_, r) =>
      Array.from({ length: 16 }).map((__, c) => (
        <rect key={`${r}-${c}`} x={-800 + c * 180 + (r % 2) * 90} y={1460 + r * 60} width={170} height={52} rx={6} fill="#CF9660" opacity={0.6} />
      )),
    )}
  </g>
);

export const Foreground: React.FC<{ t: number }> = ({ t }) => (
  <g style={{ filter: "blur(5px)" }}>
    {[
      [-60, 1880, "#E2442F"],
      [1140, 1900, "#3FA34D"],
    ].map(([x, y, c], i) => (
      <g key={i} transform={`translate(${x},${y}) rotate(${Math.sin(t + i) * 1.5})`}>
        {Array.from({ length: 7 }).map((_, j) => (
          <circle key={j} cx={-150 + j * 50} cy={-150 - (j % 2) * 30} r={46} fill={c as string} stroke={INK} strokeWidth={8} />
        ))}
        <path d="M -230 -140 L 230 -140 L 190 120 L -190 120 Z" fill="#B07A3E" stroke={INK} strokeWidth={10} />
        {[0, 1, 2].map((k) => (
          <line key={k} x1={-215} y1={-90 + k * 60} x2={215} y2={-90 + k * 60} stroke="#8A5A2B" strokeWidth={10} />
        ))}
      </g>
    ))}
  </g>
);
