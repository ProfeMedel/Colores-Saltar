// --- SINTETIZADOR DE SONIDO (Web Audio API) ---
class SoundEngine {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playJump() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(620, this.ctx.currentTime + 0.25);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    }

    playCollect() {
        if (!this.ctx) return;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do alto
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);

            gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.06 + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(this.ctx.currentTime + idx * 0.06);
            osc.stop(this.ctx.currentTime + idx * 0.06 + 0.12);
        });
    }

    playExtraLife() {
        if (!this.ctx) return;
        const notes = [440, 554.37, 659.25, 880]; // La, Do#, Mi, La alto
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

            gain.gain.setValueAtTime(0.3, this.ctx.currentTime + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.08 + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(this.ctx.currentTime + idx * 0.08);
            osc.stop(this.ctx.currentTime + idx * 0.08 + 0.2);
        });
    }

    playHit() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playGameOver() {
        if (!this.ctx) return;
        const notes = [400, 350, 300, 250];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.15);

            gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.15 + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(this.ctx.currentTime + idx * 0.15);
            osc.stop(this.ctx.currentTime + idx * 0.15 + 0.25);
        });
    }
}

const audio = new SoundEngine();

// --- SISTEMA DEL JUEGO ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const homeBtn = document.getElementById('homeBtn');
const jumpBtn = document.getElementById('jumpBtn');
const touchControlBar = document.getElementById('touchControlBar');
const hud = document.getElementById('hud');
const starScoreEl = document.getElementById('starScore');
const finalScoreEl = document.getElementById('finalScore');
const cheerBubble = document.getElementById('cheerBubble');
const touchJumpZone = document.getElementById('touchJumpZone');

