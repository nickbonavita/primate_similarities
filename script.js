/**
 * Primate DNA Similarity
 * Loads FASTA files, computes percent-identity via global alignment,
 * and renders the interactive comparison UI.
 */

/* ── Primate catalogue ─────────────────────────────────────────────── */
const PRIMATES = [
  { id: "homo_sapiens",              common: "Human",               species: "Homo sapiens",              emoji: "🧑", photo: "assets/primates/homo_sapiens.jpg" },
  { id: "homo_neanderthalensis",     common: "Neanderthal",          species: "Homo neanderthalensis",     emoji: "🦴", photo: "assets/primates/homo_neanderthalensis.jpg" },
  { id: "homo_denisova",             common: "Denisovan",            species: "Homo sp. Altai (Denisovan)", emoji: "🦴", photo: "assets/primates/homo_denisova.jpg" },
  { id: "pan_troglodytes",           common: "Chimpanzee",           species: "Pan troglodytes",           emoji: "🐒", photo: "assets/primates/pan_troglodytes.jpg" },
  { id: "pan_paniscus",       common: "Bonobo",               species: "Pan paniscus",        emoji: "🐒", photo: "assets/primates/pan_paniscus.jpg" },
  { id: "gorilla_gorilla",    common: "Western Gorilla",      species: "Gorilla gorilla",     emoji: "🦍", photo: "assets/primates/gorilla_gorilla.jpg" },
  { id: "pongo_pygmaeus",     common: "Bornean Orangutan",    species: "Pongo pygmaeus",      emoji: "🦧", photo: "assets/primates/pongo_pygmaeus.jpg" },
  { id: "hylobates_lar",      common: "White-handed Gibbon",  species: "Hylobates lar",       emoji: "🐒", photo: "assets/primates/hylobates_lar.jpg" },
  { id: "macaca_mulatta",     common: "Rhesus Macaque",       species: "Macaca mulatta",      emoji: "🐵", photo: "assets/primates/macaca_mulatta.jpg" },
  { id: "papio_anubis",       common: "Olive Baboon",         species: "Papio anubis",        emoji: "🐵", photo: "assets/primates/papio_anubis.jpg" },
  { id: "mandrillus_sphinx",  common: "Mandrill",             species: "Mandrillus sphinx",   emoji: "🐵", photo: "assets/primates/mandrillus_sphinx.jpg" },
  { id: "chlorocebus_sabaeus", common: "Green Monkey",        species: "Chlorocebus sabaeus", emoji: "🐒", photo: "assets/primates/chlorocebus_sabaeus.jpg" },
  { id: "callithrix_jacchus", common: "Common Marmoset",      species: "Callithrix jacchus",  emoji: "🐵", photo: "assets/primates/callithrix_jacchus.jpg" },
  { id: "saimiri_boliviensis", common: "Squirrel Monkey",     species: "Saimiri boliviensis", emoji: "🐒", photo: "assets/primates/saimiri_boliviensis.jpg" },
  { id: "aotus_nancymaae",   common: "Owl Monkey",            species: "Aotus nancymaae",    emoji: "🐒", photo: "assets/primates/aotus_nancymaae.jpg" },
  { id: "nomascus_leucogenys", common: "N. White-cheeked Gibbon", species: "Nomascus leucogenys", emoji: "🐒", photo: "assets/primates/nomascus_leucogenys.jpg" },
  { id: "lemur_catta",        common: "Ring-tailed Lemur",    species: "Lemur catta",         emoji: "🐾", photo: "assets/primates/lemur_catta.jpg" },
  { id: "daubentonia_madagascariensis", common: "Aye-aye",    species: "Daubentonia madagascariensis", emoji: "🐾", photo: "assets/primates/daubentonia_madagascariensis.jpg" },
  { id: "tarsius_syrichta",   common: "Philippine Tarsier",   species: "Tarsius syrichta",    emoji: "👁️", photo: "assets/primates/tarsius_syrichta.jpg" },
];

