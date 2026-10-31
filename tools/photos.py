"""Photo helper for YvyGrounds (needs Pillow: python -m pip install --user Pillow).

  python tools/photos.py thumbs   Make small WebP copies for the background photo wall and the
                                  game list icons (images/<album>/thumbs/<name>.webp).
                                  Wall copies are cut to the oval around the photo's "focus" in
                                  js/data.js, so run it again after changing a focus.
                                  Skips ones already up to date.
  python tools/photos.py shrink   Recompress photos over 250 KB (max 1200 px, quality 75).
                                  Only keeps the new file if it's at least 10% smaller.

Both turn photos the right way up and drop EXIF (camera info, GPS).
Run from the repo folder after adding photos.
"""
import io
import os
import re
import sys

from PIL import Image, ImageOps

WALL_ALBUMS = ["me", "chickens", "pets", "club", "students"]
GALLERY_ALBUMS = WALL_ALBUMS + ["compost", "hall", "devlogs"]
OVAL = (232, 296)        # wall ovals are 116x148, doubled for sharp screens
ICON_BOX = (140, 140)    # game list icons are 70x70, doubled
DATA = os.path.join("js", "data.js")
DEFAULT_FOCUS = (0.5, 0.3)   # .oval img { object-position: 50% 30% } in css/style.css
BIG = 250 * 1024
MAX_SIDE = 1200


def photos(album, kinds=(".jpg", ".jpeg", ".png")):
    folder = os.path.join("images", album)
    for name in sorted(os.listdir(folder)):
        if name.lower().endswith(kinds):
            yield os.path.join(folder, name)


def load(path):
    im = ImageOps.exif_transpose(Image.open(path))
    return im if im.mode in ("RGB", "RGBA") else im.convert("RGB")


def encode(im, path, quality):
    out = io.BytesIO()
    if path.lower().endswith(".png"):
        im.save(out, "PNG", optimize=True)
    else:
        im.convert("RGB").save(out, "JPEG", quality=quality, optimize=True, progressive=True)
    return out.getvalue()


def parse_focus(value):
    """A data.js focus ("50% 30%", "top", "left"...) as (x, y) fractions, like CSS object-position."""
    words = {"left": ("x", 0), "right": ("x", 1), "top": ("y", 0), "bottom": ("y", 1)}
    x = y = None   # "center", or a side left out, stays in the middle
    for i, token in enumerate(value.split()[:2]):
        if token in words:
            axis, v = words[token]
            if axis == "x":
                x = v
            else:
                y = v
        elif token.endswith("%"):
            if i == 0:
                x = float(token[:-1]) / 100
            else:
                y = float(token[:-1]) / 100
    return (0.5 if x is None else x, 0.5 if y is None else y)


def wall_focus():
    """{photo path: (x, y)} for every photo in data.js → photos, the lists the wall draws from."""
    text = open(DATA, encoding="utf-8").read()
    block = re.search(r"\n  photos: \{(.*?)\n  \w+: ", text, re.S).group(1)
    found = {}
    for obj in re.findall(r"\{[^{}]*\}", block):
        src = re.search(r'src:\s*"([^"]+)"', obj)
        focus = re.search(r'focus:\s*"([^"]+)"', obj)
        if src:
            found[src.group(1).replace("/", os.sep)] = parse_focus(focus.group(1)) if focus else DEFAULT_FOCUS
    return found


def cut_oval(im, focus):
    """Crop to the oval's shape the same way object-fit: cover + object-position would, then shrink."""
    aspect = OVAL[0] / OVAL[1]
    w, h = (round(im.height * aspect), im.height) if im.width / im.height > aspect else (im.width, round(im.width / aspect))
    left, top = round((im.width - w) * focus[0]), round((im.height - h) * focus[1])
    im = im.crop((left, top, left + w, top + h))
    return im.resize(OVAL, Image.LANCZOS) if w > OVAL[0] else im


def thumbs():
    made = 0
    focus = wall_focus()
    data_time = os.path.getmtime(DATA)
    for album in WALL_ALBUMS + ["games"]:
        os.makedirs(os.path.join("images", album, "thumbs"), exist_ok=True)
        for path in photos(album, (".jpg", ".jpeg", ".png", ".webp")):
            name = os.path.splitext(os.path.basename(path))[0] + ".webp"
            thumb = os.path.join(os.path.dirname(path), "thumbs", name)
            # Wall copies also depend on the focus in data.js
            newest = max(os.path.getmtime(path), data_time if album != "games" else 0)
            if os.path.exists(thumb) and os.path.getmtime(thumb) >= newest:
                continue
            im = load(path)
            if album == "games":
                # Cover the box without cropping, so the game's "focus" still works on the icon
                scale = min(1, max(ICON_BOX[0] / im.width, ICON_BOX[1] / im.height))
                im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
            else:
                im = cut_oval(im, focus.get(path, DEFAULT_FOCUS))
            # WebP: about a quarter smaller than the JPEGs these used to be, and looks the same
            im.save(thumb, "WEBP", quality=75, method=6)
            made += 1
    print(f"made {made} thumbnails")


def shrink():
    before = after = 0
    for album in GALLERY_ALBUMS:
        for path in photos(album):
            size = os.path.getsize(path)
            if size <= BIG:
                continue
            im = load(path)
            im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
            data = encode(im, path, 75)
            if len(data) <= size * 0.9:
                with open(path, "wb") as f:
                    f.write(data)
                before += size
                after += len(data)
                print(f"{path}: {size // 1024} KB -> {len(data) // 1024} KB")
    print(f"saved {(before - after) / 1048576:.1f} MB")


if __name__ == "__main__":
    {"thumbs": thumbs, "shrink": shrink}.get(sys.argv[1] if len(sys.argv) > 1 else "", lambda: print(__doc__))()
