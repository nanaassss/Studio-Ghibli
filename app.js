const API = "https://ghibliapi.vercel.app/films";

const I18N = {
  pt: {
    loading: "Carregando…", loadingFilms: "Carregando filmes…", error: "Erro ao carregar",
    errorMsg: "Falha ao buscar a API:", errorHint: "Abra este arquivo direto no navegador, com internet.",
    search: "Buscar título ou diretor…", allDirs: "Todos os diretores",
    sYear: "Ano (antigo → novo)", sYearD: "Ano (novo → antigo)", sScore: "Nota Rotten Tomatoes",
    sTitle: "Título A–Z", sTime: "Duração",
    favs: "♥ Favoritos", fav: "Favoritar", none: "Nenhum filme encontrado.",
    count: (a, b) => `${a} de ${b} filmes`,
    poster: "Pôster de", director: "Diretor", producer: "Produtor", release: "Lançamento",
    runtime: "Duração", min: "min", score: "Rotten Tomatoes",
    descNote: "Descrição original em inglês (vem da API).",
    toLight: "Mudar para modo claro", toDark: "Mudar para modo escuro"
  },
  en: {
    loading: "Loading…", loadingFilms: "Loading films…", error: "Failed to load",
    errorMsg: "Failed to fetch the API:", errorHint: "Open this file directly in the browser, with internet.",
    search: "Search title or director…", allDirs: "All directors",
    sYear: "Year (oldest → newest)", sYearD: "Year (newest → oldest)", sScore: "Rotten Tomatoes score",
    sTitle: "Title A–Z", sTime: "Runtime",
    favs: "♥ Favorites", fav: "Favorite", none: "No films found.",
    count: (a, b) => `${a} of ${b} films`,
    poster: "Poster of", director: "Director", producer: "Producer", release: "Release",
    runtime: "Runtime", min: "min", score: "Rotten Tomatoes",
    descNote: "",
    toLight: "Switch to light mode", toDark: "Switch to dark mode"
  }
};

const TITLES_PT = {
  "Castle in the Sky": "O Castelo no Céu",
  "Grave of the Fireflies": "O Túmulo dos Vagalumes",
  "My Neighbor Totoro": "Meu Amigo Totoro",
  "Kiki's Delivery Service": "O Serviço de Entregas da Kiki",
  "Only Yesterday": "Memórias de Ontem",
  "Porco Rosso": "Porco Rosso: O Último Herói Romântico",
  "Pom Poko": "Pom Poko: A Grande Batalha dos Guaxinins",
  "Whisper of the Heart": "Sussurros do Coração",
  "Princess Mononoke": "Princesa Mononoke",
  "My Neighbors the Yamadas": "Meus Vizinhos, os Yamadas",
  "Spirited Away": "A Viagem de Chihiro",
  "The Cat Returns": "O Reino dos Gatos",
  "Howl's Moving Castle": "O Castelo Animado",
  "Tales from Earthsea": "Contos de Terramar",
  "Ponyo": "Ponyo: Uma Amizade que Veio do Mar",
  "Arrietty": "O Mundo dos Pequeninos",
  "From Up on Poppy Hill": "Da Colina das Papoulas",
  "The Wind Rises": "Vidas ao Vento",
  "The Tale of the Princess Kaguya": "O Conto da Princesa Kaguya",
  "When Marnie Was There": "As Memórias de Marnie",
  "The Red Turtle": "A Tartaruga Vermelha",
  "Earwig and the Witch": "Aya e a Bruxa"
};

let films = [], favs = new Set(), onlyFavs = false, failed = null;
let lang = "pt", mode = "light";

const $ = id => document.getElementById(id);
const grid = $("grid"), dlg = $("dlg");
const t = k => I18N[lang][k];

function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function name(f) {
  if (lang !== "pt") return f.title;
  return TITLES_PT[String(f.title).replace(/[\u2018\u2019]/g, "'")] || f.title;
}
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

/* ----- preferências salvas ----- */
try { favs = new Set(JSON.parse(read("ghibli-favs") || "[]")); } catch (e) {}
lang = read("ghibli-lang") || ((navigator.language || "pt").toLowerCase().startsWith("pt") ? "pt" : "en");
mode = read("ghibli-mode") || (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

/* ----- idioma e tema ----- */
function applyMode() {
  document.documentElement.setAttribute("data-mode", mode);
  const b = $("modeBtn");
  b.textContent = mode === "dark" ? "☀" : "☾";
  b.title = b.ariaLabel = mode === "dark" ? t("toLight") : t("toDark");
}

function buildDirs() {
  const cur = $("dir").value;
  const dirs = [...new Set(films.map(f => f.director))].sort();
  $("dir").innerHTML = `<option value="">${esc(t("allDirs"))}</option>` +
    dirs.map(d => `<option>${esc(d)}</option>`).join("");
  $("dir").value = cur;
}

function applyLang() {
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t(el.dataset.i18n));
  document.querySelectorAll("[data-i18n-ph]").forEach(el => el.placeholder = t(el.dataset.i18nPh));
  $("lang").value = lang;
  applyMode();
  buildDirs();
  if (films.length) render();
  else if (failed) showError();
  else { $("count").textContent = t("loading"); grid.innerHTML = `<div class="msg">${esc(t("loadingFilms"))}</div>`; }
}

