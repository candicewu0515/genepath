# Devpost project story (paste into the "About the project" field)

## Inspiration
Pharmacogenomic tests are cheap and increasingly common, but the report says things like "CYP2C19 *2/*2". Most people cannot tell whether that matters for a medicine they already take, or what to do next. These variants are also much more common in some ancestries than others: the VKORC1 variant that makes people sensitive to warfarin sits on 87% of gene copies in East Asian participants of All of Us and 9% in African participants. A one-size-fits-all dose quietly fails specific populations.

## What it does
GenePath turns one gene report into two real decisions.

1. **Is my medication affected?** Pick one of 16 medicines across 8 genes — blood thinners, statins, acid-reflux drugs, antidepressants, anti-inflammatory painkillers, chemotherapy, immune suppressants and a transplant drug — and the genotype from your report. A card explains the result in plain words, quotes the CPIC guideline verbatim, charts how common the variant is across six genetic-ancestry groups, and gives you questions to take to your next appointment. You can print it.
2. **Is there a clinical trial that fits me?** Pick one of 9 conditions plus age, sex and city. GenePath queries ClinicalTrials.gov live, widens the search if nothing is recruiting nearby, keeps the studies open to you, sorts them by distance, and explains each study's three key entry rules in plain words, with contact details.

## How we built it
A single static web page (HTML, CSS, vanilla JavaScript) on GitHub Pages. No server, no account, no stored data.

The clinical content is not hand-written. A build script pulls it from two public APIs and fails if anything cannot be confirmed:

- **CPIC API** (api.cpicpgx.org) gives the diplotype to phenotype mapping and the recommendation text for every gene-drug pair, quoted verbatim.
- **All of Us public Data Browser API** gives aggregate allele frequencies for 11 variants from about 535,000 participants. No login is needed, and only summary counts are used. A second script re-checks every number against the API.
- **ClinicalTrials.gov API v2** is called live from the browser, with a saved 9-condition snapshot as an offline fallback.

Warfarin is the one exception: it is dosed by algorithm rather than a phenotype table, so its card follows the CYP2C9 x VKORC1 table in the FDA label.

AI coding assistants were used to design and build the app and the data pipeline. At run time the page makes **no AI calls**: trial entry rules are explained from a fixed medical glossary, so nothing a user enters reaches a model and the output cannot hallucinate.

## Challenges we ran into
- Saying something useful without giving medical advice. Every card reports what the guideline says and frames it for a conversation with a clinician; no doses are recommended.
- Trusting our own text. Rather than paraphrase guidelines, we made the build pull them from the CPIC API and fail loudly when a configured genotype or drug is missing upstream. That caught several wrong variant coordinates during development.
- Allele frequency is easy to misread as "share of people". The chart labels it explicitly and adds the observed carrier rate beside it.
- Eligibility criteria are free text with no structure. We pick the first substantive inclusion rules and skip boilerplate such as consent statements.

## Accomplishments that we're proud of
- Every clinical sentence on the page can be traced to a public API, and a script re-verifies the numbers on demand.
- The coverage is wide enough to matter: the medicines included are among the most prescribed in the world, plus two where the wrong dose can be fatal.
- It works fully offline from the saved sample, and prints to a one-page card a patient can hand to a doctor.

## What we learned
The population differences are larger than expected. CYP2C9*2 sits on 12.9% of gene copies in European participants and 0.1% in East Asian participants, while NUDT15*3 — which can make a standard azathioprine dose dangerous — is at 9.6% in East Asian and 0.3% in European participants. A test panel designed around one population misses the variants that matter in another.

## What's next for GenePath
Upload of a real PGx report file, CYP2D6 support (codeine, tramadol and many antidepressants, which needs copy-number calling), trial matching that uses genotype as an entry criterion, and Spanish and Chinese versions.

## Built with
html, css, javascript, cpic-api, all-of-us, clinicaltrials.gov-api, python, github-pages

## Links
- Live demo: https://candicewu0515.github.io/genepath/
- Code: https://github.com/candicewu0515/genepath
