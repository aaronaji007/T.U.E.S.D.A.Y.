import os
import pymupdf

pdf_out_downloads = r"C:\Users\Twilight\Downloads\ACHIEVEMENTS-TUESDAY.pdf"
pdf_out_local = os.path.abspath("ACHIEVEMENTS-TUESDAY.pdf")
png_out_downloads = r"C:\Users\Twilight\Downloads\ACHIEVEMENTS-TUESDAY.png"
png_out_local = os.path.abspath("ACHIEVEMENTS-TUESDAY.png")

banner_img = os.path.abspath("assets/tuesday_achievement_banner.png")
font_deca_path = os.path.abspath("fonts/LexendDeca-Bold.ttf")
font_lex_path = os.path.abspath("fonts/Lexend-Bold.ttf")

doc = pymupdf.open()
page = doc.new_page(width=842.0, height=596.0)

f_deca = pymupdf.Font(fontfile=font_deca_path)
f_lex = pymupdf.Font(fontfile=font_lex_path)

# 1. Main Title: ACHIEVEMENTS
title_text = "ACHIEVEMENTS"
title_size = 46.0
title_len = f_deca.text_length(title_text, fontsize=title_size)
title_x = (842.0 - title_len) / 2
title_y = 74.0

page.insert_text(
    pymupdf.Point(title_x, title_y),
    title_text,
    fontfile=font_deca_path,
    fontsize=title_size,
    color=(0, 0, 0)
)

# -------------------------------------------------------------
# 2. BULLET POINT 1: NEUROBOTS HACKATHON WINNER (1ST PLACE)
# -------------------------------------------------------------
fs = 17.0
line_step = 25.5
text_x = 72.0
base_y1 = 120.0

# Vector-rendered clean circular bullet dot
bullet_x = 50.0
bullet_y1 = base_y1 - 6.0
page.draw_circle(pymupdf.Point(bullet_x, bullet_y1), 4.8, color=(0, 0, 0), fill=(0, 0, 0))

# Line 1: Winner (1st Place), Neurobots National Level Hackathon 2026 [IES College of Engineering]:
cur_x = text_x
cur_y = base_y1

t1 = "Winner (1st Place), "
page.insert_text(pymupdf.Point(cur_x, cur_y), t1, fontfile=font_deca_path, fontsize=fs, color=(0, 0, 0))
cur_x += f_deca.text_length(t1, fontsize=fs)

t2 = "Neurobots National Level Hackathon 2026 "
green_col = (0.0, 0.658, 0.0) # #00a800
page.insert_text(pymupdf.Point(cur_x, cur_y), t2, fontfile=font_deca_path, fontsize=fs, color=green_col)
cur_x += f_deca.text_length(t2, fontsize=fs)

t3 = "[IES College of Engineering]:"
page.insert_text(pymupdf.Point(cur_x, cur_y), t3, fontfile=font_lex_path, fontsize=fs, color=(0, 0, 0))

# Line 2: awarded ₹50,000 Cash Prize + $50,000 in AWS Cloud Credits for Project T.U.E.S.D.A.Y. —
cur_x = text_x
cur_y += line_step
t4 = "awarded ₹50,000 Cash Prize + $50,000 in AWS Cloud Credits for Project T.U.E.S.D.A.Y. —"
page.insert_text(pymupdf.Point(cur_x, cur_y), t4, fontfile=font_lex_path, fontsize=fs, color=(0, 0, 0))

# Line 3: an autonomous 9-agent cybernetic SOC platform reducing MTTR from 16 hours to sub-3 seconds.
cur_x = text_x
cur_y += line_step
t5 = "an autonomous 9-agent cybernetic SOC platform reducing MTTR from 16 hours to sub-3 seconds."
page.insert_text(pymupdf.Point(cur_x, cur_y), t5, fontfile=font_lex_path, fontsize=fs, color=(0, 0, 0))

# Line 4: Link
cur_y += 22.0
link1_text = "https://neurobots.in"
link_fs = 11.5
link_col = (0.067, 0.333, 0.8) # #1155cc

