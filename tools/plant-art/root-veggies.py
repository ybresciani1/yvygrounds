"""Draws the root vegetables diagram for plants/root-veggies/ (plants/art/root-veggies.svg).

Same idea as pumpkin.py: one drawing, colored on the page (plants/plants.css → .pp-colored) and black
outlines on the coloring page. A carrot, a radish and a beet growing side by side, cut away so you can
see their roots under the soil, with their leaves up top, an earthworm, and a cutting board with a
slice of each (the carrot's core, the beet's rings, the radish's thin red skin).

    python tools/plant-art/root-veggies.py
"""
import math
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "plants" / "art" / "root-veggies.svg"
W, H = 800, 800
GROUND = 330
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


def add(tag, cls, **attrs):
    a = " ".join(f'{k.replace("_", "-")}="{v}"' for k, v in attrs.items())
    parts.append(f'<{tag} class="{cls}" {a}/>')


def tube(pts, w, cls, curve=True):
    """A stalk or root tail: a dark outline with a white middle to color in."""
    d = smooth(pts, closed=False) if curve and len(pts) > 2 else "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts)
    add("path", "c-out", d=d, stroke_width=w + 5, fill="none")
    add("path", cls, d=d, stroke_width=w, stroke="#fff", fill="none")


def along(bx, by, ang, t, side=0.0, length=1.0):
    """A point on an axis from (bx, by) pointing at ang degrees (0 = straight up)."""
    a = math.radians(ang)
    ux, uy = math.sin(a), -math.cos(a)
    return (bx + ux * t * length + uy * -side, by + uy * t * length + ux * side)


def blade(bx, by, ang, length, width, profile, cls, vein_cls, veins=4):
    """A leaf blade from its base (bx, by): profile(t) gives the half-width (0..1) along it."""
    n = 30
    left = [along(bx, by, ang, t / n * length, -width * profile(t / n)) for t in range(n + 1)]
    right = [along(bx, by, ang, t / n * length, width * profile(t / n)) for t in range(n + 1)]
    add("path", cls, d=smooth((left + right[::-1])[::2]))
    tip = along(bx, by, ang, length * 0.94)
    add("path", vein_cls, d=f"M{f(bx)},{f(by)} L{f(tip[0])},{f(tip[1])}", stroke_width=2.5, fill="none")
    for i in range(1, veins + 1):
        t = i / (veins + 1)
        for s in (-1, 1):
            a = along(bx, by, ang, t * length)
            b = along(bx, by, ang, (t + 0.12) * length, s * width * profile(min(t + 0.1, 1)) * 0.75)
            add("path", vein_cls, d=f"M{f(a[0])},{f(a[1])} L{f(b[0])},{f(b[1])}", stroke_width=1.6, fill="none")


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


# ---- the soil: everything under the ground line is cut away so you can see the roots ----
top = [(x, GROUND + 4 * math.sin(x / 37) + 2 * math.sin(x / 13)) for x in range(-10, 821, 30)]
add("path", "c-soil", d="M-10,810 " + " ".join(f"L{f(x)},{f(y)}" for x, y in top) + " L820,810 Z")
for (px_, py_, r) in ((60, 420, 7), (300, 470, 5), (520, 440, 6), (740, 480, 8), (120, 560, 5), (330, 620, 7),
                      (560, 600, 5), (90, 700, 6), (250, 760, 5), (720, 380, 5), (470, 380, 4), (40, 610, 4)):
    add("ellipse", "c-pebble", cx=px_, cy=py_, rx=r * 1.3, ry=r)

# an earthworm, wiggling between the carrot and the radish
worm = [(272 + i * 9, 520 + 10 * math.sin(i * 0.9)) for i in range(9)]
tube(worm, 11, "c-worm")
for x_, y_ in worm[2:7:2]:
    add("path", "c-wormring", d=f"M{f(x_ - 1)},{f(y_ - 5)} L{f(x_ + 1)},{f(y_ + 5)}", stroke_width=1.6, fill="none")

# ---- the carrot (left): a long orange taproot under feathery leaves ----
ccx = 170


def carrot_half(t):
    return 30 * (1 - t) ** 0.85 + 1.5


L_C = 290
# leaves: stalks fan out from the crown; each has little feathery leaflets
for ang, ln in ((-38, 190), (-18, 230), (0, 250), (18, 225), (36, 185), (-56, 140), (54, 145)):
    a = math.radians(ang)
    pts = [(ccx + math.sin(a) * ln * k / 3 + (k * k) * math.sin(a) * 4, GROUND - 6 - math.cos(a) * ln * k / 3) for k in range(4)]
    tube(pts, 4, "c-carrot-stalk")
    for k in range(4, 12):
        t = k / 11
        bx_ = ccx + math.sin(a) * ln * t + (9 * t * t) * math.sin(a) * 4
        by_ = GROUND - 6 - math.cos(a) * ln * t
        size = 26 * (1.1 - t * 0.55)
        for s in (-1, 1):
            la = ang + s * 58
            # one feathery side leaflet: a little stalk with three lacy lobes
            for j, (tt, sc) in enumerate(((0.35, 1.0), (0.7, 0.85), (1.0, 0.7))):
                ox, oy = along(bx_, by_, la, size * tt)
                tw = la + (24 if j % 2 else -24)
                add("ellipse", "c-carrot-leaf", cx=f(ox), cy=f(oy), rx=f(size * 0.3 * sc), ry=f(size * 0.13 * sc),
                    transform=f"rotate({f(tw - 90)} {f(ox)} {f(oy)})", stroke_width=1.8)
    tip = along(ccx + math.sin(a) * ln + 36 * math.sin(a), GROUND - 6 - math.cos(a) * ln, ang, 6)
    add("ellipse", "c-carrot-leaf", cx=f(tip[0]), cy=f(tip[1]), rx=6, ry=11, transform=f"rotate({ang} {f(tip[0])} {f(tip[1])})", stroke_width=2)

