// --- BASE DE DATOS DEL JUEGO ---
const baseItems = [
  // FORMAS GEOMÉTRICAS KAWAII
  { type: 'shape', id: 'circle', name: 'Círculo', article: 'el' },
  { type: 'shape', id: 'square', name: 'Cuadrado', article: 'el' },
  { type: 'shape', id: 'rectangle', name: 'Rectángulo', article: 'el' },
  { type: 'shape', id: 'star', name: 'Estrella', article: 'la' },
  { type: 'shape', id: 'triangle', name: 'Triángulo', article: 'el' },
  { type: 'shape', id: 'rhombus', name: 'Rombo', article: 'el' },

  // DIBUJOS TIERNOS
  { type: 'drawing', id: 'gato', name: 'Gatito', article: 'el' },
  { type: 'drawing', id: 'perro', name: 'Perrito', article: 'el' },
  { type: 'drawing', id: 'pez', name: 'Pececito', article: 'el' },
  { type: 'drawing', id: 'tortuga', name: 'Tortuguita', article: 'la' },
  { type: 'drawing', id: 'oso', name: 'Osito', article: 'el' },
  { type: 'drawing', id: 'sol', name: 'Sol', article: 'el' },
  { type: 'drawing', id: 'manzana', name: 'Manzana', article: 'la' },
  { type: 'drawing', id: 'lapiz', name: 'Lápiz', article: 'el' },

  // LETRAS
  { type: 'alphabet', id: 'A', name: 'Letra A', article: 'la' },
  { type: 'alphabet', id: 'E', name: 'Letra E', article: 'la' },
  { type: 'alphabet', id: 'I', name: 'Letra I', article: 'la' },
  { type: 'alphabet', id: 'O', name: 'Letra O', article: 'la' },
  { type: 'alphabet', id: 'U', name: 'Letra U', article: 'la' },
  { type: 'alphabet', id: 'M', name: 'Letra M', article: 'la' },
  { type: 'alphabet', id: 'S', name: 'Letra S', article: 'la' },
  { type: 'alphabet', id: 'L', name: 'Letra L', article: 'la' }
];

// NÚMEROS DEL 1 AL 10
for (let i = 1; i <= 10; i++) {
  baseItems.push({ type: 'number', id: `${i}`, name: `Número ${i}`, article: 'el' });
}

const RAW_ITEMS = baseItems;

// PALETA DE COLORES
const COLORS = [
  { id: 'red', name: 'Rojo', hex: '#ff4d4d' },
  { id: 'blue', name: 'Azul', hex: '#3399ff' },
  { id: 'yellow', name: 'Amarillo', hex: '#ffcc00' },
  { id: 'green', name: 'Verde', hex: '#2ecc71' },
  { id: 'orange', name: 'Naranja', hex: '#ff9933' },
  { id: 'purple', name: 'Morado', hex: '#a55eea' },
  { id: 'pink', name: 'Rosa', hex: '#ff78ae' },
  { id: 'teal', name: 'Turquesa', hex: '#2bcbba' }
];

// ESTADO DEL JUEGO
const TOTAL_QUESTIONS = 10;
let currentQuestionIndex = 0;
let score = 0;
let itemsPool = [];
let currentItem = null;
let targetColor = null;
let playerColor = null;

// ELEMENTOS DEL DOM
const targetSvg = document.getElementById('targetSvg');
const playerSvg = document.getElementById('playerSvg');
const targetLabel = document.getElementById('targetLabel');
const feedbackText = document.getElementById('feedbackText');
const moodIcon = document.getElementById('moodIcon');
const speakerBtn = document.getElementById('speakerBtn');
const gameOverModal = document.getElementById('gameOverModal');
const giftBtn = document.getElementById('giftBtn');
const colorButtons = document.querySelectorAll('.color-btn');
const questionCounter = document.getElementById('questionCounter');
const scoreCounter = document.getElementById('scoreCounter');
const finalScoreText = document.getElementById('finalScoreText');
const playerCard = document.getElementById('playerCard');
const fxCanvas = document.getElementById('fxCanvas');
const ctx = fxCanvas.getContext('2d');

// REDIMENSIONAR CANVAS
function resizeCanvas() {
  fxCanvas.width = window.innerWidth;
  fxCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ALGORITMO DE MEZCLA
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// SISTEMA DE AUDIO (SINTETIZADOR WEB AUDIO API)
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playPopSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (e) {}
}

function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const startTime = ctx.currentTime + index * 0.09;
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.26);
    });
  } catch (e) {}
}

function playErrorSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.21);
  } catch (e) {}
}

