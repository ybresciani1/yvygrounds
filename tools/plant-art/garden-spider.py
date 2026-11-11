"""Draws the garden spider diagram for plants/garden-spider/ (plants/art/garden-spider.svg).

Same idea as pumpkin.py: one drawing, colored on the page (plants/plants.css → .pp-colored) and black
outlines on the coloring page. An orb weaver hangs head-down in the middle of its web, so the abdomen
is on top. A circle shows its face up close (8 eyes, fangs, pedipalps).

    python tools/plant-art/garden-spider.py
"""
import math
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "plants" / "art" / "garden-spider.svg"
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


def add(tag, cls, **attrs):
    a = " ".join(f'{k.replace("_", "-")}="{v}"' for k, v in attrs.items())
    parts.append(f'<{tag} class="{cls}" {a}/>')


def tube(pts, w, cls):
    """A leg or stem: a dark outline with a white middle to color in."""
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


# ---- the plants the web hangs between ----
tube([(48, 800), (52, 560), (60, 300), (66, 120)], 9, "c-stem")
for i in range(12):  # a marigold
    a = 2 * math.pi * i / 12
    add("ellipse", "c-marigold", cx=f(66 + 30 * math.cos(a)), cy=f(96 + 30 * math.sin(a)), rx=20, ry=13, transform=f"rotate({f(math.degrees(a))} {f(66 + 30 * math.cos(a))} {f(96 + 30 * math.sin(a))})")
add("circle", "c-marigold-mid", cx=66, cy=96, r=20)
tube([(758, 800), (754, 520), (748, 260), (742, 150)], 9, "c-stem")
for i in range(16):  # a little sunflower
    a = 2 * math.pi * i / 16
    px_, py_ = 742 + 40 * math.cos(a), 112 + 40 * math.sin(a)
    add("ellipse", "c-sunpetal", cx=f(px_), cy=f(py_), rx=22, ry=9, transform=f"rotate({f(math.degrees(a))} {f(px_)} {f(py_)})")
add("circle", "c-suncenter", cx=742, cy=112, r=26)
for (lx, ly, rot) in ((56, 470, -40), (752, 430, 40), (54, 640, -30), (756, 620, 35)):
    add("ellipse", "c-leaf", cx=lx + (26 if rot < 0 else -26), cy=ly, rx=30, ry=12, transform=f"rotate({rot} {lx} {ly})")

# ---- the web ----
cx, cy = 400, 360
frame = [(70, 170), (420, 70), (740, 210), (720, 640), (380, 720), (80, 600)]
add("path", "c-silk", d="M" + " L".join(f"{x},{y}" for x, y in frame) + " Z", fill="none", stroke_width=2.2)
for (a, b) in (((70, 170), (62, 150)), ((740, 210), (748, 190)), ((720, 640), (754, 660)), ((80, 600), (50, 620)), ((420, 70), (420, 0))):
    add("path", "c-silk", d=f"M{a[0]},{a[1]} L{b[0]},{b[1]}", fill="none", stroke_width=2.2)


def ray_hit(ang):
    """Where a spoke from the hub at this angle meets the frame."""
    dx, dy = math.cos(ang), math.sin(ang)
    best = None
    for i in range(len(frame)):
        (x1, y1), (x2, y2) = frame[i], frame[(i + 1) % len(frame)]
        ex, ey = x2 - x1, y2 - y1
        den = dx * ey - dy * ex
        if abs(den) < 1e-9:
            continue
        t = ((x1 - cx) * ey - (y1 - cy) * ex) / den
        u = ((x1 - cx) * dy - (y1 - cy) * dx) / den
        if t > 0 and 0 <= u <= 1 and (best is None or t < best):
            best = t
    return best


N = 22
spokes = []
for i in range(N):
    ang = 2 * math.pi * i / N + 0.05
    r = ray_hit(ang)
    spokes.append((ang, r))
    add("path", "c-silk", d=f"M{cx},{cy} L{f(cx + r * math.cos(ang))},{f(cy + r * math.sin(ang))}", fill="none", stroke_width=1.6)
# the sticky spiral: rings from the outside in, sagging a little between spokes
for k in range(13):
    rr = 70 + k * 22
    pts = []
    for ang, r in spokes:
        q = min(rr, r - 12)
        pts.append((cx + q * math.cos(ang), cy + q * math.sin(ang)))
    d = f"M{f(pts[0][0])},{f(pts[0][1])}"
    for i in range(1, N + 1):
        a, b = pts[i - 1], pts[i % N]
        mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
        sag = 0.06
        d += f" Q{f(mx + (cx - mx) * sag)},{f(my + (cy - my) * sag)} {f(b[0])},{f(b[1])}"
    add("path", "c-silk c-sticky", d=d, fill="none", stroke_width=1.6)
