"""
从 apps/web/public/images/bottom-nav.png 提取顶部圆弧（与纯白背景的差异），
y>=27 以下为 UI 区，整段裁成透明；仅保留上缘约 27px 内的浅灰渐变弧。
输出：bottom-nav-arc.png（已裁至非透明 bbox）
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    src = root / "apps/web/public/images/bottom-nav.png"
    out = root / "apps/web/public/images/bottom-nav-arc.png"

    rgb = np.asarray(Image.open(src).convert("RGB")).astype(np.int16)
    h, w, _ = rgb.shape

    # 仅保留 y < arc_bottom 的条带（与红色 UI 出现行前一行）
    arc_bottom = 27
    out_rgba = np.zeros((h, w, 4), dtype=np.uint8)

    for y in range(min(arc_bottom, h)):
        r = rgb[y, :, 0]
        g = rgb[y, :, 1]
        b = rgb[y, :, 2]
        d = np.maximum(np.maximum(255 - r, 255 - g), 255 - b)
        # 越接近纯白越透明；轻微差异保留为弧与阴影
        alpha = np.clip((d.astype(np.float32) - 0.8) * 55.0, 0, 255).astype(np.uint8)
        mask = alpha >= 6
        out_rgba[y, :, 0] = np.where(mask, rgb[y, :, 0], 0)
        out_rgba[y, :, 1] = np.where(mask, rgb[y, :, 1], 0)
        out_rgba[y, :, 2] = np.where(mask, rgb[y, :, 2], 0)
        out_rgba[y, :, 3] = np.where(mask, alpha, 0)

    # 裁 bbox
    a = out_rgba[:, :, 3]
    rows = np.where(a.max(axis=1) > 0)[0]
    cols = np.where(a.max(axis=0) > 0)[0]
    if len(rows) == 0 or len(cols) == 0:
        raise SystemExit("No visible arc pixels; tune arc_bottom / alpha")

    y0, y1 = rows[0], rows[-1] + 1
    x0, x1 = cols[0], cols[-1] + 1
    cropped = out_rgba[y0:y1, x0:x1]

    Image.fromarray(cropped, "RGBA").save(out, optimize=True)
    print(f"Wrote {out.relative_to(root)} size={cropped.shape[1]}x{cropped.shape[0]}")


if __name__ == "__main__":
    main()
