#!/usr/bin/env python3
"""Prepare and finish the SECTION 6 logo SVGs (Phoenix + White Rose). See the plan:
docs/plans/2026-10-13-logo-design-and-brand-expansion.md, Track A.

Illustrator Image Trace runs on SOL between the two steps (creative-hub/scripts/sol-run.sh).

    prepare  PSD + Phoenix PNG -> trace-ready PNGs in OUT/{color,bw,phoenix}/
    finish   traced SVGs       -> named SVGs in OUT: B&W roses de-magentaed with white petals, Phoenix filled

Run with uv so the deps stay out of the repo:

    uv run --with psd-tools --with numpy --with pillow python scripts/logo-traces.py prepare \
        --psd "$ART/Procreate to PSD/White Rose Logo.psd" --phoenix "$ART/PhoenixSymbol.png" --out /tmp/logo-in
    # trace on SOL, three runs (one preset each):
    #   color/    "6 Colors"     bw/  "6 Colors" (magenta backdrop)     phoenix/  "Black and White Logo"
    uv run python scripts/logo-traces.py finish --color DIR --bw DIR --phoenix DIR --out "$ART/SECTION 6 Logo Design"

After `finish`, run the art repo's crop on the output (it needs that repo's rasterize.py and recolor.py):

    cd ~/Repos/cash/scripts && uv run --with pillow --with resvg-py --with numpy python crop_svg.py -i "$OUT" --strip-bg --pad 20

That removes the Illustrator canvas path (the color roses and the Phoenix still have it; the B&W roses lost
theirs in `finish`) and crops each viewBox to the art. Then render every file on a dark backdrop and look.
"""
import argparse
import re
import sys
from pathlib import Path

MAGENTA = (255, 0, 255)       # backdrop for the B&W roses; deleted after the trace
PHOENIX_FILL = "#610000"      # the Phoenix art's own colour (median of its opaque pixels)
# PSD group -> short name. rose1 is the open rose, "New group" the bud.
GROUPS = {"rose1": "open", "New group": "bud"}
# output name for each traced file
NAMES = {
    "rose-open-color": "white-rose-1-color", "rose-open-bw": "white-rose-1-bw",
    "rose-bud-color": "white-rose-2-color", "rose-bud-bw": "white-rose-2-bw",
}


def prepare(a):
    import numpy as np
    from PIL import Image
    from psd_tools import PSDImage

    out = Path(a.out)
    for d in ("color", "bw", "phoenix"):
        (out / d).mkdir(parents=True, exist_ok=True)
    psd = PSDImage.open(a.psd)
    groups = {g.name: g for g in psd if g.is_group()}
    for gname, tag in GROUPS.items():
        color = Image.new("RGBA", psd.size, (0, 0, 0, 0))
        bw = Image.new("RGBA", psd.size, (0, 0, 0, 0))
        for layer in groups[gname]:          # psd-tools lists bottom first
            if not layer.visible:
                continue
            im = layer.composite().convert("RGBA")
            color.alpha_composite(im)
            if layer.name == "If Colored":   # the green layers: any non-black pixel becomes white
                px = np.array(im).astype(float)
                t = np.clip((px[..., :3].max(axis=2) - 10) / 40, 0, 1)
                px[..., :3] = (t * 255)[..., None]
                im = Image.fromarray(px.astype("uint8"), "RGBA")
            bw.alpha_composite(im)
        color.save(out / "color" / f"rose-{tag}-color.png")
        # B&W on a solid magenta canvas with a hard alpha edge: the bud's stem outline has gaps, so on
        # white its white fill merges with the canvas and is stripped with it.
        px = np.array(bw).astype(float)
        solid = px[..., 3] >= 128
        flat = np.zeros(px.shape[:2] + (3,), np.uint8)
        flat[...] = MAGENTA
        flat[solid] = px[solid][:, :3].astype(np.uint8)
        Image.fromarray(flat, "RGB").save(out / "bw" / f"rose-{tag}-bw.png")
    ph = np.array(Image.open(a.phoenix).convert("RGBA"))
    ph[..., :3] = 0                          # traced as black, filled PHOENIX_FILL by `finish`
    Image.fromarray(ph, "RGBA").save(out / "phoenix" / "phoenix.png")
    print("prepared in", out)


PATH_RE = re.compile(r"<path\b[^>]*?/>|<path\b[^>]*?>\s*</path>", re.S)


def finish(a):
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    for src, dst in NAMES.items():
        folder = Path(a.bw if src.endswith("-bw") else a.color)
        svg = (folder / f"{src}.svg").read_text(encoding="latin-1")
        if src.endswith("-bw"):
            svg = PATH_RE.sub(lambda m: "" if re.search(r"fill:#FE00FE", m.group(0), re.I) else m.group(0), svg)
            if re.search(r"FE00FE", svg, re.I):
                sys.exit(f"{src}: magenta backdrop still present")
            # petals, leaf and stem: every light fill to pure white; the outline stays near-black
            def white(m):
                h = m.group(1)
                return "fill:#FFFFFF" if sum(int(h[i:i + 2], 16) for i in (1, 3, 5)) / 3 > 128 else m.group(0)
            svg = re.sub(r"fill:(#[0-9A-Fa-f]{6})", white, svg)
        (out / f"{dst}.svg").write_text(svg, encoding="latin-1")
    ph = (Path(a.phoenix) / "phoenix.svg").read_text(encoding="latin-1")
    if ph.count("<g>") != 1:
        sys.exit("phoenix.svg: expected exactly one <g>")
    (out / "phoenix-logo.svg").write_text(ph.replace("<g>", f'<g fill="{PHOENIX_FILL}">'), encoding="latin-1")
    print("finished in", out)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("prepare")
    p.add_argument("--psd", required=True); p.add_argument("--phoenix", required=True); p.add_argument("--out", required=True)
    p.set_defaults(fn=prepare)
    f = sub.add_parser("finish")
    f.add_argument("--color", required=True); f.add_argument("--bw", required=True)
    f.add_argument("--phoenix", required=True); f.add_argument("--out", required=True)
    f.set_defaults(fn=finish)
    a = ap.parse_args()
    a.fn(a)
