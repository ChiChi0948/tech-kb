# 科技供應鏈知識庫 · 維護指引(可交接給其他對話)

> 這份文件給「未來任何幫我維護這個知識庫的對話」。讀完這份你就具備跟原始對話相同的能力。
> 看到「知識庫歸檔」這個觸發詞,就照本文件的工作流執行。

---

## 1. 這個知識庫是什麼

一份用純 HTML/CSS/JS 寫成的**多檔案個人研究網站**,主題是「全球科技供應鏈」,部署在 GitHub Pages。設計受到 `irenesh.github.io/India-pharma-research/` 啟發。

**核心理念:** 全球科技供應鏈 80% 是同一批名字,只是在每個週期負責不同的零件或模組。這份知識庫用「網狀串聯」呈現這種角色變換。

**走的路線:**「改檔再上傳」(版本 A),不是網頁上即時編輯。所有編輯發生在本機檔案,推到 GitHub 後跨裝置都能瀏覽。

---

## 2. 四種卡片(節點)架構

**這是整個知識庫的骨架,任何新增內容都必須對應到這四種之一:**

| 卡片類型 | 顏色 | 資料夾 | 代表什麼 | 例子 |
|---|---|---|---|---|
| **週期 cycle** | 紫 `--cycle` | `cycles/` | 終端需求驅動的科技週期 | AI 伺服器、電動車、智慧手機 |
| **公司 company** | 赭金 `--company` | `companies/` | 供應鏈裡的玩家 | 台積電、輝達、Infineon |
| **零件 part** | 青 `--part` | `parts/` | 流動於供應鏈的零件 / 模組 / 技術 | HBM、CoWoS、CCL、功率半導體 |
| **財報 quarter** | 深紅 `--quarter` | `quarters/` | 每季的公司財報觀察 | 2026Q1-tsmc |

**串聯原則:** 一張卡可同時連 4 種,在每頁底部「關聯節點 Connections」區塊用 `link-chip` 串。雙向串聯需手動兩邊都加(沒有自動回連)。

---

## 3. 檔案地圖

```
techkb/
├── index.html              首頁(從 data.js 自動生成清單)
├── README.md               基本介紹與部署說明
├── assets/
│   ├── style.css           全站共用樣式,改這裡全站生效
│   └── data.js             節點總表 ← 新增節點必改這裡
├── cycles/                 週期頁 + _TEMPLATE.html
├── companies/              公司頁 + _TEMPLATE.html
├── parts/                  零件頁 + _TEMPLATE.html
├── quarters/               財報頁(無 template,複製現成的當範本)
└── reference/
    ├── glossary.html       術語表
    ├── frameworks.html     分析框架
    └── updates.html        全站更新日誌(每次歸檔都要加一筆)
```

---

## 4. `data.js` 結構(知識庫的大腦)

這個檔案是首頁清單與所有自動列表的資料來源。新增節點**一定要在這裡登記一筆**,不然首頁不會出現。

```javascript
window.KB = {
  cycles: [
    { id:"ai-server", status:"done", name:"AI 伺服器", en:"AI Server", desc:"一句話描述" },
    // status: "done"(已寫內容頁) 或 "stub"(骨架占位)
  ],
  companies: [
    { id:"tsmc", group:"foundry", status:"done", name:"台積電", code:"TSMC · 2330", desc:"..." },
    // group 必須對應下方 groups map 裡的鍵
  ],
  parts: [
    { id:"hbm", status:"done", name:"HBM 高頻寬記憶體", en:"...", desc:"..." },
  ],
  groups: {  // 公司分組,可隨架構成長新增
    foundry:{name:"晶圓代工", en:"Foundry"},
    fabless:{name:"IC 設計", en:"Fabless Design"},
    power:  {name:"功率半導體", en:"Power Semiconductor"},
    passive:{name:"被動元件", en:"Passive Components"},
    pcb:    {name:"PCB / 載板", en:"PCB / Substrate"},
    memory: {name:"記憶體", en:"Memory"},
    equip:  {name:"半導體設備", en:"Equipment"},
    ostat:  {name:"封裝測試", en:"OSAT"},
    system: {name:"品牌 / 系統整合", en:"Brand / System"},
  },
  quarters: [
    // 季度總覽
    { id:"2026Q1", period:"2026Q1", scope:"overview", status:"done", name:"2026 Q1 財報總覽", desc:"..." },
    // 單家公司財報
    { id:"2026Q1-tsmc", period:"2026Q1", scope:"company", company:"tsmc", status:"done",
      name:"台積電 2026Q1", desc:"一句話重點" },
  ]
};
```

