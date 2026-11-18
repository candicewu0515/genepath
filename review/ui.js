"use strict";
const {lookup, categories, refs, labels, contexts} = window.GenePathReview;
const el = id => document.getElementById(id);
function setFields() {
  const clop = el("drug").value === "clopidogrel";
  el("geneLabel").textContent = (clop ? "CYP2C19" : "SLCO1B1") + " diplotype";
  el("diplotype").value = "";
  el("diplotype").placeholder = clop ? "e.g., *1/*2" : "e.g., *1/*5";
  el("contextLabel").textContent = clop ? "Indication" : "Reported ABCG2 function";
  const options = clop ? contexts : {normal:"Normal function",decreased:"Decreased function",poor:"Poor function"};
  el("context").replaceChildren(new Option("Unknown / not documented","unknown"),
    ...Object.entries(options).map(([v,t]) => new Option(t,v)));
}
function render() {
  const drug = el("drug").value, r = lookup({drug,age:el("age").value,
    diplotype:el("diplotype").value,context:el("context").value});
  const found = r.state === "row", card = document.querySelector(".result");
  card.dataset.state = r.state;
  el("status").textContent = found ? "Matched CPIC row" : "Pharmacist review";
  el("headline").textContent = found ? categories[r.category] : "More information needed";
  const explanation = drug === "rosuvastatin" ? "The combined adult lookup uses both gene results. Population-specific labeling and other clinical factors still apply." :
    "The selected indication determines which recommendation and evidence strength apply.";
  el("detail").textContent = found ? explanation : r.reason;
  el("facts").replaceChildren();
  if (found) {
    const ph = labels[r.phenotype] || r.phenotype.split("/").join(" / ");
    for (const [k,v] of [["Phenotype",ph],["Strength",r.strength === "none" ? "No recommendation" : r.strength],["CPIC (2022)",refs[r.reference][0]]]) {
      const line = document.createElement("div"), term = document.createElement("dt"), value = document.createElement("dd");
      term.textContent=k;value.textContent=v;line.append(term,value);el("facts").append(line);
    }
    el("citation").href = refs[r.reference][1];
    el("citation").textContent = "Read the source table ↗";
  } else el("citation").removeAttribute("href");
  el("citation").hidden = !found;
}
el("drug").addEventListener("change",()=>{setFields();render();});
for (const id of ["age","context"]) el(id).addEventListener("change",render);
el("diplotype").addEventListener("input",render);
el("sample").addEventListener("click",()=>{
  const clop = el("drug").value === "clopidogrel";
  el("age").value="adult";el("diplotype").value=clop ? "*1/*2" : "*1/*5";
  el("context").value=clop ? "acs" : "poor";render();
});
for (const [name,r] of Object.entries(window.REVIEW_SCORES)) {
  const tr=document.createElement("tr");
  for (const v of [name,r.exact+"/"+r.n,r.rowsOnReviewCases+"/"+r.reviewExpected]) {
    const td=document.createElement("td");td.textContent=v;tr.append(td);
  }
  el("scores").append(tr);
}
setFields();render();
