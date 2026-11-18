"use strict";
const assert = require("node:assert/strict");
const test = require("node:test");
const {lookup, actionText, phenotypeText} = require("../lookup.js");
const adult = (diplotype, drug = "clopidogrel", context = "acs") => lookup({age:"adult", drug, context, diplotype});

test("accepts allele order, spacing around the slash, and matching gene labels", () => {
  for (const notation of ["*2/*1", " *1 / *2 ", "CYP2C19 *1/*2", "cyp2c19*2 / CYP2C19*1"]) {
    assert.deepEqual(adult(notation), adult("*1/*2"));
  }
});
test("returns review for broken allele names, the wrong gene, or ambiguous reports", () => {
  for (const input of ["*1/*1 7", "*1/* 2", "*1/*1\n7", "SLCO1B1 *1/*2", "*1/CYP2D6*2",
    "*1/*02", "*1/*99", "*1/*2/*17", "*1/*2 or *1/*3", "*1x2/*2", "*1|*2", "", null]) {
    assert.equal(adult(input).state, "review", String(input));
  }
});
test("retains the distinction between a documented evidence gap and missing input", () => {
  assert.equal(adult("*1/*17", "clopidogrel", "neuro").category, "no_guidance");
  assert.equal(adult("*1/*17", "clopidogrel", "unknown").state, "review");
});
test("names both genes and distinguishes maintenance from starting-dose context", () => {
  const statin = adult("SLCO1B1 *1/*5", "rosuvastatin", "poor");
  assert.equal(phenotypeText(statin), "SLCO1B1 decreased / ABCG2 poor");
  assert.match(actionText(adult("*1/*1")), /maintenance/);
  assert.match(actionText(adult("*1/*1", "rosuvastatin", "normal")), /starting/);
});
