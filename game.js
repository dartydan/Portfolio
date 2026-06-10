// ══════════════════════════════════════════════
//  PORTFOLIO QUEST — GAME ENGINE
// ══════════════════════════════════════════════

// ── GAME DATA ─────────────────────────────────

const ZONES = [
  {
    id: 'foundry', chapterNum: 1,
    name: 'THE FOUNDRY', era: '2008 — 2018',
    sub: 'Where the Foundation was Forged',
    bgClass: 'bg-foundry', npcColor: '#37474F', npcName: 'Young Dan',
    dialogue: [
      "Welcome to The Foundry. This is where my story began.",
      "Slingshot SEO. PayK12. The Sojourn. Ray Skillman Auto Group.",
      "Ten years learning how digital systems really work in the real world.",
      "Search strategy. Advertising. Web content. User behavior. Budget management.",
      "Every campaign, every report, every optimization — building the foundation.",
      "Without this grounding, nothing that followed would have been possible."
    ],
    boss: {
      name: 'ALGORITHM CHAOS', sub: 'The unpredictable search landscape',
      sprite: '🌀',
      attacks: [
        { label: '⚔ SEO MASTERY',    desc: 'Technical + content strategy applied across multiple platforms.' },
        { label: '📊 DATA ANALYSIS', desc: 'Reporting systems and insight extraction built from scratch.' },
        { label: '💰 PAID SEARCH',   desc: 'Campaign structure and bid optimization mastered.' }
      ],
      winText: 'FOUNDATION UNLOCKED! Digital fundamentals mastered across 10 years and 4 companies.'
    },
    reward: {
      icon: '⚙', type: 'PASSIVE ABILITY',
      name: 'DIGITAL FOUNDATION',
      desc: 'All digital skills gain +15% effectiveness. Technical instincts permanently enhanced.'
    }
  },
  {
    id: 'glitch', chapterNum: 2,
    name: 'GLITCH ENERGY REALM', era: '2018 — 2021',
    sub: 'VP of Marketing & Communications',
    bgClass: 'bg-glitch', npcColor: '#6a0dad', npcName: 'VP Dan',
    dialogue: [
      "Welcome to the Glitch Energy Realm. This is where I became a real leader.",
      "We launched an energy drink brand from absolute zero — zero budget, zero audience.",
      "NBA athletes. YouTube personalities. Millions of impressions built through strategy.",
      "I owned creative ops: video, animation, photography, and branded storytelling.",
      "Brand strategy, content workflows, and audience growth — all connected and aligned.",
      "Leadership layer unlocked: cross-functional brand building from the ground up."
    ],
    boss: {
      name: 'BRAND OBSCURITY', sub: 'Unknown in a saturated market',
      sprite: '🌫',
      attacks: [
        { label: '🤝 PARTNERSHIP PLAY', desc: 'NBA + YouTube influencer strategy activated.' },
        { label: '🎬 CONTENT BLITZ',    desc: 'Multi-channel campaign operations fully deployed.' },
        { label: '📣 AUDIENCE BUILD',   desc: 'Community, email, and digital engagement systems live.' }
      ],
      winText: 'BRAND BUILT! Market presence established from zero. Partnership network fully operational.'
    },
    reward: {
      icon: '🎮', type: 'ACTIVE ABILITY',
      name: 'BRAND ARCHITECT',
      desc: 'Can build a brand strategy from inception. Partner network +50. Creative ops mastery unlocked.'
    }
  },
  {
    id: 'acculevel', chapterNum: 3,
    name: 'ACCULEVEL DUNGEON', era: '2021 — 2022',
    sub: 'Director of Marketing',
    bgClass: 'bg-acculevel', npcColor: '#7a5800', npcName: 'Director Dan',
    dialogue: [
      "The Acculevel Dungeon. The most demanding challenge I had faced yet.",
      "I took outsourced marketing in-house and built the entire machine from scratch.",
      "$3M+ in annual ad spend. Salesforce. Tableau. Trello workflows across every team.",
      "In just 10 months, annual revenue grew from $11 million to $31 million.",
      "Department built. Operating model designed. Budget stewarded. Analytics deployed.",
      "This dungeon proved I could run — and scale — the entire operation."
    ],
    boss: {
      name: '$3M BUDGET DRAGON', sub: 'P&L accountability at growth scale',
      sprite: '🐉',
      attacks: [
        { label: '🏗 IN-HOUSE BUILD',  desc: 'Outsourcing eliminated. $11M → $31M. Revenue dragon stunned.' },
        { label: '📈 ANALYTICS FORGE', desc: 'Salesforce + Tableau decision support systems forged.' },
        { label: '⚙ WORKFLOW SYSTEM', desc: 'Cross-functional operating model deployed across all teams.' }
      ],
      winText: 'LEGENDARY VICTORY! $31M achieved in 10 months. Budget dragon defeated. Department fully operational.'
    },
    reward: {
      icon: '💰', type: '★ LEGENDARY ABILITY',
      name: 'FINANCIAL STEWARDSHIP',
      desc: 'P&L judgment + budget mastery at scale. Revenue growth engine. Operating model design.'
    }
  },
  {
    id: 'ballstate', chapterNum: 4,
    name: 'BALL STATE FORTRESS', era: '2022 — PRESENT',
    sub: 'University Web & Digital Marketing Strategist',
    bgClass: 'bg-ballstate', npcColor: '#c41100', npcName: 'Strategist Dan',
    dialogue: [
      "Ball State Fortress. The current raid. Still very much active.",
      "30,000 web pages. 200+ distributed editors. One system to govern it all.",
      "I directed a WCAG accessibility initiative — university-wide, done in under 3 months.",
      "Independently redesigned the People & Culture site: hundreds of pages in five months.",
      "BrightEdge. GA4. GTM. Microsoft Clarity. Enterprise CMS. AI-assisted workflows.",
      "The fortress is strong — and I'm ready for the next, larger challenge."
    ],
    boss: {
      name: 'ENTERPRISE WEB CHAOS', sub: '30,000 ungoverned pages',
      sprite: '🕸',
      attacks: [
        { label: '🏛 GOVERNANCE SYSTEM', desc: 'CMS standards, training, and structure established at scale.' },
        { label: '♿ WCAG INITIATIVE',   desc: 'Full university accessibility compliance in under 3 months.' },
        { label: '🤖 AI WORKFLOW',       desc: 'Velocity and quality elevated through AI-assisted operations.' }
      ],
      winText: 'FORTRESS SECURED! Enterprise web operations mastered. 30K+ pages governed. Accessibility achieved.'
    },
    reward: {
      icon: '🏛', type: '★ LEGENDARY ABILITY',
      name: 'ENTERPRISE MASTERY',
      desc: 'Enterprise-scale digital governance. AI-enabled operations. Accessibility compliance at speed.'
    }
  }
];