function speak(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }
}

// SISTEMA DE CONFETI EN CANVAS
let particles = [];
function launchConfetti() {
  particles = [];
  const colors = ['#ff4d4d', '#3399ff', '#ffcc00', '#2ecc71', '#a55eea', '#ff78ae'];
  for (let i = 0; i < 70; i++) {
    particles.push({
      x: fxCanvas.width / 2,
      y: fxCanvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 16,
      size: Math.random() * 10 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
      life: 1.0
    });
  }
  requestAnimationFrame(updateConfetti);
}

function updateConfetti() {
  ctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
  let alive = false;
  particles.forEach(p => {
    if (p.life > 0) {
      alive = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.life -= 0.015;
      p.rotation += p.vRot;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }
      ctx.restore();
    }
  });
  if (alive) {
    requestAnimationFrame(updateConfetti);
  }
}

// PLANTILLA DE CARITA KAWAII
const KAWAII_FACE = `
  <g>
    <circle cx="82" cy="92" r="7" fill="#1e293b" />
    <circle cx="80" cy="90" r="2.5" fill="#ffffff" />
    <circle cx="118" cy="92" r="7" fill="#1e293b" />
    <circle cx="116" cy="90" r="2.5" fill="#ffffff" />
    <ellipse cx="72" cy="102" rx="6" ry="3.5" fill="#ff78ae" opacity="0.6" />
    <ellipse cx="128" cy="102" rx="6" ry="3.5" fill="#ff78ae" opacity="0.6" />
    <path d="M 92 102 Q 100 112 108 102" stroke="#1e293b" stroke-width="3.5" fill="none" stroke-linecap="round" />
  </g>
`;