const TAXONOMY = {
  homo_sapiens:           { order: "Primates", suborder: "Haplorhini", infraorder: "Simiiformes", parvorder: "Catarrhini", superfamily: "Hominoidea", family: "Hominidae", subfamily: "Homininae", tribe: "Hominini", genus: "Homo" },
  homo_neanderthalensis:  { order: "Primates", suborder: "Haplorhini", infraorder: "Simiiformes", parvorder: "Catarrhini", superfamily: "Hominoidea", family: "Hominidae", subfamily: "Homininae", tribe: "Hominini", genus: "Homo" },
  homo_denisova:          { order: "Primates", suborder: "Haplorhini", infraorder: "Simiiformes", parvorder: "Catarrhini", superfamily: "Hominoidea", family: "Hominidae", subfamily: "Homininae", tribe: "Hominini", genus: "Homo" },
  pan_troglodytes:        { order: "Primates", suborder: "Haplorhini", infraorder: "Simiiformes", parvorder: "Catarrhini", superfamily: "Hominoidea", family: "Hominidae", subfamily: "Homininae", tribe: "Hominini", genus: "Pan" },
  pan_paniscus:           { order: "Primates", suborder: "Haplorhini", infraorder: "Simiiformes", parvorder: "Catarrhini", superfamily: "Hominoidea", family: "Hominidae", subfamily: "Homininae", tribe: "Hominini", genus: "Pan" },
  gorilla_gorilla:        { order: "Primates", suborder: "Haplorhini", infraorder: "Simiiformes", parvorder: "Catarrhini", superfamily: "Hominoidea", family: "Hominidae", subfamily: "Homininae", tribe: "Gorillini", genus: "Gorilla" },
  pongo_pygmaeus:         { order: "Primates", suborder: "Haplorhini", infraorder: "Simiiformes", parvorder: "Catarrhini", superfamily: "Hominoidea", family: "Hominidae", subfamily: "Ponginae",   tribe: null,        genus: "Pongo" },
  hylobates_lar:          { order: "Primates", suborder: "Haplorhini", infraorder: "Simiiformes", parvorder: "Catarrhini", superfamily: "Hominoidea", family: "Hylobatidae", subfamily: null,        tribe: null,        genus: "Hylobates" },
  macaca_mulatta:         { order: "Primates", suborder: "Haplorhini", infraorder: "Simiiformes", parvorder: "Catarrhini", superfamily: null,          family: "Cercopithecidae", subfamily: "Cercopithecinae", tribe: "Papionini",       genus: "Macaca" },
  papio_anubis:           { order: "Primates", suborder: "Haplorhini", infraorder: "Simiiformes", parvorder: "Catarrhini", superfamily: null,          family: "Cercopithecidae", subfamily: "Cercopithecinae", tribe: "Papionini",       genus: "Papio" },
  mandrillus_sphinx:      { order: "Primates", suborder: "Haplorhini", infraorder: "Simiiformes", parvorder: "Catarrhini", superfamily: null,          family: "Cercopithecidae", subfamily: "Cercopithecinae", tribe: "Papionini",       genus: "Mandrillus" },
  chlorocebus_sabaeus:    { order: "Primates", suborder: "Haplorhini", infraorder: "Simiiformes", parvorder: "Catarrhini", superfamily: null,          family: "Cercopithecidae", subfamily: "Cercopithecinae", tribe: "Cercopithecini",  genus: "Chlorocebus" },
  callithrix_jacchus:     { order: "Primates", suborder: "Haplorhini", infraorder: "Simiiformes", parvorder: "Platyrrhini", superfamily: null,         family: "Callitrichidae",  subfamily: null,        tribe: null,        genus: "Callithrix" },
  saimiri_boliviensis:    { order: "Primates", suborder: "Haplorhini", infraorder: "Simiiformes", parvorder: "Platyrrhini", superfamily: null,         family: "Cebidae",         subfamily: "Saimiriinae",  tribe: null,        genus: "Saimiri" },
  aotus_nancymaae:        { order: "Primates", suborder: "Haplorhini", infraorder: "Simiiformes", parvorder: "Platyrrhini", superfamily: null,         family: "Aotidae",         subfamily: null,        tribe: null,        genus: "Aotus" },
  nomascus_leucogenys:    { order: "Primates", suborder: "Haplorhini", infraorder: "Simiiformes", parvorder: "Catarrhini", superfamily: "Hominoidea", family: "Hylobatidae",  subfamily: null,        tribe: null,        genus: "Nomascus" },
  lemur_catta:            { order: "Primates", suborder: "Strepsirrhini", infraorder: null,        parvorder: null,         superfamily: null,          family: "Lemuridae",       subfamily: null,        tribe: null,        genus: "Lemur" },
  daubentonia_madagascariensis: { order: "Primates", suborder: "Strepsirrhini", infraorder: null, parvorder: null,         superfamily: null,          family: "Daubentoniidae",  subfamily: null,        tribe: null,        genus: "Daubentonia" },
  tarsius_syrichta:       { order: "Primates", suborder: "Haplorhini",    infraorder: "Tarsiiformes", parvorder: null,      superfamily: null,          family: "Tarsiidae",       subfamily: null,        tribe: null,        genus: "Tarsius" },
};

