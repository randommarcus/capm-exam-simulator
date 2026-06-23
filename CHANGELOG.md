# Changelog

All notable changes to this project are documented here.

## [2.2.0] — 2026-06-23

### Added — Question Navigator and Persistent Navigation (Study Mode)

**Permanent Previous / Next buttons**
The `quiz-nav` div was moved out of `feedback-wrap` (which was hidden until answering) and is now always visible in Study Mode from the very first question. In Exam Mode the buttons still only appear after answering, preserving the existing enforced-answer flow.

**Free forward navigation**
Clicking Next in Study Mode no longer requires the current question to be answered first. Skipped questions remain `null` in `qResults` and are not counted in the score. They can be answered later by navigating back via Previous or the new question navigator.

**Question navigator panel**
A `☰ N/Total` toggle button in the quiz header (Study Mode only) opens a scrollable grid of every question in the session. Each pill shows a status indicator and its number:
- Plain number — not yet answered
- **✓** + number — answered correctly (green character + green-tinted background + green border)
- **✗** + number — answered wrongly (red character + red-tinted background + red border)
- Current question pill is filled (primary purple, or green/red if also answered; indicator turns white)

The ✓ and ✗ are standard unicode text characters (U+2713 CHECK MARK and U+2717 BALLOT X) styled via CSS — not emoji. This ensures consistent rendering across all platforms and operating systems at small pill sizes, avoiding the font-lookup and scaling issues that emoji cause in compact UI elements.

Clicking any pill jumps directly to that question and closes the panel. The panel refreshes in real time when an answer is submitted while it is open, so answer marks appear immediately. The quiz header is sticky, so the navigator toggle is always reachable regardless of scroll position.

**New functions added to `js/app.js`**
- `toggleQNav()` — opens or closes the navigator panel; rebuilds the grid on every open
- `updateQNavGrid()` — rebuilds all question pills from the current `S.qResults` state
- `jumpTo(idx)` — navigates to a specific question index and closes the navigator

**Files changed**
- `index.html` — `qnav-toggle` button and `qnav-panel` grid added to header; `quiz-nav` moved outside `feedback-wrap` (now a sibling, not a child)
- `js/app.js` — three new navigator functions; `startExam()` and `startStudy()` manage quiz-nav visibility; `render()` updates the navigator label and closes the panel on navigation; `pick_ans()` refreshes the grid if the panel is open; `retake()` cleans up navigator state
- `css/style.css` — `.qnav-toggle`, `.qnav-panel`, `.qnav-grid`, `.qnav-pill`, `.qp-correct`, `.qp-wrong`, `.qp-current`, `.qp-icon` (with per-state colour rules), `.qnav-leg-correct`, `.qnav-leg-wrong` styles; `.qnav-toggle` added to mobile responsive rules

## [2.1.0] — 2026-06-23

### Added — Study Mode

A second, fully independent learning mode alongside the existing Practice Exam, accessible via a tab switcher on the start screen.

**Domain selector**
Choose to study All Domains (524 questions) or focus on a single one: Domain 1 PM Fundamentals (184Q), Domain 2 Predictive Methodologies (93Q), Domain 3 Agile Frameworks (106Q), or Domain 4 Business Analysis (141Q). Every question in the chosen scope is included — not a random sample.

**No timer**
The countdown is hidden entirely in Study Mode. The quiz screen gains an `.is-study` CSS class that suppresses the timer pill, and the timer functions are never started or called.

**Free backward navigation**
A ← Previous button appears in the feedback area after the first question is answered, allowing navigation back to any already-answered question. Navigating back restores the full answered state — option highlighting, feedback banner, and rationale bullets — exactly as they appeared when the question was first answered. Options remain locked on revisited questions; the score is always based on the first attempt only.

**Per-question result tracking**
Study sessions extend the session state object with a `qResults` array (one entry per question, initially `null`, set to `{sel, correct}` on first answer). This is what powers the backward-navigation restore without re-scoring.

**Results screen**
The existing results screen is reused with Study Mode-specific titles ("Study Session Complete 🎓" / "Study Session Ended 📖") and the same domain breakdown and study recommendations as Exam Mode.

