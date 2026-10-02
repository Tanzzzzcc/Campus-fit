# CampusFit

CampusFit is a small placement-prep web app. Paste a resume and a role description to get an explainable skill coverage score, overlap and gap lists, and a short practice plan for the missing skills.

## Run it

Requires Node.js 18 or newer. There are no packages to install and no API keys.

```sh
npm start
```

Open http://localhost:3000. Select **Load an example** to see a complete sample.

## How it works

1. The browser sends the two text fields to `POST /api/analyze` on the local Node server.
2. `extractSkills` normalizes text and matches a small explicit skill-and-alias dictionary.
3. `analyze` compares recognized job skills with recognized resume skills. Coverage is `matched / job skills × 100`, with equal weight per skill.
4. The response includes matched skills, gaps, the formula, and two practice prompts for up to four gaps.
5. The browser renders the response. User text is not stored; the server does not call an external service.

## Study the code in this order

1. `public/index.html` — page structure and accessible form labels.
2. `public/app.js` — form submit, HTTP request, loading/error state, and rendering.
3. `server.js` — Node HTTP server, static file serving, input validation, skill matching, JSON response.
4. `public/styles.css` — visual system and mobile layout.

Try these learning exercises:

- Add a skill alias and check how `extractSkills` behaves with uppercase and punctuation.
- Add a test case by calling `analyze({ resume, job })` from a Node REPL.
- Make a skill more important using weighted coverage, then explain the new formula in the UI.
- Add an export button that saves the study plan as a plain text file.
- Replace keyword matching with embeddings only after you can explain the current baseline and how you would evaluate false matches.

## Honest limitations

This is explainable keyword matching, **not a trained AI model** and not a hiring predictor. Skills have equal weight, and the vocabulary is deliberately small. A skill can be missed if phrased in an unrecognized way, and seeing a keyword does not prove proficiency. The project is designed as a baseline you can understand and improve, rather than an AI label pasted onto a simple app.

## Interview walkthrough

“I built a local-first placement prep tool. It extracts skills using a transparent alias map, compares coverage against a job description, and turns gaps into a practice plan. I chose a deterministic baseline so I could explain the score and inspect errors. The current limitation is vocabulary coverage and equal weighting; my next step would be measuring precision and recall on labeled examples before evaluating a semantic retrieval model.”
