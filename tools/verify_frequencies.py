"""Verify the hard-coded allele frequencies against the All of Us public Data Browser API.

Usage: python3 tools/verify_frequencies.py
No login required: public.api.researchallofus.org serves aggregate data only.
"""
import json, urllib.request, sys

API = "https://public.api.researchallofus.org/v1/genomics/variant-details/"
GROUPS = ["afr", "eur", "amr", "eas", "sas", "mid"]

# GRCh38 coordinates, chrom-pos-ref-alt as the Data Browser keys variants.
VARIANTS = {
    "CYP2C19*2 (rs4244285)":      ("10-94781859-G-A", {"afr": 17.9, "eur": 14.6, "amr": 11.8, "eas": 30.9, "sas": 34.4, "mid": 10.0}),
    "CYP2C19*17 (rs12248560)":    ("10-94761900-C-T", {"afr": 22.2, "eur": 22.0, "amr": 12.5, "eas": 1.0,  "sas": 17.1, "mid": 20.4}),
    "CYP2C9*2 (rs1799853)":       ("10-94942290-C-T", {"afr": 2.1,  "eur": 12.9, "amr": 8.5,  "eas": 0.1,  "sas": 4.5,  "mid": 11.9}),
    "CYP2C9*3 (rs1057910)":       ("10-94981296-A-C", {"afr": 1.2,  "eur": 6.7,  "amr": 4.4,  "eas": 3.2,  "sas": 10.6, "mid": 7.1}),
    "VKORC1 -1639A (rs9923231)":  ("16-31096368-C-T", {"afr": 9.4,  "eur": 38.6, "amr": 42.6, "eas": 87.4, "sas": 17.1, "mid": 50.5}),
    "SLCO1B1*5 (rs4149056)":      ("12-21178615-T-C", {"afr": 2.8,  "eur": 16.0, "amr": 12.1, "eas": 12.7, "sas": 4.8,  "mid": 20.8}),
}


def fetch(vid):
    with urllib.request.urlopen(API + vid, timeout=40) as r:
        return json.load(r)


bad = 0
for label, (vid, claimed) in VARIANTS.items():
    try:
        d = fetch(vid)
    except Exception as e:
        print(f"{label}: FETCH FAILED ({vid}): {e}")
        bad += 1
        continue
    rs = d.get("rsNumber", "?")
    total_an = sum(d.get(g + "AlleleNumber") or 0 for g in GROUPS)
    total_ac = sum(d.get(g + "AlleleCount") or 0 for g in GROUPS)
    print(f"\n{label}  [{vid}]  API rsNumber={rs}  alleles={total_an:,}  overall={100*total_ac/total_an:.1f}%")
    for g in GROUPS:
        f = d.get(g + "AlleleFrequency")
        if f is None:
            print(f"   {g.upper()}: missing from API")
            bad += 1
            continue
        got, want = round(100 * f, 1), claimed[g]
        flag = "ok " if abs(got - want) <= 0.15 else "DIFF"
        if flag == "DIFF":
            bad += 1
        print(f"   {g.upper()}: api {got:5.1f}%   table {want:5.1f}%   {flag}")

print(f"\n{'All values match.' if not bad else str(bad) + ' value(s) differ or missing.'}")
sys.exit(0)
