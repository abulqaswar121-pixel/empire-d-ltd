#!/usr/bin/env python3
"""
Empire D Ltd — image pipeline.

    python3 tools/images.py        (or: npm run images)

Reads full-size source photographs from  src/images/*.jpg
and produces, in src/assets/img/:

    <name>-<width>.jpg / .webp    responsive variants (480 → 1600px)
    <name>-og.jpg                1200×630 social sharing card
    logo-512.png                 square logo for schema.org
    manifest.json                image sizes used by build.js

Brand icons (favicon.svg, favicon.ico, apple-touch-icon.png) are written to
src/assets/brand/.

Everything here is PLACEHOLDER imagery — drop your own photographs into
src/images/ using the same file names and re-run to regenerate.
"""

import json
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC_IMAGES = ROOT / "src" / "images"
OUT = ROOT / "src" / "assets" / "img"
BRAND = ROOT / "src" / "assets" / "brand"
FONT_PATH = ROOT / "tools" / "fonts" / "Manrope.ttf"

OUT.mkdir(parents=True, exist_ok=True)
BRAND.mkdir(parents=True, exist_ok=True)

WIDTHS = [480, 768, 1080, 1440, 1600]
WEBP_Q, JPG_Q = 80, 82

NAVY = (6, 61, 80)  # brand teal-dark #063D50
WHITE = (255, 255, 255)


# ── read site.config.js through node ────────────────────────────────────────
def load_config():
    raw = subprocess.check_output(
        ["node", "-e", "console.log(JSON.stringify(require('./site.config.js')))"], cwd=ROOT
    )
    return json.loads(raw)


CFG = load_config()
ACCENT = CFG["brand"]["accent"]
ACCENT_RGB = tuple(int(ACCENT.lstrip("#")[i : i + 2], 16) for i in (0, 2, 4))
COMPANY = CFG["company"]["name"].upper()
SERVICES = "EDUCATION   ·   LOGISTICS   ·   GENERAL PROCUREMENT"

# Headline used on each page's social card.
OG_HEADS = {
    "placeholder-hero-education": "Education first.\nDelivered everywhere.",
    "placeholder-about-team": "Built on education.\nTrusted nationwide.",
    "placeholder-elearning": "Online learning,\nwithout the friction.",
    "placeholder-logistics": "Logistics you can\nplan around.",
    "placeholder-procurement": "Procurement that\nkeeps you moving.",
    "placeholder-contact": "Let's talk about\nyour next project.",
    "placeholder-procurement-meeting": "Procurement you can\ndefend.",
}


def font(size, weight=800):
    f = ImageFont.truetype(str(FONT_PATH), size)
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    return f


def cover_crop(im: Image.Image, w: int, h: int, focus_x=0.5, focus_y=0.5) -> Image.Image:
    """Resize + centre-crop to exactly w×h."""
    im = im.convert("RGB")
    scale = max(w / im.width, h / im.height)
    nw, nh = round(im.width * scale), round(im.height * scale)
    im = im.resize((nw, nh), Image.LANCZOS)
    x = round((nw - w) * focus_x)
    y = round((nh - h) * focus_y)
    return im.crop((x, y, x + w, y + h))


def hex_to_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


# ── responsive variants ─────────────────────────────────────────────────────
def variants(path: Path):
    im = Image.open(path).convert("RGB")
    name = path.stem
    widths = [w for w in WIDTHS if w <= im.width]
    if not widths:
        widths = [im.width]

    for w in widths:
        h = round(im.height * w / im.width)
        out = im.resize((w, h), Image.LANCZOS)
        out.save(OUT / f"{name}-{w}.jpg", "JPEG", quality=JPG_Q, optimize=True, progressive=True)
        out.save(OUT / f"{name}-{w}.webp", "WEBP", quality=WEBP_Q, method=6)

    return {"width": im.width, "height": im.height, "variants": widths}


# ── social sharing card ─────────────────────────────────────────────────────
def wrap(draw, text, fnt, max_w):
    lines = []
    for para in text.split("\n"):
        words, line = para.split(), ""
        for word in words:
            trial = f"{line} {word}".strip()
            if draw.textlength(trial, font=fnt) <= max_w or not line:
                line = trial
            else:
                lines.append(line)
                line = word
        lines.append(line)
    return lines