# the hub: a little mesh in the middle
for k in range(3):
    add("circle", "c-silk", cx=cx, cy=cy, r=14 + k * 10, fill="none", stroke_width=1.4)

# ---- lunch: a fly stuck in the web ----
fx, fy = 590, 500
for s in (-1, 1):
    add("ellipse", "c-wing", cx=fx + s * 16, cy=fy - 14, rx=18, ry=10, transform=f"rotate({s * 30} {fx + s * 16} {fy - 14})")
add("ellipse", "c-fly", cx=fx, cy=fy, rx=12, ry=17)
add("circle", "c-fly", cx=fx, cy=fy + 18, r=9)
for s in (-1, 1):
    add("circle", "c-flyeye", cx=fx + s * 5, cy=fy + 21, r=4)

# ---- the zigzag silk (stabilimentum): four arms of an X, the spider's legs lie along them ----
ARMS = (52, 128, -54, -126)  # degrees: down-right, down-left, up-right, up-left (y points down)
for deg in ARMS:
    t = math.radians(deg)
    ux, uy, nx_, ny_ = math.cos(t), math.sin(t), -math.sin(t), math.cos(t)
    pts = []
    for i in range(23):
        r = 66 + i * 8.6
        side = 7 if i % 2 else -7
        pts.append((cx + ux * r + nx_ * side, cy + uy * r + ny_ * side))
    d = "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts)
    add("path", "c-zig-out", d=d, stroke_width=6.5, fill="none")
    add("path", "c-zig", d=d, stroke_width=3, stroke="#fff", fill="none")

# ---- the spider: a silver argiope, head down, legs held in pairs along the X ----
sx, sy = cx, cy + 6
hx, hy = sx, sy + 38  # the middle of the cephalothorax
for s in (-1, 1):
    # (front pair reaching down, back pair reaching up; the third legs are the shortest)
    for (kx, ky, ex, ey, w) in ((52, 58, 142, 186, 7), (66, 46, 166, 168, 7), (54, -50, 118, -128, 6), (62, -70, 152, -206, 7)):
        pts = [(hx + s * 14, hy + (8 if ey > 0 else -8)), (hx + s * kx, hy + ky), (hx + s * ex, hy + ey)]
        tube(pts, w, "c-leg")
        # silvery gray legs: orange-brown near the body, then black bands, black tips
        add("path", "c-femur", d=f"M{f(pts[0][0])},{f(pts[0][1])} L{f(pts[1][0])},{f(pts[1][1])}", stroke_width=w, fill="none")
        d = "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts[1:])
        add("path", "c-legband", d=d, stroke_width=w, stroke_dasharray="6 10", stroke_linecap="butt", fill="none")
        tx, ty = pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]
        k = 14 / math.hypot(tx, ty)
        add("path", "c-legband", d=f"M{f(pts[2][0] - tx * k)},{f(pts[2][1] - ty * k)} L{f(pts[2][0])},{f(pts[2][1])}", stroke_width=w, stroke_linecap="butt", fill="none")
# the abdomen (on top, since it hangs head-down): a silver-white shield with little dimples in front, and at
# the back two pairs of dark brown lobes speckled with gold, white stripes between them and a gold band down the middle
abd = [(0, 6), (-24, 0), (-40, -16), (-48, -36), (-50, -54), (-64, -64), (-62, -80), (-48, -82), (-50, -94),
       (-38, -108), (-24, -102), (-12, -116), (0, -112), (12, -116), (24, -102), (38, -108), (50, -94), (48, -82),
       (62, -80), (64, -64), (50, -54), (48, -36), (40, -16), (24, 0)]
add("path", "c-abdomen", d=smooth([(sx + x, sy + y) for x, y in abd]))
for s in (-1, 1):
    # each lobe fills one bump of the outline: a dark rim with gold speckles toward the middle
    big = [(-49, -55), (-63, -64), (-61, -79), (-47, -82), (-28, -74), (-30, -64), (-38, -56)]
    small = [(-49, -93), (-38, -107), (-24, -101), (-18, -94), (-30, -86), (-46, -84)]
    for lobe, inner in ((big, [(-50, -64), (-52, -74), (-40, -77), (-32, -70), (-38, -63)]),
                        (small, [(-40, -96), (-34, -102), (-24, -97), (-30, -90), (-40, -89)])):
        add("path", "c-pattern", d=smooth([(sx - s * x, sy + y) for x, y in lobe]))
        add("path", "c-gold", d=smooth([(sx - s * x, sy + y) for x, y in inner]), stroke_width=1.5)
