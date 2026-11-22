#!/usr/bin/env python3
"""Writes a transparent watermark PNG from your @handle (Poppins 800, white with dark outline).

    python3 tools/make_watermark.py @yourhandle [--out public/watermark.png] [--size 44]

The PNG is fully opaque; tools/finish applies the 30% opacity when overlaying.
"""
import argparse, os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ap = argparse.ArgumentParser()
ap.add_argument("handle")
ap.add_argument("--out", default=os.path.join(ROOT, "public", "watermark.png"))
ap.add_argument("--size", type=int, default=44)
a = ap.parse_args()

text = a.handle if a.handle.startswith("@") else "@" + a.handle
font = ImageFont.truetype(os.path.join(ROOT, "public", "fonts", "Poppins-800.woff2"), a.size)
stroke = max(2, a.size // 10)
probe = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
l, t, r, b = probe.textbbox((0, 0), text, font=font, stroke_width=stroke)
pad = stroke * 2
img = Image.new("RGBA", (r - l + pad * 2, b - t + pad * 2), (0, 0, 0, 0))
ImageDraw.Draw(img).text((pad - l, pad - t), text, font=font, fill=(255, 255, 255, 255),
                         stroke_width=stroke, stroke_fill=(20, 12, 40, 255))
os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
img.save(a.out)
print(f"{a.out}: {img.size[0]}x{img.size[1]} '{text}'")
