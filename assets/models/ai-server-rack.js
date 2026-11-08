/* ============================================================
   3D 模型規格 · AI 伺服器整櫃（ai-server-rack.js）
   ------------------------------------------------------------
   三個層級：整櫃 rack → 運算托盤 tray → GPU 封裝 pkg。
   每個零件的 nodes 填 data.js 裡的節點 id，面板會自動變成可點的 chip；
   others 填還沒建節點的公司（純文字）。文字只寫定性描述，數字請看各節點頁。

   模型是示意圖，比例與配置不代表任何特定產品。
   座標單位約略是公尺；y 向上。
   ============================================================ */

const C = {
  frame:   '#3b4048',  // 機櫃鐵架
  tray:    '#d6d0c3',  // 托盤殼
  bezel:   '#8a9199',  // 托盤前面板
  switch:  '#5fb5ad',  // 交換機托盤（青）
  optical: '#2a6862',
  power:   '#7a56b8',  // 電源（紫）
  copper:  '#b87333',  // 液冷管 / 銅
  spine:   '#2b2f36',  // 銅纜背板
  board:   '#2f6f5f',  // 電路板綠
  gpu:     '#b6843a',  // GPU 金
  cpu:     '#6b7280',
  hbm:     '#3a8f86',  // HBM 青
  logic:   '#4b5563',
  cold:    '#8aa6b8',  // 冷板
  vrm:     '#7a56b8',
  mlcc:    '#d9b24c',
  dimm:    '#3a8f86',
  io:      '#3a8f86',
  lid:     '#aab0b8',
  interp:  '#8c8f94',
  abf:     '#2c5f4a',
  chassis: '#b9b3a6',
};

/* 小工具：產生一排重複的 instance */
const box = (p, s, e, extra) => Object.assign({ p, s, e: e || [0,0,0] }, extra || {});

/* ============================================================
   第 1 層：整櫃
   機櫃寬 0.6、深 1.2、高 2.2；14 個 U 位，由下而上：
   電源架 ×2、運算托盤 ×4、交換機托盤 ×2、運算托盤 ×4、電源架 ×2
   ============================================================ */
const RACK_W = 0.6, RACK_D = 1.2, RACK_H = 2.2;
const SLOT_H = 0.14, SLOT_GAP = 0.01, SLOT_Y0 = 0.14;
const slotY = i => SLOT_Y0 + i * (SLOT_H + SLOT_GAP) + SLOT_H / 2;
const slotSpread = i => (i - 6.5) * 0.085;     // 拆解時上下散開的量
const slotKinds = ['power','power','compute','compute','compute','compute','switch','switch',
                   'compute','compute','compute','compute','power','power'];

const rackFrame = [];
for(const sx of [-1, 1]) for(const sz of [-1, 1]){
  rackFrame.push(box([sx * (RACK_W/2 - 0.025), RACK_H/2, sz * (RACK_D/2 - 0.025)], [0.05, RACK_H, 0.05], [sx * 0.22, 0, sz * 0.12]));
}
rackFrame.push(box([0, 0.02, 0], [RACK_W, 0.04, RACK_D], [0, -0.2, 0]));          // 底座
rackFrame.push(box([0, RACK_H - 0.02, 0], [RACK_W, 0.04, RACK_D], [0, 0.65, 0])); // 頂板

const computeTrays = [], switchTrays = [], powerShelves = [], opticalCages = [];
slotKinds.forEach((kind, i) => {
  const y = slotY(i), dy = slotSpread(i);
  if(kind === 'compute'){
    computeTrays.push(box([0, y, 0.02], [RACK_W - 0.1, SLOT_H - 0.02, RACK_D - 0.25], [0, dy, 0.32]));
    computeTrays.push(box([0, y, (RACK_D - 0.25)/2 + 0.02], [RACK_W - 0.1, SLOT_H - 0.02, 0.02], [0, dy, 0.32], { color: C.bezel }));
  } else if(kind === 'switch'){
    switchTrays.push(box([0, y, 0.02], [RACK_W - 0.1, SLOT_H - 0.02, RACK_D - 0.25], [0, dy, 0.32]));
    for(let k = 0; k < 8; k++){
      const x = -0.21 + k * 0.06;
      opticalCages.push(box([x, y, (RACK_D - 0.25)/2 + 0.07], [0.04, 0.035, 0.08], [0, dy, 0.62]));
    }
  } else {
    powerShelves.push(box([0, y, 0.02], [RACK_W - 0.1, SLOT_H - 0.02, RACK_D - 0.25], [0, dy, 0]));
  }
});

