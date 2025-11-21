// loader.js

// Mientras el loader esté activo, el resto de la app no puede reproducir sonidos
window.__LOADER_ACTIVE__ = true;

document.addEventListener('DOMContentLoaded', () => {
  const loader      = document.getElementById('loader');
  const btn         = document.getElementById('loader-button');
  const spanPercent = document.getElementById('loader-percentage');
  const spanLabel   = document.getElementById('loader-label');
  const video       = document.getElementById('loader-video');

  if (!loader || !btn || !spanPercent || !spanLabel) return;

  let progress   = 0;
  let appReady   = false;
  let intervalId = null;

  /* ================== VIDEO DEL LOADER ================== */
  if (video) {
    // Arranca en mute para que el navegador permita autoplay
    video.muted = true;
    const p = video.play();
    if (p && p.catch) p.catch(() => {
      // algunos navegadores siguen quejándose, lo ignoramos
    });

    // En el PRIMER pointerdown mientras el loader esté activo:
    // desmuteamos y reintentamos play con sonido
    window.addEventListener('pointerdown', () => {
      if (!window.__LOADER_ACTIVE__ || !video) return;
      video.muted = false;
      const p2 = video.play();
      if (p2 && p2.catch) p2.catch(() => {
        // si igual no lo deja, no rompemos nada
      });
    }, { once: true });
  }

  /* ================== PROGRESO ================== */
  function setProgress(value){
    progress = Math.max(0, Math.min(100, value));
    spanPercent.textContent = `${Math.round(progress)}%`;
  }

  function enableStart(){
    spanPercent.style.display = 'none';
    spanLabel.style.display   = 'block';
    btn.disabled = false;
    btn.classList.add('ready');
  }

  function onAppReady(){
    if (appReady) return;
    appReady = true;

    if (progress >= 100){
      enableStart();
      return;
    }

    if (intervalId) clearInterval(intervalId);
    const start   = progress;
    const target  = 100;
    const dur     = 600; // ms
    const t0      = performance.now();

    function anim(t){
      const elapsed = t - t0;
      const k = Math.min(1, elapsed / dur);
      const eased = 1 - Math.pow(1 - k, 2);
      const current = start + (target - start) * eased;
      setProgress(current);

      if (k < 1){
        requestAnimationFrame(anim);
      } else {
        setProgress(100);
        enableStart();
      }
    }

    requestAnimationFrame(anim);
  }

  function startFakeProgress(){
    const maxWhileLoading = 80;

    intervalId = setInterval(() => {
      if (appReady){
        clearInterval(intervalId);
        return;
      }
      if (progress < maxWhileLoading){
        setProgress(progress + 1);
      }
    }, 80);
  }

  startFakeProgress();

  // main.js dispara esto cuando termina de cargar la escena
  //   window.__APP_READY__ = true;
  //   window.dispatchEvent(new Event('app:ready'));
  window.addEventListener('app:ready', onAppReady);

  if (window.__APP_READY__) {
    onAppReady();
  }

  /* ================== CLICK EN "EMPEZAR" ================== */
  btn.addEventListener('click', () => {
    if (btn.disabled) return;

    // A partir de acá permitimos sonidos del sitio
    window.__LOADER_ACTIVE__ = false;

    // ✅ Cortar el video del loader
    if (video) {
      try {
        video.pause();
      } catch (_) {}
      video.currentTime = 0;
      video.muted = true;
    }

    // Desvanecer el overlay
    loader.classList.add('fade-out');
    setTimeout(() => {
      loader.style.display = 'none';
    }, 750);
  });
});
