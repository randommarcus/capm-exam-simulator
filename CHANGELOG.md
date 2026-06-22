# Changelog

All notable changes to this project are documented here.

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