// GENERADOR DE ELEMENTOS SVG (Con renderizado robusto mediante DOMParser)
function renderItemContent(svgElement, item, colorHex, isPlayer = false) {
  const fill = colorHex ? colorHex : '#f8fafc';
  const stroke = '#1e293b';
  const strokeWidth = '5';
  let drawStr = '';

  if (item.type === 'shape') {
    switch (item.id) {
      case 'circle':
        drawStr = `<circle cx="100" cy="100" r="72" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />${fill !== '#f8fafc' ? KAWAII_FACE : ''}`;
        break;
      case 'square':
        drawStr = `<rect x="30" y="30" width="140" height="140" rx="28" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />${fill !== '#f8fafc' ? KAWAII_FACE : ''}`;
        break;
      case 'rectangle':
        drawStr = `<rect x="20" y="45" width="160" height="110" rx="24" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />${fill !== '#f8fafc' ? KAWAII_FACE : ''}`;
        break;
      case 'star':
        drawStr = `<polygon points="100,15 125,70 185,76 138,116 152,175 100,143 48,175 62,116 15,76 75,70" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round" />${fill !== '#f8fafc' ? KAWAII_FACE : ''}`;
        break;
      case 'triangle':
        drawStr = `<polygon points="100,20 180,165 20,165" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round" stroke-linecap="round" />${fill !== '#f8fafc' ? KAWAII_FACE : ''}`;
        break;
      case 'rhombus':
        drawStr = `<polygon points="100,18 175,100 100,182 25,100" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round" />${fill !== '#f8fafc' ? KAWAII_FACE : ''}`;
        break;
    }
  } else if (item.type === 'drawing') {
    switch (item.id) {
      case 'gato':
        drawStr = `<g stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round">
                    <path d="M 45 75 L 30 25 L 75 50 Z" fill="${fill}" />
                    <path d="M 155 75 L 170 25 L 125 50 Z" fill="${fill}" />
                    <circle cx="100" cy="110" r="62" fill="${fill}" />
                    <path d="M 48 65 L 38 35 L 68 50 Z" fill="#ff78ae" opacity="0.5" />
                    <path d="M 152 65 L 162 35 L 132 50 Z" fill="#ff78ae" opacity="0.5" />
                    ${KAWAII_FACE}
                    <line x1="45" y1="98" x2="25" y2="92" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
                    <line x1="45" y1="106" x2="25" y2="108" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
                    <line x1="155" y1="98" x2="175" y2="92" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
                    <line x1="155" y1="106" x2="175" y2="108" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
                   </g>`;
        break;
      case 'perro':
        drawStr = `<g stroke="${stroke}" stroke-width="${strokeWidth}">
                    <ellipse cx="38" cy="95" rx="18" ry="38" fill="#a55eea" />
                    <ellipse cx="162" cy="95" rx="18" ry="38" fill="#a55eea" />
                    <circle cx="100" cy="100" r="62" fill="${fill}" />
                    ${KAWAII_FACE}
                    <ellipse cx="100" cy="98" rx="8" ry="6" fill="#1e293b" />
                   </g>`;
        break;
      case 'pez':
        drawStr = `<g stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round">
                    <path d="M 135 100 L 180 65 L 180 135 Z" fill="${fill}" />
                    <ellipse cx="88" cy="100" rx="65" ry="48" fill="${fill}" />
                    <circle cx="55" cy="88" r="8" fill="#1e293b" />
                    <circle cx="53" cy="86" r="3" fill="#ffffff" />
                    <path d="M 30 100 Q 40 105 30 110" fill="none" stroke-linecap="round" />
                    <path d="M 90 100 Q 110 90 100 115" fill="${fill}" />
                   </g>`;
        break;
      case 'tortuga':
        drawStr = `<g stroke="${stroke}" stroke-width="${strokeWidth}">
                    <circle cx="50" cy="140" r="16" fill="#2ecc71" />
                    <circle cx="150" cy="140" r="16" fill="#2ecc71" />
                    <circle cx="160" cy="92" r="22" fill="#2ecc71" />
                    <circle cx="168" cy="86" r="4" fill="#1e293b" />
                    <path d="M 30 120 C 30 50, 150 50, 150 120 Z" fill="${fill}" />
                   </g>`;
        break;
      case 'oso':
        drawStr = `<g stroke="${stroke}" stroke-width="${strokeWidth}">
                    <circle cx="48" cy="52" r="24" fill="${fill}" />
                    <circle cx="152" cy="52" r="24" fill="${fill}" />
                    <circle cx="48" cy="52" r="12" fill="#ff78ae" opacity="0.4" />
                    <circle cx="152" cy="52" r="12" fill="#ff78ae" opacity="0.4" />
                    <circle cx="100" cy="108" r="60" fill="${fill}" />
                    <ellipse cx="100" cy="118" rx="22" ry="16" fill="#ffffff" />
                    <ellipse cx="100" cy="112" rx="8" ry="6" fill="#1e293b" />
                    ${KAWAII_FACE}
                   </g>`;
        break;
      case 'sol':
        drawStr = `<g stroke="${stroke}" stroke-width="${strokeWidth}">
                    <g stroke-linecap="round">
                      <line x1="100" y1="15" x2="100" y2="30" stroke="#ffcc00" stroke-width="8" />
                      <line x1="100" y1="170" x2="100" y2="185" stroke="#ffcc00" stroke-width="8" />
                      <line x1="15" y1="100" x2="30" y2="100" stroke="#ffcc00" stroke-width="8" />
                      <line x1="170" y1="100" x2="185" y2="100" stroke="#ffcc00" stroke-width="8" />
                      <line x1="40" y1="40" x2="52" y2="52" stroke="#ffcc00" stroke-width="8" />
                      <line x1="148" y1="148" x2="160" y2="160" stroke="#ffcc00" stroke-width="8" />
                      <line x1="40" y1="160" x2="52" y2="148" stroke="#ffcc00" stroke-width="8" />
                      <line x1="148" y1="52" x2="160" y2="40" stroke="#ffcc00" stroke-width="8" />
                    </g>
                    <circle cx="100" cy="100" r="52" fill="${fill}" />
                    ${KAWAII_FACE}
                   </g>`;
        break;
      case 'manzana':
        drawStr = `<g stroke="${stroke}" stroke-width="${strokeWidth}">
                    <path d="M 100 45 Q 110 25 120 20" fill="none" stroke="#78350f" stroke-width="6" stroke-linecap="round" />
                    <path d="M 105 32 Q 130 25 125 42 Z" fill="#2ecc71" stroke="${stroke}" stroke-width="3" />
                    <path d="M 100 48 C 75 22, 25 45, 30 110 C 35 165, 85 185, 100 162 C 115 185, 165 165, 170 110 C 175 45, 125 22, 100 48 Z" fill="${fill}" />
                    ${KAWAII_FACE}
                   </g>`;
        break;
      case 'lapiz':
        drawStr = `<g stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round">
                    <rect x="65" y="50" width="70" height="100" rx="8" fill="${fill}" />
                    <polygon points="65,150 135,150 100,190" fill="#fde047" />
                    <polygon points="85,173 115,173 100,190" fill="#1e293b" />
                    <rect x="65" y="20" width="70" height="30" rx="6" fill="#ff78ae" />
                    ${KAWAII_FACE}
                   </g>`;
        break;
    }
  } else if (item.type === 'alphabet' || item.type === 'number') {
    const fontSize = item.id.length > 2 ? '60' : '90';
    drawStr = `<g>
                <rect x="20" y="20" width="160" height="160" rx="35" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
                <path d="M 40 40 L 43 48 L 50 50 L 43 52 L 40 60 L 37 52 L 30 50 L 37 48 Z" fill="#ffcc00" />
                <path d="M 160 140 L 162 145 L 168 147 L 162 149 L 160 155 L 158 149 L 152 147 L 158 145 Z" fill="#ffcc00" />
                <text x="100" y="128" font-size="${fontSize}" font-weight="900" font-family="'Fredoka', sans-serif" text-anchor="middle" fill="${fill === '#f8fafc' ? '#1e293b' : '#ffffff'}" stroke="#1e293b" stroke-width="4">${item.id}</text>
               </g>`;
  }

  // Parseo seguro mediante DOMParser para evitar problemas con el espacio de nombres SVG
  svgElement.innerHTML = '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${drawStr}</svg>`, 'image/svg+xml');
    Array.from(doc.documentElement.children).forEach(child => {
      svgElement.appendChild(document.importNode(child, true));
    });
  } catch (e) {
    svgElement.innerHTML = drawStr;
  }
}

