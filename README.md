# Primate DNA Similarity 🧬

An interactive GitHub Pages website that compares mitochondrial DNA sequences across primates and displays percent identity between any two selected species.

**Live demo:** https://nickbonavita.github.io/primate_similarities/

---

## How it works

1. Pick a **gene target** from the dropdown (mitochondrial + nuclear options).
2. **Select** any two primates from the grid — selected cards highlight green.
3. The site **fetches** the corresponding `.fasta` file for each species from the selected gene folder.
4. A **Needleman-Wunsch global alignment** is run in the browser to compute percent identity.
5. The **similarity score**, match counts, and a taxonomy-based phylogenetic relationship label are shown in the side panel.

## Sequences

The app currently includes these gene targets:

- Mitochondrial cytochrome b coding sequence (`fasta/`, ~1.1 kb)
- Mitochondrial COX1 coding sequence (`fasta/cox1/`, ~1.5 kb)
- Mitochondrial COX2 coding sequence (`fasta/cox2/`, ~684 bp)
- Mitochondrial ND2 coding sequence (`fasta/nd2/`, ~1.0 kb)
- Mitochondrial ATP6 coding sequence (`fasta/atp6/`, ~681 bp)
- Nuclear RAG1 coding sequence (`fasta/rag1/`, typically ~3.1 kb)
- Nuclear IRBP/RBP3 coding sequence (`fasta/irbp/`, typically ~3.7 kb)

If a species sequence is unavailable for the currently selected gene, that species card is shown grayed out and cannot be selected.

Cytochrome b approximate similarity to Human:

| Common name | Species | Approx. similarity to Human |
|---|---|---|
| Human | *Homo sapiens* | — |
| Neanderthal | *Homo neanderthalensis* | ~99.5% |
| Chimpanzee | *Pan troglodytes* | 98.5% |
| Bonobo | *Pan paniscus* | 98.0% |
| Western Gorilla | *Gorilla gorilla* | 97.8% |
| Bornean Orangutan | *Pongo pygmaeus* | 96.5% |
| White-handed Gibbon | *Hylobates lar* | 96.0% |
| Rhesus Macaque | *Macaca mulatta* | 93.1% |
| Olive Baboon | *Papio anubis* | 92.6% |
| Common Marmoset | *Callithrix jacchus* | 88.9% |
| Ring-tailed Lemur | *Lemur catta* | 83.0% |
| Philippine Tarsier | *Tarsius syrichta* | 79.0% |

FASTA files live in `fasta/` and can be replaced with any `.fasta` sequences.
To add another gene target, create a new folder with one file per species named by id (for example `homo_sapiens.fasta`), add a matching option in `index.html`, and add a new gene entry in `script.js`.

## Files

```
index.html    – page structure
style.css     – dark-theme UI, card highlight, result panel
script.js     – FASTA loader, Needleman-Wunsch aligner, selection logic
fasta/        – one .fasta file per species
fasta/cox1/   – COX1 gene .fasta files for all species
fasta/cox2/   – COX2 gene .fasta files for all species
fasta/nd2/    – ND2 gene .fasta files for all species
fasta/atp6/   – ATP6 gene .fasta files for all species
fasta/rag1/   – RAG1 nuclear gene .fasta files (currently partial coverage)
fasta/irbp/   – IRBP/RBP3 nuclear gene .fasta files (currently partial coverage)
assets/       – local primate card photos used by the UI
tools/        – helper scripts for downloading gene FASTA sets
```
