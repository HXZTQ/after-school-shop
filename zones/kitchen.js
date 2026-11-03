/* 厨房 K1–K6。两次选择、四个必经手势；只在整碗落盘时交货。
   主线稿第二节 B / 第三、五、六节；所有工作进度走 v2 草稿。
   k2 新帧沿用源图脚锚；换帧以眼线配准，脚下差异藏在桌后。 */
(function(){
"use strict";
var MAO=G.ch.MAO,REN=G.ch.REN,S=null;
var MB="eMao",RB="eRen",MO="k2-maoOfferBun",MT="k2-maoTasteBright",RP="k2-renBunPause",RT="k2-renTrayReady";
var FACE={eMao:[.43,.07,.26,.13],eRen:[.31,.055,.29,.14],
 "k2-maoOfferBun":[.40,.085,.28,.135],"k2-maoTasteBright":[.40,.085,.28,.135],
 "k2-renBunPause":[.31,.065,.29,.14],"k2-renTrayReady":[.31,.065,.29,.14]};
/* 实看源帧：眼中心；用于避开全身裁切差异，不能靠脸框近似值猜手的位置。 */
var EYE={eMao:[.56,.12],eRen:[.455,.105],
 "k2-maoOfferBun":[.54,.13],"k2-maoTasteBright":[.54,.13],
 "k2-renBunPause":[.455,.12],"k2-renTrayReady":[.455,.12]};
function unit(){return G.W()/390}
function now(){return S?S.time:0}
function draft(){return G.roomView("k").draft}
function pose(c,p){var old=c===MAO?MB:RB,ref=c.imgs[old],a=EYE[old],b=EYE[p];G.pose(c,p);var im=c.imgs[p];
 if(ref&&im&&b){c.st.x=((a[0]*ref.m.w-ref.m.ax)-(b[0]*im.m.w-im.m.ax))*c.k;c.st.y=((a[1]*ref.m.h-ref.m.ay)-(b[1]*im.m.h-im.m.ay))*c.k;}
 c.faces=c.faces||{};if(FACE[p])c.faces[p]=FACE[p];}
function restore(c){c.k2Motion=(c.k2Motion||0)+1;pose(c,c===MAO?S.maoPose:S.renPose);c.st.r=0;c.st.sx=c.st.sy=1;}
function move(o,key,value,d){G.tw(o,key,value,d||.3,0,G.eout)}
function pulse(c,r,dx){var x=c.st.x,token=c.k2Motion=(c.k2Motion||0)+1;G.anim(.42,function(p){if(c.k2Motion!==token)return;c.st.r=Math.sin(p*Math.PI)*r;c.st.x=x+Math.sin(p*Math.PI)*(dx||0)*unit();},0,function(){if(c.k2Motion===token){c.st.r=0;c.st.x=x}})}
function event(name,payload){G.actorEvent("k",name,payload||{})}
function say(T,c,text,action){T.beat(.12,function(){S.main=true;if(action)action();G.say(c,text,{at:{x:G.W()*.1,y:Math.max(G.top()+8,G.H()*.11)}});
 /* G.say 的通用 squash 取消；说话只动肩，口型由既有小补丁负责。 */
 c.st.sx=c.st.sy=1;var base=c.st.x;G.anim(.24,function(p){c.st.x=base+Math.sin(p*Math.PI*2)*1.3*unit();c.st.sx=c.st.sy=1},0,function(){c.st.x=base});});}
function silence(){G.sayOff();S.main=true;clearEggs();}
function ellipse(k,x,y,rx,ry,fill,stroke){k.beginPath();k.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){k.fillStyle=fill;k.fill()}if(stroke){k.strokeStyle=stroke;k.stroke()}}
function line(k,a,b,col,w){k.strokeStyle=col;k.lineWidth=w;k.beginPath();k.moveTo(a[0],a[1]);k.lineTo(b[0],b[1]);k.stroke()}
function box(cx,cy,w,h){return{x:cx-w/2,y:cy-h/2,w:w,h:h}}
function center(r){return{x:r.x+r.w/2,y:r.y+r.h/2}}
function outline(k,r){k.save();k.strokeStyle="rgba(255,240,189,.85)";k.lineWidth=2*unit();k.setLineDash([5*unit(),4*unit()]);k.strokeRect(r.x,r.y,r.w,r.h);k.restore()}
function prop(name,img,h,x,y){var c=G.mk("k2-"+name,{pose:img,t:h*unit()/G.u()});G.show(c,img,{x:x,y:y,shadow:false,fly:false});G.safeProp({x:x-1,y:y-1,w:2,h:1},c);return c}
function watch(id,fn,layer){G.trackVisual("k2-"+id,fn,{layer:layer||40})}
function nil(){return{x:0,y:G.H()+2,w:0,h:0}}
function scene(v,D,mode){var d=mode==="result"?G.roomView("k").result:draft(),U=unit(),W=G.W(),H=G.H();
 S={time:0,main:true,input:false,mode:mode,eggs:[],bunGiven:!!d.bunGiven,noodles:!!d.noodles,side:d.side||null,taster:d.taster||null,
  p:0,fall:0,board:0,scroll:d.bunGiven?.12:0,scrollShift:0,spoon:0,dish:0,dishUp:0,steamBend:0,shine:0,plateUp:0,trayTilt:0,lid:0,lidTurn:0,
  sideAction:null,dropDone:mode==="result",lastEgg:-99,eggBusy:false,maoPose:MB,renPose:RB,targets:[],idleUntil:0};
 G.par(0);G.dim(.28,.18);
 var tableY=H*.69,cy=H*.74;
 /* 选择带使用公共横排；桌面操作区留在按钮上方。 */
 if(mode==="choose"){cy=Math.min(cy,G.bottom()-146*U);tableY=Math.min(tableY,cy-25*U)}
 if(mode==="result"){S.noodles=true;S.bunGiven=true;}
 S.cy=cy;S.tableY=tableY;S.bowl=box(W*.50,cy,106*U,58*U);S.tray=box(W*.72,cy+12*U,118*U,44*U);
 S.boardBox=box(W*.50,cy-25*U,210*U,47*U);S.bunPlate=box(W*.22,cy+12*U,64*U,24*U);S.domeBox=box(W*.79,cy,60*U,64*U);
 S.slots=G.layoutScene({actors:[{actor:MAO,pose:MB,x:.27,y:.83,h:.49,face:FACE.eMao,layer:"L20"},{actor:REN,pose:RB,x:.70,y:.83,h:.51,face:FACE.eRen,layer:"L20"}]});
 MAO.sa=REN.sa=0;MAO.ba=REN.ba=.005;MAO.blinkOn=REN.blinkOn=false;
 var table=G.mk("k2-table",{pose:"kTable",t:100});G.show(table,"kTable",{x:0,y:tableY,shadow:false});table.layer="L30";table.el.style.zIndex="30";
 table.st.sx=W/(852*table.k);table.st.sy=(H-tableY)/(350*table.k);
 S.bun=prop("bun","bun",28,W*.22,cy+12*U);S.dome=prop("dome","dome",58,W*.79,cy+15*U);
 S.dome.layer="L40";S.bun.layer="L40";
 if(mode==="serve"||mode==="result"){G.hide(S.dome);S.bowl.x=W*.31-S.bowl.w/2;if(mode==="result"){S.tray.x=W*.50-S.tray.w/2;S.bowl.x=S.tray.x+6*U;S.bowl.y=S.tray.y-27*U}S.maoPose=MT;S.renPose=RT;pose(MAO,MT);pose(REN,RT);}
 if(d.noodles&&!d.bunGiven)S.bunGiven=true;
 G.addPart(null,function(k,t){S.time=t;draw(k,t)});
 watch("main-bowl",function(){var b=S.bowl;return{x:b.x,y:b.y-4*U,w:b.w*(S.side==="toast"?1.1:1),h:b.h+4*U}});watch("noodle-stretch",function(){return S.board?{x:G.W()*.5-105*U,y:S.noodleY==null?S.boardBox.y:S.noodleY-8*U,w:210*U,h:36*U}:nil()});
 watch("scroll",function(){return S.scroll?scrollRect():nil()},25);
 watch("spoon",function(){return S.spoon?spoonRect():nil()},25);
 watch("tray",function(){return S.taster?S.tray:nil()});watch("empty-plate",function(){return S.plate||nil()});
 watch("taste-dish",function(){return S.dish?dishRect():nil()},25);
 watch("steam",function(){return S.noodles?steamBox():nil()});
 if(mode==="result"){var palm=G.hand(REN,.32,.407);S.bowl.x=palm.x-S.bowl.w/2;S.bowl.y=palm.y-48*U;S.tray.x=palm.x-S.tray.w/2;S.tray.y=palm.y-S.tray.h/2;S.carried=true;S.maoPose=S.taster==="mao"?MT:MO;pose(MAO,S.maoPose);S.spoon=S.taster==="mao"?1:0;S.spoonOwner=MAO;}
 reactions();
}
function scrollRect(){var h=G.hand(REN,S.scroll<=.15?.80:.51,S.scroll<=.15?.54:.40);return{x:h.x-25*unit(),y:h.y+S.scrollShift,w:50*unit(),h:(12+S.scroll*30)*unit()}}
function spoonRect(){var c=S.spoonOwner===REN?REN:MAO,h=G.hand(c,c===MAO?.51:.44,c===MAO?.26:.40);return{x:h.x-9*unit()+S.spoonX,y:h.y+S.spoonY,w:20*unit(),h:37*unit()}}
function dishRect(){var c=S.dishOwner||(S.taster==="ren"?REN:MAO),h=S.dishPoint||G.hand(c,c===MAO?.53:.32,c===MAO?.52:.407);return{x:h.x-19*unit(),y:h.y-S.dishUp-7*unit(),w:38*unit(),h:14*unit()}}
function drawBowl(k,b){var U=unit(),w=b.w,h=b.h,x=b.x+w/2,y=b.y+17*U;
 k.save();k.translate(x,y);k.rotate((S.bowlTilt||0)*Math.PI/180);k.lineWidth=1.6*U;
 ellipse(k,0,h*.64,w*.47,6*U,"rgba(45,25,14,.22)");
 k.fillStyle="#ece6d3";k.strokeStyle="#655d56";k.beginPath();k.moveTo(-w*.48,0);k.bezierCurveTo(-w*.42,38*U,w*.42,38*U,w*.48,0);k.closePath();k.fill();k.stroke();
 ellipse(k,0,0,w*.49,12*U,"#f8f2df","#5d635c");
 ellipse(k,0,1,w*.43,8.7*U,S.noodles?(S.side==="soup"?"#d9a44f":"#c7974b"):"#c4cabb");
 if(S.noodles){k.save();k.beginPath();k.ellipse(0,0,w*.43,9*U,0,0,Math.PI*2);k.clip();k.strokeStyle="#fff0ab";k.lineWidth=2.8*U;k.lineCap="round";
  for(var i=0;i<10;i++){k.beginPath();k.moveTo(-w*.36+i*7*U,-7*U);k.bezierCurveTo(-w*.12+i*3*U,8*U,w*.28-i*4*U,-8*U,w*.35-i*7*U,6*U);k.stroke()}
  if(S.side==="soup"){ellipse(k,0,4*U,w*.40,3.5*U,"rgba(233,180,78,.60)");line(k,[-w*.3,3*U],[w*.3,3*U],"#f7d991",1.4*U)}
  for(i=0;i<5;i++)ellipse(k,(-24+i*12)*U,(-3+i%2*5)*U,2.8*U,1.7*U,"#5c8952");k.restore();}
 k.strokeStyle="#69847b";k.lineWidth=2*U;k.beginPath();k.moveTo(-w*.39,12*U);k.quadraticCurveTo(0,29*U,w*.39,12*U);k.stroke();ellipse(k,0,31*U,19*U,3*U,"#d6d2c0","#697069");
 if(S.side==="toast"){/* 纸托固定在碗右边，整组随拖，不进汤。 */
  k.fillStyle="#f3ead8";k.strokeStyle="#b8a481";k.beginPath();k.moveTo(w*.29,11*U);k.lineTo(w*.58,11*U);k.lineTo(w*.54,32*U);k.lineTo(w*.33,32*U);k.closePath();k.fill();k.stroke();
  k.fillStyle="#e1ad62";k.strokeStyle="#a87641";k.beginPath();k.moveTo(w*.34,20*U);k.lineTo(w*.32,-9*U);k.quadraticCurveTo(w*.30,-21*U,w*.43,-21*U);k.quadraticCurveTo(w*.60,-22*U,w*.58,-8*U);k.lineTo(w*.56,20*U);k.closePath();k.fill();k.stroke();k.fillStyle="#f6dba2";k.fillRect(w*.37,-10*U,w*.15,24*U);}
 k.restore();}
function steamBox(){var U=unit(),b=S.bowl,x=b.x+b.w/2,top=b.y-28*U;
 [MAO,REN].forEach(function(c){var f=G.faceRect(c);if(f&&x+28*U>f.l&&x-28*U<f.r)top=Math.max(top,f.b+8*U)});
 return{x:x-28*U,y:top,w:56*U,h:Math.max(0,b.y+6*U-top)};}
function draw(k,t){var U=unit(),W=G.W(),b=S.bowl,c=center(b);k.lineCap="round";k.lineJoin="round";
 ellipse(k,S.bunPlate.x+S.bunPlate.w/2,S.bunPlate.y+S.bunPlate.h/2,S.bunPlate.w/2,9*U,"#eee0c7","#b4a080");
 if(S.mode==="serve"||S.mode==="result"||S.taster){var tr=S.tray,q=center(tr);k.save();k.translate(q.x,q.y);k.rotate(S.trayTilt*Math.PI/180);ellipse(k,0,6*U,tr.w*.49,11*U,"rgba(38,26,18,.22)");ellipse(k,0,0,tr.w*.5,tr.h*.43,"#98734b",S.taster==="ren"?"#eac477":"#7f694c");k.lineWidth=3*U;ellipse(k,0,-2*U,tr.w*.45,tr.h*.34,S.taster==="mao"?"#749d7b":"#c3a376",S.taster==="ren"?"#eac477":null);k.restore();}
 if(S.board){var r=S.boardBox;k.save();k.translate(S.boardShift||0,0);k.fillStyle="#bf9460";k.strokeStyle="#715237";k.lineWidth=2*U;k.fillRect(r.x,r.y,r.w,r.h);k.strokeRect(r.x,r.y,r.w,r.h);
  for(var j=0;j<3;j++)line(k,[r.x+10*U,r.y+(10+j*13)*U],[r.x+r.w-10*U,r.y+(12+j*13)*U],"rgba(108,70,38,.3)",U);k.restore();}
 drawBowl(k,b);
 if(S.board){/* 同一三束面：横向端点随 p 对称伸长，完成时三束一起落入原碗。 */
  var span=(30+S.p*145)*U,yy=S.noodleY==null?S.boardBox.y+12*U:S.noodleY,fall=S.fall,nx=G.W()*.5+(c.x-G.W()*.5)*fall;
  k.strokeStyle="#fff1bc";k.lineWidth=3.8*U;k.shadowColor="#74562d";k.shadowBlur=1;
  for(j=0;j<3;j++){var left=nx-span*.5*(1-fall),right=nx+span*.5*(1-fall),y=yy+j*4*U+(b.y+15*U-yy)*fall;k.beginPath();k.moveTo(left,y);k.bezierCurveTo(nx-span*.18,y+7*U*(1-fall),nx+span*.18,y+7*U*(1-fall),right,y);k.stroke();}
  k.shadowBlur=0;if(!fall){ellipse(k,nx-span/2,yy+5*U,7*U,12*U,"#f3dec0","#a38160");ellipse(k,nx+span/2,yy+5*U,7*U,12*U,"#f3dec0","#a38160");}}
 if(S.noodles){var steamSafe=steamBox();k.save();k.beginPath();k.rect(steamSafe.x,steamSafe.y,steamSafe.w,steamSafe.h);k.clip();var q=(t%3.4)/3.4;if(q<.60){var p=q/.60;k.save();k.strokeStyle="rgba(255,248,225,"+(Math.sin(p*Math.PI)*.65)+")";k.lineWidth=2*U;k.beginPath();k.moveTo(c.x,b.y+4*U);k.bezierCurveTo(c.x-5*U+S.steamBend,b.y-8*U,c.x+5*U+S.steamBend,b.y-18*U,c.x,b.y-28*U);k.stroke();if(S.side==="soup"){k.beginPath();k.moveTo(c.x+9*U,b.y+3*U);k.quadraticCurveTo(c.x+16*U,b.y-10*U,c.x+10*U,b.y-18*U);k.stroke()}k.restore();}k.restore();}
 if(S.scroll){var sr=scrollRect();k.fillStyle="#f3dfb1";k.strokeStyle="#9f7742";k.lineWidth=U;k.fillRect(sr.x,sr.y,sr.w,sr.h);k.strokeRect(sr.x,sr.y,sr.w,sr.h);line(k,[sr.x-4*U,sr.y],[sr.x+sr.w+4*U,sr.y],"#997141",4*U);line(k,[sr.x-4*U,sr.y+sr.h],[sr.x+sr.w+4*U,sr.y+sr.h],"#997141",4*U);}
 if(S.dish){var dr=dishRect();ellipse(k,dr.x+dr.w/2,dr.y+dr.h/2,dr.w/2,dr.h/2,"#e5dbc6","#ae9b79");ellipse(k,dr.x+dr.w/2,dr.y+dr.h/2,dr.w*.33,dr.h*.29,"#d1a765");}
 if(S.spoon){var sp=spoonRect();line(k,[sp.x+12*U,sp.y+34*U],[sp.x+8*U,sp.y+7*U],"#89704d",3*U);ellipse(k,sp.x+8*U,sp.y+5*U,6*U,4*U,"#dfc897","#89704d");}
 if(S.sideAction==="soup"){var pot=S.pot,p=center(pot);ellipse(k,p.x,p.y+8*U,pot.w*.5,16*U,"#a99d87","#645d53");ellipse(k,p.x,p.y,pot.w*.5,12*U,"#c99043","#655d4c");
  var lad=S.ladle||p;line(k,[lad.x,lad.y],[lad.x+15*U,lad.y-29*U],"#806345",4*U);ellipse(k,lad.x,lad.y,9*U,5*U,"#d6bb80","#7b6748");}
 if(S.lid){var lp=G.hand(REN,.44,.43);k.save();k.translate(lp.x,lp.y);k.scale(1,S.lidTurn||-1);ellipse(k,0,0,22*U,7*U,"#aaa89b","#6b6d64");ellipse(k,0,-7*U,4*U,3*U,"#625a4d");k.restore();}
 if(S.sideAction==="toast"){var dd=S.domeBox;k.save();k.beginPath();k.rect(dd.x,S.dome.at.y+S.dome.st.y+2*U,dd.w,100*U);k.clip();k.fillStyle="#e3b272";k.strokeStyle="#9e7444";k.lineWidth=2*U;k.fillRect(dd.x+18*U,dd.y+25*U,25*U,26*U);k.strokeRect(dd.x+18*U,dd.y+25*U,25*U,26*U);k.restore();}
 if(S.plate){var pp=center(S.plate);ellipse(k,pp.x,pp.y-S.plateUp,S.plate.w*.5,S.plate.h*.4,"#e5e1d2","#b4a68d");if(S.shine){k.fillStyle="#fff3bc";G.star(k,pp.x+12*U,pp.y-S.plateUp-2*U,5*U*S.shine)}}
 if(S.shoulderShine){var sh=G.hand(REN,.83,.29);k.fillStyle="#fff3bc";G.star(k,sh.x,sh.y,7*U*S.shoulderShine)}
 S.targets.forEach(function(r){outline(k,r)});
}
function clearEggs(){S.eggs.forEach(function(r){r.dispose()});S.eggs=[];S.eggBusy=false;}
function beginInput(keepLine){if(keepLine){S.main=true;clearEggs();}else silence();S.input=true;S.targets=[];event("priority");}
function endInput(){G.sayOff();S.input=false;S.targets=[];}
function auxiliary(rec,label){/* 可见行动词绑定现有手势 tap，仍由引擎记 real=false。 */
 var r={x:G.W()/2-64*unit(),y:Math.min(G.bottom()-52*unit(),G.H()*.83),w:128*unit(),h:44*unit()};
 var e=G.words(label,{x:G.W()/2,y:r.y+8*unit(),fs:18*unit()/G.u(),color:"#fff5d8"});e.el.style.pointerEvents="none";
 function off(){h.dispose();e.a=0;}
 var h=G.hot(r,function(){if(!rec.dead&&!rec.busy){rec.el.click();if(rec.busy||rec.dead)off();}},{id:rec.id+"-assist",label:label});
 return off;}
/* 目标前的对白留到手势完成；开放热区不是她已经动过手。 */
function bunInput(done){beginInput(true);pose(MAO,MO);S.maoPose=MO;
 var hand=G.hand(MAO,.85,.385),target=box(hand.x,hand.y,44*unit(),44*unit());S.targets=[target];
 var bounds=G.body(S.bun),proxy={x:bounds.l,y:bounds.t,w:bounds.r-bounds.l,h:bounds.b-bounds.t},anchor={x:S.bun.at.x-bounds.l,y:S.bun.at.y-bounds.t},following=true;
 G.follow(function(){if(following){S.bun.at.x=proxy.x+anchor.x;S.bun.at.y=proxy.y+anchor.y}});
 var rec=G.drag(proxy,target,function(info){following=false;S.bun.at.x=proxy.x+anchor.x;S.bun.at.y=proxy.y+anchor.y;off();endInput();G.roomDraft("k",{bunGiven:true});S.bunGiven=true;
  /* 从猫猫掌心出发；小包子只碰嘴下沿，鼻眼上方无路径。总接触 .12 秒。 */
  var from={x:S.bun.at.x,y:S.bun.at.y},face=G.faceRect(REN),to={x:face.x+face.w*.65,y:face.y+face.h*.96};
  S.bun.st.sx=S.bun.st.sy=.35;G.anim(.24,function(p){S.bun.at.x=from.x+(to.x-from.x)*p;S.bun.at.y=from.y+(to.y-from.y)*p;},0,function(){pose(REN,RP);S.renPose=RP;S.scroll=.12;event("bun-contact");G.sched(.12,function(){G.hide(S.bun);S.bun.st.sx=S.bun.st.sy=1;G.show(S.bun,"bun",{x:S.bunPlate.x+S.bunPlate.w/2,y:S.cy+12*unit(),shadow:false});G.safeProp({x:S.bun.at.x-1,y:S.bun.at.y-1,w:2,h:1},S.bun);done(info)})});
 },{id:"k-bun",label:"递包子",onMove:function(x,y){proxy.x=G.clamp(x,28*unit(),G.W()-proxy.w-28*unit());proxy.y=G.clamp(y,Math.max(G.faceRect(MAO).b,G.faceRect(REN).b)+6*unit(),S.cy);}});var off=auxiliary(rec,"递包子");}
function pullInput(done){beginInput(true);S.board=1;S.p=0;S.boardShift=0;S.renPose=RT;pose(REN,RT);S.maoPose=MB;pose(MAO,MB);
 var U=unit(),home={x:S.bowl.x,y:S.bowl.y},hand=G.hand(REN,.32,.407),half=false;
 S.noodleY=Math.max(G.faceRect(MAO).b,G.faceRect(REN).b)+18*U;
 G.anim(.35,function(p){S.bowl.x=home.x+(hand.x-S.bowl.w/2-home.x)*p;S.bowl.y=home.y+(hand.y-48*U-home.y)*p},0,function(){
  var area=box(G.W()*.5,S.noodleY+6*U,200*U,44*U);S.targets=[area];
  var rec=G.pull(area,{dir:"h",dist:90*U,id:"k-noodle",label:"拉长点",onMove:function(p){S.p=p;if(p>=.5&&!half){half=true;event("bowl-off-center");}if(p<.1)half=false;},done:function(info){off();endInput();S.p=1;G.anim(.42,function(p){S.fall=p},0,function(){S.noodles=true;S.board=0;S.fall=0;var from={x:S.bowl.x,y:S.bowl.y};G.anim(.38,function(p){S.bowl.x=from.x+(home.x-from.x)*p;S.bowl.y=from.y+(home.y-from.y)*p},0,function(){S.noodleY=null;G.roomDraft("k",{noodles:true});event("noodles-landed");done(info)})})}});var off=auxiliary(rec,"拉长点");});}
function soupPre(v,fast,done){beginInput();var U=unit();S.sideAction="soup";S.pot=box(G.W()*.24,S.cy-8*U,68*U,42*U);S.ladle=center(S.pot);S.targets=[S.pot];
 var rec=G.rub(S.pot,{mode:"wipe",need:150*U,id:"k-soup",label:"添一勺汤",onMove:function(p,x,y){S.ladle={x:G.clamp(x,S.pot.x,S.pot.x+S.pot.w),y:G.clamp(y,S.pot.y,S.pot.y+S.pot.h)};},done:function(info){off();endInput();var start={x:S.ladle.x,y:S.ladle.y},end=center(S.bowl);G.anim(.44,function(p){S.ladle.x=start.x+(end.x-start.x)*p;S.ladle.y=start.y+(end.y-start.y)*p-Math.sin(p*Math.PI)*12*U;},0,function(){S.side="soup";S.sideAction=null;G.roomDraft("k",{side:"soup",taster:null});G.sfx("water");done({side:"soup",assisted:!info.real})})}});var off=auxiliary(rec,"添一勺汤");}
function toastPre(v,fast,done){beginInput();S.sideAction="toast";var U=unit();S.targets=[S.domeBox];pulse(REN,-1,0);pulse(MAO,1,0);
 var rec=G.pull({follow:S.dome},{dir:"up",dist:65*U,id:"k-dome",label:"提起银罩",onMove:function(p){S.dome.st.y=-65*U*p;},done:function(info){off();endInput();S.side="toast";S.sideAction=null;G.hide(S.dome);G.roomDraft("k",{side:"toast",taster:null});done({side:"toast",assisted:!info.real})}});var off=auxiliary(rec,"提起银罩");}
function tastePre(who){return function(v,fast,done){silence();S.taster=who;G.roomDraft("k",{taster:who});done({taster:who})}}
function serveInput(done){beginInput(true);S.targets=[S.tray];var U=unit(),home={x:S.bowl.x,y:S.bowl.y};
 var rec=G.drag(S.bowl,S.tray,function(info){off();endInput();S.bowl.x=S.tray.x+6*U;S.bowl.y=S.tray.y-27*U;S.bowlTilt=0;S.dropDone=true;
  var d=draft();G.roomResult("k",{side:d.side,taster:d.taster});event("bowl-landed",{real:info.real});carryBowl(function(){done(info)});
 },{id:"k-serve",label:"把面放到托盘",snap:false,onMove:function(x,y){S.bowl.x=G.clamp(x,28*U,G.W()-S.bowl.w-28*U);S.bowl.y=G.clamp(y,S.tableY+4*U,Math.min(G.bottom()-90*U,S.cy+28*U));S.bowlTilt=G.clamp((S.bowl.x-home.x)*.035,-2,2);},onMiss:function(){S.bowlTilt=0;var x=S.tray.x;G.anim(.30,function(p){S.tray.x=x-Math.sin(p*Math.PI)*8*U},0,function(){S.tray.x=x})}});var off=auxiliary(rec,"端稳了");}
/* 先在桌上落盘才交货；随后托盘贴两只掌心抬起，绝不悬在胸前。 */
function carryBowl(done){var U=unit(),hand=G.hand(REN,.32,.407),b=S.bowl,tr=S.tray,from={bx:b.x,by:b.y,tx:tr.x,ty:tr.y},to={bx:hand.x-b.w/2,by:hand.y-48*U,tx:hand.x-tr.w/2,ty:hand.y-tr.h/2};
 G.anim(.45,function(p){b.x=from.bx+(to.bx-from.bx)*p;b.y=from.by+(to.by-from.by)*p;tr.x=from.tx+(to.tx-from.tx)*p;tr.y=from.ty+(to.ty-from.ty)*p},0,function(){S.carried=true;if(done)done()});}
/* 一处注册，全场动作通过具名事件接戏；idle 不碰正文或任务进度。 */
function reactions(){S.spoonX=S.spoonY=0;var actors=[MAO,REN],serial=0,seed=[1729,8917],last=[-1,-1],times=[[-99,-99,-99],[-99,-99,-99]],release=[false,false],press=[null,null],suppress=[0,0];
 function quiet(){return !S.main&&!S.input&&!S.eggBusy&&!G.ptr().down;}
 function random(i){seed[i]=(seed[i]*1664525+1013904223)>>>0;return seed[i]/4294967296}
 function idle(i){var delay=5+random(i)*7;G.sched(delay,function(){if(quiet()&&now()>=S.idleUntil){var n=random(i)*10,act=n<3?0:n<5?1:n<6?2:-1;if(act>=0&&act!==last[i]&&now()-times[i][act]>=20){last[i]=act;times[i][act]=now();S.idleUntil=now()+1.2;
  if(i===0){if(act===0)pulse(MAO,1.5,0);else if(act===1){S.spoon=1;S.spoonOwner=MAO;S.spoonX=-5*unit();move(S,"spoonX",0,.4)}else pulse(MAO,-1,-2)}
  else if(act===0)pulse(REN,-1,0);else if(act===1){S.trayTilt=1;move(S,"trayTilt",0,.5)}else{S.shoulderShine=1;move(S,"shoulderShine",0,.3)}
 }}idle(i)})}
 var evM={priority:function(){serial++;restore(MAO)},"bun-contact":function(){pulse(MAO,0,1)},"bowl-off-center":function(){G.sched(.12,function(){pulse(MAO,1,0)})},"noodles-landed":function(){pulse(MAO,-.6,-1)},"bowl-landed":function(){S.spoon=0;pulse(MAO,0,-2)},"bun-reminder":function(){pulse(MAO,.65,0)},"ren-hold":function(){pulse(MAO,1,1);move(S,"trayTilt",0,.24)}};
 var evR={priority:function(){restore(REN)},"bowl-off-center":function(){var x=S.bowl.x;S.bowl.x=x+10*unit();G.sched(.24,function(){move(S.bowl,"x",x,.24)})},"noodles-landed":function(){pulse(REN,-.7,0)},"bowl-landed":function(){S.renPose=RT;pose(REN,RT);S.trayTilt=0},"bun-reminder":function(){S.scrollShift=-10*unit();move(S,"scrollShift",0,.38)}};
 actors.forEach(function(c,i){G.micro(c,{room:"k",id:i?"k-ren":"k-mao",events:i?evR:evM,
  near:function(){if(S.input||!G.ptr().live)return;if(i){pulse(c,G.ptr().x<c.at.x?-1:1,0);}else{S.spoonX=-4*unit();move(S,"spoonX",0,.26);pulse(c,-.8,-2)}},
  poke:function(){c.pkT=-999;c.st.sx=c.st.sy=1;if(S.input||now()<suppress[i])return;var n=++serial;restore(c);if(i){c.st.sy=1.015;move(c.st,"sy",1,.24);pulse(c,0,-1)}else pulse(c,2,-1);
   if(quiet()&&n%3===0){G.say(c,i?"我端着呢。":"碗在那边。");S.main=true;G.nextTap(function(){S.main=false})}}
 });idle(i);});
 G.follow(function(){var p=G.ptr();actors.forEach(function(c,i){var body=G.body(c),inside=p.x>=body.l&&p.x<=body.r&&p.y>=body.t&&p.y<=body.b;
  if(p.down&&inside&&!S.input){if(!press[i])press[i]={x:p.x,y:p.y,t:now(),moved:false};var a=press[i];if(Math.abs(p.x-a.x)+Math.abs(p.y-a.y)>8*unit()){a.moved=true;suppress[i]=now()+.4;if(release[i]){release[i]=false;restore(c);S.spoonX=0;S.trayTilt=0}}
   if(!a.moved&&!release[i]&&now()-a.t>=.35){release[i]=true;suppress[i]=now()+1;restore(c);if(i){c.st.sy=1.015;S.trayTilt=2;G.sched(.2,function(){if(release[i])event("ren-hold")})}else{S.spoon=1;S.spoonOwner=MAO;S.spoonX=-4*unit();pose(MAO,MB);MAO.blinkOn=true;MAO.nb=0;}}
  }else if(!p.down||!inside||S.input){press[i]=null;if(release[i]){release[i]=false;suppress[i]=now()+.25;restore(c);move(c.st,"sy",1,.2);move(S,"spoonX",0,.2);move(S,"trayTilt",0,.2);if(i===0)G.sfx("chop");}}
 })});
}
function eggs(){clearEggs();S.main=S.mode!=="result";MAO.blinkOn=REN.blinkOn=true;
 S.eggs.push(G.hot({follow:S.bun},function(){if(S.input||!S.bunGiven||now()-S.lastEgg<8)return;S.lastEgg=now();var x=S.bun.at.x;G.anim(.38,function(p){S.bun.at.x=x+Math.sin(p*Math.PI)*6*unit()},0,function(){S.bun.at.x=x});event("bun-reminder");},{id:"k-bun-reminder",label:"包子盘"}));
 if(S.dome.on)S.eggs.push(G.hot({follow:S.dome},function(){if(S.input||S.eggBusy)return;S.eggBusy=true;G.sfx("chop");pulse(REN,-1,0);G.anim(.4,function(p){S.dome.st.y=-Math.sin(p*Math.PI)*3*unit()},0,function(){S.dome.st.y=0;S.eggBusy=false});pulse(MAO,1,0)},{id:"k-dome-peek",label:"银罩"}));
 if(S.noodles){var r=steamBox();r.h=Math.max(44,r.h);
  var steam=G.rub(r,{mode:"wipe",need:28*unit(),id:"k-steam",label:"蒸汽",pulse:false,onMove:function(p,x){if(!S.input)S.steamBend=G.clamp(x-(S.bowl.x+S.bowl.w/2),-16*unit(),16*unit())},done:function(){S.steamBend=0;G.sfx("chop");pulse(MAO,1,0);}});steam.need=false;steam.el.removeAttribute("data-need");S.eggs.push(steam);
  S.eggs.push(G.hot({rect:function(){return S.bowl}},function(){if(S.input||S.eggBusy)return;S.eggBusy=true;pose(MAO,MT);pulse(MAO,1,0);G.sched(.55,function(){restore(MAO);S.eggBusy=false})},{id:"k-smell",label:"闻一闻汤"}));}
 if(S.dropDone){S.plate=box(G.W()*.83,S.cy+17*unit(),48*unit(),24*unit());var rag=prop("rag","rag",26,G.W()*.70,S.cy+40*unit());
  var polish=G.drag(rag,S.plate,function(){G.hide(rag);S.shine=1;S.plateUp=4*unit();pulse(REN,-1,0);pulse(MAO,1,0);G.sched(.6,function(){move(S,"plateUp",0,.24);move(S,"shine",0,.3)})},{id:"k-polish",label:"擦亮空盘",need:false,onMove:function(x,y){rag.at.x=G.clamp(x,28*unit(),G.W()-28*unit());rag.at.y=G.clamp(y,S.tableY+26*unit(),G.bottom()-24*unit())}});polish.el.style.zIndex="30";S.eggs.push(polish);
  if(S.side==="toast"){G.show(S.dome,"dome",{x:G.W()*.18,y:S.cy-28*unit(),shadow:false});G.safeProp({x:S.dome.at.x-1,y:S.dome.at.y-1,w:2,h:1},S.dome);S.eggs.push(G.hot({follow:S.dome},function(){if(S.eggBusy)return;S.eggBusy=true;S.sideAction="toast";S.domeBox=box(S.dome.at.x,S.dome.at.y-20*unit(),60*unit(),64*unit());G.anim(.5,function(p){S.dome.st.y=-Math.sin(p*Math.PI)*30*unit()},0,function(){S.dome.st.y=0;S.sideAction=null;S.eggBusy=false})},{id:"k-dome-again",label:"再看一眼吐司"}));}}
}
function opening(v,fast,T){var d=draft();
 if(!d.bunGiven){T.beat(.45,function(){REN.blinkOn=MAO.blinkOn=false;REN.ba=MAO.ba=0;REN.st.x=24*unit();move(REN.st,"x",0,.45);S.scroll=.6;G.sfx("paper");G.arrive(REN,"壬氏");});
  say(T,REN,G.time().past?"这碗面，是贺店长生辰——":"今日是店长生辰——",function(){S.scroll=1;});
  say(T,MAO,"递一下。",function(){S.maoPose=MO;pose(MAO,MO);S.bun.at.x+=6*unit();G.arrive(MAO,"猫猫");});
  T.ask(bunInput);say(T,MAO,"吃你的。",function(){MAO.ba=REN.ba=.005});
 }
 if(!d.noodles){say(T,MAO,"拉长点。",function(){S.maoPose=MB;pose(MAO,MB);S.renPose=RT;pose(REN,RT);S.board=1;S.boardShift=-12*unit();move(S,"boardShift",0,.3)});
  T.ask(pullInput);say(T,MAO,"够了。");}
 say(T,MAO,"配什么？");T.call(eggs);
}
function soupPlay(v,fast,T){say(T,MAO,"热的，慢点。",function(){S.lid=1;S.lidTurn=-1;pulse(REN,-1,0);G.sched(.18,function(){pulse(MAO,1,1);move(S,"lidTurn",1,.26)})});T.call(function(){S.lid=0})}
function toastPlay(v,fast,T){say(T,MAO,"排场比它大。",function(){pose(REN,RT);pulse(REN,-1,-2)})}
function tasteIntro(v,fast,T){say(T,REN,"这回，我来帮。",function(){S.spoon=1;S.spoonOwner=REN;S.renPose=RT;pose(REN,RT)});say(T,MAO,"一小口。",function(){S.spoonOwner=MAO;S.spoonX=-4*unit();pulse(MAO,1,1)});T.call(eggs)}
function maoTaste(v,fast,T){T.beat(.45,function(){silence();S.dish=1;S.spoon=1;S.spoonOwner=MAO;S.maoPose=MT;pose(MAO,MT);S.spoonY=-5*unit();move(S,"spoonY",0,.35);});
 say(T,REN,"一小口。",function(){var from=G.hand(MAO,.53,.52),to=G.hand(REN,.32,.407);S.dishPoint={x:from.x,y:from.y};S.dishUp=12*unit();G.anim(.35,function(p){S.dishPoint.x=from.x+(to.x-from.x)*p;S.dishPoint.y=from.y+(to.y-from.y)*p},0,function(){S.dishPoint=null;S.dishOwner=REN});pulse(REN,-1,1);pulse(MAO,-1,0)});
 say(T,MAO,"端走。",function(){S.tray.x-=8*unit();S.dish=0;S.spoon=0;S.renPose=RT;pose(REN,RT)});}
function renTaste(v,fast,T){T.beat(.4,function(){silence();S.dish=1;S.spoon=1;S.spoonOwner=REN;S.spoonY=-4*unit();move(S,"spoonY",0,.3);});
 say(T,REN,"此面——",function(){S.renPose=RB;pose(REN,RB);REN.blinkOn=true;REN.nb=0;});
 say(T,MAO,"好吃就端。",function(){S.dish=0;S.spoon=0;S.renPose=RT;pose(REN,RT);S.tray.x-=8*unit();move(S.tray,"x",G.W()*.72-S.tray.w/2,.3);pulse(MAO,1,1)});}
function serve(v,fast,T){say(T,MAO,"这碗，慢慢吃。",function(){S.renPose=RT;pose(REN,RT);S.spoon=S.taster==="mao"?1:0;S.spoonOwner=MAO;});T.ask(serveInput);
 say(T,REN,"……不说了。",function(){S.scroll=.3;S.bun.at.x+=8*unit();pulse(MAO,0,1);G.sched(.2,function(){S.scroll=.12;restore(REN)})});T.call(eggs);}
G.zone({room:"k",name:"厨房",nodes:["K3","K4","K5"],first:"K3",bg:"bg-kitchen",fit:.69,rows:{},resultsNoList:true,
 results:function(v,D){scene(v,D,"result");eggs();}});
G.node("K3",{room:"k",bg:"bg-kitchen",fit:.69,q:"",setup:function(v,D){scene(v,D,"choose")},enter:opening,options:function(){return[
 {id:"soup",label:"多一点汤",pre:soupPre,play:soupPlay,next:"K4"},
 {id:"toast",label:"配一片吐司",pre:toastPre,play:toastPlay,next:"K4"}]}});
G.node("K4",{room:"k",bg:"bg-kitchen",fit:.69,q:"",setup:function(v,D){scene(v,D,"choose");G.hide(S.dome)},enter:tasteIntro,options:function(){return[
 {id:"mao",label:"猫猫先尝",pre:tastePre("mao"),play:maoTaste,next:"K5"},
 {id:"ren",label:"壬氏先尝",pre:tastePre("ren"),play:renTaste,next:"K5"}]}});
G.node("K5",{room:"k",bg:"bg-kitchen",fit:.69,q:"",setup:function(v,D){scene(v,D,"serve")},enter:serve,options:function(){return[
 {id:"carry",label:"把面带回柜台",free:true,next:null}]}});
})();