**關鍵規則:**
- `id` 必須與檔名一致(`id:"tsmc"` → `companies/tsmc.html`)
- 公司頁的「財報追蹤」會自動從 `quarters` 拉出 `company` 欄位等於它 id 的記錄,**不要手動加連結**
- 新分組要加進 `groups` 才會在首頁顯示

---

## 5. 寫一張新節點頁的標準骨架

所有內容頁共用同一個結構,差別只在 `tag-type` 的顏色與內容。

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>節點名稱 · 科技供應鏈知識庫</title>
<link rel="stylesheet" href="../assets/style.css">
</head>
<body>
<header class="site"><div class="wrap">
<a class="brand" href="../index.html">供應鏈<span class="mk">·</span>知識庫</a>
<span class="crumb"><a href="../index.html">首頁</a> / <a href="../index.html#parts">零件</a> / 節點名</span>
<nav class="top"><a href="../index.html#cycles">週期</a><a href="../index.html#companies">公司</a><a href="../index.html#parts">零件</a><a href="../index.html#quarters">財報</a></nav>
</div></header>
<div class="wrap"><div class="layout">

<aside class="toc"><div class="tl">本頁目錄</div>
<a href="#section1">第一段</a>
<a href="#section2">第二段</a>
<a href="#timeline">更新時間軸</a>
</aside>

<article>
<span class="tag-type part">零件 / 模組</span>  <!-- 或 company / cycle / quarter -->
<h1>節點名稱</h1>
<p class="lede">一句話定位,告訴讀者這是什麼、為什麼重要。</p>

<h2 id="section1">第一段</h2>
<p>內容...用 <a href="../companies/tsmc.html">內文連結</a> 串到其他節點。</p>

<!-- 視內容需要使用 deftable / note 等樣式元件,見下方 §6 -->

<div class="links-box">
<div class="lt">關聯節點 · Connections</div>
<div class="chip-row">
<a class="link-chip" href="../cycles/ai-server.html"><span class="dot cycle"></span>AI 伺服器</a>
<a class="link-chip" href="../companies/tsmc.html"><span class="dot company"></span>台積電</a>
<!-- dot 的 class 必須對應目標卡片類型:cycle / company / part / quarter -->
</div></div>

<h2 id="timeline">更新時間軸</h2>
<div class="timeline">
<div class="ev"><div class="dt">2026.06</div>由「某次討論」歸檔建立此頁。</div>
</div>
</article>
</div></div>
<footer class="site"><div class="wrap">科技供應鏈知識庫 · 個人研究用</div></footer>
</body></html>
```

**公司頁額外加「財報追蹤」區塊**(放在 `<div class="links-box">` 之前):

```html
<h2 id="financials">財報追蹤</h2>
<div class="fin-track">
<div class="lt">每季財報觀察 · Quarterly Reports</div>
<ul id="fin-list"><li style="color:var(--faint);font-style:italic">載入中⋯</li></ul>
</div>
```

並在 `</body>` 前加 script(把 `COMPANY_ID` 改成這家公司的 id):

```html
<script src="../assets/data.js"></script>
<script>
const COMPANY_ID="tsmc";
const reports=(KB.quarters||[]).filter(q=>q.company===COMPANY_ID&&q.scope==="company").sort((a,b)=>b.period.localeCompare(a.period));
const list=document.getElementById("fin-list");
list.innerHTML=reports.length?reports.map(r=>`<li><span class="pd">${r.period}</span><a href="../quarters/${r.id}.html">${r.desc}</a></li>`).join(""):'<li style="color:var(--faint);font-style:italic">尚無財報觀察。</li>';
</script>
```

---

## 6. 可用樣式元件(寫頁面時直接用,不要自訂)

`style.css` 已備有這些 class:

### 6.1 基礎版式

- **`.deftable`** — 兩欄定義表,左欄淡色標籤、右欄內容(用於規格、對照、來源等)
- **`.note`** — 提示框,左邊有色條。可加 `style="border-left-color:var(--done)"` 改顏色,綠=利多/結論、黃 `--stub`=警告、紫 `--cycle`=一般提示
- **`.timeline`** + **`.ev`** + **`.dt`** — 時間軸列表
- **`.links-box`** + **`.chip-row`** + **`.link-chip`** — 底部關聯節點區塊。`.dot` 的 class 決定顏色圓點
- **`.tag-type`** + 類型 class(`company`/`part`/`cycle`/`quarter`) — h1 上方的彩色 tag
- **`.tl`** — 小標籤(uppercase letter-spacing)

### 6.2 Q&A 卡片 `.qa`

灰底白卡的問答區塊,適合寫「常見誤解 / FAQ / 快速對照」段落。可連續放多張形成 Q&A 列表。

```html
<div class="qa">
  <div class="q">HBM 跟一般 DRAM 有什麼不同?</div>
  <div class="a">HBM 是把多顆 DRAM die 垂直堆疊、用 TSV 貫穿電極連接,再透過矽中介層與 GPU 並列封裝。頻寬遠高於 DDR/GDDR,但成本與良率門檻也高。</div>
