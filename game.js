const cv=document.getElementById('c'),ctx=cv.getContext('2d');

if(!CanvasRenderingContext2D.prototype.roundRect)
  CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h)
{this.rect(x,y,w,h)};

const W=480,N=30,GAP=100,TOP=-(N+1)*GAP;
let H=800,S=1;
function resize(){const r=devicePixelRatio||1,iw=innerWidth||W,ih=innerHeight||800;cv.width=iw*r;cv.height=ih*r;S=iw/W;H=ih/S}
addEventListener('resize',resize);resize();

let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
let plats,cups,pl,cam,got,won,conf,keys={};

function init(){
  seed=7;plats=[{x:0,y:0,w:W,h:30}];cups=[];let cx=W/2;
  for(let i=1;i<=N;i++){
    const w=80+rnd()*50;
    cx=Math.max(w/2+10,Math.min(W-w/2-10,cx+(rnd()-.5)*280));
    const y=-i*GAP+(rnd()-.5)*14;
    plats.push({x:cx-w/2,y,w,h:18});
    cups.push({x:cx+(rnd()-.5)*w*.4,y:y-18,t:0,got:false});
  }

  plats.push({x:W/2-130,y:TOP,w:260,h:18});
  pl={x:W/2,y:0,vx:0,vy:0,g:false,coy:0,face:1};
  cam=-H+120;got=0;won=false;conf=[];
  document.getElementById('win').style.display='none';
}

init();

addEventListener('keydown',e=>{keys[e.key]=true;if
  ([' ','ArrowUp','ArrowLeft','ArrowRight'].includes(e.key))
  e.preventDefault()});

addEventListener('keyup',e=>keys[e.key]=false);
function hold(id,k){const b=document.getElementById(id);

  const on=e=>{e.preventDefault();keys[k]=true},off=e=>{e.preventDefault();
    keys[k]=false};

  b.addEventListener('pointerdown',on);['pointerup','pointerleave','pointercancel'].forEach
  (t=>b.addEventListener(t,off));}

hold('bl','ArrowLeft');hold('br','ArrowRight');hold('bj',' ');
document.getElementById('again').onclick=init;

function step(){
  if(!isFinite(cam))cam=pl.y-H*.6;
  confetti();if(won)return;

  const L=keys.ArrowLeft||keys.a||keys.A,R=keys.ArrowRight||keys.d||keys.D,J=keys[' ']||keys.ArrowUp||keys.w||keys.W;
  pl.vx=(R?1:0)*4.2-(L?1:0)*4.2;if(pl.vx)pl.face=pl.vx>0?1:-1;
  pl.coy=pl.g?7:pl.coy-1;

  if(J&&pl.coy>0){pl.vy=-13.2;pl.coy=0;pl.g=false}
  if(!J&&pl.vy<-5)pl.vy+=.5; // short hop

  const prev=pl.y;pl.vy=Math.min(pl.vy+.6,16);pl.x+=pl.vx;pl.y+=pl.vy;
  if(pl.x<0)pl.x+=W;if(pl.x>W)pl.x-=W;
  pl.g=false;

  if(pl.vy>=0)for(const p of plats){
    if(prev<=p.y+1&&pl.y>=p.y&&pl.x>p.x-12&&pl.x<p.x+p.w+12){pl.y=p.y;pl.vy=0;pl.g=true;break}
  }
  for(const c of cups)if(!c.got&&Math.abs(c.x-pl.x)<24&&Math.abs(c.y-(pl.y-14))<26){c.got=true;got++;burst(c.x,c.y,26)}
  if(pl.y<=TOP+2&&Math.abs(pl.x-W/2)<90){won=true;
    document.getElementById('win').style.display='flex';
    for(let i=0;i<400;i++)conf.push(P(Math.random()*W,cam+Math.random()*H,(Math.random()-.5)*2,Math.random()*3+1.5,true));burst(W/2,pl.y-140,80);}
  const target=pl.y-H*.6;cam+=(target-cam)*.1;
}

const COL=['#ff7eb6','#7ec8ff','#ffc93c','#b69cff','#7ee0a8','#ff9a5c'];

function P(x,y,vx,vy,rain){return{x,y,vx,vy,r:Math.random()*6,vr:(Math.random()-.5)*.4,s:5+Math.random()*6,c:COL[Math.random()*6|0],rain,life:1}}
function burst(x,y,n){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=2+Math.random()*5;conf.push(P(x,y-10,Math.cos(a)*v,Math.sin(a)*v-3,false))}}
function confetti(){for(let i=conf.length-1;i>=0;i--){const c=conf[i];c.x+=c.vx+Math.sin(c.y/20+i)*(c.rain?.8:0);c.y+=c.vy;c.r+=c.vr;

  if(c.rain){if(c.y>cam+H)c.y=cam-10}else{c.vy+=.2;c.vx*=.98;c.life-=.015;if(c.life<=0)conf.splice(i,1)}}}

