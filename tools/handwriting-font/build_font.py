"""Convierte los escaneos de la plantilla en una fuente (.otf + .woff2).

Uso:
  .venv/bin/python build_font.py                 # lee scans/, escribe en out/
  .venv/bin/python build_font.py --publicar      # además copia el .woff2 a public/fonts/

Cada archivo en scans/ debe tener el número de página en el nombre
(pagina-1.jpg, pagina-2.png, ...).
"""

import argparse
import re
import shutil
import sys
from pathlib import Path

import cv2
import numpy as np
import pathops
import potrace
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

import layout as L

HERE = Path(__file__).parent
PUBLIC_FONTS = HERE.parent.parent / "public" / "fonts"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".bmp", ".webp"}

MIN_INK_PX = 40       # menos tinta que esto = celda vacía
SPECK_PX = 20         # manchas más chicas se descartan
CELL_INSET_MM = 1.0   # margen interior que se ignora (bordes de la celda)


# --------------------------------------------------------------------------
# Escaneo → página enderezada → máscara de tinta
# --------------------------------------------------------------------------

def find_markers(img: np.ndarray) -> np.ndarray:
    """Devuelve los centros de los 4 marcadores (sup-izq, sup-der, inf-der, inf-izq)."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, bw = cv2.threshold(cv2.GaussianBlur(gray, (5, 5), 0), 0, 255,
                          cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(bw, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    h, w = gray.shape
    min_area, max_area = (w * h) * 0.00005, (w * h) * 0.01

    candidates = []
    for c in contours:
        area = cv2.contourArea(c)
        if not min_area < area < max_area:
            continue
        hull_area = cv2.contourArea(cv2.convexHull(c))
        approx = cv2.approxPolyDP(c, 0.06 * cv2.arcLength(c, True), True)
        _, _, bw_, bh_ = cv2.boundingRect(c)
        if len(approx) == 4 and hull_area and area / hull_area > 0.9 and 0.5 < bw_ / bh_ < 2:
            m = cv2.moments(c)
            candidates.append((m["m10"] / m["m00"], m["m01"] / m["m00"], area))
    if len(candidates) < 4:
        raise RuntimeError("no se encontraron los 4 cuadros negros de las esquinas")

    corners = [(0, 0), (w, 0), (w, h), (0, h)]
    chosen = [min(candidates, key=lambda p: (p[0] - cx) ** 2 + (p[1] - cy) ** 2) for cx, cy in corners]
    areas = [p[2] for p in chosen]
    if len(set(chosen)) < 4 or max(areas) > 3 * min(areas):
        raise RuntimeError("los cuadros de las esquinas no se ven claros (¿la hoja está completa en la foto?)")
    return np.float32([(x, y) for x, y, _ in chosen])


def straighten(img: np.ndarray) -> np.ndarray:
    src = find_markers(img)
    dst = np.float32([(L.mm(x), L.mm(y)) for x, y in L.marker_centers_mm()])
    m = cv2.getPerspectiveTransform(src, dst)
    return cv2.warpPerspective(img, m, (L.mm(L.PAGE_W_MM), L.mm(L.PAGE_H_MM)),
                               flags=cv2.INTER_CUBIC, borderValue=(255, 255, 255))


def ink_mask(page: np.ndarray, threshold: float) -> np.ndarray:
    # max(R,G,B) borra las guías celestes y deja solo la tinta oscura
    v = page.max(axis=2).astype(np.float32)
    # Compensa iluminación desigual de las fotos dividiendo por el fondo
    background = cv2.dilate(v, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (41, 41)))
    background = cv2.GaussianBlur(background, (0, 0), 15)
    norm = cv2.GaussianBlur(v / np.maximum(background, 1), (0, 0), 1.0)
    return norm < threshold


def clean_cell(mask: np.ndarray) -> tuple[np.ndarray, bool]:
    """Quita manchas y trozos de letras vecinas que se metieron por el borde.

    Devuelve la máscara limpia y si la letra misma toca el borde (quedaría cortada).
    """
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), connectivity=8)
    area = stats[:, cv2.CC_STAT_AREA]
    x, y = stats[:, cv2.CC_STAT_LEFT], stats[:, cv2.CC_STAT_TOP]
    h, w = mask.shape
    touches = (x == 0) | (y == 0) | (x + stats[:, cv2.CC_STAT_WIDTH] >= w) | (y + stats[:, cv2.CC_STAT_HEIGHT] >= h)
    keep = area >= SPECK_PX
    keep[0] = False
    total = area[keep].sum()
    keep &= ~(touches & (area < 0.25 * total))
    return keep[labels], bool((keep & touches).any())


# --------------------------------------------------------------------------
# Celda → contornos vectoriales en unidades de fuente
# --------------------------------------------------------------------------

def cell_mask(mask: np.ndarray, index: int) -> tuple[np.ndarray, float, bool]:
    """Recorte limpio de la celda, línea base dentro del recorte (px) y si toca el borde."""
    x, y = L.cell_box_mm(index)
    x0, y0 = L.mm(x + CELL_INSET_MM), L.mm(y + CELL_INSET_MM)
    x1, y1 = L.mm(x + L.CELL_W_MM - CELL_INSET_MM), L.mm(y + L.CELL_H_MM - CELL_INSET_MM)
    baseline = L.mm(y + L.BASELINE_MM) - y0
    cell, clipped = clean_cell(mask[y0:y1, x0:x1])
    return cell, baseline, clipped


def trace(cell: np.ndarray, baseline: float, sidebearing: float) -> tuple[pathops.Path, int]:
    cols = np.where(cell.any(axis=0))[0]
    xmin, xmax = cols[0], cols[-1] + 1
    k = L.px_to_units(1)

    def pt(p):
        return ((p.x - xmin) * k + sidebearing, (baseline - p.y) * k)

    path = pathops.Path()
    pen = path.getPen()
    # potracer traza los píxeles "apagados", por eso se invierte la máscara
    for curve in potrace.Bitmap(~cell).trace(turdsize=SPECK_PX, alphamax=1.0, opttolerance=0.2):
        pen.moveTo(pt(curve.start_point))
        for seg in curve.segments:
            if seg.is_corner:
                pen.lineTo(pt(seg.c))
                pen.lineTo(pt(seg.end_point))
            else:
                pen.curveTo(pt(seg.c1), pt(seg.c2), pt(seg.end_point))
        pen.closePath()

    # Une trazos superpuestos y orienta los contornos como espera CFF
    path = pathops.simplify(path, clockwise=False)
    advance = round((xmax - xmin) * k + 2 * sidebearing)
    return path, advance


# --------------------------------------------------------------------------
# Armado de la fuente
# --------------------------------------------------------------------------

def charstring(path: pathops.Path | None, advance: int):
    pen = T2CharStringPen(advance, None)
    if path is not None:
        path.draw(pen)
    return pen.getCharString()


def notdef(advance: int = 500):
    p = pathops.Path()
    pen = p.getPen()
    for box, ccw in (((50, 0, 450, 700), True), ((100, 50, 400, 650), False)):
        x0, y0, x1, y1 = box
        pts = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
        if not ccw:
            pts.reverse()
        pen.moveTo(pts[0])
        for q in pts[1:]:
            pen.lineTo(q)
        pen.closePath()
    return p


def calt_feature(names: set[str]) -> str:
    """Alterna versión normal y ².alt en letras seguidas para que no se repitan iguales."""
    pairs = [(g.name.removesuffix(".alt"), g.name) for g in L.charset() if g.alt and g.name in names]
    pairs = [(base, alt) for base, alt in pairs if base in names]
    if not pairs:
        return ""
    letters = [g.name for g in L.charset() if not g.alt and g.char.isalpha() and g.name in names]
    return (
        f"@letters = [{' '.join(letters)}];\n"
        f"@base = [{' '.join(b for b, _ in pairs)}];\n"
        f"@alt = [{' '.join(a for _, a in pairs)}];\n"
        "feature calt {\n    sub @letters @base' by @alt;\n} calt;\n"
    )


def build(glyphs: dict[str, tuple[pathops.Path, int]], family: str, space: int, out_dir: Path) -> tuple[Path, Path]:
    slug = re.sub(r"[^a-z0-9]+", "-", family.lower()).strip("-")
    ps_name = re.sub(r"[^A-Za-z0-9]", "", family) + "-Regular"
    by_name = {g.name: g for g in L.charset()}

    order = [".notdef", "space"] + [g.name for g in L.charset() if g.name in glyphs]
    charstrings = {".notdef": charstring(notdef(), 500), "space": charstring(None, space)}
    metrics = {".notdef": (500, 50), "space": (space, 0)}
    y_min, y_max = 0, 0
    for name, (path, advance) in glyphs.items():
        charstrings[name] = charstring(path, advance)
        x0, b0, _, b1 = path.bounds
        metrics[name] = (advance, round(x0))
        y_min, y_max = min(y_min, b0), max(y_max, b1)

    cmap = {0x20: "space", 0xA0: "space"}
    cmap.update({ord(by_name[n].char): n for n in glyphs if not by_name[n].alt})

    ascent = max(800, round(y_max))
    descent = min(-250, round(y_min))
    cap = L.UNITS_PER_MM * (L.BASELINE_MM - L.CAP_MM)
    xh = L.UNITS_PER_MM * (L.BASELINE_MM - L.XHEIGHT_MM)

    fb = FontBuilder(L.UNITS_PER_EM, isTTF=False)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupCFF(ps_name, {"FullName": family}, charstrings, {})
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=ascent, descent=descent)
    fb.setupNameTable({"familyName": family, "styleName": "Regular"})
    fb.setupOS2(version=4, sTypoAscender=ascent, sTypoDescender=descent, sTypoLineGap=0,
                usWinAscent=ascent, usWinDescent=-descent, sxHeight=xh, sCapHeight=cap,
                fsSelection=0x40 | 0x80)  # REGULAR | USE_TYPO_METRICS
    fb.setupPost()
    fea = calt_feature(set(glyphs))
    if fea:
        fb.addOpenTypeFeatures(fea)

    out_dir.mkdir(parents=True, exist_ok=True)
    otf = out_dir / f"{slug}.otf"
    fb.save(otf)
    font = TTFont(otf)
    font.flavor = "woff2"
    woff2 = out_dir / f"{slug}.woff2"
    font.save(woff2)
    return otf, woff2


def sample(otf: Path, out: Path) -> None:
    lines = [
        "El veloz murciélago hindú comía feliz",
        "cardillo y kiwi. ¿Ñandú? ¡Sí! 0123456789",
        "".join(L.UPPER),
        "".join(L.LOWER),
        L.DIGITS + " " + L.PUNCT,
    ]
    f = ImageFont.truetype(str(otf), 90)
    img = Image.new("RGB", (2600, 150 * len(lines) + 60), "white")
    d = ImageDraw.Draw(img)
    for i, line in enumerate(lines):
        d.text((40, 40 + i * 150), line, fill="black", font=f)
    img.save(out)


# --------------------------------------------------------------------------

def load_scans(scan_dir: Path) -> dict[int, Path]:
    scans = {}
    for p in sorted(scan_dir.iterdir()):
        if p.suffix.lower() not in IMAGE_EXTS:
            continue
        m = re.search(r"\d+", p.stem)
        if not m:
            sys.exit(f"{p.name}: el nombre debe incluir el número de página (ej. pagina-1.jpg)")
        scans[int(m.group())] = p
    return scans


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--scans", type=Path, default=HERE / "scans")
    ap.add_argument("--out", type=Path, default=HERE / "out")
    ap.add_argument("--nombre", default="Joan Hand", help="nombre de la familia tipográfica")
    ap.add_argument("--espaciado", type=float, default=50, help="aire a cada lado de la letra (unidades)")
    ap.add_argument("--espacio", type=int, default=320, help="ancho del espacio (unidades)")
    ap.add_argument("--umbral", type=float, default=0.6,
                    help="0–1: más alto capta trazos más claros, más bajo ignora sombras")
    ap.add_argument("--publicar", action="store_true", help="copia el .woff2 a public/fonts/")
    args = ap.parse_args()

    pages = L.pages()
    scans = load_scans(args.scans)
    if not scans:
        sys.exit(f"No hay imágenes en {args.scans}")

    debug_dir = args.out / "debug"
    debug_dir.mkdir(parents=True, exist_ok=True)
    glyphs: dict[str, tuple[pathops.Path, int]] = {}

    for page_no, path in sorted(scans.items()):
        if not 1 <= page_no <= len(pages):
            sys.exit(f"{path.name}: la plantilla solo tiene {len(pages)} páginas")
        img = cv2.imread(str(path))
        if img is None:
            sys.exit(f"{path.name}: no se pudo leer la imagen (usa JPG o PNG)")
        try:
            page = straighten(img)
        except RuntimeError as e:
            sys.exit(f"{path.name}: {e}")
        mask = ink_mask(page, args.umbral)

        preview = page.copy()
        preview[mask] = (0, 0, 255)
        found, clipped = 0, []
        for i, g in enumerate(pages[page_no - 1]):
            cell, baseline, touches = cell_mask(mask, i)
            if cell.sum() < MIN_INK_PX:
                continue
            glyphs[g.name] = trace(cell, baseline, args.espaciado)
            found += 1
            if touches:
                clipped.append(g.label)
        cv2.imwrite(str(debug_dir / f"pagina-{page_no}.jpg"), preview, [cv2.IMWRITE_JPEG_QUALITY, 80])
        print(f"página {page_no}: {found}/{len(pages[page_no - 1])} caracteres ({path.name})")
        if clipped:
            print("  tocan el borde de la celda y pueden quedar cortadas:", " ".join(clipped))

    missing = [g.label for g in L.charset() if not g.alt and g.name not in glyphs]
    if missing:
        print("Faltan:", " ".join(missing))

    otf, woff2 = build(glyphs, args.nombre, args.espacio, args.out)
    sample(otf, args.out / "muestra.png")
    print(f"Fuente: {otf}\n        {woff2}\nMuestra: {args.out / 'muestra.png'}")

    if args.publicar:
        PUBLIC_FONTS.mkdir(parents=True, exist_ok=True)
        shutil.copy2(woff2, PUBLIC_FONTS / woff2.name)
        print(f"Copiada a {PUBLIC_FONTS / woff2.name}")


if __name__ == "__main__":
    main()
