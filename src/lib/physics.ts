// Small physics + easing helpers. Times in seconds, distances in px.
export const GRAVITY = 5200;

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const smooth = (x: number) => {
  const c = clamp(x);
  return c * c * (3 - 2 * c);
};
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

/** Keyframes [[time, value], ...] with smoothstep between them. */
export const keys = (t: number, k: [number, number][]): number => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (t <= k[i][0]) {
      const [t0, v0] = k[i - 1];
      const [t1, v1] = k[i];
      return lerp(v0, v1, smooth((t - t0) / (t1 - t0)));
    }
  }
  return k[k.length - 1][1];
};

/** Seconds to fall from height h. */
export const fallTime = (h: number, g = GRAVITY) => Math.sqrt((2 * h) / g);

/** Height above ground of an object released from height h at t = 0, bouncing with restitution e. */
export const bounceHeight = (t: number, h: number, e = 0.35, g = GRAVITY): number => {
  if (t <= 0) return h;
  const t0 = fallTime(h, g);
  if (t < t0) return h - 0.5 * g * t * t;
  let v = g * t0 * e;
  let tt = t - t0;
  for (let i = 0; i < 4 && v > 80; i++) {
    const flight = (2 * v) / g;
    if (tt < flight) return v * tt - 0.5 * g * tt * tt;
    tt -= flight;
    v *= e;
  }
  return 0;
};

/** Squash and stretch: stretched while falling (dt < 0), damped squash wobble after impact. [sx, sy] */
export const squash = (dt: number, amount = 0.28): [number, number] => {
  if (dt < 0) return [0.93, 1.09];
  const a = amount * Math.exp(-dt * 9) * Math.cos(dt * 30);
  return [1 + a * 0.8, 1 - a];
};

/** Deterministic pseudo random in [0, 1). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