const GENES = {
  cytb: {
    key: "cytb",
    label: "Mitochondrial Cytochrome b",
    folder: "fasta",
    note: "Sequences: mitochondrial cytochrome b coding sequence (~1.1 kb)",
    description: "Cytochrome b is one of the most widely used genes in animal phylogenetics. Located in the mitochondrial genome, it encodes part of the electron transport chain (Complex III). Because it evolves at a moderate rate, it is ideal for comparing species that diverged millions of years ago, making it a workhorse of primate systematics.",
  },
  cox1: {
    key: "cox1",
    label: "Mitochondrial COX1",
    folder: "fasta/cox1",
    note: "Sequences: mitochondrial COX1 coding sequence (~1.5 kb)",
    description: "COX1 (cytochrome c oxidase subunit I) is the standard gene used in DNA barcoding across the animal kingdom. It encodes a key subunit of Complex IV in the mitochondrial electron transport chain. Its high conservation makes it excellent for species identification, while enough variation remains to distinguish closely related species.",
  },
  cox2: {
    key: "cox2",
    label: "Mitochondrial COX2",
    folder: "fasta/cox2",
    note: "Sequences: mitochondrial COX2 coding sequence (~684 bp)",
    description: "COX2 (cytochrome c oxidase subunit II) encodes another essential subunit of Complex IV, the final enzyme in the mitochondrial respiratory chain. It is frequently used alongside COX1 in phylogenetic analyses and evolves at a slightly faster rate, providing additional resolution for distinguishing primate lineages.",
  },
  nd2: {
    key: "nd2",
    label: "Mitochondrial ND2",
    folder: "fasta/nd2",
    note: "Sequences: mitochondrial ND2 coding sequence (~1.0 kb)",
    description: "ND2 (NADH dehydrogenase subunit 2) is part of Complex I in the mitochondrial electron transport chain. It is one of the faster-evolving mitochondrial protein-coding genes, making it particularly useful for resolving relationships among recently diverged species and for population-level studies.",
  },
  atp6: {
    key: "atp6",
    label: "Mitochondrial ATP6",
    folder: "fasta/atp6",
    note: "Sequences: mitochondrial ATP6 coding sequence (~681 bp)",
    description: "ATP6 (ATP synthase F0 subunit 6) encodes a component of the mitochondrial ATP synthase complex, which generates the cell\u2019s energy currency. Mutations in this gene have been linked to human mitochondrial diseases. Its moderate evolutionary rate makes it a reliable marker for primate divergence studies.",
  },
  rag1: {
    key: "rag1",
    label: "Nuclear RAG1",
    folder: "fasta/rag1",
    note: "Sequences: nuclear RAG1 coding sequence (typically ~3.1 kb; some partial records)",
    description: "RAG1 (recombination activating gene 1) is a nuclear gene essential for V(D)J recombination in the immune system \u2014 the process that generates antibody and T-cell receptor diversity. Because it is single-copy, slowly evolving, and found in all jawed vertebrates, it is one of the most important nuclear markers for deep phylogenetic studies.",
  },
  irbp: {
    key: "irbp",
    label: "Nuclear IRBP (RBP3)",
    folder: "fasta/irbp",
    note: "Sequences: nuclear IRBP/RBP3 coding sequence (typically ~3.7 kb; some species may be unavailable)",
    description: "IRBP (interphotoreceptor retinoid-binding protein, also called RBP3) is a nuclear gene expressed in the retina that transports retinoids between photoreceptor cells and the retinal pigment epithelium. It is widely used in mammalian phylogenetics because its large size and steady evolutionary rate provide strong signal for resolving both deep and recent divergences.",
  },
  nd1: {
    key: "nd1",
    label: "Mitochondrial ND1",
    folder: "fasta/nd1",
    note: "Sequences: mitochondrial ND1 coding sequence (~956 bp)",
    description: "ND1 (NADH dehydrogenase subunit 1) is the first protein-coding gene encountered on the heavy strand of the mitochondrial genome. It encodes a core subunit of Complex I, the largest enzyme in the respiratory chain. ND1 evolves at a moderate rate and is commonly used in primate phylogenetics alongside other mitochondrial markers.",
  },
  cox3: {
    key: "cox3",
    label: "Mitochondrial COX3",
    folder: "fasta/cox3",
    note: "Sequences: mitochondrial COX3 coding sequence (~784 bp)",
    description: "COX3 (cytochrome c oxidase subunit III) encodes the third subunit of Complex IV, the terminal enzyme of the mitochondrial electron transport chain. Together with COX1 and COX2, it forms the catalytic core that transfers electrons to oxygen. COX3 provides useful phylogenetic signal at both genus and family levels in primates.",
  },
  nd4: {
    key: "nd4",
    label: "Mitochondrial ND4",
    folder: "fasta/nd4",
    note: "Sequences: mitochondrial ND4 coding sequence (~1.4 kb)",
    description: "ND4 (NADH dehydrogenase subunit 4) is one of the larger mitochondrial protein-coding genes, encoding a membrane-arm subunit of Complex I. It is frequently used in studies of primate evolution and population genetics. Mutations in ND4 have been associated with Leber hereditary optic neuropathy in humans.",
  },
  nd5: {
    key: "nd5",
    label: "Mitochondrial ND5",
    folder: "fasta/nd5",
    note: "Sequences: mitochondrial ND5 coding sequence (~1.8 kb)",
    description: "ND5 (NADH dehydrogenase subunit 5) is the largest protein-coding gene in the mitochondrial genome. It encodes a key subunit at the tip of the membrane arm of Complex I that acts as a proton pump. Its large size provides abundant phylogenetic information, making it one of the most powerful single mitochondrial markers for resolving primate relationships.",
  },
  nd6: {
    key: "nd6",
    label: "Mitochondrial ND6",
    folder: "fasta/nd6",
    note: "Sequences: mitochondrial ND6 coding sequence (~525 bp)",
    description: "ND6 (NADH dehydrogenase subunit 6) is unique among mitochondrial protein-coding genes because it is the only one encoded on the light (L) strand. It encodes a subunit of Complex I involved in proton translocation. Its unusual strand placement gives it a distinct base-composition bias, which can provide complementary phylogenetic insights.",
  },
  hoxa2: {
    key: "hoxa2",
    label: "Nuclear HOXA2",
    folder: "fasta/hoxa2",
    note: "Sequences: nuclear HOXA2 coding sequence (~1.1 kb; some species may be unavailable)",
    description: "HOXA2 (homeobox A2) is a member of the HOX gene family — master regulators of body patterning during embryonic development. Located in the HOXA cluster on chromosome 7, HOXA2 plays a critical role in hindbrain segmentation and craniofacial morphogenesis. HOX genes are among the most conserved in the animal kingdom, and comparing HOXA2 across primates reveals the deep evolutionary constraints on developmental programs that shape anatomy.",
  },
  cytc: {
    key: "cytc",
    label: "Nuclear Cytochrome c (CYCS)",
    folder: "fasta/cytc",
    note: "Sequences: nuclear cytochrome c (CYCS) coding sequence (~318 bp)",
    description: "Cytochrome c is one of the most highly conserved proteins in all of eukaryote evolution — some positions have not changed in over a billion years. It is a small electron-carrier protein essential for mitochondrial oxidative phosphorylation and for triggering apoptosis. The 1967 study by Fitch & Margoliash using cytochrome c sequences was the first molecular phylogenetic analysis, making it an icon of evolutionary biology. Because it is so conserved across primates, even tiny differences are phylogenetically informative.",
  },
};

