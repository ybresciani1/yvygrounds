"""Draws the honeybee diagram for plants/honeybee/ (plants/art/honeybee.svg).

Same idea as pumpkin.py and garden-spider.py: one drawing, colored on the page (plants/plants.css →
.pp-colored) and black outlines on the coloring page. A worker honeybee seen from above, wings spread,
with pollen in the baskets on her back legs, a bit of honeycomb and some flowers. A circle shows her
face up close (compound eyes, 3 simple eyes, mandibles, proboscis). Bee classes start with c-bee- so
they don't pick up the garden spider's colors.

    python tools/plant-art/honeybee.py
"""
import math
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "plants" / "art" / "honeybee.svg"
W, H = 800, 800
parts = []


def f(n):
    return f"{n:.1f}".rstrip("0").rstrip(".")


def smooth(pts, closed=True):
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


def poly(pts):
    return "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts) + " Z"


def add(tag, cls, **attrs):
    a = " ".join(f'{k.replace("_", "-")}="{v}"' for k, v in attrs.items())
    parts.append(f'<{tag} class="{cls}" {a}/>')


def tube(pts, w, cls):
    """A leg, antenna or stem: a dark outline with a white middle to color in."""
    d = "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts)
    add("path", "c-out", d=d, stroke_width=w + 5, fill="none")
    add("path", cls, d=d, stroke_width=w, stroke="#fff", fill="none")


def label(text, x, y, tx, ty):
    parts.append(f'<path class="c-leader" stroke-width="2" stroke-dasharray="6 5" fill="none" d="M{f(x)},{f(y)} L{f(tx)},{f(ty)}"/>')
    parts.append(f'<circle class="c-dot" fill="#2b1a52" cx="{f(tx)}" cy="{f(ty)}" r="5"/>')
    lines = text.split("|")
    w = max(len(s) for s in lines) * 10.5 + 24
    h = 26 * len(lines) + 8
    bx = x - w / 2
    parts.append(f'<rect class="c-label" stroke-width="2.5" x="{f(bx)}" y="{f(y - h / 2)}" width="{f(w)}" height="{f(h)}" rx="12"/>')
    for i, s in enumerate(lines):
        parts.append(f'<text class="c-text" stroke="none" fill="#2b1a52" text-anchor="middle" x="{f(x)}" y="{f(y - h / 2 + 25 + i * 26)}">{s}</text>')


# ---- a corner of honeycomb (top right): some cells hold honey, some are capped with wax ----
R = 19
for row in range(5):
    for col in range(7):
        hx_ = 640 + col * R * 1.5
        hy_ = -6 + row * R * math.sqrt(3) + (R * math.sqrt(3) / 2 if col % 2 else 0)
        if hx_ - R < 600 or hy_ - R * 0.87 > 92 - (hx_ - 640) * -0.25 or hy_ > 120:
            continue
        cls = "c-comb-cap" if (row + col) % 3 == 0 else ("c-comb-honey" if (row * 2 + col) % 4 == 1 else "c-comb")
        add("path", cls, d=poly([(hx_ + R * math.cos(math.radians(60 * k)), hy_ + R * math.sin(math.radians(60 * k))) for k in range(6)]), stroke_width=2.5)

# ---- flowers (bottom right): two cosmos and a lavender spike ----
def cosmos(fx, fy, r, n=8):
    for i in range(n):
        a = 2 * math.pi * i / n + 0.2
        px_, py_ = fx + r * 0.62 * math.cos(a), fy + r * 0.62 * math.sin(a)
        add("ellipse", "c-cosmos", cx=f(px_), cy=f(py_), rx=f(r * 0.5), ry=f(r * 0.26), transform=f"rotate({f(math.degrees(a))} {f(px_)} {f(py_)})")
    add("circle", "c-cosmos-mid", cx=fx, cy=fy, r=f(r * 0.3))


tube([(690, 800), (694, 740), (700, 690)], 7, "c-stem")
tube([(770, 800), (764, 700), (758, 610)], 7, "c-stem")
add("ellipse", "c-leaf", cx=726, cy=752, rx=26, ry=10, transform="rotate(-30 726 752)")
add("ellipse", "c-leaf", cx=742, cy=680, rx=24, ry=9, transform="rotate(35 742 680)")
cosmos(700, 680, 64)
cosmos(758, 600, 46)
tube([(600, 800), (604, 700), (610, 600)], 5, "c-stem")
for i in range(9):
    for s in (-1, 1):
        add("ellipse", "c-lavender", cx=f(610 + s * 7 - i * 0.6), cy=f(612 + i * 13), rx=7, ry=5)

