"""Genera plantilla.pdf: hojas A4 con una celda por carácter para escribir a mano.

Uso: .venv/bin/python make_template.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

import layout as L

HERE = Path(__file__).parent
FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]


def font(size_mm: float) -> ImageFont.FreeTypeFont:
    for path in FONT_CANDIDATES:
        if Path(path).exists():
            return ImageFont.truetype(path, L.mm(size_mm))
    return ImageFont.load_default(L.mm(size_mm))


def draw_page(glyphs: list[L.Glyph], page_no: int, total: int) -> Image.Image:
    img = Image.new("RGB", (L.mm(L.PAGE_W_MM), L.mm(L.PAGE_H_MM)), "white")
    d = ImageDraw.Draw(img)
    guide = L.GUIDE_RGB

    for cx, cy in L.marker_centers_mm():
        h = L.MARKER_MM / 2
        d.rectangle([L.mm(cx - h), L.mm(cy - h), L.mm(cx + h), L.mm(cy + h)], fill="black")

    # Encabezado en el color de las guías para que no se confunda con tinta
    d.text((L.mm(L.GRID_LEFT_MM), L.mm(16)), f"Plantilla de letra · página {page_no} de {total}",
           fill=(110, 160, 210), font=font(4.5))
    d.text((L.mm(L.GRID_LEFT_MM), L.mm(24)),
           "Tinta negra, punta 0,5–0,8 mm. Apoya la letra en la línea base (la más marcada). "
           "No toques los cuadros negros de las esquinas.",
           fill=(110, 160, 210), font=font(2.6))
    d.text((L.mm(L.GRID_LEFT_MM), L.mm(29)),
           "Las celdas con ² son una segunda versión de la minúscula: opcionales, pero hacen el texto más natural.",
           fill=(110, 160, 210), font=font(2.6))

    label_font = font(2.8)
    for i, g in enumerate(glyphs):
        x, y = L.cell_box_mm(i)
        x0, y0, x1, y1 = L.mm(x), L.mm(y), L.mm(x + L.CELL_W_MM), L.mm(y + L.CELL_H_MM)
        d.rectangle([x0, y0, x1, y1], outline=guide, width=2)
        for line_mm, width in ((L.CAP_MM, 1), (L.XHEIGHT_MM, 1), (L.BASELINE_MM, 4), (L.DESC_MM, 1)):
            ly = L.mm(y + line_mm)
            if width == 1:  # línea punteada
                for sx in range(x0 + 6, x1 - 6, 18):
                    d.line([sx, ly, min(sx + 9, x1 - 6), ly], fill=guide, width=2)
            else:
                d.line([x0, ly, x1, ly], fill=guide, width=width)
        d.text((x0 + L.mm(1), y0 + L.mm(0.6)), g.label, fill=guide, font=label_font)

    return img


def main() -> None:
    pages = L.pages()
    images = [draw_page(gs, n + 1, len(pages)) for n, gs in enumerate(pages)]
    out = HERE / "plantilla.pdf"
    images[0].save(out, save_all=True, append_images=images[1:], resolution=L.DPI)
    print(f"{out} ({len(images)} páginas, {sum(map(len, pages))} celdas)")


if __name__ == "__main__":
    main()
