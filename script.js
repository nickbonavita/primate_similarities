/* ── Primate data ─────────────────────────────────────────────── */
const PRIMATES = [
  { id: "human",          common: "Human",           species: "Homo sapiens",          emoji: "🧑" },
  { id: "chimp",          common: "Chimpanzee",      species: "Pan troglodytes",        emoji: "🐒" },
  { id: "bonobo",         common: "Bonobo",          species: "Pan paniscus",           emoji: "🐒" },
  { id: "gorilla",        common: "Gorilla",         species: "Gorilla gorilla",        emoji: "🦍" },
  { id: "orangutan",      common: "Orangutan",       species: "Pongo pygmaeus",         emoji: "🦧" },
  { id: "gibbon",         common: "Gibbon",          species: "Hylobates lar",          emoji: "🐒" },
  { id: "macaque",        common: "Macaque",         species: "Macaca mulatta",         emoji: "🐵" },
  { id: "baboon",         common: "Baboon",          species: "Papio anubis",           emoji: "🐵" },
  { id: "mandrill",       common: "Mandrill",        species: "Mandrillus sphinx",      emoji: "🐵" },
  { id: "capuchin",       common: "Capuchin",        species: "Cebus capucinus",        emoji: "🐒" },
  { id: "spider_monkey",  common: "Spider Monkey",   species: "Ateles geoffroyi",       emoji: "🐒" },
  { id: "marmoset",       common: "Marmoset",        species: "Callithrix jacchus",     emoji: "🐒" },
  { id: "squirrel_monkey",common: "Squirrel Monkey", species: "Saimiri sciureus",       emoji: "🐒" },
  { id: "lemur",          common: "Ring-tailed Lemur",species: "Lemur catta",           emoji: "🐾" },
  { id: "tarsier",        common: "Tarsier",         species: "Tarsius syrichta",       emoji: "🐾" },
];

/*
 * Pairwise DNA similarity percentages based on published genomic comparisons.
 * Sources: Ensembl, UCSC Genome Browser, peer-reviewed literature.
 * Values are approximate whole-genome sequence identities (%).
 * The matrix is symmetric; only the upper triangle is listed.
 */
const SIMILARITY = {
  human_chimp:           98.7,
  human_bonobo:          98.7,
  human_gorilla:         98.3,
  human_orangutan:       96.9,
  human_gibbon:          96.4,
  human_macaque:         93.5,
  human_baboon:          93.0,
  human_mandrill:        92.8,
  human_capuchin:        91.0,
  human_spider_monkey:   91.2,
  human_marmoset:        90.0,
  human_squirrel_monkey: 90.5,
  human_lemur:           78.0,
  human_tarsier:         82.5,

  chimp_bonobo:           99.6,
  chimp_gorilla:          98.7,
  chimp_orangutan:        97.0,
  chimp_gibbon:           96.7,
  chimp_macaque:          93.7,
  chimp_baboon:           93.2,
  chimp_mandrill:         93.0,
  chimp_capuchin:         91.2,
  chimp_spider_monkey:    91.4,
  chimp_marmoset:         90.2,
  chimp_squirrel_monkey:  90.7,
  chimp_lemur:            78.2,
  chimp_tarsier:          82.7,

  bonobo_gorilla:          98.6,
  bonobo_orangutan:        97.0,
  bonobo_gibbon:           96.6,
  bonobo_macaque:          93.6,
  bonobo_baboon:           93.1,
  bonobo_mandrill:         92.9,
  bonobo_capuchin:         91.1,
  bonobo_spider_monkey:    91.3,
  bonobo_marmoset:         90.1,
  bonobo_squirrel_monkey:  90.6,
  bonobo_lemur:            78.1,
  bonobo_tarsier:          82.6,

  gorilla_orangutan:        96.6,
  gorilla_gibbon:           96.3,
  gorilla_macaque:          93.4,
  gorilla_baboon:           93.0,
  gorilla_mandrill:         92.7,
  gorilla_capuchin:         90.9,
  gorilla_spider_monkey:    91.1,
  gorilla_marmoset:         89.9,
  gorilla_squirrel_monkey:  90.4,
  gorilla_lemur:            77.9,
  gorilla_tarsier:          82.4,

  orangutan_gibbon:          96.8,
  orangutan_macaque:         93.0,
  orangutan_baboon:          92.6,
  orangutan_mandrill:        92.4,
  orangutan_capuchin:        90.5,
  orangutan_spider_monkey:   90.7,
  orangutan_marmoset:        89.5,
  orangutan_squirrel_monkey: 90.0,
  orangutan_lemur:           77.5,
  orangutan_tarsier:         82.0,

  gibbon_macaque:          93.2,
  gibbon_baboon:           92.8,
  gibbon_mandrill:         92.5,
  gibbon_capuchin:         90.3,
  gibbon_spider_monkey:    90.5,
  gibbon_marmoset:         89.3,
  gibbon_squirrel_monkey:  89.8,
  gibbon_lemur:            77.3,
  gibbon_tarsier:          81.8,

  macaque_baboon:          95.5,
  macaque_mandrill:        95.2,
  macaque_capuchin:        88.5,
  macaque_spider_monkey:   88.7,
  macaque_marmoset:        87.5,
  macaque_squirrel_monkey: 88.0,
  macaque_lemur:           76.0,
  macaque_tarsier:         80.5,

  baboon_mandrill:          96.0,
  baboon_capuchin:          88.3,
  baboon_spider_monkey:     88.5,
  baboon_marmoset:          87.2,
  baboon_squirrel_monkey:   87.8,
  baboon_lemur:             75.8,
  baboon_tarsier:           80.2,

  mandrill_capuchin:          88.1,
  mandrill_spider_monkey:     88.3,
  mandrill_marmoset:          87.0,
  mandrill_squirrel_monkey:   87.6,
  mandrill_lemur:             75.6,
  mandrill_tarsier:           80.0,

  capuchin_spider_monkey:    93.5,
  capuchin_marmoset:         91.8,
  capuchin_squirrel_monkey:  92.3,
  capuchin_lemur:            76.5,
  capuchin_tarsier:          80.8,

  spider_monkey_marmoset:    91.6,
  spider_monkey_squirrel_monkey: 92.5,
  spider_monkey_lemur:       76.7,
  spider_monkey_tarsier:     81.0,

  marmoset_squirrel_monkey:  93.0,
  marmoset_lemur:            76.0,
  marmoset_tarsier:          80.3,

  squirrel_monkey_lemur:    76.3,
  squirrel_monkey_tarsier:  80.6,

  lemur_tarsier: 73.5,
};

