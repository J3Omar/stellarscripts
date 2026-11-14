(function(){
'use strict';
const TAU=Math.PI*2,cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),lerp=(a,b,t)=>a+(b-a)*t,ss=(a,b,v)=>{v=cl((v-a)/(b-a));return v*v*(3-2*v);};
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const C={};const memo=(k,f)=>C[k]||(C[k]=f());
const off=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,w|0);c.height=Math.max(1,h|0);return c;};
const rg=(x,cx,cy,r,s)=>{const g=x.createRadialGradient(cx,cy,0,cx,cy,Math.max(.01,r));s.forEach(a=>g.addColorStop(a[0],a[1]));return g;};
const lg=(x,a,b,c,d,s)=>{const g=x.createLinearGradient(a,b,c,d);s.forEach(e=>g.addColorStop(e[0],e[1]));return g;};
const glow=(x,cx,cy,r,c,a)=>{if(a<=.003||r<=0)return;x.fillStyle=rg(x,cx,cy,r,[[0,`rgba(${c},${a})`],[.35,`rgba(${c},${a*.35})`],[1,`rgba(${c},0)`]]);x.fillRect(cx-r,cy-r,r*2,r*2);};
const line=(x,a,b)=>{x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke();};
const poly=(x,p)=>{x.beginPath();p.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.closePath();};
const path=(x,p)=>{x.beginPath();p.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));};
const font=(x,w,s,f)=>{x.font=`${w} ${s}px ${f||'Montserrat, sans-serif'}`;};
const track=(x,v)=>{try{x.letterSpacing=v;}catch(e){}};
const vig=(x,W,H,a)=>{x.fillStyle=rg(x,W/2,H/2,Math.hypot(W,H)*.6,[[0,'rgba(20,10,5,0)'],[.6,'rgba(20,10,5,0)'],[1,`rgba(20,10,5,${a})`]]);x.fillRect(0,0,W,H);};

/* ---------- space ---------- */
function starData(seed,n){return memo('s'+seed+'_'+n,()=>{const r=rng(seed);return Array.from({length:n},()=>({x:r(),y:r(),z:.2+r()*.8,s:r()<.05?1.5+r():.35+r()*.8,p:r()*TAU,f:.4+r()*2.2,w:r()<.28}));});}
function stars(x,W,H,t,o){o=o||{};const st=starData(o.seed||7,o.n||260),mx=o.mx||0,my=o.my||0,A=o.alpha==null?1:o.alpha,k=o.size||1;
 for(const s of st){let px=(s.x*W-mx*W*.03*s.z)%W;if(px<0)px+=W;let py=(s.y*H-my*H*.03*s.z)%H;if(py<0)py+=H;
  const a=A*s.z*(.3+.7*(.5+.5*Math.sin(t*s.f+s.p)));if(a<.02)continue;const r=s.s*k;
  x.fillStyle=s.w?`rgba(255,216,172,${a})`:`rgba(228,234,255,${a})`;
  if(r<.9)x.fillRect(px-r,py-r,r*2,r*2);else{x.beginPath();x.arc(px,py,r,0,TAU);x.fill();
   if(s.s>1.6){glow(x,px,py,r*6,'210,222,255',a*.25);x.fillStyle=`rgba(230,236,255,${a*.45})`;x.fillRect(px-r*5,py-.35,r*10,.7);x.fillRect(px-.35,py-r*5,.7,r*10);}}}}
function nebula(seed,w,h){return memo('n'+seed+'_'+w+'_'+h,()=>{const c=off(w,h),x=c.getContext('2d'),r=rng(seed);
 const cols=['122,74,94','58,70,128','104,66,128','206,138,86'];x.globalCompositeOperation='lighter';
 for(let i=0;i<170;i++){const u=r();const bx=w*(-.1+1.2*u),by=h*(.5+.25*Math.sin(u*4.2+seed)+(r()-.5)*.38),rad=w*(.03+r()*r()*.22),col=cols[(r()*cols.length)|0];
  x.fillStyle=rg(x,bx,by,rad,[[0,`rgba(${col},${.03+r()*.07})`],[1,`rgba(${col},0)`]]);x.fillRect(bx-rad,by-rad,rad*2,rad*2);}
 x.globalCompositeOperation='destination-out';
 for(let i=0;i<50;i++){const u=r();const bx=w*u,by=h*(.5+.25*Math.sin(u*4.2+seed)+(r()-.5)*.15),rad=w*(.01+r()*.05);x.fillStyle=rg(x,bx,by,rad,[[0,'rgba(0,0,0,.35)'],[1,'rgba(0,0,0,0)']]);x.fillRect(bx-rad,by-rad,rad*2,rad*2);}
 x.globalCompositeOperation='lighter';
 for(let i=0;i<w*h/110;i++){x.fillStyle=`rgba(255,240,228,${r()*.45})`;const z=r()<.92?.8:1.6;x.fillRect(r()*w,r()*h,z,z);}
 return c;});}
function spaceBg(x,W,H,t,seed,mx,my){x.fillStyle='#06050a';x.fillRect(0,0,W,H);const nb=nebula(seed,360,240);x.globalAlpha=.9;x.drawImage(nb,-W*.06-(mx||0)*W*.03,-H*.06-(my||0)*H*.03,W*1.12,H*1.12);x.globalAlpha=1;stars(x,W,H,t,{seed:seed+3,n:Math.min(320,(W*H/900)|0),mx,my});}
function flare(x,px,py,s,a,warm){if(a<=0)return;const c=warm?'255,214,150':'220,232,255';x.save();x.globalCompositeOperation='lighter';
 glow(x,px,py,s*3.5,c,.3*a);glow(x,px,py,s,'255,250,235',.9*a);
 x.fillStyle=lg(x,px-s*16,0,px+s*16,0,[[0,`rgba(${c},0)`],[.5,`rgba(${c},${.6*a})`],[1,`rgba(${c},0)`]]);x.fillRect(px-s*16,py-s*.05,s*32,s*.1);
 for(const [d,r] of [[-1.6,.5],[-2.6,.25],[1.2,.35]]){x.strokeStyle=`rgba(${c},${.12*a})`;x.lineWidth=1;x.beginPath();x.arc(px+d*s*1.4,py+d*s*.25,s*r,0,TAU);x.stroke();}
 x.restore();}
function tunnel(x,W,H,t,sp,A){if(A<=0)return;const st=memo('tun',()=>{const r=rng(99);return Array.from({length:650},()=>({x:(r()-.5)*2.4,y:(r()-.5)*1.6,z:r(),w:r()<.25}));});
 const f=Math.max(W,H)*.32,cx=W/2,cy=H/2;
 for(const s of st){let z=((s.z-t*sp)%1+1)%1;z=.03+z*.97;const z2=Math.min(1,z+sp*.4);
  const px=cx+s.x/z*f,py=cy+s.y/z*f;if(px<-20||px>W+20||py<-20||py>H+20)continue;
  const qx=cx+s.x/z2*f,qy=cy+s.y/z2*f,b=A*cl((1-z)*1.3)*cl(z*8);
  x.strokeStyle=s.w?`rgba(255,220,180,${b})`:`rgba(225,232,255,${b})`;x.lineWidth=.4+(1-z)*1.6;x.beginPath();x.moveTo(qx,qy);x.lineTo(px,py);x.stroke();}}

/* ---------- planets ---------- */
function jupiter(x,cx,cy,r,t){
 const B=[[-1.05,'#cfbf9f'],[-.84,'#b49473'],[-.7,'#e2d3b5'],[-.56,'#a87a58'],[-.43,'#e8dcc0'],[-.27,'#c79a6c'],[-.13,'#9b6744'],[.0,'#eadfc6'],[.13,'#b27f58'],[.27,'#dccbab'],[.39,'#a37352'],[.53,'#e0d0b0'],[.68,'#b79a7c'],[.84,'#d6c6a8']];
 x.save();x.beginPath();x.arc(cx,cy,r,0,TAU);x.clip();
 B.forEach((b,i)=>{const y0=cy+b[0]*r,a=r*.012*(1+i%3),f=6/r,sp=(.25+(i%4)*.12)*(i%2?1:-1);x.beginPath();x.moveTo(cx-r,cy+r);
  for(let k=0;k<=48;k++){const px=cx-r+k/48*2*r;x.lineTo(px,y0+a*Math.sin(px*f*2+t*sp+i)+a*.6*Math.sin(px*f*5-t*sp*1.7));}x.lineTo(cx+r,cy+r);x.closePath();x.fillStyle=b[1];x.fill();});
 // ovals & spot
 const u=((t*.035+.3)%2.4)-1.2;if(Math.abs(u)<1){const lat=.3,w=Math.sqrt(1-lat*lat);const sx=cx+u*r*w,sy=cy+lat*r,f=Math.sqrt(1-u*u);
  x.fillStyle='#b5552e';x.beginPath();x.ellipse(sx,sy,r*.11*f,r*.055,0,0,TAU);x.fill();x.strokeStyle='rgba(240,220,190,.6)';x.lineWidth=r*.008;x.stroke();}
 for(let i=0;i<7;i++){const uu=((t*.05*(1+i%3*.3)+i*.37)%2.2)-1.1;if(Math.abs(uu)>1)continue;const la=[-.48,-.2,.07,.45,-.6,.62,.2][i];x.fillStyle='rgba(250,244,230,.55)';x.beginPath();x.ellipse(cx+uu*r*Math.sqrt(1-la*la),cy+la*r,r*.035*Math.sqrt(1-uu*uu),r*.014,0,0,TAU);x.fill();}
 x.fillStyle=rg(x,cx-r*.38,cy-r*.32,r*1.55,[[0,'rgba(255,240,210,.12)'],[.5,'rgba(0,0,0,.12)'],[.8,'rgba(5,3,2,.72)'],[1,'rgba(5,3,2,.96)']]);x.fillRect(cx-r,cy-r,r*2,r*2);
 x.restore();
 x.strokeStyle='rgba(255,226,180,.25)';x.lineWidth=r*.015;x.beginPath();x.arc(cx,cy,r,Math.PI*.95,Math.PI*1.6);x.stroke();}
function saturn(x,cx,cy,r,t,o){o=o||{};const ti=o.tilt||.32,rot=o.rot==null?-.35:o.rot;
 const RG=[[1.24,1.52,'rgba(190,165,128,.45)'],[1.53,1.95,'rgba(232,212,170,.85)'],[2.03,2.27,'rgba(205,182,142,.62)'],[2.35,2.37,'rgba(240,226,200,.75)']];
 x.save();x.translate(cx,cy);x.rotate(rot);
 const half=back=>{for(const [a,b,c] of RG){x.beginPath();x.ellipse(0,0,b*r,b*r*ti,0,back?Math.PI:0,back?TAU:Math.PI);x.ellipse(0,0,a*r,a*r*ti,0,back?TAU:Math.PI,back?Math.PI:0,true);x.closePath();x.fillStyle=c;x.fill();}};
 half(true);
 x.save();x.beginPath();x.arc(0,0,r,0,TAU);x.clip();
 const cols=['#e9d6a8','#d6bd88','#efdfb8','#c9ab78','#e4cf9e','#d2b47e'];for(let i=0;i<12;i++){x.fillStyle=cols[i%6];x.fillRect(-r,-r+i*r/6+Math.sin(t*.3+i)*r*.01,r*2,r/6+1);}
 x.fillStyle=rg(x,-r*.4,-r*.4,r*1.6,[[0,'rgba(255,240,210,.1)'],[.55,'rgba(0,0,0,.1)'],[.85,'rgba(5,3,2,.75)'],[1,'rgba(5,3,2,.95)']]);x.fillRect(-r,-r,r*2,r*2);
 x.fillStyle='rgba(30,20,12,.35)';x.fillRect(-r,r*.12,r*2,r*.06);x.restore();
 half(false);
 x.restore();}

