"""Assemble the single-file app from src/ and data/.

  index.html     full HTML document (GitHub Pages)
  artifact.html  body-only version for publishing as a Claude artifact
"""
from pathlib import Path

root = Path(__file__).parent
head = (root / 'src/head.html').read_text(encoding='utf-8')
body = (root / 'src/body.html').read_text(encoding='utf-8')
js = (root / 'src/app.js').read_text(encoding='utf-8')
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
