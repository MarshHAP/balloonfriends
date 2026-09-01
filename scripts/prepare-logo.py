#!/usr/bin/env python3
"""Turn the original Balloon Friends logo artwork into theme-ready assets.

Input:  brand/logo-original.png  (round logo, "Balloon" / "Friends" on two lines,
        white/near-white background)
Output: brand/favicon.png       (512x512, original round mark)
        brand/logo-one-line.png (transparent background, both words on one line)

Usage: python3 scripts/prepare-logo.py
"""
from PIL import Image

WHITE_THRESHOLD = 242  # pixels with all channels above this become transparent
ROW_GAP_MIN = 10       # min blank rows separating the two words
SPACE_GAP = 60         # px gap between the two words on the composed line


def strip_white(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r >= WHITE_THRESHOLD and g >= WHITE_THRESHOLD and b >= WHITE_THRESHOLD:
                px[x, y] = (255, 255, 255, 0)
    return im


def row_bands(im: Image.Image):
    """Find horizontal bands that contain opaque pixels."""
    w, h = im.size
    alpha = im.split()[3]
    data = alpha.load()
    occupied = []
    for y in range(h):
        row_has = any(data[x, y] > 20 for x in range(0, w, 2))
        occupied.append(row_has)
    bands, start = [], None
    blank_run = 0
    for y, has in enumerate(occupied):
        if has:
            if start is None:
                start = y
            blank_run = 0
        else:
            if start is not None:
                blank_run += 1
                if blank_run >= ROW_GAP_MIN:
                    bands.append((start, y - blank_run))
                    start = None
    if start is not None:
        bands.append((start, len(occupied) - 1))
    return bands


def trim(im: Image.Image) -> Image.Image:
    return im.crop(im.getbbox())


def main():
    original = Image.open("brand/logo-original.png")

    # favicon: keep the round mark as-is
    fav = original.convert("RGBA").copy()
    fav.thumbnail((512, 512))
    canvas = Image.new("RGBA", (512, 512), (255, 255, 255, 0))
    canvas.paste(fav, ((512 - fav.width) // 2, (512 - fav.height) // 2), fav)
    canvas.save("brand/favicon.png")

    # one-line logo: strip background, split word rows, compose horizontally
    cut = strip_white(original)
    bands = row_bands(cut)
    if len(bands) < 2:
        raise SystemExit(f"expected 2 text rows, found {len(bands)} — adjust thresholds")
    words = [trim(cut.crop((0, top, cut.width, bottom + 1))) for top, bottom in bands[:2]]
    height = max(w.height for w in words)
    total_w = sum(w.width for w in words) + SPACE_GAP
    line = Image.new("RGBA", (total_w, height), (255, 255, 255, 0))
    x = 0
    for w in words:
        line.paste(w, (x, (height - w.height) // 2), w)
        x += w.width + SPACE_GAP
    line.save("brand/logo-one-line.png")
    print(f"favicon.png 512x512; logo-one-line.png {line.width}x{line.height}")


if __name__ == "__main__":
    main()
