# Contributing

This started as a personal study tool, but issues and pull requests are welcome — especially if you spot a wrong answer, a confusing rationale, or a bug.

## Reporting a Bug or a Wrong Answer

Open an issue with:
- What you expected vs. what happened.
- For question/answer issues: the exact question text (or a screenshot), which domain it's tagged under, and why you think the marked answer or rationale is wrong.
- For UI bugs: a screenshot if possible, plus your browser/device.

## Adding or Editing Questions

All questions live in `js/questions.js`, inside a JavaScript constant called `QB`, split into four arrays: `QB.d1`, `QB.d2`, `QB.d3`, `QB.d4` (one per CAPM ECO domain). Each question follows this exact shape:

```js
{
  q: "The question text goes here?",
  opts: ["Option A text", "Option B text", "Option C text", "Option D text"],
  ans: 1,   // zero-indexed: 0=A, 1=B, 2=C, 3=D — this example marks B correct
  rat: "The rationale explaining why the correct answer is right and the others are wrong. Written as full sentences — the app automatically splits this into bullet points for display, so just write clear, separate sentences rather than trying to format it yourself."
}
```

A few things to keep in mind:

- **Domain weighting in Exam Mode.** The four domains are drawn from in fixed proportions (36/17/20/27%) for every exam length, defined in the `EXAM_LENGTHS` config in `js/app.js`. If you add a large batch of questions to one domain, the bank stays balanced as long as you don't drastically change the *relative* sizes between domains. Study Mode draws *all* questions from the selected domain, so additions there are reflected immediately.
- **Update `STUDY_COUNTS` if you add questions.** The `STUDY_COUNTS` constant in `js/app.js` holds the hardcoded per-domain question counts shown on the start screen (e.g. `{ all: 524, d1: 184, … }`). If you add or remove questions, update this constant to match — otherwise the stat shown on the start screen will be wrong. The actual session will always be correct (it draws from `QB` directly), only the display stat is affected.
- **Rationale sentences should be genuinely separate sentences**, ending in `.`, `!`, or `?`, since the app's `splitRationale()` function uses sentence boundaries to build the bullet list. It already protects common abbreviations (`e.g.`, `i.e.`, `etc.`, `vs.`) and decimal numbers (`0.88`, `1.0`) from being mistaken for sentence endings, but unusual abbreviations not in that list could still get split incorrectly — keep an eye on how new rationales render.
- **No HTML in question/option/rationale text.** It's inserted as plain text (escaped where needed) — write it as plain prose.
- **Original content only.** Don't copy questions or explanations from PMI's official materials, prep courses, or other copyrighted sources — write original questions that test the same concept.

## Local Development

There's no build step. The codebase is split into three purposeful files — edit whichever one you need and refresh the browser:

- **Adding or editing questions** → edit `js/questions.js` (and update `STUDY_COUNTS` in `js/app.js` if the totals change)
- **Changing exam or study mode behaviour** → edit `js/app.js`
- **Changing styles** → edit `css/style.css`
- **Changing HTML structure** → edit `index.html`

Open `index.html` directly in a browser to see changes immediately. If you're testing PWA-specific behaviour (install prompt, offline mode), serve the folder locally instead of opening the file directly — see the README's "Running It Locally" section.

## Code Style

The existing code intentionally avoids frameworks and build tooling. Please keep additions in the same plain HTML/CSS/JS style, following the existing file structure: questions in `js/questions.js`, logic in `js/app.js`, styles in `css/style.css`. Don't introduce a bundler, module system, or framework — the goal is that any file can be opened and understood without any tooling.