**New functions added to `js/app.js`**
- `switchMode(mode)` — toggles between 'exam' and 'study' on the start screen
- `selectStudyDomain(domain)` — updates the domain pill selection and question-count stat
- `genStudySession(domain)` — builds the full question list for the chosen domain scope
- `createStudySession(questions)` — factory extending `createSession` with `isStudy` flag and `qResults` array
- `startStudy()` — initialises a study session and enters the quiz screen
- `prev()` — navigates backward (no-op in Exam Mode)
- `_enterQuiz()` — shared setup extracted from `startExam` and reused by `startStudy`

**New constant**
- `STUDY_COUNTS` — maps each domain key to its question count, used to update the start screen stat on domain selection

**Files changed**
- `index.html` — mode-tab switcher, study domain selector, `← Previous` button in feedback area, updated quit modal text (adapts to "Quit this exam?" vs "End this study session?")
- `js/app.js` — all new Study Mode functions, updated `render()`, `pick_ans()`, `next()`, `showResults()`, `retake()`
- `css/style.css` — mode tabs, study domain selector pills, `.prev-btn`, `.quiz-nav` flex layout, `.is-study #timer-disp` rule that hides the timer

## [2.0.0] — 2026-06-22

### Changed — Codebase Refactor
The monolithic `index.html` (was ~730 KB, 1300+ lines) has been broken into separate, single-responsibility files:

| Before | After | Purpose |
|---|---|---|
| `index.html` (all-in-one) | `index.html` | HTML structure only (~160 lines) |
| *(inline `<style>`)* | `css/style.css` | All styles |
| *(inline `<script>`)* | `js/questions.js` | Question bank constant (`QB`) with 524 questions |
| *(inline `<script>`)* | `js/app.js` | All application logic |

**`js/app.js` improvements:**
- `'use strict'` throughout
- Organized into 13 numbered sections with clear headers (Configuration, State, Timer, Utilities, Start Screen, Session Generation, Exam Lifecycle, Question Renderer, Answer Selection, Quit Flow, Navigation, Results, Retake)
- Named constants replace magic numbers: `WARN_SECONDS`, `PASS_PCT`, `ON_TARGET_PCT`, `LETTERS`, `DOMAIN_KEYS`, `DOMAIN_COLORS`
- `RECOMMENDATIONS` object extracted from `showResults()` into a top-level constant
- `createSession()` factory function replaces inline object literal in `startExam()`
- `perfTier()` helper extracted from `showResults()` (used in both the ring and the domain breakdown rows)
- JSDoc comments on all public-facing and non-trivial functions
- Consistent 2-space indentation and spacing throughout

**`service-worker.js` improvements:**
- `CACHE_VERSION` constant makes version bumps a one-line change
- `CACHE_NAME` now incorporates the version: `capm-sim-v2`
- Updated `APP_SHELL` array includes `css/style.css`, `js/questions.js`, `js/app.js`
- Cleaner comments

No behavior changes — all features, logic, and question content are identical.

## [1.2.0] — 2026-06-22

