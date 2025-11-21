// main.js

// Three y helpers desde CDN (ES modules)
import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';

// ---- assets 3D / audio (rutas directas, sin ?url)
const model1Url  = './assets/model1.glb';
const ambientUrl = './assets/audio.mp3';      // o .wav, poné la extensión real
const whooshUrl  = './assets/meteoritos.mp3'; // idem

// ---- covers de la sección "Galería"
const cover1 = './assets/galeria/frag1_galeria.png';
const cover2 = './assets/galeria/frag2_galeria.png';
const cover3 = './assets/galeria/frag3_galeria.png';
const cover4 = './assets/galeria/frag4_galeria.png';


/* ===================== FRAGMENTOS ===================== */
const FRAGMENTS = [
  {
    id: 'frag-01',
    title: 'Fragmento 1',
    model: model1Url,
    cover: cover1,
    address: 'Buenos Aires 217 esq. Maciel',
    dates: '1880–1900',
    obs: '',
    desc: 'Edificio construido a fines del siglo XIX, desarrollado en dos niveles, que albergaba una vivienda en cada uno de ellos. Actualmente se encuentra desocupado, habiéndose tapiado las aberturas de planta baja. La fachada conserva la vivienda tipo standard de dos niveles, con sobria ornamentación –aunque con pérdidas–, sobre todo en el piso superior: balcón corrido con herrería trabajada, pilastras y frontones curvos y triangulares enmarcando vanos. Exteriormente en regular estado de conservación; requiere mantenimiento.',
    gallery: [
      { src: './assets/frag1_1983.jpg', year: 1983 },
      { src: './assets/frag1_2000.jpg', year: 2000 },
      { src: './assets/frag1_2010.jpg', year: 2010 }
    ]
  },
  {
    id: 'frag-02',
    title: 'Fragmento 2',
    model: model1Url,
    cover: cover2,
    address: 'Buenos Aires esq. Maciel',
    dates: '1900–1920',
    obs: 'Padrón con dos construcciones. Datos del edificio de dos niveles próximo a calle Maciel. Puertas tapiadas.',
    desc: 'Edificio de fines del siglo XIX, dos niveles, una vivienda por nivel. Actualmente desocupado con aberturas de planta baja tapiadas. Mantiene tipología standard con ornamentación sobria (con pérdidas), concentrada en el nivel superior: balcón corrido, herrería trabajada, pilastras y frontones curvos/triangulares. Exteriormente en regular estado; requiere mantenimiento.',
    gallery: [
      { src: './assets/frag2_1983.jpg', year: 1983 },
      { src: './assets/frag2_2000.jpg', year: 2000 },
      { src: './assets/frag2_2010.jpg', year: 2010 }
    ]
  },
  {
    id: 'frag-03',
    title: 'Fragmento 3',
    model: model1Url,
    cover: cover3,
    address: 'Maciel 1312 esq. Buenos Aires',
    dates: '1902',
    obs: 'Se presume ocupación informal. Pese al derrumbe de la cubierta en el sector frontal, el sector posterior estaría habitado. “1902” figura en fachada. Tapiado de vanos posterior al 2000.',
    desc: 'Vivienda tipo standard, principios del siglo XX, un nivel. Vanos tapiados y derrumbe de cubierta en el sector frontal; según vecinos, funciona como vivienda (presumiblemente ocupación informal). La fachada perdió balaustres de balcones y pretil, pero conserva ritmo y proporción de vanos con arcos escarzanos y decoración en torno a los mismos (destaca el sector central). Exteriormente en regular estado.',
    gallery: [
      { src: './assets/frag3_1983.jpg', year: 1983 },
      { src: './assets/frag3_2000.jpg', year: 2000 },
      { src: './assets/frag3_2010.jpg', year: 2010 }
    ]
  },
  {
    id: 'frag-04',
    title: 'Fragmento 4',
    model: model1Url,
    cover: cover4,
    address: 'Maciel 1330 esq. Buenos Aires',
    dates: '1902',
    obs: 'Según vecinos, vivienda unifamiliar. Tapiado de vanos posterior a 2000. Fue pensión (posibles alteraciones interiores).',
    desc: 'Vivienda tipo standard de principios del siglo XX, un nivel con subsuelo. Usada como pensión; actualmente funcionaría como vivienda. Destaca la decoración de fachada en torno a vanos (arcos de medio punto), bajo el balcón del pretil y la presencia de balcones de mármol. Sin grandes modificaciones exteriores, pero con ventanas tapiadas. Exteriormente en regular estado.',
    gallery: [
      { src: './assets/frag4_1983.jpg', year: 1983 },
      { src: './assets/frag4_2000.jpg', year: 2000 },
      { src: './assets/frag4_2010.jpg', year: 2010 }
    ]
  }
];