const manifold = [];
for(const sx of [-1, 1]){
  manifold.push(box([sx * 0.33, RACK_H/2, -0.5], [0.05, RACK_H - 0.2, 0.05], [sx * 0.1, 0, -0.42], { shape: 'cyl' }));
  // 每個托盤的快接頭
  slotKinds.forEach((kind, i) => {
    if(kind === 'power') return;
    manifold.push(box([sx * 0.3, slotY(i), -0.5], [0.025, 0.06, 0.025], [sx * 0.1, slotSpread(i), -0.42], { shape: 'cyl', r: [0, 0, Math.PI/2] }));
  });
}

const spine = [
  box([0, 1.12, -0.56], [0.36, 1.55, 0.06], [0, 0, -0.75]),
  // 上下兩束纜線示意
  box([0, 1.12, -0.6], [0.3, 1.5, 0.02], [0, 0, -0.75], { color: '#111418' }),
];

const RACK = {
  name: '整櫃', en: 'Rack',
  view: [1.2, 0.55, 1.35],
  floor: 0,
  intro: '一座 AI 伺服器機櫃不是一台電腦，而是幾十顆 GPU 用銅纜綁成的一台巨型計算機。由上而下：電源架、運算托盤、交換機托盤；背面是銅纜背板與液冷管路。先按「拆解」看各層怎麼疊，點一下零件看是誰在做，點運算托盤兩次可以拆開看裡面。',
  parts: [
    { id: 'frame', name: '機櫃骨架與整櫃組裝', en: 'Rack & Integration', color: C.frame,
      brief: '承載所有托盤的鐵架，加上整櫃的配線、配管與出廠測試。',
      why: '「整櫃交付」讓代工廠從賣主機板變成賣一整座機櫃，組裝與測試的門檻和單價都被拉高。',
      nodes: ['foxconn', 'supermicro'], others: '廣達、緯穎、工業富聯',
      label: { at: 4, dy: -0.02 }, instances: rackFrame },
    { id: 'compute-tray', name: '運算托盤', en: 'Compute Tray', color: C.tray, drill: 'tray',
      brief: '每個托盤裝著 CPU 與 GPU 組成的運算單元、主機板、供電模組與液冷冷板。',
      why: '整座機櫃的價值幾乎都在這裡——GPU、HBM、先進封裝全藏在托盤裡。',
      nodes: ['nvidia', 'tsmc', 'ai-server'],
      label: { at: 6, dy: 0.04 }, instances: computeTrays },
    { id: 'switch-tray', name: '交換機托盤', en: 'Switch Tray', color: C.switch,
      brief: '把機櫃裡所有 GPU 連成一台的高速交換機，位在機櫃中段。',
      why: 'GPU 越多，互連需求跳躍式成長；交換晶片與互連架構決定整櫃能不能當「一顆大 GPU」用。交換板本身也在往高層數 HDI 升級。',
      nodes: ['pcb', 'hdi'], others: '輝達（NVLink Switch）、博通（Tomahawk）',
      label: { at: 1, dy: 0.04 }, instances: switchTrays },
    { id: 'optical', name: '光模組槽', en: 'Optical Modules', color: C.optical,
      brief: '交換機托盤前端的光模組槽，把這座機櫃接到其他機櫃與整個叢集。',
      why: '跨機櫃一定走光，速率一代一代翻倍，用量跟 GPU 數同步放大；1.6T 光模組的電路板也要用高階 HDI。',
      nodes: ['optical', 'hdi'], others: '中際旭創、天孚通信、新易盛、Coherent',
      label: { at: 11, dy: 0.03 }, instances: opticalCages },
    { id: 'power-shelf', name: '電源架', en: 'Power Shelf', color: C.power,
      brief: '把機房送來的電轉成匯流排電壓，分給每個托盤；機櫃上下各有一組。',
      why: '整櫃功率暴增，電源架是功率半導體與大型電解電容的集中地，也是往 800V 高壓直流重構的第一站。',
      nodes: ['power-semi', 'infineon', 'stm', 'capacitor'], others: '台達電、光寶、Vertiv',
      label: { at: 3, dy: 0.04 }, instances: powerShelves },
    { id: 'manifold', name: '液冷歧管與快接頭', en: 'Coolant Manifold', color: C.copper, metalness: 0.5, roughness: 0.4,
      brief: '機櫃背面兩側的進水與回水總管，透過快接頭把冷卻液送進每個托盤的冷板。',
      why: '風冷帶不動高功率機櫃，液冷從選配變成必備；歧管、快接頭、冷卻液分配單元（CDU）形成一條新的散熱供應鏈。',
      nodes: [], others: 'Vertiv、台達電、奇鋐、雙良節能、英維克',
      label: { at: 0, dy: 0.05 }, instances: manifold },
    { id: 'spine', name: '銅纜背板', en: 'Copper Spine', color: C.spine, metalness: 0.3,
      brief: '機櫃背面成束的銅纜，把每個運算托盤接到中段的交換機托盤。',
      why: '機櫃內短距離用銅最便宜也最省電；但高速線材與精密連接器被少數連接器廠掌握。',
      nodes: [], others: '安費諾、立訊精密、兆龍互連',
      label: { at: 0, dy: 0.05 }, instances: spine },
  ],
};