# root hairs first, so the root covers their ends
for k in range(5):
    t = 0.2 + k * 0.16
    y = GROUND + t * L_C
    s = -1 if k % 2 else 1
    x0 = ccx + s * carrot_half(t) - s * 2
    add("path", "c-roothair", d=f"M{f(x0)},{f(y)} q{s * 14},4 {s * 26},16", stroke_width=2, fill="none")
tube([(ccx, GROUND + L_C - 6), (ccx + 3, GROUND + L_C + 30), (ccx - 2, GROUND + L_C + 52)], 2.5, "c-roothair")
ts = [i / 24 for i in range(25)]
root = [(ccx - carrot_half(t), GROUND - 4 + t * L_C) for t in ts] + [(ccx + carrot_half(t), GROUND - 4 + t * L_C) for t in reversed(ts)]
add("path", "c-carrot", d=smooth(root[::2]))
for k in range(9):
    t = 0.1 + k * 0.095
    y = GROUND + t * L_C
    hw = carrot_half(t) * 0.65
    off = (k % 3 - 1) * 4
    add("path", "c-carrot-ring", d=f"M{f(ccx + off - hw / 2)},{f(y)} q{f(hw / 2)},4 {f(hw)},0", stroke_width=2, fill="none")
add("ellipse", "c-carrot-top", cx=ccx, cy=GROUND - 3, rx=24, ry=7)

# ---- the radish (middle): a round red root with a white tail, under lobed leaves ----
rcx, rcy, rr = 400, GROUND + 44, 46


def radish_leaf(bx, by, ang, ln, wd):
    def prof(t):
        # small lobes down the stalk, a big round lobe at the tip (a "lyre" shape, like real radish leaves)
        if t < 0.25:
            return 0.06
        if t < 0.62:
            return 0.12 + 0.3 * abs(math.sin((t - 0.25) / 0.37 * math.pi * 2)) ** 0.8
        return 0.15 + 0.85 * math.sin((t - 0.62) / 0.38 * math.pi) ** 0.7
    blade(bx, by, ang, ln, wd, prof, "c-radish-leaf", "c-radish-vein", veins=5)


tube([(rcx, rcy + rr - 6), (rcx + 4, rcy + rr + 60), (rcx - 2, rcy + rr + 130), (rcx + 3, rcy + rr + 170)], 4, "c-radish-tail")
for (y, s) in ((rcy + rr + 50, 1), (rcy + rr + 92, -1), (rcy + rr + 128, 1)):
    add("path", "c-roothair", d=f"M{rcx},{y} q{s * 12},2 {s * 22},14", stroke_width=2, fill="none")
for ang, ln, wd in ((-34, 190, 42), (-12, 220, 46), (14, 215, 46), (36, 180, 40)):
    radish_leaf(rcx + ang * 0.2, GROUND - 8, ang, ln, wd)
bulb = [(rcx + rr * math.sin(a) * (1 - 0.1 * max(0, math.cos(a))), rcy - rr * math.cos(a) * 0.92 + (16 * max(0, -math.cos(a)) ** 3)) for a in [i * math.pi / 14 for i in range(28)]]
add("path", "c-radish", d=smooth(bulb))
add("path", "c-radish-tip", d=f"M{rcx - 20},{f(rcy + rr * 0.62)} Q{rcx},{f(rcy + rr * 0.85)} {rcx + 20},{f(rcy + rr * 0.62)} Q{rcx + 10},{f(rcy + rr + 18)} {rcx},{f(rcy + rr + 14)} Q{rcx - 10},{f(rcy + rr + 18)} {rcx - 20},{f(rcy + rr * 0.62)} Z", stroke_width=2.5)
add("ellipse", "c-shine", cx=rcx - 22, cy=rcy - 16, rx=7, ry=12, transform=f"rotate(25 {rcx - 22} {rcy - 16})", stroke="none")

# ---- the beet (right): a big round root poking out of the soil, under big leaves with red stems ----
bcx, bcy, br = 615, GROUND + 30, 60
tube([(bcx, bcy + br - 6), (bcx - 4, bcy + br + 70), (bcx + 4, bcy + br + 150), (bcx, bcy + br + 200)], 4, "c-beet-tail")
for (y, s) in ((bcy + br + 60, -1), (bcy + br + 110, 1), (bcy + br + 160, -1)):
    add("path", "c-roothair", d=f"M{bcx},{y} q{s * 12},2 {s * 22},14", stroke_width=2, fill="none")


