/* ============================================================
   科技供應鏈知識庫 · 3D 拆解引擎（rack3d.js）
   ------------------------------------------------------------
   這支是「通用引擎」：讀一份 model 規格（見 assets/models/*.js），
   在畫布上畫出可旋轉、可拆解、可點選、可逐層鑽入的 3D 模型。
   模型長什麼樣、哪個零件接到知識庫哪些節點，都寫在 model 檔，
   不用改這裡。

   規格摘要（完整範例見 assets/models/ai-server-rack.js）：
   model = {
     start: "rack",                       // 一開始顯示的層級
     levels: {
       rack: {
         name, en, intro,                 // 面板上顯示的層級說明
         up: null | "上一層 id",
         view: [x, y, z],                 // 預設視角方向（相機位置的方向向量）
         note: { text, nodes:[...] },     // 選填：沒選零件時顯示的補充（例如測試）
         parts: [
           { id, name, en, brief, why,    // 零件說明
             nodes: ["tsmc", ...],        // 對應 data.js 的節點 id（自動變成可點 chip）
             others: "村田、太陽誘電",      // 尚未建節點的公司（純文字）
             drill: "tray",               // 選填：再點一次可鑽入哪一層
             color: "#b6843a", opacity: 1,
             label: { at: 0, dy: 0.05 },  // 標籤錨在第幾個 instance、往上抬多少
             instances: [
               { p:[x,y,z], s:[w,h,d], e:[dx,dy,dz], shape:"box"|"cyl", r:[rx,ry,rz], color }
               //  p 位置、s 尺寸、e 拆解時的位移向量、r 旋轉（弧度）
             ] }
         ]
       }, ...
     }
   }
   ============================================================ */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ---------- 只建幾何、不碰 DOM：可在 node 裡測試 ---------- */
export function buildModel(spec){
  const levels = {};
  for(const [lid, L] of Object.entries(spec.levels)){
    const group = new THREE.Group();
    group.name = lid;
    group.visible = false;
    const parts = {};
    const meshes = [];
    for(const P of L.parts){
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(P.color || '#999999'),
        roughness: P.roughness ?? 0.62,
        metalness: P.metalness ?? 0.12,
        transparent: (P.opacity ?? 1) < 1,
        opacity: P.opacity ?? 1,
      });
      const part = { ...P, material: mat, meshes: [] };
      P.instances.forEach((I, idx) => {
        const s = I.s;
        let geo;
        if(I.shape === 'cyl'){
          // s = [直徑, 高, 直徑]；預設沿 y 軸
          geo = new THREE.CylinderGeometry(s[0]/2, s[2]/2, s[1], 20);
        } else {
          geo = new THREE.BoxGeometry(s[0], s[1], s[2]);
        }
        let m = mat;
        if(I.color){
          m = mat.clone(); m.color = new THREE.Color(I.color);
          part.extraMats = part.extraMats || []; part.extraMats.push(m);
        }
        const mesh = new THREE.Mesh(geo, m);
        mesh.position.set(...I.p);
        if(I.r) mesh.rotation.set(...I.r);
        mesh.userData = {
          partId: P.id, index: idx,
          base: new THREE.Vector3(...I.p),
          explode: new THREE.Vector3(...(I.e || [0,0,0])),
          size: s,
        };
        group.add(mesh);
        part.meshes.push(mesh);
        meshes.push(mesh);
      });
      parts[P.id] = part;
    }
    levels[lid] = { id: lid, spec: L, group, parts, meshes };
  }
  return levels;
}

/* 套用拆解程度（0 ~ 1）到某一層的所有 mesh */
export function applyExplode(level, amount){
  for(const m of level.meshes){
    const u = m.userData;
    m.position.copy(u.base).addScaledVector(u.explode, amount);
  }
}

/* 算某一層在拆解前後的包圍球，用來自動對相機 */
export function boundingSphere(level, amounts = [0, 0.6]){
  const box = new THREE.Box3();
  const tmp = new THREE.Box3();
  for(const amt of amounts){
    applyExplode(level, amt);
    for(const m of level.meshes){
      m.updateMatrixWorld(true);
      tmp.setFromObject(m);
      box.union(tmp);
    }
  }
  applyExplode(level, 0);
  const sphere = new THREE.Sphere();
  box.getBoundingSphere(sphere);
  return sphere;
}