function rr(x,y,w,h,r,f){ctx.fillStyle=f;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function draw(){
  const r=devicePixelRatio||1;ctx.setTransform(r*S,0,0,r*S,0,0);
  ctx.fillStyle='#ffd9e8';ctx.fillRect(0,0,W,H);

  // parallax sprinkles
  for(let i=0;i<30;i++){const sx=(i*97)%W,sy=((i*181-cam*.3)%(H+40)+H+40)%(H+40)-20;
    ctx.fillStyle=`hsla(${i*40} 90% 70% / .5)`;ctx.save();ctx.translate(sx,sy);ctx.rotate(i);ctx.fillRect(-6,-2,12,4);ctx.restore()}
  ctx.save();ctx.translate(0,-cam);
  for(const p of plats){
    if(p.y<cam-40||p.y>cam+H+40)continue;
    if(p.y===0){rr(p.x,p.y,p.w,60,0,'#f7a8c8');rr(p.x,p.y,p.w,10,0,'#fff')}
    else{rr(p.x,p.y,p.w,p.h,8,'#ffb3d1');rr(p.x,p.y,p.w,6,4,'#fff3f8');
      ctx.fillStyle='#ff7eb6';for(let k=8;k<p.w-4;k+=16){ctx.fillRect(p.x+k,p.y+10,5,3)}}
  }

  for(const c of cups){
    if(c.got||c.y<cam-40||c.y>cam+H+40)continue;
    const bob=Math.sin(Date.now()/300+c.x)*3;
    rr(c.x-14,c.y+bob,28,16,4,'#ffd9a8');rr(c.x-14,c.y+bob,28,6,3,'#fff');
    rr(c.x-9,c.y-8+bob,18,9,3,'#ff9ec7');rr(c.x-1.5,c.y-15+bob,3,7,1,'#7ec8ff');
    ctx.fillStyle='#ffc93c';ctx.beginPath();ctx.arc(c.x,c.y-17+bob,3,0,7);ctx.fill();
  }

  // cake
  const cy=TOP,t=Date.now()/400;
  [[-170,'#ff7eb6'],[-120,'#7ec8ff'],[120,'#ffc93c'],[170,'#b69cff']].forEach(([dx,col],i)=>{
    const by=cy-70+Math.sin(t+i)*6;ctx.strokeStyle='#c98aa8';ctx.beginPath();ctx.moveTo(W/2+dx,by+30);ctx.lineTo(W/2+dx*.6,cy);ctx.stroke();
    ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(W/2+dx,by,20,26,0,0,7);ctx.fill()});
  rr(W/2-120,cy-70,240,70,12,'#ffd9a8');rr(W/2-120,cy-70,240,16,8,'#ff6fa8');
  [16,8,18,10,15,7,17,9,14,8,16].forEach((l,i)=>rr(W/2-114+i*21,cy-58,12,l+4,6,'#ff6fa8'));
  rr(W/2-90,cy-122,180,54,12,'#ff9ec7');rr(W/2-90,cy-122,180,12,8,'#ff6fa8');
  [14,7,15,9,13,6,15,8,12].forEach((l,i)=>rr(W/2-84+i*21,cy-114,11,l+4,5.5,'#ff6fa8'));
  for(let i=-1;i<=1;i++){rr(W/2+i*40-3,cy-146,6,24,2,'#7ec8ff');ctx.fillStyle='#ffc93c';ctx.beginPath();ctx.arc(W/2+i*40,cy-151+Math.sin(t*3+i)*1.5,5,0,7);ctx.fill()}
  ctx.fillStyle='#8a1f55';ctx.font='bold 22px system-ui';ctx.textAlign='center';
  ctx.fillText('Happy Birthday!',W/2,cy-78);ctx.textAlign='left';


  // player
  ctx.save();ctx.translate(pl.x,pl.y);
  const sq=pl.g?1:1+Math.min(.15,Math.abs(pl.vy)*.012);ctx.scale(1/sq,sq);
  const hx=-pl.face*15;ctx.strokeStyle='#ff5c9a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(hx,-14,6,0,7);ctx.stroke();
  rr(-14,-26,28,26,[3,3,12,12],'#ff7eb6');rr(-16,-28,32,7,3.5,'#ffc2de');rr(-12,-26,24,3,1.5,'#ff5c9a');
  ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=2;ctx.lineCap='round';
  for(let k=-1;k<=1;k+=2){ctx.beginPath();for(let j=0;j<=12;j++)ctx.lineTo(k*5+Math.sin(Date.now()/200+j*.6+k)*3,-30-j*1.6);ctx.stroke()}
  ctx.fillStyle='#4a2540';ctx.fillRect(-8+pl.face*2,-19,3,5);ctx.fillRect(5+pl.face*2,-19,3,5);
  ctx.fillStyle='#ffa6cf';ctx.beginPath();ctx.arc(-10+pl.face*2,-11,3,0,7);ctx.arc(10+pl.face*2,-11,3,0,7);ctx.fill();
  ctx.strokeStyle='#4a2540';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(pl.face*2,-12,3,.2,Math.PI-.2);ctx.stroke();
  ctx.restore();
  for(const c of conf){ctx.save();ctx.globalAlpha=Math.max(0,c.life);ctx.translate(c.x,c.y);ctx.rotate(c.r);ctx.fillStyle=c.c;ctx.fillRect(-c.s/2,-c.s/3,c.s,c.s*.6);ctx.restore()}
  ctx.restore();

  
  // tiny counter, bottom-left
  ctx.fillStyle='rgba(107,58,85,.8)';ctx.font='bold 16px system-ui';ctx.fillText('🎂 '+got,14,H-14-(matchMedia('(pointer:coarse)').matches?80:0));
}
let lw=0,lh=0;
(function loop(){if(innerWidth!==lw||innerHeight!==lh){lw=innerWidth;lh=innerHeight;resize()}step();draw();requestAnimationFrame(loop)})();
