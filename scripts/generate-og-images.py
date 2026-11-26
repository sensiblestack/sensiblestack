#!/usr/bin/env python3
"""Generate Sensible Stack Open Graph images and refresh social meta tags.

Each card is HTML, set in the site's self-hosted Inter faces and brand
colours, screenshotted with headless Chrome at 1200x630, then saved as an
optimised JPEG under assets/og/. Review cards include the Sensible Score
when the page publishes one. The matching page gets og:image,
og:image:width, og:image:height, twitter:card=summary_large_image and
twitter:image.

Usage, from the repo root:

    pip install pillow
    python3 scripts/generate-og-images.py

Requires Google Chrome or Chromium on PATH (or CHROME_PATH).
"""

from __future__ import annotations

import html
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OG_DIR = ROOT / "assets" / "og"
FONTS = ROOT / "assets" / "fonts"
WIDTH = 1200
HEIGHT = 630
MAX_BYTES = 200 * 1024
SITE = "https://sensiblestack.io"

# icon.svg, inlined so the screenshot does not depend on a second request.
ICON_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" aria-hidden="true">
  <rect x="8" y="8" width="224" height="224" rx="48" fill="#0E3A45"/>
  <rect x="52" y="62" width="84" height="30" rx="15" fill="#F2A93B"/>
  <rect x="52" y="105" width="118" height="30" rx="15" fill="#FFFFFF"/>
  <rect x="52" y="148" width="152" height="30" rx="15" fill="#7FC6B8"/>
</svg>"""


def chrome_bin() -> str:
    """The real Chrome binary, not a wrapper that shares a debugging profile."""
    env = os.environ.get("CHROME_PATH")
    if env:
        return env
    for path in ("/opt/google/chrome/chrome", "/usr/lib/chromium/chromium"):
        if Path(path).is_file():
            return path
    for name in ("chromium", "chromium-browser"):
        found = shutil.which(name)
        if found:
            return found
    sys.exit("Headless Chrome not found. Set CHROME_PATH or install Google Chrome.")


def discover() -> list[tuple[Path, str, str]]:
    """Pages that receive a share image: home, reviews, comparisons, guides."""
    pages: list[tuple[Path, str, str]] = [(ROOT / "index.html", "home", "home")]
    for section, kind in (("tools", "review"), ("compare", "comparison"), ("guides", "guide")):
        for path in sorted((ROOT / section).glob("*/index.html")):
            pages.append((path, f"{section}-{path.parent.name}", kind))
    setup = ROOT / "setup" / "highlevel" / "index.html"
    if setup.exists():
        pages.append((setup, "setup-highlevel", "guide"))
    return pages


def page_title(source: str) -> str:
    match = re.search(r"<title>(.*?)</title>", source, re.S)
    if not match:
        sys.exit("Page is missing a <title>.")
    title = html.unescape(match.group(1)).split("|", 1)[0].strip()
    return re.sub(r"\s+", " ", title)


def card_title(title: str, kind: str) -> str:
    # Reviews read as "HighLevel Review 2026" on the card. Titles that
    # already name the year, such as "Jotform Review 2026: Pricing, Pros
    # & Cons", are used as they stand.
    if kind == "review" and "2026" not in title:
        return f"{title} 2026"
    return title


def review_score(source: str, kind: str) -> str | None:
    if kind != "review":
        return None
    verdict = re.search(r"Verdict:\s*([0-9]+(?:\.[0-9]+)?)\s*out of 10", source)
    if verdict:
        return verdict.group(1)
    big = re.search(r'class="big">([0-9]+(?:\.[0-9]+)?)', source)
    if big:
        return big.group(1)
    return None


def title_size(title: str, has_score: bool) -> int:
    length = len(title)
    if has_score:
        if length <= 22:
            return 64
        if length <= 36:
            return 56
        return 48
    if length <= 24:
        return 78
    if length <= 42:
        return 64
    return 54


def font_faces() -> str:
    rules = []
    for weight, name in (
        (400, "inter-latin-400.woff2"),
        (600, "inter-latin-600.woff2"),
        (700, "inter-latin-700.woff2"),
        (800, "inter-latin-800.woff2"),
    ):
        uri = (FONTS / name).resolve().as_uri()
        rules.append(
            "@font-face{"
            "font-family:Inter;font-style:normal;font-weight:%d;font-display:block;"
            'src:url("%s") format("woff2");}' % (weight, uri)
        )
    return "\n".join(rules)


def card_html(title: str, score: str | None) -> str:
    size = title_size(title, score is not None)
    score_html = ""
    if score is not None:
        score_html = (
            '<div class="score"><p class="label">Sensible Score</p>'
            f'<p class="num">{html.escape(score)}</p>'
            '<p class="of">out of 10</p></div>'
        )
    return f"""<!DOCTYPE html>