/* =========== CAPAS / ESPACIO (caída) =========== */
const DEPTH_LAYERS = [
  { name:'cerca', range:{ x:[-8,8],   y:[10,25],  z:[-8,8]   }, speed: 0.09 },
  { name:'medio', range:{ x:[-15,15], y:[25,60],  z:[-15,15] }, speed: 0.06 },
  { name:'lejos', range:{ x:[-25,25], y:[60,120], z:[-25,25] }, speed: 0.04 }
];
const DESPAWN_Y = -70;
const NEAR_CORRIDOR = { x: [-3, 3], z: [-3, 3], y: [14, 30] };
let NEAR_PROB = 0.35;

/* =================== NAV / SECCIONES =================== */
const $home    = document.getElementById('home');
const $gallery = document.getElementById('gallery');
const $project = document.getElementById('project');
const nav = {
  home   : document.getElementById('nav-home'),
  gallery: document.getElementById('nav-gallery'),
  project: document.getElementById('nav-project')
};

let currentView = 'home';
function setView(view){
  currentView = view;
  if ($home)    $home.style.display    = view==='home'    ? 'block' : 'none';
  if ($gallery) $gallery.style.display = view==='gallery' ? 'block' : 'none';
  if ($project) $project.style.display = view==='project' ? 'block' : 'none';
  Object.entries(nav).forEach(([k, el])=> el?.classList.toggle('active', k===view));
  if (view !== 'home') stopAllWhooshes();
  refreshAudioState();
}
nav.home?.addEventListener('click',  e=>{ e.preventDefault(); setView('home'); });
nav.gallery?.addEventListener('click',e=>{ e.preventDefault(); setView('gallery'); });
nav.project?.addEventListener('click',e=>{ e.preventDefault(); setView('project'); });

/* ======================= GALERÍA (covers + mapa) ======================= */
function buildGallery(){
  if (!$gallery) return;
  $gallery.innerHTML = '';

  // contenedor general
  const layout = document.createElement('div');
  layout.className = 'g-layout';

  // mapa de calles + rayos
  const map = document.createElement('div');
  map.className = 'g-map';
  map.innerHTML = `
    <div class="street street-ba"><span>Buenos Aires</span></div>
    <div class="street street-maciel"><span>Maciel</span></div>

    <div class="ray ray-1"></div>
    <div class="ray ray-2"></div>
    <div class="ray ray-3"></div>
    <div class="ray ray-4"></div>
  `;

  // contenedor de tarjetas
  const grid = document.createElement('div');
  grid.className = 'g-grid';

  FRAGMENTS.forEach(f=>{
    const card = document.createElement('button');
    card.className = `g-card g-pos-${f.id}`;
    card.innerHTML = `
      <img class="g-cover" src="${f.cover}" alt="${f.title}">
      <div class="g-blur"></div>
      <div class="g-title">${f.title}</div>
    `;
    card.onclick = () => openModal(f);
    grid.appendChild(card);
  });

  layout.appendChild(map);
  layout.appendChild(grid);
  $gallery.appendChild(layout);

    // --- parallax suave del mapa (solo mueve las líneas, no las tarjetas) ---
  $gallery.addEventListener('pointermove', e => {
    const rect = $gallery.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 a 0.5
    const ny = (e.clientY - rect.top)  / rect.height - 0.5;

    const dist = 18; // cuanto se mueve máx en px (muy suave)
    const tx = -nx * dist;
    const ty = -ny * dist;

    map.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
  });

  $gallery.addEventListener('pointerleave', () => {
    map.style.transform = 'translate3d(0, 0, 0)';
  });

}
buildGallery();

