# GenePath | PGx guideline review

GenePath retrieves an adult CPIC guideline row for a pharmacist reviewing a clopidogrel or rosuvastatin report. Enter the reported diplotype and indication or companion-gene phenotype. The result shows the source table, action category, and recommendation strength. Missing inputs prompt review.

[73-second captioned demo](docs/ai-for-medicine/genepath-demo.mp4) · [Competition write-up](docs/ai-for-medicine/submission.md) · [Per-case predictions](review/evaluation/predictions.json)

## Run the project

Open `index.html` in a modern browser. The review runs offline using the included files. No API key, installation, telemetry, storage, or inference service is required. Source links open the published guidelines online.

With Node.js 18 or later, the same lookup is available from the command line. Run these commands from the repository root.

```sh
node review/case.cjs clopidogrel adult '*1/*2' acs
node review/case.cjs clopidogrel adult '*1/*2' neuro
node review/case.cjs rosuvastatin adult '*1/*5' unknown
node review/evaluation/run.cjs
node review/evaluation/run.cjs --json
```

The last command includes predictions for every example and a SHA-256 digest of the frozen reference file. To regenerate the browser score table after changing the evaluation, run `node review/evaluation/summary.cjs`. The benchmark is deterministic and has no trained parameters or random seeds.

## Evaluation

Six development examples and 26 test examples are listed in [cases.tsv](review/evaluation/cases.tsv). The reference labels were transcribed from published CPIC tables before implementing this edition. All 32 input tuples are distinct, including after canonicalizing allele order. Synthetic cases deliberately sample boundary conditions. Guideline rules informed both the implementation and the reference. The cases were visible to the author, so this is a frozen conformance suite with a separate test partition. Independent and blinded clinical validation remains pending.

| Method on 26 test cases | Exact row or appropriate review | Action category and strength or appropriate review | Row emitted on six cases requiring review |
|---|---:|---:|---:|
| Context-aware GenePath | 26/26 | 26/26 | 0/6 |
| Fixed-context lookup | 6/26 | 8/26 | 4/6 |
| Medication-only default | 0/26 | 3/26 | 6/6 |

An exact row requires the expected primary phenotype (and companion phenotype for rosuvastatin), source and indication column, category, and strength. In six incomplete or out-of-scope reports the expected output was referral with no row. A matched row explicitly stating that CPIC gives no recommendation is scored separately from a referral. The latter reflects missing inputs or a project scope limit.

The fixed-context comparator reconstructs the two original cards using the committed genotype data, with ACS/PCI or normal ABCG2 as the default. An unavailable diplotype is counted as review, and reverse allele order is accepted. The medication-only comparator also assumes the reference diplotype. The comparators model structured lookup, without a pharmacist reading the full guideline or the caveats on the historical site. These figures therefore describe the benchmark and its assumptions. They do not estimate a clinician's accuracy, time saved, or patient outcomes.

## Scope and provenance

The clopidogrel module covers adult reports with pairs from CYP2C19 *1, *2, *3, *9 and *17 and three indication groups. The rosuvastatin module covers SLCO1B1 *1/*1, *1/*5 and *5/*5 with reported ABCG2 function. It uses the adult combined table only. CPIC also provides single-gene guidance. An absent ABCG2 result prompts review under this edition's scope. The interface accepts a typed star-allele pair and never infers alleles from raw sequence. Entries are educational references for review. A row can still require assessment of contraindications, other medications, organ function, and population-specific labeling.

- Lee et al. CPIC CYP2C19 and clopidogrel therapy, 2022 update. Tables 1–3. DOI [10.1002/cpt.2526](https://doi.org/10.1002/cpt.2526).
- Cooper-DeHoff et al. CPIC SLCO1B1, ABCG2, CYP2C9 and statin-associated musculoskeletal symptoms. Table 5. DOI [10.1002/cpt.2557](https://doi.org/10.1002/cpt.2557).
- Original GenePath by Xia Wu, first submitted to DSH Hacks V2. The original two-module interface is available in [explorer.html](explorer.html). Its data pipeline and attribution are documented in [the original README](docs/original-readme.md). The older 16-drug explorer and clinical trial search are outside this evaluation.
- OpenAI Codex assisted with implementing lookup rules, transcribing synthetic cases, testing, and preparing the written and video demo. There are no run-time AI calls in the review.
