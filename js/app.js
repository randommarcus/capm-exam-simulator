/* ═══════════════════════════════════════════════════════════════
   CAPM® Practice Exam Simulator  ·  Application Logic
   ───────────────────────────────────────────────────────────────
   Depends on:  js/questions.js  (QB constant)
   Entry points called from HTML onclick attributes:
     selectLen(n)   startExam()     pick_ans(i)
     next()         askQuit()       cancelQuit()
     confirmQuit()  retake()        toggleDomain()
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   § 1  CONFIGURATION
   ───────────────────────────────────────────────────────────── */

/**
 * PMI CAPM Exam Content Outline domain definitions.
 * `count` is the draw quota for the default 30-question exam.
 */
const DOMAINS = {
  d1: { name: 'PM Fundamentals & Core Concepts',      full: 'Domain 1: Project Management Fundamentals and Core Concepts', weight: '36%', count: 11 },
  d2: { name: 'Predictive Methodologies',              full: 'Domain 2: Predictive, Plan-Based Methodologies',              weight: '17%', count:  5 },
  d3: { name: 'Agile Frameworks',                      full: 'Domain 3: Agile Frameworks/Methodologies',                    weight: '20%', count:  6 },
  d4: { name: 'Business Analysis',                     full: 'Domain 4: Business Analysis Frameworks',                      weight: '27%', count:  8 },
};

/**
 * Per-length exam configuration.
 * Domain draw counts preserve the 36/17/20/27 ECO weighting at every length.
 * Time limits scale linearly from PMI's real allowance: 180 min / 150 Q = 1.2 min per question.
 */
const EXAM_LENGTHS = {
   30: { d1: 11, d2:  5, d3:  6, d4:  8, minutes:  36 },
   60: { d1: 22, d2: 10, d3: 12, d4: 16, minutes:  72 },
   90: { d1: 33, d2: 15, d3: 18, d4: 24, minutes: 108 },
  120: { d1: 43, d2: 20, d3: 24, d4: 33, minutes: 144 },
  150: { d1: 54, d2: 26, d3: 30, d4: 40, minutes: 180 },
};

/** Answer-option letter labels (A–D). */
const LETTERS = ['A', 'B', 'C', 'D'];

/** CSS class names for each domain's badge colour. */
const DOMAIN_COLORS = { d1: 'db-d1', d2: 'db-d2', d3: 'db-d3', d4: 'db-d4' };

/** Ordered array of domain keys, used wherever iteration order must be consistent. */
const DOMAIN_KEYS = ['d1', 'd2', 'd3', 'd4'];

/** Seconds remaining at which the countdown timer enters warning (red/pulse) state. */
const WARN_SECONDS = 300;

/** Score percentage at or above which a domain is rated "Above Target." */
const PASS_PCT = 70;

/** Score percentage at or above which a domain is rated "On Target" (below PASS_PCT). */
const ON_TARGET_PCT = 60;

/** Study recommendations shown in the results screen for each domain. */
const RECOMMENDATIONS = {
  d1: 'Review PMBOK 7th Edition Principles and all 8 Performance Domains. Study stakeholder engagement, team development, and project governance. PMI Foundational Standards are core for CAPM.',
  d2: 'Practice EVM calculations (SPI, CPI, SV, CV, EAC, VAC, ETC). Study CPM and network diagramming. Review change control processes and contract types from PMBOK.',
  d3: 'Deepen your Scrum knowledge (roles, events, artifacts, DoD). Study Kanban, XP, and SAFe. Re-read the Agile Manifesto 12 Principles and the Agile Practice Guide.',
  d4: 'Study the PMI Business Analysis Practice Guide thoroughly. Focus on elicitation techniques, requirements types (functional vs. NFR), RTM, MoSCoW prioritization, and change management models.',
};

/* ─────────────────────────────────────────────────────────────
   § 2  APPLICATION STATE
   ───────────────────────────────────────────────────────────── */

/** Currently-selected exam length (number of questions). */
let selectedLen = 30;

/** Whether the domain badge is visible above each question. */
let showDomain = true;

/**
 * Active exam session object.  Null when no exam is in progress.
 * @type {{ qs: object[], idx: number, score: number, answered: boolean,
 *           ds: { [dk: string]: { c: number, t: number } } } | null}
 */
let S = null;

/** Build a fresh session state around a shuffled question array. */
function createSession(questions) {
  return {
    qs:       questions,
    idx:      0,
    score:    0,
    answered: false,
    ds:       Object.fromEntries(DOMAIN_KEYS.map(dk => [dk, { c: 0, t: 0 }])),
  };
}

