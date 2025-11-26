// streetScene.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import calleModelUrl from './assets/calle.glb?url'; // ajustá ruta si hace falta

export function initStreetScene(container) {
  // --- escena básica ---
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 5, 12);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // luz muy suave para que no quede todo plano
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.4);
  scene.add(hemi);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 2, 0);

  // --- cargar modelo calle.glb como nube de puntos ---
  const loader = new GLTFLoader();
  loader.load(
    calleModelUrl,
    (gltf) => {
      const root = gltf.scene;

      root.traverse((child) => {
        if (child.isMesh) {
          const geo = child.geometry;

          // MUY importante: clonar la geometría para no tocar la original
          const geometry = geo.clone();

          const material = new THREE.PointsMaterial({
            size: 0.06,          // ajustá para más/menos “grano”
            color: 0xffffff,     // blanco total
            sizeAttenuation: true
          });

          const points = new THREE.Points(geometry, material);
          points.position.copy(child.position);
          points.rotation.copy(child.rotation);
          points.scale.copy(child.scale);

          scene.add(points);

          // opcional: esconder mesh sólido si hubiera
          child.visible = false;
        }
      });

      // centrar controles (podemos ajustar después)
      controls.update();
    },
    undefined,
    (err) => {
      console.error('Error cargando calle.glb', err);
    }
  );

  // --- resize ---
  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('resize', onResize);

  // --- loop ---
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  // por si después querés destruir la escena al cerrar la ventana
  return {
    dispose() {
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      container.innerHTML = '';
    }
  };
}
