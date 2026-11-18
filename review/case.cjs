"use strict";
const {lookup,phenotypeText,actionText,rowNote,refs} = require("./lookup.js");
const args = process.argv.slice(2);
if (args.length !== 4) {
  console.log("Usage: node review/case.cjs DRUG AGE DIPLOTYPE CONTEXT");
  console.log("Example: node review/case.cjs clopidogrel adult '*1/*2' neuro");
  console.log("Context: acs | neuro | other_cv | unknown, or ABCG2 normal | decreased | poor | unknown");
  process.exitCode = 1;
} else {
  const [drug,age,diplotype,context] = args;
  const result = lookup({drug,age,diplotype,context});
  console.log("Report   ", drug, " / ",age," / ",diplotype," / ",context);
  if (result.state === "review") {
    console.log("Status    Pharmacist review");
    console.log("Reason   ",result.reason);
  } else {
    console.log("Source   ",refs[result.reference][0]);
    console.log("Phenotype",phenotypeText(result));
    console.log("Category ",actionText(result));
    console.log("Strength ",result.strength);
    console.log("Note     ",rowNote(result));
  }
}
