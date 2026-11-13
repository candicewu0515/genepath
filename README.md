# GenePath

**From one pharmacogenomic report to two real decisions:** is my current medication affected, and is there a recruiting clinical trial that fits me?

Built for DSH Hacks V2 (AI × Healthcare). Educational demo only — not medical advice.

## What it does

1. **Medication gene card** — pick clopidogrel, warfarin or simvastatin and the genotype from a gene report. The card explains what the result means in plain words, what the CPIC guideline says, and how common the variant is across six ancestry groups.
2. **Clinical trial navigator** — pick a condition, age, sex and city. The page queries ClinicalTrials.gov live for recruiting studies nearby, sorts them by distance, and explains the three key entry rules of each study in plain words.

## Run it

Open `index.html` in a browser. No build step, no server, no API key.

To publish, push this folder to GitHub and enable GitHub Pages on the main branch.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app (HTML, CSS, JavaScript) |
| `snapshot.js` | Saved trial results, used by the "sample data" switch and as a fallback when offline |
| `data/trials-snapshot.json` | The same snapshot as plain JSON |
| `tools/make_snapshot.py` | Regenerates the snapshot: `python3 tools/make_snapshot.py` |
| `pgx-frequency-data.md` | Source table for the allele frequencies hard-coded in the app |

## Data sources

- **Allele frequencies:** All of Us Research Program public Data Browser, aggregate data from about 535,000 participants, retrieved 2026-11-12.
- **Prescribing guidance:** CPIC guidelines for CYP2C19/clopidogrel (2022), warfarin (2017) and statins (2022). The warfarin dose-need bands follow the genotype table in the FDA warfarin label.
- **Trials:** ClinicalTrials.gov API v2, queried from the browser at search time.

## How AI was used

- The app was built with AI coding assistants.
- The one-sentence plain-language titles for the saved sample trials were drafted by AI in advance and reviewed by the author.
- Plain-language notes on entry rules for live results come from a fixed glossary of medical terms in `index.html`, so the page makes no AI calls at run time and sends no user data to any model.

## Limits

- Frequencies are population-level allele frequencies, not the share of people affected and not a prediction for any individual.
- Guideline text is simplified. The clopidogrel guidance applies mainly to acute coronary syndrome and stent (PCI) patients; the warfarin card does not cover the extra CYP2C9 variants CPIC recommends testing in people of African ancestry.
- The trial list is a starting point. Only the study team can confirm eligibility.
- Nothing entered on the page is stored; the only network request is the public ClinicalTrials.gov search (condition and city, no personal identifiers).
