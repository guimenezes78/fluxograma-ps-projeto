from pathlib import Path
from PIL import Image
d=Path(r"C:/Users/guime/dev/fluxograma-ps-projeto/public/brand")
logo=Image.open(d/"logo-huvr.png").convert("RGBA")
mark=logo.crop((40,0,410,230))
pix=mark.load()
w,h=mark.size
def is_content(x,y):
 p=pix[x,y]
 if p[3]<20: return False
 return abs(p[0]-255)>18 or abs(p[1]-255)>18 or abs(p[2]-255)>18
xs=[x for x in range(w) for y in range(h) if is_content(x,y)]
ys=[y for y in range(h) for x in range(w) if is_content(x,y)]
left,top,right,bottom=min(xs),min(ys),max(xs)+1,max(ys)+1
pad=10
left=max(0,left-pad); top=max(0,top-pad); right=min(w,right+pad); bottom=min(h,bottom+pad)
trimmed=mark.crop((left,top,right,bottom))
side=max(trimmed.size)+20
canvas=Image.new("RGBA",(side,side),(255,255,255,255))
ox=(side-trimmed.size[0])//2 - 4; oy=(side-trimmed.size[1])//2 - 6
canvas.paste(trimmed,(ox,oy),trimmed)
canvas.save(d/"logo-mark.png")
print("trimmed", trimmed.size, "canvas", canvas.size, "off", ox, oy)
for s,name in [(512,"icon-512.png"),(192,"icon-192.png"),(180,"apple-touch-icon.png"),(64,"favicon-64.png"),(32,"favicon-32.png")]:
 m=canvas.copy(); m.thumbnail((s,s), Image.Resampling.LANCZOS)
 c=Image.new("RGBA",(s,s),(255,255,255,255))
 c.paste(m, ((s-m.size[0])//2,(s-m.size[1])//2), m)
 c.save(d/name)
 print(name)
Image.open(d/"favicon-32.png").save(d/"favicon.ico")
