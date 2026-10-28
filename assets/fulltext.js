/* ============================================================
   科技供應鏈知識庫 · 全文搜尋（首頁搜尋欄用）
   打字時依 data.js 的節點清單，把各頁內文讀進來比對，
   列出「哪一頁、哪一段」出現這個詞。
   - 不需要另外建索引：新頁面只要登記進 data.js 就自動搜得到
   - 只在網站網址（http/https）下運作；直接雙擊開本機檔案時，
     瀏覽器不允許讀其他頁面，會自動退回只搜卡片
   一般維護不需要改這支檔案。
   ============================================================ */
(function(){
  const K = window.KB;
  const input = document.getElementById("search");
  const box = document.getElementById("ft-results");
  if(!K || !input || !box) return;

  const FOLDER = {cycles:"cycle", parts:"part", companies:"company", quarters:"quarter", reports:"report"};
  const LABEL  = {cycle:"週期", part:"零件", company:"公司", quarter:"財報", report:"報告", ref:"參考"};
  // 不在 data.js 裡、但值得一起搜的頁面
  const EXTRA = [
    {url:"reference/glossary.html",   name:"術語表",   type:"ref"},
    {url:"reference/frameworks.html", name:"分析框架", type:"ref"},
  ];
  const MAX_PAGES = 10, MAX_HITS = 3;

  const esc = s => String(s==null?"":s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const norm = s => String(s||"").normalize("NFKC").toLowerCase();

  function pageList(){
    const out = [];
    Object.entries(FOLDER).forEach(([folder,type])=>{
      (K[folder]||[]).forEach(n=>{
        if(n.status==="stub") return;            // 骨架節點沒有內容頁
        out.push({url:`${folder}/${n.id}.html`, name:n.name, type});
      });
    });
    return out.concat(EXTRA);
  }

  /* ---------- 把一頁 HTML 切成「段落」 ---------- */
  const SKIP = "header.site,footer.site,aside.toc,nav,script,style,noscript,.links-box,.timeline,.search-wrap,#timeline";
  const BLOCK = "p,li,tr,h1,h2,h3,h4,h5,figcaption,blockquote,dd,dt,div,section,article,table";

  function extract(html, page){
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll(SKIP).forEach(el=>el.remove());
    // 更新時間軸的標題也一起拿掉
    doc.querySelectorAll('h2').forEach(h=>{ if(/更新時間軸/.test(h.textContent)) h.remove(); });
    const root = doc.querySelector("article") || doc.body;
    const blocks = new Map();                    // 依文件順序：區塊元素 → 文字
    const cellOf = new Map();
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let t;
    while((t = walker.nextNode())){
      const s = t.nodeValue; if(!s.trim()) continue;
      const b = t.parentElement.closest(BLOCK) || root;
      // 表格同一列的不同欄位之間加分隔，避免字黏在一起
      const cell = b.tagName==="TR" ? t.parentElement.closest("td,th") : null;
      const prev = blocks.get(b) || "";
      const sep = (cell && prev && cell!==cellOf.get(b)) ? " · " : "";
      if(cell) cellOf.set(b, cell);
      blocks.set(b, prev + sep + s);
    }
    const out = []; let sec = {id:"", title:""};
    blocks.forEach((text, el)=>{
      text = text.replace(/\s+/g," ").trim();
      if(!text) return;
      if(el.tagName==="H2"){ sec = {id:el.id||"", title:text}; }
      out.push({text, low:norm(text), sec, head:el.tagName==="H2"});
    });
    const h1 = doc.querySelector("h1");
    page.title = (h1 && h1.textContent.trim()) || page.name;
    page.blocks = out;
    return page;
  }

  /* ---------- 載入全部頁面（只做一次） ---------- */
  let loading = null, pages = null, failed = false;
  function load(){
    if(loading) return loading;
    if(!/^https?:$/.test(location.protocol)){ failed = true; return loading = Promise.resolve([]); }
    loading = Promise.all(pageList().map(p=>
      fetch(p.url).then(r=>r.ok ? r.text() : null).then(h=>h ? extract(h,p) : null).catch(()=>null)
    )).then(list=>{
      pages = list.filter(Boolean);
      if(!pages.length) failed = true;
      return pages;
    });
    return loading;
  }

  /* ---------- 比對與呈現 ---------- */
  function snippet(text, terms){
    const low = norm(text);
    let at = low.indexOf(terms[0]); if(at<0) at = 0;
    const start = Math.max(0, at-36), end = Math.min(text.length, at+terms[0].length+64);
    let s = (start>0?"⋯":"") + text.slice(start,end) + (end<text.length?"⋯":"");
    // 標出所有關鍵字（用 normalize 後的位置比對，大小寫不拘）
    let html = esc(s);
    terms.forEach(q=>{
      const re = new RegExp(esc(q).replace(/[.*+?^${}()|[\]\\]/g,"\\$&"), "gi");
      html = html.replace(re, m=>`<mark>${m}</mark>`);
    });
    return html;
  }

  function run(raw){
    const q = norm(raw).trim();
    if(q.length < 2){ box.innerHTML = ""; box.hidden = true; return; }
    box.hidden = false;
    if(failed){
      box.innerHTML = `<div class="ft-note">全文搜尋要從網站網址開啟才能用；目前只搜下方卡片。</div>`;
      return;
    }
    if(!pages){
      box.innerHTML = `<div class="ft-note">載入全文中⋯</div>`;
      load().then(()=>{ if(norm(input.value).trim()===q) run(raw); });
      return;
    }
    const terms = q.split(/\s+/).filter(Boolean);
    const results = [];
    pages.forEach(p=>{
      const hits = p.blocks.filter(b=>terms.every(x=>b.low.includes(x)));
      if(!hits.length) return;
      const inTitle = terms.every(x=>norm(p.title).includes(x));
      results.push({p, hits, score:(inTitle?1000:0) + hits.length});
    });
    results.sort((a,b)=>b.score-a.score);

    if(!results.length){
      box.innerHTML = `<div class="ft-note">全文中也找不到「${esc(raw.trim())}」。</div>`;
      return;
    }
    const total = results.reduce((s,r)=>s+r.hits.length,0);
    const shown = results.slice(0, MAX_PAGES);
    box.innerHTML =
      `<div class="ft-head">全文搜尋：${results.length} 頁、${total} 處提到「${esc(raw.trim())}」</div>` +
      shown.map(({p,hits})=>{
        const items = hits.slice(0, MAX_HITS).map(h=>{
          const href = p.url + (h.sec.id ? "#"+h.sec.id : "");
          const where = (h.sec.title && !h.head) ? `<span class="ft-sec">${esc(h.sec.title)}</span>` : "";
          return `<a class="ft-hit" href="${href}">${where}<span class="ft-txt">${snippet(h.text, terms)}</span></a>`;
        }).join("");
        const more = hits.length>MAX_HITS ? `<div class="ft-more">這頁還有 ${hits.length-MAX_HITS} 處</div>` : "";
        return `<div class="ft-page"><a class="ft-title" href="${p.url}"><span class="tag-type ${p.type==="ref"?"":p.type}">${LABEL[p.type]}</span>${esc(p.title)}</a>${items}${more}</div>`;
      }).join("") +
      (results.length>MAX_PAGES ? `<div class="ft-more">另有 ${results.length-MAX_PAGES} 頁也提到，請加更多關鍵字縮小範圍。</div>` : "");
  }

  let timer;
  input.addEventListener("focus", load, {once:true});
  input.addEventListener("input", ()=>{ clearTimeout(timer); timer = setTimeout(()=>run(input.value), 180); });
})();
