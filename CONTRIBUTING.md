# Contributing

This started as a personal study tool, but issues and pull requests are welcome — especially if you spot a wrong answer, a confusing rationale, or a bug.

## Reporting a Bug or a Wrong Answer

Open an issue with:
- What you expected vs. what happened.
- For question/answer issues: the exact question text (or a screenshot), which domain it's tagged under, and why you think the marked answer or rationale is wrong.
- For UI bugs: a screenshot if possible, plus your browser/device.

## Adding or Editing Questions

All questions live inline in `index.html`, inside a JavaScript object called `QB`, split into four arrays: `QB.d1`, `QB.d2`, `QB.d3`, `QB.d4` (one per CAPM ECO domain). Each question follows this exact shape:

```js
{
  q: "The question text goes here?",
  opts: ["Option A text", "Option B text", "Option C text", "Option D text"],
  ans: 1,   // zero-indexed: 0=A, 1=B, 2=C, 3=D — this example marks B correct
  rat: "The rationale explaining why the correct answer is right and the others are wrong. Written as full sentences — the app automatically splits this into bullet points for display, so just write clear, separate sentences rather than trying to format it yourself."
}
```

A few things to keep in mind:

- **Domain weighting matters.** The four domains are drawn from in fixed proportions (36/17/20/27%) for every exam length, defined in the `EXAM_LENGTHS` config near the top of the `<script>` block. If you add a large batch of questions to one domain, the bank stays balanced as long as you don't drastically change the *relative* sizes between domains.
- **Rationale sentences should be genuinely separate sentences**, ending in `.`, `!`, or `?`, since the app's `splitRationale()` function uses sentence boundaries to build the bullet list. It already protects common abbreviations (`e.g.`, `i.e.`, `etc.`, `vs.`) and decimal numbers (`0.88`, `1.0`) from being mistaken for sentence endings, but unusual abbreviations not in that list could still get split incorrectly — keep an eye on how new rationales render.
- **No HTML in question/option/rationale text.** It's inserted as plain text (escaped where needed) — write it as plain prose.
- **Original content only.** Don't copy questions or explanations from PMI's official materials, prep courses, or other copyrighted sources — write original questions that test the same concept.

## Local Development

There's no build step. Edit `index.html` directly and open it in a browser to see changes immediately. If you're testing PWA-specific behavior (install prompt, offline mode), serve the folder locally instead of opening the file directly — see the README's "Running It Locally" section.

## Code Style

The existing code intentionally avoids frameworks and build tooling. Please keep additions in the same plain HTML/CSS/JS style, and keep the whole app working as a single `index.html` file (plus the small PWA asset files) rather than splitting it into a multi-file build.
