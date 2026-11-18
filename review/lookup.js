/* Versioned adult guideline index. The web page and evaluation use this exact function. */
(function () {
  "use strict";
  const review = reason => ({state: "review", reason});
  const row = (phenotype, category, strength, reference) =>
    ({state: "row", phenotype, category, strength, reference});
  const labels = {
    NM: "Normal metabolizer", IM: "Intermediate metabolizer", PM: "Poor metabolizer",
    RM: "Rapid metabolizer", UM: "Ultrarapid metabolizer",
    likely_IM: "Likely intermediate metabolizer", likely_PM: "Likely poor metabolizer"
  };
  const refs = {
    C2A: ["Table 2 · ACS or coronary PCI", "https://files.cpicpgx.org/data/guideline/publication/clopidogrel/2022/35034351.pdf#page=4"],
    C2B: ["Table 2 · Other cardiovascular indications", "https://files.cpicpgx.org/data/guideline/publication/clopidogrel/2022/35034351.pdf#page=4"],
    C3: ["Table 3 · Neurovascular indications", "https://files.cpicpgx.org/data/guideline/publication/clopidogrel/2022/35034351.pdf#page=6"],
    S5: ["Table 5 · Adult two-gene lookup", "https://files.cpicpgx.org/data/guideline/publication/statins/2022/publication.pdf#page=12"]
  };
  const categories = {
    usual: "Standard regimen in the selected guideline row",
    avoid_standard: "Guideline advises avoiding the usual clopidogrel regimen if possible",
    avoid_drug: "Guideline advises avoiding clopidogrel if possible",
    consider_other: "Guideline suggests considering an alternative antiplatelet",
    no_guidance: "CPIC gives no recommendation for this combination",
    caution20: "Usual starting regimen with a muscle-risk caution above 20 mg",
    cap20: "Guideline row with a 20 mg starting-dose ceiling",
    cap10: "Guideline row with a 10 mg starting-dose ceiling"
  };
  const contexts = {
    acs: "Acute coronary syndrome or coronary PCI",
    other_cv: "Other cardiovascular indication (e.g., peripheral arterial disease without ACS or PCI)",
    neuro: "Neurovascular indication (e.g., ischemic stroke or TIA)"
  };
  function parsePair(raw, gene) {
    const tokens = String(raw ?? "").trim().split("/");
    if (tokens.length !== 2) return [];
    const pair = [];
    for (const token of tokens) {
      const match = /^(?:(CYP2C19|SLCO1B1)\s*)?(\*[1-9]\d*)$/i.exec(token.trim());
      if (!match || (match[1] && match[1].toUpperCase() !== gene)) return [];
      pair.push(match[2]);
    }
    return pair.sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  }
  function cypPhenotype(pair) {
    if (pair.length !== 2 || !pair.every(a => ["*1","*2","*3","*9","*17"].includes(a))) return null;
    const lost = pair.filter(a => a === "*2" || a === "*3").length;
    if (pair.includes("*9")) return lost ? "likely_PM" : "likely_IM";
    if (lost === 2) return "PM";
    if (lost === 1) return "IM";
    if (pair[0] === "*17") return "UM";
    return pair[1] === "*17" ? "RM" : "NM";
  }
  function clopidogrel(pair, indication) {
    const phenotype = cypPhenotype(pair);
    if (!phenotype) return review("Check the CYP2C19 diplotype. This edition covers *1, *2, *3, *9 and *17.");
    const ref = {acs:"C2A", other_cv:"C2B", neuro:"C3"}[indication];
    if (!Object.hasOwn(contexts, indication)) return review("Confirm the indication. Coronary and neurovascular rows can differ for the same diplotype.");
    const group = phenotype.replace("likely_", "");
    if (group === "PM") return row(phenotype, "avoid_drug", indication === "acs" ? "strong" : "moderate", ref);
    if (group === "NM" || (indication === "acs" && ["RM","UM"].includes(group))) return row(phenotype, "usual", "strong", ref);
    if (group === "IM" && indication === "acs") return row(phenotype, "avoid_standard", "strong", ref);
    if (group === "IM" && indication === "neuro") return row(phenotype, "consider_other", "moderate", ref);
    return row(phenotype, "no_guidance", "none", ref);
  }
  function rosuvastatin(pair, abcg2) {
    const slco = {"*1/*1":"normal", "*1/*5":"decreased", "*5/*5":"poor"}[pair.join("/")];
    if (!slco) return review("Confirm the SLCO1B1 report. This edition covers *1/*1, *1/*5 and *5/*5.");
    if (!["normal","decreased","poor"].includes(abcg2)) return review("Obtain the reported ABCG2 function to select the combined row. Individual-gene guidance can be reviewed separately.");
    let category = {normal:"usual", decreased:"caution20", poor:"cap20"}[slco];
    let strength = abcg2 === "normal" && slco !== "poor" ? "strong" : "moderate";
    if (abcg2 === "poor") {
      category = slco === "normal" ? "cap20" : "cap10";
      strength = "optional";
    }
    return row(slco + "/" + abcg2, category, strength, "S5");
  }
  function lookup({drug, age, diplotype, context}) {
    if (age === "child") return review("This reference covers adults. Use an age-appropriate source for this report.");
    if (age !== "adult") return review("Confirm the patient’s age group before selecting an adult guideline row.");
    if (!["clopidogrel", "rosuvastatin"].includes(drug)) {
      return review("Select one of the two medications in this edition.");
    }
    const gene = drug === "clopidogrel" ? "CYP2C19" : "SLCO1B1";
    const pair = parsePair(diplotype, gene);
    if (pair.length === 0) return review("Check the " + gene + " report for two star alleles separated by a slash. Enter each allele exactly as reported.");
    return drug === "clopidogrel" ? clopidogrel(pair, context) : rosuvastatin(pair, context);
  }
  function phenotypeText(result) {
    if (result.reference !== "S5") return labels[result.phenotype];
    const [slco, abcg2] = result.phenotype.split("/");
    return "SLCO1B1 " + slco + " / ABCG2 " + abcg2;
  }
  function actionText(result) {
    if (result.category === "usual") {
      return result.reference === "S5"
        ? "Guideline row for the usual starting dose"
        : "Guideline row for standard clopidogrel maintenance dosing";
    }
    return categories[result.category];
  }
  function rowNote(result) {
    if (result.reference === "S5") return "This adult starting-dose table combines two gene results. Check population-specific labeling, interactions and other clinical factors.";
    if (result.category === "no_guidance") return "The inputs identify a published row. CPIC leaves a genotype-based action unspecified for this phenotype and indication.";
    if (result.reference === "C3" && ["consider_other", "avoid_drug"].includes(result.category)) {
      return "Review contraindications before choosing an alternative. CPIC flags prior stroke or TIA as a contraindication to prasugrel.";
    }
    return "The action and recommendation strength apply to the selected indication.";
  }
  const api = {lookup, phenotypeText, actionText, rowNote, refs, contexts};
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.GenePathReview = api;
})();