/* ======================== MODAL ======================== */
const $modal    = document.getElementById('modal');
const $mTitle   = document.getElementById('m-title');
const $mMeta    = document.getElementById('m-meta');
const $mDesc    = document.getElementById('m-desc');
const $mAudio   = document.getElementById('m-audio');
const $mClose   = document.getElementById('m-close');
const $mAddress = document.getElementById('m-address');
const $mDates   = document.getElementById('m-dates');
const $mDatesRow= document.getElementById('m-dates-row');
const $mObs     = document.getElementById('m-obs');
const $mObsRow  = document.getElementById('m-obs-row');

let modalOpen   = false;
let globalMuted = false;

/* ---------- MINI VIEWER 3D (en el modal, arriba) ---------- */
let mRenderer, mScene, mCamera, mControls, mAnimating = false, mCurrent = null;

function initModalViewer(){
  if (mRenderer) return;
  const canvas = document.getElementById('m-canvas');
  mRenderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  mRenderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  mScene = new THREE.Scene(); // fondo transparente
  mCamera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
  mCamera.position.set(0.8, 0.6, 1.8);
  mScene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 1));
  const d = new THREE.DirectionalLight(0xffffff, 0.9);
  d.position.set(3, 5, 4);
  mScene.add(d);
  mControls = new OrbitControls(mCamera, mRenderer.domElement);
  mControls.enableDamping = true;
  mControls.enablePan = false;
  mControls.minDistance = 0.6;
  mControls.maxDistance = 5;
  onModalResize();
  window.addEventListener('resize', onModalResize);
}
function onModalResize(){
  if (!mRenderer) return;
  const el = document.getElementById('m-view');
  if (!el) return;
  const w = el.clientWidth || 400;
  const h = el.clientHeight || 260;
  mRenderer.setSize(w, h, false);
  mCamera.aspect = w / h;
  mCamera.updateProjectionMatrix();
}
function clearModalModel(){
  if (!mCurrent) return;
  mScene.remove(mCurrent);
  mCurrent.traverse(o=>{
    if (o.geometry) o.geometry.dispose?.();
    if (o.material){
      if (Array.isArray(o.material)) o.material.forEach(m=>m.dispose?.());
      else o.material.dispose?.();
    }
  });
  mCurrent = null;
}
function showFragmentInViewer(fragment){
  initModalViewer();
  clearModalModel();
  const proto = protoByUrl.get(fragment.model);
  if (!proto){ console.warn('No hay prototipo para el modal:', fragment.model); return; }
  const root = new THREE.Object3D();
  const clone = proto.clone(true);
  root.add(clone);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3(); box.getSize(size);
  const center = new THREE.Vector3(); box.getCenter(center);
  root.position.sub(center);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  root.scale.setScalar(1.0 / maxDim);
  mScene.add(root);
  mCurrent = root;
  if (!mAnimating){
    mAnimating = true;
    const loop = ()=>{
      if (!mAnimating) return;
      mControls.update();
      mRenderer.render(mScene, mCamera);
      requestAnimationFrame(loop);
    };
    loop();
  }
}

