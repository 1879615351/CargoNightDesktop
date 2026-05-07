from PIL import Image, ImageDraw, ImageFont
import os

icons_dir = os.path.dirname(os.path.abspath(__file__))

def create_icon(size, path):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    r = size // 2 - 2
    for i in range(r, 0, -1):
        t = i / r
        r_val = int(30 + 60 * (1 - t))
        g_val = int(20 + 80 * (1 - t))
        b_val = int(60 + 130 * (1 - t))
        draw.ellipse([cx - i, cy - i, cx + i, cy + i], fill=(r_val, g_val, b_val, 255))
    if size >= 64:
        try:
            font_size = size // 2
            font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", font_size)
        except:
            font = ImageFont.load_default()
        text = "CN"
        bbox = draw.textbbox((0, 0), text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text((cx - tw//2, cy - th//2 - 2), text, fill=(255, 255, 255, 230), font=font)
    img.save(path, "PNG")
    print(f"Created {path} ({size}x{size} RGBA)")

sizes = {"32x32.png": 32, "128x128.png": 128, "128x128@2x.png": 256}
for filename, size in sizes.items():
    create_icon(size, os.path.join(icons_dir, filename))

img32 = Image.open(os.path.join(icons_dir, "32x32.png"))
img128 = Image.open(os.path.join(icons_dir, "128x128.png"))
img256 = Image.open(os.path.join(icons_dir, "128x128@2x.png"))
img256.save(os.path.join(icons_dir, "icon.ico"), format="ICO", sizes=[(32, 32), (128, 128), (256, 256)])
img256.save(os.path.join(icons_dir, "icon.icns"), format="PNG")
print("All icons regenerated in RGBA format")
