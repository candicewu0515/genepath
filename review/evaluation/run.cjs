"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {lookup} = require("../lookup.js");
const source = fs.readFileSync(path.join(__dirname, "cases.tsv"), "utf8");
const [head, ...lines] = source.trim().split(/\r?\n/);
const keys = head.split("\t");
const cases = lines.map(line => Object.fromEntries(line.split("\t").map((v,i) => [keys[i],v])));
const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../../data/pgx-data.json")));
const drugs = Object.fromEntries(data.drugs.map(x => [x.key,x]));
const code = {"Normal Metabolizer":"NM","Intermediate Metabolizer":"IM","Poor Metabolizer":"PM",
  "Rapid Metabolizer":"RM","Ultrarapid Metabolizer":"UM","Normal Function":"normal",
  "Decreased Function":"decreased","Poor Function":"poor"};
function legacy(c, drugOnly = false) {
  const d = drugs[c.drug];
  const alleles = c.diplotype.replace(/\s/g,"").split("/");
  const target = drugOnly ? "*1/*1" : alleles.sort((a,b) => Number(a.slice(1)) - Number(b.slice(1))).join("/");
  const match = d.diplotypes.find(p => p.diplotype === target);
  if (!match) return {state:"review"};
  const p = code[match.key];
  const strength = d.recommendations[match.key].classification.toLowerCase();
  if (c.drug === "rosuvastatin") {
    return {state:"row",phenotype:p+"/normal",category:{normal:"usual",decreased:"caution20",poor:"cap20"}[p],strength,reference:"S5"};
  }
  const category = {RM:"usual",UM:"usual",NM:"usual",IM:"avoid_standard",PM:"avoid_drug"}[p];
  return {state:"row",phenotype:p,category,strength,reference:"C2A"};
}
function score(list, predict) {
  const rows = list.map(c => {
    const result = predict(c);
    const action = result.state === c.state && (c.state === "review" ||
      (result.category === c.category && result.strength === c.strength));
    const exact = action && (c.state === "review" ||
      (result.phenotype === c.phenotype && result.reference === c.reference));
    return {id:c.id,expected:c.state,predicted:result.state,action,exact,result};
  });
  const boundary = rows.filter(r => r.expected === "review");
  return {n:rows.length, categoryAndStrength:rows.filter(r=>r.action).length, exact:rows.filter(r=>r.exact).length,
    reviewExpected:boundary.length,rowsOnReviewCases:boundary.filter(r=>r.predicted==="row").length,
    abstainedOnReferenceRows:rows.filter(r=>r.expected==="row" && r.predicted==="review").length,rows};
}
const report = {fixtureSHA256:crypto.createHash("sha256").update(source).digest("hex"),splits:{}};
for (const split of ["development","test"]) {
  const set = cases.filter(c=>c.split===split);
  report.splits[split] = {contextAware:score(set,lookup),fixedContext:score(set,c=>legacy(c)),drugOnly:score(set,c=>legacy(c,true))};
}
if (process.argv.includes("--json")) console.log(JSON.stringify(report,null,2));
else for (const [split,methods] of Object.entries(report.splits)) {
  for (const [method,r] of Object.entries(methods)) console.log(
    split,method,"exact",r.exact+"/"+r.n,"category+strength",r.categoryAndStrength+"/"+r.n,
    "rows emitted on review cases",r.rowsOnReviewCases+"/"+r.reviewExpected);
}
