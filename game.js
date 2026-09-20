/* =========================================================
   KERN MY RESUME — game.js
   A typography game about a real resume. Vanilla JS, no deps.
   ========================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     CONFIG
  --------------------------------------------------------- */

  const GAME_CONFIG = {
    roundTime: 4000,        // ms per round
    feedbackTime: 700,      // ms feedback is shown before advancing
    totalRounds: 15,
    portfolioURL: '/work',          // <-- point this at your portfolio
    coffeeBreakURL: '/coffee-break',// <-- point this at your Coffee Break index
    soundEnabled: true,
    kernStep: 2,            // px moved per key press / click
    kernStepHold: 3,        // px moved per tick while a control button is held
    holdRepeatMs: 55,       // repeat interval while holding a control
    maxScore: 100           // per-round max
  };

  /* ---------------------------------------------------------
     CHALLENGE DATA
     One entry per round. `pair` is matched case-insensitively
     against `text` to find the two letters whose spacing the
     player controls. Every letter from the *second* character
     of the pair onward moves together, so only that one gap
     changes — the rest of the word stays put.
  --------------------------------------------------------- */

  const CHALLENGES = [
    { text: 'HIGH VOLUME',                pair: 'VO', startingOffset:  26, idealOffset: -1, difficulty: 1, font: 'font-serif-display' },
    { text: 'TYPOGRAPHY',                 pair: 'TY', startingOffset: -24, idealOffset:  0, difficulty: 1, font: 'font-grotesk' },
    { text: 'ART DIRECTION',              pair: 'RT', startingOffset:  22, idealOffset: -2, difficulty: 1, font: 'font-condensed' },
    { text: 'PRINT + DIGITAL',            pair: 'TA', startingOffset: -18, idealOffset:  1, difficulty: 2, font: 'font-editorial' },
    { text: 'BRAND SYSTEMS',              pair: 'AN', startingOffset:  16, idealOffset: -1, difficulty: 2, font: 'font-sans-medium' },
    { text: 'CREATIVE PRODUCTION',        pair: 'AT', startingOffset: -15, idealOffset:  0, difficulty: 2, font: 'font-serif-display' },
    { text: 'QUALITY CONTROL',            pair: 'TR', startingOffset:  14, idealOffset: -2, difficulty: 2, font: 'font-grotesk' },
    { text: 'NATIONAL CAMPAIGNS',         pair: 'PA', startingOffset: -11, idealOffset:  1, difficulty: 3, font: 'font-condensed' },
    { text: 'PREPRESS',                   pair: 'RE', startingOffset:  10, idealOffset: -1, difficulty: 3, font: 'font-editorial' },
    { text: 'CREATIVE OPERATIONS',        pair: 'TI', startingOffset:  -9, idealOffset:  0, difficulty: 3, font: 'font-sans-medium' },
    { text: 'WORKFLOW AUTOMATION',        pair: 'TO', startingOffset:   8, idealOffset: -2, difficulty: 3, font: 'font-serif-display' },
    { text: 'VENDOR MANAGEMENT',          pair: 'AG', startingOffset:  -6, idealOffset:  1, difficulty: 4, font: 'font-grotesk' },
    { text: 'TEAM LEADERSHIP',            pair: 'SH', startingOffset:   6, idealOffset: -1, difficulty: 4, font: 'font-condensed' },
    { text: 'PRODUCTION DESIGN DIRECTOR', pair: 'DI', startingOffset:  -5, idealOffset:  0, difficulty: 4, font: 'font-editorial' },
    { text: 'PIXEL PERFECT',              pair: 'XE', startingOffset:   4, idealOffset: -1, difficulty: 5, font: 'font-sans-medium' }
  ];

  const FONT_CLASS = {
    'font-serif-display': { family: "'Playfair Display', serif", weight: 900 },
    'font-grotesk':        { family: "'Archivo Black', sans-serif", weight: 400 },
    'font-condensed':      { family: "'Oswald', sans-serif", weight: 600 },
    'font-editorial':      { family: "'Libre Caslon Text', serif", weight: 700, italic: true },
    'font-sans-medium':    { family: "'Inter', sans-serif", weight: 700 }
  };

  const FEEDBACK = {
    perfect:  { label: 'PERFECT!',                          char: 'celebrating' },
    great:    { label: 'PRETTY DAMN CLOSE.',                 char: 'encouraging' },
    good:     { label: "I'LL ALLOW IT.",                     char: 'encouraging' },
    meh:      { label: 'OOF.',                                char: 'disappointed' },
    bad:      { label: 'PLEASE STEP AWAY\nFROM INDESIGN.',    char: 'disappointed' }
  };

  const EXTRA_LINES = [
    "THAT'LL PRINT.", 'SHIP IT.', 'PRODUCTION READY.', 'NO NOTES.',
    'GOOD ENOUGH FOR DIGITAL.', 'CHECK YOUR PREFLIGHT.', 'WHO KERNED THIS?',
    'CMD + Z.', 'WE CAN DO BETTER.', 'YOU SAW NOTHING.'
  ];

  const STATUS_LINES = [
    'DOCUMENT: resume_final_FINAL_v7.indd',
    'NO MISSING LINKS',
    'PREFLIGHT: 0 ERRORS',
    'SAVED 2 SECONDS AGO',
    'AUTO-KERN: DISABLED',
    'COLOR MODE: CMYK (PROBABLY FINE)'
  ];

  const KERNING_TITLES = [
    { min: 1400, title: 'KERN MASTER' },
    { min: 1200, title: 'PRODUCTION READY' },
    { min: 1000, title: 'SAFE TO EXPORT' },
    { min: 750,  title: 'ONE MORE PASS' },
    { min: 500,  title: 'CHECK YOUR PREFLIGHT' },
    { min: -Infinity, title: 'PLEASE STEP AWAY FROM INDESIGN' }
  ];

  /* ---------------------------------------------------------
     PIXEL CHARACTER (canvas-drawn, 12x16 grid)
     If real sprite PNGs are dropped into /assets with these
     names, they are used automatically instead:
       james-neutral.png, james-thinking.png, james-encouraging.png,
       james-celebrating.png, james-disappointed.png, james-impatient.png
  --------------------------------------------------------- */

  const PALETTE = {
    0: null,          // transparent
    1: '#241b12',      // hair
    2: '#d9a878',      // skin
    3: '#3b2a1c',      // beard
    4: '#1f2937',      // shirt navy
    5: '#141b24',      // shirt shade / collar
    7: '#161311',      // eyes / dark detail
    8: '#7a3a22'        // mouth line
  };

  const BASE_SPRITE = [
    '000111111000',
    '001111111100',
    '011111111110',
    '011222222110',
    '022722227220',
    '022222222220',
    '022222222220',
    '022288882220',
    '013333333310',
    '003333333300',
    '000022220000',
    '044445544440',
    '044444444440',
    '044444444440',
    '044444444440',
    '044444444440'
  ].map(row => row.split('').map(Number));

  // Row/col overrides applied on top of BASE_SPRITE per character state.
  const STATE_OVERRIDES = {
    neutral: [],
    thinking: [
      { r: 4, c: 3, v: 2 },  { r: 4, c: 4, v: 7 }, // eyes shift right (looking at the type)
      { r: 4, c: 8, v: 2 },  { r: 4, c: 9, v: 7 },
      { r: 7, c: 4, v: 2 }, { r: 7, c: 7, v: 2 }, { r: 7, c: 5, v: 8 }, { r: 7, c: 6, v: 8 }
    ],
    encouraging: [
      { r: 7, c: 3, v: 8 }, { r: 7, c: 8, v: 8 }, // wider smile
      { r: 10, c: 0, v: 4 }, { r: 11, c: 0, v: 4 } // arm raised, pointing
    ],
    celebrating: [
      { r: 7, c: 3, v: 8 }, { r: 7, c: 8, v: 8 },
      { r: 8, c: 5, v: 8 }, { r: 8, c: 6, v: 8 },  // open-mouth grin
      { r: 8, c: 0, v: 4 }, { r: 9, c: 0, v: 4 },  // left arm up
      { r: 8, c: 11, v: 4 }, { r: 9, c: 11, v: 4 } // right arm up
    ],
    disappointed: [
      { r: 4, c: 3, v: 2 }, { r: 5, c: 3, v: 2 },  // eye covered (facepalm)
      { r: 5, c: 4, v: 2 },
      { r: 7, c: 5, v: 8 }, { r: 7, c: 6, v: 8 }, { r: 7, c: 3, v: 2 }, { r: 7, c: 8, v: 2 }
    ],
    impatient: [
      { r: 4, c: 4, v: 2 }, { r: 4, c: 5, v: 7 },  // eyes glance sideways at the "watch"
      { r: 4, c: 8, v: 2 }, { r: 4, c: 9, v: 7 },
      { r: 9, c: 10, v: 7 }, { r: 9, c: 11, v: 2 }  // watch mark on wrist
    ]
  };

  const ASSET_NAMES = {
    neutral: 'james-neutral.png',
    thinking: 'james-thinking.png',
    encouraging: 'james-encouraging.png',
    celebrating: 'james-celebrating.png',
    disappointed: 'james-disappointed.png',
    impatient: 'james-impatient.png'
  };

  const assetCache = {};

  function tryLoadAsset(state) {
    if (assetCache[state] !== undefined) return;
    const img = new Image();
    img.onload = () => { assetCache[state] = img; };
    img.onerror = () => { assetCache[state] = null; };
    img.src = 'assets/' + ASSET_NAMES[state];
    assetCache[state] = null; // pending -> falls back to canvas draw until it loads
  }
  Object.keys(ASSET_NAMES).forEach(tryLoadAsset);

  function drawCharacter(canvas, state) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const asset = assetCache[state];
    if (asset) {
      ctx.drawImage(asset, 0, 0, canvas.width, canvas.height);
      return;
    }

    const cols = BASE_SPRITE[0].length;
    const rows = BASE_SPRITE.length;
    const scale = canvas.width / cols;

    const grid = BASE_SPRITE.map(row => row.slice());
    (STATE_OVERRIDES[state] || []).forEach(({ r, c, v }) => { grid[r][c] = v; });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const color = PALETTE[grid[r][c]];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(Math.round(c * scale), Math.round(r * scale), Math.ceil(scale), Math.ceil(scale));
      }
    }
  }

  /* ---------------------------------------------------------
     SOUND (tiny synthesized WebAudio blips — no audio files)
  --------------------------------------------------------- */

  let audioCtx = null;
  function getAudioCtx() {
    if (!GAME_CONFIG.soundEnabled) return null;
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    return audioCtx;
  }

  function beep({ freq = 440, duration = 0.06, type = 'square', gain = 0.05 }) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g).connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  }

  const SFX = {
    tick: () => beep({ freq: 900, duration: 0.02, type: 'square', gain: 0.03 }),
    lock: () => beep({ freq: 300, duration: 0.05, type: 'square', gain: 0.06 }),
    perfect: () => { beep({ freq: 660, duration: 0.08 }); setTimeout(() => beep({ freq: 990, duration: 0.12 }), 70); },
    bad: () => beep({ freq: 140, duration: 0.18, type: 'sawtooth', gain: 0.05 }),
    reveal: () => { beep({ freq: 440, duration: 0.1 }); setTimeout(() => beep({ freq: 660, duration: 0.16 }), 100); }
  };

  /* ---------------------------------------------------------
     STATE
  --------------------------------------------------------- */

  const state = {
    round: 0,           // 0-indexed
    score: 0,
    offset: 0,
    currentChallenge: null,
    letters: [],        // rendered span elements
    pairSecondIndex: -1,
    timerStart: 0,
    timerId: null,
    tickId: null,
    timeLeft: GAME_CONFIG.roundTime,
    locked: false,      // prevents double submission
    holdInterval: null,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  /* ---------------------------------------------------------
     DOM REFS
  --------------------------------------------------------- */

  const screens = {
    start: document.getElementById('screen-start'),
    howto: document.getElementById('screen-howto'),
    game: document.getElementById('screen-game'),
    final: document.getElementById('screen-final')
  };

  const el = {
    btnStart: document.getElementById('btn-start'),
    btnBegin: document.getElementById('btn-begin'),
    btnSound: document.getElementById('btn-sound'),
    soundState: document.getElementById('sound-state'),
    hudRound: document.getElementById('hud-round'),
    hudTotal: document.getElementById('hud-total'),
    hudScore: document.getElementById('hud-score'),
    progressFill: document.getElementById('progress-fill'),
    progressTrack: document.querySelector('.progress-track'),
    timer: document.getElementById('timer'),
    timerValue: document.getElementById('timer-value'),
    wordStage: document.getElementById('word-stage'),
    btnLooser: document.getElementById('btn-looser'),
    btnTighter: document.getElementById('btn-tighter'),
    btnLock: document.getElementById('btn-lock'),
    feedbackOverlay: document.getElementById('feedback-overlay'),
    feedbackMain: document.getElementById('feedback-main'),
    feedbackPoints: document.getElementById('feedback-points'),
    feedbackExtra: document.getElementById('feedback-extra'),
    statusText: document.getElementById('status-text'),
    liveRegion: document.getElementById('live-region'),
    finalScore: document.getElementById('final-score'),
    finalMax: document.getElementById('final-max'),
    finalTitle: document.getElementById('final-title'),
    btnAgain: document.getElementById('btn-again'),
    btnWork: document.getElementById('btn-work'),
    btnCoffee: document.getElementById('btn-coffee'),
    charCanvasStart: document.getElementById('char-canvas'),
    charCanvasGame: document.getElementById('char-canvas-2'),
    charCanvasFinal: document.getElementById('char-canvas-3')
  };

  el.hudTotal.textContent = String(GAME_CONFIG.totalRounds).padStart(2, '0');
  el.finalMax.textContent = String(GAME_CONFIG.totalRounds * GAME_CONFIG.maxScore);
  el.btnWork.href = GAME_CONFIG.portfolioURL;
  el.btnCoffee.href = GAME_CONFIG.coffeeBreakURL;

  /* ---------------------------------------------------------
     SCREEN MANAGEMENT
  --------------------------------------------------------- */

  function showScreen(name) {
    Object.entries(screens).forEach(([key, node]) => {
      node.hidden = key !== name;
    });
  }

  function announce(msg) {
    el.liveRegion.textContent = msg;
  }

  /* ---------------------------------------------------------
     STATUS BAR FLAVOR TEXT
  --------------------------------------------------------- */

  let statusIndex = 0;
  setInterval(() => {
    if (screens.game.hidden) return;
    statusIndex = (statusIndex + 1) % STATUS_LINES.length;
    el.statusText.textContent = STATUS_LINES[statusIndex];
  }, 3200);

  /* ---------------------------------------------------------
     CHARACTER REACTIONS
  --------------------------------------------------------- */

  function setCharacter(stateName) {
    drawCharacter(el.charCanvasStart, stateName);
    drawCharacter(el.charCanvasGame, stateName);
    drawCharacter(el.charCanvasFinal, stateName);
  }

  /* ---------------------------------------------------------
     ROUND RENDERING
  --------------------------------------------------------- */

  function findPair(text, pair) {
    const upperText = text.toUpperCase();
    const upperPair = pair.toUpperCase();
    const idx = upperText.indexOf(upperPair);
    return idx === -1 ? 0 : idx;
  }

  function renderWord(challenge) {
    el.wordStage.innerHTML = '';
    state.letters = [];

    const fontInfo = FONT_CLASS[challenge.font] || FONT_CLASS['font-sans-medium'];
    el.wordStage.style.fontFamily = fontInfo.family;
    el.wordStage.style.fontWeight = fontInfo.weight;
    el.wordStage.style.fontStyle = fontInfo.italic ? 'italic' : 'normal';

    const pairStart = findPair(challenge.text, challenge.pair);
    const pairSecondIndex = pairStart + 1;

    // Group letters by word so line-wrapping can only happen between words,
    // never between the two letters of the kerning pair itself.
    const chars = challenge.text.split('');
    let wordGroup = document.createElement('span');
    wordGroup.className = 'kword';
    el.wordStage.appendChild(wordGroup);

    let letterIndex = 0; // index into state.letters (spaces are not letters)
    chars.forEach((ch, i) => {
      if (ch === ' ') {
        wordGroup = document.createElement('span');
        wordGroup.className = 'kword';
        el.wordStage.appendChild(wordGroup);
        return;
      }
      const span = document.createElement('span');
      span.className = 'kletter';
      span.textContent = ch;
      span.style.letterSpacing = '0.5px';
      if (i === pairStart) span.classList.add('pair-start');
      if (i === pairSecondIndex) { span.classList.add('pair-end'); state.pairSecondIndex = letterIndex; }
      wordGroup.appendChild(span);
      state.letters.push(span);
      letterIndex++;
    });

    const hintOpacity = challenge.difficulty <= 1 ? 0.9
      : challenge.difficulty === 2 ? 0.65
      : challenge.difficulty === 3 ? 0.4
      : challenge.difficulty === 4 ? 0.18
      : 0;
    el.wordStage.style.setProperty('--hint-opacity', hintOpacity);

    applyOffset(challenge.startingOffset);
  }

  function applyOffset(px) {
    state.offset = px;
    for (let i = state.pairSecondIndex; i < state.letters.length; i++) {
      state.letters[i].style.transform = `translateX(${px}px)`;
    }
  }

  /* ---------------------------------------------------------
     TIMER
  --------------------------------------------------------- */

  function clearTimers() {
    if (state.timerId) { clearTimeout(state.timerId); state.timerId = null; }
    if (state.tickId) { clearInterval(state.tickId); state.tickId = null; }
  }

  function startTimer() {
    clearTimers();
    state.timeLeft = GAME_CONFIG.roundTime;
    updateTimerDisplay();
    el.timer.classList.remove('urgent');

    const tickEvery = 100;
    state.tickId = setInterval(() => {
      state.timeLeft -= tickEvery;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        updateTimerDisplay();
        submitRound(true);
        return;
      }
      updateTimerDisplay();
      if (state.timeLeft <= 1200) {
        el.timer.classList.add('urgent');
        if (!screens.game.hidden) setCharacter('impatient');
      }
    }, tickEvery);
  }

  function updateTimerDisplay() {
    const seconds = Math.ceil(state.timeLeft / 1000);
    el.timerValue.textContent = String(Math.max(seconds, 0)).padStart(2, '0');
  }

  /* ---------------------------------------------------------
     SCORING
  --------------------------------------------------------- */

  function scoreForDistance(distance) {
    if (distance <= 2) return 100;
    if (distance <= 5) return 85;
    if (distance <= 9) return 70;
    if (distance <= 14) return 50;
    return Math.max(10, 35 - Math.floor((distance - 15) / 3) * 5);
  }

  function tierForScore(points) {
    if (points >= 100) return 'perfect';
    if (points >= 85) return 'great';
    if (points >= 70) return 'good';
    if (points >= 50) return 'meh';
    return 'bad';
  }

  /* ---------------------------------------------------------
     ROUND FLOW
  --------------------------------------------------------- */

  function loadRound(index) {
    state.round = index;
    state.locked = false;
    state.currentChallenge = CHALLENGES[index];

    el.hudRound.textContent = String(index + 1).padStart(2, '0');
    el.hudScore.textContent = String(state.score);
    el.progressFill.style.width = `${(index / GAME_CONFIG.totalRounds) * 100}%`;
    el.progressTrack.setAttribute('aria-valuenow', String(index));

    el.feedbackOverlay.hidden = true;
    renderWord(state.currentChallenge);
    setCharacter(index === 0 ? 'neutral' : 'thinking');
    startTimer();
    announce(`Round ${index + 1} of ${GAME_CONFIG.totalRounds}. ${state.currentChallenge.text}`);
  }

  function submitRound(timedOut) {
    if (state.locked) return;
    state.locked = true;
    clearTimers();
    stopHold();

    const challenge = state.currentChallenge;
    const distance = Math.abs(state.offset - challenge.idealOffset);
    const points = timedOut ? Math.max(10, Math.round(scoreForDistance(distance) * 0.6)) : scoreForDistance(distance);
    const tier = timedOut && distance > 9 ? 'bad' : tierForScore(points);

    state.score += points;
    el.hudScore.textContent = String(state.score);

    SFX.lock();
    if (tier === 'perfect') SFX.perfect();
    else if (tier === 'bad') SFX.bad();

    showFeedback(tier, points, timedOut);
  }

  function showFeedback(tier, points, timedOut) {
    const info = FEEDBACK[tier];
    setCharacter(info.char);

    el.feedbackMain.textContent = timedOut ? "TIME'S UP." : info.label;
    el.feedbackPoints.textContent = `+${points}`;
    el.feedbackExtra.textContent = Math.random() < 0.35
      ? EXTRA_LINES[Math.floor(Math.random() * EXTRA_LINES.length)]
      : '';
    el.feedbackOverlay.hidden = false;
    announce(`${info.label.replace('\n', ' ')} Plus ${points} points.`);

    const wait = state.reducedMotion ? Math.min(GAME_CONFIG.feedbackTime, 400) : GAME_CONFIG.feedbackTime;
    setTimeout(advanceRound, wait);
  }

  function advanceRound() {
    const next = state.round + 1;
    if (next >= GAME_CONFIG.totalRounds) {
      finishGame();
    } else {
      loadRound(next);
    }
  }

  function finishGame() {
    clearTimers();
    el.progressFill.style.width = '100%';
    SFX.reveal();

    const finalScore = state.score;
    el.finalScore.textContent = String(finalScore);
    const tierInfo = KERNING_TITLES.find(t => finalScore >= t.min);
    el.finalTitle.textContent = tierInfo ? tierInfo.title : '';

    const finalChar = finalScore >= 1000 ? 'celebrating' : finalScore >= 500 ? 'encouraging' : 'disappointed';
    setCharacter(finalChar);

    showScreen('final');
    announce(`Game complete. Final score ${finalScore} out of ${GAME_CONFIG.totalRounds * GAME_CONFIG.maxScore}. ${tierInfo ? tierInfo.title : ''}`);
  }

  /* ---------------------------------------------------------
     INPUT — keyboard, mouse/click, touch, hold-to-repeat
  --------------------------------------------------------- */

  function nudge(direction) {
    // offset is the translateX (px) applied to the pair's second letter, so
    // increasing it pushes that letter further away = looser; decreasing it
    // pulls it back in = tighter. direction: +1 = looser, -1 = tighter.
    if (state.locked || screens.game.hidden) return;
    applyOffset(state.offset + direction * GAME_CONFIG.kernStep);
    SFX.tick();
  }

  function startHold(direction) {
    stopHold();
    nudge(direction);
    state.holdInterval = setInterval(() => {
      if (state.locked || screens.game.hidden) { stopHold(); return; }
      applyOffset(state.offset + direction * GAME_CONFIG.kernStepHold);
    }, GAME_CONFIG.holdRepeatMs);
  }

  function stopHold() {
    if (state.holdInterval) { clearInterval(state.holdInterval); state.holdInterval = null; }
  }

  function isTypingTarget(target) {
    return target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
  }

  document.addEventListener('keydown', (e) => {
    if (isTypingTarget(e.target)) return;

    if (e.code === 'Space') {
      e.preventDefault(); // never let space scroll the page
      if (!screens.start.hidden) { e.preventDefault(); goToHowTo(); return; }
      if (!screens.howto.hidden) { beginGame(); return; }
      if (!screens.game.hidden) { submitRound(false); return; }
      return;
    }
    if (!screens.game.hidden && !state.locked) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); nudge(-1); }  // tighter
      else if (e.key === 'ArrowRight') { e.preventDefault(); nudge(1); } // looser
    }
  });

  el.btnStart.addEventListener('click', goToHowTo);
  el.btnBegin.addEventListener('click', beginGame);
  el.btnLock.addEventListener('click', () => submitRound(false));

  function bindHoldable(button, direction) {
    button.addEventListener('mousedown', () => startHold(direction));
    button.addEventListener('touchstart', (e) => { e.preventDefault(); startHold(direction); }, { passive: false });
    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(evt => {
      button.addEventListener(evt, stopHold);
    });
    button.addEventListener('click', () => {}); // click no-op; mousedown/touchstart drive the action
  }
  bindHoldable(el.btnLooser, 1);
  bindHoldable(el.btnTighter, -1);

  el.btnSound.addEventListener('click', () => {
    GAME_CONFIG.soundEnabled = !GAME_CONFIG.soundEnabled;
    el.soundState.textContent = GAME_CONFIG.soundEnabled ? 'ON' : 'OFF';
    el.btnSound.setAttribute('aria-pressed', String(!GAME_CONFIG.soundEnabled));
  });

  el.btnAgain.addEventListener('click', restartGame);

  /* ---------------------------------------------------------
     SCREEN TRANSITIONS
  --------------------------------------------------------- */

  function goToHowTo() {
    showScreen('howto');
  }

  function beginGame() {
    state.score = 0;
    showScreen('game');
    loadRound(0);
  }

  function restartGame() {
    showScreen('start');
    setCharacter('neutral');
  }

  /* ---------------------------------------------------------
     INIT
  --------------------------------------------------------- */

  setCharacter('neutral');
  showScreen('start');

})();
