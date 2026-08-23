function paint(){
  const q = quote();
  lastQuote = q;
  const unitEl = document.getElementById('unitEl');
  const totalEl = document.getElementById('totalEl');
  const areaEl = document.getElementById('areaEl');
  if(!q){
    unitEl.textContent = '--';
    totalEl.textContent = '--';
    areaEl.textContent = '先选完类型和厚度';
    return;
  }
  unitEl.textContent = Math.round(q.unit);
  totalEl.textContent = Math.round(q.total);
  areaEl.textContent = q.sized
    ? `计费 ${q.area.toFixed(2)}㎡  × 尺寸 ${q.sizeM}`
    : '按 1㎡ 试算，尺寸最后再填';
  const sizeNote = document.getElementById('sizeNote');
  if(sizeNote){
    sizeNote.textContent = state.drawerBox
      ? `内抽盒 ${state.qty} 个 = ${state.qty}㎡，尺寸系数 ×1.0`
      : (q.sized
        ? `面积 ${(state.w*state.h/1e6*state.qty).toFixed(3)}㎡，计费 ${q.area.toFixed(2)}㎡，尺寸系数 ×${q.sizeM}`
        : '还没填尺寸，下面合计先按 1㎡。填宽高后会改。');
  }
  const sizeWarn = document.getElementById('sizeWarn');
  if(sizeWarn){
    sizeWarn.textContent = q.warns.join(' ');
    sizeWarn.classList.toggle('show', q.warns.length>0);
  }
  const bill = document.getElementById('bill');
  if(bill) bill.textContent = q.steps.join('\n');
}

function canLeave(){
  const id = STEPS[step].id;
  if(id==='type' && !state.type){ toast('请先选产品类型'); return false; }
  if(id==='thick' && state.thick==null){ toast('请先选厚度'); return false; }
  if(id==='craft'){
    const c = state.crafts;
    const any = c.flat || c.yixing || c.chiban || c.geshan || c.limian;
    if(!any){ toast('请选门板造型。没有造型请点平板'); return false; }
  }
  return true;
}
function go(delta){
  const vis = visibleSteps();
  const idx = vis.findIndex(v=>v.i===step);
  const next = vis[idx+delta];
  if(!next) return;
  if(delta>0 && !canLeave()) return;
  step = next.i;
  renderCard();
  window.scrollTo(0,0);
}

function copyResult(){
  const q = quote();
  if(!q){ toast('还没算出来'); return; }
  const txt = [
    '【安利威木作报价】',
    pickedText(),
    `单价：${Math.round(q.unit)} 元/㎡`,
    q.sized
      ? `计费面积：${q.area.toFixed(2)}㎡　尺寸系数 ×${q.sizeM}`
      : '计费面积：按 1㎡ 试算（未填尺寸）',
    `合计：${Math.round(q.total)} 元${state.tax?'（含 10% 税点）':'（未税）'}`,
    '---',
    q.steps.join('\n'),
    q.warns.length?('注意：'+q.warns.join(' ')): '',
    '安利威木作 烤漆贴木皮代工',
    '13709661778'
  ].filter(Boolean).join('\n');
  const done = ()=>toast('已复制，可粘到微信');
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(txt).then(done).catch(fallback);
  } else fallback();
  function fallback(){
    const ta=document.createElement('textarea'); ta.value=txt;
    ta.style.position='fixed'; ta.style.left='-9999px';
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); done(); }catch(e){ toast('复制失败，请长按明细手抄'); }
    ta.remove();
  }
}

document.getElementById('btnPrev').onclick = ()=>go(-1);
document.getElementById('btnNext').onclick = ()=>go(1);
document.getElementById('btnCopy').onclick = copyResult;

function caseState(over){
  const s = {
    type:'door', thick:18, crafts:{flat:false,yixing:false,chiban:false,geshan:false,limian:false},
    side:'double', upgrade:0, extraLong:false, paint:0, paintSide:'double',
    veneer:0, line:'none', lineCnt:1, w:600, h:2400, qty:1, drawerBox:false,
    addons:PRICE.addons.map(()=>0), tax:false
  };
  Object.assign(s, over);
  if(over.crafts) s.crafts = Object.assign({flat:false,yixing:false,chiban:false,geshan:false,limian:false}, over.crafts);
  return s;
}
const CASES = {
  A:{expect:1008, st:caseState({thick:18,side:'double',veneer:4,upgrade:130,line:'bone',crafts:{yixing:true}})},
  B:{expect:1610, st:caseState({thick:22,side:'double',veneer:5,paint:1,paintSide:'double'})},
  C:{expect:490,  st:caseState({thick:22,side:'double',paint:2,paintSide:'single'})},
  D:{expect:360,  st:caseState({thick:18,side:'double'})},
  E:{expect:600,  official:700, note:'E official 700 engine 600',
     st:caseState({thick:25,side:'double',paint:2,paintSide:'double'})},
  F:{expect:435,  official:535, note:'F extra +100',
     st:caseState({thick:18,side:'single',veneer:3,upgrade:30})},
  G:{expect:390,  st:caseState({thick:18,side:'double',paint:1,paintSide:'single'})},
  H:{expect:880,  st:caseState({thick:40,side:'double',upgrade:280})},
  I:{expect:1730, official:1830, note:'I extra +100',
     st:caseState({thick:18,side:'double',veneer:5,paint:1,paintSide:'double',line:'bone'})},
  J:{expect:250,  official:350, note:'J extra +100',
     st:caseState({type:'back',thick:9,side:'double'})},
  K:{expect:500,  st:caseState({thick:12,side:'double',upgrade:150,paint:1,paintSide:'double'})},
  L:{expect:620,  st:caseState({thick:22,side:'double',veneer:4,paint:1,paintSide:'single'})},
  M:{expect:660,  st:caseState({thick:18,side:'double',upgrade:150,extraLong:true})},
  N:{expect:490,  official:550, note:'N/V duplicate',
     st:caseState({thick:22,side:'double',paint:2,paintSide:'single'})},
  O:{expect:1800, st:caseState({thick:18,side:'double',veneer:5,upgrade:280})},
  P:{expect:1200, st:caseState({type:'screen',thick:1830,side:'double'})},
  Q:{expect:900,  st:caseState({thick:18,side:'double',crafts:{geshan:true}})},
  R:{expect:1260, st:caseState({thick:18,side:'double',crafts:{limian:true}})},
  S:{expect:432,  st:caseState({thick:18,side:'double',crafts:{yixing:true}})},
  T:{expect:385,  st:caseState({thick:18,side:'single',veneer:1,paint:1,paintSide:'single'})},
  U:{expect:315,  st:caseState({thick:12,side:'single',veneer:1,paint:1,paintSide:'single'})},
  V:{expect:490,  official:550, note:'same as N',
     st:caseState({thick:22,side:'double',paint:2,paintSide:'single'})},
  W:{expect:300,  st:caseState({thick:9,side:'single',veneer:2,paint:1,paintSide:'single'})},
  X:{expect:1910, st:caseState({type:'screen',thick:3050,side:'double',upgrade:150,veneer:4,paint:1,paintSide:'double'})}
};
function runCases(){
  const out = [];
  Object.keys(CASES).forEach(k=>{
    const c = CASES[k];
    const q = quote(c.st);
    const got = q ? Math.round(q.unit) : null;
    out.push({k, got, expect:c.expect, official:c.official||c.expect, ok: got===c.expect, note:c.note||''});
  });
  console.table(out);
  return out;
}
window.ANLIWEI = {PRICE, quote, runCases, state, CASES};
renderCard();
