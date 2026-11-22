// Shared bazaar world: back, middle and front layers under one parallax camera.
import React from "react";
import { BazaarBack, Bunting, CartoonDefs, Foreground, Ground } from "./cartoon";
import { Cam, layer } from "./ui";

export const GROUND = 1560;

export const World: React.FC<{ cam: Cam; t: number; dim?: number; children: React.ReactNode; fg?: boolean }> = ({ cam, t, dim, children, fg = true }) => (
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

export const walkHop = (t: number) => Math.abs(Math.sin(t * 11)) * 18;

/** Word lookup: start time of the nth occurrence of a script word. Throws if missing (never guess). */
export const makeW = (words: { word: string; start: number }[]) => (word: string, nth = 1): number => {
  const hit = words.filter((w) => w.word === word)[nth - 1];
  if (!hit) throw new Error(`"${word}" #${nth} missing from words.json`);
  return hit.start;
};

/** Music volume: about 10% while the voice speaks, 18% in gaps (smoothed over 9 frames). */
export const makeMusicVol = (words: { start: number; end: number }[], fps: number) => {
  const speaking = (s: number) => words.some((w) => s >= w.start - 0.1 && s <= w.end + 0.2);
  return (f: number) => {
    let v = 0;
    for (let k = -4; k <= 4; k++) v += speaking((f + k) / fps) ? 0.1 : 0.18;
    return v / 9;
  };
};
