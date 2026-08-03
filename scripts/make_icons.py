from pathlib import Path
from PIL import Image
d=Path(r"C:/Users/guime/dev/fluxograma-ps-projeto/public/brand")
logo=Image.open(d/"logo-huvr.png").convert("RGBA")
mark=logo.crop((70,5,380,220))
mark.save(d/"logo-mark.png")
print("mark", mark.size)
for s,name in [(512,"icon-512.png"),(192,"icon-192.png"),(180,"apple-touch-icon.png"),(64,"favicon-64.png"),(32,"favicon-32.png")]:
 m=mark.copy()
 m.thumbnail((s,s), Image.Resampling.LANCZOS)
 canvas=Image.new("RGBA",(s,s),(255,255,255,255))
 canvas.paste(m, ((s-m.size[0])//2,(s-m.size[1])//2), m)
 canvas.save(d/name)
 print(name)
Image.open(d/"favicon-32.png").save(d/"favicon.ico")
print("done", sorted(p.name for p in d.iterdir()))
