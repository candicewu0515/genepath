# Demo video script (about 4 minutes)

Record the screen at https://candicewu0515.github.io/genepath/ in a desktop-width window. Lines in quotes are narration; lines in brackets are what to do on screen.

## 0:00–0:30 · The problem
[Show the top of the page.]

"Millions of people now have a pharmacogenomic test result. The report says something like 'CYP2C19 star-2 star-2'. Most people can't tell whether that matters for a medicine they already take, or what to do next. GenePath turns that one report into two real decisions: is my medication affected, and is there a clinical trial that fits me. It covers sixteen medicines across eight genes, and every clinical sentence on the page comes straight from a public API."

## 0:30–2:00 · Medication gene card
[Open the Medication dropdown so the seven categories are visible, then pick Clopidogrel and *2/*2 poor metabolizer.]

"The list covers blood thinners, statins, acid-reflux drugs, antidepressants, painkillers, chemotherapy and immune suppressants. Start with clopidogrel, one of the most prescribed blood thinners. It only works after a liver enzyme, CYP2C19, switches it on. For a poor metabolizer the card explains in plain words that the drug may protect much less well, then quotes the CPIC recommendation word for word: avoid clopidogrel if possible, use prasugrel or ticagrelor. It is information for a conversation with a doctor, not an instruction."

[Point at the chart, then the highlighted insight line.]

"This chart uses real aggregate data from the All of Us Research Program, about 535,000 participants. The star-2 variant sits on about 31% of gene copies in East Asian participants and 34% in South Asian participants, more than three times the rate in Middle Eastern participants."

[Click Warfarin. Set VKORC1 to A/A. Point at the East Asian bar.]

"Warfarin shows the gap even more clearly: 87% in East Asian ancestry versus 9% in African ancestry. The same starting dose cannot be right for everyone."

[Switch to Azathioprine, NUDT15 version, and pick *3/*3.]

"And the gap is not always the one people expect. NUDT15 star-3 makes a standard dose of this immune drug dangerous. It sits at about 10% in East Asian participants and under half a percent in European participants — the kind of variant a panel designed around one population leaves out."

[Scroll to "Questions to take to your next appointment". Click "Print this card", then cancel.]

"The card ends with questions to bring to an appointment, and it prints on one page."

## 2:00–3:20 · Clinical trial navigator
[Click the hand-off button under the card. The page scrolls and loads live results.]

"The second question: is anyone studying better options for people like me? Each drug hands off to the condition it is used for. This is a live query to ClinicalTrials.gov, filtered to studies open to a 68-year-old and sorted by distance. If nothing is recruiting nearby, the search widens itself and says so."

[Open the first trial's "Key entry rules, in plain words".]

"Each study shows its three key entry rules in the original wording, with a plain-language note under each one, the nearest sites, and who to contact."

[Tick "Use saved sample data".]

"If the network is down, a saved snapshot keeps everything working."

## 3:20–4:00 · Sources and limits
[Scroll to the footer.]

"Everything here is real, public data: the All of Us Data Browser for frequencies, the CPIC API for the recommendations, ClinicalTrials.gov for trials. A build script pulls all of it and fails if any value cannot be confirmed, so no guideline text is typed by hand. The page stores nothing and makes no AI calls at run time, so nothing a user enters reaches a model. It is an educational demo: frequencies describe populations, not individuals, and only a study team can confirm eligibility. Next, we want to read a real report file and add CYP2D6. Thank you."