/* ---------- Pioneer (3D) ---------- */
function mkRot(spin,yaw,pitch){const cs=Math.cos(spin),sn=Math.sin(spin),cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 return (a,b,c)=>{const X=a*cs-b*sn,Y=a*sn+b*cs;const X2=X*cy+c*sy,Z2=-X*sy+c*cy;return [X2,Y*cp-Z2*sp,Y*sp+Z2*cp];};}
function rtg(x,a,b,s){x.lineCap='butt';x.strokeStyle='#3e352c';x.lineWidth=s*.13;line(x,a,b);x.strokeStyle='rgba(200,185,150,.55)';x.lineWidth=s*.03;line(x,[a[0]-s*.03,a[1]-s*.03],[b[0]-s*.03,b[1]-s*.03]);
 const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;x.strokeStyle='#2a231c';x.lineWidth=Math.max(.6,s*.012);
 for(let i=0;i<=4;i++){const px=a[0]+dx*i/4,py=a[1]+dy*i/4;line(x,[px-nx*s*.1,py-ny*s*.1],[px+nx*s*.1,py+ny*s*.1]);}x.lineCap='round';}
function pioneer(x,cx,cy,s,o){o=o||{};const mg=o.mag||4.2;const R=mkRot(o.spin||0,o.yaw==null?-.9:o.yaw,o.pitch==null?.3:o.pitch);
 const P=(a,b,c)=>{const v=R(a,b,c);return [cx+v[0]*s,cy+v[1]*s,v[2]];};
 const L=o.light||[-.55,-.55,.63],warm=o.warm!==false;const dot=n=>{const v=R(n[0],n[1],n[2]);return v[0]*L[0]+v[1]*L[1]+v[2]*L[2];};
 const foil=b=>{b=.3+.7*cl(b*.5+.5);return `rgb(${(215*b+35)|0},${(165*b+22)|0},${(70*b+10)|0})`;};
 const it=[];x.lineCap='round';x.lineJoin='round';
 for(const a of [.55,.55+2.094]){const ca=Math.cos(a),sa=Math.sin(a);const p0=P(.32*ca,.32*sa,-.22),p1=P(2.05*ca,2.05*sa,-.26),r1=P(1.2*ca,1.2*sa,-.25),r2=P(1.58*ca,1.58*sa,-.25),r3=P(1.68*ca,1.68*sa,-.26),r4=P(2.06*ca,2.06*sa,-.26),q1=P(.9*ca+.3*sa,.9*sa-.3*ca,.2),q2=P(.9*ca-.3*sa,.9*sa+.3*ca,.2);
  it.push({z:(p0[2]+p1[2])/2,d:()=>{x.strokeStyle='rgba(205,188,150,.85)';x.lineWidth=Math.max(1,s*.02);line(x,p0,p1);x.lineWidth=Math.max(.6,s*.009);line(x,q1,r1);line(x,q2,r1);rtg(x,r1,r2,s);rtg(x,r3,r4,s);}});}
 {const a=.55-2.094,ca=Math.cos(a),sa=Math.sin(a);const p0=P(.32*ca,.32*sa,-.2),p1=P(mg*ca,mg*sa,-.2);it.push({z:p0[2],d:()=>{x.strokeStyle='rgba(220,205,175,.8)';x.lineWidth=Math.max(.7,s*.01);line(x,p0,p1);x.fillStyle='#cdb88e';x.beginPath();x.arc(p1[0],p1[1],Math.max(1.3,s*.035),0,TAU);x.fill();}});}
 for(let i=0;i<6;i++){const a0=i/6*TAU+.26,a1=(i+1)/6*TAU+.26,am=(a0+a1)/2,n=[Math.cos(am),Math.sin(am),0];if(R(n[0],n[1],0)[2]<=0)continue;
  const q=[P(.38*Math.cos(a0),.38*Math.sin(a0),-.04),P(.38*Math.cos(a1),.38*Math.sin(a1),-.04),P(.38*Math.cos(a1),.38*Math.sin(a1),-.44),P(.38*Math.cos(a0),.38*Math.sin(a0),-.44)];const b=dot(n);
  it.push({z:(q[0][2]+q[2][2])/2,d:()=>{poly(x,q);x.fillStyle=foil(b);x.fill();x.strokeStyle='rgba(60,40,15,.55)';x.lineWidth=.6;x.stroke();x.strokeStyle='rgba(255,240,200,.25)';line(x,[(q[0][0]+q[3][0])/2,(q[0][1]+q[3][1])/2],[(q[1][0]+q[2][0])/2,(q[1][1]+q[2][1])/2]);}});}
 if(R(0,0,-1)[2]>0){const q=[];for(let i=0;i<6;i++){const a=i/6*TAU+.26;q.push(P(.38*Math.cos(a),.38*Math.sin(a),-.44));}const b=dot([0,0,-1]);it.push({z:q[0][2],d:()=>{poly(x,q);x.fillStyle=foil(b);x.fill();}});}
 const ax=R(0,0,1),front=ax[2]>0,rim=[];for(let i=0;i<64;i++){const a=i/64*TAU;rim.push(P(Math.cos(a),Math.sin(a),.28));}
 it.push({z:P(0,0,.1)[2],d:()=>{poly(x,rim);const lx=L[0]*s,ly=L[1]*s;
  x.fillStyle=front?lg(x,cx+lx,cy+ly,cx-lx,cy-ly,[[0,warm?'#4e4234':'#3e4048'],[.55,warm?'#d2c4a6':'#c4c8d4'],[1,warm?'#fff2d6':'#f4f6ff']]):lg(x,cx+lx,cy+ly,cx-lx,cy-ly,[[0,'#efe2c4'],[.6,'#9a8a6a'],[1,'#3a3026']]);x.fill();
  x.strokeStyle=front?'rgba(90,70,45,.35)':'rgba(60,45,25,.45)';x.lineWidth=Math.max(.5,s*.006);
  for(const rr of [.34,.62,.86]){const q=[];for(let i=0;i<40;i++){const a=i/40*TAU;q.push(P(rr*Math.cos(a),rr*Math.sin(a),.28*rr*rr));}poly(x,q);x.stroke();}
  for(let i=0;i<12;i++){const a=i/12*TAU;line(x,P(.12*Math.cos(a),.12*Math.sin(a),.004),P(Math.cos(a),Math.sin(a),.28));}
  poly(x,rim);x.strokeStyle=front?'rgba(255,245,220,.9)':'rgba(240,220,180,.6)';x.lineWidth=Math.max(.8,s*.016);x.stroke();}});
 const apex=P(0,0,.95),h0=P(0,0,.72),st=[0,1,2].map(i=>P(.92*Math.cos(i*2.094+.3),.92*Math.sin(i*2.094+.3),.26));
 it.push({z:apex[2],d:()=>{x.strokeStyle='rgba(225,212,182,.85)';x.lineWidth=Math.max(.6,s*.009);st.forEach(p=>line(x,p,apex));x.strokeStyle='#d8ccb0';x.lineWidth=Math.max(1.4,s*.06);line(x,h0,apex);x.fillStyle='#f4ead2';x.beginPath();x.arc(apex[0],apex[1],Math.max(1,s*.035),0,TAU);x.fill();}});
 it.sort((a,b)=>a.z-b.z).forEach(i=>i.d());
 if(o.rim){x.save();x.globalCompositeOperation='lighter';poly(x,rim);x.strokeStyle=`rgba(${o.rim},.35)`;x.lineWidth=Math.max(1,s*.02);x.stroke();x.restore();}
 const da=ax[0]*L[0]+ax[1]*L[1]+ax[2]*L[2];return {glint:Math.pow(cl(da),10),cx:(rim[0][0]+rim[32][0])/2,cy:(rim[0][1]+rim[32][1])/2};}

/* ---------- Rover ---------- */
const HUB=[[-102,-18],[-12,-18],[88,-18]];
function roverRig(h){const [A,M,F]=h,bA=Math.atan2(M[1]-A[1],M[0]-A[0]),mx=(A[0]+M[0])/2,my=(A[1]+M[1])/2,Pv=[mx+32*Math.sin(bA),my-32*Math.cos(bA)];
 const base=Math.atan2(32,145),rA=Math.atan2(F[1]-Pv[1],F[0]-Pv[0])-base,c=Math.cos(rA),s=Math.sin(rA);return {P:Pv,K:[Pv[0]+80*c+22*s,Pv[1]+80*s-22*c],bA,rA,body:rA*.5};}
