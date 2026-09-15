"""Render the article's qualitative market map as PNG and editable SVG.

Run with a Python environment containing Pillow. Lines encode membership only.
Company placements and links are also exported as machine-readable JSON.
"""
from pathlib import Path
from html import escape
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
W, H = 1600, 1580
BG, CARD, FG, MUTED = '#101513', '#19211d', '#f2f5ef', '#b0bdb3'
GROUPS = [
    ('Product improvement', '#c5ef7a', [
        ('Usage & outcome learning', [
            ('PostHog', 'Self-driving · Replay Vision', 'https://posthog.com/self-driving'),
            ('Amplitude', 'Wave · Agent Analytics', 'https://amplitude.com/wave')]),
        ('Website experimentation', [
            ('Webflow', 'Optimize', 'https://webflow.com/feature/optimize'),
            ('Coframe', 'Website variants & optimisation', 'https://www.coframe.com/')])]),
    ('Production remediation', '#7ccbec', [
        ('Errors to code changes', [
            ('Sentry', 'Seer', 'https://docs.sentry.io/product/ai-in-sentry/seer'),
            ('Datadog', 'Bits Code', 'https://www.datadoghq.com/blog/bits-code/')]),
        ('AI incident investigation', [
            ('incident.io', 'Investigations', 'https://incident.io/investigations'),
            ('Resolve AI', 'Production investigation', 'https://resolve.ai/')])]),
    ('Agent execution', '#bca7f4', [
        ('AI & developer platforms', [
            ('Anthropic', 'Claude', 'https://claude.com/blog/how-warp-builds-self-improving-agents-on-claude'),
            ('OpenAI', 'Codex · models', 'https://openai.com/index/loveholidays/'),
            ('Microsoft / GitHub', 'Agentic Workflows', 'https://github.blog/changelog/2026-06-11-github-agentic-workflows-is-now-in-public-preview/')]),
        ('Coding agents & factories', [
            ('Warp', 'Warp Factories', 'https://www.warp.dev/blog/agent-self-improving-software-factories'),
            ('Cursor', 'Cloud agents · Automations', 'https://cursor.com/docs/cloud-agent/automations'),
            ('Cognition', 'Devin', 'https://openai.com/index/cognition-devin-testing-with-astra/')])]),
    ('Verification', '#f2c77d', [
        ('Stateful & system simulation', [
            ('Veris AI', 'Simulated dependencies', 'https://veris.ai/'),
            ('Antithesis', 'Deterministic simulation', 'https://antithesis.com/')]),
        ('Frontend regression', [
            ('Meticulous', 'Recorded interaction tests', 'https://www.meticulous.ai/')])]),
    ('Continuous maintenance', '#eea6b8', [
        ('AI code review', [
            ('Greptile', 'Repository-aware review', 'https://www.greptile.com/'),
            ('CodeRabbit', 'Code review', 'https://www.coderabbit.ai/')]),
        ('Dependency updates', [
            ('Renovate / Mend', 'Updates · conditional automerge', 'https://docs.renovatebot.com/key-concepts/automerge/')])]),
]

image = Image.new('RGB', (W, H), BG)
draw = ImageDraw.Draw(image)
fonts = '/System/Library/Fonts/Supplemental/'
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title desc">',
       '<title id="title">The Self-Improving Products Wave — Have your product on autopilot?</title>',
       '<desc id="desc">Five categories connect to ten subcategories and twenty companies. Lines show representative category membership, not market share or integrations. Sources checked 14 September 2026.</desc>',
       f'<rect width="{W}" height="{H}" fill="{BG}"/>']

def text(x, y, value, size=24, color=FG, bold=False):
    font = ImageFont.truetype(fonts + ('Arial Bold.ttf' if bold else 'Arial.ttf'), size)
    draw.text((x, y), value, font=font, fill=color, anchor='lt')
    svg.append(f'<text x="{x}" y="{y + size * .8}" fill="{color}" font-family="Arial, sans-serif" font-size="{size}" font-weight="{700 if bold else 400}">{escape(value)}</text>')