/* ── State ──────────────────────────────────────────────────────────── */
const sequenceCache = {};   // "gene:id" → DNA string
const availabilityCache = {}; // gene → { id: boolean }
const selected = [];        // 0, 1, or 2 primate ids
let selectedGene = "cytb";

/* ── DOM refs ───────────────────────────────────────────────────────── */
const grid       = document.getElementById("primate-grid");
const resultPanel = document.getElementById("result-content");
const statusBar  = document.getElementById("status-bar");
const geneSelect = document.getElementById("gene-select");
const sequenceNote = document.getElementById("sequence-note");
const geneInfoTitle = document.getElementById("gene-info-title");
const geneInfoText  = document.getElementById("gene-info-text");

/* ── Render primate cards ───────────────────────────────────────────── */
function renderGrid() {
  PRIMATES.forEach(p => {
    const card = document.createElement("div");
    card.className = "primate-card";
    card.setAttribute("role", "listitem");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `${p.common} (${p.species})`);
    card.dataset.id = p.id;
    card.innerHTML = `
      <img class="card-photo" src="${p.photo}" alt="${p.common}" loading="lazy" />
      <span class="card-common">${p.common}</span>
      <span class="card-species">${p.species}</span>
      <span class="card-unavailable" aria-hidden="true">No sequence</span>
      <span class="card-check" aria-hidden="true">✓</span>
    `;
    const img = card.querySelector(".card-photo");
    img.addEventListener("error", () => {
      img.remove();
      const fallback = document.createElement("span");
      fallback.className = "card-emoji-fallback";
      fallback.textContent = p.emoji;
      card.prepend(fallback);
    });
    card.addEventListener("click", () => toggleSelection(p.id));
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSelection(p.id); }
    });
    grid.appendChild(card);
  });
}