/* ============================================================
   第 2 層：運算托盤（放大版，寬 1.0、深 1.9）
   ============================================================ */
const T_W = 1.0, T_D = 1.9;
const chassis = [
  box([0, 0, 0], [T_W, 0.03, T_D], [0, -0.42, 0]),
  box([-T_W/2 + 0.015, 0.09, 0], [0.03, 0.18, T_D], [-0.35, -0.42, 0]),
  box([ T_W/2 - 0.015, 0.09, 0], [0.03, 0.18, T_D], [ 0.35, -0.42, 0]),
];
const board = [ box([0, 0.045, -0.1], [T_W - 0.12, 0.02, T_D - 0.4], [0, -0.16, 0]) ];

const cpus = [], gpuPkgs = [], dimms = [];
for(const sx of [-1, 1]){
  const x = sx * 0.23;
  cpus.push(box([x, 0.075, 0.42], [0.15, 0.03, 0.15], [0, 0.28, 0]));
  gpuPkgs.push(box([x, 0.08, 0.05],  [0.21, 0.04, 0.21], [0, 0.34, 0]));
  gpuPkgs.push(box([x, 0.08, -0.26], [0.21, 0.04, 0.21], [0, 0.34, 0]));
  for(let k = 0; k < 4; k++){
    dimms.push(box([x + (k - 1.5) * 0.04, 0.085, 0.62], [0.018, 0.05, 0.16], [0, 0.4, 0.1]));
  }
}
const coldplate = [
  box([0, 0.135, 0.05], [T_W - 0.14, 0.035, 1.05], [0, 0.72, 0]),
  box([-0.3, 0.135, -0.65], [0.04, 0.6, 0.04], [0, 0.72, 0], { shape: 'cyl', r: [Math.PI/2, 0, 0] }),
  box([ 0.3, 0.135, -0.65], [0.04, 0.6, 0.04], [0, 0.72, 0], { shape: 'cyl', r: [Math.PI/2, 0, 0] }),
];
const vrms = [];
for(const sx of [-1, 1]) for(const z of [-0.35, -0.05, 0.25]){
  vrms.push(box([sx * 0.42, 0.075, z], [0.05, 0.035, 0.1], [sx * 0.32, 0.12, 0]));
}
const mlccs = [];
for(const sx of [-1, 1]) for(const zc of [0.05, -0.26]) for(let k = 0; k < 7; k++){
  const z = zc - 0.09 + k * 0.03;
  mlccs.push(box([sx * 0.23 - 0.13, 0.062, z], [0.014, 0.012, 0.022], [0, 0.5, 0]));
  mlccs.push(box([sx * 0.23 + 0.13, 0.062, z], [0.014, 0.012, 0.022], [0, 0.5, 0]));
}
const io = [
  box([-0.22, 0.09, 0.84], [0.3, 0.06, 0.1], [0, 0, 0.45]),
  box([ 0.22, 0.09, 0.84], [0.3, 0.06, 0.1], [0, 0, 0.45]),
];

