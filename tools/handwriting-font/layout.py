"""Geometría compartida entre la plantilla y el script que arma la fuente.

Todo se define en milímetros sobre una hoja A4. La plantilla se dibuja a DPI
píxeles por pulgada y los escaneos se enderezan a ese mismo tamaño, así las
celdas caen siempre en las mismas coordenadas.
"""

from dataclasses import dataclass

DPI = 300
PAGE_W_MM, PAGE_H_MM = 210, 297

# Marcadores negros en las esquinas, usados para enderezar fotos/escaneos.
MARKER_MM = 8
MARKER_INSET_MM = 6  # distancia del borde de la hoja al marcador

# Grilla de celdas
GRID_TOP_MM = 38
GRID_LEFT_MM = 15
COLS, ROWS = 7, 7
CELL_W_MM, CELL_H_MM = 24, 30
GAP_X_MM, GAP_Y_MM = 2, 3.5

# Líneas guía, medidas desde el borde superior de la celda
CAP_MM = 6        # mayúsculas y ascendentes
XHEIGHT_MM = 13   # altura de x
BASELINE_MM = 20  # línea base
DESC_MM = 26      # descendentes

# Escala de la fuente: altura de mayúsculas (14 mm) = 700 unidades
UNITS_PER_MM = 50
UNITS_PER_EM = 1000

# Color de las guías: celeste claro, desaparece al binarizar con max(R,G,B)
GUIDE_RGB = (160, 205, 245)


def mm(v: float) -> int:
    return round(v * DPI / 25.4)


def px_to_units(v: float) -> float:
    return v * 25.4 / DPI * UNITS_PER_MM


@dataclass(frozen=True)
class Glyph:
    char: str        # carácter base
    name: str        # nombre del glifo en la fuente
    label: str       # texto impreso en la celda
    alt: bool = False


def _name(ch: str) -> str:
    from fontTools.agl import UV2AGL
    cp = ord(ch)
    return UV2AGL.get(cp, f"uni{cp:04X}")


UPPER = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚÜ"
LOWER = "abcdefghijklmnñopqrstuvwxyzáéíóúü"
DIGITS = "0123456789"
PUNCT = ".,;:¿?¡!'\"-()[]/&@#$%+=*_€"
# Segunda versión de cada minúscula: se alternan para que el texto no se vea
# repetido. Son opcionales; las celdas vacías se ignoran.
ALTS = "abcdefghijklmnñopqrstuvwxyz"


def charset() -> list[Glyph]:
    glyphs = [Glyph(c, _name(c), c) for c in UPPER + LOWER + DIGITS + PUNCT]
    glyphs += [Glyph(c, _name(c) + ".alt", c + "²", alt=True) for c in ALTS]
    return glyphs


def pages() -> list[list[Glyph]]:
    per_page = COLS * ROWS
    gs = charset()
    return [gs[i:i + per_page] for i in range(0, len(gs), per_page)]


def cell_box_mm(index: int) -> tuple[float, float]:
    """Esquina superior izquierda (x, y) en mm de la celda `index` de una página."""
    r, c = divmod(index, COLS)
    return (GRID_LEFT_MM + c * (CELL_W_MM + GAP_X_MM),
            GRID_TOP_MM + r * (CELL_H_MM + GAP_Y_MM))


def marker_centers_mm() -> list[tuple[float, float]]:
    """Centros de los marcadores: sup-izq, sup-der, inf-der, inf-izq."""
    a = MARKER_INSET_MM + MARKER_MM / 2
    return [(a, a), (PAGE_W_MM - a, a), (PAGE_W_MM - a, PAGE_H_MM - a), (a, PAGE_H_MM - a)]
