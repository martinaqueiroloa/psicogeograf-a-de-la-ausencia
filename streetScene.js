// streetScene.js

// Usamos los mismos imports que en main.js, desde esm.sh
import * as THREE from 'https://esm.sh/three@0.161.0';
import { OrbitControls } from 'https://esm.sh/three@0.161.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';

// ajustá el nombre si tu archivo se llama distinto
const CALLE_MODEL_URL = './assets/calle.glb';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('street-container');
  if (!container) return;

  // Tamaño inicial (si la sección está oculta, usamos ventana)
  const width  = container.clientWidth  || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  // ---- ESCENA BÁSICA ----
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.set(0, 4, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // Luces suaves (aunque para Points no son tan importantes)
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.4);
  scene.add(hemi);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 2, 0);

  // ---- CARGAR calle.glb Y CONVERTIR A NUBE DE PUNTOS ----
  const loader = new GLTFLoader();

  loader.load(
    CALLE_MODEL_URL,
    (gltf) => {
      const root = gltf.scene;
      let bbox = new THREE.Box3().makeEmpty();

      root.traverse((child) => {
        if (child.isMesh) {
          const geo = child.geometry;
          if (!geo) return;

          const geometry = geo.clone();
          geometry.computeBoundingBox();

          // material de puntos blanco
          const material = new THREE.PointsMaterial({
            size: 0.05,       // ajustá más grande / más chico
            color: 0xffffff,  // blanco total
            sizeAttenuation: true
          });

          const points = new THREE.Points(geometry, material);

          // respetar posición/rotación/escala del mesh original
          points.position.copy(child.position);
          points.rotation.copy(child.rotation);
          points.scale.copy(child.scale);

          scene.add(points);

          // ocultar el mesh sólido si existiera
          child.visible = false;

          // expandir bounding box para encuadrar la escena
          bbox.expandByObject(points);
        }
      });

      // Encadrar la cámara al modelo
      if (!bbox.isEmpty()) {
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        const size = new THREE.Vector3();
        bbox.getSize(size);

        const maxDim = Math.max(size.x, size.y, size.z);
        const dist = maxDim * 1.8;

        camera.position.set(center.x, center.y + maxDim * 0.4, center.z + dist);
        camera.lookAt(center);
        controls.target.copy(center);
        controls.update();
      }
    },
    undefined,
    (error) => {
      console.error('Error cargando calle.glb', error);
    }
  );

  // ---- RESIZE ----
  function onResize() {
    const w = container.clientWidth  || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('resize', onResize);

  // ---- LOOP ----
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
});