const TRAY = {
  name: '運算托盤', en: 'Compute Tray', up: 'rack',
  view: [1.1, 0.75, 1.3],
  floor: -0.02,
  intro: '抽出一個運算托盤。主機板上是 CPU 與 GPU 組成的運算模組，上面蓋著液冷冷板，板邊是供電模組，晶片四周則是成千上萬顆被動元件。按「拆解」把冷板掀起來；點金色的 GPU 封裝兩次，可以再往下拆到晶片層。',
  note: { text: '這一層看到的電路板、供電與被動元件，都是「同一批名字在不同週期換零件」最密集的地方。' },
  parts: [
    { id: 'chassis', name: '托盤底殼與滑軌', en: 'Tray Chassis', color: C.chassis,
      brief: '金屬底殼與兩側滑軌，讓托盤能像抽屜一樣抽換維修。',
      why: '機構件單價低但量大，是整櫃組裝鏈的一部分。',
      nodes: ['foxconn'], others: '勤誠、川湖（滑軌）',
      label: { at: 0, dy: 0.04 }, instances: chassis },
    { id: 'board', name: '主機板（運算板）', en: 'Compute Board', color: C.board,
      brief: '多層高速電路板，CPU 與 GPU 之間的訊號都在這裡跑。',
      why: '訊號速率一路往上，板材要用最高等級的 CCL，層數與 HDI 階數也跟著升級——這是材料廠與板廠的軍備競賽。',
      nodes: ['pcb', 'hdi', 'ccl', 'tuc'],
      label: { at: 0, dy: 0.03 }, instances: board },
    { id: 'cpu', name: 'CPU', en: 'Host CPU', color: C.cpu,
      brief: '托盤上的通用處理器，負責調度工作與把資料餵給 GPU。',
      why: '與 GPU 做在同一個運算模組上，一樣吃先進製程產能。',
      nodes: ['nvidia', 'tsmc', 'adv-node'],
      label: { at: 0, dy: 0.04 }, instances: cpus },
    { id: 'gpu-pkg', name: 'GPU 封裝', en: 'GPU Package', color: C.gpu, drill: 'pkg', metalness: 0.35, roughness: 0.4,
      brief: '金色方塊就是 AI 加速器——GPU 裸晶與 HBM 一起封裝在載板上。',
      why: '整座機櫃的價值核心；能出貨多少，受先進封裝與 HBM 產能限制。',
      nodes: ['nvidia', 'cowos', 'hbm', 'tsmc'],
      label: { at: 0, dy: 0.05 }, instances: gpuPkgs },
    { id: 'dimm', name: '系統記憶體', en: 'CPU Memory', color: C.dimm,
      brief: 'CPU 旁邊一排記憶體模組，容量大、但速度與頻寬遠不及 HBM。',
      why: '資料中心已成為記憶體最大的需求來源，過去消費性市場的季節循環正在失效。',
      nodes: ['dram-nand', 'samsung-mem', 'sk-hynix', 'micron'],
      label: { at: 1, dy: 0.04 }, instances: dimms },
    { id: 'coldplate', name: '液冷冷板', en: 'Cold Plate', color: C.cold, opacity: 0.78, metalness: 0.45, roughness: 0.3,
      brief: '蓋在 CPU、GPU 上的金屬板，冷卻液從裡面的流道流過帶走熱量，再由管路接回歧管。',
      why: '高功率晶片只能靠液冷；冷板、快接頭、歧管、CDU 形成一條新的散熱供應鏈。',
      nodes: [], others: '奇鋐、雙鴻、Cooler Master、Vertiv',
      label: { at: 0, dy: 0.04 }, instances: coldplate },
    { id: 'vrm', name: '供電模組', en: 'VRM / Power Stage', color: C.vrm,
      brief: '板邊的供電模組，把匯流排送來的電壓一階一階降到晶片需要的一伏以下。',
      why: '每一階降壓都要功率半導體與電感電容；GPU 功耗越高，供電模組越多、越往晶片旁邊靠。',
      nodes: ['power-semi', 'infineon', 'stm', 'passive'],
      label: { at: 1, dy: 0.04 }, instances: vrms },
    { id: 'mlcc', name: '被動元件', en: 'MLCC & Passives', color: C.mlcc,
      brief: '晶片四周密密麻麻的小顆粒——電容、電阻、電感，負責穩壓、濾波與儲能。',
      why: '一塊 AI 主板的被動元件用量是傳統伺服器的好幾倍；高階小尺寸高容量 MLCC 由日廠領先，缺貨時替代順序才輪到韓廠與台廠。',
      nodes: ['passive', 'capacitor', 'yageo', 'walsin', 'holystone', 'semco'], others: '村田、太陽誘電',
      label: { at: 6, dy: 0.03 }, instances: mlccs },
    { id: 'io', name: '前端 I/O 與網卡', en: 'Front I/O & NIC', color: C.io,
      brief: '托盤前端的網路卡與連接器，負責對外連線與管理。',
      why: '網卡速率跟著 GPU 世代升級，連接器的精度與高頻要求也跟著升。',
      nodes: ['pcb'], others: '輝達（ConnectX / BlueField）、安費諾',
      label: { at: 0, dy: 0.04 }, instances: io },
  ],
};

