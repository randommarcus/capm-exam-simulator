# Changelog

All notable changes to this project are documented here.

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