/* ----- API ----- */
function showError() {
  $("count").textContent = t("error");
  grid.innerHTML = `<div class="msg">${esc(t("errorMsg"))} ${esc(failed)}.<br>${esc(t("errorHint"))}</div>`;
}

async function load() {
  try {
    const r = await fetch(API);
    if (!r.ok) throw new Error("HTTP " + r.status);
    films = await r.json();
    buildDirs();
    render();
  } catch (e) {
    failed = e.message;
    showError();
  }
}

/* ----- renderização ----- */
function render() {
  const q = $("q").value.trim().toLowerCase();
  const d = $("dir").value, s = $("sort").value;
  const list = films.filter(f =>
    (!q || (name(f) + " " + f.title + " " + f.original_title_romanised + " " + f.director).toLowerCase().includes(q)) &&
    (!d || f.director === d) &&
    (!onlyFavs || favs.has(f.id)));
  const n = v => Number(v) || 0;
  const sorts = {
    year: (a, b) => n(a.release_date) - n(b.release_date),
    yeard: (a, b) => n(b.release_date) - n(a.release_date),
    score: (a, b) => n(b.rt_score) - n(a.rt_score),
    title: (a, b) => name(a).localeCompare(name(b)),
    time: (a, b) => n(b.running_time) - n(a.running_time)
  };
  list.sort(sorts[s]);
  $("count").textContent = t("count")(list.length, films.length);
  if (!list.length) { grid.innerHTML = `<div class="msg">${esc(t("none"))}</div>`; return; }
  grid.innerHTML = list.map(f => `
    <div class="card" data-id="${f.id}">
      <img src="${esc(f.image)}" alt="${esc(t("poster"))} ${esc(name(f))}" loading="lazy">
      <div class="info">
        <button class="fav" data-fav="${f.id}" title="${esc(t("fav"))}">${favs.has(f.id) ? "♥" : "♡"}</button>
        <h3>${esc(name(f))}</h3>
        <small>${esc(f.release_date)} · ${esc(f.director)}</small>
      </div>
    </div>`).join("");
}

function openFilm(id) {
  const f = films.find(x => x.id === id);
  if (!f) return;
  dlg.innerHTML = `
    <button class="close" id="x">✕</button>
    <img class="banner" src="${esc(f.movie_banner || f.image)}" alt="">
    <div class="body">
      <h2>${esc(name(f))}</h2>
      <div class="jp">${lang === "pt" ? esc(f.title) + " · " : ""}${esc(f.original_title)} · ${esc(f.original_title_romanised)}</div>
      <p>${esc(f.description)}</p>
      ${t("descNote") ? `<small class="note">${esc(t("descNote"))}</small>` : ""}
      <div class="meta">
        <b>${esc(t("director"))}</b><span>${esc(f.director)}</span>
        <b>${esc(t("producer"))}</b><span>${esc(f.producer)}</span>
        <b>${esc(t("release"))}</b><span>${esc(f.release_date)}</span>
        <b>${esc(t("runtime"))}</b><span>${esc(f.running_time)} ${esc(t("min"))}</span>
        <b>${esc(t("score"))}</b><span>${esc(f.rt_score)}%</span>
      </div>
    </div>`;
  dlg.showModal();
  $("x").onclick = () => dlg.close();
}

/* ----- eventos ----- */
grid.addEventListener("click", e => {
  const fb = e.target.closest("[data-fav]");
  if (fb) {
    const id = fb.dataset.fav;
    favs.has(id) ? favs.delete(id) : favs.add(id);
    store("ghibli-favs", JSON.stringify([...favs]));
    render(); return;
  }
  const c = e.target.closest(".card");
  if (c) openFilm(c.dataset.id);
});
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
$("q").addEventListener("input", render);
$("dir").addEventListener("change", render);
$("sort").addEventListener("change", render);
$("favBtn").addEventListener("click", e => {
  onlyFavs = !onlyFavs;
  e.target.classList.toggle("on", onlyFavs);
  render();
});
$("lang").addEventListener("change", e => { lang = e.target.value; store("ghibli-lang", lang); applyLang(); });
$("modeBtn").addEventListener("click", () => { mode = mode === "dark" ? "light" : "dark"; store("ghibli-mode", mode); applyMode(); });

/* ----- início ----- */
applyLang();
load();