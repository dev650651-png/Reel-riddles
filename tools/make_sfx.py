#!/usr/bin/env python3
"""Generates the starter sound pack (no downloads) into public/sfx and public/music/loop.wav."""
import os, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")


def t(d):
    return np.arange(int(SR * d)) / SR


def env(n, a=0.005, r=None, curve=4.0):
    """Fast attack, exponential decay."""
    x = np.linspace(0, 1, n)
    e = np.exp(-curve * x)
    na = max(1, int(SR * a))
    e[:na] *= np.linspace(0, 1, na)
    return e


def sweep(f0, f1, d, shape="sin"):
    tt = t(d)
    f = f0 * (f1 / f0) ** (tt / d)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) if shape == "sin" else np.sign(np.sin(ph))


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x):
        s = (1 - a) * v + a * s; y[i] = s
    return y


def bandnoise(d, f0, f1):
    """Noise through a moving one-pole band (lowpass minus lower lowpass)."""
    n = int(SR * d); x = rng.standard_normal(n)
    cut = np.geomspace(f0, f1, n)
    y = np.empty(n); s1 = s2 = 0.0
    for i in range(n):
        a1 = np.exp(-2 * np.pi * cut[i] / SR); a2 = np.exp(-2 * np.pi * cut[i] * 0.35 / SR)
        s1 = (1 - a1) * x[i] + a1 * s1; s2 = (1 - a2) * x[i] + a2 * s2
        y[i] = s1 - s2
    return y


def norm(x, peak=0.89):
    x = x - np.mean(x)
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def save(path, x, stereo=False):
    x = np.clip(x, -1, 1)
    data = np.stack([x, x], 1) if x.ndim == 1 and stereo else x
    ch = 1 if data.ndim == 1 else data.shape[1]
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, "wb") as w:
        w.setnchannels(ch); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((data * 32767).astype("<i2").tobytes())
    print(f"{os.path.relpath(path, ROOT)}: {len(data)/SR:.2f}s")


def fade(x, fi=0.003, fo=0.01):
    a, b = int(SR * fi), int(SR * fo)
    x = x.copy(); x[:a] *= np.linspace(0, 1, a); x[-b:] *= np.linspace(1, 0, b); return x


sfx = {}
# whoosh: band-noise sweep up then down with a swell envelope
d = 0.6; n = int(SR * d)
w = bandnoise(d, 300, 4000) * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
sfx["whoosh"] = w
# pop: short pitch-drop sine blip
sfx["pop"] = sweep(900, 250, 0.12) * env(int(SR * 0.12), 0.001, curve=6)
# ding: bell partials
tt = t(1.4)
sfx["ding"] = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * k)
                  for f, a, k in [(1318, 1, 3), (2637, .4, 5), (3950, .2, 8), (1976, .25, 4)])
# tick: tiny high click
tt = t(0.04); sfx["tick"] = np.sin(2 * np.pi * 3200 * tt) * np.exp(-tt * 180)
# click: noise burst + body
tt = t(0.05); sfx["click"] = (rng.standard_normal(len(tt)) * 0.5 + np.sin(2 * np.pi * 1800 * tt)) * np.exp(-tt * 140)
# thud: low sine drop + muffled noise
d = 0.45; n = int(SR * d)
sfx["thud"] = sweep(120, 40, d) * env(n, 0.001, curve=7) + lowpass(rng.standard_normal(n), 300) * env(n, 0.001, curve=14) * 2
# splash: noise burst decaying, with bright droplets
d = 0.9; n = int(SR * d); x = bandnoise(d, 5000, 900) * env(n, 0.002, curve=5)
for _ in range(14):
    s = rng.integers(0, n - 4000); f = rng.uniform(1500, 4000); dd = t(0.05)
    x[s:s + len(dd)] += 0.25 * sweep(f, f * 1.8, 0.05) * np.exp(-dd * 60)