band = [(-10, -110), (0, -113), (10, -110), (12, -92), (9, -72), (0, -64), (-9, -72), (-12, -92)]
add("path", "c-gold", d=smooth([(sx + x, sy + y) for x, y in band]))
add("path", "c-stripe", d=f"M{sx},{sy - 108} L{sx},{sy - 70}", stroke_width=3, fill="none")
for (dx, dy) in ((-6, -100), (6, -96), (-6, -84), (6, -80), (-50, -70), (50, -70), (-40, -95), (40, -95)):
    add("circle", "c-spot", cx=sx + dx, cy=sy + dy, r=2.2, stroke="none")
for (dx, dy) in ((-32, -34), (-16, -40), (0, -42), (16, -40), (32, -34), (-24, -20), (-8, -26), (8, -26), (24, -20)):
    add("circle", "c-dimple", cx=sx + dx, cy=sy + dy, r=2.6)
add("path", "c-spinneret", d=f"M{sx - 7},{sy - 104} Q{sx},{sy - 120} {sx + 7},{sy - 104} Z")
# the cephalothorax (head + chest), flat and silvery, below
add("ellipse", "c-ceph", cx=hx, cy=hy, rx=24, ry=27)
add("path", "c-hairline", d=f"M{hx},{hy - 22} L{hx},{hy + 6}", stroke_width=2, fill="none")
for dx in (-6, -2, 2, 6):
    add("circle", "c-eye", cx=hx + dx * 1.6, cy=hy + 19, r=2.6)
for s in (-1, 1):
    add("path", "c-fang", d=f"M{hx + s * 6},{hy + 26} q{s * 4},10 {s * -1},16 q{s * -3},-6 {s * -5},-14 Z")
    tube([(hx + s * 12, hy + 22), (hx + s * 20, hy + 36), (hx + s * 16, hy + 50)], 4, "c-palp")

# ---- close-up of the face ----
ix, iy, ir = 150, 690, 92
add("circle", "c-inset", cx=ix, cy=iy, r=ir)
add("path", "c-silk", d=f"M{sx},{sy + 96} L{ix + 70},{iy - 60}", fill="none", stroke_width=1.6, stroke_dasharray="4 4")
add("ellipse", "c-ceph", cx=ix, cy=iy - 6, rx=62, ry=52)
for (dx, dy, r) in ((-24, -26, 9), (24, -26, 9), (-8, -32, 7), (8, -32, 7), (-38, -10, 6), (38, -10, 6), (-14, -12, 5), (14, -12, 5)):
    add("circle", "c-eye", cx=ix + dx, cy=iy + dy, r=r)
    add("circle", "c-shine", cx=ix + dx - r * 0.3, cy=iy + dy - r * 0.3, r=r * 0.3, stroke="none")
for s in (-1, 1):
    add("path", "c-fang", d=f"M{ix + s * 10},{iy + 30} q{s * 10},22 {s * -2},40 q{s * -8},-14 {s * -14},-34 Z")
    tube([(ix + s * 30, iy + 24), (ix + s * 48, iy + 46), (ix + s * 44, iy + 70)], 9, "c-palp")

# ---- labels ----
label("Abdomen", 210, 250, sx - 46, sy - 60)
label("Spinnerets|(silk comes out)", 560, 200, sx + 4, sy - 112)
label("Cephalothorax|(head + chest)", 590, 330, hx + 22, hy)
label("8 legs", 210, 400, hx - 110, hy + 128)
label("Spokes", 470, 655, 437, 596)
label("Zigzag silk", 680, 560, cx + 150, cy + 192)
label("Sticky spiral", 470, 120, 450, 168)
label("Frame thread", 230, 120, 250, 118)
label("Lunch!|(a fly)", 680, 420, fx + 10, fy - 6)
label("Eyes (8)", 330, 640, ix + 26, iy - 28)
label("Fangs", 330, 720, ix + 12, iy + 52)
label("Pedipalps", 40 + 90, 790 - 12, ix - 44, iy + 66)

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" class="pp" role="img" '
       f'aria-labelledby="pp-title"><title id="pp-title">The parts of a garden spider: abdomen, cephalothorax, 8 legs, '
       f'eyes, fangs, pedipalps and spinnerets, a silver argiope hanging head-down in its orb web, legs along its zigzag silk X, with a fly caught in the web</title>\n'
       '<g fill="#fff" stroke="#2b1a52" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">\n'
       + "\n".join(parts) + "\n</g></svg>\n")
OUT.write_text(svg, encoding="utf-8")
print("wrote", OUT, len(svg), "bytes")
