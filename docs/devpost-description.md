# Devpost project story (paste into the "About the project" field)

## Inspiration
Pharmacogenomic tests are cheap and increasingly common, but the report says things like "CYP2C19 *2/*2". Most people cannot tell whether that matters for a medicine they already take, or what to do next. These variants are also much more common in some ancestries than others: the VKORC1 variant that makes people sensitive to warfarin is carried on 87% of gene copies in East Asian participants of All of Us, and on 9% in African participants. A one-size-fits-all dose quietly fails specific populations.

## What it does
GenePath turns one gene report into two real decisions.

1. **Is my medication affected?** Pick clopidogrel, warfarin or simvastatin and your genotype. A card explains the result in plain words, summarises the CPIC guideline, shows how common the variant is across six ancestry groups, and gives you questions to take to your next appointment. You can print the card.
2. **Is there a clinical trial that fits me?** Pick a condition, age, sex and city. GenePath queries ClinicalTrials.gov live, keeps the recruiting studies open to you, sorts them by distance, and explains each study's three key entry rules in plain words, with the contact details.

## How we built it
- A single static web page (HTML, CSS, vanilla JavaScript) hosted on GitHub Pages. No server, no account, no stored data.
- Allele frequencies come from the All of Us Research Program public Data Browser (aggregate data from about 535,000 participants).
- Guideline summaries follow the CPIC guidelines for clopidogrel (2022), warfarin (2017) and statins (2022), and were checked against the published recommendation tables. Warfarin dose bands follow the genotype table in the FDA label.
- Trials come from the ClinicalTrials.gov API v2, called directly from the browser. A saved snapshot keeps the demo working offline.
- AI coding assistants were used to build the app, and AI drafted the plain-language summaries of the sample trials, which were then reviewed by hand. At run time the page makes no AI calls: entry-rule explanations come from a fixed medical glossary, so user input never reaches a model and the output cannot hallucinate.

## Challenges we ran into
- Saying something useful without giving medical advice. Every card reports what the guideline says and frames it for a conversation with a clinician; no doses are recommended.
- Allele frequency is easy to misread as "share of people". The chart labels it explicitly and adds a separate carrier estimate.
- Eligibility criteria are free text with no structure. We pick the first substantive inclusion rules and skip boilerplate such as consent statements.

## Accomplishments that we're proud of
- Everything on the page is real, public data, and every number has a visible source.
- It works fully offline with the saved sample, and prints to a one-page card a patient can hand to a doctor.

## What we learned
The population differences are larger than expected. CYP2C9*2 is at 12.9% in European participants and 0.1% in East Asian participants; a test panel designed around one population misses the variants that matter in another.

## What's next for GenePath
Upload of a real PGx report file, more gene–drug pairs from CPIC, trial matching that uses genotype as an entry criterion, and Spanish and Chinese versions.

## Built with
html, css, javascript, clinicaltrials.gov-api, all-of-us, cpic, github-pages

## Links
- Live demo: https://candicewu0515.github.io/genepath/
- Code: https://github.com/candicewu0515/genepath
