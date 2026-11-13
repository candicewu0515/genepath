# GenePath

**From one pharmacogenomic report to two real decisions:** is my current medication affected, and is there a recruiting clinical trial that fits me?

Built for DSH Hacks V2 (AI × Healthcare). Educational demo only — not medical advice.

**Live demo:** https://candicewu0515.github.io/genepath/

## What it does

1. **Medication gene card** — pick one of 16 medicines across 8 genes (blood thinners, statins, acid-reflux drugs, antidepressants, anti-inflammatory painkillers, chemotherapy, immune suppressants and a transplant drug) and the genotype from a gene report. The card explains what the result means in plain words, quotes the CPIC guideline verbatim, and shows how common the variant is across six genetic-ancestry groups.
2. **Clinical trial navigator** — pick one of 9 conditions plus age, sex and city. The page queries ClinicalTrials.gov live for recruiting studies, widens the search if nothing is nearby, sorts by distance, and explains the three key entry rules of each study in plain words.

## Run it

Open `index.html` in a browser. No build step, no server, no API key.

The live site is served by GitHub Pages from the `main` branch; every push updates it.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app (HTML, CSS, JavaScript) |
| `pgx-data.js` | Generated gene, guideline and frequency data (never edited by hand) |
| `snapshot.js` | Saved trial results, used by the "sample data" switch and as a fallback when offline |
| `data/trials-snapshot.json` | The same snapshot as plain JSON |
| `tools/build_pgx_data.py` | Rebuilds `pgx-data.js` from the CPIC and All of Us APIs |
| `tools/verify_frequencies.py` | Re-checks every frequency against All of Us |
| `tools/make_snapshot.py` | Regenerates the trial snapshot |
| `docs/pgx-frequency-data.md` | Source table for the allele frequencies hard-coded in the app |
| `docs/one-pager.pdf` | One-page project summary (source: `docs/one-pager.html`) |
| `docs/devpost-description.md` | Project story text for the Devpost page |
| `docs/demo-script.md` | Script for the demo video |

## Data sources

- **Allele frequencies:** All of Us Research Program public Data Browser (`public.api.researchallofus.org`), aggregate data from about 535,000 participants. No login is needed; only summary counts are used. Every number is re-checked by `tools/verify_frequencies.py`.
- **Prescribing guidance:** the CPIC API (`api.cpicpgx.org`). Genotype, phenotype and recommendation text are pulled verbatim, so no guideline wording is written by hand. Warfarin is the one exception: it is dosed by algorithm, so its card follows the CYP2C9 x VKORC1 table in the FDA warfarin label.
- **Trials:** ClinicalTrials.gov API v2, queried from the browser at search time.

## How AI was used

- The app was designed and built with AI coding assistants, including the data pipeline that pulls and cross-checks both APIs.
- Plain-language notes on trial entry rules come from a fixed glossary in `index.html`, and the clinical text is quoted from CPIC. The page makes **no AI calls at run time**, so nothing a user enters reaches a model and the output cannot hallucinate.

## Limits

- Frequencies are population-level allele frequencies, not the share of people affected and not a prediction for any individual.
- Guideline text is simplified. The clopidogrel guidance applies mainly to acute coronary syndrome and stent (PCI) patients; the warfarin card does not cover the extra CYP2C9 variants CPIC recommends testing in people of African ancestry.
- The trial list is a starting point. Only the study team can confirm eligibility.
- Nothing entered on the page is stored; the only network request is the public ClinicalTrials.gov search (condition and city, no personal identifiers).