def rect(x, y, w, h, fill, radius=10):
    draw.rounded_rectangle((x, y, x+w, y+h), radius, fill=fill)
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}"/>')

def line(x1, y1, x2, y2, color):
    # A uniform-width curve is intentional: the map encodes no quantitative flow.
    c = tuple(int(color[i:i+2],16) for i in (1,3,5))
    b = tuple(int(BG[i:i+2],16) for i in (1,3,5))
    shaded = tuple(round(a*.38 + z*.62) for a,z in zip(c,b))
    mid = (x1+x2)/2
    points=[]
    for i in range(101):
        t=i/100
        points.append(((1-t)**3*x1+3*(1-t)**2*t*mid+3*(1-t)*t*t*mid+t**3*x2,
                       (1-t)**3*y1+3*(1-t)**2*t*y1+3*(1-t)*t*t*y2+t**3*y2))
    draw.line(points, fill=shaded, width=5)
    svg.append(f'<path d="M{x1},{y1} C{mid},{y1} {mid},{y2} {x2},{y2}" fill="none" stroke="{color}" stroke-opacity=".38" stroke-width="5"/>')

text(65, 42, 'autopilotindex  /  RESEARCH', 21, '#c5ef7a', True)
text(65, 90, 'The Self-Improving Products Wave', 49, FG, True)
text(65, 150, 'Have your product on autopilot?', 25, FG)
text(65, 185, '5 categories  /  10 subcategories  /  20 companies to understand', 19, MUTED)
text(65, 218, 'CATEGORY', 18, MUTED, True)
text(490, 218, 'SUBCATEGORY', 18, MUTED, True)
text(1030, 218, 'REPRESENTATIVE COMPANIES', 18, MUTED, True)

layout=[]
y=260
for name,color,subs in GROUPS:
    group={'name':name,'color':color,'subcategories':[]}
    for sub,companies in subs:
        positions=[]
        for company,product,url in companies:
            positions.append({'name':company,'product':product,'source':url,'y':y})
            y += 54
        group['subcategories'].append({'name':sub,'companies':positions,'y':sum(c['y']+24 for c in positions)/len(positions)})
    group['y']=sum(s['y'] for s in group['subcategories'])/len(group['subcategories'])
    layout.append(group)
    y+=30

for group in layout:
    color=group['color']
    for sub in group['subcategories']:
        line(365,group['y'],490,sub['y'],color)
        for co in sub['companies']:
            line(865,sub['y'],1030,co['y']+24,color)

for group in layout:
    gy,color=group['y'],group['color']
    rect(65,gy-39,300,78,CARD)
    rect(65,gy-39,5,78,color,2)
    words=group['name'].split(' ')
    if len(group['name'])>20:
        text(84,gy-25,words[0],25,color,True)
        text(84,gy+6,' '.join(words[1:]),25,color,True)
    else:
        text(84,gy-12,group['name'],25,color,True)
    for sub in group['subcategories']:
        rect(490,sub['y']-27,375,54,CARD)
        text(510,sub['y']-10,sub['name'],23,FG)
        for co in sub['companies']:
            rect(1030,co['y'],505,47,CARD,7)
            rect(1030,co['y'],5,47,color,2)
            text(1048,co['y']+5,co['name'],23,FG,True)
            text(1048,co['y']+30,co['product'],15,MUTED)

text(65,1492,'QUALITATIVE MAP · Membership only; line widths carry no values. Companies can span categories.',20,MUTED)
text(65,1526,'Sources: linked primary company materials in the accompanying article · Checked 14 September 2026',18,MUTED)
svg.append('</svg>')
image.save(ROOT/'market-map.png')
(ROOT/'market-map.svg').write_text('\n'.join(svg),encoding='utf-8')
(ROOT/'market-map.json').write_text(json.dumps({'as_of':'2026-09-14','method':'Representative category membership; no quantitative weights or rankings.','categories':layout},indent=2)+'\n')
print(f'Rendered {sum(len(s[1]) for g in GROUPS for s in g[2])} companies to {ROOT}')
