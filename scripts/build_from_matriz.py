import json,re
from pathlib import Path
root=Path(r"C:/Users/guime/dev/fluxograma-ps-projeto")
d=json.loads((root/"scripts/matriz_dump.json").read_text(encoding="utf-8"))
KW=[("ginecolog","go"),("obstetr","go"),("cirurg","cirurgia"),("ortoped","orto"),("pediatr","pediatra"),("peditria","pediatra"),("clinic","clinico")]
GROUP={"clinico":"Clinica Medica","cirurgia":"Cirurgia Geral","orto":"Ortopedia","go":"Ginecologia/Obstetricia","pediatra":"Pediatria","depende":"Multiplas"}
def clean(s):
 return re.sub(r"\s+", " ", (s or "").replace("\xa0", " ").strip())
def parse_specs(text):
 t=clean(text).lower()
 if not t: return []
 found=[]
 for needle,key in KW:
  if needle in t and key not in found: found.append(key)
 if "cl" in t and "nic" in t and "clinico" not in found: found.append("clinico")
 return found
def js_str(s):
 return json.dumps(clean(s), ensure_ascii=False)
rows=[r for r in d["Matriz_Fluxos"][1:] if any(clean(x) for x in r)]
flows=[]
for r in rows:
 flux,duv,disc,just,esp,mudar,ped,obs=[clean(r[i]) for i in range(8)]
 specs=parse_specs(esp) or parse_specs(ped) or ["depende"]
 border=specs[0]
 grupo=GROUP.get(border,"Geral")
 obs_full=obs
 if mudar:
  obs_full=(obs+" | Quando mudar: "+mudar) if obs else ("Quando mudar: "+mudar)
 flows.append(dict(grupo=grupo,flux=flux,spec=border,specs=specs,disc=disc,esp=esp,just=just,obs=obs_full,mudar=mudar,ped=ped,atencao=("ATEN" in duv.upper())))
casos=[]
for r in d["Casos_Duvida"][1:]:
 if not any(clean(x) for x in r[:6]): continue
 casos.append(dict(sit=clean(r[0]),esp=clean(r[1]),just=clean(r[2]),perg=clean(r[3]),mudar=clean(r[4]),obs=clean(r[5]),specs=parse_specs(r[1])))
js=["const DATA = ["]
for f in flows:
 js.append("{"+("grupo:%s, flux:%s, spec:%s, specs:%s, disc:%s, esp:%s, just:%s, obs:%s, mudar:%s, ped:%s, atencao:%s"%(js_str(f["grupo"]),js_str(f["flux"]),js_str(f["spec"]),json.dumps(f["specs"]),js_str(f["disc"]),js_str(f["esp"]),js_str(f["just"]),js_str(f["obs"]),js_str(f["mudar"]),js_str(f["ped"]),str(f["atencao"]).lower()))+"},")
js.append("];")
js.append("const CASOS_DUVIDA = [")
for c in casos:
 js.append("{"+("sit:%s, esp:%s, just:%s, perg:%s, mudar:%s, obs:%s, specs:%s"%(js_str(c["sit"]),js_str(c["esp"]),js_str(c["just"]),js_str(c["perg"]),js_str(c["mudar"]),js_str(c["obs"]),json.dumps(c["specs"])))+"},")
js.append("];")
(root/"scripts/generated_data.js").write_text(chr(10).join(js),encoding="utf-8")
(root/"scripts/flows.json").write_text(json.dumps({"flows":flows,"casos":casos},ensure_ascii=False,indent=2),encoding="utf-8")
print(len(flows),len(casos),sum(1 for f in flows if f["atencao"]))
