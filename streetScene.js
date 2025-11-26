// streetScene.js
document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('street-section');
  if (!section) return;

  // Por ahora solo dejamos un texto de placeholder
  const msg = document.createElement('p');
  msg.textContent = 'Aquí va a ir la esquina en nube de puntos :)';
  msg.style.fontFamily = 'monospace';
  msg.style.fontSize = '14px';
  msg.style.opacity = '0.7';

  section.appendChild(msg);
});
