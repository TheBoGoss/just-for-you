/* JUST FOR YOU ✧ — cinematic procedural lily, Canvas 2D, zero dependencies */
(() => {
  'use strict';
  const conf = Object.assign({ message: 'Un piccolo pensiero, per te. ✨', messageAt: 18.5, autoLoop: false }, window.LILY_CONFIG || {});
  const canvas = document.getElementById('art');
  const ctx = canvas.getContext('2d', { alpha: false });
  const dedication = document.getElementById('dedication');
  const replay = document.getElementById('replay');
  const hint = document.getElementById('hint');
  const opening = document.getElementById('opening');
  document.getElementById('message').textContent = conf.message;
  const mobile = matchMedia('(pointer: coarse)').matches;
  const lowPower = mobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  const W = lowPower ? 504 : 648;
  const H = W * 16 / 9;
  const S = W / 720;
  const PI = Math.PI, TAU = 2 * PI;
  const sin = Math.sin, cos = Math.cos;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const r01 = (a, b, t) => a + (b - a) * t;
  const hx0 = W * .50, groundY = H * .827, stemHeight = 389 * S;
  const PIx = PI / 180;
  canvas.width = W;
  canvas.height = H;
  let seed = 24681357;
  function rand() {
    seed = (seed + 0x6D2B79F5) | 0;
    let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  }
  function between(a, b) { return a + (b - a) * rand(); }
  function gaussian() { return Math.sqrt(-2 * Math.log(Math.max(1e-8, rand()))) * cos(TAU * rand()); }
  function radial(x, y, r, inner, outer) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, r));
    g.addColorStop(0, inner); g.addColorStop(1, outer); return g;
  }
  function lineGradient(x0, y0, x1, y1, a, b) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, a); g.addColorStop(1, b); return g;
  }
  function flowerHead(t) { return [stemX(1, t), groundY - stemHeight]; }
  function stemX(s, t) { return hx0 + 28 * S * sin(2.18 * s) + 8 * S * sin(t * .56) * s * s; }
  function stemY(s) { return groundY - s * stemHeight; }
  function rgba(r, g, b, a = 1) { return `rgba(${r|0},${g|0},${b|0},${a})`; }

  const stars = Array.from({length: lowPower ? 160 : 260}, () => ({
    x: rand() * W, y: rand() * H * .85, r: between(.45, 1.7) * S,
    phase: rand() * TAU, speed: between(.36, 1.3), power: between(.18, .72),
    color: rand() > .55 ? [255,211,225] : [193,194,255]
  }));
  const dust = Array.from({length:lowPower ? 90 : 150},() => ({
    x:rand()*W,y:rand()*H,dx:between(-6,6)*S,vy:between(3,14)*S,
    phase:rand()*TAU,r:between(.5,2.2)*S,c:rand()
  }));
  const touches = [];
  const motes = Array.from({length:lowPower ? 50 : 85}, () => ({
    angle:rand()*TAU,dist:between(30,320)*S,phase:rand()*TAU,
    speed:between(.17,.52),r:between(.6,2.6)*S
  }));
  const petals = [];
  for (let i=0;i<6;i++) {
    const isOuter=i%2===0, dots=[];
    const n=lowPower ? 1650 : 2900;
    for(let j=0;j<n;j++) {
      const u=rand() ** .86,v=between(-1,1),p=sin(PI*(u**.70))**.83;
      dots.push({u,v,p,bright:between(.65,1.20),speck:rand(),spot:rand()<.09&&u<.67&&Math.abs(v)<.76});
    }
    petals.push({
      i, phi:(i*60+8)*PIx, L:(isOuter?319:292)*S,
      width:(isOuter?93:103)*S, angle:(isOuter?1.14:.93), curl:(isOuter?.84:.68), dots,
      mesh:[], isOuter
    });
  }
  const stamenAngles=Array.from({length:6},(_,i)=>(i*60+38)*PIx);
  const pollen=Array.from({length:170}, () => ({
    s:rand(),angle:rand()*TAU,ph:rand()*TAU,r:between(.8,2.7)*S,velocity:between(.06,.18)
  }));
  const meteorTrails=Array.from({length:3},(_,i)=>({period:between(13,20),offset:i*6+between(0,3),slope:between(.3,.48)}));
  let pointer={x:0,y:0};

  function paintBackground(t, bloom) {
    ctx.fillStyle='#070610';ctx.fillRect(0,0,W,H);
    ctx.fillStyle=radial(W*.5,H*.47,W*.77,'rgba(82,39,101,.36)','rgba(7,6,16,0)');ctx.fillRect(0,0,W,H);
    ctx.fillStyle=radial(W*.25,H*.22,W*.55,'rgba(45,48,91,.25)','rgba(7,6,16,0)');ctx.fillRect(0,0,W,H);
    ctx.fillStyle=radial(W*.85,H*.70,W*.53,'rgba(88,32,59,.19)','rgba(7,6,16,0)');ctx.fillRect(0,0,W,H);
    ctx.save();ctx.globalCompositeOperation='screen';
    const halo=bloom*.87;
    const [cx,cy]=flowerHead(t);
    ctx.fillStyle=radial(cx,cy-75*S,360*S,`rgba(190,79,155,${.25*halo})`,'rgba(105,49,133,0)');
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle=radial(cx,cy-70*S,183*S,`rgba(255,164,199,${.23*halo})`,'rgba(248,120,184,0)');ctx.fillRect(0,0,W,H);
    // Luminous shafts hidden deep behind the petals.
    if(bloom>.05) {
      ctx.save(); ctx.translate(cx,cy-80*S);ctx.rotate(t*.023);
      for(let k=0;k<13;k++) {
        const a=TAU*k/13, r=290*S;
        const g=ctx.createLinearGradient(0,0,cos(a)*r,sin(a)*r);
        g.addColorStop(0,`rgba(253,194,220,${.10*bloom})`);
        g.addColorStop(1,'rgba(244,173,228,0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,0);
        ctx.lineTo(cos(a-.02)*r,sin(a-.02)*r);ctx.lineTo(cos(a+.02)*r,sin(a+.02)*r);ctx.closePath();ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
    for(const s of stars) {
      const a=s.power*(.67+.33*sin(t*s.speed+s.phase));
      ctx.fillStyle=rgba(s.color[0],s.color[1],s.color[2],a);
      const x=s.x+pointer.x*4*S*(s.r/S),y=s.y+pointer.y*3*S*(s.r/S);
      ctx.fillRect(x,y,s.r,s.r);
    }
    for(const m of dust) {
      const y=((m.y-t*m.vy)%H+H)%H;
      const x=m.x+sin(t*.5+m.phase)*8*S;
      const q=(.45+.55*(sin(m.phase+t*1.4)**2));
      ctx.fillStyle=rgba(m.c>.5?244:202,m.c>.5?175:204,239,.21*q);
      ctx.beginPath();ctx.arc(x,y,m.r,0,TAU);ctx.fill();
    }
    // Three very rare gentle shooting stars.
    meteorTrails.forEach((m,i)=>{
      const p=((t-m.offset)%m.period+m.period)%m.period;
      if(p>1.1)return;
      const a=1-ease(p/1.1),x=(.15+i*.32+p*.32)*W,y=(.10+i*.13+p*m.slope)*H;
      ctx.strokeStyle=rgba(255,204,224,.26*a);ctx.lineWidth=1.3*S;
      ctx.beginPath();ctx.moveTo(x-90*S,y-55*S);ctx.lineTo(x,y);ctx.stroke();
      ctx.fillStyle=radial(x,y,17*S,`rgba(255,240,242,${.48*a})`,'rgba(255,223,245,0)');ctx.fillRect(x-17*S,y-17*S,34*S,34*S);
    });
  }
  function drawCelestial(t,bloom) {
    if(bloom<=.001)return;
    const [cx,cy]=flowerHead(t),ox=cx,oy=cy-57*S;
    ctx.save();ctx.globalCompositeOperation='screen';
    ctx.lineWidth=.8*S;
    for(let ring=0;ring<3;ring++) {
      const radius=(235+ring*43)*S,fade=[.13,.09,.06][ring]*bloom;
      ctx.strokeStyle=rgba(247,165,210,fade);
      ctx.setLineDash([4*S,8*S+ring*3*S]);ctx.lineDashOffset=-t*(4+ring*2)*S;
      ctx.beginPath();ctx.ellipse(ox,oy,radius,radius*(ring===0?.84:.73),ring*.3,0,TAU);ctx.stroke();
    }
    ctx.setLineDash([]);
    for(const p of motes) {
      const a=p.angle+t*p.speed,ring=p.dist*(.58+.42*bloom);
      const x=ox+cos(a)*ring,y=oy+sin(a)*ring*.79;
      const alpha=bloom*(.25+.55*(.5+.5*sin(t*2+p.phase)));
      ctx.fillStyle=radial(x,y,6*S,rgba(255,198,214,alpha*.47),'rgba(255,198,214,0)');
      ctx.fillRect(x-6*S,y-6*S,12*S,12*S);
      ctx.fillStyle=rgba(255,222,238,alpha);
      ctx.beginPath();ctx.arc(x,y,p.r,0,TAU);ctx.fill();
    }
    ctx.restore();
  }
  function drawStem(t,g) {
    if(g<=0)return;
    ctx.save(); ctx.lineCap='round';ctx.lineJoin='round';
    const segments=36;
    ctx.beginPath();for(let j=0;j<=segments;j++) {
      const s=g*j/segments, x=stemX(s,t),y=stemY(s);
      if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    const stemColor=lineGradient(0,groundY,0,stemY(g),'#38584b','#abdb97');
    ctx.strokeStyle='#122d32';ctx.lineWidth=11*S;ctx.stroke();
    ctx.strokeStyle=stemColor;ctx.lineWidth=6*S;ctx.shadowColor='#8be2ae';ctx.shadowBlur=12*S;ctx.stroke();ctx.shadowBlur=0;
    ctx.strokeStyle='rgba(215,255,201,.51)';ctx.lineWidth=1.2*S;ctx.stroke();
    const defs=[[.13,190,1],[.28,190,-1],[.45,170,1],[.62,148,-1]];
    for(const [at,len,side] of defs) {
      const life=ease((g-at)*2.8);if(life<=0)continue;
      const x=stemX(at,t),y=stemY(at),L=len*S*life;
      const sway=sin(t*.7+at*6)*5*S;
      // Curved leaf, tapered tip and a luminous central vein.
      const tipX=x+side*L*.88+sway,tipY=y-L*.38;
      const baseHue=side>0?'#426f63':'#335966';
      const gradient=lineGradient(x,y,tipX,tipY,baseHue,'#b3edbd');
      ctx.beginPath();ctx.moveTo(x,y);
      ctx.bezierCurveTo(x+side*L*.26,y-L*.67,x+side*L*.60,y-L*.57,tipX,tipY);
      ctx.bezierCurveTo(x+side*L*.52,y-L*.08,x+side*L*.28,y+L*.11,x,y);
      ctx.closePath();ctx.fillStyle=gradient;ctx.globalAlpha=.95;ctx.fill();
      ctx.strokeStyle='rgba(177,255,206,.44)';ctx.lineWidth=1.2*S;ctx.stroke();
      ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+side*L*.44,y-L*.29,tipX,tipY);
      ctx.strokeStyle='rgba(222,255,195,.72)';ctx.lineWidth=1.25*S;ctx.stroke();
      ctx.globalAlpha=1;
    }
    ctx.restore();
  }
  function makeMidrib(L, angle, curl) {
    const r=new Float32Array(49),h=new Float32Array(49),ds=L/48;
    for(let j=1;j<=48;j++) {
      const a=angle+curl*((j/48)**1.6);
      r[j]=r[j-1]+sin(a)*ds;
      h[j]=h[j-1]+cos(a)*ds;
    }
    return {r,h};
  }
  function sample(m,u) {
    const f=clamp(u*48,0,47.999),k=f|0,a=f-k;
    return [lerp(m.r[k],m.r[k+1],a),lerp(m.h[k],m.h[k+1],a)];
  }
  function project(p,m,u,v,t,e,rev,camera) {
    const [r,h]=sample(m,u);
    const prof=Math.max(0,sin(PI*(u**.67)))**.82;
    const width=p.width*prof*(.24+.76*e)*(.35+.65*rev);
    const X=r*cos(p.phi)-v*width*sin(p.phi);
    const Z=r*sin(p.phi)+v*width*cos(p.phi);
    const Y=h+(v*v)*width*(.35*(1-e)-.15*e);
    const xp=X*camera.cp+Z*camera.sp, zp=-X*camera.sp+Z*camera.cp;
    const sy=Y*camera.ct-zp*camera.st;
    return {x:camera.cx+xp,y:camera.cy-sy,z:zp};
  }
  function petalColor(u,v,z,L,light) {
    const tip=ease(u),side=Math.abs(v);
    const central= Math.exp(-Math.pow(v/.19,2))*(1-u);
    const brightness=(.64+.36*clamp(z/(L*.9)+.5))*(.78+.22*light);
    // Dark raspberry roots fade through rose, lavender and pearlescent tips.
    let r=lerp(218,255,tip),g=lerp(66,215,tip),b=lerp(142,237,tip);
    const root=(1-ease(u/.34))*.36;
    r=lerp(r,131,root);g=lerp(g,33,root);b=lerp(b,107,root);
    const gold=central*.58;
    r=lerp(r,255,gold);g=lerp(g,218,gold);b=lerp(b,166,gold);
    const rim=ease((side-.73)/.27)*.20;
    r=lerp(r,255,rim);g=lerp(g,245,rim);b=lerp(b,250,rim);
    return [r*brightness,g*brightness,b*brightness];
  }
  const surfaces=[];
  function drawPetals(t,rev,e) {
    if(rev<=0)return;
    const camera={cp:cos(.22+t*.095),sp:sin(.22+t*.095),ct:cos(.54),st:sin(.54),cx:stemX(1,t),cy:stemY(1)};
    surfaces.length=0;
    const rows=lowPower?26:34,cols=lowPower?9:12;
    for(const p of petals) {
      p.mid=makeMidrib(p.L*(.18+.82*e)*(.42+.58*rev),lerp(.07,p.angle,e),p.curl*(.12+.88*e));
      for(let i=0;i<rows;i++) {
        const u0=rev*i/rows,u1=rev*(i+1)/rows;
        for(let j=0;j<cols;j++) {
          const v0=-1+2*j/cols,v1=-1+2*(j+1)/cols;
          const a=project(p,p.mid,u0,v0,t,e,rev,camera),b=project(p,p.mid,u0,v1,t,e,rev,camera);
          const c=project(p,p.mid,u1,v1,t,e,rev,camera),d=project(p,p.mid,u1,v0,t,e,rev,camera);
          const z=(a.z+b.z+c.z+d.z)/4;
          const [r,g,blue]=petalColor((u0+u1)/2,(v0+v1)/2,z,p.L,1);
          surfaces.push({corners:[a,b,c,d],z,r,g,b:blue,alpha:1});
        }
      }
    }
    surfaces.sort((a,b)=>a.z-b.z);
    ctx.save();
    for(const f of surfaces) {
      ctx.beginPath();ctx.moveTo(f.corners[0].x,f.corners[0].y);
      for(let j=1;j<4;j++)ctx.lineTo(f.corners[j].x,f.corners[j].y);
      ctx.closePath();ctx.fillStyle=rgba(f.r,f.g,f.b,f.alpha);ctx.fill();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.85*S;ctx.stroke();
    }
    // Fine edge filaments, ribs, iridescence and miniature veins.
    ctx.globalCompositeOperation='screen';
    for(const p of petals) {
      for(const v of [-1,1]) {
        ctx.beginPath();for(let j=0;j<=44;j++) {
          const q=project(p,p.mid,rev*j/44,v,t,e,rev,camera);
          if(j===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);
        }
        ctx.strokeStyle=`rgba(255,210,233,${.12+.34*e})`;
        ctx.lineWidth=(.85+e*.7)*S;ctx.stroke();
      }
      for(const v of [-.50,0,.50]) {
        ctx.beginPath();for(let j=0;j<=38;j++) {
          const q=project(p,p.mid,rev*j/38,v,t,e,rev,camera);
          if(j===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);
        }
        ctx.strokeStyle=v===0?`rgba(255,222,161,${.18+.28*e})`:`rgba(255,213,235,${.08+.09*e})`;
        ctx.lineWidth=(v===0?1.5:.65)*S;ctx.stroke();
      }
    }
    ctx.restore();
    // Microscopic light-catching grains over the silk petals.
    ctx.save();ctx.globalCompositeOperation='screen';
    for(const p of petals) {
      for(const d of p.dots) {
        if(d.u>rev)continue;
        const q=project(p,p.mid,d.u,d.v,t,e,rev,camera);
        const shade=.55+.45*clamp(q.z/(p.L*.8)+.5);
        const [r,g,b]=petalColor(d.u,d.v,q.z,p.L,d.bright);
        const a=(d.speck>.975?.91:.40)*shade;
        ctx.fillStyle=rgba(r,g,b,a);
        const radius=d.speck>.977?1.55*S:1*S;
        ctx.fillRect(q.x,q.y,radius,radius);
        if(d.spot && e>.4) {
          ctx.fillStyle='rgba(128,23,93,.35)';ctx.fillRect(q.x,q.y,1.8*S,1.8*S);
        }
      }
    }
    ctx.restore();
    drawStamens(t,e,rev,camera);
  }
  function drawStamens(t,e,rev,camera) {
    const growth=ease((e-.2)/.48)*rev;
    if(growth<.01)return;
    ctx.save();ctx.globalCompositeOperation='screen';
    for(let k=0;k<stamenAngles.length;k++) {
      const ang=stamenAngles[k],L=204*S*growth;
      const m=makeMidrib(L,.16+.37*e,.45*e);
      ctx.beginPath();let tip=null;
      for(let j=0;j<=24;j++) {
        const u=j/24,[r,h]=sample(m,u);
        const X=r*cos(ang),Z=r*sin(ang);
        const xp=X*camera.cp+Z*camera.sp,zp=-X*camera.sp+Z*camera.cp;
        const sy=h*camera.ct-zp*camera.st;
        const x=camera.cx+xp,y=camera.cy-sy;
        if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        tip={x,y,z:zp};
      }
      ctx.strokeStyle='rgba(255,244,189,.91)';ctx.lineWidth=1.9*S;
      ctx.shadowColor='#fce1a1';ctx.shadowBlur=10*S;ctx.stroke();ctx.shadowBlur=0;
      const x=tip.x,y=tip.y;
      ctx.save();ctx.translate(x,y);ctx.rotate(.25+k*.82);
      const bead=ctx.createRadialGradient(0,0,0,0,0,22*S);
      bead.addColorStop(0,'rgba(255,250,189,.75)');bead.addColorStop(.28,'rgba(255,171,82,.55)');bead.addColorStop(1,'rgba(255,149,57,0)');
      ctx.fillStyle=bead;ctx.beginPath();ctx.arc(0,0,22*S,0,TAU);ctx.fill();
      ctx.fillStyle='#ffe1a0';ctx.beginPath();ctx.ellipse(0,0,12*S,3.7*S,0,0,TAU);ctx.fill();
      ctx.fillStyle='#ff994d';ctx.beginPath();ctx.ellipse(0,0,8.2*S,2*S,0,0,TAU);ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
  function ground(t) {
    ctx.save();const grad=ctx.createLinearGradient(0,groundY-50*S,0,groundY+45*S);
    grad.addColorStop(0,'rgba(149,75,122,0)');grad.addColorStop(.6,'rgba(111,65,97,.23)');grad.addColorStop(1,'rgba(88,51,71,0)');
    ctx.fillStyle=grad;ctx.beginPath();ctx.ellipse(W*.50,groundY+2*S,W*.50,39*S,0,PI,0);ctx.fill();
    ctx.strokeStyle='rgba(197,111,163,.14)';ctx.lineWidth=1*S;
    for(let i=0;i<7;i++) {
      ctx.beginPath();ctx.ellipse(hx0,groundY+i*3*S,(55+i*43)*S,(8+i*3)*S,0,PI*.07,PI*.93);ctx.stroke();
    }
    const x=stemX(0,t);
    ctx.fillStyle=radial(x,groundY,95*S,'rgba(153,206,148,.21)','rgba(145,144,195,0)');
    ctx.fillRect(x-95*S,groundY-95*S,190*S,190*S);
    ctx.restore();
  }
  function drawForeground(t,bloom) {
    const [hx,hy]=flowerHead(t);
    if(bloom>0) {
      ctx.save();ctx.globalCompositeOperation='screen';
      for(const p of pollen) {
        const r=(.18+.82*p.s)*220*S;
        const ph=p.angle+t*p.velocity;
        const x=hx+cos(ph)*r+sin(t*.65+p.ph)*12*S;
        const y=hy-35*S+sin(ph)*r*.85-((t*p.velocity*20*S)%40*S);
        const a=bloom*(.11+.6*(sin(t*1.3+p.ph)**2))*(.8-.45*p.s);
        ctx.fillStyle=radial(x,y,9*S,rgba(255,202,148,a*.62),'rgba(255,192,166,0)');
        ctx.fillRect(x-9*S,y-9*S,18*S,18*S);
        ctx.fillStyle=rgba(255,p.s>.5?187:236,194,a);
        ctx.beginPath();ctx.arc(x,y,p.r,0,TAU);ctx.fill();
      }
      ctx.restore();
    }
    for(let i=touches.length-1;i>=0;i--) {
      const p=touches[i],age=t-p.born;
      if(age>1.45){touches.splice(i,1);continue;}
      const q=age/1.45,x=p.x+p.vx*age,y=p.y+p.vy*age+30*S*age*age;
      ctx.save();ctx.globalCompositeOperation='screen';
      const a=(1-q)**2;
      ctx.fillStyle=radial(x,y,14*S,rgba(255,214,240,.47*a),'rgba(255,210,240,0)');
      ctx.fillRect(x-14*S,y-14*S,28*S,28*S);
      ctx.fillStyle=rgba(255,238,211,.85*a);ctx.beginPath();ctx.arc(x,y,p.r*(1-q)+.2,0,TAU);ctx.fill();
      ctx.restore();
    }
  }

  function draw(t) {
    const g=ease(t/4.7),rev=ease((t-3.7)/2.2),e=ease((t-5.1)/11.2),bloom=ease((t-4.4)/7.3);
    paintBackground(t,bloom);drawCelestial(t,bloom);
    ground(t);drawStem(t,g);
    if(rev>0)drawPetals(t,rev,e);
    drawForeground(t,bloom);
  }
  let t=0,last=0,accum=0,playing=true,messageShown=false;
  let reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const interval=1000/(lowPower?27:36);
  function updateLabels() {
    const visible=t>=conf.messageAt;
    if(visible!==messageShown){dedication.classList.toggle('show',visible);messageShown=visible;}
    replay.classList.toggle('show',t>=conf.messageAt+3.4);
    if(t>7)hint.classList.add('hide');
  }
  function restart() {
    t=0;last=performance.now();accum=0;playing=true;messageShown=false;touches.length=0;
    dedication.classList.remove('show');replay.classList.remove('show');
    opening.style.animation='none';void opening.offsetWidth;opening.style.animation='';
    hint.classList.remove('hide');draw(t);
    if(reducedMotion){t=26;draw(t);updateLabels();}
  }
  replay.addEventListener('click',e=>{e.stopPropagation();restart();});
  canvas.addEventListener('pointerdown',e=>{
    if(reducedMotion)return;
    const r=canvas.getBoundingClientRect();
    const x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;
    pointer.x=clamp((x/W-.5)*2,-1,1);pointer.y=clamp((y/H-.5)*2,-1,1);
    for(let i=0;i<24;i++) {
      const a=rand()*TAU,v=between(20,112)*S;
      touches.push({x,y,vx:cos(a)*v,vy:sin(a)*v-35*S,born:t,r:between(.6,2.1)*S});
    }
  });
  document.addEventListener('keydown',e=>{
    if(e.key.toLowerCase()==='r')restart();
    if(e.code==='Space'){e.preventDefault();playing=!playing;last=performance.now();}
  });
  document.addEventListener('visibilitychange',()=>{last=performance.now();});
  function frame(now) {
    requestAnimationFrame(frame);
    if(document.hidden)return;
    let dt=clamp((now-last)/1000,0,.07);last=now;
    if(reducedMotion)return;
    if(playing){t+=dt;if(conf.autoLoop&&t>31){restart();return;}}
    accum+=dt*1000;
    if(accum<interval)return;
    accum=0;
    draw(t);updateLabels();
  }
  try {
    if(reducedMotion){t=26;opening.style.display='none';draw(t);updateLabels();}
    else draw(0);
    last=performance.now();requestAnimationFrame(frame);
  }catch(error){console.error('Errore nell’animazione:',error);}
})();