let isPlaying = false;
let score = 0;
let lives = 3;
let heartsCollected = 0; 
let gameSpeed = 5;
let animationFrameId = null;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- CONFIGURACIÓN DEL PERSONAJE ---
const hero = {
    x: 120,
    y: 0,
    width: 85,
    height: 85,
    velocityY: 0,
    gravity: 0.65,
    jumpForce: -16,
    groundY: 0,
    isGrounded: false,
    rotation: 0,
    isInvulnerable: false,
    invulnerableTimer: 0,

    reset() {
        this.x = Math.min(120, canvas.width * 0.15);
        this.groundY = canvas.height - 150;
        this.y = this.groundY - this.height;
        this.velocityY = 0;
        this.isGrounded = true;
        this.rotation = 0;
        this.isInvulnerable = false;
        this.invulnerableTimer = 0;
    },

    jump() {
        if (this.isGrounded) {
            this.velocityY = this.jumpForce;
            this.isGrounded = false;
            audio.playJump();
            createParticles(this.x + this.width / 2, this.y + this.height, '#FFF', 8);
        } else if (this.velocityY > -8 && this.velocityY < 2) {
            this.velocityY = this.jumpForce * 0.75;
            audio.playJump();
            createParticles(this.x + this.width / 2, this.y + this.height, '#E1F5FE', 6);
        }
    },

    update() {
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        if (this.y >= this.groundY - this.height) {
            this.y = this.groundY - this.height;
            this.velocityY = 0;
            this.isGrounded = true;
            this.rotation = 0;
        } else {
            this.rotation = Math.min(Math.PI / 8, Math.max(-Math.PI / 8, this.velocityY * 0.03));
        }

        if (this.isInvulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.isInvulnerable = false;
            }
        }
    },

    draw() {
        if (this.isInvulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
            return;
        }

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);

        const w = this.width;
        const h = this.height;

        // Capa
        ctx.fillStyle = '#E91E63';
        ctx.beginPath();
        const capeWave = Math.sin(Date.now() * 0.01) * 10;
        ctx.moveTo(-w * 0.3, -h * 0.1);
        ctx.quadraticCurveTo(-w * 0.7, -h * 0.2 + capeWave, -w * 0.8, h * 0.3 + capeWave);
        ctx.quadraticCurveTo(-w * 0.4, h * 0.4, -w * 0.2, h * 0.2);
        ctx.fill();

        // Orejas
        ctx.fillStyle = '#FFA726';
        ctx.strokeStyle = '#E65100';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(-w * 0.3, -h * 0.35, w * 0.18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(w * 0.3, -h * 0.35, w * 0.18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Cabeza
        ctx.fillStyle = '#FFB74D';
        ctx.beginPath();
        ctx.arc(0, 0, w * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Antifaz
        ctx.fillStyle = '#E91E63';
        ctx.beginPath();
        ctx.roundRect(-w * 0.38, -h * 0.18, w * 0.76, h * 0.22, 12);
        ctx.fill();

        // Ojos
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(-w * 0.18, -h * 0.08, w * 0.08, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(w * 0.18, -h * 0.08, w * 0.08, 0, Math.PI * 2); ctx.fill();

        // Brillos
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(-w * 0.21, -h * 0.11, w * 0.03, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(w * 0.15, -h * 0.11, w * 0.03, 0, Math.PI * 2); ctx.fill();

        // Hocico
        ctx.fillStyle = '#FFE0B2';
        ctx.beginPath();
        ctx.ellipse(0, h * 0.12, w * 0.18, h * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#E65100';
        ctx.beginPath();
        ctx.ellipse(0, h * 0.07, w * 0.08, h * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();

        // Boca
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, h * 0.1, w * 0.12, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();

        ctx.restore();
    }
};

// --- NUBES Y FONDO ---
const clouds = Array.from({ length: 5 }, (_, i) => ({
    x: i * (canvas.width / 3) + Math.random() * 100,
    y: 50 + Math.random() * 120,
    scale: 0.8 + Math.random() * 0.5,
    speed: 0.6 + Math.random() * 0.4
}));

const hills = Array.from({ length: 4 }, (_, i) => ({
    x: i * 400,
    radius: 200 + Math.random() * 100,
    color: i % 2 === 0 ? '#81C784' : '#66BB6A'
}));

// --- COLECCIONABLES Y BOMBAS ---
let collectibles = [];
let obstacles = [];
let particles = [];

function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            radius: Math.random() * 6 + 4,
            color,
            alpha: 1,
            life: 0.03 + Math.random() * 0.02
        });
    }
}

function spawnElements() {
    if (Math.random() < 0.035) {
        const types = ['star', 'balloon', 'circle'];
        collectibles.push({
            x: canvas.width + 50,
            y: hero.groundY - 60 - Math.random() * 120,
            size: 45,
            type: types[Math.floor(Math.random() * types.length)],
            floatOffset: Math.random() * Math.PI * 2
        });
    }

    if (Math.random() < 0.003) {
        collectibles.push({
            x: canvas.width + 50,
            y: hero.groundY - 270 - Math.random() * 80,
            size: 45,
            type: 'heart_item',
            floatOffset: Math.random() * Math.PI * 2
        });
    }

    if (Math.random() < 0.015 && (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 380)) {
        obstacles.push({
            x: canvas.width + 60,
            y: hero.groundY - 55,
            size: 55,
            fuseFrame: 0
        });
    }
}

function updateLivesUI() {
    for (let i = 1; i <= 3; i++) {
        const heartEl = document.getElementById(`heart${i}`);
        if (i <= lives) {
            heartEl.style.opacity = '1';
            heartEl.style.transform = 'scale(1)';
        } else {
            heartEl.style.opacity = '0.2';
            heartEl.style.transform = 'scale(0.8)';
        }
    }
}

const cheerPhrases = [
    "¡Excelente! 🌟",
    "¡Eres genial! 🚀",
    "¡Gran salto! 🎈",
    "¡Bravo! 👏",
    "¡Sigue así! ❤️"
];

function showCheer(text = null) {
    const phrase = text || cheerPhrases[Math.floor(Math.random() * cheerPhrases.length)];
    cheerBubble.textContent = phrase;
    cheerBubble.classList.remove('opacity-0');
    cheerBubble.classList.add('pop-in');

    setTimeout(() => {
        cheerBubble.classList.add('opacity-0');
    }, 1800);
}

function triggerGameOver() {
    isPlaying = false;
    audio.playGameOver();

    finalScoreEl.textContent = score;
    hud.classList.add('hidden');
    touchJumpZone.classList.add('hidden');
    touchControlBar.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
}

function updateAndRender() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#4FC3F7');
    skyGradient.addColorStop(0.7, '#B2EBF2');
    skyGradient.addColorStop(1, '#E0F7FA');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x < -150) cloud.x = canvas.width + 100;

        ctx.save();
        ctx.translate(cloud.x, cloud.y);
        ctx.scale(cloud.scale, cloud.scale);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.arc(25, -10, 35, 0, Math.PI * 2);
        ctx.arc(55, 0, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#90A4AE';
        ctx.beginPath(); ctx.arc(18, -5, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(32, -5, 3, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#90A4AE'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(25, 0, 6, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();

        ctx.restore();
    });

    hills.forEach(hill => {
        hill.x -= gameSpeed * 0.3;
        if (hill.x < -hill.radius * 2) hill.x = canvas.width + hill.radius;

        ctx.fillStyle = hill.color;
        ctx.beginPath();
        ctx.arc(hill.x, hero.groundY + hill.radius - 20, hill.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = '#A1887F';
    ctx.fillRect(0, hero.groundY, canvas.width, canvas.height - hero.groundY);

    ctx.fillStyle = '#81C784';
    ctx.fillRect(0, hero.groundY, canvas.width, 22);

    hero.update();
    hero.draw();

    for (let i = collectibles.length - 1; i >= 0; i--) {
        const item = collectibles[i];
        item.x -= gameSpeed;

        const floatY = item.y + Math.sin(Date.now() * 0.005 + item.floatOffset) * 12;

        ctx.save();
        ctx.translate(item.x, floatY);

        if (item.type === 'star') {
            ctx.fillStyle = '#FFD54F';
            ctx.strokeStyle = '#FF8F00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let k = 0; k < 5; k++) {
                ctx.lineTo(Math.cos((18 + k * 72) * Math.PI / 180) * 22, -Math.sin((18 + k * 72) * Math.PI / 180) * 22);
                ctx.lineTo(Math.cos((54 + k * 72) * Math.PI / 180) * 10, -Math.sin((54 + k * 72) * Math.PI / 180) * 10);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (item.type === 'balloon') {
            ctx.fillStyle = '#29B6F6';
            ctx.strokeStyle = '#0288D1';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(0, -4, 15, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            ctx.strokeStyle = '#E0E0E0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 16);
            ctx.quadraticCurveTo(5, 24, 0, 32);
            ctx.stroke();
        } else if (item.type === 'circle') {
            ctx.fillStyle = '#FFCA28';
            ctx.strokeStyle = '#FFA000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else if (item.type === 'heart_item') {
            ctx.fillStyle = '#FF1744';
            ctx.strokeStyle = '#B71C1C';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(0, 12);
            ctx.bezierCurveTo(-22, -8, -28, -25, -14, -32);
            ctx.bezierCurveTo(-5, -36, 0, -24, 0, -24);
            ctx.bezierCurveTo(0, -24, 5, -36, 14, -32);
            ctx.bezierCurveTo(28, -25, 22, -8, 0, 12);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(-6, -20, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        const dist = Math.hypot((hero.x + hero.width / 2) - item.x, (hero.y + hero.height / 2) - floatY);
        if (dist < hero.width / 2 + item.size / 2) {
            
            if (item.type === 'heart_item') {
                heartsCollected += 1;
                createParticles(item.x, floatY, '#FF1744', 15);

                if (heartsCollected % 3 === 0) {
                    if (lives < 3) {
                        lives += 1;
                        updateLivesUI();
                    }
                    audio.playExtraLife();
                    showCheer("¡+1 VIDA EXTRA! ❤️🎉");
                } else {
                    audio.playCollect();
                    showCheer(`¡Corazón! (${heartsCollected % 3}/3) ❤️`);
                }
            } else {
                audio.playCollect();
                score += 1;
                starScoreEl.textContent = score;
                createParticles(item.x, floatY, '#FFD54F', 10);

                if (score % 5 === 0) {
                    showCheer();
                }
            }

            collectibles.splice(i, 1);
        } else if (item.x < -50) {
            collectibles.splice(i, 1);
        }
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= gameSpeed;
        obs.fuseFrame += 0.1;

        ctx.save();
        ctx.translate(obs.x, obs.y);

        ctx.fillStyle = '#212121';
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#616161';
        ctx.beginPath();
        ctx.arc(-8, -8, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(-6, -2, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(6, -2, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FF1744';
        ctx.beginPath(); ctx.arc(-5, -2, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(7, -2, 2, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = '#D7CCC8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -24);
        ctx.quadraticCurveTo(10, -34, 12, -40);
        ctx.stroke();

        const sparkColor = Math.sin(obs.fuseFrame * 5) > 0 ? '#FF3D00' : '#FFEA00';
        ctx.fillStyle = sparkColor;
        ctx.beginPath();
        ctx.arc(12, -40, 6 + Math.sin(obs.fuseFrame * 10) * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        const heroCenterX = hero.x + hero.width / 2;
        const heroCenterY = hero.y + hero.height / 2;
        const distance = Math.hypot(heroCenterX - obs.x, heroCenterY - obs.y);

        if (distance < (hero.width / 2.5 + 20) && !hero.isInvulnerable) {
            audio.playHit();
            lives -= 1;
            updateLivesUI();

            hero.isInvulnerable = true;
            hero.invulnerableTimer = 60;
            hero.velocityY = -10;

            createParticles(obs.x, obs.y, '#FF3D00', 15);

            if (lives > 0) {
                showCheer("¡Cuidado con la bomba! 💥");
            } else {
                triggerGameOver();
            }
        }

        if (obs.x < -100) {
            obstacles.splice(i, 1);
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.life;

        if (p.alpha <= 0) {
            particles.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    spawnElements();

    if (isPlaying) {
        animationFrameId = requestAnimationFrame(updateAndRender);
    }
}

function handleAction(e) {
    if (e) e.preventDefault();

    if (!isPlaying && !startScreen.classList.contains('opacity-0') && gameOverScreen.classList.contains('hidden')) {
        startGame();
    } else if (isPlaying) {
        hero.jump();
    }
}

// SOPORTE UNIFICADO MOUSE Y TÁCTIL PARA BOTONES
function addPointerListener(element, callback) {
    if (!element) return;
    let isHandled = false;

    element.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        isHandled = true;
        callback(e);
    });

    element.addEventListener('click', (e) => {
        if (isHandled) {
            isHandled = false;
            return;
        }
        callback(e);
    });
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleAction(e);
    }
});

// Conexión de botones táctiles y de mouse
addPointerListener(touchJumpZone, (e) => handleAction(e));
addPointerListener(jumpBtn, (e) => {
    e.stopPropagation();
    handleAction(e);
});
addPointerListener(startBtn, (e) => {
    e.stopPropagation();
    startGame();
});
addPointerListener(homeBtn, (e) => {
    // Permite que el enlace navegue correctamente
    window.location.href = homeBtn.getAttribute('href');
});

function startGame() {
    audio.init();
    score = 0;
    lives = 3;
    heartsCollected = 0;
    starScoreEl.textContent = '0';
    updateLivesUI();

    collectibles = [];
    obstacles = [];
    particles = [];

    hero.reset();

    startScreen.classList.add('opacity-0', 'pointer-events-none');
    gameOverScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    touchJumpZone.classList.remove('hidden');
    touchControlBar.classList.remove('hidden');

    isPlaying = true;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    
    updateAndRender();
}

hero.reset();
updateAndRender();
isPlaying = false;