# ---- the bee, seen from above: head at the top ----
cx = 400
# legs first (under the body): three pairs from the thorax; the back pair has a pollen basket
for s in (-1, 1):
    tube([(cx + s * 30, 276), (cx + s * 72, 240), (cx + s * 86, 200)], 6, "c-bee-leg")
    tube([(cx + s * 44, 300), (cx + s * 104, 330), (cx + s * 124, 382)], 6, "c-bee-leg")
    tube([(cx + s * 40, 318), (cx + s * 94, 398), (cx + s * 106, 474), (cx + s * 112, 496)], 7, "c-bee-leg")
    add("ellipse", "c-pollen", cx=f(cx + s * 101), cy=438, rx=13, ry=20, transform=f"rotate({-s * 8} {f(cx + s * 101)} 438)")
# antennae: bent at an elbow, like a real bee's
for s in (-1, 1):
    tube([(cx + s * 12, 190), (cx + s * 22, 152), (cx + s * 52, 120)], 4, "c-bee-antenna")

# the abdomen: a narrow waist, wide at the top, tapering to the stinger, with dark stripes
y0, y1 = 336, 536


def half(t):
    return 62 * math.sin(math.pi * t) ** 0.62 * (1 - 0.3 * t)


add("path", "c-bee-sting", d=f"M{cx - 5},{y1 - 4} L{cx},{y1 + 18} L{cx + 5},{y1 - 4} Z")
ts = [i / 40 for i in range(41)]
outline = [(cx - half(t), y0 + (y1 - y0) * t) for t in ts] + [(cx + half(t), y0 + (y1 - y0) * t) for t in reversed(ts)]
add("path", "c-bee-abd", d=smooth(outline[::2]))
for a, b in ((0.30, 0.40), (0.52, 0.62), (0.72, 0.81), (0.88, 0.95)):
    ya, yb = y0 + (y1 - y0) * a, y0 + (y1 - y0) * b
    steps = [a + (b - a) * i / 6 for i in range(7)]
    d = f"M{f(cx - half(a))},{f(ya)} Q{cx},{f(ya + 12)} {f(cx + half(a))},{f(ya)}"
    d += "".join(f" L{f(cx + half(t))},{f(y0 + (y1 - y0) * t)}" for t in steps[1:])
    d += f" Q{cx},{f(yb + 12)} {f(cx - half(b))},{f(yb)}"
    d += "".join(f" L{f(cx - half(t))},{f(y0 + (y1 - y0) * t)}" for t in reversed(steps[:-1]))
    add("path", "c-bee-band", d=d + " Z", stroke_width=2)

# the thorax: round and fuzzy; wings and legs attach here
for i in range(36):
    a = 2 * math.pi * i / 36
    x1, y1_ = cx + 52 * math.cos(a), 292 + 46 * math.sin(a)
    x2, y2 = cx + 61 * math.cos(a + 0.04), 292 + 55 * math.sin(a + 0.04)
    add("path", "c-fuzz", d=f"M{f(x1)},{f(y1_)} L{f(x2)},{f(y2)}", stroke_width=2.5, fill="none")
add("ellipse", "c-bee-thorax", cx=cx, cy=292, rx=54, ry=48)
for (dx, dy) in ((-22, -18), (0, -26), (22, -18), (-30, 6), (30, 6), (-12, 0), (12, 0), (0, 20), (-20, 24), (20, 24)):
    add("path", "c-fuzz", d=f"M{cx + dx},{292 + dy} l{-3 if dx < 0 else 3},-6", stroke_width=2, fill="none")

# the head: with big compound eyes on the sides
add("ellipse", "c-bee-head", cx=cx, cy=216, rx=40, ry=33)
for s in (-1, 1):
    add("ellipse", "c-bee-eye", cx=cx + s * 29, cy=212, rx=13, ry=24, transform=f"rotate({s * -12} {cx + s * 29} 212)")
    add("circle", "c-shine", cx=cx + s * 27 - 4, cy=200, r=3.5, stroke="none")