const INTRO_LINES = [
  "In the digital realm, legends are forged through experience...",
  "18 years of work. 4 major quests. Countless challenges overcome.",
  "A strategist who connects technology, people, and business outcomes.",
  "This is the career story of Dan Morency.",
  "Business Leader. Digital Strategist. Enterprise Web Champion.",
  "Your adventure begins now."
];

const CHAR_STATS = [
  { name: 'LEADERSHIP',    val: 95, color: '#e53535', delay: 0 },
  { name: 'DIGITAL STRAT', val: 98, color: '#4d97ff', delay: 0.1 },
  { name: 'FINANCE',       val: 92, color: '#ffc107', delay: 0.2 },
  { name: 'EXECUTION',     val: 88, color: '#06d6a0', delay: 0.3 },
  { name: 'STAKEHOLDERS',  val: 90, color: '#a855f7', delay: 0.4 },
  { name: 'AI WORKFLOWS',  val: 85, color: '#fb8c00', delay: 0.5 }
];

// ── TYPEWRITER ─────────────────────────────────

class Typewriter {
  constructor(el, cursorEl, speed = 22) {
    this.el = el;
    this.cursor = cursorEl;
    this.speed = speed;
    this._t = null;
    this.done = false;
    this._full = '';
    this._cb = null;
  }

  write(text, cb) {
    clearInterval(this._t);
    this._full = text;
    this._cb = cb || null;
    this.done = false;
    this.el.textContent = '';
    if (this.cursor) this.cursor.classList.remove('hidden');
    let i = 0;
    this._t = setInterval(() => {
      this.el.textContent += text[i++];
      if (i >= text.length) {
        clearInterval(this._t);
        this.done = true;
        if (this.cursor) this.cursor.classList.add('hidden');
        this._cb && this._cb();
      }
    }, this.speed);
  }

  skip() {
    clearInterval(this._t);
    this.el.textContent = this._full;
    this.done = true;
    if (this.cursor) this.cursor.classList.add('hidden');
    const cb = this._cb;
    this._cb = null;
    cb && cb();
  }
}

// ── BATTLE ─────────────────────────────────────

class Battle {
  constructor(zone) {
    this.zone = zone;
    this.boss = zone.boss;
    this.enemyHp = 100;
    this.playerHp = 100;
    this.round = 0;
    this.over = false;
    this.locked = false;
  }