/* ─────────────────────────────────────────────────────────────
   § 3  TIMER
   ───────────────────────────────────────────────────────────── */

let timerInterval = null;
let timeRemaining = 0;
let timerPaused   = false;

/** Format a second count into M:SS or H:MM:SS. */
function fmtClock(sec) {
  sec = Math.max(0, sec);
  const h   = Math.floor(sec / 3600);
  const m   = Math.floor((sec % 3600) / 60);
  const s   = sec % 60;
  const pad = v => String(v).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function updateTimerDisplay() {
  const el = $id('timer-disp');
  if (!el) return;
  el.textContent = timerPaused
    ? `⏸ ${fmtClock(timeRemaining)}`
    : `⏱ ${fmtClock(timeRemaining)}`;
  el.classList.toggle('warn',   !timerPaused && timeRemaining <= WARN_SECONDS && timeRemaining > 0);
  el.classList.toggle('paused', timerPaused);
}

/** Start a countdown from `minutes`. Stops automatically and calls timeUp() at zero. */
function startTimer(minutes) {
  stopTimer();
  timerPaused   = false;
  timeRemaining = minutes * 60;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    if (timerPaused) return;
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) { stopTimer(); timeUp(); }
  }, 1000);
}

/**
 * Freeze the countdown without losing remaining time.
 * Called when the user selects an answer so they can read the rationale at leisure.
 */
function pauseTimer() { timerPaused = true;  updateTimerDisplay(); }

/** Resume a previously paused countdown. Called when the user moves to the next question. */
function resumeTimer() { timerPaused = false; updateTimerDisplay(); }

/** Clear the interval and reset the paused flag. Safe to call when no timer is running. */
function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  timerPaused = false;
}

/** Invoked when the countdown reaches zero. Submits for scoring with a "time up" reason. */
function timeUp() {
  $id('quit-modal').classList.add('hidden');
  showResults(true, 'timeup');
}

/* ─────────────────────────────────────────────────────────────
   § 4  UTILITIES
   ───────────────────────────────────────────────────────────── */

/**
 * Fisher-Yates in-place shuffle.
 * @param {any[]} arr
 * @returns {any[]} New shuffled array (original untouched).
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Return n randomly-sampled items from arr (no repeats). */
function pick(arr, n) { return shuffle(arr).slice(0, n); }

/** Shorthand for document.getElementById. */
function $id(id) { return document.getElementById(id); }

/** Escape characters that are meaningful in HTML. Used before injecting text into innerHTML. */
function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Split a rationale string into individual sentences for bullet-point display.
 *
 * Protects common abbreviations (e.g., i.e., etc., vs.) and decimal numbers
 * (0.88, 1.0) from being treated as sentence boundaries by temporarily
 * replacing their periods with a placeholder character.
 *
 * @param {string} text  Raw rationale string from the question bank.
 * @returns {string[]}   Array of sentence strings (at least one element).
 */
