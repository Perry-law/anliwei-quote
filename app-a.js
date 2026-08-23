/* Anliweijie V4.0 price tables and quote() */
const PRICE = {
  base: {9:[220,250], 12:[260,290], 18:[330,360], 22:[360,390], 25:[390,420], 40:[null,600]},
  multiLayer: {18:[360,390], 22:[390,420]},
  screen: {1830:1200, 3050:1500},
  paint: {single:[0,30,100], double:[0,60,180]},
  veneer: {1:[25,50], 2:[50,100], 3:[75,150], 4:[100,200], 5:[580,1160]},
  craft: {yixing:0.2, chiban:0.2, geshan:1.5, limian:2.5},
  boneLine:150, paintLine:80,
  addons:[
    {name:'J型 / U型免拉手', unit:'个', price:80},
    {name:'45度斜边拉手 / R角', unit:'个', price:80},
    {name:'柜门打门铰孔', unit:'扇', price:20},
    {name:'极简拉直器', unit:'条', price:100},
    {name:'客供拉直器', unit:'条', price:60},
    {name:'不锈钢金属条', unit:'m', price:80, minOne:true},
    {name:'铝合金金属条', unit:'m', price:20, minOne:true},
    {name:'灯槽 / 海棠角', unit:'个', price:10},
    {name:'超白玻璃门', unit:'扇', price:100},
    {name:'长虹玻璃门', unit:'扇', price:150}
  ]
};
const VENEER_HINT = {
  1:'卡斯拉、沙比利、奥古曼',
  2:'科技木皮、山纹红橡、水曲柳',
  3:'山纹樱桃、直纹红橡、山纹白橡',
  4:'直纹樱桃、山纹柚木、黑胡桃、山纹花梨、直纹白橡、榆木',
  5:'染色枫影（影木）'
};
const STEPS = [
  {id:'type', name:'类型'},
  {id:'thick', name:'厚度'},
  {id:'side', name:'面数'},
  {id:'board', name:'基材'},
  {id:'paint', name:'油漆'},
  {id:'veneer', name:'木皮'},
  {id:'craft', name:'造型'},
  {id:'line', name:'线条'},
  {id:'size', name:'尺寸'},
  {id:'extra', name:'附加'}
];
const state = {
  type:'', thick:null,
  crafts:{flat:false, yixing:false, chiban:false, geshan:false, limian:false},
  side:'double', upgrade:0, extraLong:false,
  paint:0, paintSide:'auto',
  veneer:0, line:'none', lineCnt:1,
  w:0, h:0, qty:1, drawerBox:false,
  addons:PRICE.addons.map(()=>0),
  tax:false
};
let step = 0;
let lastQuote = null;
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.style.display='block';
  clearTimeout(toast._t); toast._t=setTimeout(()=>t.style.display='none',1600);
}
function isScreen(t){ t = (t===undefined)?state.thick:t; return t===1830 || t===3050; }
function boardSideIndex(){ return state.side==='single'?0:1; }
function paintSideKey(){
  if(state.paintSide==='auto') return state.side==='single'?'single':'double';
  return state.paintSide;
}
function visibleSteps(){
  return STEPS.map((s,i)=>({s,i})).filter(({s})=>{
    if(s.id==='side' && Number(state.thick)===40) return false;
    return true;
  });
}
function sizeFactor(h,w){
  if(h>=3000 && w>1200) return 1.5;
  if(h>=3000) return 1.3;
  if(h>2400 && w>1200) return 1.3;
  if(h>2400) return 1.15;
  if(w>1200) return 1.15;
  return 1.0;
}
function minBillArea(s){
  s = s || state;
  if(s.crafts && s.crafts.limian) return 0.5;
  if(s.type==='door' || (s.crafts && s.crafts.geshan)) return 0.3;
  return 0.1;
}
function quote(st){
  const s = st || state;
  const steps=[];
  const warns=[];
  const t = s.thick;
  if(t==null || !s.type) return null;
  const si = (t===40 || s.side!=='single') ? 1 : 0;
  const sideTxt = si===0?'单面':'双面';
  let base, baseNote, up = s.upgrade;
  if(t===1830 || t===3050){
    base = PRICE.screen[t];
    baseNote = '屏风 ' + (t===1830?'18-30':'30-50') + 'mm ' + base;
    if(up===30) up = 0;
  } else if(t===40){
    base = 600;
    baseNote = '40mm 平板门 双面 600';
    if(up===30) up = 0;
  } else if(up===30 && PRICE.multiLayer[t]){
    base = PRICE.multiLayer[t][si];
    baseNote = t + 'mm 多层实木（已含+30）' + sideTxt + ' ' + base;
    up = 0;
  } else {
    const row = PRICE.base[t];
    if(!row || row[si]==null) return null;
    base = row[si];
    baseNote = t + 'mm ' + sideTxt + ' ' + base;
  }
  let sub = base;
  steps.push('板基 ' + baseNote);
  if(up>0){ sub += up; steps.push('基材升级 +' + up); }
  if(s.extraLong){ sub += 150; steps.push('加长费 +150'); }
  const pSide = (s.paintSide==='auto') ? (s.side==='single'?'single':'double') : s.paintSide;
  const paintAmt = PRICE.paint[pSide][s.paint];
  const pn = ['油性肤感哑光','水性肤感哑光','高光漆'];
  sub += paintAmt;
  if(paintAmt>0) steps.push('油漆 ' + pn[s.paint] + ' ' + (pSide==='single'?'单面':'双面') + ' +' + paintAmt);
  else steps.push('油漆 ' + pn[s.paint] + ' +0');
  if(s.veneer>0){
    const veneerAmt = PRICE.veneer[s.veneer][si];
    sub += veneerAmt;
    steps.push('木皮 ' + s.veneer + '类 ' + sideTxt + ' +' + veneerAmt);
  }
  if(s.line==='bone' && s.veneer>0){
    const bone = PRICE.boneLine * s.lineCnt;
    sub += bone;
    steps.push('木皮骨骼线 ' + s.lineCnt + '圈 +' + bone);
  }
  let mult = 1;
  const cp = [];
  if(s.crafts.yixing){ mult += PRICE.craft.yixing; cp.push('平面异形 +0.2'); }
  if(s.crafts.chiban){ mult += PRICE.craft.chiban; cp.push('池板 +0.2'); }
  if(s.crafts.geshan){ mult += PRICE.craft.geshan; cp.push('格栅 +1.5'); }
  if(s.crafts.limian){ mult += PRICE.craft.limian; cp.push('立面异形 +2.5'); }
  if(!cp.length) cp.push('平板');
  let unit = sub * mult;
  steps.push('工艺 x' + mult.toFixed(2) + '（' + cp.join(' / ') + '）');
  if(s.line==='paintline'){
    const pl = PRICE.paintLine * s.lineCnt;
    unit += pl;
    steps.push('烤漆扣线 ' + s.lineCnt + '圈 +' + pl + '（倍率后）');
  }
  const H = Number(s.h)||0, W = Number(s.w)||0, qty = Math.max(1, Number(s.qty)||1);
  const sized = !!(s.drawerBox || (W>0 && H>0));
  let sizeM = 1, rawArea = 1, minA = 1, area = 1;
  if(s.drawerBox){
    sizeM = 1; rawArea = qty; minA = 1; area = qty;
  } else if(sized){
    sizeM = sizeFactor(H, W);
    rawArea = (H*W/1e6)*qty;
    minA = minBillArea(s);
    area = Math.max(rawArea, minA);
    if(area>rawArea+1e-9) steps.push('最小计价 ' + minA + '㎡');
    if(sizeM>1) steps.push('尺寸系数 x' + sizeM);
  } else {
    steps.push('面积未填，合计按 1㎡ 试算');
  }
  if(s.upgrade===30 && !isScreen(t) && t!==40 && H>1200) warns.push('多层实木柜门限高 1200mm');
  if(s.upgrade===280 && H>3500) warns.push('铝蜂窝柜门限高 3500mm');
  if(s.upgrade===100 && t!==22) warns.push('进口欧松仅 22mm 柜门');
  let addonTotal = 0;
  const ads = [];
  PRICE.addons.forEach(function(a,i){
    let q = Number(s.addons[i])||0;
    if(q>0 && a.minOne && q<1) q = 1;
    if(q>0){ addonTotal += q*a.price; ads.push(a.name + ' x' + q + ' = ' + (q*a.price)); }
  });
  if(addonTotal>0) steps.push('附加 ' + ads.join('；'));
  let total = unit * area * sizeM + addonTotal;
  if(s.tax){ total *= 1.1; steps.push('开票税点 x1.1'); }
  steps.push('不含运费。未开票不含税。');
  return {unit:unit, total:total, area:area, sizeM:sizeM, minA:minA, steps:steps, warns:warns, sized:sized};
}
function typeLabel(){
  return {door:'柜门 / 门板', wall:'墙板 / 木饰面', screen:'屏风 / 整板', back:'背板 / 底板'}[state.type]||'';
}
function pickedText(){
  const p=[];
  if(state.type) p.push(typeLabel());
  if(state.thick===1830) p.push('屏风 18-30mm');
  else if(state.thick===3050) p.push('屏风 30-50mm');
  else if(state.thick) p.push(state.thick+'mm');
  const c=[];
  if(state.crafts.yixing) c.push('平面异形');
  if(state.crafts.chiban) c.push('池板');
  if(state.crafts.geshan) c.push('格栅');
  if(state.crafts.limian) c.push('立面异形');
  if(c.length) p.push(c.join('+'));
  else if(state.crafts.flat) p.push('平板');
  if(state.thick!==40) p.push(state.side==='single'?'单面板基':'双面板基');
  return p.join('  /  ');
}
function renderProgress(){
  const vis = visibleSteps();
  const idx = vis.findIndex(function(v){return v.i===step;});
  const n = Math.max(0, idx)+1;
  document.getElementById('crumbStep').textContent = n+' / '+vis.length;
  document.getElementById('crumbName').textContent = STEPS[step].name;
  document.getElementById('progFill').style.width = (n/vis.length*100)+'%';
  const pk = document.getElementById('picked');
  const t = pickedText();
  pk.textContent = t; pk.classList.toggle('show', !!state.type);
  const prev = document.getElementById('btnPrev');
  prev.hidden = idx<=0;
  prev.disabled = idx<=0;
  document.getElementById('btnNext').textContent = (idx===vis.length-1)?'完成':'下一步';
}
function optHtml(sel, name, hint, price, extraCls, attrs){
  return '<button type="button" class="opt ' + (extraCls||'') + ' ' + (sel?'sel':'') + '" ' + (attrs||'') + '>' +
    '<span class="mark"></span>' +
    '<span><span class="name">' + name + '</span>' + (hint?'<div class="hint">' + hint + '</div>':'') + '</span>' +
    '<span class="price">' + (price||'') + '</span></button>';
}
function thickOpts(){
  const t = state.type;
  if(t==='door') return [[18,'18mm','常用，柜门墙板通用',360],[22,'21 / 22mm','加厚柜门',390],[25,'25mm','超厚柜门',420],[40,'40mm 平板门','仅双面，可加铝蜂窝',600]];
  if(t==='wall') return [[9,'9mm','薄墙板',250],[12,'12mm','标准墙板',290],[18,'18mm','常用墙板',360],[22,'21 / 22mm','加厚墙板',390]];
  if(t==='screen') return [[1830,'屏风 18-30mm','整板屏风，已含多层基材',1200],[3050,'屏风 30-50mm','加厚屏风，已含多层基材',1500]];
  return [[9,'9mm','标准背板',250],[12,'12mm','加厚背板',290]];
}
function boardOpts(){
  const t = Number(state.thick);
  const opts = [];
  if(!isScreen() && t!==40){
    opts.push([0,'E0 高密度板 / ENF 欧松板','两种同价，免费互选','基准']);
    opts.push([30,'E0 实木多层板','柜门限高 1200mm','+30']);
  } else {
    opts.push([0,'E0 实木多层板（屏风 / 40mm 已含）','基价已按多层计','已含']);
  }
  if([18,22,25].includes(t) || isScreen()){
    opts.push([130,'实木定型板（<=2700mm）','高柜更稳','+130']);
    opts.push([150,'实木定型板（2700-3200mm）','超高门板','+150']);
  }
  if([18,22,25,40].includes(t)) opts.push([280,'抗变形铝蜂窝','双面，可到 3500mm','+280']);
  if(t===22 && state.type==='door') opts.push([100,'进口欧松板 / 桦木海洋板','仅 22mm 柜门','+100']);
  return opts;
}