// ACTUALIZAR INTERFAZ VISUAL
function updateDisplays() {
  renderItemContent(targetSvg, currentItem, targetColor.hex, false);
  renderItemContent(playerSvg, currentItem, playerColor ? playerColor.hex : '#f8fafc', true);
}

// NUEVO JUEGO
function startNewGame() {
  score = 0;
  currentQuestionIndex = 0;
  itemsPool = shuffleArray(RAW_ITEMS);
  scoreCounter.textContent = score;
  gameOverModal.classList.add('hidden');
  loadQuestion();
}

function loadQuestion() {
  currentQuestionIndex++;
  questionCounter.textContent = `${currentQuestionIndex} / ${TOTAL_QUESTIONS}`;

  currentItem = itemsPool.pop();
  targetColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  playerColor = null;

  targetLabel.textContent = `${currentItem.name} ${targetColor.name}`;
  
  feedbackText.textContent = "¡Haz clic en un color!";
  feedbackText.className = "text-xs md:text-sm font-extrabold text-purple-900 text-left";
  moodIcon.textContent = "🤔";

  updateDisplays();
}

// MANEJAR SELECCIÓN DE COLOR
function handleColorSelect(colorId) {
  playPopSound();
  const selectedColor = COLORS.find(c => c.id === colorId);
  playerColor = selectedColor;

  renderItemContent(playerSvg, currentItem, playerColor.hex, true);

  if (selectedColor.id === targetColor.id) {
    playSuccessSound();
    launchConfetti();
    score += 10;
    scoreCounter.textContent = score;

    feedbackText.textContent = "¡SÚPER BIEN! 🎉";
    feedbackText.className = "text-xs md:text-sm font-extrabold text-emerald-600 text-left";
    moodIcon.textContent = "⭐";

    playerCard.classList.remove('bounce-wiggle');
    void playerCard.offsetWidth;
    playerCard.classList.add('bounce-wiggle');

    setTimeout(() => {
      if (currentQuestionIndex >= TOTAL_QUESTIONS) {
        finalScoreText.textContent = score;
        gameOverModal.classList.remove('hidden');
        launchConfetti();
      } else {
        loadQuestion();
      }
    }, 1300);

  } else {
    playErrorSound();
    feedbackText.textContent = "¡Casi! Prueba otro color 😊";
    feedbackText.className = "text-xs md:text-sm font-extrabold text-pink-600 text-left";
    moodIcon.textContent = "💡";

    playerCard.classList.remove('shake-error');
    void playerCard.offsetWidth;
    playerCard.classList.add('shake-error');
  }
}

// EVENT LISTENERS
colorButtons.forEach(button => {
  button.addEventListener('click', () => {
    const colorId = button.getAttribute('data-color');
    handleColorSelect(colorId);
  });
});

speakerBtn.addEventListener('click', () => {
  playPopSound();
  speak(`Pinta ${currentItem.article} ${currentItem.name.toLowerCase()} de color ${targetColor.name.toLowerCase()}`);
});

giftBtn.addEventListener('click', () => {
  playSuccessSound();
  launchConfetti();
  speak("¡Felicitaciones, ganaste una medalla de super pintor!");
  window.location.href = 'juego.html';
});

window.addEventListener('DOMContentLoaded', () => {
  startNewGame();
});