#!/usr/bin/env python3
"""Fetch nuclear HOX gene sequences for all primates in this project.

Genes fetched:
- HOXA2 (homeobox A2)

The script queries NCBI nucleotide records and extracts gene-specific CDS using
`rettype=fasta_cds_na`, then writes one FASTA per species per gene.
"""

import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

SPECIES = [
    ("homo_sapiens", "Homo sapiens"),
    ("homo_neanderthalensis", "Homo neanderthalensis"),
    ("homo_denisova", "Denisova hominin"),
    ("pan_troglodytes", "Pan troglodytes"),
    ("pan_paniscus", "Pan paniscus"),
    ("gorilla_gorilla", "Gorilla gorilla"),
    ("pongo_pygmaeus", "Pongo pygmaeus"),
    ("hylobates_lar", "Hylobates lar"),
    ("macaca_mulatta", "Macaca mulatta"),
    ("papio_anubis", "Papio anubis"),
    ("mandrillus_sphinx", "Mandrillus sphinx"),
    ("chlorocebus_sabaeus", "Chlorocebus sabaeus"),
    ("callithrix_jacchus", "Callithrix jacchus"),
    ("saimiri_boliviensis", "Saimiri boliviensis"),
    ("aotus_nancymaae", "Aotus nancymaae"),
    ("nomascus_leucogenys", "Nomascus leucogenys"),
    ("lemur_catta", "Lemur catta"),
    ("daubentonia_madagascariensis", "Daubentonia madagascariensis"),
    ("tarsius_syrichta", "Tarsius syrichta"),
]

GENES = {
    "hoxa2": {
        "label": "nuclear HOXA2 coding sequence",
        "aliases": (
            "gene=HOXA2",
            "gene=hoxa2",
            "homeobox A2",
            "homeobox protein Hox-A2",
        ),
        "header_terms": (
            "hoxa2",
            "homeobox A2",
            "homeobox protein Hox-A2",
            "hox-a2",
        ),
        "terms": (
            "HOXA2[Gene] AND mRNA",
            "homeobox A2[Title] AND mRNA",
            "HOXA2[Gene] AND complete cds",
            "HOXA2[Gene]",
            "homeobox A2[Title]",
            "HOXA2[Title]",
        ),
        "min_len": 300,
    },
}


def http_get(url: str) -> str:
    for attempt in range(8):
        try:
            with urllib.request.urlopen(url, timeout=35) as response:
                return response.read().decode("utf-8", errors="replace")
        except Exception:
            time.sleep(1.2 + attempt * 0.6)
    raise RuntimeError(f"Failed URL: {url}")


def esearch_ids(term: str, retmax: int = 20) -> list[str]:
    enc = urllib.parse.quote(term)
    url = (
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
        f"?db=nucleotide&retmode=json&retmax={retmax}&sort=relevance&term={enc}"
    )
    data = json.loads(http_get(url))
    return data.get("esearchresult", {}).get("idlist", [])


def fetch_cds(nuccore_id: str) -> str:
    url = (
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
        f"?db=nucleotide&id={nuccore_id}&rettype=fasta_cds_na&retmode=text"
    )
    return http_get(url)


def fetch_fasta(nuccore_id: str) -> str:
    url = (
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
        f"?db=nucleotide&id={nuccore_id}&rettype=fasta&retmode=text"
    )
    return http_get(url)


def pick_gene_seq(cds_text: str, aliases: tuple[str, ...], min_len: int) -> str | None:
    aliases_lower = tuple(a.lower() for a in aliases)
    best = None

    records = cds_text.split("\n>")
    for record in records:
        record = record.lstrip(">")
        if not record.strip():
            continue
        lines = record.splitlines()
        header = lines[0]
        header_lower = header.lower()
        if not any(alias in header_lower for alias in aliases_lower):
            continue

        seq = re.sub(r"[^ACGTNacgtn]", "", "".join(lines[1:])).upper()
        if len(seq) < min_len:
            continue
        if best is None or len(seq) > len(best):
            best = seq

    return best


def pick_fasta_gene_region(
    fasta_text: str, header_terms: tuple[str, ...], min_len: int
) -> str | None:
    if not fasta_text.strip().startswith(">"):
        return None

    lines = fasta_text.splitlines()
    if not lines:
        return None

    header = lines[0].lstrip(">")
    header_lower = header.lower()
    if not any(term.lower() in header_lower for term in header_terms):
        return None

    seq = re.sub(r"[^ACGTNacgtn]", "", "".join(lines[1:])).upper()
    if len(seq) < min_len:
        return None
    return seq


def write_fasta(path: Path, header: str, sequence: str) -> None:
    with path.open("w", encoding="utf-8") as fasta:
        fasta.write(header + "\n")
        for i in range(0, len(sequence), 75):
            fasta.write(sequence[i : i + 75] + "\n")


def fetch_gene_for_species(
    species_name: str, gene_key: str, gene_info: dict
) -> tuple[str, str]:
    all_ids = []
    for term in gene_info["terms"]:
        query = f"{species_name}[Organism] AND {term}"
        ids = esearch_ids(query, retmax=20)
        for nuccore_id in ids:
            if nuccore_id not in all_ids:
                all_ids.append(nuccore_id)
        time.sleep(0.35)

    if not all_ids:
        raise RuntimeError(
            f"No nucleotide candidates found for {species_name} {gene_key.upper()}"
        )

    for nuccore_id in all_ids:
        cds_text = fetch_cds(nuccore_id)
        seq = pick_gene_seq(cds_text, gene_info["aliases"], gene_info["min_len"])
        if seq:
            return nuccore_id, seq

        fasta_text = fetch_fasta(nuccore_id)
        seq = pick_fasta_gene_region(
            fasta_text, gene_info["header_terms"], gene_info["min_len"]
        )
        if seq:
            return nuccore_id, seq

        time.sleep(0.2)

    raise RuntimeError(
        f"Could not extract {gene_key.upper()} CDS for {species_name}"
    )


def main() -> None:
    out_root = Path("fasta")
    for gene_key in GENES:
        (out_root / gene_key).mkdir(parents=True, exist_ok=True)

    for species_id, species_name in SPECIES:
        for gene_key, gene_info in GENES.items():
            output_path = out_root / gene_key / f"{species_id}.fasta"
            if output_path.exists():
                print(f"  [skip] {output_path} already exists")
                continue

            print(f"  Fetching {gene_key.upper()} for {species_name} ...", end=" ", flush=True)
            try:
                nuccore_id, seq = fetch_gene_for_species(
                    species_name, gene_key, gene_info
                )
                header = f">{species_name} | {species_id} | {gene_info['label']}"
                write_fasta(output_path, header, seq)
                print(f"OK  ({len(seq)} bp, accession {nuccore_id})")
            except RuntimeError as exc:
                print(f"FAIL – {exc}")
            time.sleep(0.4)


if __name__ == "__main__":
    main()
