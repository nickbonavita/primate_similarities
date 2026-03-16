# Primate DNA Similarity 🧬

An interactive GitHub Pages website that compares mitochondrial DNA sequences across primates and displays percent identity between any two selected species.

**Live demo:** https://nickbonavita.github.io/primate_similarities/

---

## How it works

1. **Select** any two primates from the grid — selected cards highlight green.
2. The site **fetches** the corresponding `.fasta` file for each species from `fasta/`.
3. A **Needleman-Wunsch global alignment** is run in the browser to compute percent identity.
4. The **similarity score**, match counts, and a phylogenetic relationship label are shown in the side panel.

## Sequences

Partial mitochondrial cytochrome b gene (~405 bp) for 11 primate species:

| Common name | Species | Approx. similarity to Human |
|---|---|---|
| Human | *Homo sapiens* | — |
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

FASTA files live in `fasta/` and can be replaced with any `.fasta` sequences —
the site will automatically use them for comparison.

## Files

```
index.html    – page structure
style.css     – dark-theme UI, card highlight, result panel
script.js     – FASTA loader, Needleman-Wunsch aligner, selection logic
fasta/        – one .fasta file per species
```
