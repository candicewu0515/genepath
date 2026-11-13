"""Build pgx-data.js from two public sources, with no login and no hand-written guideline text.

  * CPIC API (https://api.cpicpgx.org/v1) — diplotype -> phenotype -> recommendation, verbatim.
  * All of Us public Data Browser API — aggregate allele frequencies by genetic ancestry.

Usage: python3 tools/build_pgx_data.py
Writes pgx-data.js at the repository root. Fails loudly if a configured diplotype,
drug or variant is missing upstream, so the app never ships silently wrong data.
"""

import datetime, json, pathlib, re, sys, urllib.parse, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
CPIC = "https://api.cpicpgx.org/v1"
AOU = "https://public.api.researchallofus.org/v1/genomics/variant-details/"
UA = {"User-Agent": "research-script/1.0", "Accept": "application/json"}
GROUPS = ["afr", "eur", "amr", "eas", "sas", "mid"]

# ---------------------------------------------------------------- configuration

# Key variants per gene, as GRCh38 chrom-pos-ref-alt keys used by the Data Browser.
VARIANTS = {
    "CYP2C19": [("*2", "rs4244285", "10-94781859-G-A", "no-function allele: the enzyme is not made"),
                ("*17", "rs12248560", "10-94761900-C-T", "increased-function allele: the enzyme works faster")],
    "CYP2C9": [("*2", "rs1799853", "10-94942290-C-T", "reduced-function allele"),
               ("*3", "rs1057910", "10-94981296-A-C", "strongly reduced-function allele")],
    "VKORC1": [("-1639A", "rs9923231", "16-31096368-C-T", "more sensitive to warfarin, so a lower dose is needed")],
    "SLCO1B1": [("*5", "rs4149056", "12-21178615-T-C", "reduced liver uptake of statins, so more stays in the blood")],
    "DPYD": [("*2A", "rs3918290", "1-97450058-C-T", "no-function allele: the enzyme that clears 5-FU is missing"),
             ("HapB3", "rs75017182", "1-97579893-G-C", "reduced-function allele (c.1129-5923C>G)")],
    "NUDT15": [("*3", "rs116855232", "13-48045719-C-T", "reduced-function allele")],
    "TPMT": [("*3C", "rs1142345", "6-18130687-T-C", "reduced-function allele")],
    "CYP3A5": [("*3", "rs776746", "7-99672916-T-C", "no-function allele, and the common version worldwide")],
}

# Diplotypes offered in the UI, in display order. Validated against CPIC.
DIPLOTYPES = {
    "CYP2C19": ["*1/*1", "*1/*2", "*2/*2", "*1/*17", "*17/*17", "*2/*17"],
    "CYP2C9": ["*1/*1", "*1/*2", "*1/*3", "*2/*2", "*2/*3", "*3/*3"],
    "SLCO1B1": ["*1/*1", "*1/*5", "*5/*5"],
    "DPYD": ["Reference/Reference", "c.1129-5923C>G/Reference",
             "c.1905+1G>A (*2A)/Reference", "c.1905+1G>A (*2A)/c.1905+1G>A (*2A)"],
    "NUDT15": ["*1/*1", "*1/*3", "*3/*3"],
    "TPMT": ["*1/*1", "*1/*3A", "*3A/*3A"],
    "CYP3A5": ["*1/*1", "*1/*3", "*3/*3"],
}

# Plain-English gene blurbs, written for this project (not from CPIC).
GENE_PLAIN = {
    "CYP2C19": "CYP2C19 is a liver enzyme. It switches some medicines on and breaks others down.",
    "CYP2C9": "CYP2C9 is a liver enzyme that clears several common medicines out of the body.",
    "VKORC1": "VKORC1 is the protein warfarin blocks. Some versions are blocked more easily, so less drug is needed.",
    "SLCO1B1": "SLCO1B1 is a transporter that pulls statins from the blood into the liver.",
    "DPYD": "DPYD makes the enzyme that breaks down the chemotherapy drugs 5-FU and capecitabine.",
    "NUDT15": "NUDT15 helps clear thiopurine drugs. Low activity lets the drug damage bone marrow.",
    "TPMT": "TPMT helps clear thiopurine drugs. Low activity lets the drug damage bone marrow.",
    "CYP3A5": "CYP3A5 is an enzyme that clears tacrolimus, a transplant anti-rejection drug.",
}

