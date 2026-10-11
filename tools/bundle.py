"""Build the single-file version of the site.

Inlines the local stylesheet and scripts referenced by index.html into one HTML file.
Web fonts and Three.js stay as links to their CDNs.

usage: python3 tools/bundle.py [out.html]   (default: warp-weft-standalone.html)
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
out = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "warp-weft-standalone.html"
html = (ROOT / "index.html").read_text()


def inline_css(m):
    href = m.group(1)
    if href.startswith("http"):
        return m.group(0)
    return f"<style>\n{(ROOT / href).read_text()}\n</style>"


def inline_js(m):
    src = m.group(1)
    if src.startswith("http"):
        return m.group(0)
    js = re.sub(r"</(script)", r"<\\/\1", (ROOT / src).read_text(), flags=re.I)
    return f"<script>/* {src} */\n{js}\n</script>"


html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', inline_css, html)
html = re.sub(r'<script src="([^"]+)"></script>', inline_js, html)
out.write_text(html)
print(f"wrote {out} ({out.stat().st_size / 1024:.0f} KiB)")
