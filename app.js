/*
  UNIVERSE EDITION — original, responsive Canvas 2D experience.
  No dependencies, no tracking, no user data collected.
*/
(() => {
  'use strict';
  const cfg = Object.assign({message: 'Ci sono pensieri che non fanno rumore.\nQuesto, però, voleva arrivare fino a te. ✨', soundInitiallyOn:false}, window.UNIVERSE_CONFIG || {});
  const canvas = document.getElementById('universe');
  const ctx = canvas.getContext('2d', {alpha:false});
  const intro = document.getElementById('intro');
  const reveal = document.getElementById('reveal');
  const startBtn = document.getElementById('start');
  const replayBtn = document.getElementById('replay');
  const soundBtn = document.getElementById('sound');
  const flash = document.getElementById('flash');
  document.getElementById('message').textContent = cfg.message;

  const TWO_PI = 2*Math.PI;
  const clamp = (v,a=0,b=1) => Math.max(a,Math.min(b,v));
  const ease = x => { x=clamp(x); return x*x*(3-2*x); };
  const smoother = x => { x=clamp(x); return x*x*x*(x*(x*6-15)+10); };
  const mix = (a,b,t) => a+(b-a)*t;
  let seed=732123;
  function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
  function rbetween(a,b){return mix(a,b,rand());}

  let W=390,H=844,DPR=1, backdrop, stars=[], meteors=[], rings=[], heartPoints=[], fragments=[];
  let t=0, last=0, active=false, startAt=0, paused=false, revealed=false, flashDone=false, showStart=true;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointer={x:0,y:0,targetX:0,targetY:0};
  const sparks=[];

  function gradientCircle(g,x,y,r,c0,c1='transparent'){
    const grad=g.createRadialGradient(x,y,0,x,y,r);
    grad.addColorStop(0,c0);grad.addColorStop(1,c1);
    g.fillStyle=grad;g.fillRect(x-r,y-r,2*r,2*r);
  }
  function drawNebula(g,w,h){
    g.fillStyle='#020616';g.fillRect(0,0,w,h);
    const gg=g.createLinearGradient(0,0,w,h);gg.addColorStop(0,'#03091c');gg.addColorStop(.34,'#10102a');gg.addColorStop(.7,'#050b22');gg.addColorStop(1,'#030617');
    g.fillStyle=gg;g.fillRect(0,0,w,h);
    // Broad gossamer clouds and a diagonal galactic dust lane.
    const tones=['76,83,164','66,145,188','131,92,174','210,123,127','46,86,143','217,168,110'];
    const s=Math.min(w,h);
    for(let i=0;i<62;i++){
      const a=rand()*TWO_PI, u=(rand()-.5), d=rand();
      const x=w*(.5+u*.94) + Math.sin(a)*w*.12;
      const y=h*(.34+u*.38)+(rand()-.5)*h*.4;
      const rad=(.16+d*.36)*s;
      const color=tones[i%tones.length];
      gradientCircle(g,x,y,rad,`rgba(${color},${(0.045+d*.065).toFixed(3)})`);
    }
    gradientCircle(g,w*.51,h*.31,s*.96,'rgba(52,83,145,.11)');
    gradientCircle(g,w*.53,h*.35,s*.64,'rgba(221,150,99,.10)');
    gradientCircle(g,w*.45,h*.59,s*.78,'rgba(99,76,173,.06)');
    // Soft horizon wash makes foreground typography easier to read.
    const floor=g.createLinearGradient(0,h*.45,0,h);floor.addColorStop(0,'#02051500');floor.addColorStop(.55,'#020515bb');floor.addColorStop(1,'#020412');
    g.fillStyle=floor;g.fillRect(0,h*.45,w,h*.55);
  }
  function onResize(){
    W=window.innerWidth; H=window.innerHeight;
    DPR=Math.min(window.devicePixelRatio||1,Math.min(W,H)<500?1.65:1.8);
    canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
    const off=document.createElement('canvas');
    off.width=Math.round(W*.9);off.height=Math.round(H*.9);
    const g=off.getContext('2d');
    seed=44409;drawNebula(g,off.width,off.height);
    backdrop=off;
    seed=98765;
    stars=Array.from({length:Math.min(380,Math.round(W*H/1050))},()=>({
      x:rand(),y:rand(),z:rbetween(.28,1),r:rbetween(.28,1.55),p:rbetween(0,TWO_PI),f:rbetween(.3,2.0),tone:Math.floor(rand()*4)
    }));
    meteors=Array.from({length:5},()=>({phase:rand()*22,speed:rbetween(7,14),y:rbetween(.05,.58),x:rbetween(-.3,.95),len:rbetween(55,165)}));
    rings=Array.from({length:190},(_,i)=>({a:rand()*TWO_PI,depth:rand(),r:rbetween(.85,1.75),speed:rbetween(.11,.34),p:rand()*TWO_PI,size:rbetween(.6,2.2)}));
    heartPoints=Array.from({length:105},(_,i)=>{
      const a=(i/105)*TWO_PI;
      const x=16*Math.pow(Math.sin(a),3)/18;
      const y=-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))/18;
      return {x,y,fromX:rbetween(-1.8,1.8),fromY:rbetween(-1.5,1.5),seed:rand()*TWO_PI,size:rbetween(.65,1.85)};
    });
    fragments=Array.from({length:420},()=>({a:rand()*TWO_PI,d:rand(),s:rbetween(.5,1.5),phase:rand()*TWO_PI,c:Math.floor(rand()*3)}));
  }

  function sky(time){
    ctx.drawImage(backdrop,0,0,W,H);
    ctx.save();ctx.globalCompositeOperation='screen';
    const s=Math.min(W,H);
    // Color waves pass slowly through the nebula.
    for(let i=0;i<4;i++){
      const a=time*.12 + i*1.8;
      const x=W*(.48+.22*Math.sin(a)),y=H*(.32+.14*Math.cos(a*.67));
      const r=s*(.42+i*.12);
      gradientCircle(ctx,x,y,r,`rgba(${i%2?'67,156,190':'128,93,181'},.036)`);
    }
    ctx.restore();
    // Twinkling depth layers and occasional diffraction crosses.
    for(let i=0;i<stars.length;i++){
      const p=stars[i];
      const x=p.x*W+pointer.x*(.3+p.z*.8),y=p.y*H+pointer.y*(.25+p.z*.7);
      if(y>H*.84 && p.z<.7)continue;
      const a=.27+p.z*.52 + .18*Math.sin(time*p.f+p.p);
      const col=p.tone===0?'250,223,180':p.tone===1?'145,208,255':p.tone===2?'207,194,255':'244,246,255';
      ctx.fillStyle=`rgba(${col},${clamp(a).toFixed(2)})`;
      const rad=p.r*(.45+p.z*.4);
      ctx.beginPath();ctx.arc(x,y,rad,0,TWO_PI);ctx.fill();
      if(p.r>1.39 && i%3===0){
        const len=(2+p.z*4)*(.65+.35*Math.sin(time*.5+p.p));
        ctx.strokeStyle=`rgba(${col},${a*.26})`;ctx.lineWidth=.7;
        ctx.beginPath();ctx.moveTo(x-len,y);ctx.lineTo(x+len,y);ctx.moveTo(x,y-len);ctx.lineTo(x,y+len);ctx.stroke();
      }
    }
    // A handful of elegant comets, their return staggered in time.
    for(const m of meteors){
      const q=((time+m.phase)/m.speed)%1;
      if(q>.17)continue;
      const tt=q/.17, x=(m.x+tt*.7)*W,y=m.y*H+tt*H*.21;
      const tail=m.len*tt*.7;
      const gl=ctx.createLinearGradient(x-tail,y-tail*.30,x,y);
      gl.addColorStop(0,'rgba(116,172,249,0)');gl.addColorStop(.75,'rgba(124,196,255,.14)');gl.addColorStop(1,'rgba(255,241,202,.95)');
      ctx.strokeStyle=gl;ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(x-tail,y-tail*.3);ctx.lineTo(x,y);ctx.stroke();
      gradientCircle(ctx,x,y,9,'rgba(247,222,171,.28)');
    }
  }

  function aura(cx,cy,R,time,power=1){
    ctx.save();ctx.globalCompositeOperation='screen';
    gradientCircle(ctx,cx,cy,R*2.55,`rgba(98,114,244,${.17*power})`);
    gradientCircle(ctx,cx-R*.28,cy-R*.16,R*1.85,`rgba(229,149,110,${.15*power})`);
    gradientCircle(ctx,cx+R*.38,cy+R*.13,R*1.65,`rgba(47,201,230,${.16*power})`);
    for(let i=0;i<12;i++){
      const a=(i/12)*TWO_PI+time*.035;
      const r=R*(1.15+.16*Math.sin(i*2.5+time));
      const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.84;
      gradientCircle(ctx,x,y,R*.23,'rgba(231,188,156,.025)');
    }
    ctx.restore();
  }
  function ellipsePoint(cx,cy,R,a,spin){
    const A=R*1.67,B=R*.38,tilt=-.32+Math.sin(spin*.18)*.06;
    const xx=A*Math.cos(a),yy=B*Math.sin(a);
    return {x:cx+xx*Math.cos(tilt)-yy*Math.sin(tilt),y:cy+xx*Math.sin(tilt)+yy*Math.cos(tilt),depth:Math.sin(a)};
  }
  function drawRing(cx,cy,R,time,front,power=1){
    const N=105;
    for(let i=0;i<N;i++){
      const a=i/N*TWO_PI+time*.12;
      const b=(i+1)/N*TWO_PI+time*.12;
      const p=ellipsePoint(cx,cy,R,a,time),q=ellipsePoint(cx,cy,R,b,time);
      if((p.depth>0)!==front)continue;
      const glow=(.50+.5*Math.sin(i*.17+time*.8));
      const alpha=(front?.47:.17)+.17*glow;
      ctx.strokeStyle=front?`rgba(248,207,151,${alpha*power})`:`rgba(137,188,255,${alpha*power})`;
      ctx.lineWidth=front?(1.0+1.3*glow):.9;
      ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
    }
    ctx.save();ctx.globalCompositeOperation='screen';
    for(const p of rings){
      const a=p.a+time*p.speed;
      const pos=ellipsePoint(cx,cy,R*p.r,a,time);
      if((pos.depth>0)!==front)continue;
      const shimmer=.35+.65*Math.pow((Math.sin(time*1.5+p.p)+1)*.5,2);
      const radius=p.size*(front?.75:.55)*power;
      ctx.fillStyle=`rgba(${front?'250,219,177':'151,211,255'},${(.15+.64*shimmer)*(front?1:.55)*power})`;
      ctx.beginPath();ctx.arc(pos.x,pos.y,Math.max(.3,radius),0,TWO_PI);ctx.fill();
      if(p.size>1.95&&front)gradientCircle(ctx,pos.x,pos.y,9*power,`rgba(244,204,160,${.09*shimmer*power})`);
    }
    ctx.restore();
  }
  function drawOrb(cx,cy,R,time,power=1){
    if(power<.002)return;
    ctx.save();ctx.globalAlpha=power;
    aura(cx,cy,R,time,1);
    // The far orbital plane disappears behind a shaded opaline sphere.
    drawRing(cx,cy,R,time,false);
    ctx.save();
    ctx.shadowColor='#8ad8fa';ctx.shadowBlur=25;
    const base=ctx.createRadialGradient(cx-R*.28,cy-R*.48,R*.04,cx+R*.22,cy+R*.2,R*1.33);
    base.addColorStop(0,'#a7b7dc');base.addColorStop(.16,'#5675a3');base.addColorStop(.36,'#192e58');base.addColorStop(.62,'#0a1738');base.addColorStop(.81,'#050b22');base.addColorStop(1,'#01030b');
    ctx.fillStyle=base;ctx.beginPath();ctx.arc(cx,cy,R,0,TWO_PI);ctx.fill();
    ctx.restore();
    // Dramatic atmospheric streaks are clipped by the sphere's limb.
    ctx.save();ctx.beginPath();ctx.arc(cx,cy,R-.5,0,TWO_PI);ctx.clip();
    const sheen=ctx.createLinearGradient(cx-R,cy-R,cx+R,cy+R);
    sheen.addColorStop(0,'rgba(255,236,203,.22)');sheen.addColorStop(.3,'rgba(132,215,247,.08)');sheen.addColorStop(.69,'rgba(101,71,165,.06)');sheen.addColorStop(1,'rgba(0,0,0,.0)');
    ctx.fillStyle=sheen;ctx.fillRect(cx-R,cy-R,R*2,R*2);
    ctx.save();ctx.rotate(0);
    for(let j=0;j<29;j++){
      const y=cy-R*.8+j*R*.068;
      const a=.018+.032*(1+Math.sin(j*1.93+time*.13))*.5;
      ctx.beginPath();
      ctx.moveTo(cx-R*1.13,y+Math.sin(time*.17+j)*R*.07);
      ctx.bezierCurveTo(cx-R*.2,y-R*.22*Math.sin(j*.39),cx+R*.27,y+R*.18*Math.sin(j*.46+time*.2),cx+R*1.16,y-R*.05);
      ctx.strokeStyle=`rgba(${j%3?'124,192,229':'247,198,149'},${a})`;
      ctx.lineWidth=R*.016+(j%4===0?R*.018:0);ctx.stroke();
    }
    ctx.restore();
    // A luminous crescent, sculpted by two offset circles.
    ctx.globalCompositeOperation='screen';
    const gl=ctx.createRadialGradient(cx-R*.65,cy-R*.55,1,cx-R*.36,cy-R*.44,R*1.47);
    gl.addColorStop(0,'rgba(253,237,215,.47)');gl.addColorStop(.29,'rgba(249,203,158,.08)');gl.addColorStop(.65,'rgba(59,114,212,.12)');gl.addColorStop(1,'rgba(2,3,15,0)');
    ctx.fillStyle=gl;ctx.fillRect(cx-R,cy-R,R*2,R*2);
    ctx.restore();
    // Micro-thin edge light gives the sphere its almost physical shape.
    ctx.save();ctx.globalAlpha=power;
    const rim=ctx.createLinearGradient(cx-R,cy-R,cx+R,cy+R);
    rim.addColorStop(0,'rgba(255,221,166,.96)');rim.addColorStop(.32,'rgba(141,205,255,.48)');rim.addColorStop(.61,'rgba(122,181,255,.20)');rim.addColorStop(1,'rgba(122,101,213,.77)');
    ctx.strokeStyle=rim;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(cx,cy,R-.7,0,TWO_PI);ctx.stroke();
    drawRing(cx,cy,R,time,true);
    // Orbiting light bodies that slowly exchange depth.
    for(let i=0;i<3;i++){
      const a=time*(.33+(i*.07))+i*2.2;
      const px=cx+Math.cos(a)*R*(1.8+i*.11),py=cy+Math.sin(a)*R*(.44+i*.02)-Math.cos(a)*R*.4;
      gradientCircle(ctx,px,py,10,`rgba(${i?'141,211,255':'255,208,145'},.23)`);
      ctx.fillStyle=i?'#b8e8ff':'#ffe9be';ctx.beginPath();ctx.arc(px,py,1.7,0,TWO_PI);ctx.fill();
    }
    ctx.restore();
  }

  function drawVortex(cx,cy,R,time,progress){
    const k=ease((progress-.2)/3.5);
    if(k<=0)return;
    ctx.save();ctx.globalCompositeOperation='screen';
    // A bright rotating singularity pulls ribbons of stardust inward.
    for(let arm=0;arm<5;arm++){
      ctx.beginPath();
      for(let i=0;i<=105;i++){
        const u=i/105,a=arm*TWO_PI/5+time*.78+(1-u)*Math.PI*2.4;
        const radius=R*(.32+u*2.05)*(1+.06*Math.sin(time+arm));
        const x=cx+Math.cos(a)*radius,y=cy+Math.sin(a)*radius*.74;
        if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.strokeStyle=arm%2?`rgba(102,218,255,${k*.11})`:`rgba(255,218,160,${k*.13})`;
      ctx.lineWidth=arm%2?2:1.5;ctx.shadowBlur=18;ctx.shadowColor=arm%2?'#69d5ff':'#ffe0a8';ctx.stroke();
    }
    ctx.shadowBlur=0;
    gradientCircle(ctx,cx,cy,R*1.25,`rgba(230,208,237,${k*.21})`);
    ctx.restore();
  }

  function drawHeart(cx,cy,R,time,progress){
    const appear=smoother((progress-3.5)/2.3);
    if(appear<=0)return;
    const breathe=1+.025*Math.sin(time*1.5),scale=R*.98*breathe;
    ctx.save();ctx.globalCompositeOperation='screen';
    gradientCircle(ctx,cx,cy,scale*1.8,`rgba(109,156,255,${appear*.09})`);
    gradientCircle(ctx,cx,cy+scale*.12,scale*1.45,`rgba(252,178,153,${appear*.10})`);
    const pts=[];
    for(const p of heartPoints){
      const e=smoother(clamp((progress-3.45-p.seed*.13)/2.55));
      const sx=cx+p.fromX*scale*1.4, sy=cy+p.fromY*scale*1.55;
      const tx=cx+p.x*scale,ty=cy+p.y*scale;
      const x=mix(sx,tx,e)+Math.sin(time*1.4+p.seed)*2*e;
      const y=mix(sy,ty,e)+Math.cos(time*1.2+p.seed)*2*e;
      pts.push({x,y,e,p});
    }
    // Connect the constellation gradually as each star reaches its destination.
    ctx.save();ctx.shadowBlur=15;ctx.shadowColor='#b4cffe';
    for(let i=0;i<pts.length;i++){
      const a=pts[i],b=pts[(i+1)%pts.length];
      const alpha=appear*a.e*b.e;
      ctx.strokeStyle=`rgba(188,215,255,${alpha*.17})`;
      ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    }
    ctx.restore();
    // Bright moving thread animates through the heart.
    const trace=ease((progress-5.4)/1.6);
    if(trace>0){
      const N=Math.floor(trace*heartPoints.length);
      const hue=ctx.createLinearGradient(cx-scale,cy,cx+scale,cy);
      hue.addColorStop(0,'rgba(131,230,255,.4)');hue.addColorStop(.5,'rgba(255,219,156,.93)');hue.addColorStop(1,'rgba(201,167,255,.52)');
      ctx.save();ctx.shadowBlur=22;ctx.shadowColor='#ffe7ad';ctx.strokeStyle=hue;ctx.lineWidth=1.8;
      ctx.beginPath();for(let i=0;i<N;i++){const a=pts[i];i===0?ctx.moveTo(a.x,a.y):ctx.lineTo(a.x,a.y);}ctx.stroke();ctx.restore();
    }
    for(let i=0;i<pts.length;i++){
      const q=pts[i];if(q.e<.02)continue;
      const blink=.5+.5*Math.sin(time*1.7+q.p.seed);
      const r=q.p.size*(i%9===0?2.1:1);
      gradientCircle(ctx,q.x,q.y,r*(i%9===0?10:4),`rgba(${i%3?'168,211,255':'255,222,169'},${appear*(i%9===0?.21:.075)*blink})`);
      ctx.fillStyle=`rgba(${i%3?'198,231,255':'255,237,197'},${appear*(.48+.52*blink)})`;
      ctx.beginPath();ctx.arc(q.x,q.y,r,0,TWO_PI);ctx.fill();
    }
    // A floating comet paints the perimeter after reveal.
    if(progress>6.3){
      const a=(time*.22)%TWO_PI;
      const tx=cx+(16*Math.sin(a)**3/18)*scale,ty=cy-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))/18*scale;
      gradientCircle(ctx,tx,ty,28,'rgba(255,230,169,.27)');
      ctx.fillStyle='#fff8db';ctx.beginPath();ctx.arc(tx,ty,2.9,0,TWO_PI);ctx.fill();
    }
    ctx.restore();
  }

  function drawExplosions(cx,cy,R,time,p){
    const intensity=Math.sin(ease((p-1.15)/3.9)*Math.PI);
    if(intensity<=.001)return;
    ctx.save();ctx.globalCompositeOperation='screen';
    for(const s of fragments){
      const travel=ease((p-1.0-s.d*.9)/3.4);
      if(travel<=0)continue;
      const angle=s.a+time*.18*(s.c?1:-1);
      const r=R*(.42+travel*(1.3+s.d*2));
      const x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r*.78;
      const alpha=intensity*(1-travel*.6);
      ctx.fillStyle=s.c===0?`rgba(255,216,159,${alpha})`:s.c===1?`rgba(149,227,255,${alpha})`:`rgba(215,172,255,${alpha})`;
      ctx.beginPath();ctx.arc(x,y,s.s*(.6+.45*Math.sin(time+s.phase)**2),0,TWO_PI);ctx.fill();
    }
    ctx.restore();
  }
  function drawSparks(dt){
    ctx.save();ctx.globalCompositeOperation='screen';
    for(let i=sparks.length-1;i>=0;i--){
      const p=sparks[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=12*dt;
      if(p.life<=0){sparks.splice(i,1);continue;}
      const a=p.life/p.max;
      ctx.fillStyle=`rgba(${p.c},${a*.87})`;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r*a,0,TWO_PI);ctx.fill();
      if(p.r>1.5)gradientCircle(ctx,p.x,p.y,p.r*8,`rgba(${p.c},${a*.075})`);
    }
    ctx.restore();
  }
  function burst(x,y,n=45){
    for(let i=0;i<n;i++){
      const a=rand()*TWO_PI,sp=rbetween(35,175),m=rbetween(.5,1.6);
      sparks.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:rbetween(.65,2.2),life:m,max:m,c:rand()>.4?'255,218,163':'159,216,255'});
    }
    if(sparks.length>260)sparks.splice(0,sparks.length-260);
  }

  function render(time,dt){
    ctx.setTransform(DPR,0,0,DPR,0,0);
    sky(time);
    const p=active?time-startAt:0;
    const R=Math.min(W*.305,H*.165,220);
    const r=R*(1-.12*smoother((p-2)/4));
    const cy=H*(.345 - .045*smoother((p-4.8)/3));
    const cx=W*.50+pointer.x*.13;
    aura(cx,cy,R*1.20,time,.7);
    if(!active || p<6.2){
      const fade=active?1-smoother((p-3.6)/2.6):1;
      const swell=1+.075*Math.sin(time*.75)+.10*Math.sin(ease(p/4)*Math.PI);
      drawOrb(cx,cy,r*swell,time,fade);
      if(active)drawVortex(cx,cy,R,time,p);
    }
    if(active){
      drawExplosions(cx,cy,R,time,p);
      drawHeart(cx,cy,R*1.25,time,p);
    }
    drawSparks(dt);
  }

  // Opt-in, purely synthesized sound. No external files.
  let audio=null, isSoundOn=Boolean(cfg.soundInitiallyOn);
  function audioStart(){
    try{
      if(!audio){
        const AC=window.AudioContext||window.webkitAudioContext;
        if(!AC)return;
        const ac=new AC();
        const master=ac.createGain();master.gain.value=.00001;
        const filter=ac.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1400;
        master.connect(filter);filter.connect(ac.destination);
        const oscs=[];
        for(const [f,type,v] of [[110,'sine',.24],[164.81,'sine',.12],[220,'triangle',.035],[329.63,'sine',.055]]){
          const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;g.gain.value=v;
          o.connect(g);g.connect(master);o.start();oscs.push(o);
        }
        audio={ac,master,oscs};
      }
      audio.ac.resume();
      audio.master.gain.cancelScheduledValues(audio.ac.currentTime);
      audio.master.gain.setTargetAtTime(.12,audio.ac.currentTime,.55);
    }catch(e){console.debug('Audio non disponibile',e);}
  }
  function audioStop(){
    if(!audio)return;
    audio.master.gain.cancelScheduledValues(audio.ac.currentTime);
    audio.master.gain.setTargetAtTime(.00001,audio.ac.currentTime,.25);
  }
  function bell(freq=660){
    if(!audio||!isSoundOn)return;
    const ac=audio.ac,o=ac.createOscillator(),g=ac.createGain();
    o.type='sine';o.frequency.setValueAtTime(freq,ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(freq*.75,ac.currentTime+1.2);
    g.gain.setValueAtTime(.00001,ac.currentTime);
    g.gain.exponentialRampToValueAtTime(.032,ac.currentTime+.02);
    g.gain.exponentialRampToValueAtTime(.00001,ac.currentTime+1.8);
    o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+1.9);
  }
  function updateSound(){
    soundBtn.setAttribute('aria-pressed',String(isSoundOn));
    soundBtn.setAttribute('aria-label',isSoundOn?'Disattiva suono':'Attiva suono');
  }
  updateSound();
  soundBtn.addEventListener('click',()=>{isSoundOn=!isSoundOn;updateSound();if(isSoundOn){audioStart();bell(784);}else audioStop();});

  function begin(){
    if(active)return;
    active=true;showStart=false;startAt=t;revealed=false;flashDone=false;
    intro.classList.add('exiting');
    reveal.classList.remove('visible');
    burst(W*.5,H*.345,80);
    if(isSoundOn){audioStart();bell(587.3);}
    startBtn.blur();
  }
  function reset(){
    active=false;showStart=true;revealed=false;flashDone=false;
    intro.classList.remove('exiting');reveal.classList.remove('visible');
    flash.classList.remove('active');
    burst(W*.5,H*.345,45);
  }
  startBtn.addEventListener('click',begin);
  replayBtn.addEventListener('click',reset);
  canvas.addEventListener('pointerdown',e=>{
    pointer.targetX=clamp((e.clientX/W-.5)*22,-12,12);
    pointer.targetY=clamp((e.clientY/H-.5)*16,-10,10);
    burst(e.clientX,e.clientY,active?33:20);
    if(isSoundOn&&active)bell(rbetween(700,1200));
  });
  window.addEventListener('pointermove',e=>{
    pointer.targetX=clamp((e.clientX/W-.5)*20,-12,12);
    pointer.targetY=clamp((e.clientY/H-.5)*18,-10,10);
  },{passive:true});
  window.addEventListener('keydown',e=>{
    if(e.code==='Enter'&&!active){begin();}
    if(e.key.toLowerCase()==='r')reset();
    if(e.code==='Space'&&active){e.preventDefault();paused=!paused;}
  });
  document.addEventListener('visibilitychange',()=>{last=performance.now();});
  window.addEventListener('resize',onResize,{passive:true});

  const preview=new URLSearchParams(location.search).get('preview');
  onResize();
  let frame=0;
  function tick(now){
    requestAnimationFrame(tick);
    if(document.hidden)return;
    const dt=Math.min(.055,Math.max(0,(now-last)/1000));last=now;
    if(!paused)t+=dt;
    pointer.x=mix(pointer.x,pointer.targetX,.05);pointer.y=mix(pointer.y,pointer.targetY,.05);
    const p=active?t-startAt:0;
    if(active&&p>=4.18&&!flashDone){
      flashDone=true;flash.classList.add('active');
      setTimeout(()=>flash.classList.remove('active'),260);
      if(isSoundOn)bell(987.77);
    }
    if(active&&p>7&&!revealed){revealed=true;reveal.classList.add('visible');if(isSoundOn)bell(783.99);}
    if(!reduced && (frame++%2===1) && (W<490))return; // 30 fps on small mobile screens
    render(t,dt);
  }
  if(preview==='final'){
    active=true;startAt=-12;intro.classList.add('exiting');
    reveal.classList.add('visible');revealed=true;flashDone=true;
  }else if(reduced){
    // The same scene remains accessible but without the moving transition.
    t=1;
  }
  requestAnimationFrame(tick);
  if(reduced){
    startBtn.addEventListener('click',()=>{t=9;startAt=0;reveal.classList.add('visible');});
  }
})();