/* ── Selection logic ────────────────────────────────────────────────── */
function toggleSelection(id) {
  if (!isGeneAvailableForSpecies(selectedGene, id)) return;

  const idx = selected.indexOf(id);
  if (idx !== -1) {
    // deselect
    selected.splice(idx, 1);
  } else if (selected.length < 2) {
    selected.push(id);
  } else {
    // replace the first selection with the new one
    selected.shift();
    selected.push(id);
  }
  updateUI();
}

function isGeneAvailableForSpecies(geneKey, id) {
  const availability = availabilityCache[geneKey];
  if (!availability) return true;
  return availability[id] !== false;
}

async function ensureGeneAvailability(geneKey) {
  if (availabilityCache[geneKey]) return availabilityCache[geneKey];

  const results = {};
  await Promise.all(PRIMATES.map(async p => {
    const url = `${GENES[geneKey].folder}/${p.id}.fasta`;
    let ok = false;

    try {
      const headResp = await fetch(url, { method: "HEAD" });
      if (headResp.ok) {
        ok = true;
      } else if (headResp.status === 405 || headResp.status === 501) {
        const getResp = await fetch(url);
        ok = getResp.ok;
      }
    } catch {
      ok = false;
    }

    results[p.id] = ok;
  }));

  availabilityCache[geneKey] = results;
  return results;
}

function applyGeneAvailabilityToCards() {
  const availability = availabilityCache[selectedGene] || null;
  let unavailableCount = 0;

  document.querySelectorAll(".primate-card").forEach(card => {
    const id = card.dataset.id;
    const available = availability ? availability[id] !== false : true;

    card.classList.toggle("unavailable", !available);
    card.setAttribute("aria-disabled", String(!available));
    card.setAttribute("tabindex", available ? "0" : "-1");

    if (!available) unavailableCount++;
  });

  for (let i = selected.length - 1; i >= 0; i--) {
    if (!isGeneAvailableForSpecies(selectedGene, selected[i])) {
      selected.splice(i, 1);
    }
  }

  return unavailableCount;
}