page.insert_text(pymupdf.Point(text_x, cur_y), link1_text, fontfile=font_lex_path, fontsize=link_fs, color=link_col)
link1_w = f_lex.text_length(link1_text, fontsize=link_fs)
link1_rect = pymupdf.Rect(text_x, cur_y - link_fs - 2, text_x + link1_w, cur_y + 4)
page.insert_link({"kind": pymupdf.LINK_URI, "from": link1_rect, "uri": "https://neurobots.in"})

# -------------------------------------------------------------
# 3. BULLET POINT 2: graVITas HACKBATTLE NATIONAL FINALIST
# -------------------------------------------------------------
base_y2 = cur_y + 36.0
bullet_y2 = base_y2 - 6.0
page.draw_circle(pymupdf.Point(bullet_x, bullet_y2), 4.8, color=(0, 0, 0), fill=(0, 0, 0))

# Line 1: National Finalist, graVITas HackBattle 2026 [VIT Vellore]:
cur_x = text_x
cur_y = base_y2

t2_1 = "National Finalist, "
page.insert_text(pymupdf.Point(cur_x, cur_y), t2_1, fontfile=font_deca_path, fontsize=fs, color=(0, 0, 0))
cur_x += f_deca.text_length(t2_1, fontsize=fs)

t2_2 = "graVITas HackBattle 2026 "
blue_col = (0.082, 0.380, 0.886) # #1561e2
page.insert_text(pymupdf.Point(cur_x, cur_y), t2_2, fontfile=font_deca_path, fontsize=fs, color=blue_col)
cur_x += f_deca.text_length(t2_2, fontsize=fs)

t2_3 = "[VIT Vellore]:"
page.insert_text(pymupdf.Point(cur_x, cur_y), t2_3, fontfile=font_lex_path, fontsize=fs, color=(0, 0, 0))

# Line 2: shortlisted as national finalists at VIT's flagship 36-hour hackathon among top teams nationwide
cur_x = text_x
cur_y += line_step
t2_4 = "shortlisted as national finalists at VIT's flagship 36-hour hackathon among top teams nationwide"
page.insert_text(pymupdf.Point(cur_x, cur_y), t2_4, fontfile=font_lex_path, fontsize=fs, color=(0, 0, 0))

# Line 3: for real-time multi-agent threat triaging, ACH hypothesis testing & digital SOC twin defense.
cur_x = text_x
cur_y += line_step
t2_5 = "for real-time multi-agent threat triaging, ACH hypothesis testing & digital SOC twin defense."
page.insert_text(pymupdf.Point(cur_x, cur_y), t2_5, fontfile=font_lex_path, fontsize=fs, color=(0, 0, 0))

# Line 4: Link
cur_y += 22.0
link2_text = "https://vit.ac.in/gravitas"
page.insert_text(pymupdf.Point(text_x, cur_y), link2_text, fontfile=font_lex_path, fontsize=link_fs, color=link_col)
link2_w = f_lex.text_length(link2_text, fontsize=link_fs)
link2_rect = pymupdf.Rect(text_x, cur_y - link_fs - 2, text_x + link2_w, cur_y + 4)
page.insert_link({"kind": pymupdf.LINK_URI, "from": link2_rect, "uri": "https://vit.ac.in/gravitas"})

# -------------------------------------------------------------
# 4. GRAPHIC SHOWCASE BANNER
# -------------------------------------------------------------
img_rect = pymupdf.Rect(72.0, 328.0, 770.25, 545.0)
page.insert_image(img_rect, filename=banner_img)
page.insert_link({"kind": pymupdf.LINK_URI, "from": img_rect, "uri": "https://github.com/aaronaji007/T.U.E.S.D.A.Y."})

# Save PDF to Downloads and Local project
doc.save(pdf_out_downloads)
doc.save(pdf_out_local)
print("Saved PDF at:", pdf_out_downloads)
print("Saved PDF at:", pdf_out_local)

# Export Ultra-High Resolution 300-DPI PNG
pix = page.get_pixmap(dpi=300)
pix.save(png_out_downloads)
pix.save(png_out_local)
print("Saved PNG at:", png_out_downloads)
print("Saved PNG at:", png_out_local)

doc.close()