/* ---------- 掛到頁面上 ---------- */
export function mountRack(opts){
  const { stage, labelsEl, model } = opts;
  const on = opts.on || {};
  const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  // 渲染器
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.className = 'r3d-canvas';
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 100);

  // 燈光：柔和的紙面研究筆記風，不要太像遊戲
  scene.add(new THREE.HemisphereLight(0xfff6e6, 0x8c8578, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 1.35); key.position.set(4, 6, 5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.5); fill.position.set(-5, 2, -4); scene.add(fill);

  // 地面陰影感：一片淡淡的圓盤
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(1, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.07 })
  );
  ground.rotation.x = -Math.PI/2;
  scene.add(ground);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.7;
  controls.maxPolarAngle = Math.PI * 0.52;
  controls.addEventListener('start', () => { controls.autoRotate = false; interacted = true; });

  const levels = buildModel(model);
  for(const L of Object.values(levels)) scene.add(L.group);

  let current = null;         // 目前層級
  let selected = null;        // 目前選到的 part id
  let explode = 0, explodeTarget = 0;
  let showLabels = false;
  let interacted = false;
  let camTween = null;

  /* ---------- 標籤（HTML 疊在畫布上） ---------- */
  const labelMap = {};  // partId -> div
  function buildLabels(level){
    labelsEl.innerHTML = '';
    for(const k in labelMap) delete labelMap[k];
    for(const P of level.spec.parts){
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'r3d-label';
      d.innerHTML = `<span class="nm">${esc(P.name)}</span>${P.drill ? '<span class="dr">可鑽入</span>' : ''}`;
      d.addEventListener('click', e => { e.stopPropagation(); select(P.id); });
      labelsEl.appendChild(d);
      labelMap[P.id] = d;
    }
  }
  const v3 = new THREE.Vector3();
  function updateLabels(){
    if(!current) return;
    const w = stage.clientWidth, h = stage.clientHeight;
    const camDir = new THREE.Vector3(); camera.getWorldDirection(camDir);
    for(const P of current.spec.parts){
      const el = labelMap[P.id]; if(!el) continue;
      // 窄螢幕（手機）拆解時不自動全部標籤，太擠；只標選到的，或按「標籤」全開
      const auto = explode > 0.35 && w >= 600;
      const visible = showLabels || auto || selected === P.id;
      if(!visible){ el.style.display = 'none'; continue; }
      const part = current.parts[P.id];
      const at = (P.label && P.label.at) || 0;
      const m = part.meshes[Math.min(at, part.meshes.length-1)];
      v3.copy(m.position);
      v3.y += (m.userData.size[1] / 2) + ((P.label && P.label.dy) ?? 0.04);
      // 相機背後的不顯示
      const toCam = v3.clone().sub(camera.position);
      if(toCam.dot(camDir) <= 0){ el.style.display = 'none'; continue; }
      v3.project(camera);
      const x = (v3.x * 0.5 + 0.5) * w, y = (-v3.y * 0.5 + 0.5) * h;
      el.style.display = '';
      el.style.transform = `translate(-50%,-100%) translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      el.classList.toggle('on', selected === P.id);
    }
  }

  /* ---------- 相機 ---------- */
  function frameLevel(level, animate){
    const sphere = boundingSphere(level);
    const aspect = Math.max(0.2, stage.clientWidth / Math.max(1, stage.clientHeight));
    const fov = THREE.MathUtils.degToRad(camera.fov);
    // 直式畫面以水平視角為準，橫式以垂直視角為準
    const half = Math.min(fov / 2, Math.atan(Math.tan(fov / 2) * aspect));
    const dist = sphere.radius / Math.sin(half) * 1.02;
    const dir = new THREE.Vector3(...(level.spec.view || [1, 0.7, 1.3])).normalize();
    const pos = sphere.center.clone().addScaledVector(dir, dist);
    ground.position.set(sphere.center.x, (level.spec.floor ?? 0) - 0.001, sphere.center.z);
    ground.scale.setScalar(sphere.radius * 0.6);
    controls.minDistance = dist * 0.35;
    controls.maxDistance = dist * 2.2;
    if(animate){
      camTween = { t: 0, dur: 0.75,
        p0: camera.position.clone(), p1: pos,
        c0: controls.target.clone(), c1: sphere.center.clone() };
    } else {
      camera.position.copy(pos);
      controls.target.copy(sphere.center);
      controls.update();
    }
  }

  /* ---------- 選取 ---------- */
  function setHighlight(part, onoff){
    const mats = [part.material].concat(part.extraMats || []);
    for(const m of mats){
      m.emissive.set(onoff ? 0x2f6fb3 : 0x000000);
      m.emissiveIntensity = onoff ? 0.42 : 1;
    }
  }
  function select(partId, { drillIfRepeat = false } = {}){
    if(!current) return;
    const part = partId ? current.parts[partId] : null;
    if(partId && !part) return;
    if(drillIfRepeat && selected && selected === partId && part.drill){
      showLevel(part.drill);
      return;
    }
    if(selected && current.parts[selected]) setHighlight(current.parts[selected], false);
    selected = partId || null;
    if(part) setHighlight(part, true);
    on.select && on.select(part ? part : null, current);
  }

  /* ---------- 層級 ---------- */
  function showLevel(lid, { animate = true } = {}){
    const next = levels[lid]; if(!next) return;
    if(current){
      if(selected && current.parts[selected]) setHighlight(current.parts[selected], false);
      current.group.visible = false;
    }
    selected = null;
    current = next;
    current.group.visible = true;
    explode = 0; explodeTarget = 0;
    applyExplode(current, 0);
    buildLabels(current);
    frameLevel(current, animate);
    on.level && on.level(current);
    on.explode && on.explode(0);
    on.select && on.select(null, current);
  }

  /* ---------- 指標：點一下選零件 ---------- */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let downAt = null;
  renderer.domElement.addEventListener('pointerdown', e => { downAt = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', e => {
    if(!downAt || !current) return;
    const dx = e.clientX - downAt[0], dy = e.clientY - downAt[1];
    downAt = null;
    if(dx*dx + dy*dy > 36) return;      // 拖曳不算點選
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(current.meshes, false);
    if(hits.length){
      select(hits[0].object.userData.partId, { drillIfRepeat: true });
    } else {
      select(null);
    }
  });

  /* ---------- 尺寸 ---------- */
  function resize(){
    const w = stage.clientWidth, h = stage.clientHeight;
    if(!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if(current && !interacted) frameLevel(current, false);
  }
  new ResizeObserver(resize).observe(stage);

  /* ---------- 主迴圈 ---------- */
  const clock = new THREE.Clock();
  function tick(){
    const dt = Math.min(0.05, clock.getDelta());
    if(Math.abs(explodeTarget - explode) > 0.001){
      explode += (explodeTarget - explode) * Math.min(1, dt * 6);
      if(Math.abs(explodeTarget - explode) < 0.002) explode = explodeTarget;
      if(current) applyExplode(current, explode);
      on.explode && on.explode(explode);
    }
    if(camTween){
      camTween.t += dt;
      const k = Math.min(1, camTween.t / camTween.dur);
      const s = k < 0.5 ? 2*k*k : -1 + (4 - 2*k) * k;   // easeInOutQuad
      camera.position.lerpVectors(camTween.p0, camTween.p1, s);
      controls.target.lerpVectors(camTween.c0, camTween.c1, s);
      if(k >= 1) camTween = null;
    }
    controls.update();
    renderer.render(scene, camera);
    updateLabels();
    requestAnimationFrame(tick);
  }

  resize();
  showLevel(model.start, { animate: false });
  tick();

  return {
    showLevel: lid => showLevel(lid),
    select: id => select(id),
    setExplode: v => { explodeTarget = Math.max(0, Math.min(1, v)); },
    getExplode: () => explodeTarget,
    toggleLabels: v => { showLabels = (v === undefined) ? !showLabels : !!v; return showLabels; },
    resetView: () => { if(current){ interacted = false; controls.autoRotate = true; frameLevel(current, true); } },
    current: () => current,
    levels,
  };
}
