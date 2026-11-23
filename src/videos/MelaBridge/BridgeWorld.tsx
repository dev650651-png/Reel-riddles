// MelaBridge set: near bank with Kaka's chowki, an old rope bridge over the river, the mela on the far bank.
import React from "react";
import { CartoonDefs, INK, SW } from "../../lib/cartoon";
import { rand } from "../../lib/physics";
import { Cam, layer } from "../../lib/ui";

export const B0 = 220; // bridge start (near bank, Kaka's side)
export const B1 = 1520; // bridge end (mela side)
export const BY = 1200; // bank / post height
const SAG = 110;

export type Load = { x: number; d: number }; // weight on the deck: dip d px at x

/** Deck height at x, with sag and dips under people. */
export const deckY = (x: number, loads: Load[] = [], t = 0) => {
  if (x <= B0 || x >= B1) return BY;
  const u = (x - B0) / (B1 - B0);
  const env = 4 * u * (1 - u);
  const dip = loads.reduce((a, l) => a + l.d * Math.exp(-(((x - l.x) / 170) ** 2)), 0);
  return BY + SAG * env + (dip + Math.sin(t * 2.2 + u * 6) * 4) * env;
};

const Bridge: React.FC<{ t: number; loads: Load[]; broken?: { x: number; dt: number } }> = ({ t, loads, broken }) => {
  const planks: React.ReactNode[] = [];
  for (let x = B0 + 10; x < B1; x += 30) {
    const y = deckY(x, loads, t);
    const slope = (deckY(x + 4, loads, t) - deckY(x - 4, loads, t)) / 8;
    let dx = 0, dy = 0, rot = Math.atan(slope) * (180 / Math.PI), op = 1;
    if (broken && Math.abs(x - broken.x) < 50 && broken.dt > 0) {
      const k = (x * 7) % 3;
      dy = 0.5 * 3200 * broken.dt * broken.dt;
      dx = (k - 1) * 120 * broken.dt;
      rot += broken.dt * (k - 1 || 1) * 400;
      op = Math.max(0, 1 - broken.dt / 1.2);
    }
    planks.push(<rect key={x} x={x - 13 + dx} y={y - 8 + dy} width={26} height={18} rx={4} fill={(x / 30) % 2 < 1 ? "#B07A3E" : "#9C6A33"} stroke={INK} strokeWidth={5} transform={`rotate(${rot} ${x + dx} ${y + dy})`} opacity={op} />);
  }
  const rail = (off: number) => {
    let d = "";
    for (let x = B0; x <= B1; x += 20) d += `${x === B0 ? "M" : "L"} ${x} ${deckY(x, loads, t) - off} `;
    return d;
  };
  const verticals = [];
  for (let x = B0 + 60; x < B1; x += 80) verticals.push(<line key={x} x1={x} y1={deckY(x, loads, t) - 150} x2={x} y2={deckY(x, loads, t)} stroke="#7A5530" strokeWidth={5} />);
  return (
    <g>
      <path d={rail(150)} fill="none" stroke="#6B4A2A" strokeWidth={9} />
      {verticals}
      <path d={rail(0)} fill="none" stroke="#6B4A2A" strokeWidth={8} />
      {planks}
      <path d={rail(160)} fill="none" stroke={INK} strokeWidth={4} opacity={0.4} />
      {[B0, B1].map((px) => (
        <g key={px}>
          <rect x={px - 18} y={BY - 260} width={36} height={300} rx={10} fill="#8B5A2B" stroke={INK} strokeWidth={SW} />
          <circle cx={px} cy={BY - 262} r={22} fill="#A66B33" stroke={INK} strokeWidth={SW} />
        </g>
      ))}
    </g>
  );
};

const River: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-1500} y={1330} width={4500} height={1400} fill="#3FA7E0" />
    <rect x={-1500} y={1330} width={4500} height={60} fill="#69C0EE" />
    {Array.from({ length: 9 }).map((_, r) => {
      const y = 1430 + r * 70;
      const off = ((t * (40 + r * 8)) % 240) - 240;
      let d = "";
      for (let x = -1500 + off; x < 3000; x += 240) d += `M ${x} ${y} q 60 -18 120 0 `;
      return <path key={r} d={d} fill="none" stroke="#BEE6FA" strokeWidth={6} strokeLinecap="round" opacity={0.7} />;
    })}
    {Array.from({ length: 14 }).map((_, i) => {
      const tw = Math.max(0, Math.sin(t * 3 + i * 1.7));
      return <circle key={i} cx={-200 + rand(i) * 2200} cy={1400 + rand(i + 3) * 500} r={6 * tw} fill="#fff" />;
    })}
  </g>
);