  attack(idx) {
    if (this.over || this.locked) return;
    this.locked = true;

    const atk = this.boss.attacks[idx];
    const dmg = 42 + Math.floor(Math.random() * 22); // 42–63 dmg
    this.enemyHp = Math.max(0, this.enemyHp - dmg);
    this.round++;

    this._setButtonsDisabled(true);

    // Dan lunges
    const dan = document.getElementById('dan-battle');
    dan && dan.classList.add('char-lunge');
    setTimeout(() => dan && dan.classList.remove('char-lunge'), 450);

    // Log the move
    this._log(`Dan uses <strong>${atk.label}</strong>!<span class="log-detail">${atk.desc}</span>`);

    // Update enemy HP bar
    setTimeout(() => {
      this._setHp('enemy-hp', this.enemyHp);

      // Enemy hit animation
      const sprite = document.getElementById('enemy-sprite');
      sprite && sprite.classList.add('enemy-hit');
      setTimeout(() => sprite && sprite.classList.remove('enemy-hit'), 400);

      if (this.enemyHp <= 0) {
        // Victory
        this.over = true;
        setTimeout(() => {
          this._log(`<span class="log-win">✓ ${this.boss.winText}</span>`);
          // Replace attack buttons with claim button
          const actionsEl = document.getElementById('battle-actions');
          if (actionsEl) {
            actionsEl.innerHTML = '<button class="btn-victory" onclick="GAME.showReward()">🏆 CLAIM REWARD →</button>';
          }
        }, 900);
      } else {
        // Enemy counterattack (flavor only — Dan always wins)
        setTimeout(() => {
          const cDmg = 6 + Math.floor(Math.random() * 8);
          this.playerHp = Math.max(68, this.playerHp - cDmg);
          this._setHp('player-hp', this.playerHp);
          this._log(`<em>${this.boss.name}</em> retaliates! Dan's experience absorbs the blow. (−${cDmg} HP)`);

          setTimeout(() => {
            this.locked = false;
            this._setButtonsDisabled(false);
          }, 600);
        }, 1100);
      }
    }, 300);
  }

  _setHp(id, pct) {
    const el = document.getElementById(id);
    if (el) el.style.width = pct + '%';
  }

  _log(html) {
    const el = document.getElementById('battle-log-text');
    if (el) el.innerHTML = html;
  }

  _setButtonsDisabled(disabled) {
    document.querySelectorAll('.battle-atk-btn').forEach(b => {
      b.disabled = disabled;
    });
  }
}

// ── GAME STATE MACHINE ─────────────────────────

