"""Render a new source-based data chart; requires reportlab and pymupdf.

The article carries the full primary-source links. No existing image is edited.
"""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
import pymupdf

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'public/pulse/07-consolidation-corrected.png'
PDF = ROOT / 'tmp/pdfs/07-consolidation-corrected.pdf'
PDF.parent.mkdir(parents=True, exist_ok=True)
W, H = 1200, 1050
c = canvas.Canvas(str(PDF), pagesize=(W, H))
c.setFillColor(HexColor('#09090b'))
c.rect(0, 0, W, H, fill=1, stroke=0)

def text(x, y, value, size=19, color='#d4d4d8', bold=False):
    c.setFillColor(HexColor(color))
    c.setFont('Helvetica-Bold' if bold else 'Helvetica', size)
    c.drawString(x, H-y, value)

text(44, 45, 'AUTOPILOT PULSE / 07', 15, '#a3e635', True)
text(44, 94, 'Consolidation in AI evaluation and security', 33, '#fafafa', True)
text(44, 130, 'Selected deals and one pivot. Status checked 10 September 2026.', 20)
text(44, 180, 'COMPANY / DESTINATION', 15, '#a3e635', True)
text(510, 180, 'DOCUMENTED STATUS', 15, '#a3e635', True)
text(940, 180, 'TERMS', 15, '#a3e635', True)

rows = [
 ('Humanloop', 'Anthropic', ['Joined: 13 Aug 2025', 'Platform sunset: 8 Sep 2025'], ['Undisclosed']),
 ('Lakera', 'Check Point', ['Completed: Q4 2025', 'Completion confirmed in results'], ['Approx. $190M', 'net cash consideration']),
 ('Galileo', 'Cisco', ['Completed: fiscal Q4 2026', 'Completion confirmed in results'], ['Not disclosed in', 'completion notice']),
 ('Deepchecks', 'Check Point', ['Agreement: 19 May 2026', 'Team and intellectual property'], ['Undisclosed']),
 ('Arize', 'Dynatrace', ['Agreement: 13 Aug 2026', 'Subject to closing conditions'], ['$915M', 'announced deal value']),
 ('Guardrails AI', 'Harvey', ['Acquisition announced:', '9 Sep 2026'], ['Undisclosed']),
 ('Distributional', 'Talaria Scientific', ['Pivot announced: 24 Jul 2026', 'Same corporation; new mission'], ['Not an acquisition']),
]
for i, (name, dest, status, terms) in enumerate(rows):
    y = 210 + i * 100
    c.setStrokeColor(HexColor('#303034'))
    c.line(44, H-y, W-44, H-y)
    text(44, y+34, name, 24, '#fafafa', True)
    text(44, y+66, 'to ' + dest, 21, '#a3e635')
    for j, value in enumerate(status): text(510, y+34+j*30, value, 20)
    for j, value in enumerate(terms): text(940, y+34+j*28, value, 17)

text(44, 945, 'Six deal announcements. Five distinct buyers. One separate pivot.', 22, '#fafafa', True)
text(44, 980, 'Three buyers are incumbent infrastructure/security vendors; they appear in four deals.', 19)
text(44, 1014, 'Primary sources and limitations: autopilotindex.com/pulse/07-the-gate-had-no-buyer', 17, '#a1a1aa')
c.save()
doc = pymupdf.open(PDF)
doc[0].get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5)).save(OUT)
print(OUT)
