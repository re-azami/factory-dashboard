#!/usr/bin/env python3
"""
Generate placeholder PWA icons for the Factory Dashboard SPA.

Output:
    frontend-spa/src/assets/icons/
      icon-72x72.png, icon-96x96.png, icon-128x128.png, icon-144x144.png,
      icon-152x152.png, icon-192x192.png, icon-384x384.png, icon-512x512.png
      icon-512x512-maskable.png (with extra safe-zone padding for Android
        adaptive icons)

Design
------
Solid background in the project primary color rgb(56, 77, 84) with a
centered white "factory" silhouette drawn with PIL primitives. The shape
is sized so that 15 percent (any) or 20 percent (maskable) of every edge
stays empty, keeping the foreground inside the safe zone that Android's
adaptive-icon mask carves out.

Usage
-----
Run from the repo root or any working directory:

    python3 frontend-spa/scripts/generate_pwa_icons.py

The script is re-runnable: it overwrites existing PNGs each time. It
takes no arguments so the build is deterministic.

UI-002 (PWA support). Replace with branded artwork in UI-005.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

PRIMARY_COLOR = (56, 77, 84)   # --primaryColor
FOREGROUND = (255, 255, 255)   # white factory glyph

# Standard PWA sizes (square, "any" purpose).
SIZES_ANY = [72, 96, 128, 144, 152, 192, 384, 512]

# Maskable variant: same 512x512 but with bigger safe-zone padding so
# Android adaptive-icon masks (typically a circle inscribed in the
# square, ~80 percent of the edge) don't crop the design.
MASKABLE_SIZE = 512
MASKABLE_PADDING_RATIO = 0.20    # 20 percent on every edge
ANY_PADDING_RATIO = 0.15         # 15 percent on every edge


def _draw_factory(image: Image.Image, padding_ratio: float) -> None:
    """Draw a stylised factory silhouette centred on the image.

    The design is a flat-color silhouette built from rectangles only,
    so it scales cleanly from 72px to 512px without anti-aliasing
    artefacts. Three chimneys on the left side, a tall main building,
    a slightly shorter wing on the right.
    """
    draw = ImageDraw.Draw(image)
    w, h = image.size

    # Safe-zone bounding box for the foreground.
    pad_x = int(w * padding_ratio)
    pad_y = int(h * padding_ratio)
    x0, y0 = pad_x, pad_y
    x1, y1 = w - pad_x, h - pad_y
    inner_w = x1 - x0
    inner_h = y1 - y0

    # Reserve the top third of the safe zone for chimneys; the bottom
    # two-thirds is the factory building.
    chimney_band_top = y0
    chimney_band_bottom = y0 + int(inner_h * 0.45)
    building_top = chimney_band_bottom - int(inner_h * 0.05)  # small overlap
    building_bottom = y1

    # --- Building (main hall) ---
    # The hall covers the right ~70 percent of the inner width.
    hall_left = x0 + int(inner_w * 0.18)
    hall_right = x1
    draw.rectangle(
        [hall_left, building_top, hall_right, building_bottom],
        fill=FOREGROUND,
    )

    # Left wing (slightly shorter) covering the leftmost 25 percent of width.
    wing_left = x0
    wing_right = hall_left + int(inner_w * 0.02)
    wing_top = building_top + int(inner_h * 0.18)
    draw.rectangle(
        [wing_left, wing_top, wing_right, building_bottom],
        fill=FOREGROUND,
    )

    # --- Chimneys (three stacks rising from the main hall roof) ---
    chimney_count = 3
    chimney_width = max(1, int(inner_w * 0.07))
    chimney_gap = max(1, int(inner_w * 0.05))
    chimneys_total_width = chimney_count * chimney_width + (chimney_count - 1) * chimney_gap
    chimneys_origin_x = hall_left + int(inner_w * 0.05)

    for i in range(chimney_count):
        cx0 = chimneys_origin_x + i * (chimney_width + chimney_gap)
        cx1 = cx0 + chimney_width
        # Tallest chimney in the middle, shorter at the sides.
        if i == 1:
            top = chimney_band_top
        else:
            top = chimney_band_top + int(inner_h * 0.12)
        draw.rectangle([cx0, top, cx1, building_top], fill=FOREGROUND)

    # --- Windows (carved into the hall as background-colour rectangles) ---
    # Two rows of small square windows on the main hall.
    window_size = max(1, int(inner_w * 0.06))
    window_gap = max(1, int(inner_w * 0.04))
    rows = 2
    cols = 4
    block_width = cols * window_size + (cols - 1) * window_gap
    block_height = rows * window_size + (rows - 1) * window_gap
    hall_inner_left = hall_left + int(inner_w * 0.04)
    hall_inner_top = building_top + int(inner_h * 0.12)
    # Centre horizontally inside the hall.
    block_origin_x = hall_inner_left + max(
        0,
        ((hall_right - hall_inner_left) - block_width) // 2,
    )

    for r in range(rows):
        for c in range(cols):
            wx0 = block_origin_x + c * (window_size + window_gap)
            wy0 = hall_inner_top + r * (window_size + window_gap)
            wx1 = wx0 + window_size
            wy1 = wy0 + window_size
            # Clip to building rect just in case.
            if wx1 <= hall_right and wy1 <= building_bottom:
                draw.rectangle([wx0, wy0, wx1, wy1], fill=PRIMARY_COLOR)

    # Window on the left wing (one slightly bigger window).
    wing_window_size = max(1, int(inner_w * 0.09))
    wwx0 = wing_left + (wing_right - wing_left - wing_window_size) // 2
    wwy0 = wing_top + int(inner_h * 0.10)
    wwx1 = wwx0 + wing_window_size
    wwy1 = wwy0 + wing_window_size
    if wwx1 <= wing_right and wwy1 <= building_bottom:
        draw.rectangle([wwx0, wwy0, wwx1, wwy1], fill=PRIMARY_COLOR)


def _render_icon(size: int, padding_ratio: float) -> Image.Image:
    """Render one icon (RGBA, solid primary background, factory glyph)."""
    image = Image.new("RGBA", (size, size), PRIMARY_COLOR + (255,))
    _draw_factory(image, padding_ratio)
    return image


def main() -> int:
    out_dir = Path(__file__).resolve().parent.parent / "src" / "assets" / "icons"
    out_dir.mkdir(parents=True, exist_ok=True)

    for size in SIZES_ANY:
        icon = _render_icon(size, ANY_PADDING_RATIO)
        out_path = out_dir / f"icon-{size}x{size}.png"
        icon.save(out_path, format="PNG", optimize=True)
        print(f"wrote {out_path} ({out_path.stat().st_size} bytes)")

    # Maskable variant: bigger padding so the Android adaptive-icon mask
    # (a circle of about 80 percent of the edge) keeps the design intact.
    maskable = _render_icon(MASKABLE_SIZE, MASKABLE_PADDING_RATIO)
    maskable_path = out_dir / f"icon-{MASKABLE_SIZE}x{MASKABLE_SIZE}-maskable.png"
    maskable.save(maskable_path, format="PNG", optimize=True)
    print(f"wrote {maskable_path} ({maskable_path.stat().st_size} bytes)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