/* ---------- abrir/cerrar modal ---------- */
function openModal(f){
  if(!$modal) return;
  $mTitle.textContent = f.title || 'Fragmento';
  $mMeta.textContent  = f.meta || '';
  $mDesc.textContent  = f.desc || '';
  $mAddress.textContent = f.address || '—';

  if (f.dates && f.dates.trim()){
    $mDates.textContent = f.dates;
    $mDatesRow.style.display = '';
  } else { $mDates.textContent = ''; $mDatesRow.style.display = 'none'; }

  if (f.obs && f.obs.trim()){
    $mObs.textContent = f.obs;
    $mObsRow.style.display = '';
  } else { $mObs.textContent = ''; $mObsRow.style.display = 'none'; }

  // visor 3D
  showFragmentInViewer(f);

  // galería interna
  let currentImg = 0;
  function showImage(i){
    if (!f.gallery || f.gallery.length===0) return;
    const item = f.gallery[i];
    const gImg  = document.getElementById('g-img');
    const gYear = document.getElementById('g-year');
    if (gImg)  gImg.src = item.src;
    if (gYear) gYear.textContent = item.year;
  }
  showImage(0);
  const prevBtn = document.querySelector('.g-prev');
  const nextBtn = document.querySelector('.g-next');
  if (prevBtn) prevBtn.onclick = ()=>{
    if (!f.gallery) return;
    currentImg = (currentImg - 1 + f.gallery.length) % f.gallery.length;
    showImage(currentImg);
  };
  if (nextBtn) nextBtn.onclick = ()=>{
    if (!f.gallery) return;
    currentImg = (currentImg + 1) % f.gallery.length;
    showImage(currentImg);
  };

  // audio & estado
  $mAudio.src = f.audio || '';
  modalOpen = true;
  stopAllWhooshes();
  refreshAudioState();
  $modal.style.display = 'flex';
  $modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}
function closeModal(){
  if(!$modal) return;
  $modal.style.display = 'none';
  $modal.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
  if ($mAudio){ $mAudio.pause(); $mAudio.currentTime = 0; }
  mAnimating = false;
  clearModalModel();
  modalOpen = false;
  refreshAudioState();
}
$mClose?.addEventListener('click', closeModal);
$modal?.addEventListener('pointerdown', e=>{ if(e.target===$modal) closeModal(); });

/* ====================== ESCENA 3D PRINCIPAL ====================== */
const canvas   = document.getElementById('three');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x06070a);
scene.fog = new THREE.Fog(0x06070a, 20, 250);

const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
camera.position.set(0, 5, 14);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.rotateSpeed = 0.85;

scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 0.9));
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(10, 30, 15);
scene.add(dir);

/* ==================== AUDIO GLOBAL ==================== */
const listener    = new THREE.AudioListener();
camera.add(listener);
const audioLoader = new THREE.AudioLoader();

let ambient       = null;
let ambientReady  = false;
const DEFAULT_AMBIENT = 0.18;

function setAmbientVolume(v){ if (ambient) ambient.setVolume(v); }
function initAmbient(){
  if (ambientReady) return;
  ambient = new THREE.Audio(listener);
  audioLoader.load(
    ambientUrl,
    buffer=>{
      ambient.setBuffer(buffer);
      ambient.setLoop(true);
      ambient.setVolume(DEFAULT_AMBIENT);
      ambient.play();
      ambientReady = true;
      refreshAudioState();
    },
    undefined,
    err => console.error('❌ error cargando ambient:', ambientUrl, err)
  );
}
let duckTimer = null;
function duckAmbient(level = 0.06, ms = 900){
  if (!ambientReady) return;
  if (globalMuted || modalOpen || currentView!=='home') return;
  setAmbientVolume(level);
  if (duckTimer) clearTimeout(duckTimer);
  duckTimer = setTimeout(()=> refreshAudioState(), ms);
}

// 🔹 Maneja el primer click que activa el ambiente (después del loader)
function handleFirstPointerDown() {
  // si la landing sigue activa, todavía no activamos el ambiente
  if (window.__LOADER_ACTIVE__) return;

  if (!ambientReady) {
    initAmbient();
  }

  // una vez que arrancamos el ambiente, ya no necesitamos este listener
  window.removeEventListener('pointerdown', handleFirstPointerDown);
}

window.addEventListener('pointerdown', handleFirstPointerDown);

const audioBtn = document.getElementById('audio-toggle');
if (audioBtn){
  audioBtn.addEventListener('click', ()=>{
    globalMuted = !globalMuted;
    if (globalMuted) {
      stopAllWhooshes();
      if ($mAudio){ $mAudio.pause(); $mAudio.currentTime = 0; }
    }
    refreshAudioState();
    audioBtn.textContent = globalMuted ? '🔇' : '🔊';
    audioBtn.setAttribute('aria-label', globalMuted ? 'Audio silenciado' : 'Audio activado');
  });
}