</div>
```

**用時機:** 節點頁想快速答幾個典型問題、破除誤解、或列一組「你以為 X,其實 Y」時。不要拿來寫長篇論述——長段落用 `<p>`。

### 6.3 骨架橫幅 `.stub-banner`

黃色橫幅,標示「這頁還是骨架、內容待補」。放在 `<h1>` 下方、正文之前。

```html
<div class="stub-banner">
  <b>骨架頁面</b> · 這一節點還在等使用者提供內容做深入。
  目前只有基本定位與關聯,細節請以外部資料為準。
</div>
```

**用時機:** 在 `data.js` 標了 `status:"stub"` 但為了讓連結不斷、先建了空殼頁時。等內容寫進來就把 banner 移掉、把 `status` 改成 `done`。

### 6.4 財報核心數字表 `.kpi-grid` / `.kpi`

財報頁專用的關鍵指標並排卡,每張顯示一個數字 + 標籤 + 變化幅度。

```html
<div class="kpi-grid">
  <div class="kpi">
    <div class="v">$25.5B</div>
    <div class="l">Revenue</div>
    <div class="d up">+8.7% QoQ</div>
  </div>
  <div class="kpi">
    <div class="v">57.8%</div>
    <div class="l">Gross Margin</div>
    <div class="d up">+1.2 ppt</div>
  </div>
  <div class="kpi">
    <div class="v">$2.14</div>
    <div class="l">EPS</div>
    <div class="d dn">-3.5% YoY</div>
  </div>