# Drugs offered in the UI. `fixed` pins a second gene so the card stays a single-gene story.
DRUGS = [
    dict(key="clopidogrel", name="Clopidogrel", brand="Plavix", gene="CYP2C19", group="Heart and blood",
         use="a blood thinner that stops platelets from clumping, used after stents, heart attacks and some strokes",
         population="CVI ACS PCI ", note="Recommendations shown are for people with acute coronary syndrome or a stent (PCI)."),
    dict(key="warfarin", name="Warfarin", brand="Coumadin", gene="VKORC1", group="Heart and blood", special="warfarin",
         use="a blood thinner used for atrial fibrillation, clots and mechanical heart valves; the right dose varies a lot between people"),
    dict(key="simvastatin", name="Simvastatin", brand="Zocor", gene="SLCO1B1", group="Cholesterol",
         use="a statin that lowers cholesterol; its best-known side effect is muscle pain"),
    dict(key="atorvastatin", name="Atorvastatin", brand="Lipitor", gene="SLCO1B1", group="Cholesterol",
         use="the most prescribed statin worldwide"),
    dict(key="rosuvastatin", name="Rosuvastatin", brand="Crestor", gene="SLCO1B1", group="Cholesterol",
         fixed={"ABCG2": "Normal Function"},
         use="a statin often used when another statin caused muscle pain",
         note="Shown for people with normal ABCG2 function, the other gene in this guideline."),
    dict(key="omeprazole", name="Omeprazole", brand="Prilosec", gene="CYP2C19", group="Stomach and reflux",
         use="a proton pump inhibitor for acid reflux, ulcers and H. pylori treatment"),
    dict(key="pantoprazole", name="Pantoprazole", brand="Protonix", gene="CYP2C19", group="Stomach and reflux",
         use="a proton pump inhibitor for acid reflux and ulcers"),
    dict(key="escitalopram", name="Escitalopram", brand="Lexapro", gene="CYP2C19", group="Mental health",
         use="an SSRI antidepressant also used for anxiety"),
    dict(key="sertraline", name="Sertraline", brand="Zoloft", gene="CYP2C19", group="Mental health",
         fixed={"CYP2B6": "Normal Metabolizer"},
         use="one of the most prescribed SSRI antidepressants",
         note="Shown for people with normal CYP2B6 function, the other gene in this guideline."),
    dict(key="ibuprofen", name="Ibuprofen", brand="Advil, Motrin", gene="CYP2C9", group="Pain and inflammation",
         use="a non-steroidal anti-inflammatory painkiller sold over the counter"),
    dict(key="celecoxib", name="Celecoxib", brand="Celebrex", gene="CYP2C9", group="Pain and inflammation",
         use="a prescription anti-inflammatory painkiller used for arthritis"),
    dict(key="meloxicam", name="Meloxicam", brand="Mobic", gene="CYP2C9", group="Pain and inflammation",
         use="a long-acting anti-inflammatory painkiller used for arthritis"),
    dict(key="capecitabine", name="Capecitabine", brand="Xeloda", gene="DPYD", group="Cancer treatment",
         use="a chemotherapy tablet for breast, colorectal and stomach cancer"),
    dict(key="fluorouracil", name="Fluorouracil (5-FU)", brand="Adrucil", gene="DPYD", group="Cancer treatment",
         use="an infused chemotherapy drug used across many cancers"),
    dict(key="azathioprine", name="Azathioprine", brand="Imuran", gene="TPMT", group="Immune conditions",
         fixed={"NUDT15": "Normal Metabolizer"},
         use="an immune-suppressing drug for autoimmune disease and after transplant",
         note="Shown for people with normal NUDT15 function, the other gene in this guideline."),
    dict(key="azathioprine_nudt15", name="Azathioprine", brand="Imuran", gene="NUDT15", group="Immune conditions",
         drug="azathioprine", fixed={"TPMT": "Normal Metabolizer"},
         use="an immune-suppressing drug for autoimmune disease and after transplant",
         note="Shown for people with normal TPMT function, the other gene in this guideline."),
    dict(key="tacrolimus", name="Tacrolimus", brand="Prograf", gene="CYP3A5", group="Immune conditions",
         use="an anti-rejection drug taken after an organ transplant"),
]

SEVERITY = {  # phenotype -> card colour band
    "Normal Metabolizer": "ok", "Normal Function": "ok", "Increased Function": "ok",
    "Rapid Metabolizer": "ok", "Ultrarapid Metabolizer": "warn",
    "Intermediate Metabolizer": "warn", "Likely Intermediate Metabolizer": "warn",
    "Possible Intermediate Metabolizer": "warn", "Decreased Function": "warn",
    "Possible Decreased Function": "warn",
    "Poor Metabolizer": "danger", "Likely Poor Metabolizer": "danger", "Poor Function": "danger",
}

# ---------------------------------------------------------------- fetching


def stamp_index(filename):
    """Add a build date to the <script src> so browsers pick up a new data file."""
    idx = ROOT / "index.html"
    html = idx.read_text()
    new = re.sub(r'(<script src="%s)(\?v=[^"]*)?(")' % re.escape(filename),
                 lambda m: m.group(1) + "?v=" + datetime.date.today().isoformat() + m.group(3), html)
    if new != html:
        idx.write_text(new)

def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def cpic(path):
    return get(CPIC + path)


def q(v):
    return urllib.parse.quote(str(v), safe="")


