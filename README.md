# CAPM® Practice Exam Simulator

A free, offline-capable, installable practice exam simulator for the PMI **Certified Associate in Project Management (CAPM)®** certification. PocketPrep-style interface, 524 original practice questions weighted to the official Exam Content Outline (ECO), instant feedback with bulleted rationales, domain-level performance breakdowns, and a configurable timed exam mode.

No build step, no backend, no external dependencies. Open `index.html` in a browser and it works — or host the folder anywhere with HTTPS to get the installable PWA experience.

---

## Features

- **524-question bank** split across all four CAPM ECO domains, weighted to match PMI's official percentages (Domain 1: 36%, Domain 2: 17%, Domain 3: 20%, Domain 4: 27%).
- **Five exam lengths** — 30, 60, 90, or 120 questions, or the full 150-question exam — each drawing from the bank in the correct domain proportions.
- **Adaptive countdown timer**, scaled off PMI's real 3-hour allowance for the 150-question exam (1.2 minutes/question), so a 30-question exam gets 36 minutes, a 90-question exam gets 1h 48m, and so on. Turns red and pulses in the final 5 minutes; auto-submits for scoring if time runs out.
- **Timer pauses on answer** — the countdown freezes the moment you select an option so you can read the rationale at leisure; it resumes automatically when you click Next Question.
- **Shuffled answer options** — the A/B/C/D order of every question's options is randomised each session, preventing the "longest option is usually correct" pattern-recognition shortcut.
- **Domain label toggle** — a toggle in the quiz header lets you show or hide the domain badge above each question, so you can choose how closely to simulate the real exam environment.
- **Quit anytime** — end a session early and still get a fully scored results screen based on whatever you've answered so far.
- **Instant per-question feedback** with an expert rationale broken into readable bullet points (not a wall of text).
- **Domain-level results breakdown** with performance status (Above/On/Below Target) and targeted study recommendations for weak areas.
- **Installable as a real app** on Android, iOS, Windows, macOS, and Linux via the Web App Manifest + Service Worker (see below).
- **Works fully offline** once loaded — the service worker caches the entire app, including all 524 questions, so no internet connection is needed after the first visit.

## Install as an App

This is a Progressive Web App (PWA). Once it's hosted somewhere with HTTPS (see [Hosting on GitHub Pages](#hosting-on-github-pages) below), you can install it like a native app:

| Platform | Steps |
|---|---|
| **Android** (Chrome) | Open the site → tap the **⋮** menu → **Install app** |
| **iOS** (Safari) | Open the site → tap the **Share** icon → **Add to Home Screen** |
| **Windows** (Edge/Chrome) | Open the site → click the **install icon (⊕)** in the address bar, or menu → **Apps** → **Install this site as an app** |
| **macOS** (Safari 17+, macOS Sonoma or later) | Open the site → **File** menu → **Add to Dock…** |
| **macOS** (Chrome/Edge) | Open the site → click the **install icon (⊕)** in the address bar, or menu → **Install [App Name]…** |
| **Linux** (Chrome/Edge/Brave/Chromium) | Open the site → click the **install icon (⊕)** in the address bar, or menu → **Install [App Name]…** |

Once installed, it opens in its own window with no browser chrome, shows up in your app list/home screen/Dock with its own icon, and works offline.

> **Firefox users:** desktop Firefox doesn't natively support installing web apps (Windows, macOS, or Linux). If you're on Firefox, either switch to a Chromium-based browser to install it, or use Firefox's third-party [PWAsForFirefox](https://pwasforfirefox.filips.si/) extension. You can still use the app normally in Firefox as a regular webpage either way — it just won't install as a standalone app window.

> Note: installability and offline support require HTTPS. Opening `index.html` directly from a downloaded folder (`file://`) still works as a normal webpage, but browsers block service worker registration and install prompts on that protocol for security reasons.

## Hosting on GitHub Pages

The simplest free way to get an HTTPS URL for this app:

