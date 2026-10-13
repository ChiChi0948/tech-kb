/* ============================================================
   科技供應鏈知識庫 · 共用渲染程式
   所有內容頁在 data.js 之後載入這支檔案，它會自動產生：
     ① 關聯節點（讀 KB.links，雙向自動出現）
     ② 週期角色地圖（只在週期頁；誰在這個週期負責哪個零件）
     ③ 追蹤指標（讀 KB.watch）
     ④ 圖解（讀 KB.figures）
   一般維護不需要改這支檔案，只要改 data.js。
   ============================================================ */
(function(){
  const K = window.KB;
  if(!K) return;

  const FOLDER = {cycles:"cycle", companies:"company", parts:"part", quarters:"quarter", reports:"report"};
  const LABEL  = {cycle:"週期", company:"公司", part:"零件", quarter:"財報", report:"報告"};
  const ORDER  = ["cycle","part","company","quarter","report"];

  /* ---------- 索引 ---------- */
  const NODES = {};
  Object.entries(FOLDER).forEach(([folder,type])=>{
    (K[folder]||[]).forEach(n=>{ NODES[n.id] = Object.assign({}, n, {type, folder}); });
  });
  const LAYERS = K.layers || [];
  const layerIndex = id => { const i = LAYERS.findIndex(l=>l.id===id); return i<0 ? 99 : i; };
  const layerOf = n => n.type==="cycle" ? "demand" : (n.layer||"");

  // 每個節點的鄰居：[{id, role}]
  const NEIGH = {};
  (K.links||[]).forEach(([a,b,role])=>{
    (NEIGH[a] = NEIGH[a]||[]).push({id:b, role:role||""});
    (NEIGH[b] = NEIGH[b]||[]).push({id:a, role:role||""});
  });
  const neighbors = id => NEIGH[id] || [];
  // 角色含這些字的「公司 ↔ 零件」關係，代表公司是使用者而不是供應商
  const USER_ROLE = /客戶|買家|用戶|相關/;

  /* ---------- 小工具 ---------- */
  const esc = s => String(s==null?"":s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  function href(n, root){ return root + n.folder + "/" + n.id + ".html"; }
  function shortName(n){ return n.name; }

  // 一顆連結 chip；stub 節點顯示成灰色、不可點
  function chip(id, root, role){
    const n = NODES[id];
    if(!n) return `<span class="link-chip stub" title="data.js 裡找不到這個 id">${esc(id)}</span>`;
    const r = role ? `<span class="role">${esc(role)}</span>` : "";
    const inner = `<span class="dot ${n.type}"></span>${esc(shortName(n))}${r}`;
    if(n.status === "stub") return `<span class="link-chip stub" title="骨架待補，尚未建立內容頁">${inner}</span>`;
    return `<a class="link-chip" href="${href(n,root)}">${inner}</a>`;
  }

  /* ---------- 公開給首頁與「從這裡開始」頁使用 ---------- */
  window.KBX = { NODES, LAYERS, neighbors, chip, href, esc, layerOf, layerIndex, LABEL };

  /* ---------- 以下只在內容頁執行 ---------- */
  const parts = location.pathname.split("/").filter(Boolean);
  const file = parts[parts.length-1] || "";
  const folder = parts[parts.length-2] || "";
  if(!FOLDER[folder]) return;
  const ME = file.replace(/\.html$/,"");
  const me = NODES[ME];
  const ROOT = "../";
  if(!me) return;

  const article = document.querySelector("article") || document.body;
  const linksBox = document.querySelector(".links-box");
  // 新區塊插在「關聯節點」前面；沒有關聯區塊就插在更新時間軸前面，再不然放文章最後
  const anchor = linksBox || document.getElementById("timeline");
  function insert(html){
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    [...tmp.childNodes].forEach(el=>{
      if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(el, anchor);
      else article.appendChild(el);
    });
  }
  function addToc(id, text){
    const toc = document.querySelector("aside.toc");
    if(!toc || toc.querySelector(`a[href="#${id}"]`)) return;
    const a = document.createElement("a"); a.href = "#"+id; a.textContent = text;
    const tl = toc.querySelector('a[href="#timeline"]');
    tl ? toc.insertBefore(a, tl) : toc.appendChild(a);
  }

  /* ② 週期角色地圖 */
  if(me.type === "cycle"){
    const nb = neighbors(ME).map(x=>Object.assign({}, x, {n:NODES[x.id]})).filter(x=>x.n);
    const cycParts = nb.filter(x=>x.n.type==="part");
    const cycComps = new Set(nb.filter(x=>x.n.type==="company").map(x=>x.id));
    const placed = new Set();
    const rows = LAYERS.filter(l=>l.id!=="demand").map(l=>{
      const ps = cycParts.filter(x=>layerOf(x.n)===l.id);
      const loose = [...cycComps].filter(id=>layerOf(NODES[id])===l.id);
      if(!ps.length && !loose.length) return "";
      let cells = ps.map(p=>{
        const comps = neighbors(p.id).filter(x=>NODES[x.id] && NODES[x.id].type==="company");
        const makers = comps.filter(x=>!USER_ROLE.test(x.role));
        const users  = comps.filter(x=> USER_ROLE.test(x.role));
        makers.forEach(m=>placed.add(m.id));
        const mk = makers.length ? makers.map(m=>chip(m.id, ROOT, m.role)).join("")
                                 : '<span class="muted">尚未連到供應商</span>';
        const us = users.length ? `<div class="rm-users"><span class="cg-label">客戶 / 相關</span>${users.map(u=>chip(u.id, ROOT)).join("")}</div>` : "";
        return `<div class="rm-part">${chip(p.id, ROOT)}<span class="arrow">→</span><div class="rm-makers">${mk}</div>${us}</div>`;
      }).join("");
      return `<tr><th>${esc(l.name)}<small>${esc(l.en)}</small></th><td>${cells}<!--LOOSE:${l.id}--></td></tr>`;
    }).join("");
    if(rows){
      // 有連到這個週期、但沒有透過零件出現的公司，補在它所屬那一層
      let html = rows;
      LAYERS.forEach(l=>{
        const loose = [...cycComps].filter(id=>layerOf(NODES[id])===l.id && !placed.has(id));
        const rep = loose.length ? `<div class="rm-loose">${loose.map(id=>chip(id, ROOT)).join("")}</div>` : "";
        html = html.replace(`<!--LOOSE:${l.id}-->`, rep);
      });
      insert(`<h2 id="rolemap">週期角色地圖</h2>
        <p class="section-sub">由上游到下游：這個週期需要哪些零件、每個零件由誰負責。資料來自 data.js 的 links，新增一條關聯，這張表就會跟著更新。</p>
        <div class="rolemap-wrap"><table class="rolemap">${html}</table></div>`);
      // 移除最後沒有任何內容的層級列
      document.querySelectorAll("table.rolemap tr").forEach(tr=>{
        const td = tr.querySelector("td");
        if(td && !td.querySelector(".link-chip")) tr.remove();
      });
      addToc("rolemap", "週期角色地圖");
    }
  }

  /* ④ 圖解 */
  const figs = (K.figures||[]).filter(f=>f.node===ME);
  if(figs.length){
    insert(`<h2 id="figures">圖解</h2><div class="figs">${figs.map(f=>`
      <figure class="kb-fig">
        <a href="${ROOT+esc(f.src)}" target="_blank" rel="noopener"><img src="${ROOT+esc(f.src)}" alt="${esc(f.caption)}" loading="lazy"></a>
        <figcaption>${esc(f.caption)}<span class="src">來源：${f.url?`<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.source||f.url)}</a>`:esc(f.source||"未註明")}</span></figcaption>
      </figure>`).join("")}</div>`);
    addToc("figures", "圖解");
  }

  /* ③ 追蹤指標 */
  const w = (K.watch||{})[ME];
  if(w && w.length){
    insert(`<div class="watch-box" id="watch"><div class="lt">追蹤指標 · What to watch</div>
      <ul>${w.map(([k,why])=>`<li><b>${esc(k)}</b><span>${esc(why||"")}</span></li>`).join("")}</ul></div>`);
    addToc("watch", "追蹤指標");
  }

  /* ① 關聯節點 */
  // 財報頁的關聯維持手寫（財報與公司的對應由 quarters 的 company 欄位處理）
  if(linksBox && me.type !== "quarter"){
    const nb = neighbors(ME);
    const groups = {};
    nb.forEach(x=>{
      const n = NODES[x.id]; const t = n ? n.type : "company";
      (groups[t] = groups[t]||[]).push(x);
    });
    const body = ORDER.filter(t=>groups[t]).map(t=>`
      <div class="chip-group"><span class="cg-label">${LABEL[t]}</span>
      <div class="chip-row">${groups[t].map(x=>chip(x.id, ROOT, x.role)).join("")}</div></div>`).join("");
    linksBox.innerHTML = `<div class="lt">關聯節點 · Connections</div>` +
      (body || '<p class="muted">還沒有關聯。在 data.js 的 links 加一行即可。</p>');
  }
})();