### Added
- **Topic gap analysis and fill** — ran a comprehensive topic-coverage audit across all four ECO domains, mapping every existing question against a ~200-topic CAPM checklist. D1 was fully covered (0 gaps). 14 new questions were written for the 14 uncovered topics found across D2, D3, and D4, bringing the bank from 510 to **524 questions**.

  **Domain 2 — 6 new questions:**
  - Pareto chart (80/20 rule, vital few defect categories)
  - Cause-and-Effect / Ishikawa / Fishbone diagram
  - Configuration Management System (version control of project documents)
  - Risk Breakdown Structure (RBS)
  - Stakeholder Engagement Plan
  - Issue Log in execution (issue vs. risk distinction)

  **Domain 3 — 4 new questions:**
  - Story Mapping (Jeff Patton's two-dimensional user journey technique)
  - Acceptance Test-Driven Development (ATDD)
  - Behavior-Driven Development (BDD) and Given/When/Then syntax
  - Mob Programming (whole-team ensemble coding)

  **Domain 4 — 4 new questions:**
  - Impact Mapping (WHY/WHO/HOW/WHAT causal chain)
  - Product Roadmap (strategic high-level product direction artifact)
  - Voice of the Customer (VoC) research process
  - Data Dictionary (formal data element definitions)

## [1.1.3] — 2026-06-22

### Fixed
- **Duplicate question audit** — full keyword-overlap scan of all 510 questions identified three genuine duplicates (two near-identical pairs were reviewed and retained as they test distinct skills):

  | Removed | Replaced with |
  |---|---|
  | D4: "A BA distinguishes a requirement from a design. Which statement best captures the difference?" (near-identical to an existing question) | **Elicitation vs Analysis** — a scenario question distinguishing the activity of drawing out information from stakeholders (elicitation) from the activity of interpreting and synthesizing it (analysis) |
  | D4: Functional requirement categorisation scenario using an auto-email report (near-identical wording to an existing question) | **Transition requirements** — a CRM migration scenario identifying the type of requirements that apply only during changeover (data migration, parallel operation, staff retraining) |
  | D1: "A project manager is comparing a Cost-Reimbursable contract to a Time and Materials contract. Which statement correctly distinguishes these two contract types?" (duplicate of an existing CR vs T&M question) | **Source Selection Criteria** — a procurement scenario on the document that defines evaluation factors and weightings before vendor proposals are received |

  Total question count remains 510.

## [1.1.2] — 2026-06-22

### Fixed
- **Duplicate question removed** — two near-identical questions both asked which Kanban metric measures the duration from when a team starts working on an item until completion (cycle time). The duplicate was replaced with a new question on **Kanban's Make Policies Explicit** practice — one of the six core Kanban practices and a gap in the previous bank coverage. The total question count remains 510.

## [1.1.1] — 2026-06-22

### Fixed
- **Quit-on-first-question layout bug** — quitting the exam before answering any question returned to the start screen but left the quiz screen visible underneath it, causing both screens to stack. `retake()` now explicitly hides the quiz screen before showing the start screen.

## [1.1.0] — 2026-06-22

Community-driven improvements based on feedback from r/capm.

### Added
- **Timer pauses on answer** — the countdown freezes the moment you select an answer (timer display shows ⏸ and greys out), giving you unrushed time to read the rationale. The clock resumes automatically when you click Next Question.
- **Answer option shuffling** — the A/B/C/D order of every question's options is randomised on each session draw. Prevents the "longest option is usually correct" pattern-recognition shortcut that made the bank easier than it should be.
- **Domain label toggle** — a 🏷 Domain button in the quiz header lets you show or hide the domain badge above each question. Default is on; turn it off to simulate a closer-to-real exam environment where the domain context isn't surfaced. Your preference persists for the whole session.

## [1.0.1] — 2026-06-19

### Documentation
- Confirmed and documented PWA installability on **macOS** (Safari 17+/Sonoma or later, and Chrome/Edge) and **Linux** (any Chromium-based browser), in addition to the previously documented Android, iOS, and Windows support.
- Added a note on Firefox's lack of native desktop install support and a pointer to the third-party PWAsForFirefox extension as a workaround.

## [1.0.0] — 2026-06-19

Initial public release. Summary of everything built in this app's development:

### Added
- Core quiz engine: one-question-at-a-time flow with instant feedback and rationale, built on an 80-question starter bank.
- Expanded question bank to 150 questions, then to **510 questions**, maintaining the official PMI CAPM ECO domain weighting (36/17/20/27%) throughout.
- **Quit mid-exam** option with confirmation modal; results are scored based only on questions actually answered.
- **Selectable exam length** — 30, 60, 90, 120, or 150 questions — with per-domain question counts auto-scaled to preserve ECO weighting at every length.
- **Countdown timer**, scaled linearly off PMI's real 3-hour/150-question allowance (1.2 min/question), with a visual warning state in the final 5 minutes and auto-submit on expiry.
- Domain-level results breakdown with performance status and targeted study recommendations.
- **Bulleted rationale formatting** — answer explanations are split into individual bullet points instead of a single dense paragraph, with abbreviation- and decimal-aware sentence splitting so things like "e.g.," "vs.," and "0.88" don't get mis-split.
- Converted to an installable **Progressive Web App**: web app manifest, service worker (full offline caching of the app shell), and a generated icon set (192/512/maskable/apple-touch/favicon) matching the app's existing brand mark.

### Fixed
- Safari rendering bug where disabled answer buttons appeared visually dimmed/unreadable after selection.
- Answer-option icon/letter alignment in the feedback view.
- Flexbox layout bug in the Study Recommendations list where the domain label and description text were rendering as separate misaligned columns instead of one flowing paragraph (caused by anonymous flex items forming around loose inline text inside a flex container).