/* ================= WHOOSH (POOL) ================= */
const MAX_SIMULT = 6;
const whooshPool = [];
let whooshBuffer = null;

audioLoader.load(
  whooshUrl,
  buffer=>{
    whooshBuffer = buffer;
    console.log('✅ whoosh cargado:', whooshUrl);
  },
  undefined,
  err=> console.error('❌ error cargando whoosh:', whooshUrl, err)
);
for (let i=0; i<MAX_SIMULT; i++){
  whooshPool.push(new THREE.PositionalAudio(listener));
}
function getFreeWhoosh(){ for (const a of whooshPool){ if (!a.isPlaying) return a; } return null; }
function stopAllWhooshes(){ whooshPool.forEach(a=>{ try{ a.stop(); }catch(_){ } if (a.parent) a.parent.remove(a); }); }
function playWhooshOn(target, channel, volume, rate, refDist=7, maxDist=40){
  channel.setBuffer(whooshBuffer);
  channel.setRefDistance(refDist);
  channel.setMaxDistance(maxDist);
  channel.setVolume(volume);
  channel.setPlaybackRate(rate);
  const filter = listener.context.createBiquadFilter();
  filter.type = 'peaking'; filter.frequency.value = 3000; filter.Q.value = 1.0; filter.gain.value = 6;
  channel.setFilter(filter);
  target.add(channel);
  channel.play();
  const originalOnEnded = channel.source.onended;
  channel.source.onended = (e) => {
    try { if (originalOnEnded) originalOnEnded(e); } catch(_) {}
    if (channel.parent) channel.parent.remove(channel);
  };
}

function allowWhoosh(){
  if (window.__LOADER_ACTIVE__) return false;
  return (!globalMuted && !modalOpen && currentView==='home' && whooshBuffer && listener.context.state==='running');
}

/* ================== CARGA DE MODELOS ================== */
const loader = new GLTFLoader();
const protoByUrl = new Map();
const holders = [];
const velocities = [];

function randIn([min,max]){ return min + Math.random()*(max-min); }
function makeVelocity(baseSpeed){
  return new THREE.Vector3(
    (Math.random()-0.5)*0.025,
    -baseSpeed - Math.random()*0.02,
    (Math.random()-0.5)*0.025
  );
}
function spawnAt(root, layer){
  const useNear = Math.random() < NEAR_PROB;
  if (useNear){
    root.position.set(randIn(NEAR_CORRIDOR.x), randIn(NEAR_CORRIDOR.y), randIn(NEAR_CORRIDOR.z));
  } else {
    root.position.set(randIn(layer.range.x), randIn(layer.range.y), randIn(layer.range.z));
  }
  velocities.push( makeVelocity(layer.speed) );
  root.userData.lastPlayed = 0;
}
function loadPrototype(url){
  return new Promise(resolve=>{
    loader.load(
      url,
      (gltf)=>{
        const obj  = gltf.scene;
        const box  = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3(); box.getSize(size);
        const scale = 2 / Math.max(size.x||1, size.y||1, size.z||1);
        obj.scale.setScalar(scale);
        protoByUrl.set(url, obj);
        resolve(obj);
      },
      undefined,
      (err)=>{
        console.error('⚠️ fallo GLB, uso cilindro:', url, err);
        const mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.5, 2, 8),
          new THREE.MeshStandardMaterial({ color: 0x8a7f6a })
        );
        mesh.rotation.z = Math.PI/4;
        protoByUrl.set(url, mesh);
        resolve(mesh);
      }
    );
  });
}
async function preloadAll(){
  const unique = [...new Set(FRAGMENTS.map(f=>f.model))];
  await Promise.all(unique.map(loadPrototype));
}
function makeInstance(fragment, layer){
  const proto = protoByUrl.get(fragment.model);
  const root  = new THREE.Object3D();
  const clone = proto.clone(true);
  root.add(clone);
  root.userData.fragment = fragment;
  const pa = new THREE.PositionalAudio(listener);
  pa.setRefDistance(6); pa.setMaxDistance(40); pa.setRolloffFactor(1.5); pa.setDistanceModel('inverse');
  root.add(pa);
  root.userData.audio = { pa, lastPlayed: 0 };
  spawnAt(root, layer);
  scene.add(root);
  holders.push(root);
}

