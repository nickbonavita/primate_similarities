/**
 * Primate DNA Similarity
 * Loads FASTA files, computes percent-identity via global alignment,
 * and renders the interactive comparison UI.
 */

/* ── Primate catalogue ─────────────────────────────────────────────── */
const PRIMATES = [
  { id: "homo_sapiens",       common: "Human",               species: "Homo sapiens",        emoji: "🧑", photo: "assets/primates/homo_sapiens.jpg" },
  { id: "pan_troglodytes",    common: "Chimpanzee",           species: "Pan troglodytes",     emoji: "🐒", photo: "assets/primates/pan_troglodytes.jpg" },
  { id: "pan_paniscus",       common: "Bonobo",               species: "Pan paniscus",        emoji: "🐒", photo: "assets/primates/pan_paniscus.jpg" },
  { id: "gorilla_gorilla",    common: "Western Gorilla",      species: "Gorilla gorilla",     emoji: "🦍", photo: "assets/primates/gorilla_gorilla.jpg" },
  { id: "pongo_pygmaeus",     common: "Bornean Orangutan",    species: "Pongo pygmaeus",      emoji: "🦧", photo: "assets/primates/pongo_pygmaeus.jpg" },
  { id: "hylobates_lar",      common: "White-handed Gibbon",  species: "Hylobates lar",       emoji: "🐒", photo: "assets/primates/hylobates_lar.jpg" },
  { id: "macaca_mulatta",     common: "Rhesus Macaque",       species: "Macaca mulatta",      emoji: "🐵", photo: "assets/primates/macaca_mulatta.jpg" },
  { id: "papio_anubis",       common: "Olive Baboon",         species: "Papio anubis",        emoji: "🐵", photo: "assets/primates/papio_anubis.jpg" },
  { id: "callithrix_jacchus", common: "Common Marmoset",      species: "Callithrix jacchus",  emoji: "🐵", photo: "assets/primates/callithrix_jacchus.jpg" },
  { id: "lemur_catta",        common: "Ring-tailed Lemur",    species: "Lemur catta",         emoji: "🐾", photo: "assets/primates/lemur_catta.jpg" },
  { id: "tarsius_syrichta",   common: "Philippine Tarsier",   species: "Tarsius syrichta",    emoji: "👁️", photo: "assets/primates/tarsius_syrichta.jpg" },
];

const GENES = {
  cytb: {
    key: "cytb",
    label: "Mitochondrial Cytochrome b",
    folder: "fasta",
    note: "Sequences: partial mitochondrial cytochrome b gene (~405 bp)",
  },
  cox1: {
    key: "cox1",
    label: "Mitochondrial COX1",
    folder: "fasta/cox1",
    note: "Sequences: mitochondrial COX1 coding sequence (~1.5 kb)",
  },
};

/* ── State ──────────────────────────────────────────────────────────── */
const sequenceCache = {};   // "gene:id" → DNA string
const selected = [];        // 0, 1, or 2 primate ids
let selectedGene = "cytb";

/* ── DOM refs ───────────────────────────────────────────────────────── */
const grid       = document.getElementById("primate-grid");
const resultPanel = document.getElementById("result-content");
const statusBar  = document.getElementById("status-bar");
const geneSelect = document.getElementById("gene-select");
const sequenceNote = document.getElementById("sequence-note");

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

function updateUI() {
  const geneLabel = GENES[selectedGene].label;

  // Update card highlights
  document.querySelectorAll(".primate-card").forEach(card => {
    card.classList.toggle("selected", selected.includes(card.dataset.id));
  });

  // Update status bar
  if (selected.length === 0) {
    statusBar.textContent = `Gene: ${geneLabel}. Click a primate to select it, then click another to compare.`;
    statusBar.classList.remove("two-selected");
    showPlaceholder();
  } else if (selected.length === 1) {
    const p = PRIMATES.find(x => x.id === selected[0]);
    statusBar.textContent = `${p.common} selected for ${geneLabel}. Now select a second primate to compare.`;
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
function relationshipLabel(pct) {
  if (pct >= 99)   return "Virtually Identical";
  if (pct >= 97.5) return "Great Ape Relatives";
  if (pct >= 95)   return "Ape Relatives";
  if (pct >= 88)   return "Old World Monkeys";
  if (pct >= 82)   return "New World Monkeys";
  if (pct >= 78)   return "Strepsirrhine Primates";
  return "Distant Relatives";
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
  const rel = relationshipLabel(identity);
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
}

/* ── Init ────────────────────────────────────────────────────────────── */
geneSelect.addEventListener("change", () => {
  selectedGene = geneSelect.value;
  updateGeneContext();
  updateUI();
});

renderGrid();
updateGeneContext();
updateUI();
