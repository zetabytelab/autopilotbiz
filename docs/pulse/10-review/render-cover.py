"""Create Pulse #10's newsletter cover and LinkedIn feed graphic.

The bars are the study's own SWE-bench Lite figures for Claude Fable 5:
cost per attempt in each harness, at near-identical success rates.
Bar length is proportional to cost, so the 2x gap is the visual claim.
Source: https://harnesstax.github.io/
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
DEST = ROOT / 'public' / 'pulse'
FONTS = Path('/System/Library/Fonts/Supplemental')

# harness, cost per attempt (USD), success rate, accent
ROWS = [
    ('CLAUDE CODE', 1.3293, '97.8%', '#f4a7a7'),
    ('CODEX CLI', 0.8905, '96.7%', '#7ccbec'),
    ('PI  (4 TOOLS)', 0.6657, '96.7%', '#c5ef7a'),
]
MAX_COST = max(cost for _, cost, _, _ in ROWS)


def render(w, h, name):
    im = Image.new('RGB', (w, h), '#101513')
    d = ImageDraw.Draw(im)
    sx = w / 1200

    def text(x, y, value, size, color='#f2f5ef', bold=False, anchor='lt'):
        f = ImageFont.truetype(str(FONTS / ('Arial Bold.ttf' if bold else 'Arial.ttf')), int(size * sx))
        d.text((int(x * sx), int(y * sx)), value, font=f, fill=color, anchor=anchor)

    text(72, 60, 'autopilotindex   /   PULSE #10', 24, '#c5ef7a', True)
    text(72, 150, 'The harness tax on', 66, bold=True)
    text(72, 230, 'self-driving products', 66, bold=True)
    text(72, 345, 'Same model. Same benchmark. Up to 5x the cost.', 34, '#c5ef7a')

    track_x0, track_x1 = 72, 1128
    start = 470 if h / w > 1 else 455
    pitch = 170 if h / w > 1 else 120
    for i, (label, cost, rate, color) in enumerate(ROWS):
        y = start + i * pitch
        d.rounded_rectangle(
            (int(track_x0 * sx), int(y * sx), int(track_x1 * sx), int((y + 100) * sx)),
            radius=int(10 * sx), fill='#19211d')
        # bar length proportional to cost, measured from the same origin
        bar_x1 = track_x0 + (track_x1 - track_x0) * (cost / MAX_COST)
        d.rounded_rectangle(
            (int(track_x0 * sx), int(y * sx), int(bar_x1 * sx), int((y + 100) * sx)),
            radius=int(10 * sx), fill='#26362f')
        d.rectangle((int(track_x0 * sx), int(y * sx), int((track_x0 + 6) * sx), int((y + 100) * sx)), fill=color)
        text(104, y + 16, label, 18, color, True)
        text(104, y + 48, f'${cost:.2f} per attempt', 34, bold=True)
        text(track_x1 - 32, y + 30, rate, 40, '#b0bdb3', True, anchor='rt')

    # mechanism, set in the band between the bars and the footer
    mech_y = start + len(ROWS) * pitch + 40
    d.rectangle((int(72 * sx), int(mech_y * sx), int(78 * sx), int((mech_y + 108) * sx)), fill='#3a4a42')
    text(104, mech_y, 'Claude Code loads over 10x more initial context than Pi,', 30, '#f2f5ef')
    text(104, mech_y + 44, 'for near-identical turn counts: 15.3 against 15.4.', 30, '#b0bdb3')

    base = h / sx
    text(72, base - 220, 'Claude Fable 5 on SWE-bench Lite.', 34, bold=True)
    text(72, base - 167, 'Near-identical accuracy. The scaffolding sets the bill.', 27, '#b0bdb3')
    text(72, base - 77, '18 SEPTEMBER 2026  ·  AUTOPILOTINDEX.COM', 19, '#b0bdb3')
    im.save(DEST / name)


render(1200, 1500, '10-cover.png')
render(1200, 1500, '10-linkedin-post.png')
print('Created newsletter cover and feed image.')
