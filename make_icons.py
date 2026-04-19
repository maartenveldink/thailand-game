"""
Run this once to create the PWA icons:
    python make_icons.py

No external libraries needed – uses only Python stdlib.
Creates:
    icons/icon-192.png  (gold background)
    icons/icon-512.png  (gold background)
"""
import struct, zlib, os

def make_png(filename, size, bg_rgb, fg_rgb=None):
    """Create a solid-color PNG, with optional centered square in fg_rgb."""
    r, g, b = bg_rgb

    def chunk(name, data):
        crc = zlib.crc32(name + data) & 0xffffffff
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', crc)

    sig  = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0))

    raw = b''
    center = size // 2
    box    = size // 4
    for y in range(size):
        raw += b'\x00'
        for x in range(size):
            if fg_rgb and abs(x - center) < box and abs(y - center) < box:
                raw += bytes(fg_rgb)
            else:
                raw += bytes([r, g, b])

    idat = chunk(b'IDAT', zlib.compress(raw, 9))
    iend = chunk(b'IEND', b'')

    os.makedirs('icons', exist_ok=True)
    with open(filename, 'wb') as f:
        f.write(sig + ihdr + idat + iend)
    print('Created', filename)

# Gold background, deep red square in the center
make_png('icons/icon-192.png', 192, (232, 160, 32), (183, 28, 28))
make_png('icons/icon-512.png', 512, (232, 160, 32), (183, 28, 28))
print('Klaar! Icons zijn aangemaakt in de icons/ map.')
