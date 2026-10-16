import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WIDTH = 2200
HEIGHT = 680

banner = Image.new("RGBA", (WIDTH, HEIGHT), (5, 11, 22, 255))
draw = ImageDraw.Draw(banner)

# 1. Background Grid & Cyber Defense Aesthetic
for x in range(0, WIDTH, 40):
    is_major = (x % 160 == 0)
    col = (14, 165, 233, 45) if is_major else (30, 58, 138, 20)
    draw.line([(x, 0), (x, HEIGHT)], fill=col, width=2 if is_major else 1)

for y in range(0, HEIGHT, 40):
    is_major = (y % 160 == 0)
    col = (14, 165, 233, 45) if is_major else (30, 58, 138, 20)
    draw.line([(0, y), (WIDTH, y)], fill=col, width=2 if is_major else 1)

# Dynamic 45-deg projection rays
for d in range(-WIDTH, WIDTH * 2, 120):
    draw.line([(d, HEIGHT), (d + HEIGHT, 0)], fill=(2, 132, 199, 16), width=1)

# Center vibrant blue & emerald glow
glow_center = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow_center)
glow_draw.ellipse([WIDTH//2 - 550, HEIGHT//2 - 220, WIDTH//2 + 550, HEIGHT//2 + 220], fill=(11, 87, 255, 70))
glow_draw.ellipse([WIDTH//2 - 300, HEIGHT//2 - 120, WIDTH//2 + 300, HEIGHT//2 + 120], fill=(16, 185, 129, 45))
glow_center = glow_center.filter(ImageFilter.GaussianBlur(95))
banner = Image.alpha_composite(banner, glow_center)
draw = ImageDraw.Draw(banner)

# Fonts
FONT_DIR = "fonts"
font_huge = ImageFont.truetype(f"{FONT_DIR}/LexendDeca-Bold.ttf", 76)
font_title = ImageFont.truetype(f"{FONT_DIR}/LexendDeca-Bold.ttf", 28)
font_sub = ImageFont.truetype(f"{FONT_DIR}/Lexend-Bold.ttf", 20)
font_ribbon = ImageFont.truetype(f"{FONT_DIR}/Lexend-Bold.ttf", 20)
font_subribbon = ImageFont.truetype(f"{FONT_DIR}/Lexend-Bold.ttf", 17)
font_card_head = ImageFont.truetype(f"{FONT_DIR}/Lexend-Bold.ttf", 22)
font_card_bold = ImageFont.truetype(f"{FONT_DIR}/Lexend-Bold.ttf", 24)
font_card_sub = ImageFont.truetype(f"{FONT_DIR}/Lexend-Bold.ttf", 16)
font_micro = ImageFont.truetype(f"{FONT_DIR}/Lexend-Bold.ttf", 14)

# 2. LEFT CARD: Institutional Affiliation & Project Guide
c_badge_path = "assets/college_logo_badge.png"
card_w = 320
card_h = 420
card_x = 65
card_y = 50

# Glow behind card
draw.rounded_rectangle([card_x - 4, card_y - 4, card_x + card_w + 4, card_y + card_h + 4], radius=22, fill=(11, 87, 255, 65))
draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h], radius=20, fill=(255, 255, 255, 252), outline=(56, 189, 248, 220), width=3)

if os.path.exists(c_badge_path):
    c_badge = Image.open(c_badge_path).convert("RGBA")
    target_h = 230
    ratio = target_h / c_badge.height
    target_w = int(c_badge.width * ratio)
    c_badge = c_badge.resize((target_w, target_h), Image.Resampling.LANCZOS)
    paste_x = card_x + (card_w - target_w) // 2
    banner.paste(c_badge, (paste_x, card_y + 20), c_badge)

# Text below card on dark background
text_y = card_y + card_h + 18
draw.text((card_x + card_w//2, text_y), "CHRIST COLLEGE OF ENGINEERING", fill=(255, 255, 255, 255), font=font_micro, anchor="mt")
draw.text((card_x + card_w//2, text_y + 24), "IRINJALAKUDA • DEPT. OF ECE", fill=(125, 211, 252, 230), font=font_micro, anchor="mt")
draw.text((card_x + card_w//2, text_y + 48), "Project Guide: Ajeesh S", fill=(52, 211, 153, 255), font=font_micro, anchor="mt")
draw.text((card_x + card_w//2, text_y + 70), "NBA Accredited • CCE IEDC Incubated", fill=(148, 163, 184, 210), font=font_micro, anchor="mt")

# 3. CENTER: Brand, Logo & High-Impact Award Ribbons
center_x = 1110
center_y = 35

draw.text((center_x, center_y), "PROJECT T.U.E.S.D.A.Y.", fill=(255, 255, 255, 255), font=font_huge, anchor="mt")
draw.text((center_x, center_y + 98), "AUTONOMOUS MULTI-AGENT CYBER DEFENSE ECOSYSTEM", fill=(125, 211, 252, 250), font=font_title, anchor="mt")
draw.text((center_x, center_y + 144), "9 Heterogeneous Agents • Sub-3s MTTR • 3-Tier Resilient Inference • Digital SOC Twin", fill=(203, 213, 225, 225), font=font_sub, anchor="mt")

# Glowing Gold Award Ribbon 1: Neurobots Winner
rib_w = 1040
rib_h = 58
rib_x0 = center_x - rib_w // 2
rib_y0 = center_y + 195

draw.rounded_rectangle([rib_x0 - 4, rib_y0 - 4, rib_x0 + rib_w + 4, rib_y0 + rib_h + 4], radius=31, fill=(245, 158, 11, 60))
draw.rounded_rectangle([rib_x0, rib_y0, rib_x0 + rib_w, rib_y0 + rib_h], radius=29, fill=(15, 23, 42, 245), outline=(245, 158, 11, 255), width=3)
draw.text((center_x, rib_y0 + rib_h // 2), "★   WINNER (1ST PLACE) — NEUROBOTS HACKATHON: ₹50,000 CASH + $50,000 AWS CREDITS   ★", fill=(251, 191, 36, 255), font=font_ribbon, anchor="mm")

# Glowing Blue Award Ribbon 2: graVITas Finalist
rib2_w = 980
rib2_h = 52
rib2_x0 = center_x - rib2_w // 2
rib2_y0 = rib_y0 + rib_h + 16

draw.rounded_rectangle([rib2_x0 - 4, rib2_y0 - 4, rib2_x0 + rib2_w + 4, rib2_y0 + rib2_h + 4], radius=28, fill=(59, 130, 246, 50))
draw.rounded_rectangle([rib2_x0, rib2_y0, rib2_x0 + rib2_w, rib2_y0 + rib2_h], radius=26, fill=(15, 23, 42, 245), outline=(59, 130, 246, 255), width=3)
draw.text((center_x, rib2_y0 + rib2_h // 2), "•   NATIONAL FINALIST — graVITas HACKBATTLE 2026 (VIT VELLORE)   •", fill=(96, 165, 250, 255), font=font_subribbon, anchor="mm")

# Bottom Highlights below ribbons
draw.text((center_x, rib2_y0 + rib2_h + 30), "Continuous Security Validation  •  Zero-Backend Sovereign Swarm  •  Analysis of Competing Hypotheses", fill=(186, 230, 253, 235), font=font_subribbon, anchor="mt")

# 4. RIGHT SECTION: Live Platform Showcase Card
showcase_w = 380
showcase_h = 560
showcase_x = WIDTH - showcase_w - 65
showcase_y = 50

draw.rounded_rectangle([showcase_x - 4, showcase_y - 4, showcase_x + showcase_w + 4, showcase_y + showcase_h + 4], radius=22, fill=(14, 165, 233, 45))
draw.rounded_rectangle([showcase_x, showcase_y, showcase_x + showcase_w, showcase_y + showcase_h], radius=20, fill=(10, 18, 38, 245), outline=(56, 189, 248, 200), width=3)

# Top Bar of Card
draw.rounded_rectangle([showcase_x, showcase_y, showcase_x + showcase_w, showcase_y + 54], radius=20, fill=(23, 37, 84, 255))
draw.rectangle([showcase_x, showcase_y + 28, showcase_x + showcase_w, showcase_y + 54], fill=(23, 37, 84, 255))
draw.text((showcase_x + showcase_w//2, showcase_y + 27), "LIVE CYBER DEFENSE SOC", fill=(255, 255, 255, 255), font=font_card_head, anchor="mm")

# Preview image crop from poster_img_1
preview_path = "assets/poster_img_1.png"
if os.path.exists(preview_path):
    p_img = Image.open(preview_path).convert("RGBA")
    pw, ph = p_img.size
    p_cropped = p_img.crop((int(pw * 0.02), int(ph * 0.15), int(pw * 0.98), int(ph * 0.88)))
    target_pw = showcase_w - 32
    target_ph = 250
    p_cropped = p_cropped.resize((target_pw, target_ph), Image.Resampling.LANCZOS)
    
    img_x = showcase_x + 16
    img_y = showcase_y + 72
    draw.rounded_rectangle([img_x - 2, img_y - 2, img_x + target_pw + 2, img_y + target_ph + 2], radius=10, fill=(30, 41, 59, 255))
    banner.paste(p_cropped, (img_x, img_y), p_cropped)

# Repo & Deployment Info
card_text_y = showcase_y + 348
draw.text((showcase_x + showcase_w//2, card_text_y), "github.com/aaronaji007/T.U.E.S.D.A.Y.", fill=(56, 189, 248, 255), font=font_card_sub, anchor="mt")
draw.text((showcase_x + showcase_w//2, card_text_y + 36), "Live Web App & Sovereign Swarm", fill=(203, 213, 225, 230), font=font_card_sub, anchor="mt")

# Tags
tag_y = card_text_y + 78
draw.rounded_rectangle([showcase_x + 22, tag_y, showcase_x + showcase_w//2 - 8, tag_y + 38], radius=8, fill=(16, 185, 129, 220))
draw.text((showcase_x + 22 + (showcase_w//2 - 30)//2, tag_y + 19), "Blue Team SOC", fill=(255, 255, 255, 255), font=font_micro, anchor="mm")

draw.rounded_rectangle([showcase_x + showcase_w//2 + 8, tag_y, showcase_x + showcase_w - 22, tag_y + 38], radius=8, fill=(239, 68, 68, 220))
draw.text((showcase_x + showcase_w//2 + 8 + (showcase_w//2 - 30)//2, tag_y + 19), "Red Team Suite", fill=(255, 255, 255, 255), font=font_micro, anchor="mm")

out_banner_path = "assets/tuesday_achievement_banner.png"
banner.convert("RGB").save(out_banner_path, quality=98)
print("Saved clean refined TUESDAY achievement banner at:", out_banner_path)
