# Fuente con mi letra

Convierte la plantilla escrita a mano en `joan-hand.otf` / `joan-hand.woff2`.

## 1. Escribir

Imprime `plantilla.pdf` (3 páginas, A4, **sin ajustar a la página**/escala 100 %) y llénala:

- Usa tinta negra con punta de 0,5–0,8 mm. Las guías celestes desaparecen al procesar.
- Apoya cada letra en la línea base (la más marcada). Las mayúsculas y las ascendentes llegan a la línea de arriba, y las descendentes (g, j, p, q, y) bajan a la última.
- No te salgas de la celda ni toques los cuadros negros de las esquinas.
- Las celdas con `²` son una segunda versión de las minúsculas y son opcionales. Si las llenas, la fuente alterna entre ambas versiones (`calt`) para que las letras repetidas no se vean idénticas.

Para regenerar la plantilla: `.venv/bin/python make_template.py`.

## 2. Escanear

Puedes escanear a 300–600 dpi o sacar una foto con luz pareja y la hoja completa en el encuadre. Guarda las imágenes en `scans/` como `pagina-1.jpg`, `pagina-2.jpg` y `pagina-3.jpg` (también sirven PNG y TIFF). Las celdas vacías se ignoran.

## 3. Construir

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt   # solo la primera vez
.venv/bin/python build_font.py
```

Esto genera lo siguiente en `out/`:
- `joan-hand.otf`: para instalarla en el computador y usarla en Figma.
- `joan-hand.woff2`: para la web.
- `muestra.png`: un texto de prueba con todos los caracteres.
- `debug/pagina-N.jpg`: la página enderezada con en rojo lo que se detectó como tinta.

Opciones útiles:
- `--publicar` copia el `.woff2` a `public/fonts/`.
- `--espaciado 50` define el aire a cada lado de cada letra.
- `--espacio 320` define el ancho del espacio.
- `--umbral 0.6` controla la sensibilidad: súbelo si se pierden trazos finos y bájalo si entran sombras.
- `--nombre "Joan Hand"` cambia el nombre de la familia.
