#!/usr/bin/env python3
from __future__ import annotations

import math
import struct
import zlib
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"

NAVY = (19, 35, 63, 255)
NAVY_2 = (28, 57, 92, 255)
PAPER = (255, 250, 240, 255)
PAPER_2 = (247, 237, 220, 255)
INK = (23, 32, 51, 255)
BLUE = (52, 95, 141, 255)
CORK = (123, 85, 55, 255)
CORK_LIGHT = (185, 130, 78, 255)
RED = (185, 107, 93, 255)
GREEN = (183, 215, 189, 255)
YELLOW = (255, 228, 138, 255)
WHITE = (255, 253, 248, 255)
OFFWHITE = (255, 254, 251, 255)
SHADOW = (11, 18, 32, 64)

FONT = {
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "C": ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    "G": ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
    "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    "I": ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    "W": ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
    "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    " ": ["000", "000", "000", "000", "000", "000", "000"],
}


def canvas(w: int, h: int, color=(0, 0, 0, 0)) -> np.ndarray:
    arr = np.zeros((h, w, 4), dtype=np.uint8)
    arr[:, :] = color
    return arr


def alpha_blend(dst: np.ndarray, color, mask: np.ndarray):
    src = np.array(color, dtype=np.float32)
    a = (mask.astype(np.float32) / 255.0) * (src[3] / 255.0)
    inv = 1.0 - a
    dst[..., :3] = (src[:3] * a[..., None] + dst[..., :3].astype(np.float32) * inv[..., None]).astype(np.uint8)
    dst[..., 3] = np.clip(src[3] * (mask / 255.0) + dst[..., 3] * inv, 0, 255).astype(np.uint8)


def rect(img, x, y, w, h, color):
    H, W = img.shape[:2]
    x0, y0 = max(0, int(x)), max(0, int(y))
    x1, y1 = min(W, int(x + w)), min(H, int(y + h))
    if x1 > x0 and y1 > y0:
        img[y0:y1, x0:x1] = color


def rounded_rect(img, x, y, w, h, r, color):
    H, W = img.shape[:2]
    x0, y0, x1, y1 = map(int, (x, y, x + w, y + h))
    xx0, yy0 = max(0, x0), max(0, y0)
    xx1, yy1 = min(W, x1), min(H, y1)
    if xx1 <= xx0 or yy1 <= yy0:
        return
    yy, xx = np.ogrid[yy0:yy1, xx0:xx1]
    cx = np.clip(xx, x0 + r, x1 - r - 1)
    cy = np.clip(yy, y0 + r, y1 - r - 1)
    dist2 = (xx - cx) ** 2 + (yy - cy) ** 2
    mask = (dist2 <= r * r).astype(np.uint8) * 255
    alpha_blend(img[yy0:yy1, xx0:xx1], color, mask)


def line_h(img, x, y, w, t, color):
    rounded_rect(img, x, y, w, t, t // 2, color)


def line_v(img, x, y, h, t, color):
    rounded_rect(img, x, y, t, h, t // 2, color)


def diamond(img, cx, cy, r, color):
    H, W = img.shape[:2]
    x0, x1 = max(0, cx - r), min(W, cx + r + 1)
    y0, y1 = max(0, cy - r), min(H, cy + r + 1)
    yy, xx = np.ogrid[y0:y1, x0:x1]
    mask = ((np.abs(xx - cx) + np.abs(yy - cy)) <= r).astype(np.uint8) * 255
    alpha_blend(img[y0:y1, x0:x1], color, mask)


def text_width(text: str, scale: int, gap: int | None = None) -> int:
    gap = scale if gap is None else gap
    width = 0
    for ch in text.upper():
        glyph = FONT.get(ch, FONT[" "])
        width += len(glyph[0]) * scale + gap
    return max(0, width - gap)


def draw_text(img, text: str, x: int, y: int, scale: int, color, gap: int | None = None):
    gap = scale if gap is None else gap
    cx = x
    for ch in text.upper():
        glyph = FONT.get(ch, FONT[" "])
        for row, bits in enumerate(glyph):
            for col, bit in enumerate(bits):
                if bit == "1":
                    rect(img, cx + col * scale, y + row * scale, scale, scale, color)
        cx += len(glyph[0]) * scale + gap


def save_png(path: Path, img: np.ndarray):
    path.parent.mkdir(parents=True, exist_ok=True)
    h, w = img.shape[:2]
    raw = b"".join(b"\x00" + img[y].tobytes() for y in range(h))
    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    path.write_bytes(png)


def draw_icon(size: int) -> np.ndarray:
    s = size / 512.0
    img = canvas(size, size, PAPER_2)
    # notebook grid
    for x in range(0, size, max(1, int(64 * s))):
        rect(img, x, 0, max(1, int(2 * s)), size, (221, 211, 193, 70))
    for y in range(int(82 * s), size, max(1, int(122 * s))):
        rect(img, 0, y, size, max(1, int(2 * s)), (221, 211, 193, 70))
    rounded_rect(img, int(64*s), int(58*s), int(384*s), int(380*s), int(48*s), WHITE)
    line_v(img, int(118*s), int(82*s), int(332*s), max(2, int(7*s)), RED)
    line_h(img, int(148*s), int(382*s), int(240*s), max(6, int(24*s)), GREEN)
    # board frame and board
    rounded_rect(img, int(142*s), int(134*s), int(248*s), int(210*s), int(34*s), CORK)
    rounded_rect(img, int(160*s), int(152*s), int(212*s), int(174*s), int(22*s), NAVY)
    # Large readable AI; star is moved clear of I.
    draw_text(img, "AI", int(190*s), int(190*s), max(4, int(18*s)), OFFWHITE, max(3, int(7*s)))
    diamond(img, int(356*s), int(116*s), int(58*s), YELLOW)
    return img


def draw_og() -> np.ndarray:
    W, H = 1200, 630
    img = canvas(W, H, (35, 36, 48, 255))
    rounded_rect(img, 58, 32, 1084, 540, 62, PAPER_2)
    # subtle grid
    for x in range(100, 1120, 62):
        rect(img, x, 32, 2, 540, (221, 211, 193, 75))
    for y in range(84, 552, 62):
        rect(img, 58, y, 1084, 2, (221, 211, 193, 75))
    rounded_rect(img, 122, 88, 956, 418, 42, OFFWHITE)
    line_v(img, 178, 110, 350, 7, RED)
    line_h(img, 212, 424, 242, 26, GREEN)
    # board frame and board, smaller so text has air.
    rounded_rect(img, 214, 166, 260, 230, 34, CORK)
    rounded_rect(img, 232, 184, 224, 194, 20, NAVY)
    draw_text(img, "AI", 280, 242, 20, OFFWHITE, 9)
    diamond(img, 440, 160, 70, YELLOW)
    # Wordmark: large enough and in verified bitmap glyphs.
    draw_text(img, "AI HOMEROOM", 520, 154, 9, NAVY, 4)
    draw_text(img, "PLAIN ENGLISH", 528, 296, 7, BLUE, 4)
    draw_text(img, "AI NEWS", 528, 356, 7, BLUE, 4)
    draw_text(img, "GLOSSARY", 528, 416, 7, BLUE, 4)
    return img


def main():
    save_png(PUBLIC / "og-image.png", draw_og())
    save_png(PUBLIC / "icons" / "icon-512.png", draw_icon(512))
    save_png(PUBLIC / "icons" / "icon-192.png", draw_icon(192))
    save_png(PUBLIC / "apple-touch-icon.png", draw_icon(180))


if __name__ == "__main__":
    main()