function rover(x,px,py,s,o){o=o||{};const st=o.style||'model',h=o.hubs||HUB,rig=roverRig(h),ph=o.wheel||0,t=o.t||0;
 x.save();x.translate(px,py);x.scale(s,s);x.lineCap='round';x.lineJoin='round';
 if(st!=='model'){const ink=o.ink||'#3d2a1a',sil=st==='sil',f=sil?ink:(o.fill||'rgba(239,224,189,.92)'),hl=o.hl||'#9a5a2a';x.strokeStyle=ink;x.lineWidth=sil?3:1.4/(o.lw||1);x.fillStyle=f;
  x.save();x.translate(rig.K[0],rig.K[1]);x.rotate(rig.body);x.translate(-23,72);
  x.fillRect(75,-171,6,67);x.strokeRect(75,-171,6,67);x.fillRect(54,-190,48,18);x.strokeRect(54,-190,48,18);
  if(!sil){x.beginPath();x.arc(66,-181,4,0,TAU);x.arc(90,-181,4,0,TAU);x.stroke();}
  line(x,[-22,-106],[-22,-118]);x.beginPath();x.ellipse(-22,-122,17,4.5,-.24,0,TAU);x.fill();x.stroke();line(x,[-52,-106],[-52,-142]);
  x.fillRect(-77,-96,150,30);x.strokeRect(-77,-96,150,30);if(!sil){x.lineWidth=.6;line(x,[-67,-88],[63,-88]);line(x,[-67,-74],[-12,-74]);x.lineWidth=1.4/(o.lw||1);}
  x.fillRect(-134,-106,268,7);x.strokeRect(-134,-106,268,7);if(!sil){x.lineWidth=.6;for(let i=1;i<10;i++)line(x,[-134+i*26.8,-106],[-134+i*26.8,-99]);x.lineWidth=1.4/(o.lw||1);}
  path(x,[[73,-76],[112,-62],[106,-40]]);x.stroke();x.fillRect(98,-40,16,10);x.strokeRect(98,-40,16,10);
  x.restore();
  path(x,[h[0],rig.P,h[1]]);x.stroke();path(x,[rig.P,rig.K,h[2]]);x.stroke();
  h.forEach((c,i)=>{const lk=o.locked===i;x.beginPath();x.arc(c[0],c[1],18,0,TAU);x.fillStyle=f;x.fill();x.strokeStyle=lk?hl:ink;x.lineWidth=lk?2.2:1.4/(o.lw||1);x.stroke();
   if(!sil){const a0=lk?0:ph;x.lineWidth=.8;for(let k=0;k<3;k++){const a=a0+k*2.094;line(x,[c[0],c[1]],[c[0]+Math.cos(a)*15,c[1]+Math.sin(a)*15]);}x.setLineDash([1.5,3]);x.lineDashOffset=lk?0:-ph*15;x.beginPath();x.arc(c[0],c[1],15,0,TAU);x.stroke();x.setLineDash([]);}
   x.strokeStyle=ink;});
  if(!sil){x.fillStyle=hl;for(const q of [rig.P,rig.K]){x.beginPath();x.arc(q[0],q[1],3.6,0,TAU);x.fill();}}
  x.restore();return rig;}
 const D=[16,-11],far=p=>[p[0]+D[0],p[1]+D[1]];
 const leg=(pts,w,c)=>{x.strokeStyle=c;x.lineWidth=w;path(x,pts);x.stroke();};
 const wheel=(c,dk)=>{x.save();x.translate(c[0],c[1]);x.fillStyle=dk?'#241c15':'#3b3027';x.beginPath();x.arc(0,0,18,0,TAU);x.fill();
  x.strokeStyle=dk?'#5d523f':'#b8a684';x.lineWidth=3.2;x.beginPath();x.arc(0,0,16.4,0,TAU);x.stroke();
  x.strokeStyle=dk?'#433a2c':'#8c7b5e';x.lineWidth=1.1;for(let i=0;i<16;i++){const a=i/16*TAU+ph;line(x,[Math.cos(a)*15,Math.sin(a)*15],[Math.cos(a)*18,Math.sin(a)*18]);}
  x.strokeStyle=dk?'#564b3a':'#d2c29e';x.lineWidth=1.6;for(let i=0;i<6;i++){const a=i/6*TAU+ph;x.beginPath();x.moveTo(Math.cos(a)*4,Math.sin(a)*4);x.quadraticCurveTo(Math.cos(a+.6)*10,Math.sin(a+.6)*10,Math.cos(a+.25)*14,Math.sin(a+.25)*14);x.stroke();}
  x.fillStyle=dk?'#6d604c':'#eadcbc';x.beginPath();x.arc(0,0,4,0,TAU);x.fill();
  if(!dk){x.strokeStyle='rgba(175,195,255,.4)';x.lineWidth=1.3;x.beginPath();x.arc(0,0,17.4,-1.3,.3);x.stroke();x.strokeStyle='rgba(255,220,160,.35)';x.beginPath();x.arc(0,0,17.4,2.4,4);x.stroke();}x.restore();};
 leg([far(h[0]),far(rig.P),far(h[1])],4.5,'#4f4536');leg([far(rig.P),far(rig.K),far(h[2])],4.5,'#4f4536');h.forEach(c=>wheel(far(c),true));
 x.save();x.translate(rig.K[0],rig.K[1]);x.rotate(rig.body);x.translate(-23,72);
 x.fillStyle=lg(x,0,-96,0,-66,[[0,'#f2d68c'],[.45,'#c99f48'],[1,'#6f4c1c']]);x.fillRect(-77,-96,150,30);
 x.strokeStyle='rgba(90,60,20,.4)';x.lineWidth=.6;const rr=rng(4);for(let i=0;i<14;i++){const a=-77+rr()*150,b=-95+rr()*28;line(x,[a,b],[a+6+rr()*10,b+(rr()-.5)*6]);}
 x.fillStyle='rgba(255,240,200,.5)';x.fillRect(-77,-96,150,1.2);
 x.strokeStyle='#d8ccb4';x.lineWidth=3.2;path(x,[[73,-76],[112,-62],[106,-40]]);x.stroke();x.fillStyle='#9a8a6c';x.beginPath();x.arc(106,-36,7,0,TAU);x.fill();x.fillStyle='#e8dcc2';x.beginPath();x.arc(104,-38,3,0,TAU);x.fill();
 const dk=[[-134,-104],[134,-104],[160,-126],[-108,-126]];poly(x,dk);x.fillStyle=lg(x,-134,-104,160,-126,[[0,'#1b2234'],[.5,'#2a3450'],[1,'#141a28']]);x.fill();
 x.save();poly(x,dk);x.clip();x.strokeStyle='rgba(120,140,190,.35)';x.lineWidth=.6;for(let i=1;i<12;i++){const u=i/12;line(x,[lerp(-134,134,u),-104],[lerp(-108,160,u),-126]);}for(let j=1;j<4;j++){const v=j/4;line(x,[lerp(-134,-108,v),lerp(-104,-126,v)],[lerp(134,160,v),lerp(-104,-126,v)]);}
 const sw=((t*28)%520)-200;x.fillStyle=lg(x,sw-30,0,sw+30,0,[[0,'rgba(255,255,255,0)'],[.5,'rgba(220,230,255,.28)'],[1,'rgba(255,255,255,0)']]);x.fillRect(sw-40,-130,80,30);x.restore();
 poly(x,dk);x.strokeStyle='#c9a24e';x.lineWidth=1.2;x.stroke();
 x.fillStyle=lg(x,0,-104,0,-98,[[0,'#ecd49a'],[1,'#8a6a2c']]);x.fillRect(-134,-104,268,6);
 x.strokeStyle='#e8e0cc';x.lineWidth=1.5;line(x,[-52,-112],[-52,-146]);x.fillStyle='#e8e0cc';x.fillRect(-54,-150,4,6);
 x.strokeStyle='#cfc4ac';x.lineWidth=3;line(x,[-22,-110],[-22,-122]);x.save();x.translate(-22,-126);x.rotate(-.24);x.fillStyle=lg(x,0,-5,0,5,[[0,'#fff6dc'],[1,'#a89a7c']]);x.beginPath();x.ellipse(0,0,17,5,0,0,TAU);x.fill();x.restore();
 x.fillStyle=lg(x,75,0,81,0,[[0,'#f2ead6'],[1,'#9a8c72']]);x.fillRect(75,-171,6,67);
 const pan=Math.sin(t*.45)*.35;x.save();x.translate(78,-180);x.scale(1-Math.abs(pan)*.25,1);x.fillStyle=lg(x,0,-9,0,9,[[0,'#f4ecd8'],[1,'#9a8e76']]);x.fillRect(-24,-9,48,17);
 x.fillStyle='#1b1712';x.beginPath();x.arc(-12+pan*10,-1,4.2,0,TAU);x.arc(12+pan*10,-1,4.2,0,TAU);x.fill();x.fillStyle='rgba(170,200,255,.8)';x.beginPath();x.arc(-13+pan*10,-2.5,1.2,0,TAU);x.arc(11+pan*10,-2.5,1.2,0,TAU);x.fill();x.restore();
 x.restore();
 leg([h[0],rig.P,h[1]],5.2,'#cdbfa2');leg([rig.P,rig.K,h[2]],5.2,'#cdbfa2');leg([[h[0][0],h[0][1]-1.5],[rig.P[0],rig.P[1]-1.5],[h[1][0],h[1][1]-1.5]],1.3,'rgba(255,250,235,.55)');leg([[rig.P[0],rig.P[1]-1.5],[rig.K[0],rig.K[1]-1.5],[h[2][0],h[2][1]-1.5]],1.3,'rgba(255,250,235,.55)');
 x.fillStyle='#e9dcbc';for(const q of [rig.P,rig.K]){x.beginPath();x.arc(q[0],q[1],4,0,TAU);x.fill();}
 h.forEach(c=>wheel(c,false));x.restore();return rig;}

/* ---------- Mars & surface scenes ---------- */
function ridge(seed){const r=rng(seed),k=[];for(let i=0;i<6;i++)k.push([(.6+r()*.8)/(i+1.2),(i+1)*(1.3+r()*2.2),r()*TAU]);return u=>{let v=0;for(const q of k)v+=q[0]*Math.sin(u*q[1]+q[2]);return v;};}
function mars(x,W,H,t,o){o=o||{};const dk=o.mode==='dusk',seed=o.seed||3,hz=o.horizon||(dk?.6:.55),hl=o.hills||1;
 x.fillStyle=lg(x,0,0,0,H*hz,dk?[[0,'#140f18'],[.5,'#3c3040'],[.85,'#7d6a6a'],[1,'#b09684']]:[[0,'#a8784e'],[.55,'#cf9f72'],[1,'#e9c49a']]);x.fillRect(0,0,W,H*hz+2);
 const sx=W*(o.sunX||(dk?.64:.8)),sy=dk?H*hz*.93:H*hz*.26;
 if(dk){stars(x,W,H*hz*.6,t,{seed:31,n:60,alpha:.7,size:.7});glow(x,sx,sy,H*.45,'150,182,212',.5);glow(x,sx,sy,H*.12,'205,224,244',.65);x.fillStyle='#f2f6ff';x.beginPath();x.arc(sx,sy,Math.max(1.2,H*.011),0,TAU);x.fill();}
 else{glow(x,sx,sy,H*.35,'255,236,200',.35);x.fillStyle='rgba(255,248,232,.9)';x.beginPath();x.arc(sx,sy,H*.018,0,TAU);x.fill();
  if(o.moons){const ma=t*.02;x.fillStyle='rgba(110,82,64,.75)';x.beginPath();x.arc(W*(.22+ma%0.6),H*.16,H*.012,0,TAU);x.fill();x.beginPath();x.arc(W*.36,H*.1,H*.006,0,TAU);x.fill();}}
 const L=dk?[['#5d4a4e',.03],['#473231',.055],['#2f1d17',.09]]:[['#c89468',.035],['#ad7048',.06],['#87502f',.09]],pan=o.pan||0;
 L.forEach((l,i)=>{const f=ridge(seed+i*17),base=H*(hz+i*.05);x.beginPath();x.moveTo(0,H);for(let k=0;k<=60;k++){const u=k/60;x.lineTo(u*W,base-(f(u*2.2+pan*(i+1))+1)*H*l[1]*hl);}x.lineTo(W,H);x.closePath();x.fillStyle=l[0];x.fill();
  x.fillStyle=lg(x,0,base-H*l[1]*2*hl,0,base+H*.06,[[0,dk?'rgba(120,130,150,0)':'rgba(235,200,160,0)'],[1,dk?'rgba(120,130,150,.12)':'rgba(240,205,165,.2)']]);x.fill();});
 for(let i=0;i<3;i++){const yy=H*(hz-.02+i*.06),xx=((t*W*.012*(i+1)+i*W*.4)%(W*1.6))-W*.3;x.save();x.translate(xx,yy);x.scale(1,.18);x.fillStyle=rg(x,0,0,W*.35,[[0,dk?'rgba(160,150,170,.1)':'rgba(240,205,165,.16)'],[1,'rgba(0,0,0,0)']]);x.fillRect(-W*.35,-W*.35,W*.7,W*.7);x.restore();}
 const rk=memo('rk'+seed,()=>{const r=rng(seed*7);return Array.from({length:22},()=>({u:r(),v:r(),s:r()}));});
 for(const k of rk){const v=.15+k.v*.85,y=H*(hz+.12)+v*H*(1-hz-.12),r=(2+k.s*7)*v*W/300,px=k.u*W;
  x.fillStyle='rgba(10,5,3,.35)';x.beginPath();x.ellipse(px+r*.5,y+r*.35,r*1.3,r*.4,0,0,TAU);x.fill();
  x.fillStyle=rg(x,px-r*.4,y-r*.5,r*1.6,dk?[[0,'#6e5550'],[1,'#1c120e']]:[[0,'#c08a62'],[1,'#4a2818']]);x.beginPath();x.ellipse(px,y,r,r*.62,0,Math.PI,TAU);x.ellipse(px,y,r,r*.22,0,0,Math.PI);x.fill();}
 if(o.rover){const rx=W*(o.roverX||.34)+Math.sin(t*.15)*W*.01,ry=H*(hz+.135),rs=W/1300;x.strokeStyle=dk?'rgba(15,8,5,.5)':'rgba(70,35,20,.45)';x.lineWidth=Math.max(.6,W/500);
  for(const d of [-1,1]){x.beginPath();x.moveTo(rx-60*rs+d*8*rs,ry);x.quadraticCurveTo(rx-W*.05,ry+H*.1,rx-W*.25+d*W*.02,H);x.stroke();}
  rover(x,rx,ry,rs,{style:'sil',ink:dk?'#120a08':'#3a1f12'});}
 x.fillStyle=lg(x,0,H*(hz+.1),0,H,[[0,'rgba(20,10,5,0)'],[1,'rgba(20,10,5,.45)']]);x.fillRect(0,H*hz,W,H);}
