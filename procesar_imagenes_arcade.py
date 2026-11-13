"""Procesa las fotos reales del campus, Rector Murillo y Durango a estilo 8-bits/arcade.

Genera con Pillow (PIL):
  - assets/images/bg_plazoleta.png   (800x600, fondo pixelado 8-bit de la Plazoleta de Ingenierias)
  - assets/images/rector_murillo.png (136x112, sprite pixel-art 8-bit del Rector Murillo con marco arcade)
  - assets/images/durango.png        (120x136, PNG transparente de Durango cabeza/torso con gorro navideño)
  - assets/images/durango_mano.png   (26x20, PNG transparente simulando la mano de Durango)
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

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


def generar_durango_y_manos() -> tuple[Path, Path]:
    """Recorta cabeza/torso de Durango dejando fondo transparente y genera el sprite de su mano."""
    src_path = SOURCE_DIR / "durango_2.jpg"
    if not src_path.exists():
        src_path = SOURCE_DIR / "durango_1.jpg"
    if not src_path.exists():
        raise FileNotFoundError("No se encontro ninguna foto fuente de Durango.")

    raw = Image.open(src_path).convert("RGBA")
    w, h = raw.size

    # Recortar cabeza (con gorro de Navidad y pompon) + torso superior con polo Univalle
    crop_box = (int(w * 0.08), int(h * 0.045), int(w * 0.89), int(h * 0.78))
    portrait = raw.crop(crop_box)
    target_size = (120, 136)
    portrait = ImageOps.fit(portrait, target_size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.4))

    # Construir mascara precisa alrededor de la silueta de cabeza, gorro navideño, pompon y torso
    pw, ph = target_size
    mask = Image.new("L", target_size, 0)
    mdraw = ImageDraw.Draw(mask)

    # Torso / hombros (parte inferior del recorte)
    mdraw.polygon(
        [
            (2, ph),
            (6, int(ph * 0.75)),
            (int(pw * 0.22), int(ph * 0.61)),
            (int(pw * 0.78), int(ph * 0.63)),
            (pw - 6, int(ph * 0.76)),
            (pw - 2, ph),
        ],
        fill=255,
    )
    # Bufanda / cuello
    mdraw.ellipse([int(pw * 0.23), int(ph * 0.45), int(pw * 0.72), int(ph * 0.69)], fill=255)
    # Cabeza y orejas
    mdraw.ellipse([int(pw * 0.29), int(ph * 0.16), int(pw * 0.68), int(ph * 0.54)], fill=255)
    # Gorro de Navidad (copa + ala blanca)
    mdraw.polygon(
        [
            (int(pw * 0.27), int(ph * 0.27)),
            (int(pw * 0.32), int(ph * 0.07)),
            (int(pw * 0.48), int(ph * 0.02)),
            (int(pw * 0.65), int(ph * 0.10)),
            (int(pw * 0.69), int(ph * 0.27)),
        ],
        fill=255,
    )
    # Parte colgante izquierda y pompon blanco del gorro
    mdraw.polygon(
        [
            (int(pw * 0.34), int(ph * 0.07)),
            (int(pw * 0.21), int(ph * 0.22)),
            (int(pw * 0.20), int(ph * 0.36)),
            (int(pw * 0.31), int(ph * 0.34)),
        ],
        fill=255,
    )
    mdraw.ellipse([int(pw * 0.16), int(ph * 0.30), int(pw * 0.31), int(ph * 0.44)], fill=255)

    # Refinar bordes removiendo tonos grises/oscuros del fondo exterior sin tocar piel, rojo ni blanco
    px = portrait.load()
    mpx = mask.load()
    for y in range(int(ph * 0.58)):
        for x in range(pw):
            if mpx[x, y] == 0:
                continue
            r, g, b, _ = px[x, y]
            is_edge = (
                x < 4 or x > pw - 5 or y < 3
                or mpx[max(0, x - 2), y] == 0
                or mpx[min(pw - 1, x + 2), y] == 0
                or mpx[x, max(0, y - 2)] == 0
            )
            brightness = (r + g + b) / 3
            red_dominant = r > g + 30 and r > b + 25
            white_pom = r > 175 and g > 170 and b > 165
            skin_tone = r > 110 and r > b + 20 and g > 65
            if is_edge and not red_dominant and not white_pom and not skin_tone and brightness < 150:
                mpx[x, y] = 0

    mask = mask.filter(ImageFilter.GaussianBlur(radius=1.0))

    # Aplicar estilo ligeramente retro/nitido y guardar PNG con canal alfa transparente
    durango_rgba = ImageEnhance.Color(portrait.convert("RGB")).enhance(1.12).convert("RGBA")
    durango_rgba.putalpha(mask)

    durango_path = OUT_DIR / "durango.png"
    durango_rgba.save(durango_path, format="PNG")

    # Sprite simulando la mano de Durango (pequeno rectangulo redondeado estilo arcade con puño navideño)
    hand = Image.new("RGBA", (26, 20), (0, 0, 0, 0))
    hdraw = ImageDraw.Draw(hand)
    # Manga roja + puño blanco + mano piel con contorno oscuro
    hdraw.rounded_rectangle([1, 2, 10, 17], radius=3, fill="#c81e2b", outline="#0f172a", width=1)
    hdraw.rounded_rectangle([9, 3, 14, 16], radius=2, fill="#f8fafc", outline="#0f172a", width=1)
    hdraw.rounded_rectangle([13, 3, 24, 16], radius=4, fill="#d99b78", outline="#0f172a", width=1)

    mano_path = OUT_DIR / "durango_mano.png"
    hand.save(mano_path, format="PNG")
    return durango_path, mano_path


def generar_petro_cameo() -> Path:
    """Recorta cara/torso de Petro eliminando el fondo y dejandolo transparente (PNG)."""
    src_path = SOURCE_DIR / "petro_original.jpg"
    if not src_path.exists():
        raise FileNotFoundError(f"No se encontro la imagen fuente: {src_path}")

    raw = Image.open(src_path).convert("RGBA")
    w, h = raw.size

    # Recortar cara con gafas, mano en mejilla y torso superior (sin estante superior ni rotulo inferior)
    crop_box = (int(w * 0.02), int(h * 0.19), int(w * 0.99), int(h * 0.90))
    cropped = raw.crop(crop_box)
    target_size = (128, 108)
    portrait = ImageOps.fit(cropped, target_size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))

    pw, ph = target_size
    mask = Image.new("L", target_size, 0)
    mdraw = ImageDraw.Draw(mask)

    # Cabeza inclinada (rotacion antihoraria +22 deg sigue el eje frente->menton)
    head_layer = Image.new("L", target_size, 0)
    hdraw = ImageDraw.Draw(head_layer)
    hdraw.ellipse([int(pw * 0.20), int(ph * 0.03), int(pw * 0.64), int(ph * 0.72)], fill=255)
    head_rot = head_layer.rotate(22, center=(int(pw * 0.42), int(ph * 0.37)))
    mask.paste(255, mask=head_rot)

    # Mano izquierda sosteniendo mejilla y muñeca con reloj (sin incluir libros del fondo)
    mdraw.polygon(
        [
            (int(pw * 0.04), ph),
            (int(pw * 0.08), int(ph * 0.80)),
            (int(pw * 0.17), int(ph * 0.62)),
            (int(pw * 0.30), int(ph * 0.52)),
            (int(pw * 0.36), ph),
        ],
        fill=255,
    )

    # Cuello y camisa/torso inferior
    mdraw.polygon(
        [
            (int(pw * 0.22), ph),
            (int(pw * 0.36), int(ph * 0.64)),
            (int(pw * 0.68), int(ph * 0.52)),
            (int(pw * 0.96), int(ph * 0.56)),
            (pw - 2, ph),
        ],
        fill=255,
    )

    mask = mask.filter(ImageFilter.GaussianBlur(radius=1.1))
    petro_rgba = ImageEnhance.Contrast(portrait.convert("RGB")).enhance(1.08)
    petro_rgba = ImageEnhance.Color(petro_rgba).enhance(1.12).convert("RGBA")
    petro_rgba.putalpha(mask)

    out_path = OUT_DIR / "petro_cameo.png"
    petro_rgba.save(out_path, format="PNG")
    return out_path


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    bg_path = generar_bg_plazoleta()
    boss_path = generar_rector_murillo()
    durango_path, mano_path = generar_durango_y_manos()
    petro_path = generar_petro_cameo()
    print(f"Generado: {bg_path} ({bg_path.stat().st_size} bytes)")
    print(f"Generado: {boss_path} ({boss_path.stat().st_size} bytes)")
    print(f"Generado: {durango_path} ({durango_path.stat().st_size} bytes)")
    print(f"Generado: {mano_path} ({mano_path.stat().st_size} bytes)")
    print(f"Generado: {petro_path} ({petro_path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
