function renderCard(){
  const id = STEPS[step].id;
  const el = document.getElementById('card');
  let html = '';
  if(id==='type'){
    html = '<h2>您要做哪一类？</h2><p class="desc">先选定品类，后面的厚度和限高会跟着变。</p>'+
      optHtml(state.type==='door','柜门 / 门板','衣柜门、橱柜门，最常见','', '', 'data-k="type" data-v="door"')+
      optHtml(state.type==='wall','墙板 / 木饰面','护墙、背景墙，多数只做单面','', '', 'data-k="type" data-v="wall"')+
      optHtml(state.type==='screen','屏风 / 整板','玄关屏风、装饰整板，1200 元/㎡起','', '', 'data-k="type" data-v="screen"')+
      optHtml(state.type==='back','背板 / 底板','柜子背板、底板，9mm 薄板','', '', 'data-k="type" data-v="back"');
  }
  if(id==='thick'){
    html = '<h2>板厚怎么选？</h2><p class="desc">价格按双面基准价标出，单面会更便宜。</p>'+
      thickOpts().map(function(o){return optHtml(String(state.thick)===String(o[0]), o[1], o[2], o[3]+' 元/㎡', '', 'data-k="thick" data-v="'+o[0]+'"');}).join('');
  }
  if(id==='craft'){
    html = '<h2>门板有没有造型？</h2><p class="desc">没有造型请点第一项。有造型可以多选，加价系数加法叠加。</p>'+
      optHtml(state.crafts.flat,'没有造型 / 平板','平面门板，不加造型费','x1.0', '', 'data-k="craft" data-v="flat"')+
      optHtml(state.crafts.yixing,'平面异形','平面造型、扣线造型门板，单用 x1.2','+0.2', 'check', 'data-k="craft" data-v="yixing"')+
      optHtml(state.crafts.chiban,'池板（回型门）','中间凹池，单用 x1.2','+0.2', 'check', 'data-k="craft" data-v="chiban"')+
      optHtml(state.crafts.geshan,'格栅','竖条格栅，最小计价 0.3㎡，单用 x2.5','+1.5', 'check', 'data-k="craft" data-v="geshan"')+
      optHtml(state.crafts.limian,'立面异形','桶状 / 波浪 / 锥形，最小计价 0.5㎡，单用 x3.5','+2.5', 'check', 'data-k="craft" data-v="limian"');
  }
  if(id==='side'){
    html = '<h2>板基做单面还是双面？</h2><p class="desc">柜门通常双面见光；墙板单面即可。油漆面数下一步单独选。</p>'+
      optHtml(state.side==='single','单面板基','只做正面，背面不按饰面计','省', '', 'data-k="side" data-v="single"')+
      optHtml(state.side==='double','双面板基','正反两面都按饰面计','柜门常用', '', 'data-k="side" data-v="double"');
  }
  if(id==='board'){
    const canLong = [18,22,25].includes(Number(state.thick));
    html = '<h2>基材用哪种？</h2><p class="desc">默认 E0 密度板和欧松同价。多层已含 +30，不会再加一次。</p>'+
      boardOpts().map(function(o){return optHtml(state.upgrade===o[0], o[1], o[2], o[3], '', 'data-k="upgrade" data-v="'+o[0]+'"');}).join('');
    if(canLong){
      html += '<p class="sub">加长费独立于基材，2700-3200mm 可另加。</p>'+
        optHtml(state.extraLong,'加长费（2700-3200mm）','和定型板可以同时加','+150', 'check', 'data-k="long" data-v="1"');
    }
  }
  if(id==='paint'){
    const ps = paintSideKey();
    const p1 = PRICE.paint[ps][1], p2 = PRICE.paint[ps][2];
    html = '<h2>油漆怎么做？</h2><p class="desc">基准是油性肤感哑光。高光只能做油性。油漆面数可跟板基不同。</p>'+
      '<p class="sub">油漆面数</p><div class="seg">'+
      '<button type="button" class="'+(ps==='single'?'sel':'')+'" data-k="paintSide" data-v="single">单面 '+(state.paint===1?'+30':state.paint===2?'+100':'+0')+'</button>'+
      '<button type="button" class="'+(ps==='double'?'sel':'')+'" data-k="paintSide" data-v="double">双面 '+(state.paint===1?'+60':state.paint===2?'+180':'+0')+'</button></div>'+
      optHtml(state.paint===0,'油性肤感哑光','默认工艺，手感好','+0', '', 'data-k="paint" data-v="0"')+
      optHtml(state.paint===1,'水性肤感哑光','木皮半透也用它', '+'+p1, '', 'data-k="paint" data-v="1"')+
      optHtml(state.paint===2,'高光漆','5 分光以上，仅油性', '+'+p2, '', 'data-k="paint" data-v="2"');
  }
  if(id==='veneer'){
    const si = boardSideIndex();
    html = '<h2>要贴木皮吗？</h2><p class="desc">木皮面数跟随板基。不贴就是纯烤漆。</p>'+
      optHtml(state.veneer===0,'不贴木皮（纯烤漆）','直接油漆','+0', '', 'data-k="veneer" data-v="0"')+
      [1,2,3,4,5].map(function(g){return optHtml(state.veneer===g, (g===5?'五类木皮（染色枫影）':g+'类木皮'), VENEER_HINT[g], '+'+PRICE.veneer[g][si], '', 'data-k="veneer" data-v="'+g+'"');}).join('');
  }
  if(id==='line'){
    const hasBone = state.veneer>0;
    html = '<h2>要加线条吗？</h2><p class="desc">'+(hasBone?'贴了木皮可加骨骼线。纯烤漆或木皮都可加烤漆扣线。':'纯烤漆可以加扣线，80 元/圈。')+'</p>'+
      optHtml(state.line==='none','不需要线条','保持平面','+0', '', 'data-k="line" data-v="none"');
    if(hasBone) html += optHtml(state.line==='bone','木皮骨骼线 / 加压线','加在工艺倍率前','+150 / 圈', '', 'data-k="line" data-v="bone"');
    html += optHtml(state.line==='paintline','烤漆扣线','加在工艺倍率后','+80 / 圈', '', 'data-k="line" data-v="paintline"');
    if(state.line!=='none'){
      html += '<p class="sub">圈数</p><div class="stepper"><button type="button" data-k="lineCnt" data-v="-1">-</button><span>'+state.lineCnt+' 圈</span><button type="button" data-k="lineCnt" data-v="1">+</button></div>';
    }
  }
  if(id==='size'){
    html = '<h2>尺寸和数量</h2><p class="desc">填宽高后合计才按实际面积。没填之前按 1㎡。</p>'+
      '<div class="nums"><div class="field"><label>宽 W mm</label><input id="inW" type="number" min="1" inputmode="numeric" placeholder="600" value="'+(state.w||'')+'"></div>'+
      '<div class="field"><label>高 H mm</label><input id="inH" type="number" min="1" inputmode="numeric" placeholder="2400" value="'+(state.h||'')+'"></div>'+
      '<div class="field"><label>数量</label><input id="inQty" type="number" min="1" inputmode="numeric" value="'+state.qty+'"></div></div>'+
      optHtml(state.drawerBox,'按内抽盒计价','一个抽盒按 1㎡ 计','1㎡ / 个', 'check', 'data-k="drawer" data-v="1"')+
      '<div class="note" id="sizeNote"></div><div class="warn" id="sizeWarn"></div>';
  }
  if(id==='extra'){
    html = '<h2>附加项目</h2><p class="desc">按个 / 条 / 米 / 扇另计。金属条不足 1 米按 1 米。</p>'+
      PRICE.addons.map(function(a,i){return '<div class="addon"><div><div class="n">'+a.name+'</div><div class="u">'+a.price+' 元 / '+a.unit+'</div></div><input type="number" min="0" step="1" inputmode="numeric" value="'+(state.addons[i]||0)+'" data-addon="'+i+'"></div>';}).join('')+
      '<label class="tax"><input type="checkbox" id="inTax" '+(state.tax?'checked':'')+'> 开增值税票（合计 x1.1）</label><div class="bill" id="bill"></div>';
  }
  el.innerHTML = html;
  bindCard();
  renderProgress();
  paint();
}
function bindCard(){
  document.getElementById('card').onclick = function(e){
    const b = e.target.closest('[data-k]');
    if(!b) return;
    const k = b.dataset.k, v = b.dataset.v;
    if(k==='type'){
      state.type = v;
      state.thick = null;
      if(v==='back') state.side = 'single';
      else if(v==='door') state.side = 'double';
      else if(v==='wall') state.side = 'single';
    } else if(k==='thick'){
      state.thick = Number(v);
      if(state.thick===40) state.side = 'double';
      if(state.upgrade===100 && state.thick!==22) state.upgrade = 0;
      if(state.upgrade===30 && (state.thick===40 || isScreen())) state.upgrade = 0;
      if(state.upgrade===280 && [18,22,25,40].indexOf(state.thick)<0) state.upgrade = 0;
      if([130,150].indexOf(state.upgrade)>=0 && [18,22,25].indexOf(state.thick)<0 && !isScreen()) state.upgrade = 0;
      if([18,22,25].indexOf(state.thick)<0) state.extraLong = false;
    } else if(k==='craft'){
      if(v==='flat'){
        state.crafts = {flat:true, yixing:false, chiban:false, geshan:false, limian:false};
      } else {
        state.crafts[v] = !state.crafts[v];
        state.crafts.flat = false;
      }
    } else if(k==='side'){ state.side = v; }
    else if(k==='upgrade'){ state.upgrade = Number(v); }
    else if(k==='long'){ state.extraLong = !state.extraLong; }
    else if(k==='paint'){ state.paint = Number(v); }
    else if(k==='paintSide'){ state.paintSide = v; }
    else if(k==='veneer'){
      state.veneer = Number(v);
      if(state.veneer===0 && state.line==='bone') state.line = 'none';
    } else if(k==='line'){ state.line = v; }
    else if(k==='lineCnt'){ state.lineCnt = Math.max(1, state.lineCnt + Number(v)); }
    else if(k==='drawer'){ state.drawerBox = !state.drawerBox; }
    renderCard();
    if(k==='type' || k==='thick' || k==='side' || (k==='craft' && v==='flat')) go(1);
  };
  document.querySelectorAll('[data-addon]').forEach(function(inp){
    inp.addEventListener('input', function(){
      state.addons[Number(inp.dataset.addon)] = parseFloat(inp.value)||0;
      paint();
    });
  });
  const tax = document.getElementById('inTax');
  if(tax) tax.addEventListener('change', function(){ state.tax = tax.checked; paint(); });
  ['inW','inH','inQty'].forEach(function(id){
    const n = document.getElementById(id);
    if(!n) return;
    n.addEventListener('input', function(){
      if(id==='inW') state.w = parseFloat(n.value)||0;
      if(id==='inH') state.h = parseFloat(n.value)||0;
      if(id==='inQty') state.qty = Math.max(1, parseFloat(n.value)||1);
      paint();
    });
  });
}