/** Look up similarity between two primate IDs (order-independent). */
function getSimilarity(idA, idB) {
  if (idA === idB) return 100;
  const key1 = `${idA}_${idB}`;
  const key2 = `${idB}_${idA}`;
  return SIMILARITY[key1] ?? SIMILARITY[key2] ?? null;
}

/** Return a short descriptive note for a given similarity value. */
function getNote(pct) {
  if (pct >= 99)   return "Extremely close relatives — nearly identical DNA.";
  if (pct >= 98)   return "Great apes share the vast majority of their genome.";
  if (pct >= 96)   return "Close relatives within the ape family (Hominoidea).";
  if (pct >= 93)   return "Old World monkeys share substantial DNA with apes.";
  if (pct >= 90)   return "New World and Old World primates diverged ~40 Mya.";
  if (pct >= 80)   return "Prosimians represent an ancient primate lineage.";
  return "Distant primate relatives — diverged over 60 million years ago.";
}

/* ── UI state ─────────────────────────────────────────────────── */
let selected = [];   // up to 2 primate IDs

/* ── Render primate cards ─────────────────────────────────────── */
const grid = document.getElementById("primate-grid");

PRIMATES.forEach(p => {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = p.id;
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-pressed", "false");
  card.innerHTML = `
    <span class="emoji" aria-hidden="true">${p.emoji}</span>
    <span class="common">${p.common}</span>
    <span class="species">${p.species}</span>
  `;
  card.addEventListener("click", () => toggleCard(p.id));
  card.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCard(p.id); }
  });
  grid.appendChild(card);
});

/* ── Selection logic ──────────────────────────────────────────── */
function toggleCard(id) {
  if (selected.includes(id)) {
    // Deselect
    selected = selected.filter(s => s !== id);
  } else if (selected.length < 2) {
    selected.push(id);
  } else {
    // Replace the first selection with the new one
    const deselectedId = selected[0];
    selected = [selected[1], id];
    updateCardStyle(deselectedId);
  }

  updateCardStyle(id);
  updatePanel();
}

function updateCardStyle(id) {
  const card = grid.querySelector(`[data-id="${id}"]`);
  if (!card) return;
  const on = selected.includes(id);
  card.classList.toggle("selected", on);
  card.setAttribute("aria-pressed", String(on));
}

/* ── Panel update ─────────────────────────────────────────────── */
const hint      = document.getElementById("hint");
const result    = document.getElementById("result");
const orgA      = document.getElementById("org-a");
const orgB      = document.getElementById("org-b");
const bar       = document.getElementById("similarity-bar");
const valueEl   = document.getElementById("similarity-value");
const noteEl    = document.getElementById("similarity-note");

function updatePanel() {
  if (selected.length < 2) {
    hint.textContent = selected.length === 0
      ? "Click two primates to compare their DNA."
      : "Now select a second primate.";
    hint.style.display = "";
    result.classList.add("hidden");
    return;
  }

  const [idA, idB] = selected;
  const pa = PRIMATES.find(p => p.id === idA);
  const pb = PRIMATES.find(p => p.id === idB);
  const pct = getSimilarity(idA, idB);

  hint.style.display = "none";
  result.classList.remove("hidden");

  orgA.textContent = `${pa.common} (${pa.species})`;
  orgB.textContent = `${pb.common} (${pb.species})`;

  if (pct !== null) {
    valueEl.textContent = `${pct.toFixed(1)}%`;
    bar.style.width = `${pct}%`;
    noteEl.textContent = getNote(pct);
  } else {
    valueEl.textContent = "N/A";
    bar.style.width = "0%";
    noteEl.textContent = "Similarity data not available for this pair.";
  }
}