/* ============================================================
   第 3 層：GPU 封裝（放大版，載板 1.2 × 1.2）
   ============================================================ */
const substrate = [ box([0, 0, 0], [1.2, 0.06, 1.2], [0, -0.4, 0]) ];
const interposer = [ box([0, 0.046, 0], [0.92, 0.03, 0.92], [0, -0.15, 0]) ];
const gpuDies = [
  box([-0.14, 0.085, 0], [0.26, 0.045, 0.5], [0, 0.32, 0]),
  box([ 0.14, 0.085, 0], [0.26, 0.045, 0.5], [0, 0.32, 0]),
];
const hbm = [];
for(const sx of [-1, 1]) for(let k = 0; k < 4; k++){
  const x = sx * 0.37, z = -0.345 + k * 0.23;
  const e = [sx * 0.28, 0.42, 0];
  // 最底下一層：邏輯晶片（深灰）
  hbm.push(box([x, 0.068, z], [0.13, 0.014, 0.15], [e[0], e[1], 0], { color: C.logic }));
  // 上面 8 層 DRAM，拆解時每層再多抬一點
  for(let d = 0; d < 8; d++){
    hbm.push(box([x, 0.08 + d * 0.011, z], [0.13, 0.009, 0.15], [e[0], e[1] + 0.045 * (d + 1), 0]));
  }
}
const caps = [];
for(let k = 0; k < 10; k++){
  const t = -0.5 + k * 0.111;
  caps.push(box([t, 0.04, 0.55], [0.03, 0.02, 0.05], [0, 0.14, 0.18]));
  caps.push(box([t, 0.04, -0.55], [0.03, 0.02, 0.05], [0, 0.14, -0.18]));
}
const lid = [ box([0, 0.2, 0], [1.05, 0.035, 1.05], [0, 1.0, 0]) ];