sfx["splash"] = x
# sparkle: cascade of rising high pings
d = 1.0; x = np.zeros(int(SR * d))
for i, f in enumerate([2093, 2637, 3136, 3520, 4186, 3136, 4699, 5274]):
    s = int(i * 0.085 * SR); tt = t(0.35)
    x[s:s + len(tt)] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 12) * (0.6 + 0.4 * rng.random())
sfx["sparkle"] = x
# buzzer: wrong-answer square buzz
tt = t(0.7)
b = np.sign(np.sin(2 * np.pi * 110 * tt)) * 0.5 + np.sign(np.sin(2 * np.pi * 116 * tt)) * 0.5
sfx["buzzer"] = lowpass(b, 2500) * np.minimum(1, (0.7 - tt) * 20)
# slam: big hit, low boom + crack + short reverb tail
d = 0.9; n = int(SR * d)
boom = sweep(90, 35, d) * env(n, 0.001, curve=5)
crack = rng.standard_normal(n) * env(n, 0.0005, curve=40)
tail = lowpass(rng.standard_normal(n), 1200) * env(n, 0.01, curve=6) * 0.6
sfx["slam"] = boom * 1.2 + crack * 0.7 + tail

for name, x in sfx.items():
    save(os.path.join(ROOT, "sfx", f"{name}.wav"), fade(norm(x)))

# 8 s soft music loop: 120 BPM, 4 bars, Cmaj7-Am7-Fmaj7-G6 pads + soft pluck + light hat. Loops seamlessly.
d = 8.0; n = int(SR * d); tt = t(d)
L = np.zeros(n); R = np.zeros(n)
chords = [[261.63, 329.63, 392.0, 493.88], [220.0, 261.63, 329.63, 392.0],
          [174.61, 220.0, 261.63, 329.63], [196.0, 246.94, 293.66, 329.63]]
bar = n // 4
for i, ch in enumerate(chords):
    s = i * bar; seg = t(2.0)
    pad_env = np.minimum(1, seg / 0.25) * np.minimum(1, (2.0 - seg) / 0.25)
    for j, f in enumerate(ch):
        tone = np.sin(2 * np.pi * f * seg) + 0.3 * np.sin(2 * np.pi * 2 * f * seg + 0.5)
        L[s:s + bar] += tone * pad_env * 0.12 * (1.1 if j % 2 else 0.9)
        R[s:s + bar] += tone * pad_env * 0.12 * (0.9 if j % 2 else 1.1)
    # pluck arpeggio, 8th notes
    for k in range(8):
        f = ch[[0, 2, 1, 3, 2, 0, 3, 1][k]] * 2; ps = s + k * bar // 8; pt = t(0.25)
        p = np.sin(2 * np.pi * f * pt) * np.exp(-pt * 14) * 0.18
        e = min(n, ps + len(p)); L[ps:e] += p[:e - ps] * (1.2 if k % 2 else 0.8); R[ps:e] += p[:e - ps] * (0.8 if k % 2 else 1.2)
    # bass on beat 1 and 3
    for k in (0, 2):
        bs = s + k * bar // 4; bt = t(0.45)
        bb = np.sin(2 * np.pi * ch[0] / 2 * bt) * np.exp(-bt * 5) * 0.35
        L[bs:bs + len(bb)] += bb; R[bs:bs + len(bb)] += bb
# soft off-beat hats
for k in range(16):
    hs = int((k + 0.5) * SR * 0.5); ht = t(0.04)
    h = lowpass(rng.standard_normal(len(ht)), 9000) - lowpass(rng.standard_normal(len(ht)), 5000)
    h = h * np.exp(-ht * 120) * 0.05
    e = min(n, hs + len(h)); L[hs:e] += h[:e - hs]; R[hs:e] += h[:e - hs]
mix = np.stack([L, R], 1)
mix = mix / np.max(np.abs(mix)) * 0.5   # soft: peak about -6 dBFS
save(os.path.join(ROOT, "music", "loop.wav"), mix)
