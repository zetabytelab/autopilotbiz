"""Generate compact, recipient-ready fact-check packs, not a verbatim article reprint.

Requires reportlab and pymupdf. Run from the repository root.
"""
from pathlib import Path
from html import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
import pymupdf as fitz

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'output/pdf'
TMP = ROOT / 'tmp/pdfs'
OUT.mkdir(parents=True, exist_ok=True)
TMP.mkdir(parents=True, exist_ok=True)
styles = getSampleStyleSheet()
styles.add(ParagraphStyle('TitleLocal', fontName='Helvetica-Bold', fontSize=26, leading=29, textColor=colors.HexColor('#18181b'), spaceAfter=12))
styles.add(ParagraphStyle('BodyLocal', fontName='Helvetica', fontSize=10.5, leading=15, spaceAfter=10, textColor=colors.HexColor('#33333a')))
styles.add(ParagraphStyle('SectionLocal', fontName='Helvetica-Bold', fontSize=13, leading=17, spaceBefore=12, spaceAfter=7, textColor=colors.HexColor('#426b14'), keepWithNext=True))
styles.add(ParagraphStyle('CaptionLocal', fontName='Helvetica', fontSize=8.3, leading=11, textColor=colors.HexColor('#62626b'), spaceAfter=12))

def para(text, style='BodyLocal'):
    return Paragraph(text, styles[style])

def photo(filename, caption):
    path = ROOT / 'public/pulse' / filename
    width, height = ImageReader(str(path)).getSize()
    scale = min(480 / width, 285 / height)
    return [Image(str(path), width=width*scale, height=height*scale), Spacer(1, 6), para(caption, 'CaptionLocal')]

def footer(canvas, doc):
    canvas.setStrokeColor(colors.HexColor('#d9e4c2'))
    canvas.line(48, 802, 547, 802)
    canvas.setFont('Helvetica-Bold', 9)
    canvas.setFillColor(colors.HexColor('#426b14'))
    canvas.drawString(48, 812, 'AUTOPILOT INDEX / PULSE')
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.HexColor('#62626b'))
    canvas.drawString(48, 28, 'Fact-check review draft | 10 September 2026 | No endorsement implied')
    canvas.drawRightString(547, 28, str(doc.page))

def links():
    return [para('Articles and response', 'SectionLocal'),
            para('<a href="https://www.autopilotindex.com/pulse/06-throwaway-computer" color="#426b14">Edition six: A computer your agent can throw away</a><br/>'
                 '<a href="https://www.autopilotindex.com/pulse/07-the-gate-had-no-buyer?ref=nl7" color="#426b14">Edition seven: The gate had no buyer</a>'),
            para('Please identify the sentence or number you would correct and the supporting source. Clean slide exports are welcome. Any proposed quotation will be checked with you before publication. Antonio Serrano / pulse@autopilotindex.com', 'CaptionLocal')]

