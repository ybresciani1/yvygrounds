"""Draws the pumpkin plant diagram for plants/pumpkin/ (plants/art/pumpkin-plant.svg).

One drawing does two jobs: the plant page colors it in (plants/plants.css → .pp-colored), and the
coloring page prints it as black outlines on white. Every shape gets a class (c-leaf, c-fruit...)
instead of a fill, so the page decides the colors. Labels are part of the drawing.

    python tools/plant-art/pumpkin.py
"""
import math
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "plants" / "art" / "pumpkin-plant.svg"
W, H = 800, 800
parts = []


def f(n):
    return f"{n:.1f}".rstrip("0").rstrip(".")


def smooth(pts, closed=True):
    """Catmull-Rom through the points, as a cubic Bezier path."""
    n = len(pts)
    d = f"M{f(pts[0][0])},{f(pts[0][1])}"
    rng = range(n) if closed else range(n - 1)
    for i in rng:
        p0 = pts[(i - 1) % n] if closed or i > 0 else pts[i]
        p1, p2 = pts[i], pts[(i + 1) % n]
        p3 = pts[(i + 2) % n] if closed or i + 2 < n else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C{f(c1[0])},{f(c1[1])} {f(c2[0])},{f(c2[1])} {f(p2[0])},{f(p2[1])}"
    return d + (" Z" if closed else "")


def add(tag, cls, **attrs):
    a = " ".join(f'{k.replace("_", "-")}="{v}"' for k, v in attrs.items())
    parts.append(f'<{tag} class="{cls}" {a}/>')


def leaf(bx, by, R, tilt):
    """A pumpkin leaf: broad, five shallow pointed lobes, a heart-shaped notch where the leaf stalk joins,
    tiny teeth on the edge. (bx, by) is where the stalk joins; tilt in degrees (0 = pointing up)."""
    t = math.radians(tilt)
    pts = []
    N = 120
    for i in range(N):
        phi = -math.pi + 2 * math.pi * i / N  # 0 = the leaf's tip
        lobes = 0.58 + 0.42 * abs(math.cos(phi * 2.5)) ** 0.55
        notch = 1 - 0.85 * math.exp(-(((abs(phi) - math.pi) / 0.42) ** 2))
        teeth = 1 + 0.025 * math.sin(phi * 38)
        r = R * lobes * notch * teeth
        x, y = r * math.sin(phi), -r * math.cos(phi) - R * 0.12
        pts.append((bx + x * math.cos(t) - y * math.sin(t), by + x * math.sin(t) + y * math.cos(t)))
    add("path", "c-leaf", d=smooth(pts))
    # veins: from the base out to each lobe
    for phi in (0, 1.25, -1.25, 2.4, -2.4):
        r = R * (0.82 if phi == 0 else 0.7)
        mx, my = 0.55 * r * math.sin(phi * 0.92), -0.55 * r * math.cos(phi * 0.92) - R * 0.1
        ex, ey = r * math.sin(phi), -r * math.cos(phi) - R * 0.12
        rot = lambda x, y: (bx + x * math.cos(t) - y * math.sin(t), by + x * math.sin(t) + y * math.cos(t))
        a, m, e = rot(0, -R * 0.05), rot(mx, my), rot(ex, ey)
        add("path", "c-vein", stroke_width=2, fill="none", d=f"M{f(a[0])},{f(a[1])} Q{f(m[0])},{f(m[1])} {f(e[0])},{f(e[1])}")


def stalk(x1, y1, x2, y2, bend, w=7, cls="c-stem"):
    """A stalk, vine bit or root: an outline (a wide dark line) with a white middle to color in."""
    mx, my = (x1 + x2) / 2 + bend, (y1 + y2) / 2
    d = f"M{f(x1)},{f(y1)} Q{f(mx)},{f(my)} {f(x2)},{f(y2)}"
    add("path", "c-out", d=d, stroke_width=w + 5, fill="none")
    add("path", cls, d=d, stroke_width=w, stroke="#fff", fill="none")


def tendril(x, y, turns, r, flip=1):
    pts = []
    n = int(turns * 28)
    for i in range(n):
        a = i / 28 * 2 * math.pi
        rr = r * (1 - i / n * 0.75)
        pts.append((x + flip * (i * 1.6 + rr * math.cos(a)), y - rr * math.sin(a) - i * 0.6))
    add("path", "c-tendril", d=smooth(pts, closed=False), stroke_width=3.5, fill="none")


