/* 单 D · 蜡烛先取回，再装袋。所有台词、动作边界均由手推进。
   D8=取回，D9=入袋/记号，D10=封袋/温室近路。只向公共结果接口交货。 */
(function(){
"use strict";
var B=G.ch.BAI,H=G.ch.HU,S=null,serial=0;
var SP=window.__SPR||{},PI=Math.PI;
function U(){return G.u()}
function draft(){return G.roomView("d").draft}
function save(p){return G.roomDraft("d",p)}
function rect(x,y,w,h){return{x:x*G.W(),y:y*G.H(),w:w*G.W(),h:h*G.H()}}
function later(t,fn){var s=S,phase=S.phase;G.sched(t,G.guard(function(){if(S===s&&S.phase===phase)fn()}))}
function motion(t,fn,end){var s=S,phase=S.phase;G.anim(t,function(p){if(S===s&&S.phase===phase)fn(p)},0,function(){if(S===s&&S.phase===phase&&end)end()})}
function event(n,p){G.actorEvent("d",n,p||{})}
function busy(v){S.busy=v;S.controllers.forEach(function(c){c.cancel()})}
function boxPath(k,r,rad){rad=Math.min(rad||6,r.w/2,r.h/2);k.beginPath();k.moveTo(r.x+rad,r.y);k.arcTo(r.x+r.w,r.y,r.x+r.w,r.y+r.h,rad);k.arcTo(r.x+r.w,r.y+r.h,r.x,r.y+r.h,rad);k.arcTo(r.x,r.y+r.h,r.x,r.y,rad);k.arcTo(r.x,r.y,r.x+r.w,r.y,rad);k.closePath()}
function drop(k,x,y,r,alpha){k.save();k.globalAlpha=alpha==null?1:alpha;k.fillStyle="#8dcddd";k.strokeStyle="#5b93b2";k.lineWidth=1.2*U();k.beginPath();k.moveTo(x,y-r);k.bezierCurveTo(x-r*1.5,y+r*.5,x-r*.8,y+r*1.1,x,y+r*1.1);k.bezierCurveTo(x+r*.8,y+r*1.1,x+r*1.5,y+r*.5,x,y-r);k.fill();k.stroke();k.fillStyle="#e8fbff";k.beginPath();k.ellipse(x-r*.28,y+r*.1,r*.15,r*.3,.4,0,PI*2);k.fill();k.restore()}
function shadow(k,x,y,w){k.fillStyle="rgba(53,30,42,.19)";k.beginPath();k.ellipse(x,y,w,4*U(),0,0,PI*2);k.fill()}
function text(k,t,x,y,size,color){k.font="700 "+size+"px S,serif";k.textAlign="center";k.textBaseline="middle";k.fillStyle=color||"#493951";k.fillText(t,x,y)}
function pointsRect(){return rect(.42,.665,.26,.105)}
function candleHome(){var p=rect(.56,.657,0,0);return{x:p.x-20*U(),y:p.y-26*U(),w:40*U(),h:26*U()}}
function candleLanding(){return rect(.72,.715,0,0)}
function tagRect(){var w=120*U(),h=80*U();return{x:G.W()*.5-w/2,y:S.table+22*U(),w:w,h:h}}
function bagRect(){var w=126*U(),h=(S.full?94:71)*U();return{x:G.W()*.50-w/2+S.bagX,y:S.table+12*U()+S.bagY,w:w,h:h}}
function bagMouth(){var r=bagRect();return{x:r.x+8*U(),y:r.y-8*U(),w:r.w-16*U(),h:30*U()}}
function labelRect(){var r=bagRect();return{x:r.x+r.w*.19,y:r.y+r.h*.37,w:r.w*.62,h:r.h*.40}}
function markInk(k,r,d){if(d.mark==="draw")G.traceDraw(k,d.strokes||[],r.x,r.y,r.w,r.h,{color:"#484461",width:2*U()});else if(d.sticker){k.save();k.translate(r.x+d.sticker.x*r.w,r.y+d.sticker.y*r.h);k.rotate(d.sticker.angle*PI/180);drop(k,0,0,9*U());k.restore()}}
function candles(k,r){shadow(k,r.x+r.w/2,r.y+r.h+2*U(),r.w*.58);k.save();k.translate(r.x,r.y);k.rotate(S.candleTilt||0);for(var i=0;i<3;i++){k.fillStyle=["#e9b4bc","#eed18a","#b4cdbf"][i];k.strokeStyle="#786772";k.lineWidth=.8*U();boxPath(k,{x:i*r.w/3,y:i%2*3*U(),w:r.w/3-2*U(),h:r.h-i%2*3*U()},2*U());k.fill();k.stroke();k.beginPath();k.moveTo(i*r.w/3+4*U(),-3*U());k.lineTo(i*r.w/3+4*U(),2*U());k.stroke()}k.strokeStyle="#a885b2";k.lineWidth=3*U();k.beginPath();k.moveTo(-2*U(),r.h*.63);k.lineTo(r.w+1*U(),r.h*.63);k.stroke();k.restore()}
function parcel(k,r){shadow(k,r.x+r.w/2,r.y+r.h+3*U(),r.w*.48);k.save();k.translate(r.x+r.w/2,r.y+r.h/2);k.rotate(S.bagR*PI/180);k.scale(S.bagFlip,1);k.translate(-r.w/2,-r.h/2);var gr=k.createLinearGradient(0,0,r.w,r.h);gr.addColorStop(0,"#b5afd5");gr.addColorStop(1,"#7a80ac");k.fillStyle=gr;k.strokeStyle="#625a80";k.lineWidth=1.4*U();boxPath(k,{x:0,y:0,w:r.w,h:r.h},7*U());k.fill();k.stroke();k.fillStyle="#565775";k.beginPath();k.ellipse(r.w/2,3*U(),r.w*.42,S.sealed?2*U():7*U(),0,0,PI*2);k.fill();
 if(S.full&&!S.sealed){for(var i=0;i<3;i++){k.fillStyle=["#e9b4bc","#eed18a","#b4cdbf"][i];k.fillRect(r.w*.42+i*8*U(),-5*U(),6*U(),10*U())}}
 if(S.pickup==="bridge"){k.fillStyle="#e9decc";k.fillRect(6*U(),3*U(),r.w-12*U(),9*U());k.strokeStyle="#bdaea0";[.35,.65].forEach(function(f){k.beginPath();k.moveTo(r.w*f,3*U());k.lineTo(r.w*f,12*U());k.stroke()})}
 var lab={x:r.w*.19,y:r.h*.37,w:r.w*.62,h:r.h*.40};k.fillStyle="#f7efda";boxPath(k,lab,3*U());k.fill();if(S.bagFlip>.2)markInk(k,lab,S.markData||{});
 if(S.pickup==="water")drop(k,r.w-12*U(),r.h-14*U(),5*U(),.75);
 text(k,"一包蜡烛",r.w/2,r.h*.22,Math.max(17,15*U()),"#fff6e3");
 if(S.seal>0){k.fillStyle="#e6d1a6";k.fillRect(7*U(),0,(r.w-14*U())*S.seal,8*U());k.strokeStyle="#f5e6c4";k.beginPath();k.moveTo(8*U(),3*U());k.lineTo(8*U()+(r.w-16*U())*S.seal,3*U());k.stroke()}
 k.restore()}
function drawWindow(k,t){var W=G.W(),h=G.H(),m=SP["bg-shop"],im=m&&m.img;if(im){var scale=Math.max(W/m.w,h/m.h)*1.62,ww=m.w*scale,hh=m.h*scale;if(!S.windowPainting){var c=document.createElement("canvas");c.width=im.naturalWidth;c.height=im.naturalHeight;var g=c.getContext("2d");g.drawImage(im,0,0);g.save();g.translate(c.width*.54,c.height*.348);g.rotate(-3.7*PI/180);text(g,"外送",0,0,Math.max(22,30*U())*c.width/ww,"#3f220e");g.restore();S.windowPainting=c}k.drawImage(S.windowPainting,W-ww,S.table-.647*hh,ww,hh)}
 // The shallow outer ledge is a visible support, not a cliff.
 var ledge=rect(.40,.655,.30,.023);k.fillStyle="#a78370";boxPath(k,ledge,3*U());k.fill();k.fillStyle="#ddc7a4";k.fillRect(ledge.x,ledge.y,ledge.w,5*U());
 var c=rect(.85,.31,0,0);k.strokeStyle="rgba(227,222,246,.65)";k.lineWidth=2*U();k.beginPath();k.arc(c.x-8*U(),c.y,8*U(),PI,0);k.arc(c.x+3*U(),c.y-3*U(),9*U(),PI,0);k.arc(c.x+14*U(),c.y+1*U(),7*U(),PI,0);k.stroke();
 var b=rect(.13,.29,0,0);k.save();k.translate(b.x,b.y);k.rotate(S.bellR);k.strokeStyle="#8c6d45";k.lineWidth=2*U();k.beginPath();k.moveTo(0,-15*U());k.lineTo(0,22*U());k.stroke();k.fillStyle="#b5d7dc";k.beginPath();k.arc(0,3*U(),10*U(),PI,0);k.lineTo(12*U(),13*U());k.lineTo(-12*U(),13*U());k.closePath();k.fill();k.fillStyle="#f0deac";k.fillRect(-4*U(),22*U(),8*U(),18*U());k.restore();
 if(S.rain>=0){drop(k,c.x-(c.x-G.W()*.38)*S.rain,c.y+(S.table-c.y)*S.rain,4*U(),1-S.rain*.4)}
 var dim=G._i.dimA();if(dim){k.fillStyle="rgba(0,0,0,"+dim+")";k.fillRect(0,0,W,h)}
}
function drawFront(k){if(S.green)return;var w=G.W(),y=S.table;k.save();var gr=k.createLinearGradient(0,y,0,G.H());gr.addColorStop(0,"#c6a181");gr.addColorStop(.1,"#a77f67");gr.addColorStop(1,"#775645");k.fillStyle=gr;k.fillRect(0,y,w,G.H()-y);k.fillStyle="#e0c4a0";k.fillRect(0,y,w,6*U());k.strokeStyle="rgba(79,49,43,.2)";k.lineWidth=1;for(var i=0;i<5;i++){k.beginPath();k.moveTo(0,y+20*U()+i*35*U());k.lineTo(w,y+17*U()+i*35*U());k.stroke()}
 if(S.bridge>0){var a=rect(.56,.657,0,0),b=candleLanding(),p=S.bridge;k.fillStyle="#ece2ce";k.strokeStyle="#ab99a1";k.lineWidth=1*U();k.beginPath();k.moveTo(a.x-22*U(),a.y);k.lineTo(a.x+22*U(),a.y);k.lineTo(G.lerp(a.x,b.x,p)+22*U(),G.lerp(a.y,b.y,p)-S.paperLift);k.lineTo(G.lerp(a.x,b.x,p)-22*U(),G.lerp(a.y,b.y,p)-S.paperLift);k.closePath();k.fill();k.stroke();for(i=1;i<3;i++){var f=p*i/3;k.beginPath();k.moveTo(G.lerp(a.x,b.x,f)-20*U(),G.lerp(a.y,b.y,f));k.lineTo(G.lerp(a.x,b.x,f)+20*U(),G.lerp(a.y,b.y,f));k.stroke()}}
 var paper=rect(.20,.735,.11,.05);k.save();k.translate(0,-S.paperLift);k.fillStyle="#ede2ce";k.fillRect(paper.x,paper.y,paper.w,paper.h);k.strokeStyle="#ac9987";k.beginPath();k.moveTo(paper.x,paper.y+paper.h*.5);k.lineTo(paper.x+paper.w,paper.y+paper.h*.5);k.stroke();k.restore();
 if(S.paperFall>0){k.save();k.translate(w*.52,y-30*U()+S.paperFall*30*U());k.rotate(S.paperFall*.7);k.fillStyle="#f2e5cd";k.fillRect(-15*U(),0,30*U(),14*U());k.restore()}
 parcel(k,bagRect());if(!S.full)candles(k,S.candle);
 var dp=S.dropPos;k.save();k.translate(dp.x,dp.y);k.scale(S.dropSX,1/S.dropSX);drop(k,-S.split*7*U(),0,(S.split?5:7)*U());if(S.split)drop(k,S.split*7*U(),0,5*U());k.restore();
 if(S.tagOpen){var r=tagRect();shadow(k,r.x+r.w/2,r.y+r.h+3*U(),r.w*.5);k.fillStyle="#fff4dc";k.strokeStyle="#9e829e";k.lineWidth=1.2*U();boxPath(k,r,5*U());k.fill();k.stroke();if(S.markReady)markInk(k,r,S.markData||{})}
 if(S.sticker){drop(k,S.sticker.x+S.sticker.w/2,S.sticker.y+S.sticker.h/2,12*U())}
 if(S.mist>0){k.fillStyle="rgba(211,237,247,"+(S.mist*.16)+")";k.beginPath();k.ellipse(dp.x,dp.y,25*U(),18*U(),0,0,PI*2);k.fill()}
 if(S.surprise>0){var q=G.hand(H,.86,.08);k.strokeStyle="rgba(241,215,152,"+S.surprise+")";k.lineWidth=2*U();k.beginPath();k.moveTo(q.x+8*U(),q.y);k.lineTo(q.x+11*U(),q.y-7*U());k.stroke()}
 if(S.foot>0){k.fillStyle="rgba(217,183,159,"+S.foot*.65+")";[0,1].forEach(function(i){k.beginPath();k.ellipse(w*.79+i*8*U(),Math.min(G.bottom()-12*U(),G.H()*.845),3*U(),6*U(),-.2,0,PI*2);k.fill()})}k.restore()}
/* Own poses are registered with measured local face bounds. Pose switches compensate
   eye midpoint and feet together; new PNGs retain the original source canvas. */
var faces={eBai:[.34,.17,.34,.16],baiPoint:[.38,.15,.29,.17],"d2-baiMist":[.29,.16,.43,.17],huLook:[.29,.15,.37,.18],"d2-huEmptyBag":[.24,.16,.42,.18]};
function pose(c,p){var base=c===B?"eBai":"d2-huEmptyBag",f=faces[base],n=faces[p],a=SP[base],b=SP[p],flip=p==="baiPoint"?-1:1;if(!b)return;G.pose(c,p);if(f&&n&&a)c.st.x=(((f[0]+f[2]/2)*a.w-a.ax)-((n[0]+n[2]/2)*b.w-b.ax)*flip)*c.k;if(c.d2Facing!==flip){c.d2Facing=flip;G.turn(c,{flip:flip,dur:.12})}}
function rest(c){pose(c,c===B?"eBai":"d2-huEmptyBag");c.st.x=c.st.y=c.st.r=c.st.hop=0;c.st.sx=c.st.sy=1}
function swing(c,angle,d,dx,sy,done){var ctl=c===B?S.controllers[0]:S.controllers[1];if(!ctl)return;var requested=c.pose;ctl.cancel();pose(c,requested);var baseX=c.st.x,token=ctl.token;motion(d,function(p){if(ctl.token!==token)return;var f=Math.sin(PI*p);c.st.r=angle*f;c.st.x=baseX+(dx||0)*U()*f;c.st.sy=1+(sy||0)*f},function(){if(ctl.token===token){rest(c);if(done)done()}})}
function hopNurse(amt){var ctl=S.controllers[1];ctl.cancel();var token=ctl.token;motion(.32,function(p){if(token!==ctl.token)return;H.st.hop=Math.sin(PI*p)*amt*U();H.st.sy=1-.02*Math.sin(PI*p)},function(){if(token===ctl.token){rest(H);S.foot=1;motion(.35,function(p){S.foot=1-p})}})}
function controls(){var seed=[1931,7163],last=[-99,-99],lastKind=[-1,-1],when=[{},{}];S.lastMotion=-99;
 [B,H].forEach(function(c,i){var ctl={token:0,held:false,down:false,cancel:function(){this.token++;this.held=false;rest(c)}},down=null,cool=-99;S.controllers.push(ctl);
  var events={};events["wrist"]=function(){if(i===0){pose(B,"baiPoint");swing(B,1,.42,3)}else swing(H,2,.36,0)};
  events["catch-early"]=function(){if(i===1){pose(H,"huLook");swing(H,-2,.45,-3)}};
  events["guide-candle"]=function(){if(i===0){pose(B,"baiPoint");swing(B,1,.45,3)}};
  events["bag-landed"]=function(){if(i===1){swing(H,1.5,.42,4);later(.2,function(){swing(B,-1,.3,0)})}};
  events["tag-watch"]=function(p){if(i===1&&!S.busy)H.st.r=G.clamp((p.x-G.W()*.5)/G.W()*3,-1,1)};
  events["seal-landed"]=function(){if(i===0)swing(B,-1,.55,-8);else{pose(H,"huLook");later(.22,function(){hopNurse(3)})}};
  var m=G.micro(c,{room:"d",id:i?"d2-hu":"d2-bai",idle:[],events:events});S.micros.push(m);
  // Capture only our own actor button: suppress the shared generic poke/third-click word.
  var el=document.querySelector('[data-id="'+(i?"d2-hu":"d2-bai")+'"]');
  function poke(){if(S.busy||S.green||G._i.clock()<S.mainUntil||G._i.clock()-cool<.35)return;cool=G._i.clock();S.lastMotion=cool;if(i)hopNurse(6);else{ctl.cancel();motion(.32,function(p){B.st.x=-2*U()*Math.sin(PI*p);S.dropSX=1+.12*Math.sin(PI*p)},function(){rest(B);S.dropSX=1})}}
  function release(cancel){if(!down)return;var held=ctl.held,moved=down.moved;if(cancel||moved||G._i.clock()-down.t>=.28)ctl.suppress=true;down=null;ctl.down=false;ctl.cancel();S.mist=0;if(!cancel&&held&&!moved&&!S.busy){if(i){S.dropPos.x-=8*U();hopNurse(6);later(.32,function(){S.dropPos.x+=8*U()})}}}
  if(el){el.addEventListener("click",function(e){e.stopImmediatePropagation();e.stopPropagation();if(ctl.suppress){ctl.suppress=false;return}poke()},true);
   el.addEventListener("pointerdown",function(e){if(S.busy||S.green||G._i.clock()<S.mainUntil)return;ctl.suppress=false;down={x:e.clientX,y:e.clientY,t:G._i.clock(),moved:false};ctl.down=true;if(el.setPointerCapture)try{el.setPointerCapture(e.pointerId)}catch(ignore){};var token=++ctl.token;later(.35,function(){if(!down||down.moved||ctl.token!==token||S.busy)return;ctl.held=true;ctl.suppress=true;if(i)H.st.sy=.98;else{pose(B,"d2-baiMist");S.mist=1}})});
   el.addEventListener("pointermove",function(e){if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>8){down.moved=true;ctl.suppress=true;ctl.cancel();S.mist=0}});
   el.addEventListener("pointerup",function(){release(false)});el.addEventListener("pointercancel",function(){ctl.suppress=true;release(true)});el.addEventListener("lostpointercapture",function(){release(true)});
  }
  var dispose=m.dispose;
  function lost(){release(true)}function visibility(){if(document.hidden)lost()}
  window.addEventListener("blur",lost);document.addEventListener("visibilitychange",visibility);
  m.dispose=function(){window.removeEventListener("blur",lost);document.removeEventListener("visibilitychange",visibility);down=null;ctl.cancel();dispose()};
  G.follow(function(){if(!c.on||S.green)return;var p=G.ptr();if(down&&!p.down)release(true);if(S.busy)return;var r=G.body(c),near=p.down&&p.x>r.l-30*U()&&p.x<r.r+30*U()&&p.y>r.t-24*U()&&p.y<r.b+24*U();if(!down&&G._i.clock()-S.lastMotion>.7){c.st.r=near?(p.x<(r.l+r.r)/2?-1:1)*(i?1.5:1):0;if(!i&&!S.dropBusy)S.dropPos.x=S.dropBase.x+(near?G.clamp(p.x-S.dropBase.x,-12*U(),12*U()):0)}});
  function rand(){seed[i]=(seed[i]*16807)%2147483647;return seed[i]/2147483647}
  function idle(){var now=G._i.clock(),r=G._t.running();if(!G.RM&&G.tier>0&&!S.green&&!S.busy&&!ctl.down&&now>=S.mainUntil&&!(r&&r.hold)&&now-S.lastMotion>1.2){var p=rand(),n=p<.3?0:p<.5?1:p<.6?2:3;if(n<3&&n!==lastKind[i]&&now-(when[i][n]||-99)>=20){lastKind[i]=n;when[i][n]=now;last[i]=now;S.lastMotion=now;if(i){if(n===0)swing(H,0,.35,0,-.015);else if(n===1){pose(H,"huLook");later(.45,function(){rest(H)})}else if(S.full||S.taken) swing(H,1.2,.3,0);else hopNurse(2)}else if(n===0){var y=S.dropPos.y;motion(.5,function(q){S.dropPos.y=y+Math.sin(PI*q)*12*U();B.st.r=Math.sin(PI*q)},function(){S.dropPos.y=y;rest(B)})}else if(n===1){pose(B,"baiPoint");later(.35,function(){rest(B)})}else swing(B,0,.45,3)}}later(5+rand()*7,idle)}
  later(5+i*1.7+rand()*2,idle);
 });
}
function eggs(){var cd={},s=S;
 function egg(id,area,fn){var r=G.hot(area,function(){var now=G._i.clock();if(S!==s||S.busy||S.green||now-(cd[id]||-99)<8)return;cd[id]=now;S.lastMotion=now;fn()},{id:id,label:id==="d2-cloud"?"小云纹":id==="d2-paper"?"包装纸折角":"窗沿水珠",pulse:false});S.eggs.push(r);return r}
 egg("d2-droplet",{rect:function(){return{x:S.dropPos.x-22*U(),y:S.dropPos.y-22*U(),w:44*U(),h:44*U()}}},function(){G.sfx("water");motion(.55,function(p){S.split=Math.sin(PI*p)},function(){S.split=0})});
 egg("d2-paper",rect(.18,.725,.15,.07),function(){G.sfx("paper");motion(.45,function(p){S.paperLift=6*U()*Math.sin(PI*p);if(S.pickup!=="bridge")S.surprise=Math.sin(PI*p)})});
 egg("d2-cloud",rect(.79,.275,.14,.07),function(){G.sfx("water");motion(.48,function(p){S.rain=p},function(){S.rain=-1;pose(B,"baiPoint");motion(.18,function(p){S.bagX=-5*U()*Math.sin(PI*p)},function(){rest(B);S.bagX=0})})});
 function bell(){var rec=G.pull(rect(.08,.31,.10,.07),{id:"d2-windbell",label:"风铃",dir:"down",dist:22*U(),need:false,done:function(){if(S!==s||S.green)return;var now=G._i.clock();if(!S.busy&&now-(cd.bell||-99)>=8){cd.bell=now;G.sfx("ring");swing(B,-1,.34);later(.12,function(){swing(H,1,.34)});motion(.55,function(p){S.bellR=Math.sin(p*PI*4)*(1-p)*.16})}later(.65,bell)}});S.eggs.push(rec)}bell();
 var used=false;G.follow(function(){var p=G.ptr();if(used||S.busy||S.green||!p.down||Math.abs(p.dx)<1||Math.abs(p.x-S.dropBase.x)>25*U()||Math.abs(p.y-S.dropBase.y)>22*U())return;used=true;S.dropBusy=true;var x=S.dropPos.x,to=S.dropBase.x+(p.x<S.dropBase.x?25:-25)*U();motion(.32,function(q){S.dropPos.x=G.lerp(x,to,q)},function(){pose(B,"baiPoint");later(.12,function(){pose(H,"huLook")});later(.35,function(){S.dropPos.x=S.dropBase.x;S.dropBusy=false;rest(B);rest(H)})})});
}
function setup(mode){var d=draft();S={id:++serial,phase:0,mode:mode,mainUntil:0,busy:false,green:false,controllers:[],micros:[],eggs:[],table:G.H()*(G.H()<700?.65:.69),full:!!d.inBag,taken:!!d.taken,pickup:d.pickup||null,seal:d.sealed?1:0,sealed:!!d.sealed,markData:d.marked?d:null,markReady:!!d.marked,tagOpen:false,sticker:null,bagX:0,bagY:0,bagR:0,bagFlip:1,bridge:d.pickup==="bridge"&&d.taken?1:0,paperLift:0,paperFall:0,dropSX:1,split:0,mist:0,rain:-1,foot:0,surprise:0,bellR:0};
 S.candle=candleHome();if(S.taken){var dest=candleLanding();S.candle.x=dest.x-S.candle.w/2;S.candle.y=dest.y-S.candle.h/2}
 if(d.pickup==="water"&&d.candleAt&&!d.inBag){S.candle.x=d.candleAt.x*G.W()-S.candle.w/2;S.candle.y=d.candleAt.y*G.H()-S.candle.h/2}
 S.dropBase={x:G.W()*.38,y:S.table-12*U()};S.dropPos={x:S.dropBase.x,y:S.dropBase.y};
 B.faces=B.faces||{};H.faces=H.faces||{};Object.keys(faces).forEach(function(p){(p.indexOf("hu")>=0||p.indexOf("Hu")>=0?H:B).faces[p]=faces[p]});
 G.par(0);G.layoutScene({actors:[{actor:B,pose:"eBai",x:.28,y:.80,h:.43*890/855,layer:"L20"},{actor:H,pose:"d2-huEmptyBag",x:.72,y:.80,h:.42,layer:"L20"}]});B.d2Facing=H.d2Facing=1;B.ba=H.ba=.004;B.sa=H.sa=0;G.dim(.25,.01);
 G.addPart(null,function(k,t){if(!S.green)drawWindow(k,t)},0,{under:true});G.addPart(null,function(k){drawFront(k)});
 G.trackVisual("d2-table",function(){return S.green?{x:0,y:0,w:0,h:0}:{x:0,y:S.table,w:G.W(),h:G.H()-S.table}},{layer:30});
 G.trackVisual("d2-bag",function(){return S.green?{x:0,y:0,w:0,h:0}:bagRect()},{layer:40});G.trackVisual("d2-candles",function(){return S.full||S.green?{x:0,y:0,w:0,h:0}:S.candle},{layer:40});G.trackVisual("d2-label",function(){return S.tagOpen?tagRect():{x:0,y:0,w:0,h:0}},{layer:40});
 G.logText("一包蜡烛");controls();eggs();

}
function say(T,c,t,act){T.beat(.32,function(){busy(false);S.mainUntil=G._i.clock()+.6;if(act)act();if(c===H){var ctl=S.controllers[1],token=ctl.token;motion(.32,function(p){if(token===ctl.token)H.st.y=-Math.sin(p*PI*4)*1.2*U()},function(){if(token===ctl.token)H.st.y=0})}G.say(c,t,{at:{x:G.W()*.5,y:Math.max(G.top()+12,G.H()*.13)}})})}
function checkpoint(T,field,value){T.call(function(){var p={};p[field]=value;save(p)})}
function intro(v,fast,T){var d=draft(),n=d.introRead||0;if(n===0){T.beat(.45,function(){busy(true);G.blink(B,false);G.blink(H,false);H.st.y=-12*U();motion(.4,function(p){H.st.y=-12*U()*(1-p);S.bagY=-10*U()*(1-p)});G.sfx("paper");G.arrive(H,"护士-空袋探窗")});say(T,H,"蜡烛到——");checkpoint(T,"introRead",1)}
 if(n<2){say(T,B,"……是外送。",function(){event("wrist");G.arrive(B,"白发-点手腕");G.blink(B,true);G.blink(H,true);G.dim(.18,.25)});checkpoint(T,"introRead",2)}
 if(n<3){say(T,H,"袋子先到。",function(){pose(H,"d2-huEmptyBag");motion(.55,function(p){S.bagR=Math.sin(PI*p)*-155;S.paperFall=Math.sin(PI*p)});G.sfx("paper")});checkpoint(T,"introRead",3)}
 if(n<4){say(T,B,"蜡烛还没到。",function(){pose(B,"baiPoint");S.bridge=.15});checkpoint(T,"introRead",4)}
 T.call(function(){rest(B);rest(H);S.bridge=0;busy(false)})}
function pickup(which,done){busy(true);G.sayOff();S.pickup=which;save({pickup:which,taken:false,inBag:false,marked:false,mark:null,strokes:[],sticker:null,assisted:false,sealed:false,receptionRead:0,bagRead:0,markRead:false});
 if(which==="bridge"){S.bridge=.08;G.pull(rect(.46,.645,.22,.075),{id:"d2-bridge",label:"搭一座纸桥",dir:"down",dist:70*U(),commit:"release",onMove:function(p){S.bridge=.08+.92*p;var a=candleHome(),b=candleLanding();S.candle.x=G.lerp(a.x,b.x-a.w/2,p);S.candle.y=G.lerp(a.y,b.y-a.h/2,p);if(p>.45&&!S.early){S.early=true;event("catch-early")}},done:function(info){S.bridge=1;event("guide-candle");S.taken=true;save({taken:true,pickupAssisted:!info.real});busy(false);done({pickup:which})}})}
 else{pose(B,"d2-baiMist");var r=pointsRect(),trace=G.trace(r,{id:"d2-water",label:"画条水珠回来的路",need:100*U(),width:2*U(),color:"rgba(161,224,239,.75)",auto:[[.53,.16],[.9,.38],[.65,.72],[.8,.85]],onMove:function(){},done:function(info){G.rmPart(trace.ink);var pts=[],a=candleHome();pts.push([a.x+a.w/2,a.y+a.h/2]);info.strokes.forEach(function(st){st.forEach(function(q){pts.push([r.x+q[0]*r.w,r.y+q[1]*r.h])})});if(pts.length<2)pts.push([r.x+r.w/2,r.y+r.h/2]);var lengths=[0],len=0;for(var i=1;i<pts.length;i++){len+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);lengths.push(len)}
   event("catch-early");motion(.85,function(p){var d=p*len,j=1;while(j<lengths.length-1&&lengths[j]<d)j++;var f=(d-lengths[j-1])/Math.max(.001,lengths[j]-lengths[j-1]);S.candle.x=G.lerp(pts[j-1][0],pts[j][0],f)-a.w/2;S.candle.y=G.lerp(pts[j-1][1],pts[j][1],f)-a.h/2;S.dropPos.x=S.candle.x+a.w/2;S.dropPos.y=S.candle.y+a.h/2},function(){// Every endpoint is safe on this shallow ledge; no hidden endpoint test or long snap.
    var dest={x:S.candle.x+a.w/2,y:S.candle.y+a.h/2};S.taken=true;event("guide-candle");save({taken:true,pickupAssisted:!info.real,pickupPath:info.strokes,candleAt:{x:dest.x/G.W(),y:dest.y/G.H()}});S.dropPos={x:S.dropBase.x,y:S.dropBase.y};busy(false);done({pickup:which})})}})}
}
function reception(v,fast,T){var d=draft(),n=d.receptionRead||0,water=d.pickup==="water";if(water&&d.candleAt&&!d.inBag){S.candle.x=d.candleAt.x*G.W()-S.candle.w/2;S.candle.y=d.candleAt.y*G.H()-S.candle.h/2}
 if(n<1){say(T,H,water?"这个也想带走。":"接到了。",function(){event("catch-early")});checkpoint(T,"receptionRead",1)}
 if(n<2){say(T,B,water?"先装蜡烛。":"先别抬桥。",function(){event("guide-candle")});checkpoint(T,"receptionRead",2)}
 if(!d.inBag){if((d.bagRead||0)<1){say(T,B,"这次放好。",function(){pose(B,"baiPoint")});checkpoint(T,"bagRead",1)}
  say(T,H,"三根，齐的。",function(){pose(H,"d2-huEmptyBag")});T.ask(function(done){busy(true);G.drag(S.candle,bagMouth,function(info){S.full=true;S.bridge=0;save({inBag:true,bagAssisted:!info.real});busy(false);event("bag-landed");G.sfx("paper");done()},{id:"d2-bag",label:"装好蜡烛",scale:1.05,pad:8*U(),onMove:function(x,y){S.candle.x=G.clamp(x,28*U(),G.W()-S.candle.w-28*U());S.candle.y=G.clamp(y,G.H()*.60,G.bottom()-S.candle.h-12*U())},onMiss:function(){event("guide-candle")}})})}
 say(T,B,"留个记号？",function(){S.full=true;pose(B,"baiPoint");S.bagX=0});T.call(function(){busy(false)})
}
function marking(which,done){busy(true);G.sayOff();S.tagOpen=true;S.markReady=false;S.markData=null;var r=tagRect();save({mark:which,marked:false,strokes:[],sticker:null,assisted:false,markRead:false});
 function finish(info,p){S.markData=p;S.markReady=true;S.tagOpen=false;S.sticker=null;save(p);busy(false);done(p)}
 if(which==="draw"){var rec=G.trace(r,{id:"d2-mark-draw",label:"画个记号",need:60*U(),width:2.5*U(),color:"#484461",auto:[[.30,.62],[.35,.43],[.47,.34],[.62,.39],[.69,.52]],onMove:function(p,x){H.st.r=G.clamp((x-G.W()*.5)/G.W()*3,-1,1)},done:function(info){G.rmPart(rec.ink);finish(info,{mark:"draw",marked:true,strokes:info.strokes,sticker:null,assisted:!info.real})}})}
 else{S.sticker={x:G.W()*.78-15*U(),y:S.table+34*U(),w:30*U(),h:30*U()};G.drag(S.sticker,r,function(info){var x=G.clamp(info.fx,.14,.86),y=G.clamp(info.fy,.2,.8);finish(info,{mark:"drop",marked:true,strokes:[],sticker:{x:x,y:y,angle:G.clamp((x-.5)*16,-8,8)},assisted:!info.real})},{id:"d2-mark-drop",label:"贴个水滴",snap:false,scale:1.05,pad:0,onMove:function(x,y){S.sticker.x=G.clamp(x,28*U(),G.W()-S.sticker.w-28*U());S.sticker.y=G.clamp(y,G.H()*.60,G.bottom()-S.sticker.h-12*U())}})}
}
function ready(v,fast,T){var d=draft();if(!d.markRead){if(d.mark==="draw")say(T,H,"认得了。",function(){rest(H)});else say(T,B,"这面。",function(){motion(.6,function(p){S.bagFlip=1-.75*Math.sin(PI*p);H.st.r=-Math.sin(PI*p)},function(){rest(H);S.bagFlip=1})});checkpoint(T,"markRead",true)}
 if(!d.sealed){say(T,H,"这回齐了。",function(){pose(H,"huLook")});T.ask(function(done){busy(true);var r=bagMouth();G.pull(r,{id:"d2-seal",label:"封好袋口",dir:"right",dist:65*U(),commit:"release",onMove:function(p){S.seal=p},done:function(info){G.sayOff();S.sealed=true;S.seal=1;save({sealed:true,sealAssisted:!info.real});var x=draft();G.roomResult("d",{pickup:x.pickup,mark:x.mark,strokes:x.strokes||[],sticker:x.sticker||null,assisted:!!x.assisted});busy(false);event("seal-landed");G.sfx("paper");done()}})})}
 T.ask(function(done){G.cta("拿回柜台",G.guard(function(){done()}))});T.call(function(){greenhouse(function(){G.toHub()})})
}
/* The shortcut is one composition, never a destination choice. A three-second
   minimum only enables the departure control; no elapsed time ever leaves it. */
