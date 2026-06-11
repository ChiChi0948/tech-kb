# 科技供應鏈知識庫

以「週期 / 公司 / 零件」三種卡片互相串聯的個人研究筆記網站。

## 怎麼用
雙擊 `index.html` 即可在瀏覽器離線開啟。所有頁面互相連結。

## 檔案結構
```
index.html              首頁（清單由 assets/data.js 生成）
assets/
  style.css             全站共用樣式（改這裡全站生效）
  data.js               節點總表 ← 新增節點先改這裡
cycles/                 週期頁    + _TEMPLATE.html（複製範本）
companies/              公司頁    + _TEMPLATE.html
parts/                  零件頁    + _TEMPLATE.html
reference/              術語表 / 分析框架 / 更新日誌
```

## 新增一個節點（兩步）
1. **登記**：開 `assets/data.js`，在 cycles / companies / parts 對應陣列加一筆。
   - 只先佔位 → `status:"stub"`（首頁顯示灰底「待補」，不需建檔）
   - 已寫內容 → `status:"done"`（需建內容頁）
2. **寫內容頁**：到對應資料夾複製 `_TEMPLATE.html`，改檔名為節點 id（如 `amd.html`），
   照註解填內容。串聯就在「關聯節點」區塊加 link-chip。

## 串聯（重點）
一張卡可同時連公司、零件、週期三種。連結有兩種寫法：
- **內文連結**：段落裡 `<a href="../parts/hbm.html">HBM</a>`
- **關聯節點區塊**：底部 link-chip，含三色圓點標示類型

## 放到網路上（跨裝置都能開）
1. 註冊 GitHub，新建一個 repository
2. 把整個資料夾的檔案上傳上去
3. Settings → Pages → 選 main 分支 → 儲存
4. 過幾分鐘會得到一個網址，手機/任何電腦開網址都能看
之後每次新增內容，重新上傳改動的檔案即可。
