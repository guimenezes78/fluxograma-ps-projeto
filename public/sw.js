const CACHE="manchester-huvr-v2";
const ASSETS=["/manchester.html","/brand/logo-mark.png","/brand/favicon-32.png","/brand/icon-192.png","/brand/icon-512.png","/brand/apple-touch-icon.png","/brand/hospital-huvr.jpg","/manifest.webmanifest"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET") return;
  e.respondWith(
    caches.match(req).then(cached=>
      fetch(req).then(res=>{
        const copy=res.clone();
        caches.open(CACHE).then(c=>{ try{ c.put(req,copy); }catch(_){} });
        return res;
      }).catch(()=> cached || Response.error())
    )
  );
});
