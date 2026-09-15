"""Create Pulse #09's newsletter cover and LinkedIn feed graphic."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
DEST = ROOT / 'public' / 'pulse'
FONTS = Path('/System/Library/Fonts/Supplemental')

def render(w, h, name):
    im = Image.new('RGB', (w, h), '#101513')
    d = ImageDraw.Draw(im)
    sx = w/1200
    def text(x,y,value,size,color='#f2f5ef',bold=False):
        f=ImageFont.truetype(str(FONTS/('Arial Bold.ttf' if bold else 'Arial.ttf')),int(size*sx))
        d.text((int(x*sx),int(y*sx)),value,font=f,fill=color,anchor='lt')
    text(72,60,'autopilotindex   /   PULSE #09',24,'#c5ef7a',True)
    text(72,150,'The Self-Improving',66,bold=True)
    text(72,230,'Products Wave',66,bold=True)
    text(72,345,'Have your product on autopilot?',36,'#c5ef7a')
    rows=[('PRODUCT SIGNALS','PostHog · Amplitude','#c5ef7a'),
          ('PRODUCTION SIGNALS','Sentry · Datadog','#7ccbec'),
          ('AGENT EXECUTION','Anthropic · OpenAI · GitHub','#bca7f4')]
    start=470 if h/w>1 else 455
    pitch=170 if h/w>1 else 120
    for i,(label,names,color) in enumerate(rows):
        y=start+i*pitch
        d.rounded_rectangle((int(72*sx),int(y*sx),int(1128*sx),int((y+100)*sx)),radius=int(10*sx),fill='#19211d')
        d.rectangle((int(72*sx),int(y*sx),int(78*sx),int((y+100)*sx)),fill=color)
        text(104,y+16,label,18,color,True)
        text(104,y+48,names,34,bold=True)
    base=h/sx
    text(72,base-220,'20 companies. Five categories.',34,bold=True)
    text(72,base-167,'Seven recent implementation reports.',27,'#b0bdb3')
    text(72,base-77,'14 SEPTEMBER 2026  ·  AUTOPILOTINDEX.COM',19,'#b0bdb3')
    im.save(DEST/name)

render(1200,1500,'09-cover.png')
render(1200,1500,'09-linkedin-post.png')
print('Created newsletter cover and feed image.')