function rockTex(W,H,seed,base){return memo('rt'+seed+'_'+(W|0)+'_'+(H|0),()=>{const c=off(W*2,H*2),x=c.getContext('2d'),r=rng(seed);x.scale(2,2);x.fillStyle=base;x.fillRect(0,0,W,H);
 for(let i=0;i<700;i++){const px=r()*W,py=r()*H,rad=1+r()*W*.06,l=r()<.5;x.fillStyle=rg(x,px,py,rad,[[0,l?'rgba(210,140,95,.14)':'rgba(50,25,15,.16)'],[1,'rgba(0,0,0,0)']]);x.fillRect(px-rad,py-rad,rad*2,rad*2);}
 x.strokeStyle='rgba(60,30,18,.28)';x.lineWidth=.7;for(let i=0;i<12;i++){const y0=r()*H;x.beginPath();x.moveTo(0,y0);for(let k=0;k<=20;k++)x.lineTo(k/20*W,y0+Math.sin(k*.7+i)*H*.012+k*H*.004);x.stroke();}
 for(let i=0;i<W*H/12;i++){x.fillStyle=r()<.5?'rgba(255,220,190,.08)':'rgba(30,15,8,.12)';x.fillRect(r()*W,r()*H,.7,.7);}return c;});}
function berries(x,W,H,t){x.drawImage(rockTex(W,H,5,'#8a5236'),0,0,W,H);const la=-2.3+Math.sin(t*.25)*.4;
 const b=memo('bb',()=>{const r=rng(8);return Array.from({length:44},()=>({x:r(),y:r(),s:.025+r()*.035}));});
 for(const p of b){const px=p.x*W,py=p.y*H,r=p.s*Math.min(W,H)*1.3,cx=Math.cos(la),cy=Math.sin(la);
  x.fillStyle='rgba(30,14,8,.45)';x.beginPath();x.ellipse(px-cx*r*.6,py-cy*r*.6,r*1.05,r*.85,0,0,TAU);x.fill();
  x.fillStyle=rg(x,px+cx*r*.4,py+cy*r*.4,r*1.2,[[0,'#c4b8ae'],[.45,'#6d6670'],[1,'#25222a']]);x.beginPath();x.arc(px,py,r,0,TAU);x.fill();}
 glow(x,W*.3,H*.25,W*.5,'255,210,160',.12);vig(x,W,H,.55);}
function silica(x,W,H,t){x.drawImage(rockTex(W,H,6,'#94583a'),0,0,W,H);
 const L=[[W*.47,-2],[W*.42,H*.4],[W*.24,H+2]],R=[[W*.55,-2],[W*.58,H*.4],[W*.66,H+2]];
 x.beginPath();x.moveTo(L[0][0],L[0][1]);x.quadraticCurveTo(L[1][0],L[1][1],L[2][0],L[2][1]);x.lineTo(R[2][0],R[2][1]);x.quadraticCurveTo(R[1][0],R[1][1],R[0][0],R[0][1]);x.closePath();
 x.fillStyle=lg(x,0,0,0,H,[[0,'#d8cfc0'],[1,'#fbf6ea']]);x.fill();x.save();x.clip();const r=rng(3);for(let i=0;i<260;i++){x.fillStyle=r()<.5?'rgba(160,130,110,.25)':'rgba(255,255,255,.5)';x.fillRect(r()*W,r()*H,1,1);}
 const g=(t*.12)%1.4-.2;glow(x,W*.45,H*g,W*.25,'255,255,240',.3);x.restore();
 x.strokeStyle='rgba(40,20,10,.55)';x.lineWidth=Math.max(1,W/120);x.stroke();
 x.strokeStyle='rgba(60,30,15,.45)';x.lineWidth=Math.max(.8,W/260);for(let k=0;k<14;k++){const u=k/14,v=u*u;const lx=lerp(W*.47,W*.2,v)-W*.04*(.4+v),rx=lerp(W*.55,W*.7,v)+W*.04*(.4+v),y=lerp(0,H,u);line(x,[lx,y],[lx-W*.05*(.3+v),y+H*.02]);line(x,[rx,y],[rx+W*.05*(.3+v),y+H*.02]);}
 vig(x,W,H,.5);}
function launch(x,W,H,t){const T=(t%10)/10;x.fillStyle=lg(x,0,0,0,H,[[0,'#0b0f1e'],[.55,'#2e2a40'],[.82,'#8a5a4a'],[1,'#d79a62']]);x.fillRect(0,0,W,H);stars(x,W,H*.5,t,{seed:41,n:50,alpha:.6,size:.7});
 const gy=H*.88,rise=Math.pow(ss(.12,1,T),2.1)*H*.95,rw=W*.055,rh=H*.5,rx=W*.54,top=gy-rh-rise-H*.02,ig=ss(.02,.15,T);
 glow(x,rx,gy,W*.6,'255,170,90',.5*ig);
 x.strokeStyle='#120c0a';x.lineWidth=Math.max(1,W/220);const tx=W*.36,tw=W*.07,tt=H*.22;x.strokeRect(tx,tt,tw,gy-tt);for(let y=tt;y<gy;y+=tw){line(x,[tx,y],[tx+tw,y+tw]);line(x,[tx+tw,y],[tx,y+tw]);}line(x,[tx+tw,H*.38],[rx-rw*.6,H*.38]);
 const sm=memo('smk',()=>{const r=rng(12);return Array.from({length:60},()=>({a:r()*Math.PI,s:r(),p:r()}));});
 if(T>.06)for(const s of sm){const q=(T*1.6+s.p)%1,d=q*W*(.25+.35*s.s),px=rx+Math.cos(s.a)*d*1.3,py=gy-H*.02-Math.sin(s.a)*d*.3-q*H*.05,r=W*(.04+q*.12);
  x.fillStyle=rg(x,px,py,r,[[0,`rgba(${(200+40*(1-q))|0},${(150+50*(1-q))|0},${(120+40*(1-q))|0},${.35*(1-q)*ig})`],[1,'rgba(120,90,80,0)']]);x.fillRect(px-r,py-r,r*2,r*2);}
 const fl=H*(.12+.05*Math.sin(t*37)+.03*Math.sin(t*53))*ig,by=top+rh;
 if(ig>0){x.fillStyle=lg(x,0,by,0,by+fl*1.8,[[0,'rgba(255,255,240,.95)'],[.25,'rgba(255,220,140,.9)'],[.6,'rgba(255,140,60,.5)'],[1,'rgba(255,100,40,0)']]);x.beginPath();x.moveTo(rx-rw*.35,by);x.quadraticCurveTo(rx-rw*.9,by+fl*.8,rx,by+fl*1.8);x.quadraticCurveTo(rx+rw*.9,by+fl*.8,rx+rw*.35,by);x.fill();glow(x,rx,by+fl*.4,W*.18,'255,200,120',.6*ig);}
 x.fillStyle=lg(x,rx-rw/2,0,rx+rw/2,0,[[0,'#f2e2c8'],[.45,'#d8d0c4'],[1,'#5a5560']]);x.fillRect(rx-rw/2,top+rh*.12,rw,rh*.88);x.beginPath();x.moveTo(rx-rw/2,top+rh*.12);x.quadraticCurveTo(rx-rw/2,top+rh*.02,rx,top);x.quadraticCurveTo(rx+rw/2,top+rh*.02,rx+rw/2,top+rh*.12);x.fill();
 x.fillStyle='rgba(30,28,34,.85)';x.fillRect(rx-rw/2,top+rh*.32,rw,rh*.05);x.fillRect(rx-rw/2,top+rh*.62,rw,rh*.02);
 x.fillStyle='#0d0907';x.fillRect(0,gy,W,H-gy);vig(x,W,H,.5);}
function dsn(x,W,H,t){x.fillStyle=lg(x,0,0,0,H,[[0,'#0c1020'],[.6,'#2a2438'],[.9,'#7a5040'],[1,'#a86a48']]);x.fillRect(0,0,W,H);stars(x,W,H*.7,t,{seed:51,n:90,alpha:.8,size:.8});
 const gy=H*.86;x.fillStyle='#0f0a08';x.beginPath();x.moveTo(0,gy);for(let k=0;k<=20;k++)x.lineTo(k/20*W,gy-Math.sin(k*.9)*H*.015-H*.01);x.lineTo(W,H);x.lineTo(0,H);x.fill();
 const px=W*.4,py=H*.6,a=W*.16;x.beginPath();x.moveTo(px-W*.1,gy);x.lineTo(px-W*.03,py);x.lineTo(px+W*.03,py);x.lineTo(px+W*.1,gy);x.fill();
 x.save();x.translate(px,py-H*.04);x.rotate(.55);x.fillStyle=lg(x,0,-W*.05,0,W*.08,[[0,'#3a3038'],[1,'#120c0c']]);x.beginPath();x.ellipse(0,0,W*.24,W*.075,0,0,TAU);x.fill();
 x.strokeStyle='rgba(255,190,140,.6)';x.lineWidth=Math.max(1,W/250);x.beginPath();x.ellipse(0,0,W*.24,W*.075,0,Math.PI*.05,Math.PI*.95);x.stroke();
 x.strokeStyle='#1a1214';x.lineWidth=Math.max(1,W/300);line(x,[-W*.2,-W*.02],[0,-a]);line(x,[W*.2,-W*.02],[0,-a]);x.restore();
 const fx=px+.523*a,fy=py-H*.04-.852*a,dir=-1.02;
 for(let i=0;i<4;i++){const q=(t*.35+i/4)%1,r=W*(.05+q*.6);x.strokeStyle=`rgba(255,226,170,${.55*(1-q)})`;x.lineWidth=Math.max(.8,W/300);x.beginPath();x.arc(fx,fy,r,dir-.3,dir+.3);x.stroke();}
 const sx=fx+Math.cos(dir)*W*.62,sy=fy+Math.sin(dir)*W*.62;glow(x,sx,sy,W*.05,'255,230,190',.6+.3*Math.sin(t*3));vig(x,W,H,.5);}
function jupScene(x,W,H,t){spaceBg(x,W,H,t,13);jupiter(x,W*.6,H*.6,H*.5,t*.6);pioneer(x,W*.2,H*.26,H*.05,{spin:t*.8,yaw:-.7,pitch:.3,warm:false,light:[-.7,-.4,.6]});vig(x,W,H,.5);}
function satScene(x,W,H,t){spaceBg(x,W,H,t,17);saturn(x,W*.5,H*.52,H*.19,t,{tilt:.34,rot:-.3});vig(x,W,H,.5);}
function scene(n,x,W,H,t){switch(n){
 case 'mars-dusk':mars(x,W,H,t,{mode:'dusk',seed:3,rover:true});vig(x,W,H,.5);break;
 case 'gusev':mars(x,W,H,t,{mode:'day',seed:9,hills:1.8,rover:true,roverX:.62});vig(x,W,H,.45);break;
 case 'berries':berries(x,W,H,t);break;case 'silica':silica(x,W,H,t);break;case 'launch':launch(x,W,H,t);break;
 case 'jupiter':jupScene(x,W,H,t);break;case 'saturn':satScene(x,W,H,t);break;case 'dsn':dsn(x,W,H,t);break;}}

