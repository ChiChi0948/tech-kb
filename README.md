# 科技供應鏈知識庫

以「週期 / 公司 / 零件」三種卡片互相串聯的個人研究筆記網站。

## 怎麼用
雙擊 `index.html` 即可在瀏覽器離線開啟。所有頁面互相連結。

## 檔案結構
```
index.html              首頁（清單、產業鏈地圖、追蹤清單都由 assets/data.js 生成）
start.html              從這裡開始：新手閱讀路徑
assets/
  style.css             全站共用樣式（改這裡全站生效）
  data.js               節點、關聯、追蹤指標、圖解的總表 ← 平常只改這裡
  kb.js                 共用程式：自動產生關聯、週期角色地圖、追蹤、圖解（不用改）
images/                 截圖與圖解（登記在 data.js 的 figures）
cycles/ companies/ parts/   內容頁 + _TEMPLATE.html
quarters/ reports/      財報頁、產業報告
reference/              術語表 / 分析框架 / 更新日誌
```

## 新增一個節點
1. **登記**：在 `assets/data.js` 的 cycles / companies / parts 加一筆；公司與零件填 `layer`。
   - 只先佔位 → `status:"stub"`；已寫內容 → `status:"done"`（需建內容頁）
2. **寫內容頁**：複製該資料夾的 `_TEMPLATE.html`，改檔名為節點 id。
3. **串聯**：在 `data.js` 的 `links` 加一行 `["id1","id2","角色"]`，兩邊頁面自動出現，不用改 HTML。

## 加圖片
把截圖放進 `images/`（建議先轉成 .webp、寬度 1200px 以內），在 `data.js` 的 `figures` 登記一筆，
並填上 `source`（出處名稱）與 `url`（原始網址）。對應節點頁會自動出現「圖解」區塊。

## 放到網路上（跨裝置都能開）
1. 註冊 GitHub，新建一個 repository
2. 把整個資料夾的檔案上傳上去
3. Settings → Pages → 選 main 分支 → 儲存
4. 過幾分鐘會得到一個網址，手機/任何電腦開網址都能看
之後每次新增內容，重新上傳改動的檔案即可。




##給Claude的Prompt
我有一个个人维护的「科技供应链知识库」,部署在 GitHub Pages,架构是
「週期 / 公司 / 零件 / 财报」四种卡片互相串联。

请依序 fetch 下列三个网址,读完后你就具备维护这个知识库的完整能力:

1. 维护指引(架构、规则、归档工作流):
https://raw.githubusercontent.com/ChiChi0948/tech-kb/main/KB-MAINTENANCE-GUIDE.md

2. 现有节点资料(公司、零件、週期、财报清单):
https://raw.githubusercontent.com/ChiChi0948/tech-kb/main/assets/data.js

3. 全站样式(可用的 class 与色票,避免自订重复):
https://raw.githubusercontent.com/ChiChi0948/tech-kb/main/assets/style.css

补充:知识库的实际网站在
https://chichi0948.github.io/tech-kb/

【重要 SOP】若归档过程会「动到既有节点」的内容(补串联、加区块、覆盖内文),
请先跟我说要哪几个档案,我会把那些档案的原始 HTML 贴给你——
避免你在看不到原始内容的情况下盲写,把我既有的内容洗掉。
若只是「新增全新节点」不动旧的,就不用先要档案。

读完后简短告诉我你抓到的重点,并列出你需要我补充的资讯(如果有)。
之后我会用「知识库归档:XXX」的方式给你归档任务。