def beet_prof(t):
    return 0.05 if t < 0.32 else math.sin((t - 0.32) / 0.68 * math.pi) ** 0.6 * (1 - 0.25 * (t - 0.32))


for ang, ln, wd in ((-40, 200, 50), (-16, 240, 54), (10, 245, 54), (34, 215, 52), (58, 160, 42)):
    a = math.radians(ang)
    blade(bcx + ang * 0.25, GROUND - 14, ang, ln, wd, beet_prof, "c-beet-leaf", "c-beet-vein", veins=5)
    stalk_end = along(bcx + ang * 0.25, GROUND - 14, ang, ln * 0.34)
    tube([(bcx + ang * 0.25, GROUND - 14), stalk_end], 6, "c-beet-stalk", curve=False)
bulb = [(bcx + br * math.sin(a) * (1 - 0.06 * math.cos(a)), bcy - br * math.cos(a) * 0.95 + (22 * max(0, -math.cos(a)) ** 3)) for a in [i * math.pi / 14 for i in range(28)]]
add("path", "c-beet", d=smooth(bulb))
for k in range(3):
    y = bcy - 30 + k * 26
    add("path", "c-beet-line", d=f"M{bcx - 36 + k * 6},{y} q14,5 {28 - k * 4},2", stroke_width=2, fill="none")
add("ellipse", "c-shine", cx=bcx - 30, cy=bcy - 22, rx=8, ry=14, transform=f"rotate(25 {bcx - 30} {bcy - 22})", stroke="none")

# ---- a cutting board with a slice of each ----
add("rect", "c-board", x=430, y=652, width=356, height=136, rx=22)
add("circle", "c-boardhole", cx=764, cy=674, r=8)
# carrot slice: orange outside, a lighter core in the middle
sx, sy = 498, 722
add("circle", "c-carrot", cx=sx, cy=sy, r=44)
add("circle", "c-carrot-core", cx=sx, cy=sy, r=20, stroke_width=2.5)
for k in range(10):
    a = 2 * math.pi * k / 10
    add("path", "c-carrot-ring", d=f"M{f(sx + 22 * math.cos(a))},{f(sy + 22 * math.sin(a))} L{f(sx + 36 * math.cos(a))},{f(sy + 36 * math.sin(a))}", stroke_width=1.6, fill="none")
# radish slice: a thin red skin around white
sx2 = 604
add("circle", "c-radish", cx=sx2, cy=sy, r=40)
add("circle", "c-radish-flesh", cx=sx2, cy=sy, r=33, stroke_width=2)
for k in range(8):
    a = 2 * math.pi * k / 8
    add("path", "c-radish-vein", d=f"M{f(sx2 + 6 * math.cos(a))},{f(sy + 6 * math.sin(a))} L{f(sx2 + 26 * math.cos(a))},{f(sy + 26 * math.sin(a))}", stroke_width=1.2, fill="none")
# beet slice: rings, like a tree trunk
sx3 = 714
for r, cls in ((48, "c-beet"), (38, "c-beet-ring"), (29, "c-beet"), (20, "c-beet-ring"), (11, "c-beet")):
    add("circle", cls, cx=sx3, cy=sy, r=r, stroke_width=2.5 if r == 48 else 2)

# ---- labels ----
label("Carrot", 66, 470, ccx - 18, 470)
label("Radish", 400, 590, rcx + 2, rcy + rr + 100)
label("Beet", 742, 560, bcx + 2, bcy + br + 120)
label("Leaves", 300, 60, 210, 112)
label("Leaf stalk", 730, 40, 650, 284)
label("Crown", 290, 300, rcx - 16, GROUND - 6)
label("Soil line", 80, 372, 40, GROUND + 1)
label("Taproot|(we eat it!)", 250, 420, ccx + 18, 420)
label("Root hairs", 278, 680, ccx + 24, GROUND + 0.84 * L_C + 12)
label("Shoulder", 724, 340, bcx + 48, bcy - 24)
label("Core", 470, 626, 498, 714)
label("Skin", 604, 626, 604 + 38, 708)
label("Rings", 744, 626, 714, 700)

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" class="pp" role="img" '
       f'aria-labelledby="pp-title"><title id="pp-title">The parts of root vegetables: a carrot, a radish and a beet '
       f'growing side by side, with leaves, leaf stalks and the crown above the soil line, and the taproot, root hairs '
       f'and the beet\'s shoulder below, beside an earthworm, plus a cutting board with a slice of each showing the '
       f'carrot\'s core, the radish\'s red skin and the beet\'s rings</title>\n'
       '<g fill="#fff" stroke="#2b1a52" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">\n'
       + "\n".join(parts) + "\n</g></svg>\n")
OUT.write_text(svg, encoding="utf-8")
print("wrote", OUT, len(svg), "bytes")