def og_card(path: Path):
    name = path.stem
    W, H = 1200, 630
    im = Image.open(path).convert("RGB")

    # Keep faces/subjects visible: bias the crop towards the upper-left.
    bg = cover_crop(im, W, H, focus_x=0.42, focus_y=0.45)
    bg = bg.filter(ImageFilter.GaussianBlur(0.4))

    # Navy gradient scrim, strongest on the left where the text sits.
    scrim = Image.new("RGB", (W, H), NAVY)
    mask = Image.new("L", (W, H))
    md = ImageDraw.Draw(mask)
    for x in range(W):
        t = x / (W - 1)
        # 96% opaque at the left edge → 8% at the right edge (eased)
        alpha = int(247 * max(0.0, (1 - t) ** 1.5) + 18)
        md.line([(x, 0), (x, H)], fill=min(alpha, 255))
    bg = Image.composite(scrim, bg, mask)

    # Accent hairline at the bottom.
    d = ImageDraw.Draw(bg)
    d.rectangle([0, H - 6, W, H], fill=ACCENT_RGB)

    # Brand lockup, top-left.
    d.rounded_rectangle([72, 64, 124, 116], radius=13, fill=ACCENT_RGB)
    mark_font = font(34, 800)
    d.text((98, 90), "E", font=mark_font, fill=NAVY, anchor="mm")

    d.text((140, 79), COMPANY, font=font(22, 700), fill=WHITE)
    d.text((140, 105), SERVICES, font=font(11, 600), fill=(255, 255, 255, 160))

    # Headline.
    head = OG_HEADS.get(name, "Empire D Ltd")
    lines = wrap(d, head, font(66, 800), 900)
    y = 300 - (len(lines) - 1) * 36
    for line in lines:
        d.text((72, y), line, font=font(66, 800), fill=WHITE)
        y += 80

    # Footer line.
    d.text(
        (72, 470),
        "empiredltd.com  ·  Nigeria",
        font=font(20, 600),
        fill=hex_to_rgb("#C9D4E4"),
    )

    bg.save(OUT / f"{name}-og.jpg", "JPEG", quality=88, optimize=True, progressive=True)


# ── brand icons ─────────────────────────────────────────────────────────────
E_STEM = (20, 17, 26, 48)   # x0, y0, x1, y1 in a 64 unit grid
E_BARS = [(20, 17, 44, 23), (20, 29, 38, 35), (20, 42, 44, 48)]
ACCENT_DOT = (47, 42, 53, 48)


def draw_mark(size: int, radius_ratio=0.235, background=True) -> Image.Image:
    """Teal-dark rounded square with a geometric 'E' and an accent full stop."""
    scale = size / 64
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if background:
        d.rounded_rectangle([0, 0, size - 1, size - 1], radius=round(size * radius_ratio), fill=NAVY)

    def box(b):
        return [round(v * scale) for v in b]

    for bar in E_BARS:
        d.rectangle(box(bar), fill=WHITE)
    d.rectangle(box(E_STEM), fill=WHITE)
    d.rectangle(box(ACCENT_DOT), fill=ACCENT_RGB)

    # Anti-alias by rendering large and downsizing when asked for small icons.
    return im


def brand_assets():
    """favicon.svg + PNG/ICO fallbacks."""
    hexa = ACCENT
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="{CFG['company']['name']}">
  <rect width="64" height="64" rx="15" fill="#063D50"/>
  <path d="M20 17h24v6H27v6h11v6H27v7h17v6H20z" fill="#FFFFFF"/>
  <rect x="47" y="42" width="6" height="6" fill="{hexa}"/>
</svg>
"""
    (BRAND / "favicon.svg").write_text(svg, encoding="utf-8")

    big = draw_mark(1024)
    big.resize((180, 180), Image.LANCZOS).save(BRAND / "apple-touch-icon.png")
    big.resize((32, 32), Image.LANCZOS).save(
        BRAND / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)]
    )
    big.resize((512, 512), Image.LANCZOS).save(OUT / "logo-512.png")
    big.resize((192, 192), Image.LANCZOS).save(BRAND / "logo-192.png")

    # Standalone mark (transparent) for possible use in documents.
    draw_mark(1024, background=False).resize((512, 512), Image.LANCZOS).save(BRAND / "mark.png")


def main():
    sources = sorted(SRC_IMAGES.glob("*.jpg")) + sorted(SRC_IMAGES.glob("*.jpeg"))
    if not sources:
        raise SystemExit("No source images found in src/images/")

    manifest = {}
    for path in sources:
        print(f"  · {path.name}")
        manifest[path.stem] = variants(path)
        og_card(path)

    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    brand_assets()

    total = sum(f.stat().st_size for f in OUT.iterdir() if f.is_file())
    print(f"\n  {len(sources)} images → {len(list(OUT.glob('*.webp')))} WebP + {len(list(OUT.glob('*.jpg')))} JPG")
    print(f"  assets/img total: {total / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