def main():
    problems = []

    # 1. Diplotype -> lookupkey/phenotype, per gene.
    diplo = {}
    for gene, wanted in DIPLOTYPES.items():
        rows = cpic(f"/diplotype?select=diplotype,generesult,description,lookupkey&genesymbol=eq.{q(gene)}")
        byname = {r["diplotype"]: r for r in rows}
        picked = []
        for name in wanted:
            r = byname.get(name)
            if not r:
                problems.append(f"{gene}: diplotype {name!r} not in CPIC")
                continue
            picked.append({
                "diplotype": name,
                "phenotype": r["generesult"],
                "description": r["description"],
                "key": (r["lookupkey"] or {}).get(gene),
                "severity": SEVERITY.get(r["generesult"], "warn"),
            })
        diplo[gene] = picked

    # 2. Drug recommendations, keyed by the primary gene's lookupkey value.
    names = sorted({d.get("drug", d["key"]) for d in DRUGS if not d.get("special")})
    drugs = cpic("/drug?select=name,drugid&name=in.(%s)" % ",".join(names))
    drugid = {d["name"]: d["drugid"] for d in drugs}
    for n in names:
        if n not in drugid:
            problems.append(f"drug {n!r} not in CPIC")

    out_drugs = []
    for d in DRUGS:
        entry = {k: d[k] for k in ("key", "name", "brand", "gene", "group", "use") if k in d}
        entry["note"] = d.get("note", "")
        if d.get("special"):
            # Warfarin is dosed by an algorithm, not a phenotype table, so the app keeps
            # its own CYP2C9 x VKORC1 card built from the FDA label genotype table.
            entry["special"] = d["special"]
            entry["diplotypes"] = []
            out_drugs.append(entry)
            continue
        entry["diplotypes"] = diplo[d["gene"]]

        name = d.get("drug", d["key"])
        recs = cpic("/recommendation?select=implications,drugrecommendation,classification,lookupkey,population,comments"
                    "&drugid=eq.%s" % q(drugid[name]))
        wanted_pop = d.get("population")
        fixed = d.get("fixed", {})
        table = {}
        for r in recs:
            lk = r.get("lookupkey") or {}
            if wanted_pop and r.get("population") != wanted_pop:
                continue
            if any(lk.get(g) != v for g, v in fixed.items()):
                continue
            if set(lk) != set(fixed) | {d["gene"]}:
                continue
            table[lk[d["gene"]]] = {
                "implication": (r.get("implications") or {}).get(d["gene"], ""),
                "recommendation": r.get("drugrecommendation", ""),
                "classification": r.get("classification", ""),
            }
        missing = [p["key"] for p in diplo[d["gene"]] if p["key"] not in table]
        if missing:
            problems.append(f"{d['key']}: no CPIC recommendation for {missing}")
        entry["recommendations"] = table
        out_drugs.append(entry)

    # 3. All of Us allele frequencies.
    freqs = {}
    for gene, variants in VARIANTS.items():
        for label, rs, vid, effect in variants:
            try:
                v = get(AOU + vid)
            except Exception as e:
                problems.append(f"{gene} {label}: All of Us fetch failed ({vid}): {e}")
                continue
            if v.get("rsNumber") != rs:
                problems.append(f"{gene} {label}: expected {rs}, API returned {v.get('rsNumber')} for {vid}")
                continue
            by = {}
            for g in GROUPS:
                ac, an, hom = v.get(g + "AlleleCount"), v.get(g + "AlleleNumber"), v.get(g + "HomozygoteCount")
                if not an:
                    problems.append(f"{gene} {label}: no {g.upper()} data")
                    continue
                by[g.upper()] = {
                    "freq": round(100 * v[g + "AlleleFrequency"], 1),
                    # Observed share of people with at least one copy, not a Hardy-Weinberg estimate.
                    "carriers": round(100 * (ac - hom) / (an / 2), 1),
                }
            freqs[f"{gene} {label}"] = {
                "gene": gene, "label": f"{gene}{label}" if label.startswith("*") else f"{gene} {label}",
                "rs": rs, "variantId": vid, "effect": effect,
                "overall": round(100 * v["totalAlleleFrequency"], 1),
                "alleles": v["totalAlleleNumber"],
                "groups": by,
            }

    if problems:
        print("PROBLEMS:", *problems, sep="\n  ")
        sys.exit(1)

    data = {
        "builtFrom": {
            "cpic": CPIC,
            "allofus": "All of Us Research Program public Data Browser",
            "alleles": max(f["alleles"] for f in freqs.values()),
            "built": datetime.date.today().isoformat(),
        },
        "genePlain": GENE_PLAIN,
        "variants": freqs,
        "drugs": out_drugs,
    }
    text = json.dumps(data, ensure_ascii=False, indent=1)
    (ROOT / "pgx-data.js").write_text(
        "// Auto-generated by tools/build_pgx_data.py from the CPIC API and the\n"
        "// All of Us public Data Browser. Do not edit by hand.\n"
        "window.PGX_DATA = " + text + ";\n")
    (ROOT / "data" / "pgx-data.json").write_text(text)
    stamp_index("pgx-data.js")
    print(f"ok  {len(out_drugs)} drugs, {len({d['gene'] for d in out_drugs})} genes, {len(freqs)} variants")
    for d in out_drugs:
        print(f"   {d['name']:22s} {d['gene']:8s} {len(d.get('recommendations', {}))} recs")


if __name__ == "__main__":
    main()