const Bank: React.FC<{ side: "near" | "far" }> = ({ side }) => {
  const d = side === "near"
    ? `M -1500 ${BY} L ${B0 + 20} ${BY} L ${B0 + 90} 1600 L -1500 1600 Z`
    : `M ${B1 - 20} ${BY} L 3200 ${BY} L 3200 1600 L ${B1 - 90} 1600 Z`;
  return (
    <g>
      <path d={d} fill="#B07A4A" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d={side === "near" ? `M -1500 ${BY - 10} L ${B0 + 25} ${BY - 10} L ${B0 + 30} ${BY + 30} L -1500 ${BY + 30} Z` : `M ${B1 - 25} ${BY - 10} L 3200 ${BY - 10} L 3200 ${BY + 30} L ${B1 - 30} ${BY + 30} Z`} fill="#7CC36E" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {Array.from({ length: 8 }).map((_, i) => (
        <circle key={i} cx={(side === "near" ? -1300 : B1 + 60) + i * 170} cy={BY + 120 + (i % 3) * 70} r={18} fill="#946238" />
      ))}
    </g>
  );
};

export const Chowki: React.FC<{ t: number; door: number; clock: number }> = ({ door, clock }) => (
  // door: 0 closed .. 1 open; clock: minute hand angle in degrees
  <g transform={`translate(-40,${BY})`}>
    <rect x={-150} y={-300} width={300} height={300} fill="#EAD7A8" stroke={INK} strokeWidth={SW} />
    <path d="M -185 -290 L 185 -290 L 150 -380 L -150 -380 Z" fill="#9AA3AD" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    {[-120, -70, -20, 30, 80, 130].map((x) => <line key={x} x1={x} y1={-375} x2={x * 1.15} y2={-293} stroke="#7D8690" strokeWidth={5} />)}
    <rect x={20} y={-230} width={110} height={230} fill="#3B2A22" stroke={INK} strokeWidth={SW} />
    <path d={`M 20 -230 L ${20 + 110 * (1 - door)} ${-230 - door * 14} L ${20 + 110 * (1 - door)} ${door * 14} L 20 0 Z`} fill="#8B5A2B" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <rect x={-120} y={-210} width={100} height={80} fill="#7FC8F8" stroke={INK} strokeWidth={SW} />
    <line x1={-70} y1={-210} x2={-70} y2={-130} stroke={INK} strokeWidth={6} />
    <g transform="translate(-70,-60)">
      <circle r={42} fill="#fff" stroke={INK} strokeWidth={SW} />
      {[0, 90, 180, 270].map((a) => <line key={a} x1={0} y1={-32} x2={0} y2={-24} stroke={INK} strokeWidth={5} transform={`rotate(${a})`} />)}
      <line x1={0} y1={0} x2={0} y2={-30} stroke="#E63946" strokeWidth={6} strokeLinecap="round" transform={`rotate(${clock})`} />
      <line x1={0} y1={0} x2={18} y2={0} stroke={INK} strokeWidth={7} strokeLinecap="round" />
    </g>
    <rect x={-110} y={-345} width={220} height={48} rx={8} fill="#FFE14D" stroke={INK} strokeWidth={6} />
    <text x={0} y={-309} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={34} fill={INK}>CHOWKI</text>
  </g>
);

export const Barrier: React.FC<{ down: number }> = ({ down }) => (
  <g transform={`translate(${B0 - 70},${BY})`}>
    <rect x={-14} y={-170} width={28} height={170} fill="#5A5266" stroke={INK} strokeWidth={6} />
    <g transform={`rotate(${-80 * (1 - down)} 0 -150)`}>
      <rect x={0} y={-166} width={300} height={32} rx={10} fill="#fff" stroke={INK} strokeWidth={6} />
      {[0, 1, 2].map((i) => <rect key={i} x={30 + i * 90} y={-166} width={45} height={32} fill="#E63946" />)}
      <rect x={0} y={-166} width={300} height={32} rx={10} fill="none" stroke={INK} strokeWidth={6} />
    </g>
  </g>
);