def flower(x, y, s, female=False, tilt=0):
    """A pumpkin flower from the side: a yellow trumpet with five pointed lobes at the rim. (x, y) is its base.
    A female flower has a tiny round pumpkin (the ovary) right under the petals."""
    g = []
    rim = [(-48, -80), (-30, -70), (-18, -92), (0, -78), (18, -92), (30, -70), (48, -80)]
    cup = [(0, 0), (-12, -24), (-28, -52)] + rim + [(28, -52), (12, -24)]
    pts = [(x + px * s, y + py * s) for px, py in cup]
    tr = f' transform="rotate({tilt} {f(x)} {f(y)})"'
    g.append(f'<path class="c-flower" d="{smooth(pts)}"/>')
    for tx in (-48, -18, 18, 48):
        g.append(f'<path class="c-petalvein" stroke-width="2" fill="none" d="M{f(x)},{f(y - 6 * s)} Q{f(x + tx * 0.35 * s)},{f(y - 50 * s)} {f(x + tx * s * 0.92)},{f(y - 80 * s)}"/>')
    # the middle: pollen-covered stamens (male) or a three-part stigma (female) peeking out
    if female:
        for dx in (-9, 0, 9):
            g.append(f'<ellipse class="c-stigma" cx="{f(x + dx * s)}" cy="{f(y - 82 * s)}" rx="{f(7 * s)}" ry="{f(6 * s)}"/>')
    else:
        g.append(f'<rect class="c-stamen" x="{f(x - 6 * s)}" y="{f(y - 92 * s)}" width="{f(12 * s)}" height="{f(22 * s)}" rx="{f(6 * s)}"/>')
    if female:
        g.append(f'<ellipse class="c-ovary" cx="{f(x)}" cy="{f(y + 14 * s)}" rx="{f(17 * s)}" ry="{f(15 * s)}"/>')
        for dx in (-7, 0, 7):
            g.append(f'<path class="c-rib" stroke-width="2" fill="none" d="M{f(x + dx * 0.3 * s)},{f(y + 1 * s)} Q{f(x + dx * 1.6 * s)},{f(y + 14 * s)} {f(x + dx * 0.3 * s)},{f(y + 28 * s)}"/>')
    parts.append(f"<g{tr}>" + "".join(g) + "</g>")


def label(text, x, y, tx, ty, anchor="middle"):
    """A label at (x, y) with a dashed line to the part at (tx, ty)."""
    parts.append(f'<path class="c-leader" stroke-width="2" stroke-dasharray="6 5" fill="none" d="M{f(x)},{f(y)} L{f(tx)},{f(ty)}"/>')
    parts.append(f'<circle class="c-dot" fill="#2b1a52" cx="{f(tx)}" cy="{f(ty)}" r="5"/>')
    lines = text.split("|")
    w = max(len(s) for s in lines) * 10.5 + 24
    h = 26 * len(lines) + 8
    bx = x - w / 2 if anchor == "middle" else (x if anchor == "start" else x - w)
    parts.append(f'<rect class="c-label" stroke-width="2.5" x="{f(bx)}" y="{f(y - h / 2)}" width="{f(w)}" height="{f(h)}" rx="12"/>')
    for i, s in enumerate(lines):
        parts.append(f'<text class="c-text" stroke="none" fill="#2b1a52" text-anchor="middle" x="{f(bx + w / 2)}" y="{f(y - h / 2 + 25 + i * 26)}">{s}</text>')


# ---- ground and roots ----
add("path", "c-soil", d=f"M0,612 C120,604 260,618 400,610 S640,604 {W},612 L{W},{H} L0,{H} Z")
for (ex, ey, bend) in ((112, 760, -6), (70, 712, -20), (160, 724, 18), (40, 670, -10), (200, 676, 10), (126, 700, 30)):
    stalk(112, 616, ex, ey, bend, w=6, cls="c-root")
for (sx, sy, ex, ey) in ((90, 660, 60, 690), (140, 650, 175, 680), (100, 720, 80, 748), (120, 700, 150, 735)):
    stalk(sx, sy, ex, ey, 6, w=3, cls="c-root")

# ---- the vine ----
vine = [(112, 612), (170, 560), (250, 500), (330, 450), (430, 412), (540, 388), (640, 400), (730, 440), (800, 470)]
add("path", "c-out", d=smooth(vine, closed=False), stroke_width=17, fill="none")
add("path", "c-vine", d=smooth(vine, closed=False), stroke_width=12, stroke="#fff", fill="none")

# ---- leaves on their stalks (behind the flowers) ----
stalk(250, 500, 190, 360, -30)
leaf(190, 360, 108, -18)
stalk(560, 389, 585, 240, 25)
leaf(585, 240, 118, 8)
stalk(735, 442, 760, 330, 10)
leaf(760, 330, 70, 22)