</div>
```

**子元素規則:**
- `.v` — 大數字本體(自動加粗、負字距)
- `.l` — 底下的小標籤(自動 uppercase + letter-spacing)
- `.d` — 變化描述行。加 `.up` 變綠、`.dn` 變紅、不加就是灰

**用時機:** 財報頁 (`quarters/*.html`) 的最上方,讓讀者一眼看到當季核心數字。3–6 張為宜,超過就拆兩排。

### 6.5 財報追蹤 `.fin-track`

公司頁用來自動列出所有相關季度財報頁的區塊。**不要手動填內容**,配 §5 底部那段 script 使用,會從 `data.js` 的 `quarters` 抓取。

### 6.6 色票 CSS 變數

都已定義在 `style.css` 的 `:root`:
- `--paper` 紙底、`--ink` 主文字、`--ink-soft` 次文字、`--faint` 最淡
- `--company` 赭金、`--part` 青、`--cycle` 紫、`--quarter` 深紅
- `--done` 綠、`--stub` 黃、`--accent` 藍

### 6.7 自訂樣式邊界

**不要自己引入新的 CSS 框架**(Tailwind、Bootstrap 等)。也不要用 `<style>` 寫破壞全站視覺的自訂樣式。如果某個元件不存在但你需要,就用 `<style>` 加在那一頁內、命名以該頁專屬前綴(例如 `pkg3d-` 是 CoWoS 3D 的命名空間),避免污染全站。

---

## 7. 歸檔工作流(這是核心)

當使用者說「知識庫歸檔:幫我找『XXX』那次討論,整理成一頁,接上架構」,執行下列步驟:

### 步驟 1:取得內容
- **a)** 若在同一專案內,用 `conversation_search` 搜尋對應對話。查詢字串用內容關鍵字(產品名、技術名、公司名),不要用「討論」「對話」這類後設詞
- **b)** 若使用者直接貼 HTML 或文字內容,以那個為準
- **c)** 若使用者貼的是 `file://` 本機路徑,告訴他你打不開,請他貼內容

### 步驟 2:盤點增量、決定切法
- 內容該成為哪種卡片?(零件 / 公司 / 週期)
- 該補進既有節點,還是新建?(避免重複)
- 提到的公司有幾家?**不要每家都建公司節點**——遵循 §9 的「克制原則」

### 步驟 3:跟使用者確認切法
用 `ask_user_input_v0` 給 2-3 個明確選項,讓使用者選。**不要不問就動手**,因為節點切法影響長期。

### 步驟 4:執行
- 改 `data.js`(新增節點登記、必要時新增 group)
- 建 / 改內容頁(用 §5 骨架)
- 既有相關節點互加 `link-chip`(雙向串聯)
- 改 `reference/updates.html` 加一筆 `<div class="ev">` 到時間軸最上方
- 用 Python 掃描所有 HTML 的內部連結,確認沒有斷鏈

### 步驟 5:交付
- 把改動的檔案打包成 zip
- 用 `present_files` 給使用者
- **明確列出哪些檔案要上傳到 GitHub 的哪個資料夾**(這對使用者操作很重要)
- 提醒「待辦」:內文中標粗體但還沒建節點的公司,等使用者哪天想做就跟你說

---

## 8. 「歸檔咒語」——使用者會這樣呼叫你

> **「知識庫歸檔:幫我找『XXX』的那次討論,整理成一頁,接上科技供應鏈知識庫的架構。已有節點:〔貼 data.js 或寫『沿用上次』〕」**

「沿用上次」的意思是:使用者沒貼 `data.js`,你要靠自己手上有的版本推測現有節點。這時要在最後告訴他「我假設了你有哪些節點,請核對」。

---

## 9. 設計原則(避免常見錯誤)

**克制原則 — 最重要的一條。** 一份討論提到 10 家公司,不要建 10 個公司節點。建議的判斷標準:
- 內容能寫滿一張「基本定位+角色+vs同業+風險」四段式公司頁 → 建獨立節點
- 內容只有一兩句話 → 在零件頁內文用粗體提到,**不建節點**
- 通常先建 2-3 家最重要的,其餘標記在內文,等使用者真的想深入再升級

**結構語義原則。** 視覺呈現要符合內容本質:
- 「分層堆疊」(CCL、ABF)用平面 3D 拆解
- 「垂直堆疊」(HBM)用立柱剖面
- 「並列模組」(CoWoS)用基板 + 頂部多模組
- 不要硬套同一個視覺模板到不同語義的節點

**3D 不通用化。** CSS 3D 視覺化是「重點節點」的視覺錨點,不是每個節點都該有。歸檔時不主動加 3D,除非使用者明確要求,或內容真的是高頻查閱的核心節點(HBM、CoWoS、CCL 級)。

**內文先 mark,後獨立。** 第一次提到某公司時用 `<b>` 標粗,等之後值得獨立成卡片再加 `<a>` 連結。這讓擴充節奏自然。

**雙向串聯。** 在 A 加連到 B 的同時,也要在 B 加連到 A。沒有自動回連,要靠手動兩邊都改。

**內容寫繁體中文。** 整個知識庫以繁體中文為主,英文只用在專有名詞、技術術語、公司代號。

---

## 10. 部署到 GitHub Pages

使用者在自己的 GitHub 有一個 repo(通常叫 `tech-kb`),設定 Pages 從 main 分支 root 部署。網址形如 `https://{username}.github.io/tech-kb/`。

每次歸檔後,使用者要做的事:
1. 解壓你給的 zip
2. 進 GitHub repo,把改動的檔案逐個或整批上傳(同名檔自動覆蓋)
3. Commit,等 1-2 分鐘部署完成
4. 刷新網站看到新內容

**告訴使用者要上傳哪些檔案時,做成表格列出來,標清楚是「覆蓋」還是「新增」。** 這對非技術背景的使用者很重要。

---

## 11. 給使用者的開場提示(複製貼給新對話用)

如果你是第一次接手這個知識庫,使用者會像這樣開始一個新對話:

> 我有一個科技供應鏈知識庫(部署在 GitHub Pages),架構是「週期 / 公司 / 零件 / 財報」四種卡片互相串聯。我貼一份維護指引給你讀,之後請照這份指引幫我歸檔新內容、新增節點、做必要的串聯。讀完跟我說一聲,我就開始給你內容。
>
> [附上本文件]

讀完後你應該:
1. 簡短確認你看懂了架構(不要複述整份文件,讓使用者煩)
2. 告知有什麼**還需要的資訊**:最新的 `data.js`(這樣你才知道現有節點)、現有的 `style.css`(這樣你不會發明已存在的樣式)
3. 等使用者下指令(通常是「知識庫歸檔:XXX」)

---

## 12. 已知限制 / 不要做的事

- **不要主動讀使用者其他對話**——除非他明確說「找我們之前聊 XXX」,你才用 `conversation_search`
- **不要重新設計視覺風格**——保持淺色研究筆記風、四色系統。除非使用者明確說要改
- **不要把單頁做超過 15 個 h2**——超過會讓 TOC 太長,該拆成多個節點
- **不要在內容裡放未驗證的數字**——使用者貼的內容裡有什麼數字就保留什麼,不要自己補
- **不要把這份指引的內容包進歸檔的 HTML 頁裡**——這份指引是維護工具,不是知識庫內容

---

*本指引版本: 2026.07 · 由初代維護對話編寫,可自由更新擴充。*
*2026.07 更新:§6 補上 `.qa` / `.stub-banner` / `.kpi-grid` 三個元件的用法。*
