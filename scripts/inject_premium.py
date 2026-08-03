from pathlib import Path
lt,gt,dq,sq,nl = chr(60),chr(62),chr(34),chr(39),chr(10)
p=Path(r"C:/Users/guime/dev/fluxograma-ps-projeto/public/manchester.html")
h=p.read_text(encoding="utf-8")
css=Path(r"C:/Users/guime/dev/fluxograma-ps-projeto/scripts/premium.css").read_text(encoding="utf-8")
a=h.find(lt+"style"+gt)
b=h.find(lt+"/style"+gt)
assert a!=-1 and b!=-1
h=h[:a]+lt+"style"+gt+nl+css+nl+lt+"/style"+gt+h[b+8:]
h=h.replace("style="+dq+"--chip:"+sq+"+m.color+"+sq+dq, "style="+dq+"background:"+sq+"+m.color+"+sq+dq)
p.write_text(h, encoding="utf-8")
print("css_injected", "007A4D" in h)