const Mela: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {/* Ferris wheel */}
    <g transform={`translate(2050,${BY - 470})`}>
      <path d="M -170 470 L 0 0 L 170 470" fill="none" stroke="#5A5266" strokeWidth={22} />
      <g transform={`rotate(${t * 14})`}>
        <circle r={330} fill="none" stroke="#E63946" strokeWidth={14} />
        {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={0} y1={0} x2={0} y2={-330} stroke="#FFB703" strokeWidth={8} transform={`rotate(${i * 36})`} />)}
      </g>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = ((i * 36 + t * 14) * Math.PI) / 180;
        return <rect key={i} x={Math.sin(a) * 330 - 32} y={-Math.cos(a) * 330 - 8} width={64} height={52} rx={12} fill={["#2A9D8F", "#8E44AD", "#1D8BD1", "#FB8500"][i % 4]} stroke={INK} strokeWidth={6} />;
      })}
      <circle r={30} fill="#FFE14D" stroke={INK} strokeWidth={8} />
    </g>
    {/* tents */}
    {[1680, 1880, 2280, 2480].map((x, i) => (
      <g key={x} transform={`translate(${x},${BY})`}>
        {Array.from({ length: 4 }).map((_, j) => (
          <path key={j} d={`M ${-110 + j * 55} 0 L ${-55 + j * 55} 0 L 0 -200 Z`} fill={j % 2 ? ["#E63946", "#1D8BD1", "#8E44AD", "#2A9D8F"][i] : "#FFF1D6"} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        ))}
        <line x1={0} y1={-200} x2={0} y2={-250} stroke={INK} strokeWidth={6} />
        <path d={`M 0 -250 L ${40 + Math.sin(t * 5 + i) * 6} -236 L 0 -222 Z`} fill="#FFB703" stroke={INK} strokeWidth={4} />
      </g>
    ))}
    {/* balloons */}
    {Array.from({ length: 6 }).map((_, i) => {
      const x = 1650 + i * 140;
      const y = BY - 380 + Math.sin(t * 2 + i) * 16;
      return (
        <g key={i}>
          <line x1={x} y1={y + 46} x2={1820 + (i % 3) * 40} y2={BY - 60} stroke={INK} strokeWidth={3} />
          <ellipse cx={x} cy={y} rx={38} ry={46} fill={["#E63946", "#FFB703", "#2A9D8F", "#8E44AD", "#1D8BD1", "#FB8500"][i]} stroke={INK} strokeWidth={6} />
        </g>
      );
    })}
  </g>
);

const Sky: React.FC<{ t: number; dim?: number }> = ({ t, dim = 0 }) => (
  <g>
    <rect x={-2000} y={-1000} width={6000} height={3400} fill="#9FDCFF" />
    <rect x={-2000} y={500} width={6000} height={800} fill="#CDEEFF" />
    <circle cx={300} cy={300} r={110} fill="#FFE58A" />
    <circle cx={300} cy={300} r={160} fill="#FFE58A" opacity={0.3} />
    {[0, 1, 2].map((i) => {
      const x = ((i * 700 + t * 25) % 2600) - 600;
      return (
        <g key={i} transform={`translate(${x},${220 + i * 140})`}>
          {[[-70, 0, 60], [0, -25, 75], [75, 0, 58]].map(([cx, cy, r], j) => <circle key={j} cx={cx} cy={cy} r={r} fill="#fff" />)}
        </g>
      );
    })}
    <path d="M -2000 1150 Q -1200 820 -400 1080 Q 400 760 1200 1060 Q 2000 800 2800 1080 Q 3400 900 4000 1150 Z" fill="#8FCB7A" />
    <path d="M -2000 1200 Q -1000 1000 0 1150 Q 1000 960 2000 1140 Q 3000 1000 4000 1200 Z" fill="#6FB85E" />
    {dim > 0 && <rect x={-2000} y={-1000} width={6000} height={3400} fill="#1a1030" opacity={dim} />}
  </g>
);

const Reeds: React.FC<{ t: number }> = ({ t }) => (
  <g style={{ filter: "blur(5px)" }}>
    {Array.from({ length: 16 }).map((_, i) => {
      const x = (i < 8 ? -200 : 1380) + (i % 8) * 50;
      const sw = Math.sin(t * 2 + i) * 10;
      return <path key={i} d={`M ${x} 2100 Q ${x + sw} 1900 ${x + sw * 2 + 10} ${1760 + (i % 3) * 40}`} fill="none" stroke={i % 2 ? "#4F9A3F" : "#6FB85E"} strokeWidth={22} strokeLinecap="round" />;
    })}
  </g>
);

export const BridgeWorld: React.FC<{ cam: Cam; t: number; loads?: Load[]; broken?: { x: number; dt: number }; dim?: number; door?: number; clock?: number; barrier?: number; children?: React.ReactNode; front?: React.ReactNode }> = ({
  cam, t, loads = [], broken, dim = 0, door = 0, clock = 0, barrier = 0, children, front,
}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <CartoonDefs />
    <g transform={layer(cam, 0.5)}>
      <Sky t={t} dim={dim} />
    </g>
    <g transform={layer(cam, 1)}>
      <Mela t={t} />
      <River t={t} />
      <Bank side="near" />
      <Bank side="far" />
      <Chowki t={t} door={door} clock={clock} />
      {children}
      <Bridge t={t} loads={loads} broken={broken} />
      <Barrier down={barrier} />
      {front}
      {dim > 0 && <rect x={-2000} y={-1000} width={6000} height={3400} fill="#1a1030" opacity={dim * 0.6} />}
    </g>
    <g transform={layer(cam, 1.3)}>
      <Reeds t={t} />
    </g>
  </svg>
);