function updateUI() {
  const geneLabel = GENES[selectedGene].label;
  const unavailableCount = applyGeneAvailabilityToCards();
  const unavailableNote = unavailableCount > 0
    ? ` ${unavailableCount} species are unavailable for this gene and shown in gray.`
    : "";

  // Update card highlights
  document.querySelectorAll(".primate-card").forEach(card => {
    card.classList.toggle("selected", selected.includes(card.dataset.id));
  });

  // Update status bar
  if (selected.length === 0) {
    statusBar.textContent = `Gene: ${geneLabel}. Click a primate to select it, then click another to compare.${unavailableNote}`;
    statusBar.classList.remove("two-selected");
    showPlaceholder();
  } else if (selected.length === 1) {
    const p = PRIMATES.find(x => x.id === selected[0]);
    statusBar.textContent = `${p.common} selected for ${geneLabel}. Now select a second primate to compare.${unavailableNote}`;
    statusBar.classList.remove("two-selected");
    showPlaceholder();
  } else {
    statusBar.classList.add("two-selected");
    const [a, b] = selected.map(id => PRIMATES.find(x => x.id === id));
    statusBar.textContent = `Comparing ${geneLabel} for ${a.common} and ${b.common}…`;
    computeAndShow(selected[0], selected[1]);
  }
}

/* ── Placeholder ────────────────────────────────────────────────────── */
function showPlaceholder() {
  resultPanel.className = "result-placeholder";
  resultPanel.innerHTML = `<span class="dna-icon">🔬</span><p>Select two primates<br/>to compare ${GENES[selectedGene].label}</p>`;
}

function showLoading() {
  resultPanel.className = "";
  resultPanel.innerHTML = `<p class="loading-msg">Loading sequences…</p>`;
}

function showError(msg) {
  resultPanel.className = "";
  resultPanel.innerHTML = `<p class="error-msg">⚠️ ${msg}</p>`;
}