const PKG = {
  name: 'GPU 封裝', en: 'GPU Package', up: 'tray',
  view: [1.0, 0.8, 1.2],
  floor: -0.03,
  intro: '掀開 GPU 封裝的蓋子：最下面是載板，上面一層矽中介層，中介層上並排放著兩顆 GPU 裸晶與八座 HBM 塔——這就是 CoWoS。每一層都是一個產能瓶頸，也各自屬於不同公司。按「拆解」把層一層層抬起來。',
  note: { text: '這顆封裝出貨前還要過晶圓測試、成品測試與系統級測試三道關卡：',
          nodes: ['semi-testing', 'probe-card', 'test-socket', 'mpi', 'chpt', 'yjc', 'winway', 'hongjing'] },
  parts: [
    { id: 'lid', name: '散熱蓋', en: 'Heat Spreader Lid', color: C.lid, opacity: 0.7, metalness: 0.5, roughness: 0.3,
      brief: '金屬蓋板，把晶片的熱傳到上面的冷板；蓋板與晶片之間靠導熱介面材料填縫。',
      why: '封裝面積越做越大，蓋板平整度與介面材料直接影響散熱與良率。',
      nodes: [], others: '導熱介面材料（TIM）廠、散熱蓋金屬件廠',
      label: { at: 0, dy: 0.04 }, instances: lid },
    { id: 'gpu-die', name: 'GPU 裸晶', en: 'GPU Die', color: C.gpu, metalness: 0.35, roughness: 0.4,
      brief: '真正做運算的矽晶片，用最先進製程製造；新一代常把兩顆以上拼成一顆加速器。',
      why: '先進製程只有極少數代工廠做得出來；更上游的 EUV 光刻設備只有一家能造。',
      nodes: ['nvidia', 'tsmc', 'adv-node', 'euv', 'asml'],
      label: { at: 1, dy: 0.04 }, instances: gpuDies },
    { id: 'hbm', name: 'HBM 堆疊', en: 'HBM Stacks', color: C.hbm,
      brief: 'GPU 兩側的塔狀記憶體：最底下一層是邏輯晶片，上面疊多層 DRAM，用矽穿孔（TSV）貫穿連接。',
      why: '頻寬決定 GPU 能多快吃到資料；三家記憶體廠的份額隨世代輪替，邏輯晶片用什麼製程成了新戰場。',
      nodes: ['hbm', 'sk-hynix', 'samsung-mem', 'micron', 'dram-nand'],
      label: { at: 8, dy: 0.04 }, instances: hbm },
    { id: 'interposer', name: '矽中介層', en: 'Silicon Interposer', color: C.interp, metalness: 0.3, roughness: 0.35,
      brief: '一片沒有電晶體、只有細密布線的矽片，讓 GPU 與 HBM 用極短的距離互連。',
      why: '這一層就是 CoWoS 的核心：中介層產能多少，AI 晶片就能出貨多少。',
      nodes: ['cowos', 'tsmc'],
      label: { at: 0, dy: 0.03 }, instances: interposer },
    { id: 'substrate', name: 'ABF 載板', en: 'Package Substrate', color: C.abf,
      brief: '最下層的載板，把中介層的細線路放大到主機板接得上的尺寸，再用錫球焊到主機板。',
      why: '載板面積隨晶片變大；ABF 增層膜由單一日商掌握，頂級載板產能集中在少數日韓廠。',
      nodes: ['abf', 'semco'], others: '揖斐電、新光電氣、味之素（ABF 膜）',
      label: { at: 0, dy: 0.04 }, instances: substrate },
    { id: 'caps', name: '封裝上的電容', en: 'On-package Capacitors', color: C.mlcc,
      brief: '載板邊緣一排小電容，就近穩定晶片供電。',
      why: '最高階、最小尺寸的 MLCC 用在這裡，由日廠領先。',
      nodes: ['passive', 'capacitor'], others: '村田',
      label: { at: 0, dy: 0.03 }, instances: caps },
  ],
};

export default {
  id: 'ai-server-rack',
  name: 'AI 伺服器整櫃',
  start: 'rack',
  levels: { rack: RACK, tray: TRAY, pkg: PKG },
};
