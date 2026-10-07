"""Assemble the single-file app from src/ and data/.

  index.html     full HTML document (GitHub Pages)
  artifact.html  body-only version for publishing as a Claude artifact
"""
from pathlib import Path

root = Path(__file__).parent
head = (root / 'src/head.html').read_text(encoding='utf-8')
body = (root / 'src/body.html').read_text(encoding='utf-8')
js = (root / 'src/app.js').read_text(encoding='utf-8')
import base64
def font_face(family, path):
    b64 = base64.b64encode((root / path).read_bytes()).decode()
    return f"@font-face {{ font-family: '{family}'; src: url(data:font/woff2;base64,{b64}) format('woff2'); font-display: swap; }}"
fonts = '\n'.join([font_face('Stam Ashkenaz CLM', 'fonts/StamAshkenazCLM.woff2'), font_face('Stam Sefarad CLM', 'fonts/StamSefaradCLM.woff2')])
head = head.replace('/*FONTS*/', fonts, 1)
data = (root / 'data/tanach.txt').read_text(encoding='utf-8')
nikud = (root / 'data/nikud.txt').read_text(encoding='utf-8')
assert '<' not in data and '<' not in nikud

payload = f'{body}\n<script type="text/plain" id="tanach-data">\n{data}\n</script>\n<script type="text/plain" id="nikud-data">\n{nikud}\n</script>\n<script>\n{js}</script>\n'

(root / 'artifact.html').write_text(f'{head}\n{payload}', encoding='utf-8')
(root / 'index.html').write_text(
    '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    '<meta name="description" content="Search all of Tanach by gematria or exact text, with Atbash, Albam, milui and more.">\n'
    '<meta name="theme-color" media="(prefers-color-scheme: light)" content="#f2f4f8">\n'
    '<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0e121a">\n'
    f'{head}\n</head>\n<body>\n{payload}</body>\n</html>\n', encoding='utf-8')
print('built', len((root / "index.html").read_bytes()), 'bytes')
