"use strict";
const {lookup, actionText, phenotypeText, rowNote, refs, contexts} = window.GenePathReview;
const el = id => document.getElementById(id);
const resultCard = document.querySelector(".result");
let exampleActive = false;

function setFields() {
  const clop = el("drug").value === "clopidogrel";
  el("geneLabel").textContent = (clop ? "CYP2C19" : "SLCO1B1") + " diplotype";
  el("diplotype").value = "";
  el("diplotype").placeholder = clop ? "e.g., *1/*2" : "e.g., *1/*5";
  el("contextLabel").textContent = clop ? "Indication" : "Reported ABCG2 function";
  const options = clop ? contexts : {normal:"Normal function", decreased:"Decreased function", poor:"Poor function"};
  el("context").replaceChildren();
  for (const [value, label] of Object.entries({unknown:"Unknown / not documented", ...options})) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    el("context").append(option);
  }
  el("context").value = "unknown";
}

function showFact(label, text) {
  const line = document.createElement("div");
  const term = document.createElement("dt");
  const value = document.createElement("dd");
  term.textContent = label;
  value.textContent = text;
  line.append(term, value);
  el("facts").append(line);
}

function render(start = false) {
  const drug = el("drug").value;
  const context = el("context").value;
  const result = lookup({drug, age:el("age").value, diplotype:el("diplotype").value, context});
  const found = result.state === "row";
  const gap = result.category === "no_guidance";
  el("compare").hidden = !exampleActive;
  if (exampleActive) {
    el("compare").textContent = drug === "clopidogrel"
      ? (context === "acs" ? "Compare stroke / TIA" : "Compare coronary indication")
      : (context === "poor" ? "Hide ABCG2 result" : "Restore ABCG2 result");
  }
  el("facts").replaceChildren();
  el("citation").hidden = true;
  el("citation").removeAttribute("href");
  if (start) {
    resultCard.dataset.state = "ready";
    el("status").textContent = "Report preview";
    el("headline").textContent = "Enter a report or load an example";
    el("detail").textContent = "A match shows the phenotype, recommendation strength and source table.";
    return;
  }
  resultCard.dataset.state = gap ? "gap" : result.state;
  el("status").textContent = found ? (gap ? "Published evidence gap" : "Matched CPIC row") : "Pharmacist review";
  el("headline").textContent = found ? actionText(result) : (el("age").value === "child" ? "Outside adult scope" : "Check the report");
  el("detail").textContent = found ? rowNote(result) : result.reason;
  if (found) {
    showFact("Phenotype", phenotypeText(result));
    showFact("Strength", result.strength === "none" ? "No recommendation" : result.strength);
    showFact("CPIC (2022)", refs[result.reference][0]);
    el("citation").href = refs[result.reference][1];
    el("citation").target = "_blank";
    el("citation").rel = "noopener noreferrer";
    el("citation").textContent = "Read the source table ↗";
    el("citation").hidden = false;
  }
}

el("drug").addEventListener("change", () => {
  exampleActive = false;
  setFields();
  render(el("age").value === "unknown");
});
function edited() {
  exampleActive = false;
  render();
}
for (const id of ["age", "context"]) el(id).addEventListener("change", edited);
el("diplotype").addEventListener("input", edited);
el("sample").addEventListener("click", () => {
  const clop = el("drug").value === "clopidogrel";
  el("age").value = "adult";
  el("diplotype").value = clop ? "*1/*2" : "*1/*5";
  el("context").value = clop ? "acs" : "poor";
  exampleActive = true;
  render();
});
el("compare").addEventListener("click", () => {
  const field = el("context");
  if (el("drug").value === "clopidogrel") field.value = field.value === "acs" ? "neuro" : "acs";
  else field.value = field.value === "poor" ? "unknown" : "poor";
  render();
});

function appendScore(id, cells) {
  const row = document.createElement("tr");
  for (const text of cells) {
    const cell = document.createElement("td");
    cell.textContent = text;
    row.append(cell);
  }
  el(id).append(row);
}
const {methods, shared, external} = window.REVIEW_SCORES;
for (const [name, r] of Object.entries(methods)) {
  appendScore("scores", [name, r.exact + "/" + r.n, r.rowsOnReviewCases + "/" + r.reviewExpected]);
}
el("sharedPanel").textContent = "Among " + shared.contextAware.n + " complete test cases with diplotypes supported by both editions, context-aware lookup matched " +
  shared.contextAware.exact + "/" + shared.contextAware.n + " exact rows and fixed-context lookup matched " + shared.fixedContext.exact + "/" + shared.fixedContext.n + ".";
el("publishedCaption").textContent = "The same " + external.reports + " reports cover " + external.diplotypes + " diplotypes. Each laboratory comparison uses all reports.";
const labNames = {absalon:"Absalon", filadelfia:"Filadelfia", sctHans:"Sct. Hans"};
for (const [lab, matches] of Object.entries(external.labs)) {
  appendScore("labs", [labNames[lab], matches + "/" + external.reports]);
}
setFields();
render(true);
