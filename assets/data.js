/* ============================================================
   科技供應鏈知識庫 · 節點總表
   首頁清單由這份資料自動生成。
   新增一個節點：在對應陣列裡加一筆；status:"done" 需另建內容頁，
   status:"stub" 代表骨架占位、之後再補。
   詳細教學見首頁底部「如何擴充」。
   ============================================================ */
window.KB = {
  cycles: [
    { id:"ai-server",   status:"done", name:"AI 伺服器",     en:"AI Server",        desc:"生成式 AI 訓練/推論驅動；GPU + HBM + 先進封裝的需求爆發" },
    { id:"smartphone",  status:"stub", name:"智慧手機",       en:"Smartphone",       desc:"成熟週期；SoC、影像感測、面板、射頻前端" },
    { id:"ev",          status:"stub", name:"電動車",         en:"Electric Vehicle", desc:"功率半導體、電池、車用 MCU 與感測" },
    { id:"datacenter",  status:"stub", name:"雲端資料中心",   en:"Cloud Datacenter", desc:"伺服器、網通、光通訊、儲存" },
  ],
  companies: [
    // 晶圓代工
    { id:"tsmc",      group:"foundry", status:"done", name:"台積電",   code:"TSMC · 2330",  desc:"全球最大晶圓代工；先進製程 + CoWoS 封裝" },
    { id:"samsung-fab", group:"foundry", status:"stub", name:"三星晶圓代工", code:"Samsung Foundry", desc:"先進製程二哥，追趕台積電" },
    { id:"intel",     group:"foundry", status:"stub", name:"英特爾",   code:"Intel · INTC", desc:"IDM 轉型代工(IFS)；x86 + 自有製程" },
    // IC 設計
    { id:"nvidia",    group:"fabless", status:"done", name:"輝達",     code:"NVIDIA · NVDA", desc:"AI 加速器設計龍頭；CUDA 生態護城河" },
    { id:"amd",       group:"fabless", status:"stub", name:"超微",     code:"AMD",          desc:"CPU/GPU 設計；MI 系列挑戰輝達" },
    { id:"qualcomm",  group:"fabless", status:"stub", name:"高通",     code:"Qualcomm · QCOM", desc:"手機 SoC 與射頻；Snapdragon" },
    { id:"mediatek",  group:"fabless", status:"stub", name:"聯發科",   code:"MediaTek · 2454", desc:"手機 SoC；天璣系列" },
    { id:"apple-si",  group:"fabless", status:"stub", name:"蘋果晶片", code:"Apple Silicon", desc:"自研 A/M 系列；台積電最大客戶之一" },
    // 功率半導體
    { id:"infineon", group:"power",   status:"done", name:"Infineon 英飛凌", code:"IFX.DE", desc:"全球功率半導體龍頭；產品線最完整、AI 電源最直接受惠" },
    { id:"stm",      group:"power",   status:"done", name:"STM 意法",       code:"STM",    desc:"全球功率第二、車用 SiC 要角；AI 故事尚未充分認知" },
    // 記憶體
    { id:"sk-hynix",  group:"memory",  status:"done", name:"SK 海力士", code:"SK Hynix",     desc:"HBM 領先者；AI 週期最大贏家之一" },
    { id:"samsung-mem", group:"memory", status:"stub", name:"三星記憶體", code:"Samsung",     desc:"DRAM/NAND 龍頭；追趕 HBM" },
    { id:"micron",    group:"memory",  status:"stub", name:"美光",     code:"Micron · MU",  desc:"美系記憶體；HBM 後進" },
    // 設備
    { id:"asml",      group:"equip",   status:"done", name:"ASML",     code:"ASML",         desc:"光刻機獨佔；唯一能造 EUV" },
    { id:"appliedmat",group:"equip",   status:"stub", name:"應材",     code:"Applied Materials", desc:"沉積/蝕刻等多製程設備龍頭" },
    { id:"tokyo-electron", group:"equip", status:"stub", name:"東京威力科創", code:"TEL",  desc:"塗布/顯影/蝕刻設備大廠" },
    // 封測
    { id:"ase",       group:"ostat",   status:"stub", name:"日月光",   code:"ASE · 3711",   desc:"全球最大封測(OSAT)" },
    // 品牌/系統
    { id:"supermicro",group:"system",  status:"stub", name:"美超微",   code:"Supermicro · SMCI", desc:"AI 伺服器系統整合" },
    { id:"foxconn",   group:"system",  status:"stub", name:"鴻海",     code:"Foxconn · 2317", desc:"代工組裝龍頭；AI 伺服器/手機" },
  ],
  parts: [
    { id:"hbm",        status:"done", name:"HBM 高頻寬記憶體", en:"High Bandwidth Memory", desc:"垂直堆疊 DRAM；AI 運算頻寬關鍵" },
    { id:"cowos",      status:"done", name:"CoWoS 先進封裝",   en:"Chip on Wafer on Substrate", desc:"把 GPU 與 HBM 整合在矽中介層；AI 出貨瓶頸" },
    { id:"euv",        status:"done", name:"EUV 極紫外光刻",   en:"EUV Lithography",  desc:"先進製程命脈；只有 ASML 能造設備" },
    { id:"adv-node",   status:"stub", name:"先進製程",         en:"Advanced Node",    desc:"3nm/5nm 等；決定晶片效能與功耗" },
    { id:"soc",        status:"stub", name:"SoC 系統單晶片",   en:"System on Chip",   desc:"把 CPU/GPU/基頻整合的手機核心" },
    { id:"battery",    status:"stub", name:"動力電池",         en:"EV Battery",       desc:"電動車成本核心；電芯與材料" },
    { id:"power-semi", status:"done", name:"功率半導體",       en:"Power Semiconductor", desc:"SiC/GaN；電動車與電源管理。Infineon 領跑，SiC 為最激烈戰場" },
    { id:"cis",        status:"stub", name:"影像感測器",       en:"CMOS Image Sensor", desc:"手機相機核心；Sony 領先" },
    { id:"optical",    status:"stub", name:"光通訊模組",       en:"Optical Transceiver", desc:"資料中心高速互連" },
    { id:"passive",    status:"done", name:"被動元件 (MLCC)",  en:"Passive Components", desc:"電容/電阻/電感；無處不在的基礎件。AI 伺服器用量爆增，村田領先、國巨追趕" },
  ],
  groups: {
    foundry:{ name:"晶圓代工",  en:"Foundry" },
    fabless:{ name:"IC 設計",   en:"Fabless Design" },
    power:  { name:"功率半導體", en:"Power Semiconductor" },
    memory: { name:"記憶體",    en:"Memory" },
    equip:  { name:"半導體設備", en:"Equipment" },
    ostat:  { name:"封裝測試",  en:"OSAT" },
    system: { name:"品牌 / 系統整合", en:"Brand / System" },
  },
  /* 財報節點。檔案位於 quarters/。
     - scope:"overview"  → 一季的總覽頁，檔名 {period}.html（例：2026Q1.html）
     - scope:"company"   → 單家公司一季的財報頁，檔名 {period}-{company}.html（例：2026Q1-tsmc.html）
     company 欄位填對應 companies 陣列裡的 id，這樣公司頁可自動長出「財報追蹤」連結列表。 */
  quarters: [
    { id:"2026Q1",      period:"2026Q1", scope:"overview", status:"done", name:"2026 Q1 財報總覽", desc:"季度總覽：哪幾家公司有什麼動態的入口頁" },
    { id:"2026Q1-tsmc", period:"2026Q1", scope:"company",  company:"tsmc", status:"done", name:"台積電 2026Q1", desc:"AI 需求持續強勁，CoWoS 產能仍緊缺" },
  ]
};