packs = {
 'veris': [
  para('Veris AI', 'TitleLocal'),
  para('Fidelity evidence, coverage and the testing-to-training question', 'SectionLocal'),
  para('A refreshed fact-check companion to editions six and seven. This is a concise review brief, not a full reproduction of the published sections. The existing event photographs and article remain the reporting record.'),
  para('Published evidence - correction', 'SectionLocal'),
  para('The fidelity figures are published at <a href="https://veris.ai/fidelity" color="#426b14">veris.ai/fidelity</a>. Veris reports 703/721 exact matches across 15 services in Rev 2.0, with 18 mismatches, four attributed to the twins, and no false passes in that measured population. These are vendor-run results using an external test suite, not our independent replication. They do not establish fidelity for the entire catalogue.'),
  para('What we would like you to check', 'SectionLocal'),
  para('1. Is Rev 2.0 the appropriate report to cite? Can readers obtain a pinned test-suite revision and the operation-level evidence needed to reproduce it?<br/><br/>'
       '2. How do customers identify unsupported operations, and how are vendor API changes reflected in twin versions?<br/><br/>'
       '3. The event account describes the same sanctions-screening task finishing in 32 minutes with missed matches, versus 40 minutes with all four caught. Which agent/model versions, prompts and repetitions underpin that comparison?<br/><br/>'
       '4. Edition seven describes a move from testing toward training. Is that an accurate change of emphasis, or should it describe complementary uses?'),
  *links(), PageBreak(),
  para('Demonstration context', 'TitleLocal'),
  *photo('06-veris-trajectory.jpg', 'Photograph from the edition-six reporting materials. The demo is evidence about this task and setup, not a general performance guarantee.'),
  para('Proposed wording for edition seven', 'SectionLocal'),
  para('"The same environment can support verification and training. My interpretation is that its value grows when it helps an agent learn or complete work, rather than merely blocking a release. Whether that describes Veris\'s commercial direction is a question for the company."'),
  para('Review boundary', 'SectionLocal'),
  para('The reporting should separate what the demonstration showed, what the benchmark reports and what the author infers about the business. Confirmation of factual details would not imply endorsement of the article\'s market thesis.'),
  para('The original review pack lacked the direct public-report link and clear replication scope. This version supplies both. It does not describe the figures as unpublished.', 'CaptionLocal')
 ],
 'calibre': [
  para('Calibre / Cepheid', 'TitleLocal'),
  para('Reviewable fixes and the cost of session triage', 'SectionLocal'),
  para('A refreshed fact-check companion to edition six, linked to edition seven\'s discussion of verification value. This is a concise review brief, not a full article reproduction.'),
  para('The account we want to preserve', 'SectionLocal'),
  para('Cepheid was presented as Calibre\'s internal maintenance agent. Session evidence feeds a cheap triage pass; findings can escalate to a coding agent. A proposed fix carries three videos: the original session, reproduction and verification. More ambitious changes retain an engineer in the loop. Please correct that scope if it is wrong.'),
  para('Cost figures and review questions', 'SectionLocal'),
  para('The event materials give $11.94 per 1,000 replays for the Luna triage case. The $4.82 GLM comparison assumes the same usage and includes promotional pricing; it should not read as a measured replacement run or a current quote. Stronger-model fixes and hosting are additional.'),
  para('Please confirm:<br/><br/>'
       '1. Which cost rows were measured, estimated or calculated from a rate card?<br/><br/>'
       '2. We read 38.298M uncached input, 97.417M cached input and 1.942M output tokens. Are those counts and the input-cache denominator correct?<br/><br/>'
       '3. What proportion of sessions escalates, and what is the resulting full cost including fixes, hosting and review?<br/><br/>'
       '4. Are the internal-agent description, photographs and three-video workflow accurate?'),
  *links(), PageBreak(),
  para('Cost provenance', 'TitleLocal'),
  *photo('06-calibre-cost-luna.jpg', 'Original cost-slide photograph from the edition-six reporting materials. Rates and workload assumptions are historical, not a current pricing recommendation.'),
  para('Derived scenario - reproduced from the slide', 'SectionLocal'),
  para('Total input is 135.715M tokens. Keeping output at 1.942M tokens and using the photographed rates:<br/><b>135.715 x 10% x $0.20 + 135.715 x 90% x $0.02 + 1.942 x $1.20 = $7.48757, or $7.49.</b><br/>This reproduces the published estimate. The starting input-cache rate is about 71.78%, rounded to 72%. It is a scenario calculation, not an observed improvement.'),
  para('The cache scenario saves about 37% against $11.94. The quoted $4.82 model-price scenario saves about 60%. Both are material, but the latter is not an observed quality-equivalent replacement run. Neither is the full cost of operating Cepheid.'),
  para('Link to edition seven', 'SectionLocal'),
  para('The three-video pull request is an example of verification producing evidence a reviewer can use. That connection is the author\'s interpretation, not a claim by Calibre about the broader evaluation market.')
 ]
}
for name, story in packs.items():
    target = OUT / f'autopilot-pulse-review-{name}-2026-09-10.pdf'
    SimpleDocTemplate(str(target), pagesize=A4, rightMargin=48, leftMargin=48, topMargin=56, bottomMargin=48, title=f'Autopilot Pulse: {name.title()} fact-check review', author='Antonio Serrano').build(story, onFirstPage=footer, onLaterPages=footer)
    with fitz.open(target) as doc:
        assert len(doc) == 2, (name, len(doc))
        for i, page in enumerate(doc):
            page.get_pixmap(matrix=fitz.Matrix(1.1,1.1)).save(TMP / f'{name}-{i+1}.png')
        print(f'{name}: {len(doc)} pages, {len("".join(p.get_text() for p in doc))} text characters')