/* ── FASTA loading & parsing ────────────────────────────────────────── */
async function loadSequence(id) {
  const cacheKey = `${selectedGene}:${id}`;
  if (sequenceCache[cacheKey]) return sequenceCache[cacheKey];
  const url = `${GENES[selectedGene].folder}/${id}.fasta`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Could not fetch ${url} (${resp.status})`);
  const text = await resp.text();
  const seq = parseFasta(text);
  if (!seq) throw new Error(`No sequence found in ${url}`);
  sequenceCache[cacheKey] = seq;
  return seq;
}

/**
 * Parse first sequence from a (possibly multi-record) FASTA string.
 * Returns the DNA string in uppercase, with whitespace and non-ACGTN stripped.
 */
function parseFasta(text) {
  const lines = text.split(/\r?\n/);
  let seq = "";
  let inSeq = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith(">")) { inSeq = true; continue; }
    if (inSeq) seq += trimmed.replace(/[^ACGTNacgtn]/g, "");
  }
  return seq.toUpperCase() || null;
}

/* ── Percent-identity (global alignment via Needleman-Wunsch) ───────── */
/**
 * Compute percent identity between two sequences using Needleman-Wunsch
 * global alignment with affine-like parameters.
 * Returns { identity, matches, aligned }.
 *
 * For sequences ≤ 1000 bp this runs in <100 ms in the browser.
 */
function percentIdentity(seqA, seqB) {
  const MATCH    =  1;
  const MISMATCH = -1;
  const GAP      = -2;

  const m = seqA.length;
  const n = seqB.length;

  // DP matrix (flat array for memory efficiency)
  const dp = new Int16Array((m + 1) * (n + 1));

  for (let i = 0; i <= m; i++) dp[i * (n + 1)] = i * GAP;
  for (let j = 0; j <= n; j++) dp[j]           = j * GAP;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const score = seqA[i - 1] === seqB[j - 1] ? MATCH : MISMATCH;
      dp[i * (n + 1) + j] = Math.max(
        dp[(i - 1) * (n + 1) + (j - 1)] + score,
        dp[(i - 1) * (n + 1) + j] + GAP,
        dp[i * (n + 1) + (j - 1)] + GAP
      );
    }
  }

  // Traceback
  let i = m, j = n, matches = 0, aligned = 0;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const score = seqA[i - 1] === seqB[j - 1] ? MATCH : MISMATCH;
      if (dp[i * (n + 1) + j] === dp[(i - 1) * (n + 1) + (j - 1)] + score) {
        if (seqA[i - 1] === seqB[j - 1]) matches++;
        aligned++;
        i--; j--;
        continue;
      }
    }
    if (i > 0 && dp[i * (n + 1) + j] === dp[(i - 1) * (n + 1) + j] + GAP) {
      aligned++;
      i--;
    } else {
      aligned++;
      j--;
    }
  }

  const identity = aligned > 0 ? (matches / aligned) * 100 : 0;
  return { identity, matches, aligned };
}

/* ── Relationship label ─────────────────────────────────────────────── */
/**
 * Return the most specific shared taxonomic rank between two species.
 * Walks from genus up through tribe, subfamily, family, superfamily,
 * parvorder, infraorder, suborder, to order.
 */
function relationshipLabel(idA, idB, pct) {
  if (idA === idB || pct >= 99.9) return "Virtually Identical";

  const a = TAXONOMY[idA];
  const b = TAXONOMY[idB];
  if (!a || !b) return "Order: Primates";

  /* Ordered from most specific to least specific */
  const ranks = [
    { key: "genus",       label: "Genus" },
    { key: "tribe",       label: "Tribe" },
    { key: "subfamily",   label: "Subfamily" },
    { key: "family",      label: "Family" },
    { key: "superfamily",  label: "Superfamily" },
    { key: "parvorder",   label: "Parvorder" },
    { key: "infraorder",  label: "Infraorder" },
    { key: "suborder",    label: "Suborder" },
  ];

  for (const { key, label } of ranks) {
    const va = a[key];
    const vb = b[key];
    if (va && vb && va === vb) {
      return `${label}: ${va}`;
    }
  }

  return "Order: Primates";
}

/* ── Main comparison flow ───────────────────────────────────────────── */
async function computeAndShow(idA, idB) {
  showLoading();
  try {
    const [seqA, seqB] = await Promise.all([loadSequence(idA), loadSequence(idB)]);
    const { identity, matches, aligned } = percentIdentity(seqA, seqB);
    const pA = PRIMATES.find(x => x.id === idA);
    const pB = PRIMATES.find(x => x.id === idB);
    renderResult(pA, pB, identity, matches, aligned);
  } catch (err) {
    showError(err.message);
  }
}

/* ── Result rendering ───────────────────────────────────────────────── */
function renderResult(pA, pB, identity, matches, aligned) {
  const pct = identity.toFixed(1);
  const rel = relationshipLabel(pA.id, pB.id, identity);
  const barWidth = identity.toFixed(2);
  const geneLabel = GENES[selectedGene].label;

  resultPanel.className = "result-data";
  resultPanel.innerHTML = `
    <div class="result-species">
      <div class="result-species-item">
        <span class="species-dot"></span>
        <div>
          <div class="species-name">${pA.emoji} ${pA.common}</div>
          <div class="species-sci">${pA.species}</div>
        </div>
      </div>
      <div class="result-species-item">
        <span class="species-dot"></span>
        <div>
          <div class="species-name">${pB.emoji} ${pB.common}</div>
          <div class="species-sci">${pB.species}</div>
        </div>
      </div>
    </div>

    <hr class="result-divider" />

    <div class="similarity-block">
      <div class="similarity-label">${geneLabel} Similarity</div>
      <div class="similarity-value">${pct}<span class="similarity-suffix">%</span></div>
      <div class="similarity-plain">${geneLabel}: <strong>${pct}%</strong></div>
      <div class="progress-wrap" aria-label="${pct}% similarity">
        <div class="progress-fill" style="width:${barWidth}%"></div>
      </div>
    </div>

    <span class="relationship">${rel}</span>

    <div class="bases-compared">${matches.toLocaleString()} matching / ${aligned.toLocaleString()} aligned bases</div>
  `;
}

function updateGeneContext() {
  sequenceNote.innerHTML = `${GENES[selectedGene].note} &bull; Similarity computed via percent identity after global alignment`;
  geneInfoTitle.textContent = GENES[selectedGene].label;
  geneInfoText.textContent = GENES[selectedGene].description;
}

/* ── Init ────────────────────────────────────────────────────────────── */
geneSelect.addEventListener("change", () => {
  const geneKey = geneSelect.value;
  selectedGene = geneKey;
  updateGeneContext();
  statusBar.textContent = `Checking available ${GENES[geneKey].label} sequences…`;
  ensureGeneAvailability(geneKey).then(() => {
    if (selectedGene === geneKey) updateUI();
  });
});

async function initApp() {
  renderGrid();
  updateGeneContext();
  await ensureGeneAvailability(selectedGene);
  updateUI();
}

initApp();
