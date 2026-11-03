/* 文具柜 W1–W6。只保存实际选择和动作，封带完成才交货。 */
(function () {
"use strict";
var RAB = G.ch.RAB, BOY = G.ch.BOY;
var BG = "bg-stationery", FONT = '"S","Songti SC",serif';
var scene, props = {};
var KIT = {write:["pen", "book"], stick:["stickers", "tape"]};
var ITEM = {pen:"st1", book:"st9", stickers:"st5", tape:"st4"};
var FACE = {
  rabA1:[.18,.35,.65,.29], "w2-rab-hold":[.18,.35,.65,.29],
  boy1:[.20,.23,.57,.22], eBoy:[.20,.23,.57,.22],
  "w2-boy-sleeve":[.21,.23,.56,.23], "w2-boy-remember":[.20,.23,.57,.22],
  "w2-boy-listen":[.17,.23,.62,.23]
};
function px(n) { return n * G.W() / 390; }
function draft() { return G.roomView("w").draft; }
function save(patch) { return G.roomDraft("w", patch).draft; }
function layer(c, name) {
  c.layer = name;
  c.el.style.zIndex = String(parseInt(name.slice(1), 10));
  return c;
}
function prop(key, pose, height, name) {
  var c = G.mk("w2-" + key, {pose:pose, frac:height});
  G.pose(c, pose);
  props[key] = c;
  layer(c, name || "L40");
  return c;
}
function setPose(c, pose) {
  G.pose(c, pose);
  c.faces = c.faces || {};
  if (FACE[pose]) c.faces[pose] = FACE[pose];
}
function place(c, x, y) {
  G.show(c, c.pose, {x:x, y:y, shadow:true});
  layer(c, c.layer || "L40");
}
function center(c, x, y) {
  var p = G.hand(c, .5, .5);
  c.at.x += x - p.x;
  c.at.y += y - p.y;
}
function nudge(c, angle, distance) {
  G.tw(c.st, "r", angle, .12, 0, G.eout);
  G.tw(c.st, "r", 0, .22, .16, G.eout);
  G.tw(c.st, "x", px(distance || 0), .12, 0, G.eout);
  G.tw(c.st, "x", 0, .22, .16, G.eout);
}
function stopSmall() {
  scene.busyUntil = scene.clock + .7;
  scene.motion++;
  scene.tail=0;scene.lidCatch=0;
  if(props.ruler){props.ruler.st.r=0;props.eraser.st.y=0;}
  var d=draft();
  setPose(RAB,d.sealed||(d.packed||[]).length===2?"w2-rab-hold":"rabA1");
  setPose(BOY,d.sealed?"w2-boy-remember":"boy1");
  [RAB, BOY].forEach(function (c) {
    c.st.r = c.st.x = c.st.y = 0;
    c.st.sx = c.st.sy = 1;
  });
}
function quiet() { return scene.mode === "idle" && !scene.line && !scene.egg && scene.clock >= scene.busyUntil; }
function paper(text) {
  scene.line = true;
  var e = G.note(RAB, text);
  /* 大牌只在文字带上移十五像素，不能从手中穿过脸。 */
  var x = (G.W() - e.el.offsetWidth) / 2;
  var y = Math.max(G.top() + 8, G.H() * .10);
  e.x = x; e.y = y + px(15); e.s = 1; e.r = -4; e.a = 0;
  G.tw(e, "x", x, .18); G.tw(e, "y", y, .18);
  G.tw(e, "s", 1, .18); G.tw(e, "r", 0, .18); G.tw(e, "a", 1, .12);
  nudge(RAB, -1, 0);
  return e;
}
function say(text) { scene.line = true; return G.say(BOY, text); }
function clearLine() { G.sayOff(); scene.line = false; }
function ready() { clearLine(); scene.mode="idle"; }
function line(T, who, text, action) {
  T.beat(.22, function () {
    stopSmall();
    if (action) action();
    if (who === RAB) paper(text); else say(text);
  });
}
function sealMark(k, x, y, angle, size) {
  k.save(); k.translate(x, y); k.rotate(angle * Math.PI / 180);
  k.strokeStyle = k.fillStyle = "#ba382c"; k.lineWidth = px(1.5);
  k.strokeRect(-size, -size * .55, size * 2, size * 1.1);
  k.font = '700 ' + size * .8 + 'px ' + FONT;
  k.textAlign = "center"; k.textBaseline = "middle"; k.fillText("有货", 0, 0);
  k.restore();
}
function rect(x, y, w, h) { return {x:x, y:y, w:w, h:h}; }
function slot(i) { return rect(G.W() * (.405 + i * .105), scene.boxY - G.H() * .084, G.W() * .085, G.H() * .055); }
function itemHome(i) { return {x:G.W() * (i ? .79 : .21), y:scene.boxY - px(10)}; }
function labelRect() { return rect(G.W() * .35, scene.boxY + px(8), G.W() * .30, px(28)); }
function sleevePoint() { return G.hand(BOY, .66, .55); }
function handTarget() {
  var h = G.hand(RAB, .72, .75);
  return rect(h.x - px(22), h.y - px(12), px(44), px(32));
}
function showItems(kit, packed) {
  ["pen", "book", "stickers", "tape"].forEach(function (name) {
    var c = props[name], index = KIT[kit || "write"].indexOf(name);
    place(c, 0, 0);
    if (!kit) {
      center(c, G.W() * ({pen:.16, book:.28, stickers:.72, tape:.84}[name]), scene.boxY - px(8));
      c.st.sx = c.st.sy = .72;
    } else if (index < 0) {
      center(c, G.W() * (name === "pen" || name === "stickers" ? .12 : .87), scene.boxY - px(65));
      c.st.sx = c.st.sy = .55; c.st.a = .35;
    } else if (packed.indexOf(name) >= 0) {
      var r = slot(index);
      center(c, r.x + r.w / 2, r.y + r.h / 2);
      c.st.sx = c.st.sy = .76;
    } else {
      var p = itemHome(index); center(c, p.x, p.y);
    }
  });
}
function drawScene(k) {
  var s = scene, d = s.result || draft(), label = labelRect();
  if (s.task) {
    k.fillStyle = "#fff0cd"; k.fillRect(G.W() * .38, G.H() * .30, G.W() * .24, px(27));
    k.fillStyle = "#543b25"; k.font = '700 ' + px(16) + 'px ' + FONT;
    k.textAlign = "center"; k.fillText("一份礼物", G.W() * .50, G.H() * .30 + px(19));
  }
  /* 标签固定在桌前。三件小库存的上沿低于所有脸。 */
  k.save(); k.translate(label.x + label.w / 2 + s.tagShift, label.y + label.h / 2);
  k.rotate(s.tagAngle * Math.PI / 180);
  k.fillStyle = "#f5e9cf"; k.fillRect(-label.w/2, -label.h/2, label.w, label.h);
  k.strokeStyle = "#936b48"; k.lineWidth = 1; k.strokeRect(-label.w/2, -label.h/2, label.w, label.h);
  if (d.stamp) sealMark(k, (d.stamp.x-.5)*(label.w-px(32)), (d.stamp.y-.5)*(label.h-px(18)), d.stamp.angle, px(14));
  else { k.setLineDash([3,3]); k.strokeRect(-px(15), -px(9), px(30), px(18)); }
  k.restore();
  if (s.sleeve) {
    var h = sleevePoint(); sealMark(k, h.x, h.y, -8, px(7));
  }
  if (s.tail > 0) {
    k.fillStyle = "#f3d865"; G.star(k, label.x + label.w - px(3), label.y - s.tail * px(8), px(7));
    var hs = sleevePoint(); k.save(); k.translate(hs.x, hs.y); k.rotate(s.tail * 3 * Math.PI/180);
    G.star(k, 0, 0, px(4)); k.restore();
  }
  if (d.giftKit === "stick") {
    var sticker = props.stickers, h1 = G.hand(sticker,.43,.45), h2 = G.hand(sticker,.72,.58);
    k.fillStyle = "#e394a9"; G.star(k,h1.x,h1.y,px(7)*sticker.st.sx);
    k.fillStyle = "#98b8d7"; G.star(k,h2.x,h2.y,px(5)*sticker.st.sx);
  }
  if (s.tie > 0) {
    var left=G.W()*.37, right=G.W()*.63, top=s.boxY-G.H()*.083;
    var fold=G.W()*.13*s.tie;
    k.fillStyle="#dfbd87";k.strokeStyle="#9a7149";k.lineWidth=px(1);
    k.beginPath();k.moveTo(left,top);k.lineTo(left+fold,top+px(6));
    k.lineTo(left+fold,s.boxY-px(13));k.lineTo(left,s.boxY-px(20));k.closePath();k.fill();k.stroke();
    k.beginPath();k.moveTo(right,top);k.lineTo(right-fold,top+px(6));
    k.lineTo(right-fold,s.boxY-px(13));k.lineTo(right,s.boxY-px(20));k.closePath();k.fill();k.stroke();
    var y = s.boxY - px(12);
    k.strokeStyle = "#c64235"; k.lineWidth = px(3); k.beginPath();
    k.moveTo(G.W()*.38,y); k.lineTo(G.W()*(.38+.25*s.tie),y); k.stroke();
    if (s.tie === 1) { k.beginPath(); k.ellipse(G.W()*.51-px(5),y-px(3),px(7),px(4),-.4,0,Math.PI*2); k.ellipse(G.W()*.51+px(5),y-px(3),px(7),px(4),.4,0,Math.PI*2); k.stroke(); }
  }
  if (s.tie===1) {
    k.fillStyle="#f4e5c5";k.fillRect(G.W()*.40,s.boxY-px(36),G.W()*.20,px(20));
    k.fillStyle="#66462d";k.font='700 '+px(13)+'px '+FONT;k.textAlign="center";
    k.fillText("一份礼物",G.W()*.50,s.boxY-px(21));
  }
  if (s.lidCatch) {
    k.fillStyle="#d8b47c";k.strokeStyle="#987145";
    k.fillRect(G.W()*.22,s.boxY+px(46),px(34),px(8));k.strokeRect(G.W()*.22,s.boxY+px(46),px(34),px(8));
  }
  if (s.clipped) {
    k.strokeStyle="#6e7472";k.lineWidth=px(2);k.strokeRect(G.W()*.855,s.boxY+px(72),px(8),px(14));
  }
  if (s.smallSeal) sealMark(k, G.W()*.12, s.boxY+px(24), 5, px(6));
  if (s.dots) {
    var hp = G.hand(BOY, .95, .57);
    k.fillStyle = "#ede1bf"; k.font = px(20)+'px '+FONT; k.fillText("…",hp.x,hp.y+s.dotsY);
  }
  if (s.stock) {
    k.fillStyle = "#ebc85b";
    for (var i=0;i<3;i++) k.fillRect(G.W()*(.43+i*.055),s.boxY-px(42)-s.stock*px(12),px(8),px(15));
  }
  /* 尺、橡皮、浅槽都是桌边的独立玩具，不取走盒内物。 */
  k.strokeStyle = "#b89670"; k.lineWidth = px(2);
  [0,1].forEach(function(i){k.beginPath();k.moveTo(G.W()*.62,s.boxY+px(49+i*12));k.lineTo(G.W()*.84,s.boxY+px(49+i*12));k.stroke()});
  k.fillStyle = "#f1e4c5"; k.fillRect(G.W()*.73+s.slotPaper, s.boxY+px(56),px(24),px(10));
  if(s.drawerP){
    k.fillStyle="#795130";k.fillRect(G.W()*.68,s.boxY+px(73),G.W()*.16,px(18)*s.drawerP);
    k.strokeStyle="#cbaa6c";k.lineWidth=px(2);k.strokeRect(G.W()*.73,s.boxY+px(77)+px(18)*s.drawerP,px(18),px(5));
  }
  if (s.drawer) drawDrawer(k);
}
function setup(v, D, result) {
  var d = result || draft();
  scene = {clock:0, mode:"main", line:false, egg:false, motion:0, busyUntil:0, lastActor:-10,
    boxY:Math.min(G.H()*.775, G.bottom()-px(104)), task:true, tagShift:0, tagAngle:0,
    tie:d.sealed?1:0, sleeve:d.stampBy==="miffy"&&!!d.stamp, tail:0, smallSeal:false,
    dots:false, dotsY:0, stock:0, slotPaper:0, drawer:0, exam:null, result:result || null};
  G.layoutScene({actors:[
    {actor:RAB,pose:"rabA1",x:.28,y:.72,h:.30,face:FACE.rabA1,layer:"L20"},
    {actor:BOY,pose:"boy1",x:.72,y:.75,h:.37,face:FACE.boy1,layer:"L20"}
  ]});
  [RAB,BOY].forEach(function(c){c.ba=c.ba0=.006;c.sa=c.sa0=0;Object.keys(FACE).forEach(function(p){c.faces=c.faces||{};c.faces[p]=FACE[p]})});
  var table = prop("table","wTable",.35,"L30");
  G.show(table,"wTable",{x:0,y:G.H()*.65,shadow:false}); layer(table,"L30");
  table.st.sx=G.W()/(852*table.k); table.st.sy=G.H()*.35/(668*table.k);
  var stool = prop("stool","stool",.10,"L10"); place(stool,G.W()*.28,G.H()*.83);
  var box = prop("box","boxOpen",.115); place(box,G.W()*.5,scene.boxY);
  prop("front","boxFront",.115); place(props.front,G.W()*.5,scene.boxY);
  ["pen","book","stickers","tape"].forEach(function(n){prop(n,ITEM[n],n==="pen"?.068:.06)});
  var stamp=prop("stamp","prop6",.075); place(stamp,G.W()*.84,scene.boxY-px(42));
  prop("ruler","st7",.025); place(props.ruler,G.W()*.16,scene.boxY+px(60));
  prop("eraser","st6",.017); place(props.eraser,G.W()*.26,scene.boxY+px(48));
  prop("displayPen","st1",.033); place(props.displayPen,G.W()*.57,scene.boxY+px(63));
  showItems(d.giftKit,d.packed||[]);
  /* 前沿必须在装入物之前，物件按规范槽位放置。 */
  props.front.el.parentNode.appendChild(props.front.el);
  G.follow(function(){["box","front","stamp","pen","book","stickers","tape"].forEach(function(n){var c=props[n];if(c.on&&!c.fly)layer(c,"L40");if(c.fly&&c.pr>5/12){var ratio=1.05/(1+.12*c.pr);c.bE.sx*=ratio;c.bE.sy*=ratio;c.pr=5/12;}});});
  G.addPart(null,function(k,t){scene.clock=t;drawScene(k)});
  G.trackVisual("w-label",labelRect,{layer:40});
  G.trackVisual("w-task",rect(G.W()*.38,G.H()*.30,G.W()*.24,px(27)),{layer:70});
  G.trackVisual("w-sleeve",function(){var p=sleevePoint();return scene.sleeve?rect(p.x-px(7),p.y-px(5),px(14),px(10)):rect(0,0,0,0)},{layer:25});
  G.dim(.12,0);
  actors(); eggs();
  if(d.sealed){setPose(RAB,"w2-rab-hold");setPose(BOY,"w2-boy-remember");}
}
/* G.micro 负责跨场释放。区内约束冷却、互斥和按住释放，不另加眨眼。 */
function actors() {
  function install(c, id, seed, idle) {
    var last=-1, lastTimes=[-99,-99,-99], next=5+(seed%6), taps=0, lastWord=-99, press=null, held=false;
    var originalDepth=c.dep, nearSince=0, blockedTapUntil=0;
    var hover=window.matchMedia&&window.matchMedia("(hover: hover)").matches;
    c.dep=0; // 本室只用下面这一条倾斜链，松手后不追旧触点。
    function random(){seed=(seed*48271)%2147483647;return seed/2147483647;}
    function idleTick(){
      if(scene.clock<next||!quiet()||scene.clock-scene.lastActor<1.2)return;
      next=scene.clock+(5+random()*7)*(draft().sealed?2:1);
      var roll=random()*10, choice=roll<3?0:roll<5?1:roll<6?2:-1;
      if(choice<0||choice===last||scene.clock-lastTimes[choice]<20)return;
      last=choice;lastTimes[choice]=scene.clock;scene.lastActor=scene.clock;idle[choice]();
    }
    function poke(){
      c.pkT=-9;
      if(held||scene.clock<blockedTapUntil||scene.mode==="drag")return;
      if(c===RAB)G.squash(c,.03);else nudge(c,-2,0);
      if(!quiet())return;
      taps++;
      if(c===RAB&&taps%3===0&&scene.clock-lastWord>=20){lastWord=scene.clock;paper("忙着呢。");G.nextTap(function(){clearLine()})}
      if(c===BOY&&G.egg("w2-boy-here")){say("……在。");G.nextTap(function(){clearLine()})}
    }
    var m=G.micro(c,{room:"w",id:id,idle:[],poke:poke,events:{
      "item-taking":function(p){if(c===(p.name==="pen"||p.name==="stickers"?RAB:BOY)){setPose(c,c===RAB?"w2-rab-hold":"w2-boy-remember");nudge(c,c===RAB?-2:1,0)}},
      "item-placed":function(p){if(p.count===2){if(c===RAB){G.hop(c,c.at.x,c.at.y,1,.36,px(7),0)}else{G.tw(c.st,"y",px(2),.18);G.tw(c.st,"y",0,.2,.18)}}},
      "stamp-near":function(){if(c===BOY)nudge(c,1,7)},
      "complete":function(){setPose(c,c===RAB?"w2-rab-hold":"w2-boy-remember")}
    }});
    G.follow(idleTick);
    G.follow(function(){
      if(press||scene.mode==="drag"||scene.clock<scene.busyUntil)return;
      var p=G.ptr(), b=G.body(c), margin=px(32);
      var near=(p.down||(hover&&p.live))&&p.x>b.l-margin&&p.x<b.r+margin&&p.y>b.t-margin&&p.y<b.b+margin;
      if(near&&!nearSince)nearSince=scene.clock;
      if(!near)nearSince=0;
      var target=near&&(c===RAB||scene.clock-nearSince>=.1)?G.clamp((p.x-c.at.x)/px(50),-1,1)*(c===RAB?1.5:1):0;
      c.st.r+=(target-c.st.r)*.18;
    });
    var el=document.querySelector('[data-id="'+id+'"]'), listeners=[];
    function listen(target,type,fn){target.addEventListener(type,fn);listeners.push([target,type,fn])}
    function point(e){var p=e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e;return{x:p.clientX,y:p.clientY}}
    function down(e){if(scene.mode==="drag"||press)return;var p=point(e);press={x:p.x,y:p.y,t:scene.clock,pose:c.pose};held=false;}
    function release(cancel){
      if(!press)return;
      var was=held, pose=press.pose;
      if(cancel||scene.clock-press.t>=.28)blockedTapUntil=scene.clock+.3;
      press=null;
      if(was){setPose(c,pose);G.tw(c.st,"sy",1,.2);G.tw(c.st,"r",0,.2);
        if(c===RAB){G.tw(props.stamp.st,"sy",1,.2);if(!cancel){scene.smallSeal=true;G.sfx("stamp")}}
        if(c===BOY){G.tw(scene,"dotsY",px(18),.2);G.sched(.22,function(){scene.dots=false;scene.dotsY=0})}
      }
      if(cancel)held=false;else G.sched(.3,function(){held=false});
    }
    function up(){release(false)}function cancel(){release(true);(scene.cancelToys||[]).forEach(function(fn){fn()})}
    if(el){listen(el,"pointerdown",down);listen(el,"mousedown",down);listen(el,"touchstart",down);}
    ["pointerup","mouseup","touchend"].forEach(function(t){listen(document,t,up)});
    ["pointercancel","touchcancel"].forEach(function(t){listen(document,t,cancel)});listen(window,"blur",cancel);
    G.follow(function(){
      if(!press)return;var p=G.ptr();
      if(Math.abs(p.x-press.x)+Math.abs(p.y-press.y)>px(8)||scene.mode==="drag"){cancel();return}
      if(!held&&scene.clock-press.t>=.35){held=true;if(c===RAB){G.tw(c.st,"sy",.98,.25);G.tw(props.stamp.st,"sy",.98,.25)}else{setPose(c,"w2-boy-listen");scene.dots=true;scene.dotsY=0}}
    });
    var dispose=m.dispose;m.dispose=function(){listeners.forEach(function(l){l[0].removeEventListener(l[1],l[2])});c.dep=originalDepth;dispose()};
  }
  install(RAB,"w-rab",37,[
    function(){nudge(RAB,2,0);G.tw(scene,"tagShift",px(4),.2);G.tw(scene,"tagShift",0,.25,.2)},
    function(){nudge(RAB,-1,0);nudge(props.stamp,5,0)},
    function(){G.squash(RAB,.03);nudge(RAB,0,2)}
  ]);
  install(BOY,"w-boy",101,[
    function(){nudge(BOY,1,0)},
    function(){var token=scene.motion,pose=BOY.pose;setPose(BOY,"w2-boy-listen");G.sched(.5,function(){if(token===scene.motion)setPose(BOY,pose)})},
    function(){nudge(BOY,0,3);nudge(props.displayPen,0,5)}
  ]);
}
function opening(T,D) {
  if(draft().introduced){line(T,BOY,"装哪套？");T.call(ready);return;}
  scene.task=false;G.hide(props.box);G.hide(props.front);G.blink(RAB,false);RAB.ba=0;
  T.beat(.5,function(){
    G.dim(.28,0);G.walkIn(BOY,"boy1",{from:"right",x:G.W()*.72,y:G.H()*.75,dur:.5});
    place(props.box,G.W()*.72,G.H()*.67);
    G.follow(function(){if(scene.carryBox){var h=G.hand(BOY,.50,.70);props.box.at.x=h.x;props.box.at.y=h.y+px(40)}});scene.carryBox=true;
  });
  T.beat(.35,function(){scene.carryBox=false;G.tw(props.box.at,"x",G.W()*.5,.3);G.tw(props.box.at,"y",scene.boxY,.3);scene.task=true;});
  line(T,BOY,D.time.past?"那天是……":"今天是……",function(){G.show(props.front,"boxFront",{x:G.W()*.5,y:scene.boxY});});
  line(T,BOY,"……忘了。",function(){G.blink(BOY,false)});
  line(T,RAB,"嘘。",function(){G.dim(.28,0);G.entry(RAB,"米菲");nudge(RAB,-2,0)});
  T.beat(.35,function(){clearLine();G.dim(.12,.2);G.blink(BOY,true);G.blink(RAB,false);RAB.ba=.006;save({introduced:true});showItems(null,[]);nudge(RAB,2,3);});
  line(T,BOY,"装哪套？");
  T.call(ready);
}
function chooseKit(kit) {
  return function(v,fast,T){
    T.beat(.65,function(){
      clearLine();stopSmall();closeEgg();
      save({giftKit:kit,packed:[],stampBy:null,stamp:null,sealed:false,packedRead:false,stampRead:false});
      showItems(kit,[]);
      if(kit==="write"){
        setPose(BOY,"w2-boy-remember");nudge(props.book,0,-3);
        props.pen.st.r=180;G.tw(props.pen.st,"r",0,.24,.3,G.eout);nudge(RAB,-2,0);
      }else{
        scene.tail=1;setPose(BOY,"w2-boy-sleeve");nudge(RAB,2,0);G.tw(scene,"tail",0,.25,.3);
      }
    });
  };
}
function pack(T) {
  T.ask(function(done){
    var d=draft(), kit=d.giftKit, packed=(d.packed||[]).slice();
    if(packed.length===2){done();return;}
    clearLine();scene.mode="drag";stopSmall();
    KIT[kit].forEach(function(name,i){
      if(packed.indexOf(name)>=0)return;
      var c=props[name], active=false, home={x:props[name].at.x,y:props[name].at.y};
      G.drag(c,slot(i),function(info){
        packed.push(name);save({packed:packed.slice()});
        var r=slot(i);center(c,r.x+r.w/2,r.y+r.h/2);c.st.sx=c.st.sy=.76;
        G.actorEvent("w","item-placed",{name:name,count:packed.length,real:info.real});
        if(packed.length===1){say("差一件。");}
        else{clearLine();scene.mode="main";done();}
      },{id:"w2-item-"+name,label:name==="pen"?"装笔":name==="book"?"装小本":name==="tape"?"装胶带":"装贴纸",pad:6,
        onMove:function(){if(!active){active=true;stopSmall();G.actorEvent("w","item-taking",{name:name})}},
        onMiss:function(){active=false;nudge(BOY,1,0);G.tw(c.at,"x",home.x,.22);G.tw(c.at,"y",home.y,.22)}
      });
    });
  });
  if(!draft().packedRead){
    line(T,RAB,"齐了。",function(){setPose(RAB,"w2-rab-hold")});
    line(T,BOY,"这回没忘。",function(){setPose(BOY,"w2-boy-remember")});
    T.call(function(){save({packedRead:true})});
  }
}
function prepareStamp(T) {
  line(T,RAB,"验收。",function(){G.tw(props.stamp.at,"x",G.W()*.77,.2);nudge(RAB,2,0)});
  line(T,BOY,"盖这儿。",function(){nudge(BOY,1,0)});
  T.call(ready);
}
function stampPre(by) {
  return function(v,fast,done){
    clearLine();stopSmall();closeEgg();scene.mode="drag";
    save({stampBy:by,stamp:null,stampRead:false});
    if(by==="miffy"){G.actorEvent("w","stamp-near",{});setPose(RAB,"w2-rab-hold");}
    else{nudge(RAB,-1,-4);setPose(BOY,"w2-boy-remember");}
    var last={x:props.stamp.at.x,y:props.stamp.at.y},angle=0;
    G.drag(props.stamp,by==="user"?labelRect:handTarget,function(info){
      var stamp={x:by==="user"?G.clamp(info.fx,.08,.92):.5,y:by==="user"?G.clamp(info.fy,.1,.9):.5,
        angle:by==="user"&&info.real?angle:0,assisted:!info.real};
      save({stamp:stamp});scene.mode="main";
      done({stampBy:by,stamp:stamp});
    },{id:by==="user"?"w4-stamp-label":"w4-stamp-miffy",label:by==="user"?"盖章":"把章递给米菲",snap:false,pad:0,
      onMove:function(x,y){var dx=x-last.x,dy=y-last.y;if(Math.abs(dx)+Math.abs(dy)>1)angle=G.clamp(Math.atan2(dx,Math.max(4,Math.abs(dy)))*180/Math.PI,-16,16);last={x:x,y:y};G.actorEvent("w","stamp-near",{})}
    });
  };
}
function stampImpact(T) {
  var d=draft();
  if(d.stampRead)return;
  T.beat(d.stampBy==="miffy"?.65:.35,function(){
    clearLine();stopSmall();
    var st=props.stamp, r=labelRect();
    function hit(){center(st,r.x+r.w/2+(d.stamp.x-.5)*(r.w-px(32)),r.y+r.h/2+(d.stamp.y-.5)*(r.h-px(18)));st.st.r=d.stamp.angle;G.squash(st,.12);G.sfx("stamp");G.tw(props.box.st,"y",px(3),.06);G.tw(props.box.st,"y",0,.18,.06);}
    if(d.stampBy==="miffy"){
      var h=sleevePoint();st.st.sx=st.st.sy=.65;center(st,h.x,h.y);scene.sleeve=true;setPose(BOY,"w2-boy-sleeve");
      G.sfx("stamp");G.sched(.18,function(){nudge(BOY,-1,0)});G.sched(.3,hit);
    }else hit();
    G.sched(d.stampBy==="miffy"?.58:.25,function(){place(st,G.W()*.84,scene.boxY-px(42))});
  });
  if(d.stampBy==="miffy"){
    line(T,BOY,"袖子也有货。");line(T,RAB,"一起验了。");
  }else{
    line(T,BOY,"行。",function(){G.tw(scene,"tagAngle",3,.25);nudge(RAB,2,0)});
  }
  T.call(function(){save({stampRead:true})});
}
function finish(T, resume) {
  stampImpact(T);
  line(T,BOY,"别把盒子忘了。",function(){nudge(BOY,1,6)});
  line(T,RAB,"你先别忘。",function(){nudge(RAB,2,0);G.tw(BOY.st,"x",0,.2);G.tw(props.box.st,"y",px(3),.15);});
  T.ask(function(done){
    scene.mode="drag";stopSmall();
    if(draft().sealed){done();return;}
    var r=rect(G.W()*.36,scene.boxY-px(25),G.W()*.28,px(44));
    G.pull(r,{dir:"right",dist:G.W()*.76*.22,commit:"release",id:"w6-tie",label:"封好礼物",
      onMove:function(p){if(p>.02)clearLine();scene.tie=p;props.front.st.sy=1-p*.12;},
      done:function(info){
        clearLine();scene.tie=1;var d=save({sealed:true,tieAssisted:!info.real});
        G.roomResult("w",{giftKit:d.giftKit,stampBy:d.stampBy,stamp:d.stamp});
        G.sfx("paper");setPose(RAB,"w2-rab-hold");setPose(BOY,"w2-boy-remember");done();
      }
    });
  });
  T.ask(function(done){
    scene.mode="idle";clearLine();
    G.cta("带回柜台",function(){closeEgg();done();});
  });
  if(resume)T.call(function(){G.toHub()});
}
/* 桌边彩蛋都不写主结果。字等下一次点读，选项切换会收起。 */
function closeEgg() {
  scene.egg=false;scene.drawer=0;scene.exam=null;scene.stock=0;
  (scene.cancelToys||[]).forEach(function(fn){fn()});
  (scene.eggHots||[]).forEach(G.unhot);scene.eggHots=[];
  if(scene.drawerClosed)scene.drawerClosed();
}
function eggLine(text, who, next) {
  scene.egg=true;if(who===RAB)paper(text);else say(text);
  G.nextTap(function(){clearLine();if(next)next();else scene.egg=false});
}
function drawDrawer(k) {
  var x=G.W()*.28,y=scene.boxY-px(70),w=G.W()*.44,h=px(100);
  k.fillStyle="#f5e8cc";k.fillRect(x,y,w,h);k.strokeStyle="#906e4f";k.strokeRect(x,y,w,h);
  k.fillStyle="#473425";k.textAlign="center";k.font='700 '+px(16)+'px '+FONT;
  if(scene.drawer===1){k.fillText("别忘了看",x+w/2,y+px(32));k.fillText("这个抽屉。",x+w/2,y+px(54));return;}
  ["21","22"].forEach(function(n,i){k.fillText(n,x+w*(.28+i*.44),y+px(42));});
  if(scene.exam){
    var cx=x+w*(scene.exam==="21"?.28:.72);k.strokeStyle="#c63a2c";k.lineWidth=px(3);k.beginPath();k.moveTo(cx-px(14),y+px(47));k.lineTo(cx-px(14)+px(28)*scene.examInk,y+px(47)-px(20)*scene.examInk);k.stroke();
    if(scene.examInk<1)return;
    k.fillStyle="#c63a2c";k.fillText("18",x+w/2,y+px(66));k.fillText("满分",x+w/2,y+px(88));
  }
}
function eggs() {
  var cooldown={},count=0;
  function allowed(id){if(!quiet()||scene.clock<(cooldown[id]||0))return false;cooldown[id]=scene.clock+.7;return true;}
  G.hot(rect(G.W()*.38,scene.boxY-px(12),G.W()*.24,px(34)),function(){
    if(!allowed("stock"))return;if(++count%3)return;
    scene.stock=1;G.tw(scene,"stock",0,.3,.3);eggLine("库存充足，桌面面积另议。",RAB);
  },{id:"w-box-stock",label:"盒侧"});
  var drawerRec, drawerArea=rect(G.W()*.68,scene.boxY+px(73),G.W()*.16,px(44));
  function armDrawer(){
    G.unhot(drawerRec);
    drawerRec=G.pull(drawerArea,{dir:"down",dist:px(28),id:"w-drawer",label:"抽屉",need:false,
      onMove:function(p){scene.drawerP=p},done:function(){scene.drawerP=0;openDrawer()}});
  }
  function openDrawer(){
    if(!allowed("drawer")){armDrawer();return;}
    scene.drawer=G.egg("w2-drawer-note")?1:2;scene.egg=true;scene.eggHots=[];G.sfx("paper");
    drawerRec=G.hot(drawerArea,function(){closeEgg();clearLine()},{id:"w-drawer",label:"收起抽屉"});
    if(scene.drawer===1){
      eggLine("别忘了看这个抽屉。",RAB,function(){
        eggLine("……看了。",BOY,function(){nudge(RAB,2,0);scene.clipped=true;closeEgg()});
      });
    }else ["21","22"].forEach(function(n,i){
      scene.eggHots.push(G.hot(rect(G.W()*(.32+i*.20),scene.boxY-px(56),G.W()*.16,px(44)),function(){
        if(scene.exam)return;
        scene.exam=n;scene.examInk=0;nudge(RAB,2,0);G.tw(scene,"examInk",1,.45);
        G.sched(.45,function(){G.sfx("stamp")});
        scene.eggHots.forEach(G.unhot);scene.eggHots=[];
      },{id:"w-exam-"+n,label:n}));
    });
  }
  scene.drawerClosed=armDrawer;armDrawer();
  G.follow(function(){if(drawerRec&&!drawerRec.dead)drawerRec.el.style.pointerEvents=scene.drawer||quiet()?"auto":"none";});
  G.hot({rect:function(){var p=sleevePoint();return rect(p.x-px(22),p.y-px(10),px(44),px(44))}},function(){
    if(!scene.sleeve||!allowed("sleeve"))return;nudge(BOY,1,7);nudge(RAB,-2,-4);nudge(props.stamp,0,-6);
  },{id:"w-sleeve",label:"袖口的小章"});
  /* 按住的小玩具使用自己的命中区，移动超过八像素或取消立即复位。 */
  function toy(area,id,start,release){
    var pressing=false, began=0, point0=null, cooling=0;
    var h=G.hot(area,function(){if(quiet()&&scene.clock>=cooling){start(1);G.sched(.18,function(){release(false)});cooling=scene.clock+.7;}},{id:id,label:id==="w-ruler"?"尺子":"标签角"});
    function down(e){if(!quiet()||scene.clock<cooling)return;var p=e.touches&&e.touches[0]||e;pressing=true;began=scene.clock;point0={x:p.clientX,y:p.clientY};}
    h.el.addEventListener("pointerdown",down);h.el.addEventListener("touchstart",down);h.el.addEventListener("mousedown",down);
    scene.cancelToys=scene.cancelToys||[];scene.cancelToys.push(function(){if(pressing){pressing=false;release(true);cooling=scene.clock+.7;}});
    G.follow(function(){if(!pressing)return;var p=G.ptr(),moved=Math.abs(p.x-point0.x)+Math.abs(p.y-point0.y)>px(8);
      if(!p.down||moved||!quiet()){pressing=false;release(moved);cooling=scene.clock+.7;return;}
      start(id==="w-tail"?G.clamp((scene.clock-began-.35)/.2,0,1):1);
    });
  }
  toy({follow:props.ruler},"w-ruler",function(p){scene.lidCatch=p;props.ruler.st.r=-5*p;props.eraser.st.y=-px(8)*p;setPose(RAB,"w2-rab-hold")},function(){G.tw(scene,"lidCatch",0,.2);G.tw(props.ruler.st,"r",0,.2);G.tw(props.eraser.st,"y",0,.2)});
  toy(rect(G.W()*.65,scene.boxY+px(4),px(44),px(44)),"w-tail",function(p){scene.tail=p;if(p>.1)setPose(BOY,"w2-boy-sleeve")},function(){G.tw(scene,"tail",0,.2);if(scene.mode==="idle")setPose(BOY,draft().sealed?"w2-boy-remember":"boy1")});
  function penGame(){
    var c=props.displayPen;
    var rec=G.drag(c,rect(G.W()*.62,scene.boxY+px(43),G.W()*.22,px(28)),function(info){
      var y=scene.boxY+px(info.fy<.5?49:61);center(c,G.W()*.78,y);G.tw(scene,"slotPaper",-px(15),.2);G.tw(scene,"slotPaper",0,.2,.25);nudge(RAB,1,0);nudge(BOY,-1,0);
      /* 展示笔退回桌边，下一次仍有真实的拿起和入槽距离。 */
      G.sched(.7,function(){center(c,G.W()*.57,scene.boxY+px(63));penGame()});
    },{id:"w-display-pen",label:"把展示笔放进浅槽",need:false,pad:6,onMove:function(){scene.busyUntil=scene.clock+.3;},onMiss:function(){nudge(RAB,1,0)}});
    G.follow(function(){if(!rec.dead)rec.el.style.pointerEvents=quiet()?"auto":"none";});
  }
  penGame();
}
G.zone({room:"w",name:"文具柜",nodes:["W2","W4"],first:"W2",bg:BG,fit:.70,
  rows:{"W2.A":{ticket:"礼物装了蓝笔和小本"},"W2.B":{ticket:"礼物装了贴纸和胶带"},
    "W4.A":{ticket:"亲手盖了有货章"},"W4.B":{ticket:"米菲验收，袖子也有货"}},
  resultsNoList:true,
  results:function(v,D){var r=G.roomView("w").result;setup(v,D,r);scene.mode="idle";paper(r.giftKit==="write"?"写写画画，装好了。":"贴贴补补，装好了。");G.nextTap(function(){clearLine()});}
});
G.node("W2",{room:"w",bg:BG,fit:.70,setup:setup,
  enter:function(v,fast,T,D){opening(T,D)},
  options:function(){return[
    {id:"A",label:"写写画画",play:chooseKit("write"),next:"W4"},
    {id:"B",label:"贴贴补补",play:chooseKit("stick"),next:"W4"}
  ]}
});
G.node("W4",{room:"w",bg:BG,fit:.70,setup:setup,
  enter:function(v,fast,T){
    if(draft().stamp&&!v.rooms.w.picks.W4){save({stamp:null,stampBy:null,stampRead:false,sealed:false});scene.sleeve=false;scene.tie=0;}
    if(draft().stamp){finish(T,true);return;}
    pack(T);prepareStamp(T);
  },
  options:function(){if(draft().stamp)return[];return[
    {id:"A",label:"我来盖",pre:stampPre("user"),play:function(v,fast,T){finish(T,false)},next:null},
    {id:"B",label:"米菲来",pre:stampPre("miffy"),play:function(v,fast,T){finish(T,false)},next:null}
  ]}
});
})();