// inicio: uno cerca por fragmento + extras por capa
(async ()=>{
  await preloadAll();
  FRAGMENTS.forEach(f=>{
    const proto = protoByUrl.get(f.model);
    const root  = new THREE.Object3D();
    const clone = proto.clone(true);
    root.add(clone);
    root.userData.fragment = f;
    const pa = new THREE.PositionalAudio(listener);
    pa.setRefDistance(6); pa.setMaxDistance(40); pa.setRolloffFactor(1.5); pa.setDistanceModel('inverse');
    root.add(pa);
    root.userData.audio = { pa, lastPlayed: 0 };
    root.position.set(randIn(NEAR_CORRIDOR.x), randIn(NEAR_CORRIDOR.y), randIn(NEAR_CORRIDOR.z));
    scene.add(root);
    holders.push(root);
    velocities.push( makeVelocity(DEPTH_LAYERS[0].speed * 1.2) );
    DEPTH_LAYERS.forEach(L=>{ if (Math.random()>0.5) makeInstance(f, L); });
  });

  // avisar al loader que la app está lista
  window.__APP_READY__ = true;
  window.dispatchEvent(new Event('app:ready'));
})();

/* =================== RAYCAST (click abre modal) =================== */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown', e=>{
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(holders, true);
  if(hits.length){
    let obj = hits[0].object;
    while (obj && !holders.includes(obj)) obj = obj.parent;
    if (obj && obj.userData.fragment) openModal(obj.userData.fragment);
  }
});

/* =============== ORQUESTA DE AUDIO GLOBAL =============== */
function refreshAudioState(){
  if (ambientReady){
    if (globalMuted || modalOpen){ 
      setAmbientVolume(0); 
    } else if (currentView === 'home') {
      setAmbientVolume(DEFAULT_AMBIENT);
    } else {
      setAmbientVolume(0);
    }
  }
}

/* ====================== LOOP ======================= */
function animate(){
  requestAnimationFrame(animate);
  const now = performance.now();
  for (let i=0; i<holders.length; i++){
    const h = holders[i];
    const v = velocities[i];
    h.position.add(v);
    h.rotation.x += 0.0025;
    h.rotation.y += 0.003;

    // whoosh por proximidad + cooldown
    const audioData = h.userData.audio;
    if (audioData && allowWhoosh()) {
      const dist = camera.position.distanceTo(h.position);
      const elapsed = now - (audioData.lastPlayed || 0);
      if (dist < 40 && elapsed > 1000) {
        const ch = getFreeWhoosh();
        if (ch) {
          const gain = THREE.MathUtils.clamp(1 - dist/40, 0.4, 1.1);
          const rate = 0.95 + Math.random()*0.1;
          playWhooshOn(h, ch, gain, rate);
          duckAmbient(0.05, 800);
          audioData.lastPlayed = now;
        }
      }
    }

    // respawn
    if (h.position.y < DESPAWN_Y){
      const layer = DEPTH_LAYERS[Math.floor(Math.random()*DEPTH_LAYERS.length)];
      const useNear = (i % 4 === 0) || (Math.random() < NEAR_PROB);
      if (useNear){
        h.position.set(randIn(NEAR_CORRIDOR.x), randIn(NEAR_CORRIDOR.y), randIn(NEAR_CORRIDOR.z));
        velocities[i].copy( makeVelocity(layer.speed * 1.2) );
      } else {
        h.position.set(randIn(layer.range.x), randIn(layer.range.y), randIn(layer.range.z));
        velocities[i].copy( makeVelocity(layer.speed) );
      }
      h.userData.lastPlayed = 0;
    }
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();

/* ===================== RESIZE ===================== */
function onResize(){
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || (window.innerHeight - 64);
  renderer.setSize(w, h, false);
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);
onResize();
