const fs = require("node:fs");
const {execFileSync} = require("node:child_process");
const path = require("node:path");
const report = JSON.parse(execFileSync(process.execPath, [path.join(__dirname,"run.cjs"),"--json"],{encoding:"utf8"}));
const labels = {contextAware:"GenePath review",fixedContext:"Fixed-context lookup",drugOnly:"Medication-only default"};
const summary = {};
for (const [key,r] of Object.entries(report.splits.test)) {
  const {n,exact,reviewExpected,rowsOnReviewCases} = r;
  summary[labels[key]] = {n,exact,reviewExpected,rowsOnReviewCases};
}
fs.writeFileSync(path.join(__dirname,"summary.js"),"window.REVIEW_SCORES = "+JSON.stringify(summary,null,2)+";\n");
