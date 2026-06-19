# Changelog

All notable changes to this project are documented here.

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
