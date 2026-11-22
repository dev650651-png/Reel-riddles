// Screen-space UI: chips, tiles, buttons, overlays (vignette, grain, light), camera.
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { FONT, outline } from "./fonts";
import { INK } from "./cartoon";

export const SAFE = { left: 60, right: 150, bottom: 300 }; // key text stays out of the bottom 300 px and off the right edge

const pop = (t: number, at: number, fps: number) =>
  at < -0.5 ? 1 : spring({ frame: Math.round((t - at) * fps), fps, config: { damping: 10, stiffness: 190, mass: 0.7 } });

/** A text chip: Roman capitals, Poppins 800, thick outline, pops in on its word. */
export const Chip: React.FC<{
  t: number;
  fps: number;
  at: number;
  until?: number;
  y: number;
  text: string;
  size?: number;
  bg?: string;
  color?: string;
  rot?: number;
  slam?: boolean;
  x?: number; // left-align at x instead of centring
  pulseAt?: number; // emphasis pulse on a later word
}> = ({ t, fps, at, until = 1e9, y, text, size = 84, bg = "#FFFFFF", color = INK, rot = -2, slam, x, pulseAt }) => {
  if (t < at || t >= until) return null;
  const p = pop(t, at, fps);
  const pd = pulseAt !== undefined ? t - pulseAt : -1;
  const pulse = pd >= 0 && pd < 0.4 ? 1 + 0.18 * Math.sin((pd / 0.4) * Math.PI) : 1;
  const scale = (slam ? 2.4 - 1.4 * Math.min(1, (t - at) / 0.12) : p) * pulse;
  const wob = Math.sin(t * 3.1 + y) * 1.2;
  return (
    <div style={{ position: "absolute", top: y, left: x ?? SAFE.left, right: x === undefined ? SAFE.right : undefined, display: "flex", justifyContent: x === undefined ? "center" : "flex-start", transformOrigin: "left center" }}>
      <div
        style={{
          transform: `scale(${Math.max(0, scale)}) rotate(${rot + wob}deg)`,
          background: bg,
          border: `9px solid ${INK}`,
          borderRadius: 30,
          padding: "10px 34px 4px",
          boxShadow: "0 12px 0 rgba(26,16,48,0.45)",
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1.12,
          color,
          textAlign: "center",
          whiteSpace: "pre",
          ...(color !== INK ? outline(Math.round(size / 7)) : {}),
        }}
      >
        {text.toUpperCase()}
      </div>
    </div>
  );
};

/** A-D answer tile. */
export const Tile: React.FC<{ t: number; fps: number; at: number; x: number; y: number; w: number; h: number; letter: string; text: string; color: string; wobble?: number; glow?: boolean; cross?: number }> = ({
  t, fps, at, x, y, w, h, letter, text, color, wobble = 0, glow = false, cross = 0,
}) => {
  if (t < at) return null;
  const p = pop(t, at, fps);
  const wob = Math.sin(t * 9 + x) * wobble;
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, width: w, height: h,
        transform: `scale(${p}) rotate(${wob}deg)`,
        background: glow ? "#C9F7D6" : "#FFFFFF", border: `9px solid ${INK}`, borderRadius: 30,
        boxShadow: glow ? `0 12px 0 rgba(26,16,48,0.45), 0 0 ${40 + Math.sin(t * 8) * 14}px 14px rgba(46,204,113,0.85)` : "0 12px 0 rgba(26,16,48,0.45)",
        display: "flex", alignItems: "center", gap: 18, padding: "0 20px", boxSizing: "border-box", opacity: cross > 0 ? 0.85 : 1,
      }}
    >
      {cross > 0 && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: -9, top: -9, overflow: "visible" }}>
          {[[[20, 15], [w - 20, h - 15]], [[w - 20, 15], [20, h - 15]]].map(([[x1, y1], [x2, y2]], i) => {
            const q = Math.min(1, Math.max(0, cross * 2 - i));
            return <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * q} y2={y1 + (y2 - y1) * q} stroke="#E63946" strokeWidth={22} strokeLinecap="round" />;
          })}
        </svg>
      )}
      <div style={{ width: h * 0.62, height: h * 0.62, borderRadius: "50%", background: color, border: `8px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: h * 0.36, color: "#fff", ...outline(6), flexShrink: 0 }}>
        {letter}
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: h * 0.3, color: INK, lineHeight: 1 }}>{text}</div>
    </div>
  );
};

/** Vignette + soft light + animated grain on top of everything. */
export const Finish: React.FC<{ frame: number; vignette?: number }> = ({ frame, vignette = 0.55 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(20,8,30,${vignette}) 100%)` }} />
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.08, mixBlendMode: "overlay" }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 9} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={1080} height={1920} filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);

/** World camera with parallax. f = layer depth factor (0.5 back, 1 middle, 1.3 front). */
export type Cam = { x: number; y: number; s: number; rot?: number };
export const layer = (c: Cam, f: number) => {
  const s = 1 + (c.s - 1) * f;
  return `translate(540 960) rotate(${(c.rot ?? 0) * f}) scale(${s}) translate(${-540 - c.x * f} ${-960 - c.y * f})`;
};

/** Screen shake offset for t seconds after a hit. */
export const shake = (dt: number, amp = 26): [number, number] => {
  if (dt < 0 || dt > 0.45) return [0, 0];
  const d = Math.exp(-dt * 8) * amp;
  return [Math.sin(dt * 90) * d, Math.cos(dt * 77) * d];
};

/** Follow button + tapping hand. */
export const FollowButton: React.FC<{ t: number; fps: number; at: number; tap: number; x: number; y: number }> = ({ t, fps, at, tap, x, y }) => {
  if (t < at) return null;
  const p = pop(t, at, fps);
  const dt = t - tap;
  const pressed = dt >= 0 && dt < 0.12;
  const done = dt >= 0.06;
  const handIn = Math.min(1, Math.max(0, (t - (tap - 0.5)) / 0.4));
  const hx = x + 190 + (1 - handIn) * 400;
  const hy = y + 70 + (pressed ? 14 : 0) + (dt > 0.12 ? Math.min(60, (dt - 0.12) * 200) : 0);
  return (
    <>
      <div
        style={{
          position: "absolute", left: x, top: y, width: 420, height: 130, transform: `scale(${p * (pressed ? 0.9 : 1)})`,
          background: done ? "#2ECC71" : "#FF2D55", border: `9px solid ${INK}`, borderRadius: 70, boxShadow: "0 12px 0 rgba(26,16,48,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "#fff", ...outline(9),
        }}
      >
        {done ? "FOLLOWING" : "+ FOLLOW"}
      </div>
      {handIn > 0 && (
        <svg width={220} height={260} style={{ position: "absolute", left: hx, top: hy }} viewBox="0 0 220 260">
          <path d="M 60 20 Q 60 0 80 0 Q 100 0 100 20 L 100 110 L 150 100 Q 190 100 190 140 L 185 210 Q 180 250 130 250 L 90 250 Q 50 250 40 210 L 20 150 Q 15 125 40 125 Q 55 125 60 140 Z" fill="#F1C27D" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
        </svg>
      )}
    </>
  );
};
