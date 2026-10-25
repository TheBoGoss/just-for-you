/*
 * POINTILLISM LILY — porting Canvas 2D della versione Python/Pygame.
 * Nessuna dipendenza, compatibile con GitHub Pages e browser mobili.
 * Le formule di crescita, petali, colori, stami, alone e particelle
 * derivano dal codice originale; i punti sono ordinati per profondità.
 */
(() => {
  'use strict';
  const cfg = Object.assign({message: 'Un piccolo fiore, solo per te. ♡', messageAt: 16.5, autoLoop: false}, window.LILY_CONFIG || {});
  const canvas = document.getElementById('flower');
  const ctx = canvas.getContext('2d', {alpha: false, desynchronized: true});
  const letter = document.getElementById('letter');
  const replay = document.getElementById('replay');
  const loading = document.getElementById('loading');
  document.getElementById('letterText').textContent = cfg.message;

  // Limiti risoluzione e frequenza: l'animazione mantiene la stessa geometria
  // anche su smartphone meno potenti. Non dipende dalle dimensioni CSS.
  const mobile = matchMedia('(pointer: coarse)').matches;
  let W = mobile ? 480 : 540;
  let H = Math.round(W * 16 / 9);
  if (!mobile && window.devicePixelRatio <= 1.25) { W = 720; H = 1280; }
  const S = W / 720;
  canvas.width = W;
  canvas.height = H;
  const GX = W / 2, GY = H * 0.82, HS = 380 * S;
  const PI = Math.PI, TWO_PI = 2 * PI;
  const smooth = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp8 = v => Math.min(255, Math.max(0, v));
  const sin = Math.sin, cos = Math.cos;
  // PRNG riproducibile: le particelle non "saltano" da un fotogramma all'altro.
  let state = 11;
  function rand() {
    state |= 0; state = (state + 0x6D2B79F5) | 0;
    let x = Math.imul(state ^ (state >>> 15), 1 | state);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  }
  function uniform(a, b) { return a + (b - a) * rand(); }
  let spare = null;
  function normal() {
    if (spare !== null) { const n = spare; spare = null; return n; }
    const a = Math.sqrt(-2 * Math.log(Math.max(1e-12, rand())));
    const b = TWO_PI * rand(); spare = a * sin(b); return a * cos(b);
  }
  const stops = [0, .35, .7, 1];
  function interpStops(u, vals) {
    let i = 0;
    while (i < 2 && u > stops[i + 1]) i++;
    return lerp(vals[i], vals[i+1], (u-stops[i])/(stops[i+1]-stops[i]));
  }
  const petals = [];
  for (let k = 0; k < 6; k++) {
    const outer = (k % 2 === 0), pts = [];
    for (let j = 0; j < 2300; j++) {
      const u = rand() ** .85, v = uniform(-1, 1);
      const prof = sin(PI * (u ** .7)) ** .9;
      let r = interpStops(u, [205,255,255,255]);
      let g = interpStops(u, [40,95,150,195]);
      let b = interpStops(u, [125,165,205,228]);
      const mid = Math.abs(v) < .07 && u < .55;
      if (mid) { r=235; g=225; b=150; }
      else if (rand() < .10 && u < .6 && Math.abs(v) < .75) { r=140; g=15; b=80; }
      if (Math.abs(v) > .88) { r*=1.08; g*=1.08; b*=1.08; }
      const m = .82 + .35 * rand();
      pts.push({u, v, prof, r:r*m, g:g*m, b:b*m});
    }
    petals.push({phi: (k*60+8)*PI/180, L: (outer?300:280)*S,
      Wm:(outer?64:72)*S, ac:outer?.10:.05, ao:outer?1.05:.82,
      curl:outer?.95:.75, pts});
  }
  const stem=[];
  for(let i=0;i<3200;i++){
    const s=rand(), dx=normal()*3.2*S*(1-.5*s), m=.8+.4*rand();
    stem.push({s,dx,r:lerp(40,120,s)*m,g:lerp(150,215,s)*m,b:lerp(95,120,s)*m});
  }
  const leaves=[];
  for(const [s0, Len, side] of [[.10,190,1],[.24,175,-1],[.40,150,1],[.56,120,-1]]){
    const pts=[];
    for(let i=0;i<900;i++){
      const u=rand()**.9, v=uniform(-1,1), prof=sin(PI*(u**.8))**.8;
      let r=lerp(40,140,u),g=lerp(160,235,u),b=lerp(100,140,u);
      if(Math.abs(v)<.08){r=190;g=240;b=170;}
      const m=.8+.4*rand(); pts.push({u,v,prof,r:r*m,g:g*m,b:b*m});
    }
    leaves.push({s0,L:Len*S,side,pts});
  }
  const soil=[];
  for(let i=0;i<5000;i++){
    const dx=uniform(-340,340)*S, mound=(1-(dx/(340*S))**2)*55*S;
    soil.push({x:GX+dx, y:GY-mound*Math.sqrt(rand())+normal()*1.5*S,
      r:lerp(70,140,rand())*.8, g:lerp(55,100,rand())*.8,b:lerp(80,120,rand())*.8});
  }
  const dust=[];
  for(let i=0;i<450;i++)dust.push({x:rand()*W,y:rand()*H,speed:uniform(6,22)*S,ph:rand()*TWO_PI,f:uniform(1,4)});
  const ring=Array.from({length:1100},()=>rand()*TWO_PI);
  const circleAngles=Array.from({length:6},()=>Array.from({length:260},()=>rand()*TWO_PI));
  const fireflies=[];
  for(let i=0;i<140;i++)fireflies.push({off:rand(),ph:rand()*TWO_PI,dr:uniform(-80,80)*S,sp:uniform(.05,.12)});
  const stam=Array.from({length:6},(_,k)=>({phi:(k*60+38)*PI/180,
    us:Array.from({length:45},()=>rand()),
    an:Array.from({length:35},()=>[normal()*5*S,normal()*5*S,.8+.4*rand()])}));

  // I buffer sono riutilizzati: 30.000 puntini + sorting stabile per z.
  const CAP=40000, NBINS=256;
  const X=new Float32Array(CAP), Y=new Float32Array(CAP), Z=new Float32Array(CAP);
  const CR=new Uint8Array(CAP), CG=new Uint8Array(CAP), CB=new Uint8Array(CAP);
  const bins=new Uint32Array(NBINS), next=new Uint32Array(NBINS), order=new Uint32Array(CAP);
  let length=0;
  function add(x,y,z,r,g,b){
    if(length===CAP || !Number.isFinite(x+y+z))return;
    X[length]=x;Y[length]=y;Z[length]=z;
    CR[length]=clamp8(r);CG[length]=clamp8(g);CB[length]=clamp8(b);length++;
  }
  function stemX(s,t){ return GX+30*S*sin(2.2*s)+10*S*sin(.9*t)*s*s; }
  function stemY(s){ return GY-s*HS; }
  // Identico alla midrib Python: integrazione discreta di 40 segmenti.
  function midrib(L,a0,curl){
    const r=new Float32Array(41),h=new Float32Array(41),ds=L/40;
    for(let j=1;j<=40;j++){
      const angle=a0+curl*(j/40)**1.6;
      r[j]=r[j-1]+sin(angle)*ds;
      h[j]=h[j-1]+cos(angle)*ds;
    }
    return {r,h};
  }
  function sample(m,u){
    const f=Math.max(0,Math.min(39.99999,u*40)),k=f|0,p=f-k;
    return [lerp(m.r[k],m.r[k+1],p),lerp(m.h[k],m.h[k+1],p)];
  }
  function build(t){
    length=0;
    const growth=smooth(t/4), e=smooth((t-5)/10), rev=smooth((t-3.7)/1.6);
    const hx=stemX(1,t),hy=stemY(1);
    for(const d of dust){
      const tw=.35+.65*(sin(t*d.f+d.ph)>.2?1:0);
      const yy=((d.y-t*d.speed)%H+H)%H;
      add(d.x,yy,-1000,255*tw*.55,200*tw*.55,235*tw*.55);
    }
    const halo=smooth((t-3.5)/4)*.9;
    if(halo>.01){
      const cx=hx, cy=hy-90*S,R=300*S,rot=t*.12;
      for(const ar of ring){const a=ar+rot;add(cx+R*cos(a),cy+R*sin(a),-900,255*halo*.7,190*halo*.7,225*halo*.7);}
      for(let k=0;k<6;k++){
        const ca=rot*1.3+k*PI/3, ox=cx+R*cos(ca),oy=cy+R*sin(ca);
        for(const ar of circleAngles[k]){
          const a=ar+rot;add(ox+R*.5*cos(a),oy+R*.5*sin(a),-900,255*halo*.45,170*halo*.45,215*halo*.45);
        }
      }
    }
    for(const p of soil)add(p.x,p.y,-500,p.r,p.g,p.b);
    for(const p of stem){if(p.s<=growth)add(stemX(p.s,t)+p.dx,stemY(p.s),-100,p.r,p.g,p.b);}
    for(const lf of leaves){
      const lg=Math.max(0,Math.min(1,(growth-lf.s0)*2.5));
      if(lg<=.01)continue;
      const m=midrib(lf.L*lg,.85,1.1);
      const bx=stemX(lf.s0,t),by=stemY(lf.s0),sway=sin(t*1.2+lf.s0*5)*.03;
      for(const p of lf.pts){
        const [rr,hh]=sample(m,p.u),wid=15*S*p.prof*lg;
        add(bx+lf.side*(rr+p.v*wid*.35)+sway*hh*lf.side,
          by-hh+p.v*wid,-90,p.r,p.g,p.b);
      }
    }
    if(rev>.01){
      const psi=.25+t*.22,tau=.5,cp=cos(psi),sp=sin(psi),ct=cos(tau),st=sin(tau),sway=sin(t*.8)*.02;
      for(const p of petals){
        const Ls=p.L*(.45+.55*e)*(.35+.65*rev);
        const a0=lerp(p.ac,p.ao,e),curl=(.12+.88*e)*p.curl;
        const m=midrib(Ls,a0,curl),ph=p.phi,cph=cos(ph),sph=sin(ph);
        for(const pt of p.pts){
          const u=pt.u;
          if(u>rev)continue;
          const [rr,hh]=sample(m,u),v=pt.v;
          const wid=p.Wm*(.55+.45*e)*pt.prof*(.35+.65*rev);
          const xx=rr*cph-v*wid*sph,zz=rr*sph+v*wid*cph;
          const yy=hh+v*v*wid*(.30*(1-e)-.25*e);
          const xp=xx*cp+zz*sp,zp=-xx*sp+zz*cp,sy=yy*ct-zp*st;
          const shade=.55+.45*Math.max(0,Math.min(1,zp/p.L*.8+.5));
          const tint=(1-e)*Math.min(1,u*1.3)*.6;
          add(hx+xp+sway*sy,hy-sy,zp,
            (pt.r*(1-tint)+135*tint)*shade,
            (pt.g*(1-tint)+205*tint)*shade,
            (pt.b*(1-tint)+125*tint)*shade);
        }
      }
      if(e>.28){
        const sr=smooth((e-.28)/.4);
        for(const sdat of stam){
          const Ls=215*S*(.4+.6*e)*sr,m=midrib(Ls,lerp(.15,.62,e),.55*e);
          const ph=sdat.phi,cph=cos(ph),sph=sin(ph);
          for(const u of sdat.us){
            const [rr,hh]=sample(m,u);
            const xx=rr*cph,zz=rr*sph;
            const xp=xx*cp+zz*sp,zp=-xx*sp+zz*cp,sy=hh*ct-zp*st;
            add(hx+xp,hy-sy,zp+5,245,235,200);
          }
          const xx=m.r[40]*cph,zz=m.r[40]*sph,yy=m.h[40];
          const xp=xx*cp+zz*sp,zp=-xx*sp+zz*cp,sy=yy*ct-zp*st;
          for(const a of sdat.an)add(hx+xp+a[0]*1.6,hy-sy+a[1]*.7,zp+6,255*a[2],150*a[2],40*a[2]);
        }
      }
    }
    if(e>.6){
      const fa=smooth((e-.6)/.4);
      for(const p of fireflies){
        const q=(t*p.sp+p.off)%1,fx=hx+p.dr*q+sin(q*7+p.ph)*25*S;
        const fy=(hy-110*S)+q*(GY-hy+90*S),fade=(1-q)*fa;
        if(p.ph>3.1)add(fx,fy,300,255*fade,190*fade,80*fade);
        else add(fx,fy,300,255*fade,150*fade,205*fade);
      }
    }
  }

  const img=ctx.createImageData(W,H), data=img.data;
  const glowCanvas=document.createElement('canvas'), glowCtx=glowCanvas.getContext('2d',{alpha:false});
  glowCanvas.width=Math.max(1,Math.floor(W/10));glowCanvas.height=Math.max(1,Math.floor(H/10));
  function raster(){
    // Sul Canvas i canali sono RGBA e le righe procedono prima per Y.
    // Ordiniamo in bucket di profondità per simulare np.argsort(z).
    bins.fill(0);
    for(let i=0;i<length;i++)bins[Math.max(0,Math.min(255,((Z[i]+1000)*255/1300)|0))]++;
    let k=0;
    for(let b=0;b<NBINS;b++){next[b]=k;k+=bins[b];}
    for(let i=0;i<length;i++){
      const b=Math.max(0,Math.min(255,((Z[i]+1000)*255/1300)|0));
      order[next[b]++]=i;
    }
    for(let i=0;i<data.length;i+=4){ data[i]=4;data[i+1]=2;data[i+2]=10;data[i+3]=255; }
    const line=W*4;
    for(let v=0;v<length;v++){
      const i=order[v],x=X[i]|0,y=Y[i]|0;
      if(x<0||y<0||x>=W-2||y>=H-2)continue;
      const p=(y*W+x)*4,r=CR[i],g=CG[i],b=CB[i];
      for(const q of [p,p+4,p+line]) {data[q]=r;data[q+1]=g;data[q+2]=b;}
    }
    ctx.putImageData(img,0,0);
    // La versione Python ridimensiona a 1/10 e somma l'immagine sfumata:
    // qui facciamo la stessa cosa con due canvas e blend additivo.
    glowCtx.drawImage(canvas,0,0,glowCanvas.width,glowCanvas.height);
    ctx.save();ctx.globalCompositeOperation='lighter';
    ctx.imageSmoothingEnabled=true;
    ctx.drawImage(glowCanvas,0,0,W,H);ctx.restore();
  }
  let t=0, running=true, shownMessage=false, last=0, accumulator=0, reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FRAME_MS=mobile?1000/30:1000/40;
  function updateUI(){
    if(t>=cfg.messageAt){ if(!shownMessage){letter.classList.add('show');shownMessage=true;} }
    else {letter.classList.remove('show');shownMessage=false;}
    replay.classList.toggle('show',t>=cfg.messageAt+2.8);
  }
  function restart(){
    t=0;accumulator=0;running=true;last=performance.now();
    letter.classList.remove('show');replay.classList.remove('show');shownMessage=false;
    build(0);raster();
  }
  replay.addEventListener('click',e=>{e.stopPropagation();restart();});
  canvas.addEventListener('click',()=>{if(t>cfg.messageAt+1)restart();});
  document.addEventListener('keydown',e=>{
    if(e.key.toLowerCase()==='r')restart();
    if(e.code==='Space'){e.preventDefault();running=!running;last=performance.now();}
  });
  document.addEventListener('visibilitychange',()=>{last=performance.now();});
  function tick(now){
    requestAnimationFrame(tick);
    if(document.hidden)return;
    const dt=Math.min(.10,Math.max(0,(now-last)/1000));last=now;
    if(reducedMotion){
      if(t!==20){t=20;build(t);raster();updateUI();}
      return;
    }
    if(running){
      t+=dt;
      if(cfg.autoLoop && t>27){t=0;letter.classList.remove('show');shownMessage=false;}
    }
    accumulator+=dt*1000;
    if(accumulator<FRAME_MS)return;
    accumulator=0;
    build(t);raster();updateUI();
  }
  try {
    build(0);raster();updateUI();loading.classList.add('done');
    if(reducedMotion){t=20;build(t);raster();updateUI();}
    last=performance.now();requestAnimationFrame(tick);
  } catch(err){
    console.error('Errore nella fioritura:',err);
    loading.textContent='✦';
  }
})();
