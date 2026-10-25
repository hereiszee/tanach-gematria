"""Assemble the single-file app from src/ and data/.

  index.html     full HTML document for GitHub Pages; the nikud text is fetched from data/nikud.txt on demand
  sw.js          service worker for the site, versioned by the index.html hash
  artifact.html  body-only version with the nikud text embedded, for publishing as a Claude artifact
"""
import base64
import hashlib
from pathlib import Path

root = Path(__file__).parent
head = (root / 'src/head.html').read_text(encoding='utf-8')
body = (root / 'src/body.html').read_text(encoding='utf-8')
js = (root / 'src/app.js').read_text(encoding='utf-8')


def font_face(family, path):
    b64 = base64.b64encode((root / path).read_bytes()).decode()
    return f"@font-face {{ font-family: '{family}'; src: url(data:font/woff2;base64,{b64}) format('woff2'); font-display: swap; }}"


fonts = '\n'.join([font_face('Stam Ashkenaz CLM', 'fonts/StamAshkenazCLM.woff2'), font_face('Stam Sefarad CLM', 'fonts/StamSefaradCLM.woff2')])
head = head.replace('/*FONTS*/', fonts, 1)
data = (root / 'data/tanach.txt').read_text(encoding='utf-8')
nikud = (root / 'data/nikud.txt').read_text(encoding='utf-8')

# The texts are embedded verbatim inside <script type="text/plain"> blocks, so they must not be able
# to close the block or carry entities; the plain text must also stay inside the 27-letter alphabet
# the app indexes (any other character would silently count as a word break).
for name, text in (('tanach.txt', data), ('nikud.txt', nikud)):
    assert '<' not in text and '&' not in text, f'{name}: contains < or &'
ALPHABET = set(' אבגדהוזחטיכלמנסעפצקרשתךםןףץ')
for n, line in enumerate(data.split('\n'), 1):
    if not line or line[0] == '@':
        continue
    words = line[line.index(' ') + 1:]
    bad = set(words) - ALPHABET
    if bad:
        raise SystemExit(f'data/tanach.txt line {n}: unexpected character(s) {sorted(bad)}')

script = f'<script>\n{js}</script>\n'
site_payload = f'{body}\n<script type="text/plain" id="tanach-data">\n{data}\n</script>\n{script}'
artifact_payload = f'{body}\n<script type="text/plain" id="tanach-data">\n{data}\n</script>\n<script type="text/plain" id="nikud-data">\n{nikud}\n</script>\n{script}'

# Content-Security-Policy: the one inline script is allowed by its hash (the hashed text is exactly
# what sits between <script> and </script>), styles are inline, fonts come from Google Fonts or data URIs.
js_hash = base64.b64encode(hashlib.sha256(('\n' + js).encode('utf-8')).digest()).decode()
csp = (
    "default-src 'none'; "
    f"script-src 'sha256-{js_hash}'; "
    "style-src 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src data: https://fonts.gstatic.com; "
    "img-src 'self' data:; connect-src 'self'; manifest-src 'self'; worker-src 'self'; "
    "base-uri 'none'; form-action 'none'"
)

(root / 'artifact.html').write_text(f'{head}\n{artifact_payload}', encoding='utf-8')
index = (
    '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
    f'<meta http-equiv="Content-Security-Policy" content="{csp}">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    '<meta name="description" content="Search all of Tanach by gematria or exact text, with Atbash, Albam, milui and more.">\n'
    '<meta name="theme-color" media="(prefers-color-scheme: light)" content="#f2f4f8">\n'
    '<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0e121a">\n'
    '<link rel="icon" href="icons/favicon.svg" type="image/svg+xml">\n'
    '<link rel="icon" href="icons/favicon-32.png" sizes="32x32" type="image/png">\n'
    '<link rel="apple-touch-icon" href="icons/icon-180.png">\n'
    '<link rel="manifest" href="manifest.webmanifest">\n'
    '<meta name="mobile-web-app-capable" content="yes">\n'
    '<meta name="apple-mobile-web-app-capable" content="yes">\n'
    '<meta name="apple-mobile-web-app-title" content="Gematria">\n'
    '<meta name="apple-mobile-web-app-status-bar-style" content="default">\n'
    f'{head}\n</head>\n<body data-sw="sw.js">\n{site_payload}</body>\n</html>\n'
)
(root / 'index.html').write_text(index, encoding='utf-8')

# The service worker's cache name changes whenever the page does, so a new build replaces the old copy.
version = hashlib.sha256(index.encode('utf-8')).hexdigest()[:12]
sw = (root / 'src/sw.js').read_text(encoding='utf-8').replace('__VERSION__', version, 1)
(root / 'sw.js').write_text(sw, encoding='utf-8')
print('built', len(index.encode('utf-8')), 'bytes; version', version)