/* ---------- diagrams (motion graphics) ---------- */
const PAPER={ink:'#3d2a1a',faint:'rgba(110,80,45,.28)',acc:'#9a5a2a',fill:'rgba(239,224,189,.94)'};
function grid(x,W,H,c){x.strokeStyle=c;x.lineWidth=.35;x.globalAlpha=.5;for(let i=0;i<=W;i+=10)line(x,[i,0],[i,H]);for(let j=0;j<=H;j+=10)line(x,[0,j],[W,j]);x.globalAlpha=1;}
function label(x,s,px,py,o){o=o||{};font(x,o.w||600,o.size||7.5);track(x,o.ls||'1.2px');x.fillStyle=o.c||PAPER.ink;x.textAlign=o.al||'left';x.fillText(s,px,py);track(x,'0px');x.textAlign='left';}
function terr(u){const P=320,k=((u%P)+P)%P,d=(k-170)/17;return 6*Math.sin(u*.02)+4*Math.sin(u*.051+1.3)+26*Math.exp(-d*d)+(k>40&&k<75?9*Math.sin((k-40)/35*Math.PI):0);}
function dRocker(x,W,H,p){const S=Math.min(W/430,H/250);x.save();x.translate((W-430*S)/2,(H-250*S)/2);x.scale(S,S);const c=PAPER;grid(x,430,250,c.faint);
 const of=p*960,gy=212,X0=230,s=.78,R=18*s,T=(u,o)=>gy-terr(u+o);
 const hy=(u,o)=>{let m=1e9;for(let d=-R;d<=R;d+=R/5){const v=T(u+d,o)-Math.sqrt(Math.max(0,R*R-d*d));if(v<m)m=v;}return m;};
 const hubs=o=>[-102,-12,88].map(h=>[h,hy(X0+h*s,o)/s]);
 x.beginPath();x.moveTo(0,250);for(let u=0;u<=430;u+=3)x.lineTo(u,T(u,of));x.lineTo(430,250);x.closePath();x.save();x.clip();x.strokeStyle=c.faint;x.lineWidth=.6;for(let k=-260-(of%7);k<440;k+=7)line(x,[k,250],[k+60,190]);x.restore();
 x.strokeStyle=c.ink;x.lineWidth=1.3;path(x,Array.from({length:145},(_,i)=>[i*3,T(i*3,of)]));x.stroke();
 for(let k=Math.floor(of/37);k<Math.floor((of+430)/37)+1;k++){const r=rng(k*13+7)(),u=k*37+r*30-of;x.fillStyle=c.faint;x.beginPath();x.ellipse(u,T(u,of)-1.2,1.5+r*2.5,1+r*1.2,0,0,TAU);x.fill();}
 const hb=hubs(of),rig=rover(x,X0,0,s,{style:'line',hubs:hb,ink:c.ink,fill:c.fill,hl:c.acc,wheel:of/R});
 const Pp=[X0+rig.P[0]*s,rig.P[1]*s],Kp=[X0+rig.K[0]*s,rig.K[1]*s],dg=a=>(a*180/Math.PI).toFixed(1);
 x.strokeStyle=c.acc;x.lineWidth=.6;line(x,Pp,[Pp[0]-34,Pp[1]-34]);line(x,Kp,[Kp[0]+6,Kp[1]-70]);
 label(x,'BOGIE  '+dg(rig.bA)+'°',Pp[0]-36,Pp[1]-37,{al:'right',c:c.acc});label(x,'ROCKER  '+dg(rig.rA)+'°',Kp[0]+9,Kp[1]-72,{c:c.acc});
 const N=44,hist=[];for(let j=0;j<=N;j++){const o=of-(N-j)*9,h=hubs(o),r=roverRig(h);hist.push([h[2][1]*s,r.K[1]*s+ (r.body)*0]);}
 const m0=hist.reduce((a,v)=>a+v[0],0)/hist.length,m1=hist.reduce((a,v)=>a+v[1],0)/hist.length,bx=14,by=14,bw=150,bh=46,cy=by+bh/2+4;
 x.fillStyle='rgba(246,237,218,.7)';x.fillRect(bx,by,bw,bh);x.strokeStyle=c.faint;x.lineWidth=.6;x.strokeRect(bx,by,bw,bh);line(x,[bx,cy],[bx+bw,cy]);
 label(x,'HEIGHT CHANGE',bx+5,by+9,{size:6.2});
 x.strokeStyle=c.ink;x.lineWidth=.9;path(x,hist.map((v,j)=>[bx+j/N*bw,cl(cy+(v[0]-m0)*.9,by+12,by+bh-2)]));x.stroke();
 x.strokeStyle=c.acc;x.lineWidth=1.8;path(x,hist.map((v,j)=>[bx+j/N*bw,cl(cy+(v[1]-m1)*.9,by+12,by+bh-2)]));x.stroke();
 label(x,'— WHEEL',bx+bw+6,cy-3,{size:6.2});label(x,'— BODY',bx+bw+6,cy+7,{size:6.2,c:c.acc});
 x.restore();return p<.34?0:p<.67?1:2;}
function dSilica(x,W,H,p){const S=Math.min(W/430,H/250);x.save();x.translate((W-430*S)/2,(H-250*S)/2);x.scale(S,S);const c=PAPER;grid(x,430,250,c.faint);
 const gy=150,s=.62,q=ss(.1,.68,p),X=lerp(300,118,q),fx=X+88*s,x0=300+88*s;
 x.fillStyle='rgba(154,90,42,.12)';x.fillRect(0,gy,430,28);x.save();x.beginPath();x.rect(0,gy,430,28);x.clip();x.strokeStyle='rgba(154,90,42,.45)';x.lineWidth=.6;for(let k=-40;k<440;k+=6)line(x,[k,gy+28],[k+28,gy]);x.restore();
 x.fillStyle='rgba(255,252,244,.55)';x.fillRect(0,gy+28,430,22);x.fillStyle=c.faint;const r=rng(2);for(let i=0;i<160;i++)x.fillRect(r()*430,gy+29+r()*20,1,1);
 x.strokeStyle=c.faint;x.lineWidth=.5;for(let k=0;k<430;k+=12){line(x,[k,gy+52],[k+6,gy+62]);line(x,[k+6,gy+62],[k+12,gy+52]);}
 x.strokeStyle=c.ink;x.lineWidth=.8;line(x,[0,gy+28],[430,gy+28]);line(x,[0,gy+50],[430,gy+50]);
 if(fx<x0-2){const gl=p>.72?.5+.5*Math.sin(p*90):0;x.beginPath();x.moveTo(fx-10,gy);x.quadraticCurveTo(fx-4,gy+30,fx+10,gy+30);x.lineTo(x0-6,gy+30);x.quadraticCurveTo(x0+2,gy+30,x0+6,gy);x.closePath();
  x.fillStyle='#fbf8ef';x.fill();x.strokeStyle=c.ink;x.lineWidth=1;x.stroke();if(gl>0){x.save();x.globalAlpha=gl*.5;x.strokeStyle='#d9b46a';x.lineWidth=4;x.stroke();x.restore();}}
 x.strokeStyle=c.ink;x.lineWidth=1.3;line(x,[0,gy],[Math.max(0,fx-10),gy]);line(x,[x0+6,gy],[430,gy]);
 const hb=[-102,-12,88].map(h=>[h,(gy-18*s)/s]);hb[2][1]=(gy+10-18*s)/s;
 rover(x,X,0,s,{style:'line',hubs:hb,ink:c.ink,fill:c.fill,hl:c.acc,wheel:-(300-X)/(18*s),locked:2});
 if(p>.1&&p<.72){const ax=X-120*s;x.strokeStyle=c.acc;x.lineWidth=1;line(x,[ax,40],[ax-36,40]);path(x,[[ax-30,35],[ax-36,40],[ax-30,45]]);x.stroke();label(x,'DRIVING IN REVERSE',ax-38,32,{al:'left',c:c.acc,size:6.5});
  label(x,'LOCKED WHEEL',fx+8,gy-34,{c:c.acc,size:6.5});x.strokeStyle=c.acc;x.lineWidth=.6;line(x,[fx+6,gy-32],[fx+2,gy-20]);}
 if(p>.72){const a=ss(.72,.8,p),mx=96,my=70,tr=[lerp(fx,x0,.4),gy+22];x.globalAlpha=a;x.strokeStyle=c.ink;x.lineWidth=.7;line(x,[mx+30,my+26],tr);
  x.fillStyle='#fbf8ef';x.beginPath();x.arc(mx,my,40,0,TAU);x.fill();x.save();x.clip();const r2=rng(5);for(let i=0;i<40;i++){const px=mx-40+r2()*80,py=my-40+r2()*80,z=3+r2()*6;x.fillStyle=`rgba(${r2()<.8?'230,226,215':'200,150,110'},.9)`;poly(x,[[px,py-z],[px+z*.8,py],[px,py+z],[px-z*.8,py]]);x.fill();x.strokeStyle='rgba(120,100,80,.35)';x.lineWidth=.4;x.stroke();}x.restore();
  x.strokeStyle=c.ink;x.lineWidth=1.3;x.beginPath();x.arc(mx,my,40,0,TAU);x.stroke();label(x,'SiO₂ · SILICA',mx,my+21,{al:'center',size:6.5});x.globalAlpha=1;}
 if(p>.86){const a=ss(.86,.92,p);x.globalAlpha=a;const vx=40,vy=gy+50;for(let i=0;i<3;i++){const ph=p*60+i*2;x.strokeStyle=c.acc;x.lineWidth=1;x.beginPath();for(let k=0;k<=12;k++){const yy=vy-k*4;x[k?'lineTo':'moveTo'](vx+i*9+Math.sin(ph+k*.7)*3,yy);}x.stroke();}
  label(x,'WATER + VOLCANIC HEAT',vx+34,vy-26,{c:c.acc,size:6.5});x.globalAlpha=1;}
 label(x,'SOIL',426,gy+17,{al:'right',size:6.2});label(x,'SILICA-RICH LAYER',426,gy+42,{al:'right',size:6.2});
 x.restore();return p<.1?0:p<.72?1:p<.86?2:3;}
function diag(n,x,W,H,p){if(n==='d-rocker')return dRocker(x,W,H,p);if(n==='d-silica')return dSilica(x,W,H,p);return 0;}