1. Create a new GitHub repository and push these files to it (see [Pushing This Repo](#pushing-this-repo) below if you haven't done this before).
2. In the repo, go to **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**, pick the `main` branch and the `/ (root)` folder, then **Save**.
4. GitHub will give you a live URL, typically `https://<your-username>.github.io/<repo-name>/`, within a minute or two.
5. Visit that URL on your phone or PC and install it using the steps above.

## Pushing This Repo

If you're starting from this folder on your computer and haven't pushed it to GitHub yet:

```bash
git init
git add .
git commit -m "Initial commit: CAPM Practice Exam Simulator"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

No git experience needed: you can also just create a new repository on github.com, click **Add file → Upload files**, and drag this entire folder (including the `icons/` subfolder) into the browser window.

## Running It Locally (Without Hosting)

Double-click `index.html` to open it directly in any browser — the quiz, timer, scoring, and everything else works fine this way. You just won't get install prompts or offline caching (those need HTTPS). If you want to test the full PWA behavior locally, serve the folder instead of opening the file directly, for example:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000 — localhost is treated as a secure context, so PWA features work
```

## Project Structure

```
.
├── index.html              # HTML structure only (~160 lines) — no inline CSS or JS
├── css/
│   └── style.css           # All styles
├── js/
│   ├── questions.js        # Question bank — QB constant with all 524 questions
│   └── app.js              # All application logic (config, timer, quiz, results)
├── manifest.json           # Web App Manifest (name, icons, display mode)
├── service-worker.js       # Caches the app shell for offline use
├── favicon.ico             # Multi-resolution favicon (16/32/48px)
├── icons/
│   ├── icon-192.png        # Standard app icon
│   ├── icon-512.png        # Standard app icon (large)
│   ├── icon-maskable-512.png # Android adaptive icon (safe-zone padded)
│   ├── apple-touch-icon.png  # iOS home screen icon (180×180)
│   ├── favicon-32.png
│   └── favicon-16.png
├── README.md
├── LICENSE
├── CHANGELOG.md
└── CONTRIBUTING.md
```

## Domain Weighting (CAPM Exam Content Outline)

Every exam length pulls questions in the same proportions PMI uses for the real exam:

| Domain | Weight | 30Q | 60Q | 90Q | 120Q | 150Q |
|---|---|---|---|---|---|---|
| 1 — PM Fundamentals & Core Concepts | 36% | 11 | 22 | 33 | 43 | 54 |
| 2 — Predictive, Plan-Based Methodologies | 17% | 5 | 10 | 15 | 20 | 26 |
| 3 — Agile Frameworks/Methodologies | 20% | 6 | 12 | 18 | 24 | 30 |
| 4 — Business Analysis Frameworks | 27% | 8 | 16 | 24 | 33 | 40 |

## Tech Stack

Plain HTML, CSS, and vanilla JavaScript — no frameworks, no bundler, no `npm install`. The codebase is split across three purpose-specific files (`css/style.css`, `js/questions.js`, `js/app.js`) loaded by a thin `index.html` shell. The only "build step" that ever touched this project was generating the PWA icon set. This is intentional: anyone should be able to open any file and understand it top to bottom.

## How This Project Was Built

In the interest of being upfront about it: this app was built almost entirely by **Claude** (Anthropic's AI assistant), working interactively with the repo owner over a series of conversations.

Claude wrote all of the HTML/CSS/JavaScript, authored the full 524-question bank with explanations (rationales) for each answer, designed and generated the app icon set, and implemented every feature in this README — the exam-length/timer system, timer-pause-on-answer, answer-option shuffling, domain label toggle, quit-and-partial-scoring logic, the bulleted rationale formatting, the PWA conversion (manifest, service worker, icons), and the codebase refactor that split the monolithic `index.html` into separate `css/`, `js/`, and `index.html` files. Topic-coverage audits and duplicate-detection passes across the full question bank were also Claude's work.

The repo owner directed the entire process: defining what the app should do, specifying the exam logic (domain weighting, timer duration based on the real PMI exam allowance), testing the live app, and catching real UI bugs along the way — including screenshots of a misaligned answer-feedback panel and a study-recommendations section where the layout broke, both of which led directly to the CSS fixes now in this codebase. The decision to build this at all, and every product decision in it, came from the repo owner; Claude was the one typing the code.

If you're studying for CAPM yourself and find a bug or a wrong answer in the question bank, please open an issue — see [CONTRIBUTING.md](CONTRIBUTING.md).

## Disclaimer

This is an independent, unofficial study tool and is **not affiliated with, endorsed by, or sponsored by the Project Management Institute (PMI)**. CAPM®, PMBOK®, and PMI® are registered marks of the Project Management Institute, Inc. All questions and explanations in this app are original content written for educational practice purposes — none are taken from PMI's official, confidential exam material.

This tool is meant to supplement, not replace, official PMI study materials and the PMI Authorized Training Partner curriculum.

## License

Code is licensed under the [MIT License](LICENSE). See [CHANGELOG.md](CHANGELOG.md) for version history.

## Acknowledgments

- PMI's published CAPM Exam Content Outline (ECO), used as the structural reference for domain weighting.
- [Anthropic Claude](https://www.anthropic.com), which wrote the code and content for this project under the repo owner's direction.