# four wings: a big forewing and a small hindwing on each side, hooked together, with veins
for s in (-1, 1):
    hw = [(cx + s * 40, 312), (cx + s * 92, 334), (cx + s * 150, 362), (cx + s * 164, 392), (cx + s * 132, 400), (cx + s * 82, 368)]
    add("path", "c-bee-wing", d=smooth(hw))
    fw = [(cx + s * 38, 268), (cx + s * 110, 246), (cx + s * 196, 252), (cx + s * 226, 282), (cx + s * 198, 318), (cx + s * 120, 330), (cx + s * 52, 310)]
    add("path", "c-bee-wing", d=smooth(fw))
    for v in ([(cx + s * 44, 284), (cx + s * 130, 270), (cx + s * 200, 278)],
              [(cx + s * 48, 298), (cx + s * 120, 302), (cx + s * 180, 300)],
              [(cx + s * 130, 270), (cx + s * 150, 300), (cx + s * 120, 322)],
              [(cx + s * 52, 334), (cx + s * 110, 356), (cx + s * 148, 386)]):
        add("path", "c-bee-vein", d=smooth(v, closed=False), stroke_width=1.8, fill="none")

# ---- close-up of the face ----
ix, iy, ir = 150, 655, 95
add("circle", "c-inset", cx=ix, cy=iy, r=ir)
add("path", "c-leader", d=f"M{cx - 30},{242} L{ix + 60},{iy - 74}", fill="none", stroke_width=2, stroke_dasharray="4 4")
for s in (-1, 1):
    tube([(ix + s * 8, iy - 36), (ix + s * 18, iy - 66), (ix + s * 44, iy - 80)], 5, "c-bee-antenna")
face = [(ix - 62, iy - 34), (ix - 40, iy - 58), (ix, iy - 64), (ix + 40, iy - 58), (ix + 62, iy - 34), (ix + 50, iy + 10), (ix + 24, iy + 42), (ix, iy + 50), (ix - 24, iy + 42), (ix - 50, iy + 10)]
add("path", "c-bee-face", d=smooth(face))
for s in (-1, 1):
    eye = [(ix + s * 30, iy - 50), (ix + s * 54, iy - 40), (ix + s * 56, iy - 6), (ix + s * 40, iy + 24), (ix + s * 28, iy + 6), (ix + s * 26, iy - 24)]
    add("path", "c-bee-eye", d=smooth(eye))
    for (ex, ey) in ((40, -30), (46, -16), (40, -4), (34, -18)):
        add("path", "c-eyehex", d=poly([(ix + s * ex + 5 * math.cos(math.radians(60 * k)), iy + ey + 5 * math.sin(math.radians(60 * k))) for k in range(6)]), stroke_width=1.2, fill="none")
    add("circle", "c-shine", cx=ix + s * 44 - 5, cy=iy - 36, r=4, stroke="none")
for (dx, dy) in ((-10, -40), (10, -40), (0, -52)):
    add("circle", "c-ocellus", cx=ix + dx, cy=iy + dy, r=5.5)
    add("circle", "c-shine", cx=ix + dx - 1.5, cy=iy + dy - 1.5, r=1.6, stroke="none")
for s in (-1, 1):
    add("path", "c-mandible", d=f"M{ix + s * 6},{iy + 40} q{s * 18},4 {s * 16},22 q{s * -10},-2 {s * -16},-12 Z")
tube([(ix, iy + 46), (ix, iy + 70), (ix + 2, iy + 86)], 6, "c-tongue")

# ---- labels ----
label("Antennae", 230, 118, cx - 44, 126)
label("Compound eye", 570, 160, cx + 34, 206)
label("Head", 230, 200, cx - 8, 234)
label("Thorax", 690, 238, cx + 40, 278)
label("Wings (4)", 690, 340, cx + 190, 300)
label("Abdomen", 680, 452, cx + 52, 410)
label("Stinger", 600, 556, cx + 4, y1 + 10)
label("Pollen basket", 170, 440, cx - 112, 438)
label("6 legs", 170, 522, cx - 108, 486)
label("Simple eyes (3)", 380, 600, ix + 12, iy - 46)
label("Mandibles", 380, 664, ix + 18, iy + 52)
label("Proboscis|(tongue)", 380, 738, ix + 4, iy + 82)

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" class="pp" role="img" '
       f'aria-labelledby="pp-title"><title id="pp-title">The parts of a honeybee: head, antennae, compound eyes, thorax, '
       f'four wings, six legs, pollen baskets, abdomen and stinger, a worker bee seen from above beside honeycomb and flowers, '
       f'with a close-up of her face showing three simple eyes, mandibles and the proboscis</title>\n'
       '<g fill="#fff" stroke="#2b1a52" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">\n'
       + "\n".join(parts) + "\n</g></svg>\n")
OUT.write_text(svg, encoding="utf-8")
print("wrote", OUT, len(svg), "bytes")