/* ---------- shelf props ---------- */
function portal(x,W,H,t,mx,my){spaceBg(x,W,H,t,5,mx,my);saturn(x,W*.73-mx*W*.04,H*.28-my*H*.03,W*.055,t,{tilt:.3,rot:-.4});
 const q=(t%8)/8;if(q<.1){const k=q/.1,x0=W*.12,y0=H*.18,x1=W*.5,y1=H*.42,hx=lerp(x0,x1,k),hy=lerp(y0,y1,k);x.strokeStyle=lg(x,hx-(x1-x0)*.3,hy-(y1-y0)*.3,hx,hy,[[0,'rgba(255,240,220,0)'],[1,`rgba(255,240,220,${.85*(1-k)})`]]);x.lineWidth=1.3;line(x,[hx-(x1-x0)*.3,hy-(y1-y0)*.3],[hx,hy]);}
 const sa=t*.06,sx=W*(.5+.38*Math.cos(sa)),sy=H*(.6+.08*Math.sin(sa));if(Math.sin(t*3)>.5)glow(x,sx,sy,4,'255,230,200',.9);
 x.fillStyle=rg(x,W/2,H/2,W*.55,[[0,'rgba(0,0,0,0)'],[.8,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.6)']]);x.fillRect(0,0,W,H);}
function painting(x,W,H,t){mars(x,W,H,t,{mode:'day',seed:4,horizon:.52,moons:true,pan:t*.004,hills:1.4});const r=rng(77);x.globalAlpha=.08;for(let i=0;i<220;i++){x.strokeStyle=r()<.5?'#fff2d8':'#3a1d10';x.lineWidth=1+r()*2;const px=r()*W,py=r()*H;line(x,[px,py],[px+6+r()*10,py+(r()-.5)*3]);}x.globalAlpha=1;vig(x,W,H,.5);}
function blueprint(x,W,H,t){
 x.fillStyle='#131a2a';x.fillRect(0,0,W,H);grid(x,W,H,'rgba(217,180,106,.12)');
 const cx=W*.5,cy=H*.5,R=Math.min(W,H)*.43;
 x.strokeStyle='rgba(217,180,106,.38)';x.lineWidth=.8;
 for(const scale of [.34,.60,.92]){x.beginPath();x.ellipse(cx,cy,R*scale,R*scale*.68,-.32,0,TAU);x.stroke();}
 const a=t*.35,dx=R*.6*Math.cos(a),dy=R*.6*.68*Math.sin(a);
 const px=cx+dx*Math.cos(-.32)-dy*Math.sin(-.32),py=cy+dx*Math.sin(-.32)+dy*Math.cos(-.32);
 x.fillStyle='#d9b46a';x.beginPath();x.arc(cx,cy,2.8,0,TAU);x.moveTo(px+1.6,py);x.arc(px,py,1.6,0,TAU);x.fill();
}
function plinth(x,cx,y,w,h,txt){const d=10;x.fillStyle='rgba(0,0,0,.5)';x.beginPath();x.ellipse(cx,y+h+4,w*.62,8,0,0,TAU);x.fill();
 poly(x,[[cx-w/2,y],[cx+w/2,y],[cx+w/2+d,y-d*.7],[cx-w/2+d,y-d*.7]]);x.fillStyle='#5a3620';x.fill();
 x.fillStyle=lg(x,0,y,0,y+h,[[0,'#4a2a16'],[1,'#22130a']]);x.fillRect(cx-w/2,y,w,h);x.fillStyle='rgba(255,210,150,.25)';x.fillRect(cx-w/2,y,w,1.2);
 const pw2=Math.min(w*.5,150);x.fillStyle=lg(x,cx-pw2/2,0,cx+pw2/2,0,[[0,'#8a6a2c'],[.5,'#e9cd85'],[1,'#8a6a2c']]);x.fillRect(cx-pw2/2,y+h*.3,pw2,h*.42);label(x,txt,cx,y+h*.3+h*.28,{al:'center',size:Math.max(6,h*.17),c:'#3a2410',ls:'1.6px'});}
function shelfRovers(x,W,H,t){
 x.save();try{x.filter='brightness(.6) saturate(.85)';}catch(e){}plinth(x,170,282,210,26,'MARS ROVER');rover(x,170,282,.74,{t:t+3});x.restore();try{x.filter='none';}catch(e){}
 plinth(x,430,302,330,40,'MARS ROVER');rover(x,430,302,1.22,{t});
 glow(x,300,140,260,'255,190,120',.08);}
function shelfPioneer(x,W,H,t){const cx=480,cy=350,s=118;
 x.fillStyle='rgba(0,0,0,.45)';x.beginPath();x.ellipse(cx,716,170,10,0,0,TAU);x.fill();
 const bk=[[330,672,300,26,'#3c2214'],[345,646,270,26,'#2b3a3a']];for(const [bx,by,bw,bh,c] of bk){x.fillStyle=c;x.fillRect(bx,by,bw,bh);x.fillStyle='#e6d3aa';x.fillRect(bx+bw-6,by+3,6,bh-6);x.fillStyle='rgba(217,180,106,.7)';x.fillRect(bx+20,by+bh/2-1,bw*.5,1.5);x.fillStyle='rgba(255,220,170,.2)';x.fillRect(bx,by,bw,1.2);}
 x.fillStyle=lg(x,cx-60,0,cx+60,0,[[0,'#6b4e22'],[.5,'#e3c47a'],[1,'#6b4e22']]);x.beginPath();x.ellipse(cx,644,58,10,0,0,TAU);x.fill();
 x.fillStyle=lg(x,cx-5,0,cx+5,0,[[0,'#7a5a28'],[.5,'#f0d690'],[1,'#7a5a28']]);x.fillRect(cx-4,cy+30,8,614-cy);
 const g=pioneer(x,cx,cy,s,{spin:t*.32,yaw:-.85+Math.sin(t*.18)*.08,pitch:.3,light:[-.6,-.5,.62],rim:'160,180,255'});
 flare(x,g.cx,g.cy,22,g.glint*.8,true);
 x.fillStyle=lg(x,cx-60,0,cx+60,0,[[0,'#8a6a2c'],[.5,'#e9cd85'],[1,'#8a6a2c']]);x.fillRect(cx-70,610,140,22);label(x,'SPACE PROBE',cx,625,{al:'center',size:8,c:'#3a2410',ls:'2px'});}
function armillary(x,W,H,t){const cx=W/2,cy=H*.44,R=Math.min(W,H)*.36,rot=mkRot(0,t*.25,.42);
 const rings=[[[1,0,0],[0,0,1],1],[[1,0,0],[0,1,0],1],[[0,1,0],[0,0,1],1],[[Math.cos(.41),Math.sin(.41),0],[0,0,1],.98],[[1,0,0],[0,0,1],.7,.7]];
 const segs=[];rings.forEach((rg2,ri)=>{const [u,v,r,yo]=rg2;for(let i=0;i<48;i++){const a0=i/48*TAU,a1=(i+1)/48*TAU;const p=a=>{const q=[(u[0]*Math.cos(a)+v[0]*Math.sin(a))*r,(u[1]*Math.cos(a)+v[1]*Math.sin(a))*r+(yo?-.0:0),(u[2]*Math.cos(a)+v[2]*Math.sin(a))*r];return rot(q[0],q[1],q[2]);};const A=p(a0),B=p(a1);segs.push([A,B,(A[2]+B[2])/2,ri]);}});
 segs.sort((a,b)=>a[2]-b[2]);x.lineCap='round';
 const drawSeg=sg=>{const z=sg[2],b=.35+.65*cl(z*.5+.5);x.strokeStyle=`rgb(${(230*b)|0},${(185*b)|0},${(100*b)|0})`;x.lineWidth=(sg[3]===1?3.4:2.4)*R/80;line(x,[cx+sg[0][0]*R,cy+sg[0][1]*R],[cx+sg[1][0]*R,cy+sg[1][1]*R]);};
 segs.filter(s=>s[2]<0).forEach(drawSeg);
 x.fillStyle=rg(x,cx-R*.08,cy-R*.08,R*.24,[[0,'#9fc0d8'],[.6,'#3a5a7a'],[1,'#13202e']]);x.beginPath();x.arc(cx,cy,R*.2,0,TAU);x.fill();
 segs.filter(s=>s[2]>=0).forEach(drawSeg);
 x.strokeStyle='#b8954a';x.lineWidth=R*.05;line(x,[cx,cy+R*1.02],[cx,H*.9]);x.fillStyle=lg(x,cx-R*.6,0,cx+R*.6,0,[[0,'#6b4e22'],[.5,'#e3c47a'],[1,'#6b4e22']]);x.beginPath();x.ellipse(cx,H*.92,R*.6,R*.12,0,0,TAU);x.fill();}

/* ---------- collectible models (two-shelf study) ---------- */
function shadowE(x,cx,y,rx,ry,a){x.save();x.translate(cx,y);x.scale(1,ry/rx);x.fillStyle=rg(x,0,0,rx,[[0,`rgba(0,0,0,${a})`],[1,'rgba(0,0,0,0)']]);x.fillRect(-rx,-rx,rx*2,rx*2);x.restore();}
const brassH=(x,a,b)=>lg(x,a,0,b,0,[[0,'#6b4e22'],[.5,'#f0d690'],[1,'#6b4e22']]);
function woodBase(x,cx,by,w,h,d){d=d||7;shadowE(x,cx,by+2,w*.66,10,.55);
 poly(x,[[cx-w/2,by-h],[cx+w/2,by-h],[cx+w/2+d,by-h-d*.6],[cx-w/2+d,by-h-d*.6]]);x.fillStyle='#6a4226';x.fill();
 x.fillStyle=lg(x,0,by-h,0,by,[[0,'#4e2e18'],[1,'#24140a']]);x.fillRect(cx-w/2,by-h,w,h);x.fillStyle='rgba(255,215,160,.28)';x.fillRect(cx-w/2,by-h,w,1.2);
 poly(x,[[cx+w/2,by-h],[cx+w/2+d,by-h-d*.6],[cx+w/2+d,by-d*.6],[cx+w/2,by]]);x.fillStyle='#1a0e07';x.fill();}
function brassPlate(x,cx,y,w,h,txt){x.fillStyle=lg(x,cx-w/2,0,cx+w/2,0,[[0,'#8a6a2c'],[.5,'#ecd290'],[1,'#8a6a2c']]);x.fillRect(cx-w/2,y,w,h);x.strokeStyle='rgba(60,40,15,.5)';x.lineWidth=.6;x.strokeRect(cx-w/2+1.5,y+1.5,w-3,h-3);label(x,txt,cx,y+h/2+2.4,{al:'center',size:Math.max(5.5,h*.4),c:'#3a2410',ls:'1.2px'});}
function bellJar(x,cx,by,w,h,t,inner){woodBase(x,cx,by,w*1.12,20,6);x.fillStyle='#5a3620';x.beginPath();x.ellipse(cx,by-20,w*.53,5,0,0,TAU);x.fill();inner();
 const b=by-22,top=b-h,dome=()=>{x.beginPath();x.moveTo(cx-w/2,b);x.lineTo(cx-w/2,top+w/2);x.arc(cx,top+w/2,w/2,Math.PI,0);x.lineTo(cx+w/2,b);};
 dome();x.fillStyle='rgba(190,215,230,.07)';x.fill();x.strokeStyle='rgba(235,242,255,.3)';x.lineWidth=1.2;x.stroke();
 x.save();dome();x.closePath();x.clip();x.globalCompositeOperation='lighter';
 x.fillStyle=lg(x,cx-w/2,0,cx-w/2+w*.2,0,[[0,'rgba(255,255,255,0)'],[.45,'rgba(255,250,235,.26)'],[1,'rgba(255,255,255,0)']]);x.fillRect(cx-w/2,top,w*.2,h);
 x.strokeStyle='rgba(255,245,225,.5)';x.lineWidth=2.6;x.beginPath();x.arc(cx,top+w/2,w/2-6,Math.PI*1.12,Math.PI*1.4);x.stroke();
 x.strokeStyle='rgba(180,200,255,.2)';x.lineWidth=1.6;line(x,[cx+w/2-7,b-8],[cx+w/2-7,top+w/2]);
 const sw=(t*.07)%1.6-.3,sa=Math.max(0,Math.sin(cl(sw)*Math.PI));x.fillStyle=lg(x,cx-w/2+sw*w-12,0,cx-w/2+sw*w+12,0,[[0,'rgba(255,240,210,0)'],[.5,`rgba(255,240,210,${.16*sa})`],[1,'rgba(255,240,210,0)']]);x.fillRect(cx-w/2+sw*w-12,top,24,h);x.restore();
 x.strokeStyle='rgba(230,240,255,.3)';x.lineWidth=1;x.beginPath();x.ellipse(cx,b,w/2,4,0,0,Math.PI);x.stroke();
 x.fillStyle=rg(x,cx-2,top-6,8,[[0,'#f4e8c8'],[1,'#7a5a28']]);x.beginPath();x.arc(cx,top-4,6,0,TAU);x.fill();}
function orrery(x,cx,by,s,t){woodBase(x,cx,by,s*1.5,18,6);x.fillStyle=brassH(x,cx-s*.5,cx+s*.5);x.beginPath();x.ellipse(cx,by-20,s*.5,s*.1,0,0,TAU);x.fill();
 const hy=by-s*1.05;x.strokeStyle=brassH(x,cx-3,cx+3);x.lineWidth=4;line(x,[cx,by-22],[cx,hy]);
 const ca=t*.8;x.strokeStyle='#c9a24e';x.lineWidth=2;line(x,[cx+s*.75,by-9],[cx+s*.75+Math.cos(ca)*9,by-9+Math.sin(ca)*4]);x.fillStyle='#e9cd85';x.beginPath();x.arc(cx+s*.75+Math.cos(ca)*9,by-9+Math.sin(ca)*4,2.4,0,TAU);x.fill();
 const P=[[.34,1.6,'#b8b0a4',3],[.54,1,'#4a7ab0',4.4],[.74,.53,'#c2603a',3.8],[1,.17,'#d8b888',7],[1.24,.1,'#e6d2a0',5.8]];
 x.strokeStyle='rgba(217,180,106,.16)';x.lineWidth=.8;P.forEach(p=>{x.beginPath();x.ellipse(cx,hy,p[0]*s,p[0]*s*.3,0,0,TAU);x.stroke();});
 const it=P.map((p,i)=>{const a=t*p[1]*.5+i*1.7;return {a,r:p[0]*s,c:p[2],pr:p[3],i,z:Math.sin(a)};});
 const dp=p=>{const px=cx+Math.cos(p.a)*p.r,py=hy+Math.sin(p.a)*p.r*.3;x.strokeStyle='#b8954a';x.lineWidth=1.3;line(x,[cx,hy],[px,py]);line(x,[px,py],[px,py-12]);
  x.fillStyle=rg(x,px-p.pr*.35,py-12-p.pr*.35,p.pr*1.5,[[0,'#fff6e0'],[.3,p.c],[1,'#1a120a']]);x.beginPath();x.arc(px,py-12,p.pr,0,TAU);x.fill();
  if(p.i===4){x.strokeStyle='rgba(230,210,160,.85)';x.lineWidth=1;x.beginPath();x.ellipse(px,py-12,p.pr*2,p.pr*.6,-.3,0,TAU);x.stroke();}
  if(p.i===1){const ma=t*2;x.fillStyle='#ddd';x.beginPath();x.arc(px+Math.cos(ma)*7,py-12+Math.sin(ma)*2.4,1.3,0,TAU);x.fill();}};
 it.filter(p=>p.z<0).sort((a,b)=>a.z-b.z).forEach(dp);
 glow(x,cx,hy-14,s*.55,'255,200,120',.32+.05*Math.sin(t*3));x.fillStyle=rg(x,cx-4,hy-18,s*.14,[[0,'#fff8e0'],[.5,'#f0c060'],[1,'#a86a1c']]);x.beginPath();x.arc(cx,hy-14,s*.11,0,TAU);x.fill();
 it.filter(p=>p.z>=0).sort((a,b)=>a.z-b.z).forEach(dp);}
function tinRocket(x,cx,by,h,t){shadowE(x,cx,by,h*.36,8,.55);const w=h*.3;x.save();x.translate(cx,by);x.rotate(Math.sin(t*1.1)*.022);
 const fin=d=>{x.beginPath();x.moveTo(d*w*.42,-h*.42);x.quadraticCurveTo(d*w*1.05,-h*.28,d*w*.95,0);x.lineTo(d*w*.55,0);x.quadraticCurveTo(d*w*.5,-h*.12,d*w*.3,-h*.16);x.closePath();x.fillStyle=lg(x,d*w*.3,0,d*w,0,[[0,'#e9dcc0'],[1,'#a89878']]);x.fill();x.strokeStyle='#8a2418';x.lineWidth=1.6;x.stroke();};fin(-1);fin(1);
 const body=()=>{x.beginPath();x.moveTo(-w/2,-h*.2);x.bezierCurveTo(-w/2,-h*.62,-w*.22,-h*.93,0,-h);x.bezierCurveTo(w*.22,-h*.93,w/2,-h*.62,w/2,-h*.2);x.quadraticCurveTo(w*.46,-h*.1,w*.26,-h*.08);x.lineTo(-w*.26,-h*.08);x.quadraticCurveTo(-w*.46,-h*.1,-w/2,-h*.2);x.closePath();};
 body();x.fillStyle=lg(x,-w/2,0,w/2,0,[[0,'#5a140c'],[.25,'#b8382a'],[.42,'#f2927a'],[.6,'#c43e2c'],[1,'#4a100a']]);x.fill();
 x.save();body();x.clip();x.fillStyle=lg(x,-w/2,0,w/2,0,[[0,'#8a7a5a'],[.4,'#fbf2dc'],[1,'#6a5a40']]);x.fillRect(-w,-h*.5,w*2,h*.08);x.fillRect(-w,-h*.86,w*2,h*.035);x.fillStyle='rgba(60,20,10,.55)';for(let i=-3;i<=3;i++){x.beginPath();x.arc(i*w*.13,-h*.46,1.1,0,TAU);x.fill();}x.restore();
 const py=-h*.66,pr=w*.2;x.fillStyle=lg(x,0,py-pr,0,py+pr,[[0,'#f0d690'],[1,'#7a5a28']]);x.beginPath();x.arc(0,py,pr*1.28,0,TAU);x.fill();x.fillStyle=rg(x,-pr*.3,py-pr*.3,pr*1.2,[[0,'#bfe0f0'],[.6,'#3a6a8a'],[1,'#12283a']]);x.beginPath();x.arc(0,py,pr,0,TAU);x.fill();x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.arc(-pr*.35,py-pr*.35,pr*.25,0,TAU);x.fill();
 x.beginPath();x.moveTo(-w*.06,-h*.3);x.lineTo(w*.06,-h*.3);x.lineTo(w*.05,0);x.lineTo(-w*.05,0);x.closePath();x.fillStyle='#d8c8a8';x.fill();x.strokeStyle='#8a2418';x.lineWidth=1.2;x.stroke();
 x.strokeStyle='rgba(255,240,225,.55)';x.lineWidth=2;x.beginPath();x.moveTo(-w*.3,-h*.25);x.bezierCurveTo(-w*.32,-h*.6,-w*.15,-h*.88,-w*.04,-h*.95);x.stroke();
 const kc=Math.abs(Math.cos(t*1.6));x.strokeStyle='#c9a24e';x.lineWidth=2;line(x,[w*.48,-h*.36],[w*.66,-h*.36]);x.lineWidth=1.8;x.beginPath();x.ellipse(w*.7,-h*.36-6,kc*5+1,6,0,0,TAU);x.stroke();x.beginPath();x.ellipse(w*.7,-h*.36+6,kc*5+1,6,0,0,TAU);x.stroke();
 const sp=(t%7)/7;if(sp<.12){const r=rng((t*30)|0);for(let i=0;i<12;i++){const a=Math.PI/2+(r()-.5)*1.6,d=r()*h*.2;x.fillStyle=`rgba(255,${(170+r()*60)|0},90,${1-sp/.12})`;x.fillRect(Math.cos(a)*d,-h*.07+Math.sin(a)*d*.3,1.5,1.5);}}
 x.restore();}
function marsMap(){return memo('mmap',()=>{const W=512,H=256,a=off(W,H),x=a.getContext('2d'),r=rng(33);x.fillStyle='#b8643a';x.fillRect(0,0,W,H);
 for(let i=0;i<60;i++){const px=r()*W,py=H*.2+r()*H*.6,rad=8+r()*40,dk=r()<.6;x.save();x.translate(px,py);x.scale(1.6,1);x.fillStyle=rg(x,0,0,rad,[[0,`rgba(${dk?'70,32,20':'215,140,90'},${.25+r()*.25})`],[1,'rgba(0,0,0,0)']]);x.fillRect(-rad,-rad,rad*2,rad*2);x.restore();}
 x.strokeStyle='rgba(60,25,15,.5)';x.lineWidth=3;x.beginPath();x.moveTo(W*.55,H*.54);x.quadraticCurveTo(W*.65,H*.5,W*.75,H*.53);x.stroke();x.fillStyle='rgba(225,160,110,.6)';x.beginPath();x.arc(W*.4,H*.42,9,0,TAU);x.fill();
 for(let i=0;i<120;i++){x.fillStyle='rgba(50,20,10,.25)';x.beginPath();x.arc(r()*W,r()*H,1+r()*2.5,0,TAU);x.fill();}
 x.fillStyle=lg(x,0,0,0,H*.14,[[0,'rgba(250,245,240,.95)'],[1,'rgba(250,245,240,0)']]);x.fillRect(0,0,W,H*.14);x.fillStyle=lg(x,0,H,0,H*.88,[[0,'rgba(250,245,240,.9)'],[1,'rgba(250,245,240,0)']]);x.fillRect(0,H*.88,W,H*.12);
 const c=off(W*2,H),y=c.getContext('2d');y.drawImage(a,0,0);y.drawImage(a,W,0);return c;});}
function marsGlobe(x,cx,by,r,t){woodBase(x,cx,by,r*1.7,16,6);const gy=by-16-r*1.5,tl=.44,pv=[cx-Math.sin(tl)*r*1.12,gy+Math.cos(tl)*r*1.12];
 x.strokeStyle=brassH(x,cx-4,cx+4);x.lineWidth=5;path(x,[[cx,by-18],[cx,pv[1]+8],pv]);x.stroke();x.fillStyle=brassH(x,cx-r*.42,cx+r*.42);x.beginPath();x.ellipse(cx,by-18,r*.42,r*.08,0,0,TAU);x.fill();
 const M=marsMap(),lon=(t*.025)%1;x.save();x.translate(cx,gy);x.rotate(tl);x.beginPath();x.arc(0,0,r,0,TAU);x.clip();
 for(let i=0;i<32;i++){const a0=-1+2*i/32,a1=-1+2*(i+1)/32,u0=Math.asin(a0)/Math.PI+.5,u1=Math.asin(a1)/Math.PI+.5;x.drawImage(M,(u0*.5+lon)*512,0,Math.max(.5,(u1-u0)*256),256,a0*r,-r,(a1-a0)*r+.7,2*r);}
 x.restore();x.save();x.translate(cx,gy);x.beginPath();x.arc(0,0,r,0,TAU);x.fillStyle=rg(x,-r*.4,-r*.4,r*1.6,[[0,'rgba(255,240,210,.2)'],[.5,'rgba(0,0,0,.05)'],[.8,'rgba(5,3,2,.6)'],[1,'rgba(5,3,2,.9)']]);x.fill();
 x.rotate(tl);x.strokeStyle=brassH(x,-r*.2,r*.2);x.lineWidth=3;x.beginPath();x.ellipse(0,0,r*.18,r*1.12,0,0,TAU);x.stroke();x.fillStyle='#e9cd85';x.beginPath();x.arc(0,-r*1.12,3,0,TAU);x.arc(0,r*1.12,3,0,TAU);x.fill();x.restore();}
function dsnModel(x,cx,by,s,t){woodBase(x,cx,by,s*1.3,16,6);const az=Math.sin(t*.22)*.7,el=.55,pt=by-16-s*.55;
 x.fillStyle=lg(x,cx-s*.24,0,cx+s*.24,0,[[0,'#8a8478'],[.5,'#efe8da'],[1,'#7a7468']]);x.beginPath();x.moveTo(cx-s*.24,by-16);x.lineTo(cx-s*.1,pt);x.lineTo(cx+s*.1,pt);x.lineTo(cx+s*.24,by-16);x.fill();
 const n=[Math.sin(az)*Math.cos(el),-Math.sin(el),Math.cos(az)*Math.cos(el)],ul=Math.hypot(n[2],n[0]),u=[-n[2]/ul,0,n[0]/ul],v=[n[1]*u[2]-n[2]*u[1],n[2]*u[0]-n[0]*u[2],n[0]*u[1]-n[1]*u[0]],C=[cx,pt-s*.2],R=s*.62;
 const P=(a,k)=>[C[0]+(u[0]*Math.cos(a)+v[0]*Math.sin(a))*R*k,C[1]+(u[1]*Math.cos(a)+v[1]*Math.sin(a))*R*k];
 x.strokeStyle='#cfc8b8';x.lineWidth=3;line(x,[cx-s*.08,pt],P(Math.PI,.35));line(x,[cx+s*.08,pt],P(0,.35));
 const rim=[];for(let i=0;i<48;i++)rim.push(P(i/48*TAU,1));poly(x,rim);x.fillStyle=lg(x,C[0],C[1]-R,C[0],C[1]+R,[[0,'#8e887c'],[.6,'#e4ddce'],[1,'#fbf7ee']]);x.fill();
 x.strokeStyle='rgba(90,80,65,.35)';x.lineWidth=.7;[.4,.72].forEach(k=>{const q=[];for(let i=0;i<40;i++)q.push(P(i/40*TAU,k));poly(x,q);x.stroke();});for(let i=0;i<10;i++)line(x,P(i/10*TAU,.12),P(i/10*TAU,1));
 poly(x,rim);x.strokeStyle='#fffaf0';x.lineWidth=1.6;x.stroke();
 const F=[C[0]+n[0]*R*.62,C[1]+n[1]*R*.62];x.strokeStyle='#d8d0c0';x.lineWidth=1.2;[0,2.09,4.19].forEach(a=>line(x,P(a+.4,.95),F));x.fillStyle='#bdb5a4';x.fillRect(F[0]-3,F[1]-5,6,8);
 for(let i=0;i<3;i++){const q=(t*.3+i/3)%1;x.strokeStyle=`rgba(240,214,144,${.35*(1-q)})`;x.lineWidth=1;x.beginPath();x.arc(F[0],F[1],8+q*60,-1.9,-1.1);x.stroke();}}
function atlasModel(x,cx,by,h,t){woodBase(x,cx,by,h*.34,16,6);const b=by-16,w=h*.085;
 const met=c=>lg(x,cx-w/2,0,cx+w/2,0,c?[[0,'#e8e2d6'],[.35,'#ffffff'],[.6,'#d0cabe'],[1,'#7a756c']]:[[0,'#55514a'],[.3,'#c9c4ba'],[.45,'#fbf7ee'],[.7,'#a39e94'],[1,'#3f3b35']]);
 x.fillStyle=brassH(x,cx+w*.8,cx+w*.8+4);x.fillRect(cx+w*.8,b-h*.55,4,h*.55);x.fillRect(cx+w*.45,b-h*.55,w*.4,3);
 const eb=b-2;for(const dx of [-w*.32,0,w*.32]){x.fillStyle='#2e2a26';x.beginPath();x.moveTo(cx+dx-w*.12,eb-h*.06);x.lineTo(cx+dx+w*.12,eb-h*.06);x.lineTo(cx+dx+w*.17,eb);x.lineTo(cx+dx-w*.17,eb);x.fill();}
 const sk=eb-h*.06;x.fillStyle=met(0);x.beginPath();x.moveTo(cx-w*.62,sk);x.lineTo(cx+w*.62,sk);x.lineTo(cx+w/2,sk-h*.1);x.lineTo(cx-w/2,sk-h*.1);x.fill();
 const at=sk-h*.1,aH=h*.46;x.fillRect(cx-w/2,at-aH,w,aH);x.strokeStyle='rgba(40,36,30,.35)';x.lineWidth=.6;for(let i=1;i<6;i++)line(x,[cx-w/2,at-aH*i/6],[cx+w/2,at-aH*i/6]);
 x.save();x.translate(cx-w*.05,at-aH*.15);x.rotate(-Math.PI/2);label(x,'UNITED STATES',0,0,{size:Math.max(5,w*.24),c:'rgba(130,32,25,.85)',ls:'1px'});x.restore();
 const it=at-aH;x.fillStyle='#3a3834';x.fillRect(cx-w/2,it-h*.03,w,h*.03);const cH=h*.16,ct=it-h*.03;x.fillStyle=met(1);x.fillRect(cx-w/2,ct-cH,w,cH);x.fillStyle='rgba(60,55,50,.3)';x.fillRect(cx-w/2,ct-cH*.62,w,cH*.18);
 const ft=ct-cH,fw=w*1.06,fH=h*.15;x.fillStyle=met(1);x.beginPath();x.moveTo(cx-fw/2,ft);x.lineTo(cx-fw/2,ft-fH*.4);x.quadraticCurveTo(cx-fw/2,ft-fH,cx,ft-fH*1.05);x.quadraticCurveTo(cx+fw/2,ft-fH,cx+fw/2,ft-fH*.4);x.lineTo(cx+fw/2,ft);x.fill();
 const q=(t*.12)%1.5;if(q<1){const yy=lerp(b,ft-fH,q);x.fillStyle=lg(x,0,yy-h*.05,0,yy+h*.05,[[0,'rgba(255,250,235,0)'],[.5,`rgba(255,250,235,${.3*Math.sin(q*Math.PI)})`],[1,'rgba(255,250,235,0)']]);x.fillRect(cx-w/2,yy-h*.05,w,h*.1);}}
function shelfUpper(x,W,H,t){const b=270;
 bellJar(x,230,b,200,188,t,()=>rover(x,230,b-24,.5,{t:t+3}));brassPlate(x,230,b-17,104,12,'MARS ROVER');
 orrery(x,480,b,100,t);
 tinRocket(x,670,b,168,t);
 marsGlobe(x,1255,b,58,t);
 dsnModel(x,1465,b,120,t);
 atlasModel(x,1700,b,236,t);brassPlate(x,1700,b-13,66,10,'LAUNCH VEHICLE');}
function shelfOpp(x,W,H,t){plinth(x,350,305,330,40,'MARS ROVER');rover(x,350,305,1.12,{t});glow(x,300,150,260,'255,190,120',.07);}
function shelfPioneer2(x,W,H,t){const cx=400,cy=250,s=90;shadowE(x,cx,438,180,12,.5);
 for(const [bx,by,bw,bh,c] of [[250,409,300,26,'#3c2214'],[265,383,270,26,'#2b3a3a']]){x.fillStyle=c;x.fillRect(bx,by,bw,bh);x.fillStyle='#e6d3aa';x.fillRect(bx+bw-6,by+3,6,bh-6);x.fillStyle='rgba(217,180,106,.7)';x.fillRect(bx+20,by+bh/2-1,bw*.5,1.5);x.fillStyle='rgba(255,220,170,.2)';x.fillRect(bx,by,bw,1.2);}
 x.fillStyle=brassH(x,cx-56,cx+56);x.beginPath();x.ellipse(cx,381,54,9,0,0,TAU);x.fill();x.fillStyle=brassH(x,cx-5,cx+5);x.fillRect(cx-4,cy+26,8,381-cy-26);
 const g=pioneer(x,cx,cy,s,{spin:t*.32,yaw:-.85+Math.sin(t*.18)*.08,pitch:.3,light:[-.6,-.5,.62],rim:'160,180,255',mag:2.6});flare(x,g.cx,g.cy,18,g.glint*.8,true);
 brassPlate(x,cx,392,132,14,'SPACE PROBE');}

/* ---------- cinematic intro ---------- */
function marsLimb(x,W,H,lt,A){const R=W*1.15,cx=W*.5,cy=H*.66+R-ss(0,4.6,lt)*H*.1;x.save();x.globalAlpha=A;
 for(let i=5;i>=0;i--){x.strokeStyle=`rgba(255,160,100,${.06*(1-i/6)})`;x.lineWidth=H*.012*(i+1);x.beginPath();x.arc(cx,cy,R,Math.PI*1.1,Math.PI*1.9);x.stroke();}
 x.beginPath();x.arc(cx,cy,R,0,TAU);x.fillStyle=rg(x,cx+R*.3,cy-R*.95,R*1.15,[[0,'#d98d54'],[.3,'#a4552c'],[.6,'#4a2214'],[1,'#120806']]);x.fill();
 x.save();x.clip();const cr=memo('cr',()=>{const r=rng(61);return Array.from({length:70},()=>({a:-Math.PI/2+(r()-.5)*1.3,d:r()*.12,s:r()}));});
 for(const k of cr){const rr=R*(1-k.d),px=cx+Math.cos(k.a)*rr,py=cy+Math.sin(k.a)*rr,f=k.d/.12,w=W*.006*(1+k.s*3)*(.4+f);x.fillStyle='rgba(60,25,12,.35)';x.beginPath();x.ellipse(px,py,w,w*(.18+f*.4),k.a+Math.PI/2,0,TAU);x.fill();x.strokeStyle='rgba(255,190,140,.12)';x.lineWidth=1;x.stroke();}
 x.fillStyle=lg(x,0,0,W,0,[[0,'rgba(5,2,1,.75)'],[.5,'rgba(5,2,1,.1)'],[1,'rgba(5,2,1,0)']]);x.fillRect(0,0,W,H);x.restore();
 const sa=-Math.PI/2+.42,sp=[cx+Math.cos(sa)*R,cy+Math.sin(sa)*R];flare(x,sp[0],sp[1]-2,H*.035,ss(.3,2.2,lt),true);
 x.restore();}
function star4(x,cx,cy,r){x.beginPath();x.moveTo(cx,cy-r);x.lineTo(cx+r*.12,cy-r*.12);x.lineTo(cx+r,cy);x.lineTo(cx+r*.12,cy+r*.12);x.lineTo(cx,cy+r);x.lineTo(cx-r*.12,cy+r*.12);x.lineTo(cx-r,cy);x.lineTo(cx-r*.12,cy-r*.12);x.closePath();}
function emblem(x,W,H,lt,A){const cx=W/2,cy=H*.4,S=Math.min(W,H)*.26;x.save();x.globalAlpha=A;stars(x,W,H,lt+20,{seed:71,n:220,alpha:.8});
 glow(x,cx,cy,S*2.4,'122,74,94',.18);glow(x,cx,cy,S*1.6,'58,70,128',.18);
 [[1.25,.3,-.32],[.95,.46,.55],[1.5,.2,.12]].forEach(([r,ry,ro],i)=>{const pr=ss(.15+i*.3,1.7+i*.3,lt);if(pr<=0)return;x.strokeStyle='rgba(217,180,106,.6)';x.lineWidth=1.1;x.beginPath();x.ellipse(cx,cy,S*r,S*r*ry,ro,0,TAU*pr);x.stroke();
  const an=TAU*pr+lt*.35*(i+1),px=cx+Math.cos(an)*S*r*Math.cos(ro)-Math.sin(an)*S*r*ry*Math.sin(ro),py=cy+Math.cos(an)*S*r*Math.sin(ro)+Math.sin(an)*S*r*ry*Math.cos(ro);glow(x,px,py,10,'240,214,144',.8);x.fillStyle='#f6e3b0';x.beginPath();x.arc(px,py,2,0,TAU);x.fill();});
 const k=ss(.9,2.1,lt);if(k>0){x.save();x.translate(cx,cy);x.rotate(lt*.04);for(let i=0;i<24;i++){x.rotate(TAU/24);x.strokeStyle=`rgba(240,214,144,${.06*k})`;x.lineWidth=1;line(x,[0,S*.35],[0,S*(1.1+.2*Math.sin(lt+i))]);}x.restore();
  star4(x,cx,cy,S*.42*k);x.fillStyle=lg(x,cx-S*.4,cy-S*.4,cx+S*.4,cy+S*.4,[[0,'#8a6a2c'],[.45,'#f6e3b0'],[1,'#8a6a2c']]);x.fill();flare(x,cx,cy,S*.12,k*(1-ss(2.2,3.4,lt)*.6),true);}
 x.restore();}
function intro(x,W,H,t){x.fillStyle='#050407';x.fillRect(0,0,W,H);
 const aS=1-ss(12.2,13,t);if(aS>0){const nb=nebula(21,480,270);x.globalAlpha=ss(.3,3,t)*.85*aS;x.drawImage(nb,-W*.05-t*W*.004,-H*.05,W*1.15,H*1.15);x.globalAlpha=1;tunnel(x,W,H,t,.03,ss(0,1.8,t)*aS);}
 const aB=ss(3.7,4.7,t)*(1-ss(8,8.9,t));if(aB>0){x.save();x.globalAlpha=aB;jupiter(x,W*(.76-(t-4)*.006),H*.6,H*.62,t*.5);const u=(t-3.8)/5,px=W*lerp(.1,.44,u),py=H*lerp(.34,.42,u);
  const g=pioneer(x,px,py,H*lerp(.08,.12,u),{spin:t*1.1,yaw:-1.1+u*.5,pitch:.25,warm:false,light:[-.75,-.35,.56]});x.restore();flare(x,g.cx,g.cy,H*.04,g.glint*aB,false);flare(x,W*.04,H*.12,H*.05,aB*.7,true);}
 const aC=ss(8.3,9.2,t)*(1-ss(12.2,13.1,t));if(aC>0)marsLimb(x,W,H,t-8.4,aC);
 const aD=ss(12.4,13.4,t);if(aD>0)emblem(x,W,H,t-12.6,aD);
 const bar=H*.09*(1-ss(13,14.6,t));x.fillStyle='#000';x.fillRect(0,0,W,bar);x.fillRect(0,H-bar,W,bar);}

window.SSGFX={intro,portal,painting,blueprint,shelfRovers,shelfPioneer,shelfUpper,shelfOpp,shelfPioneer2,armillary,scene,diag,stars};
})();