const GAME = {
  scene: null,
  zone: null,
  completedZones: [],
  narrationIdx: 0,
  dialogueIdx: 0,
  narrationTW: null,
  dialogueTW: null,
  battle: null,

  init() {
    this._loadState();
    this._renderCharStats();
    this._renderZoneGrid();

    document.getElementById('btn-start').onclick = () => this.startGame();

    // Start on title
    this.go('title');
  },

  go(sceneId) {
    // Deactivate all
    document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));

    const el = document.getElementById('scene-' + sceneId);
    if (!el) return;
    el.classList.add('active');
    this.scene = sceneId;

    // Per-scene setup
    if (sceneId === 'character') this._animateStats();
    if (sceneId === 'worldmap')  this._updateWorldMap();
  },

  // ── INTRO ──
  startGame() {
    this.narrationIdx = 0;
    this.narrationTW = new Typewriter(
      document.getElementById('narration-text'),
      document.getElementById('narration-cursor')
    );
    this.go('intro');
    this._showNarrationLine(0);
  },

  _showNarrationLine(i) {
    document.getElementById('narration-prog').textContent = `${i + 1} / ${INTRO_LINES.length}`;
    this.narrationTW.write(INTRO_LINES[i]);
  },

  advanceNarration() {
    if (!this.narrationTW.done) { this.narrationTW.skip(); return; }
    this.narrationIdx++;
    if (this.narrationIdx >= INTRO_LINES.length) { this.go('character'); return; }
    this._showNarrationLine(this.narrationIdx);
  },

  // ── ZONE ENTRY ──
  enterZone(zoneId) {
    this.zone = ZONES.find(z => z.id === zoneId);
    if (!this.zone) return;

    const z = this.zone;
    document.getElementById('zi-chapter').textContent = `CHAPTER ${z.chapterNum}`;
    document.getElementById('zi-name').textContent    = z.name;
    document.getElementById('zi-era').textContent     = z.era;
    document.getElementById('zi-sub').textContent     = z.sub;
    document.getElementById('zi-bg').className        = `scene-bg ${z.bgClass}`;
    this.go('zone-intro');
  },

  // ── DIALOGUE ──
  startDialogue() {
    const z = this.zone;
    this.dialogueIdx = 0;
    this.dialogueTW = new Typewriter(
      document.getElementById('dialogue-text'),
      document.getElementById('dialogue-cursor')
    );

    document.getElementById('zd-bg').className          = `scene-bg ${z.bgClass}`;
    document.getElementById('dialogue-spk').textContent = z.npcName;
    document.getElementById('npc-nametag').textContent  = z.npcName;

    const torso = document.getElementById('npc-torso');
    if (torso) torso.style.background = z.npcColor;

    this.go('zone-dialogue');
    this._showDialogueLine(0);
  },

  _showDialogueLine(i) {
    const z = this.zone;
    document.getElementById('dialogue-ctr').textContent = `${i + 1}/${z.dialogue.length}`;
    this.dialogueTW.write(z.dialogue[i]);
  },

  advanceDialogue() {
    if (!this.dialogueTW.done) { this.dialogueTW.skip(); return; }
    this.dialogueIdx++;
    if (this.dialogueIdx >= this.zone.dialogue.length) {
      this._startBattle(); return;
    }
    this._showDialogueLine(this.dialogueIdx);
  },

  // ── BATTLE ──
  _startBattle() {
    const z = this.zone;
    const boss = z.boss;
    this.battle = new Battle(z);

    document.getElementById('enemy-name').textContent    = boss.name;
    document.getElementById('enemy-sprite').textContent  = boss.sprite;
    document.getElementById('enemy-sub').textContent     = boss.sub;
    document.getElementById('battle-bg').className       = `scene-bg ${z.bgClass}`;
    document.getElementById('enemy-hp').style.width      = '100%';
    document.getElementById('player-hp').style.width     = '100%';
    document.getElementById('battle-log-text').innerHTML = '⚔ What will Dan do?';

    const actionsEl = document.getElementById('battle-actions');
    actionsEl.innerHTML = boss.attacks.map((a, i) =>
      `<button class="battle-atk-btn" onclick="GAME.attack(${i})">${a.label}</button>`
    ).join('');

    this.go('battle');
  },

  attack(i) {
    this.battle && this.battle.attack(i);
  },

  // ── REWARD ──
  showReward() {
    const z = this.zone;
    const r = z.reward;

    document.getElementById('reward-zone').textContent = z.name + ' CLEARED!';
    document.getElementById('reward-icon').textContent = r.icon;
    document.getElementById('reward-type').textContent = r.type;
    document.getElementById('reward-name').textContent = r.name;
    document.getElementById('reward-desc').textContent = r.desc;

    if (!this.completedZones.includes(z.id)) {
      this.completedZones.push(z.id);
      this._saveState();
    }

    this.go('reward');
  },

  returnToMap() {
    this.go('worldmap');
  },

  // ── WORLD MAP ──
  _updateWorldMap() {
    const done  = this.completedZones.length;
    const total = ZONES.length;

    document.getElementById('wm-prog-label').textContent = `${done} / ${total} ZONES`;
    document.getElementById('wm-prog-fill').style.width  = (done / total * 100) + '%';

    ZONES.forEach(z => {
      const node = document.getElementById('zone-node-' + z.id);
      if (node) node.classList.toggle('zone-complete', this.completedZones.includes(z.id));
    });

    const btn = document.getElementById('btn-finale');
    if (btn) btn.classList.toggle('show', done >= total);
  },

  // ── CHARACTER STATS ──
  _renderCharStats() {
    const el = document.getElementById('cs-stats');
    if (!el) return;
    el.innerHTML = CHAR_STATS.map(s => `
      <div class="stat-row">
        <span class="stat-name">${s.name}</span>
        <div class="stat-bar">
          <div class="stat-fill"
               style="background:${s.color}; --delay:${s.delay}s"
               data-target="${s.val}">
          </div>
        </div>
        <span class="stat-val">${s.val}</span>
      </div>`).join('');
  },

  _animateStats() {
    setTimeout(() => {
      document.querySelectorAll('.stat-fill').forEach(f => {
        f.style.width = f.dataset.target + '%';
      });
    }, 120);
  },

  // ── ZONE GRID ──
  _renderZoneGrid() {
    const el = document.getElementById('zone-grid');
    if (!el) return;
    el.innerHTML = ZONES.map(z => `
      <button class="zone-node" id="zone-node-${z.id}"
              onclick="GAME.enterZone('${z.id}')"
              aria-label="Enter ${z.name}, ${z.era}">
        <div class="zone-node-inner ${z.bgClass}">
          <span class="zone-node-chapter">CHAPTER ${z.chapterNum}</span>
          <span class="zone-node-name">${z.name}</span>
          <span class="zone-node-era">${z.era}</span>
          <span class="zone-complete-badge" aria-hidden="true">✓ CLEARED</span>
        </div>
      </button>`).join('');
  },

  // ── PERSISTENCE ──
  _saveState() {
    try { localStorage.setItem('pq3', JSON.stringify({ c: this.completedZones })); } catch {}
  },

  _loadState() {
    try {
      const s = JSON.parse(localStorage.getItem('pq3') || '{}');
      this.completedZones = Array.isArray(s.c) ? s.c : [];
    } catch { this.completedZones = []; }
  }
};

// ── BOOT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => GAME.init());
