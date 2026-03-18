#!/usr/bin/env python3
"""Fetch mitochondrial CDS genes for all primates in this project.

This script queries NCBI nuccore for each species' mitochondrial complete genome,
extracts CDS sequences using `rettype=fasta_cds_na`, and writes one FASTA file per
species for each configured gene.
"""

import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

SPECIES = [
    ("homo_sapiens", "Homo sapiens"),
    ("pan_troglodytes", "Pan troglodytes"),
    ("pan_paniscus", "Pan paniscus"),
    ("gorilla_gorilla", "Gorilla gorilla"),
    ("pongo_pygmaeus", "Pongo pygmaeus"),
    ("hylobates_lar", "Hylobates lar"),
    ("macaca_mulatta", "Macaca mulatta"),
    ("papio_anubis", "Papio anubis"),
    ("callithrix_jacchus", "Callithrix jacchus"),
    ("lemur_catta", "Lemur catta"),
    ("tarsius_syrichta", "Tarsius syrichta"),
]

GENES = {
    "cox2": {
        "label": "mitochondrial COX2 gene",
        "aliases": ("gene=COX2", "gene=COII", "cytochrome c oxidase subunit II"),
    },
    "nd2": {
        "label": "mitochondrial ND2 gene",
        "aliases": ("gene=ND2", "NADH dehydrogenase subunit 2"),
    },
    "atp6": {
        "label": "mitochondrial ATP6 gene",
        "aliases": ("gene=ATP6", "ATP synthase F0 subunit 6", "ATPase 6"),
    },
}


def http_get(url: str) -> str:
    for attempt in range(8):
        try:
            with urllib.request.urlopen(url, timeout=30) as response:
                return response.read().decode("utf-8", errors="replace")
        except Exception:
            time.sleep(1.2 + attempt * 0.6)
    raise RuntimeError(f"Failed URL: {url}")


def esearch_id(term: str) -> str | None:
    enc = urllib.parse.quote(term)
    url = (
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
        f"?db=nucleotide&retmode=json&retmax=1&sort=relevance&term={enc}"
    )
    data = json.loads(http_get(url))
    idlist = data.get("esearchresult", {}).get("idlist", [])
    return idlist[0] if idlist else None


def fetch_cds(nuccore_id: str) -> str:
    url = (
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
        f"?db=nucleotide&id={nuccore_id}&rettype=fasta_cds_na&retmode=text"
    )
    return http_get(url)


def pick_gene_seq(cds_text: str, aliases: tuple[str, ...]) -> str | None:
    records = cds_text.split("\n>")
    for record in records:
        record = record.lstrip(">")
        if not record.strip():
            continue
        lines = record.splitlines()
        header = lines[0]
        if any(alias in header for alias in aliases):
            seq = re.sub(r"[^ACGTNacgtn]", "", "".join(lines[1:])).upper()
            if seq:
                return seq
    return None


def write_fasta(path: Path, header: str, sequence: str) -> None:
    with path.open("w", encoding="utf-8") as fasta:
        fasta.write(header + "\n")
        for i in range(0, len(sequence), 75):
            fasta.write(sequence[i : i + 75] + "\n")


def find_mitogenome_id(species_id: str, species_name: str) -> str:
    search_terms = [f"{species_name}[Organism] AND mitochondrion complete genome[Title]"]
    if species_id == "tarsius_syrichta":
        search_terms.append("Carlito syrichta[Organism] AND mitochondrion complete genome[Title]")

    for term in search_terms:
        nuccore_id = esearch_id(term)
        if nuccore_id:
            return nuccore_id
        time.sleep(0.8)

    raise RuntimeError(f"Could not find mitochondrial genome for {species_id}")


def main() -> None:
    out_root = Path("fasta")
    for gene_key in GENES:
        (out_root / gene_key).mkdir(parents=True, exist_ok=True)

    for species_id, species_name in SPECIES:
        nuccore_id = find_mitogenome_id(species_id, species_name)
        cds_text = fetch_cds(nuccore_id)

        for gene_key, gene_info in GENES.items():
            seq = pick_gene_seq(cds_text, gene_info["aliases"])
            if not seq:
                raise RuntimeError(f"Could not extract {gene_key.upper()} for {species_id}")

            output_path = out_root / gene_key / f"{species_id}.fasta"
            header = f">{species_name} | {species_id} | {gene_info['label']}"
            write_fasta(output_path, header, seq)
            print(f"{gene_key}:{species_id}: nuccore={nuccore_id}, len={len(seq)}")

        time.sleep(0.9)


if __name__ == "__main__":
    main()
