#!/usr/bin/env python3
"""Generador de QR y recursos gráficos (SVG/PNG) para Capucho Invaders y Canva."""

import json
import os
import shutil
import qrcode
from PIL import Image, ImageDraw

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SPRITES_JSON = os.path.join(BASE_DIR, "assets", "data", "sprites.json")
IMAGES_DIR = os.path.join(BASE_DIR, "assets", "images")
QR_ROOT_PATH = os.path.join(BASE_DIR, "qr_juego.png")
QR_IMAGES_PATH = os.path.join(IMAGES_DIR, "qr_juego.png")
PAGES_URL = "https://leitonsantiago-eng.github.io/capucho-invaders"


def hex_to_rgba(hex_str: str) -> tuple[int, int, int, int]:
    hex_str = hex_str.lstrip("#")
    return tuple(int(hex_str[i : i + 2], 16) for i in (0, 2, 4)) + (255,)


def generate_qr() -> None:
    qr = qrcode.QRCode(
        version=2,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=4,
    )
    qr.add_data(PAGES_URL)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#070913", back_color="#ffffff").convert("RGBA")
    img.save(QR_ROOT_PATH)
    shutil.copyfile(QR_ROOT_PATH, QR_IMAGES_PATH)
    print(f"[OK] QR generado en: {QR_ROOT_PATH}")


def export_sprite_svg_and_png(key: str, definition: dict) -> None:
    matrix = definition["frames"][0]
    palette = definition["palette"]
    scale = 24
    rows = len(matrix)
    cols = len(matrix[0])
    width = cols * scale
    height = rows * scale

    # SVG nítido para Canva
    svg_lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" shape-rendering="crispEdges">'
    ]
    png_img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(png_img)

    for r, row in enumerate(matrix):
        for c, ch in enumerate(row):
            if ch != "." and ch in palette:
                color_hex = palette[ch]
                x0, y0 = c * scale, r * scale
                svg_lines.append(
                    f'  <rect x="{x0}" y="{y0}" width="{scale}" height="{scale}" fill="{color_hex}"/>'
                )
                draw.rectangle(
                    [x0, y0, x0 + scale - 1, y0 + scale - 1],
                    fill=hex_to_rgba(color_hex),
                )

    svg_lines.append("</svg>")
    svg_path = os.path.join(IMAGES_DIR, f"{key}.svg")
    png_path = os.path.join(IMAGES_DIR, f"{key}.png")

    with open(svg_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg_lines))
    png_img.save(png_path)


def generate_murillo_placeholder_assets() -> None:
    # SVG y PNG distintivo del Jefe Profesor Murillo (también en assets/murillo.png como base reemplazable)
    w, h = 272, 224
    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
  <rect x="8" y="8" width="{w-16}" height="{h-16}" rx="28" fill="#1e1b4b" stroke="#ffd700" stroke-width="8"/>
  <circle cx="136" cy="92" r="64" fill="#e6192e" stroke="#ffffff" stroke-width="6"/>
  <rect x="92" y="76" width="36" height="22" fill="#0f172a" stroke="#00e5ff" stroke-width="4"/>
  <rect x="144" y="76" width="36" height="22" fill="#0f172a" stroke="#00e5ff" stroke-width="4"/>
  <rect x="128" y="84" width="16" height="6" fill="#0f172a"/>
  <rect x="112" y="114" width="48" height="8" fill="#f8fafc"/>
  <rect x="28" y="164" width="{w-56}" height="40" rx="10" fill="#ffd700"/>
  <text x="136" y="191" font-family="Courier New, monospace" font-size="22" font-weight="bold" fill="#0f172a" text-anchor="middle">PROF. MURILLO</text>
</svg>"""
    svg_path = os.path.join(IMAGES_DIR, "boss_murillo_placeholder.svg")
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)

    # PNG con Pillow
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([8, 8, w - 8, h - 8], radius=28, fill=(30, 27, 75, 255), outline=(255, 215, 0, 255), width=8)
    d.ellipse([72, 28, 200, 156], fill=(230, 25, 46, 255), outline=(255, 255, 255, 255), width=6)
    d.rectangle([92, 76, 128, 98], fill=(15, 23, 42, 255), outline=(0, 229, 255, 255), width=3)
    d.rectangle([144, 76, 180, 98], fill=(15, 23, 42, 255), outline=(0, 229, 255, 255), width=3)
    d.rectangle([128, 84, 144, 90], fill=(15, 23, 42, 255))
    d.rectangle([112, 114, 160, 122], fill=(248, 250, 252, 255))
    d.rounded_rectangle([28, 164, w - 28, 204], radius=10, fill=(255, 215, 0, 255))

    boss_png = os.path.join(IMAGES_DIR, "boss_murillo_placeholder.png")
    img.save(boss_png)


def generate_el_lago_svg() -> None:
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="800" height="300">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3b0764"/>
      <stop offset="100%" stop-color="#070913"/>
    </linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0c4a6e"/>
      <stop offset="100%" stop-color="#082f49"/>
    </linearGradient>
  </defs>
  <rect width="800" height="190" fill="url(#sky)"/>
  <circle cx="640" cy="95" r="44" fill="#fb923c" opacity="0.6"/>
  <rect y="190" width="800" height="110" fill="url(#water)"/>
  <path d="M0 215 Q100 205 200 215 T400 215 T600 215 T800 215" fill="none" stroke="#7dd3fc" stroke-width="3" opacity="0.4"/>
  <path d="M0 245 Q100 235 200 245 T400 245 T600 245 T800 245" fill="none" stroke="#7dd3fc" stroke-width="2" opacity="0.25"/>
  <rect x="44" y="148" width="6" height="44" fill="#5b3a1a"/>
  <rect x="10" y="132" width="76" height="22" rx="4" fill="#7c4a1e" stroke="#3f2a14" stroke-width="2"/>
  <text x="48" y="147" font-family="Courier New, monospace" font-size="12" font-weight="bold" fill="#fde68a" text-anchor="middle">EL LAGO</text>
</svg>"""
    with open(os.path.join(IMAGES_DIR, "escenario_el_lago.svg"), "w", encoding="utf-8") as f:
        f.write(svg)


def main() -> None:
    os.makedirs(IMAGES_DIR, exist_ok=True)
    generate_qr()

    with open(SPRITES_JSON, "r", encoding="utf-8") as f:
        sprites = json.load(f)

    for key, definition in sprites.items():
        export_sprite_svg_and_png(key, definition)

    generate_murillo_placeholder_assets()
    generate_el_lago_svg()
    print(f"[OK] Exportados {len(sprites)} sprites SVG/PNG + Profesor Murillo + El Lago en {IMAGES_DIR}")


if __name__ == "__main__":
    main()