# ---- tendrils ----
tendril(392, 428, 2.4, 22)
tendril(640, 400, 2.2, 18, flip=-1)

# ---- flowers ----
stalk(330, 450, 350, 236, 18, w=5)          # male flowers sit up high on long, thin stalks
flower(350, 236, 1.05)
stalk(735, 442, 705, 392, -6, w=6)          # female flowers sit low on short stalks
flower(705, 380, 0.95, female=True, tilt=-8)

# ---- the pumpkin ----
cx, cy, rx, ry = 455, 528, 152, 100
body = []
for i in range(96):
    a = 2 * math.pi * i / 96
    bump = 1 + 0.035 * abs(math.sin(a * 3.5))
    top = 1 - 0.07 * math.exp(-((math.cos(a) - 1) ** 2) / 0.02) if False else 1
    x = cx + rx * math.sin(a) * bump
    y = cy - ry * math.cos(a) * (0.94 if math.cos(a) > 0 else 1)
    body.append((x, y))
add("path", "c-fruit", d=smooth(body))
for k in (-3, -2, -1, 1, 2, 3):
    xo = rx * math.sin(k * math.pi / 8) * 0.95
    add("path", "c-rib", stroke_width=2.5, d=f"M{f(cx + xo * 0.25)},{f(cy - ry * 0.9)} Q{f(cx + xo * 1.18)},{f(cy)} {f(cx + xo * 0.3)},{f(cy + ry * 0.97)}", fill="none")
add("path", "c-rib", stroke_width=2.5, d=f"M{f(cx)},{f(cy - ry * 0.92)} L{f(cx)},{f(cy + ry)}", fill="none")
# its stem (the handle): short, thick and ridged, joining the vine
add("path", "c-handle", d=f"M{f(cx - 14)},{f(cy - ry * 0.88)} C{f(cx - 16)},{f(cy - ry - 14)} {f(cx - 22)},{f(cy - ry - 30)} {f(cx - 30)},{f(cy - ry - 40)} L{f(cx - 6)},{f(cy - ry - 46)} C{f(cx + 2)},{f(cy - ry - 30)} {f(cx + 12)},{f(cy - ry - 14)} {f(cx + 12)},{f(cy - ry * 0.88)} Z")

# ---- inside a pumpkin (a cut-open half) ----
ix, iy, ir = 680, 690, 92
parts.append(f'<circle class="c-inset" cx="{ix}" cy="{iy}" r="{ir}"/>')
add("ellipse", "c-rind", cx=ix, cy=iy + 6, rx=70, ry=56)
add("ellipse", "c-flesh", cx=ix, cy=iy + 6, rx=60, ry=46)
add("ellipse", "c-pulp", cx=ix, cy=iy + 6, rx=36, ry=27)
for (sx, sy, rot) in ((-20, -8, -30), (0, -14, 0), (20, -8, 30), (-24, 12, 30), (24, 12, -30), (0, 16, 0), (-8, 2, 70), (10, 2, -70)):
    add("ellipse", "c-seed", cx=ix + sx, cy=iy + 6 + sy, rx=7, ry=4.2, transform=f"rotate({rot} {ix + sx} {iy + 6 + sy})")
for dx in (-30, -14, 14, 30):
    add("path", "c-string", stroke_width=2, d=f"M{ix + dx * 0.6},{iy - 14} q{dx * 0.3},10 {dx * 0.2},26", fill="none")

# ---- labels ----
label("Leaf", 70, 214, 150, 290)
label("Tendril|(it grabs on)", 236, 384, 384, 404)
label("Male flower|(makes pollen)", 230, 128, 336, 158)
label("Female flower", 640, 124, 700, 288)
label("Baby pumpkin", 610, 470, 694, 396)
label("Vine (stem)", 530, 330, 488, 400)
label("Pumpkin|(the fruit)", 290, 566, 330, 546)
label("Roots", 250, 740, 160, 700)
label("Inside: seeds,|pulp and rind", 510, 724, 662, 690)

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" class="pp" role="img" '
       f'aria-labelledby="pp-title"><title id="pp-title">The parts of a pumpkin plant: roots, vine, leaves, tendrils, '
       f'male and female flowers, the pumpkin and the seeds inside</title>\n'
       '<g fill="#fff" stroke="#2b1a52" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">\n'
       + "\n".join(parts) + "\n</g></svg>\n")
OUT.write_text(svg, encoding="utf-8")
print("wrote", OUT, len(svg), "bytes")
