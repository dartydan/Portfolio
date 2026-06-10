// Portfolio Quest — Game Logic

const XP_TABLE = {
  1: 100,
  2: 300,
  3: 600,
  4: 200,
  5: 150,
  6: 350
};

const CHAPTER_NAMES = {
  1: 'The Origin Story',
  2: 'Proof of Work',
  3: 'Boss Defeated!',
  4: 'Abilities Unlocked',
  5: 'Skill Tree Mastered',
  6: '★ Portfolio Complete!'
};

// XP needed to reach each level (cumulative)
const LEVEL_XP = [0, 100, 300, 600, 900, 1300, 1700];

let state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem('pq_state');
    return saved
      ? JSON.parse(saved)
      : { xp: 0, level: 1, completed: [] };
  } catch {
    return { xp: 0, level: 1, completed: [] };
  }
}

function saveState() {
  try {
    localStorage.setItem('pq_state', JSON.stringify(state));
  } catch {}
}

function startGame() {
  const titleEl = document.getElementById('screen-title');
  const hudEl   = document.getElementById('game-hud');

  titleEl.classList.add('screen-exit');
  hudEl.classList.add('hud-visible');

  setTimeout(() => {
    titleEl.style.display = 'none';
    document.getElementById('worldmap').scrollIntoView({ behavior: 'smooth' });
  }, 500);

  updateHUD();
}

function completeChapter(num) {
  const btn = document.querySelector(`.game-section[data-chapter="${num}"] .btn-complete`);

  if (state.completed.includes(num)) {
    showToast('Already collected!', '✓', false);
    return;
  }

  const xpGain = XP_TABLE[num] || 100;
  state.xp += xpGain;
  state.completed.push(num);

  const prevLevel = state.level;
  recalcLevel();

  saveState();
  updateHUD();

  if (btn) {
    btn.dataset.done = 'true';
    btn.textContent  = '✓ XP CLAIMED';
    btn.disabled     = true;
  }

  if (state.level > prevLevel) {
    setTimeout(() => showToast(`LEVEL UP! You are now Level ${state.level}!`, '⭐', true), 1600);
  }

  showAchievement(CHAPTER_NAMES[num], xpGain);

  const nextSection = document.querySelector(`.game-section[data-chapter="${num + 1}"]`)
    || document.getElementById('victory');

  if (nextSection) {
    setTimeout(() => nextSection.scrollIntoView({ behavior: 'smooth' }), 1400);
  }
}

function recalcLevel() {
  let lvl = 1;
  for (let i = 0; i < LEVEL_XP.length; i++) {
    if (state.xp >= LEVEL_XP[i]) lvl = i + 1;
  }
  state.level = Math.min(lvl, LEVEL_XP.length);
}

function updateHUD() {
  const lvlEl   = document.getElementById('player-level');
  const fillEl  = document.getElementById('xp-fill');
  const valueEl = document.getElementById('xp-value');
  const countEl = document.getElementById('achievement-count');

  if (lvlEl)   lvlEl.textContent   = state.level;
  if (countEl) countEl.textContent = state.completed.length;

  const curFloor = LEVEL_XP[state.level - 1] || 0;
  const nxtCeil  = LEVEL_XP[state.level]     || LEVEL_XP[LEVEL_XP.length - 1];
  const pct      = nxtCeil > curFloor
    ? Math.min(100, ((state.xp - curFloor) / (nxtCeil - curFloor)) * 100)
    : 100;

  if (fillEl) {
    fillEl.style.width = pct + '%';
    fillEl.closest('[aria-valuenow]')?.setAttribute('aria-valuenow', Math.round(pct));
  }
  if (valueEl) valueEl.textContent = state.xp + ' XP';
}

// Restore already-completed chapter buttons on page load
function restoreButtons() {
  state.completed.forEach(num => {
    const btn = document.querySelector(`.game-section[data-chapter="${num}"] .btn-complete`);
    if (btn) {
      btn.dataset.done = 'true';
      btn.textContent  = '✓ XP CLAIMED';
      btn.disabled     = true;
    }
  });
}

let toastTimer = null;

function showAchievement(name, xp) {
  const toast  = document.getElementById('achievement-toast');
  const nameEl = document.getElementById('toast-name');
  if (!toast || !nameEl) return;

  nameEl.textContent = `${name}  (+${xp} XP)`;
  toast.classList.add('toast-visible');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('toast-visible'), 3400);
}

function showToast(msg, icon, _isLevelUp) {
  showAchievement(msg, 0);
}

// Section entrance animations via IntersectionObserver
function initObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-visible');
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.game-section').forEach(el => observer.observe(el));
}

// Generate floating particles on the title screen
function spawnParticles() {
  const container = document.getElementById('title-particles');
  if (!container) return;

  const colors = ['#4d97ff', '#a855f7', '#06d6a0', '#ffc107', '#e53535'];

  for (let i = 0; i < 24; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 3 + Math.random() * 7;
    p.style.cssText = [
      `left: ${Math.random() * 100}%`,
      `top: ${Math.random() * 100}%`,
      `width: ${size}px`,
      `height: ${size}px`,
      `background: ${colors[Math.floor(Math.random() * colors.length)]}`,
      `animation-delay: ${(Math.random() * 3).toFixed(2)}s`,
      `animation-duration: ${(3 + Math.random() * 5).toFixed(2)}s`,
      `opacity: ${(0.2 + Math.random() * 0.5).toFixed(2)}`
    ].join(';');
    container.appendChild(p);
  }
}

// Update bottom nav active state on scroll
function initNavHighlight() {
  const sections = document.querySelectorAll('.game-section');
  const navItems = document.querySelectorAll('.bnav-item');

  const sectionMap = {
    worldmap:             0,
    'chapter-experience': 1,
    'chapter-skills':     2,
    'chapter-credentials':3
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id  = entry.target.id;
      const idx = sectionMap[id];
      if (idx == null) return;
      navItems.forEach((item, i) => item.classList.toggle('bnav-active', i === idx));
    });
  }, { threshold: 0.4 });

  sections.forEach(el => io.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  spawnParticles();
  initObserver();
  initNavHighlight();
  restoreButtons();
  updateHUD();

  // If the user has played before, show HUD immediately
  if (state.completed.length > 0) {
    const titleEl = document.getElementById('screen-title');
    const hudEl   = document.getElementById('game-hud');
    titleEl.style.display = 'none';
    hudEl.classList.add('hud-visible');
  }
});
