"""Photo helper for YvyGrounds (needs Pillow: python -m pip install --user Pillow).

  python tools/photos.py thumbs   Make small WebP copies for the background photo wall
                                  (images/<album>/thumbs/<name>.webp). Skips ones already up to date.
  python tools/photos.py shrink   Recompress photos over 250 KB (max 1200 px, quality 75).
                                  Only keeps the new file if it's at least 10% smaller.

Both turn photos the right way up and drop EXIF (camera info, GPS).
Run from the repo folder after adding photos.
"""
import io
import os
import sys

from PIL import Image, ImageOps

WALL_ALBUMS = ["me", "chickens", "pets", "club", "students"]
GALLERY_ALBUMS = WALL_ALBUMS + ["compost", "hall", "devlogs"]
THUMB_BOX = (240, 300)   # wall ovals are 116x148, doubled for sharp screens
BIG = 250 * 1024
MAX_SIDE = 1200


def photos(album):
    folder = os.path.join("images", album)
    for name in sorted(os.listdir(folder)):
        if name.lower().endswith((".jpg", ".jpeg", ".png")):
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


def thumbs():
    made = 0
    for album in WALL_ALBUMS:
        os.makedirs(os.path.join("images", album, "thumbs"), exist_ok=True)
        for path in photos(album):
            name = os.path.splitext(os.path.basename(path))[0] + ".webp"
            thumb = os.path.join(os.path.dirname(path), "thumbs", name)
            if os.path.exists(thumb) and os.path.getmtime(thumb) >= os.path.getmtime(path):
                continue
            im = load(path)
            # Cover the box without cropping, so a photo's "focus" still works on the wall.
            scale = min(1, max(THUMB_BOX[0] / im.width, THUMB_BOX[1] / im.height))
            im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
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