function greenhouse(done){busy(true);S.phase++;S.green=true;G.logText("抄近路回店");S.micros.forEach(function(m){m.dispose()});S.eggs.forEach(G.unhot);G.sayOff();G.bg("bg-greenhouse",{fit:.78,fade:.28});G.dim(.08,.25);rest(B);rest(H);G.show(B,"eBai",{x:G.W()*.29,y:G.H()*.83});G.show(H,"d2-huEmptyBag",{x:G.W()*.70,y:G.H()*.83});
 var hug=G.mk("d2-hug",{pose:"hug",frac:.45}),p={a:0},bag=rect(.72,.77,.17,.10),depart=false;hug.fh=.34;hug.faces={hug:[.33,.17,.51,.16]};G.trackVisual("d2-green-parcel",function(){return p.a?bag:{x:0,y:0,w:0,h:0}},{layer:40});
 G.addPart(null,function(k,t){if(!S.green)return;k.save();var gr=k.createRadialGradient(G.W()*.5,G.H()*.48,1,G.W()*.5,G.H()*.48,G.H()*.7);gr.addColorStop(0,"rgba(255,232,188,.12)");gr.addColorStop(1,"rgba(50,35,88,.18)");k.fillStyle=gr;k.fillRect(0,0,G.W(),G.H());k.save();k.shadowColor="#253326";k.shadowBlur=4;text(k,"抄近路回店",G.W()*.72,G.H()*.89,15,"#fff1cf");k.restore();k.globalAlpha=p.a;G.drawResult(k,"d",G.roomView("d").result,bag);if(!G.RM&&G.tier>0){for(var i=0;i<5;i++){var q=(t*.055+i*.2)%1,x=G.W()*(.05+i*.21)+Math.sin(t*.7+i)*8*U(),y=G.H()*(.82+q*.16);k.fillStyle=i%2?"#c4a9ed":"#9f83ca";k.beginPath();k.ellipse(x,y,4*U(),2*U(),t+i,0,PI*2);k.fill()}}k.restore()});
 G.walkTo(B,G.W()*.34,{dur:.55,pose:"eBai"});G.walkTo(H,G.W()*.70,{dur:.55,pose:"d2-huEmptyBag"});later(.8,function(){G.hide(B);G.hide(H);G.show(hug,"hug",{x:G.W()*.52,y:G.H()*.84});hug.layer="L20";hug.el.style.zIndex="20";p.a=1;G.sfx("paper");later(3,function(){if(depart)return;G.cta("回店",G.guard(function(){if(depart)return;depart=true;save({shortcutSeen:true});G.hide(hug);done()}))})})
}
G.zone({room:"d",name:"外送窗口",nodes:["D8","D9","D10"],first:"D8",bg:"bg-shop",fit:.69,resultsNoList:true,rows:{"D8.A":{ticket:"蜡烛：纸桥接回"},"D8.B":{ticket:"蜡烛：水珠接回"},"D9.A":{},"D9.B":{}},results:function(){setup("result");var r=G.roomView("d").result;if(r){S.full=true;S.sealed=true;S.seal=1;S.pickup=r.pickup;S.markData=r;S.bridge=0}G.dim(.18,.2);if(!draft().shortcutSeen){var q=rect(.33,.245,.34,.055);var e=G.words("抄近路回店",{x:q.x+q.w/2,y:q.y+q.h/2,fs:17/U()});G.hot(q,function(){G.hideCta();e.a=0;greenhouse(function(){G.toHub()})},{id:"d2-resume-shortcut",label:"抄近路回店",pulse:false})}G.hot({rect:bagRect},function(){if(S.busy)return;G.sfx("paper");motion(.35,function(p){S.bagR=2*Math.sin(PI*p)})},{id:"d2-result-bag",label:"一包蜡烛",pulse:false})}});
G.node("D8",{room:"d",bg:"bg-shop",fit:.69,q:"",setup:function(){if(draft().taken)save({taken:false,inBag:false,marked:false,sealed:false,pickup:null,mark:null,strokes:[],sticker:null,receptionRead:0,bagRead:0,markRead:false});setup("pickup")},enter:intro,options:function(){return[{id:"A",label:"搭一座纸桥",pre:function(v,f,done){pickup("bridge",done)},next:"D9"},{id:"B",label:"请水珠帮忙",pre:function(v,f,done){pickup("water",done)},next:"D9"}]}});
G.node("D9",{room:"d",bg:"bg-shop",fit:.69,q:"",setup:function(){if(draft().marked)save({marked:false,mark:null,strokes:[],sticker:null,markRead:false,sealed:false});setup("mark")},enter:reception,options:function(){return[{id:"A",label:"我画一个",pre:function(v,f,done){marking("draw",done)},next:"D10"},{id:"B",label:"贴个水滴",pre:function(v,f,done){marking("drop",done)},next:"D10"}]}});
G.node("D10",{room:"d",bg:"bg-shop",fit:.69,q:"",setup:function(){setup("seal")},enter:ready,options:function(){return[]}});
})();