function splitRationale(text) {
  const PLACEHOLDER = '∯';
  const protect = t => t
    .replace(/\b(e\.g|i\.e|etc|vs|approx|no|Inc|Ltd|Dr|Mr|Mrs|Ms|Jr|Sr)\.(?=\s)/gi,
             m => m.replace('.', PLACEHOLDER))
    .replace(/(\d)\.(\d)/g, `$1${PLACEHOLDER}$2`);
  const restore = t => t.split(PLACEHOLDER).join('.');

  const parts = protect(text)
    .split(/(?<=[.!?])\s+(?=[A-Z(])/)
    .map(p => restore(p.trim()))
    .filter(Boolean);

  return parts.length ? parts : [text];
}

/** Format a minute value as a human-readable duration (e.g. "36 min", "1h 48m", "3 hr"). */
function fmtDuration(mins) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h}h ${m}m`;
}

/* ─────────────────────────────────────────────────────────────
   § 5  START SCREEN
   ───────────────────────────────────────────────────────────── */

/** Update the selected exam-length pill and refresh the stat counters. */
function selectLen(n) {
  selectedLen = n;
  document.querySelectorAll('.el-btn').forEach(b =>
    b.classList.toggle('active', +b.dataset.len === n)
  );
  $id('stat-q-count').textContent = n;
  $id('stat-time').textContent    = fmtDuration(EXAM_LENGTHS[n].minutes);
}

/* ─────────────────────────────────────────────────────────────
   § 6  SESSION GENERATION
   ───────────────────────────────────────────────────────────── */

/**
 * Build a randomised question list for the selected exam length.
 *
 * For each question the A-D option order is shuffled so the correct answer
 * appears at a random position every time, preventing the "longest option is
 * usually correct" pattern-recognition shortcut.
 *
 * @param {number} len  One of the keys in EXAM_LENGTHS (30 | 60 | 90 | 120 | 150).
 * @returns {object[]}  Shuffled array of question objects, each annotated with its domain key.
 */
function genSession(len) {
  const cfg = EXAM_LENGTHS[len];
  const all = [];

  DOMAIN_KEYS.forEach(dk => {
    pick(QB[dk], cfg[dk]).forEach(q => {
      const shuffledOpts = shuffle([...q.opts]);
      const correctText  = q.opts[q.ans];
      all.push({ ...q, opts: shuffledOpts, ans: shuffledOpts.indexOf(correctText), domain: dk });
    });
  });

  return shuffle(all);
}

/* ─────────────────────────────────────────────────────────────
   § 7  EXAM LIFECYCLE
   ───────────────────────────────────────────────────────────── */

/** Initialise a new session and transition from the start screen to the quiz screen. */
function startExam() {
  S = createSession(genSession(selectedLen));

  // Reset domain-toggle to visible at the start of every exam
  showDomain = true;
  const domainBtn = $id('domain-toggle-btn');
  if (domainBtn) {
    domainBtn.classList.add('active');
    domainBtn.title = 'Hide domain label';
  }

  $id('start-screen').classList.add('hidden');
  $id('quiz-screen').classList.remove('hidden');
  startTimer(EXAM_LENGTHS[selectedLen].minutes);
  render();
}

/** Toggle domain badge visibility above each question. State persists for the full session. */
function toggleDomain() {
  showDomain = !showDomain;
  const btn  = $id('domain-toggle-btn');
  btn.classList.toggle('active', showDomain);
  btn.title                               = showDomain ? 'Hide domain label' : 'Show domain label';
  $id('d-badge').style.visibility         = showDomain ? 'visible' : 'hidden';
}

/* ─────────────────────────────────────────────────────────────
   § 8  QUESTION RENDERER
   ───────────────────────────────────────────────────────────── */

/** Render the current question (S.qs[S.idx]) into the quiz screen. */
function render() {
  const q   = S.qs[S.idx];
  const num = S.idx + 1;
  const tot = S.qs.length;

  // ── Header ──────────────────────────────────────────────────
  $id('q-num').textContent      = `Question ${num} of ${tot}`;
  $id('score-disp').textContent = `${S.score} / ${S.idx}`;
  $id('prog-bar').style.width   = `${((num - 1) / tot) * 100}%`;

  // ── Domain badge ─────────────────────────────────────────────
  const badge           = $id('d-badge');
  badge.textContent     = `${q.domain.replace('d', 'Domain ')} · ${DOMAINS[q.domain].name}`;
  badge.className       = `d-badge ${DOMAIN_COLORS[q.domain]}`;
  badge.style.visibility = showDomain ? 'visible' : 'hidden';

  // ── Question text ─────────────────────────────────────────────
  $id('q-text').textContent = q.q;

  // ── Answer options ────────────────────────────────────────────
  $id('opts').innerHTML = q.opts.map((opt, i) => `
    <button class="opt-btn" id="ob${i}" onclick="pick_ans(${i})">
      <span class="opt-letter" id="ol${i}">${LETTERS[i]}</span>
      <span class="opt-text">${opt}</span>
      <span class="opt-icon"  id="oi${i}"></span>
    </button>`).join('');

  // ── Reset state ───────────────────────────────────────────────
  $id('feedback-wrap').classList.add('hidden');
  S.answered = false;

  // ── Entrance animation ────────────────────────────────────────
  const card = $id('q-card');
  card.classList.remove('q-enter');
  void card.offsetWidth; // force reflow so the animation always re-triggers
  card.classList.add('q-enter');
}

/* ─────────────────────────────────────────────────────────────
   § 9  ANSWER SELECTION
   ───────────────────────────────────────────────────────────── */

/**
 * Handle the user selecting answer option `sel`.
 * Pauses the timer, scores the answer, highlights options, and shows feedback.
 *
 * @param {number} sel  Zero-based index of the selected option (0=A … 3=D).
 */
function pick_ans(sel) {
  if (S.answered) return;
  S.answered = true;

  // Pause timer so the user can read the rationale without time pressure
  pauseTimer();

  const q       = S.qs[S.idx];
  const correct = sel === q.ans;

  // ── Score tracking ─────────────────────────────────────────────
  S.ds[q.domain].t++;
  if (correct) { S.score++; S.ds[q.domain].c++; }
  $id('score-disp').textContent = `${S.score} / ${S.idx + 1}`;

  // ── Option highlighting ────────────────────────────────────────
  for (let i = 0; i < 4; i++) {
    const btn = $id(`ob${i}`);
    btn.disabled = true;
    if (i === q.ans) {
      btn.classList.add('opt-correct');
      $id(`oi${i}`).textContent = '✓';
    } else if (i === sel && !correct) {
      btn.classList.add('opt-wrong');
      $id(`oi${i}`).textContent = '✗';
    }
  }

  // ── Feedback banner ────────────────────────────────────────────
  const banner = $id('fb-banner');
  if (correct) {
    banner.className = 'fb-banner fb-correct';
    banner.innerHTML = '<span class="fb-banner-icon">✅</span>'
                     + '<span class="fb-banner-text">Correct! Great work.</span>';
  } else {
    banner.className = 'fb-banner fb-wrong';
    banner.innerHTML = '<span class="fb-banner-icon">❌</span>'
                     + `<span class="fb-banner-text">Incorrect — the correct answer is `
                     + `<strong>${LETTERS[q.ans]}</strong>.</span>`;
  }

  // ── Rationale bullets ──────────────────────────────────────────
  $id('rat-text').innerHTML = '<ul class="rat-list">'
    + splitRationale(q.rat).map(s => `<li>${escapeHtml(s)}</li>`).join('')
    + '</ul>';

  // ── Show feedback panel ────────────────────────────────────────
  const feedbackWrap = $id('feedback-wrap');
  feedbackWrap.classList.remove('hidden');
  $id('next-btn').textContent = S.idx === S.qs.length - 1
    ? 'View My Results 🎯'
    : 'Next Question →';

  // Scroll feedback into view on mobile (small delay lets layout settle first)
  setTimeout(() => feedbackWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
}

/* ─────────────────────────────────────────────────────────────
   § 10  QUIT FLOW
   ───────────────────────────────────────────────────────────── */

/** Return the number of questions the user has actually answered so far. */
function answeredCount() {
  return Object.values(S.ds).reduce((sum, d) => sum + d.t, 0);
}

function askQuit() {
  $id('quit-progress').textContent = `${answeredCount()} of ${S.qs.length}`;
  $id('quit-modal').classList.remove('hidden');
}

function cancelQuit() {
  $id('quit-modal').classList.add('hidden');
}

function confirmQuit() {
  $id('quit-modal').classList.add('hidden');
  stopTimer();
  if (answeredCount() === 0) { retake(); return; }
  showResults(true, 'quit');
}

/* ─────────────────────────────────────────────────────────────
   § 11  NAVIGATION
   ───────────────────────────────────────────────────────────── */

/** Advance to the next question, or end the exam if this was the last one. */
function next() {
  if (S.idx === S.qs.length - 1) { stopTimer(); showResults(false); return; }
  S.idx++;
  resumeTimer();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─────────────────────────────────────────────────────────────
   § 12  RESULTS
   ───────────────────────────────────────────────────────────── */

/**
 * Compute performance tier for a percentage score.
 * @returns {{ label: string, cssKey: string, icon: string }}
 */
function perfTier(pct) {
  if (pct >= PASS_PCT)       return { label: 'Above Target', cssKey: 'at', icon: '🏆' };
  if (pct >= ON_TARGET_PCT)  return { label: 'On Target',    cssKey: 't',  icon: '📊' };
  return                            { label: 'Below Target', cssKey: 'bt', icon: '📚' };
}

/**
 * Transition to the results screen and populate all result elements.
 *
 * @param {boolean}          isPartial  True when the exam was ended early or timed out.
 * @param {'quit'|'timeup'|undefined} reason  Why the exam ended early (if applicable).
 */
function showResults(isPartial, reason) {
  $id('quiz-screen').classList.add('hidden');
  $id('results-screen').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const answered      = answeredCount();
  const score         = S.score;
  const pct           = answered > 0 ? Math.round((score / answered) * 100) : 0;
  const wasEndedEarly = !!isPartial && answered < S.qs.length;
  const isTimeUp      = reason === 'timeup' && wasEndedEarly;

  // ── Header text ────────────────────────────────────────────────
  $id('partial-notice').classList.toggle('hidden', !wasEndedEarly);
  if (isTimeUp) {
    $id('res-title').textContent       = "Time's Up ⏰";
    $id('res-sub').textContent         = `Your time limit expired — here's your performance on the ${answered} of ${S.qs.length} questions you completed`;
    $id('partial-notice').textContent  = 'Time expired before you finished — scoring reflects only the questions you answered.';
  } else if (wasEndedEarly) {
    $id('res-title').textContent       = 'Exam Ended Early 🚪';
    $id('res-sub').textContent         = `You completed ${answered} of ${S.qs.length} questions — here's your performance on those`;
    $id('partial-notice').textContent  = 'You ended this session early — scoring reflects only the questions you answered.';
  } else {
    $id('res-title').textContent       = 'Exam Complete 🎓';
    $id('res-sub').textContent         = 'Here is your detailed performance breakdown';
  }

  // ── Score ring ─────────────────────────────────────────────────
  const tier = perfTier(pct);
  $id('score-ring').className    = `score-ring ring-${tier.cssKey}`;
  $id('ring-pct').textContent    = `${pct}%`;
  $id('ring-pct').className      = `ring-pct ${tier.cssKey}-col`;
  $id('ring-frac').textContent   = `${score}/${answered} correct`;
  $id('perf-badge').className    = `perf-badge badge-${tier.cssKey}`;
  $id('perf-badge').textContent  = `${tier.icon} ${tier.label}`;

  // ── Score summary stats ────────────────────────────────────────
  $id('rs-correct').textContent  = score;
  $id('rs-wrong').textContent    = answered - score;
  $id('rs-pct').textContent      = `${pct}%`;
  $id('rs-correct').style.color  = pct >= PASS_PCT     ? 'var(--correct)'
                                 : pct >= ON_TARGET_PCT ? 'var(--accent)'
                                 :                        'var(--wrong)';

  // ── Domain breakdown rows ──────────────────────────────────────
  $id('domain-results').innerHTML = DOMAIN_KEYS.map(dk => {
    const ds   = S.ds[dk];
    const dp   = ds.t > 0 ? Math.round((ds.c / ds.t) * 100) : 0;
    const dt   = perfTier(dp);
    const fill = dp >= PASS_PCT     ? 'var(--correct)'
               : dp >= ON_TARGET_PCT ? 'var(--accent)'
               :                       'var(--wrong)';
    return `<div class="dr-row">
      <div class="dr-dot dot-${dk}"></div>
      <div class="dr-info">
        <div class="dr-name">Domain ${dk.replace('d', '')}: ${DOMAINS[dk].name}</div>
        <div class="dr-meta">Weight: ${DOMAINS[dk].weight} &nbsp;|&nbsp; ${ds.c}/${ds.t} correct</div>
      </div>
      <div class="dr-bar-wrap">
        <div class="dr-bar-bg"><div class="dr-bar-fill" style="width:${dp}%;background:${fill}"></div></div>
        <div class="dr-pct">${dp}%</div>
      </div>
      <span class="dr-status st-${dt.cssKey}">${dt.label}</span>
    </div>`;
  }).join('');

  // ── Study recommendations ──────────────────────────────────────
  const weakDomains = DOMAIN_KEYS.filter(dk => {
    const ds = S.ds[dk];
    return ds.t === 0 || Math.round((ds.c / ds.t) * 100) < PASS_PCT;
  });

  const ul = $id('reco-list');
  if (weakDomains.length === 0) {
    ul.innerHTML = '<li><span>Outstanding performance across all domains! '
                 + 'Review any questions you found challenging and aim for consistent '
                 + 'Above Target results on future sessions.</span></li>';
  } else {
    ul.innerHTML = weakDomains
      .map(dk => `<li><span><strong>Domain ${dk.replace('d', '')} (${DOMAINS[dk].name}):</strong> ${RECOMMENDATIONS[dk]}</span></li>`)
      .join('');
  }
}

/* ─────────────────────────────────────────────────────────────
   § 13  RETAKE
   ───────────────────────────────────────────────────────────── */

/** Reset all screens and return to the start screen for a new exam. */
function retake() {
  stopTimer();
  $id('quiz-screen').classList.add('hidden');
  $id('results-screen').classList.add('hidden');
  $id('start-screen').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
