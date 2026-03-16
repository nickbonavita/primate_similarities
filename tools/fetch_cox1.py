#!/usr/bin/env python3
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

species = [
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


def get(url: str) -> str:
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
    data = json.loads(get(url))
    idlist = data.get("esearchresult", {}).get("idlist", [])
    return idlist[0] if idlist else None


def fetch_cds(nuccore_id: str) -> str:
    url = (
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
        f"?db=nucleotide&id={nuccore_id}&rettype=fasta_cds_na&retmode=text"
    )
    return get(url)


def pick_cox1_seq(cds_text: str) -> str | None:
    records = cds_text.split("\n>")
    for record in records:
        record = record.lstrip(">")
        if not record.strip():
            continue
        lines = record.splitlines()
        header = lines[0]
        if any(
            key in header
            for key in (
                "gene=COX1",
                "gene=CO1",
                "gene=COI",
                "cytochrome c oxidase subunit I",
            )
        ):
            seq = re.sub(r"[^ACGTNacgtn]", "", "".join(lines[1:])).upper()
            if seq:
                return seq
    return None


def write_fasta(path: Path, header: str, sequence: str) -> None:
    with path.open("w", encoding="utf-8") as fasta:
        fasta.write(header + "\n")
        for i in range(0, len(sequence), 75):
            fasta.write(sequence[i : i + 75] + "\n")


def main() -> None:
    out_dir = Path("fasta/cox1")
    out_dir.mkdir(parents=True, exist_ok=True)

    for species_id, species_name in species:
        search_terms = [f"{species_name}[Organism] AND mitochondrion complete genome[Title]"]
        if species_id == "tarsius_syrichta":
            search_terms.append("Carlito syrichta[Organism] AND mitochondrion complete genome[Title]")

        nuccore_id = None
        for term in search_terms:
            nuccore_id = esearch_id(term)
            if nuccore_id:
                break
            time.sleep(0.8)

        if not nuccore_id:
            raise RuntimeError(f"Could not find mitochondrial genome for {species_id}")

        cox1_seq = pick_cox1_seq(fetch_cds(nuccore_id))
        if not cox1_seq:
            raise RuntimeError(f"Could not extract COX1 CDS for {species_id}")

        output_path = out_dir / f"{species_id}.fasta"
        header = f">{species_name} | {species_id} | mitochondrial COX1 gene"
        write_fasta(output_path, header, cox1_seq)
        print(f"{species_id}: nuccore={nuccore_id}, len={len(cox1_seq)}")
        time.sleep(0.9)


if __name__ == "__main__":
    main()