<html lang="en-GB" data-font-ok="0"><head><meta charset="utf-8">
<style>
{font_faces()}
*{{box-sizing:border-box}}
html,body{{margin:0;width:{WIDTH}px;height:{HEIGHT}px;overflow:hidden}}
body{{font-family:Inter,"Helvetica Neue",Arial,sans-serif;color:#fff;background:#0E3A45}}
.bg{{position:absolute;inset:0;background:
  radial-gradient(640px 380px at 108% -8%, rgba(127,198,184,.40), transparent 62%),
  radial-gradient(520px 320px at -12% 118%, rgba(242,169,59,.24), transparent 60%),
  linear-gradient(145deg,#125263 0%,#0E3A45 46%,#092932 100%)}}
.card{{position:relative;height:100%;display:flex;flex-direction:column;padding:52px 64px 68px}}
.brand{{display:flex;align-items:center;gap:18px}}
.mark{{background:#fff;border-radius:22px;padding:7px;line-height:0;box-shadow:0 10px 24px rgba(0,0,0,.22)}}
.mark svg{{width:78px;height:78px;display:block}}
.wordmark{{line-height:.9}}
.wordmark .a{{display:block;font-weight:700;font-size:42px;letter-spacing:-.8px}}
.wordmark .b{{display:block;font-weight:400;font-size:42px;letter-spacing:-.6px;color:#7FC6B8}}
.main{{flex:1;display:flex;align-items:center;gap:36px;min-height:0}}
h1{{margin:0;flex:1 1 auto;min-width:0;font-weight:800;font-size:{size}px;line-height:1.04;letter-spacing:-1.6px;color:#fff;text-wrap:balance}}
.score{{flex:0 0 236px;background:#F2A93B;color:#092932;border-radius:28px;text-align:center;padding:22px 18px 18px}}
.score p{{margin:0}}
.score .label{{font-weight:800;font-size:15px;letter-spacing:.12em;text-transform:uppercase}}
.score .num{{font-weight:800;font-size:92px;line-height:.88;letter-spacing:-3px;margin-top:6px}}
.score .of{{font-weight:700;font-size:22px;margin-top:4px}}
.edge{{position:absolute;left:0;right:0;bottom:0;height:14px;background:#F2A93B}}
</style></head>
<body>
<div class="bg"></div>
<div class="card">
  <div class="brand"><span class="mark">{ICON_SVG}</span>
    <div class="wordmark"><span class="a">Sensible</span><span class="b">Stack</span></div>
  </div>
  <div class="main"><h1>{html.escape(title)}</h1>{score_html}</div>
  <div class="edge"></div>
</div>
<script>
document.fonts.ready.then(function () {{
  var ok = document.fonts.check("800 {size}px Inter") && document.fonts.check("700 42px Inter") && document.fonts.check("400 42px Inter");
  document.documentElement.setAttribute("data-font-ok", ok ? "1" : "0");
}});
</script>
</body></html>
"""


def run_chrome(chrome: str, html_path: Path, extra: list[str], profile: Path) -> subprocess.CompletedProcess[str]:
    cmd = [
        chrome,
        f"--user-data-dir={profile}",
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--hide-scrollbars",
        "--no-first-run",
        "--disable-extensions",
        "--force-device-scale-factor=1",
        f"--window-size={WIDTH},{HEIGHT}",
        "--virtual-time-budget=10000",
        "--timeout=15000",
        *extra,
        html_path.resolve().as_uri(),
    ]
    try:
        return subprocess.run(cmd, check=False, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=40)
    except subprocess.TimeoutExpired as exc:
        err = exc.stderr or ""
        if isinstance(err, bytes):
            err = err.decode("utf-8", "replace")
        sys.exit(f"Chrome timed out on {html_path.name}.\n{err[-500:]}")


def assert_fonts(chrome: str, html_path: Path, profile: Path) -> None:
    proc = run_chrome(chrome, html_path, ["--dump-dom"], profile)
    if proc.returncode != 0 or 'data-font-ok="1"' not in proc.stdout:
        sys.exit(
            "Inter did not load for the share card. Chrome said:\n"
            + (proc.stderr or proc.stdout)[-2000:]
        )


def save_jpeg(png_path: Path, jpg_path: Path) -> int:
    image = Image.open(png_path).convert("RGB")
    if image.size != (WIDTH, HEIGHT):
        width, height = image.size
        if width >= WIDTH and height >= HEIGHT and width % WIDTH == 0 and height % HEIGHT == 0:
            image = image.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
        elif width >= WIDTH and height >= HEIGHT:
            image = image.crop((0, 0, WIDTH, HEIGHT))
        else:
            sys.exit(f"Unexpected screenshot size {image.size} for {png_path.name}")
    last = MAX_BYTES + 1
    for quality in (88, 84, 80, 76, 72, 68, 64):
        image.save(
            jpg_path,
            "JPEG",
            quality=quality,
            optimize=True,
            progressive=True,
            subsampling=0,
        )
        last = jpg_path.stat().st_size
        if last < MAX_BYTES:
            return last
    sys.exit(f"{jpg_path.name} is {last} bytes, above the {MAX_BYTES} byte limit.")


def upsert_meta(source: str, url: str) -> str:
    if 'property="og:image"' not in source:
        sys.exit("Page is missing og:image.")
    if '<meta name="twitter:card"' not in source:
        sys.exit("Page is missing twitter:card.")
    updated = re.sub(
        r'(<meta property="og:image" content=")[^"]*(">)',
        rf"\1{url}\2",
        source,
        count=1,
    )
    updated = re.sub(r'\n<meta property="og:image:width" content="[^"]*">', "", updated, count=1)
    updated = re.sub(r'\n<meta property="og:image:height" content="[^"]*">', "", updated, count=1)
    updated = re.sub(r'\n<meta name="twitter:image" content="[^"]*">', "", updated, count=1)
    updated = updated.replace(
        '<meta name="twitter:card" content="summary">',
        '<meta name="twitter:card" content="summary_large_image">',
        1,
    )
    image_tag = f'<meta property="og:image" content="{url}">'
    if image_tag not in updated:
        sys.exit("Could not rewrite og:image.")
    updated = updated.replace(
        image_tag,
        image_tag
        + '\n<meta property="og:image:width" content="1200">'
        + '\n<meta property="og:image:height" content="630">',
        1,
    )
    card_tag = '<meta name="twitter:card" content="summary_large_image">'
    if card_tag not in updated:
        sys.exit("Could not rewrite twitter:card.")
    updated = updated.replace(
        card_tag,
        card_tag + f'\n<meta name="twitter:image" content="{url}">',
        1,
    )
    return updated


def main() -> None:
    chrome = chrome_bin()
    OG_DIR.mkdir(parents=True, exist_ok=True)
    pages = discover()
    if not pages:
        sys.exit("No pages to render.")
    with tempfile.TemporaryDirectory(prefix="ss-og-") as tmp:
        tmp_path = Path(tmp)
        sample = tmp_path / "sample.html"
        first_path, _, first_kind = pages[0]
        first_html = first_path.read_text(encoding="utf-8")
        sample.write_text(
            card_html(card_title(page_title(first_html), first_kind), review_score(first_html, first_kind)),
            encoding="utf-8",
        )
        assert_fonts(chrome, sample, tmp_path / "profile-fonts")
        for path, slug, kind in pages:
            source = path.read_text(encoding="utf-8")
            title = card_title(page_title(source), kind)
            score = review_score(source, kind)
            html_path = tmp_path / f"{slug}.html"
            png_path = tmp_path / f"{slug}.png"
            jpg_path = OG_DIR / f"{slug}.jpg"
            html_path.write_text(card_html(title, score), encoding="utf-8")
            shot = run_chrome(chrome, html_path, [f"--screenshot={png_path.resolve()}"], tmp_path / f"profile-{slug}")
            if shot.returncode != 0 or not png_path.exists():
                sys.exit(f"Screenshot failed for {slug}.\n{(shot.stderr or shot.stdout)[-2000:]}")
            size = save_jpeg(png_path, jpg_path)
            url = f"{SITE}/assets/og/{slug}.jpg"
            rewritten = upsert_meta(source, url)
            if rewritten != source:
                path.write_text(rewritten, encoding="utf-8")
            score_note = f" score {score}" if score else ""
            print(f"{slug}.jpg  {size:6d} bytes  {title}{score_note}")
    print(f"Wrote {len(pages)} images to {OG_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
