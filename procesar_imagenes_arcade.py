"""Procesa las fotos reales del campus y del Rector Murillo a estilo 8-bits/arcade.

Genera con Pillow (PIL):
  - assets/images/bg_plazoleta.png   (800x600, fondo pixelado 8-bit de la Plazoleta de Ingenierias)
  - assets/images/rector_murillo.png (136x112, sprite pixel-art 8-bit del Rector Murillo con marco arcade)
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageOps

ROOT = Path(__file__).resolve().parent
SOURCE_DIR = ROOT / "assets" / "images" / "source"
OUT_DIR = ROOT / "assets" / "images"


def pixelar_8bit(img: Image.Image, pixel_size: tuple[int, int], out_size: tuple[int, int], colors: int) -> Image.Image:
    """Aplica reduccion de resolucion, cuantizacion de paleta 8-bit y reescalado NEAREST."""
    small = img.convert("RGB").resize(pixel_size, Image.Resampling.BILINEAR)
    quantized = small.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pixelated = quantized.convert("RGB").resize(out_size, Image.Resampling.NEAREST)
    return pixelated


def agregar_scanlines(img: Image.Image, step: int = 4, factor: float = 0.84) -> Image.Image:
    """Agrega lineas horizontales sutiles tipo monitor CRT arcade."""
    result = img.copy()
    pixels = result.load()
    w, h = result.size
    for y in range(0, h, step):
        for x in range(w):
            r, g, b = pixels[x, y]
            pixels[x, y] = (int(r * factor), int(g * factor), int(b * factor))
    return result


def generar_bg_plazoleta() -> Path:
    src_path = SOURCE_DIR / "plazoleta_original.jpg"
    if not src_path.exists():
        raise FileNotFoundError(f"No se encontro la imagen fuente: {src_path}")

    img = ImageOps.fit(Image.open(src_path), (800, 600), method=Image.Resampling.LANCZOS, centering=(0.5, 0.55))
    img = ImageEnhance.Contrast(img).enhance(1.18)
    img = ImageEnhance.Color(img).enhance(1.25)

    # Reducir a 160x120 (bloques 5x5 px) con paleta retro de 24 colores
    arcade_bg = pixelar_8bit(img, pixel_size=(160, 120), out_size=(800, 600), colors=24)

    # Oscurecer ligeramente para que las naves y proyectiles resalten en el nivel final
    arcade_bg = ImageEnhance.Brightness(arcade_bg).enhance(0.55)
    arcade_bg = agregar_scanlines(arcade_bg, step=4, factor=0.82)

    out_path = OUT_DIR / "bg_plazoleta.png"
    arcade_bg.save(out_path, format="PNG")
    return out_path


def generar_rector_murillo() -> Path:
    src_path = SOURCE_DIR / "murillo_bandera.jpg"
    if not src_path.exists():
        src_path = SOURCE_DIR / "murillo_closeup.jpg"
    if not src_path.exists():
        raise FileNotFoundError("No se encontro ninguna foto fuente del Rector Murillo.")

    raw = Image.open(src_path).convert("RGB")
    w, h = raw.size

    # Encuadrar busto del Rector Murillo junto a la bandera de Univalle manteniendo proporcion 136:112
    if src_path.name == "murillo_bandera.jpg":
        crop_box = (int(w * 0.16), int(h * 0.02), int(w * 0.89), int(h * 0.84))
        framed = raw.crop(crop_box)
        framed = ImageOps.fit(framed, (136, 112), method=Image.Resampling.LANCZOS, centering=(0.5, 0.35))
    else:
        framed = ImageOps.fit(raw, (136, 112), method=Image.Resampling.LANCZOS, centering=(0.5, 0.25))

    framed = ImageEnhance.Contrast(framed).enhance(1.2)
    framed = ImageEnhance.Color(framed).enhance(1.15)

    # Estilo 8-bit/arcade: bajar a 68x56 (bloques 2x2 px) y cuantizar a 32 colores
    boss_sprite = pixelar_8bit(framed, pixel_size=(68, 56), out_size=(136, 112), colors=32).convert("RGBA")

    # Marco arcade Univalle (borde rojo + esquinas doradas estilo jefe final)
    draw = ImageDraw.Draw(boss_sprite)
    draw.rectangle([0, 0, 135, 111], outline="#ffd700", width=3)
    draw.rectangle([3, 3, 132, 108], outline="#e6192e", width=2)

    out_path = OUT_DIR / "rector_murillo.png"
    boss_sprite.save(out_path, format="PNG")
    return out_path


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    bg_path = generar_bg_plazoleta()
    boss_path = generar_rector_murillo()
    print(f"Generado: {bg_path} ({bg_path.stat().st_size} bytes)")
    print(f"Generado: {boss_path} ({boss_path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
