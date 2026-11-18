# GenePath | Context-aware pharmacogenomic guideline review

## Problem and users

A pharmacist receives an adult pharmacogenomic report. The report lists a diplotype, but selecting the right guideline row can also require a medication indication or the result of a second gene. The first GenePath release showed a single indication for clopidogrel and assumed normal ABCG2 function for rosuvastatin. This edition makes those inputs explicit.

## Method

GenePath normalizes the reported allele pair, translates it to a supported phenotype, and selects a row from the published 2022 CPIC tables. For clopidogrel it distinguishes coronary ACS/PCI, other cardiovascular, and neurovascular indications. For rosuvastatin it uses a reported ABCG2 phenotype alongside SLCO1B1. It displays the source row and recommendation strength, including explicit no-recommendation entries. Missing or out-of-scope inputs prompt pharmacist review. All processing runs on the user's device.

## Evaluation

We compared the lookup with two defaults on 26 prespecified synthetic test cases, separate from six development examples. Twenty cases had an applicable row and six required review. We scored the phenotype, source and indication column, recommendation category, and strength together. GenePath matched 20 of 20 rows and referred all six boundary cases. The fixed-context comparator matched six of 26 exact outcomes. It displayed a row on four of the six cases requiring review. A medication-only default matched zero exact outcomes and displayed a row on all six. On the less stringent category-and-strength measure, the three methods scored 26, eight, and three respectively. The comparison set favors cases where additional context matters.

Among the 14 complete cases with diplotypes covered by both editions, context-aware lookup matched 14 exact rows and the fixed-context comparator matched four. This comparison isolates the effect of context from differences in allele coverage.

The synthetic reference rows and executable rules were derived from the same publications. This establishes agreement with the selected examples. The public TSV, per-case predictions and deterministic command allow judges to audit each result.

We also checked the phenotype translation against published CYP2C19 calls from 18 reports representing six diplotypes. Agreement was 18/18 with Absalon, which used CPIC conventions, 14/18 with Filadelfia and 7/18 with Sct. Hans. The last two laboratories used local conventions. All three comparisons concern the same 18 reports. These data evaluate phenotype agreement only. [Baltzer Houlind et al., Table 2](https://doi.org/10.1111/bcpt.13990)

## Who benefits, and who could be harmed

Pharmacists and PGx trainees can trace a lookup to its source and see which information needs verification. A patient could be harmed if a simplified row were used to change treatment without assessing contraindications, interacting drugs and the clinical record. People with diplotypes outside the supported panel encounter more referrals. The program does not infer a normal result from an unreported gene.

## Limitations and what we would do with another month

Two adult medications and two versioned guidelines are covered. The medication-level reference set contains synthetic cases and lacks independent pharmacist adjudication. The published comparison covers CYP2C19 phenotype translation only. We have not measured clinical outcomes or review time. With another month we would obtain independently authored, pharmacist-adjudicated cases, measure time per report in a blinded crossover comparison, and track disagreements and abstentions across diplotypes.

## Attribution

Built on Xia Wu's original GenePath entry for DSH Hacks V2. The CPIC publications and data credits are in the repository README. OpenAI Codex assisted with implementation, reference-case preparation, evaluation, and the demonstration.
