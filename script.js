const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyfK8QCoWrjiQh64UDJ9l_RL2eREZEOI2vUZ_rQ6_YpG4APA12doBTsOTErYiNWjRFshg/exec";

const DISCIPLINAS_POR_ANO = {
  "2026": {
    artes: { nome: "Artes", id: "18NSvdeodSTaZrILjfa2R_jhGMd4_-poA", abas: ["6 ano", "7 ano", "8 ano", "9 ano", "EM"] },
    ciencia: { nome: "Ciência - Biologia", id: "1TelpJW14TftVcMC5o-qB44sMnSSnSwUB", abas: ["6º ano", "7º ano", "8º ano", "9º ano", "1ª Série", "2ª Série", "3ª Série - Bio 1", "3ª Série - Bio 2", "Medicina -Bio3"] },
    ed_fisica: { nome: "Educação Física", id: "1bknuRelx4OCF1yLWBjH2sUwhJHKTjRf5", abas: ["6º EFAF", "7º EFAF", "8º EFAF", "9º ano", "1ª série EM", "2ª série EM"] },
    filosofia_sociologia: { nome: "Filosofia / Sociologia", id: "1JpKUOw0jFsF7n9Wm1c9bHMxrFz_oh9t_", abas: ["Sexto ano", "Sétimo ano", "Oitavo ano", "Filosofia(1 série)", "Sociologia( 2 série)", "Filosofia(3 série)", "Sociologia(3 série)"] },
    fisica: { nome: "Física", id: "12ImxTsoFS3gJo-e7oAdqhSH6myL4Bofp", abas: ["9º ANO", "1ª SÉRIE", "2ª SÉRIE", "3ª SÉRIE"] },
    geografia: { nome: "Geografia", id: "1wzFJ5Tg7QV859KCjhZtoMWL1HygWQ557", abas: ["6º ano", "7º ano", "8º ano", "9º ano", "1ª Série", "2ª Série", "3ª Série"] },
    historia: { nome: "História", id: "1llM2EPxKkwDD7tcXrbMGyAccxTMT8PJ3", abas: ["6ºano", "7ºano", "8ºano", "9ºano", "1ªsérie", "2ªsérie", "3ªsérie&Pré-Vestibular", "3ªsérie&Medicina"] },
    ingles: { nome: "Inglês", id: "1StfLas4USAOY72uNPen7iPZy7zGCewBk", abas: ["6o ano EFAF", "7o ano EFAF", "8o ano EFAF", "9o ano EFAF", "1a série EM", "2a série EM"] },
    liv: { nome: "LIV", id: "1N83ZZHQdRQCvoheCsJ6LVOoDFhRanlhC", abas: ["6° Ano", "7º Ano", "8º Ano", "9° Ano", "1ª Série", "2ª Série"] },
    oficina_leitura: { nome: "Oficina de Leitura", id: "1torzz5fWme7lC6QPFzU9DI9hL_cwH_B0", abas: ["6° ANO", "7° ANO", "8° ANO ", "9° ANO "] },
    portugues: { nome: "Língua Portuguesa", id: "1V1BY9zAUPWrQs83LYsDxHR6SAjGzUuVI", abas: ["6º ano", "7º ano", "8º ano", "9º ano", "1ª série", "2ª série", "3ª série"] },
    projeto_colaborativo: { nome: "Projeto Colaborativo", id: "1ZzCg5rB7JoPu4gXVaUDhYVz3OequoicW", abas: ["6º ano", "7º ano", "8º ano", "EM", "EM - Medicina"] },
    quimica: { nome: "Química", id: "1QNua_qvQ_wKKgU2WYsj4Msw0Qd6z1JqB", abas: ["9º ano", "1ª série", "1ª Série MED - Frente 2", "2ª Série", "2ª Série MED - Frente 2", "3ª Série", "3ª MED"] },
    redacão: { nome: "Redação", id: "1VQMCpGYnnnMm-Du9b6_llhBoCCWyim94", abas: ["6° ANO", "7º ANO", "8º ANO", "9º ANO", "1ª SÉRIE", "2ª SÉRIE"] }
  },
  "2027": {
    artes: { nome: "Artes", id: "1PywZmRUbrH2tRbmIjpX0ktu7MiBnY900kXPhf_GwQuA", fonte: "script" }
  }
};

const UNIDADES = ["Cabo Frio", "Campos dos Goytacazes", "Copacabana", "Flamengo", "Freguesia", "Ilha do Governador", "Icaraí I", "Icaraí","Icaraí III", "Itaipu", "Juiz de Fora (MG)", "Méier", "Petrópolis", "Recreio I", "Recreio II", "Rio das Ostras", "Teresópolis", "Tijuca I", "Tijuca II", "Vila da Penha", "Vila Isabel"];

// Elementos que podem não existir no HTML: acesso seguro (evita "Cannot set properties of null")
const SUB = { set innerText(v) { const e = document.getElementById("header-sub"); if (e) e.innerText = v; } };
const RELPROF = { set innerHTML(v) { const e = document.getElementById("rel-professores"); if (e) e.innerHTML = v; } };

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const NOMES_MES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const COLUNAS_DIAS = [["Segunda", "Seg"], ["Terça", "Ter"], ["Quarta", "Qua"], ["Quinta", "Qui"], ["Sexta", "Sex"], ["Sábado", "Sáb"]];

/* ================= ÍCONES (SVG) ================= */
const ICONS = {
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  chevL: '<path d="M15 18l-6-6 6-6"/>',
  chevR: '<path d="M9 18l6-6-6-6"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 16v-5M12 16V7M17 16v-3"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
  login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5M15 12H3"/>',
  userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  fileDown: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/>'
};
function ic(nome, size) {
  const s = size || 16;
  return `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[nome] || ""}</svg>`;
}
function hidratarIcones() {
  document.querySelectorAll("[data-ic]").forEach(el => { el.innerHTML = ic(el.dataset.ic, el.dataset.size); });
}

/* ================= ESTADO ================= */
let anoAtual = "2026";
let DISCIPLINAS = DISCIPLINAS_POR_ANO[anoAtual];

let dadosCache = {};
const emVoo = {};
let checksSet = new Set();
let disciplinaAtualKey = "";
let currentSheetName = "";
let currentModelo = "aula";
let usuarioLogado = null;

let currentWeeks = [];
let currentAulas = {};
let currentCaps = {};
let currentSemanas = {};
let currentAulaIdx = {};
let mesesDisp = [];
let mesIdx = 0;
let diaAtualK = 0;            // índice (0-5) do dia aberto no painel de detalhes

let relProfessores = [];
let relChecks = [];
let relCarregado = false;
let relHistoricoFiltrado = [];
let relListaProf = [];
let relListaSerie = [];

/* ================= UTILITÁRIOS ================= */
function norm(s) {
  return String(s === null || s === undefined ? "" : s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function nh(s) { return norm(s).replace(/\s+/g, " "); }
function esc(s) {
  return String(s === null || s === undefined ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function fmt(s) {
  let t = esc(s);
  t = t.replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  return t.replace(/\r?\n/g, "<br>");
}
function cel(r, c) {
  if (c === undefined || c < 0 || !r) return "";
  const v = r[c];
  return (v === null || v === undefined) ? "" : String(v).trim();
}
function pad2(n) { return String(n).padStart(2, "0"); }
function val(id) { return document.getElementById(id).value; }
function showLoading(txt) {
  document.getElementById("loading-text").innerText = txt || "Carregando...";
  document.getElementById("loading-screen").style.display = "flex";
}
function hideLoading() { document.getElementById("loading-screen").style.display = "none"; }
function splitDisc(s) { return String(s || "").split(/[,;|]/).map(x => x.trim()).filter(Boolean); }

function pick(obj, ...nomes) {
  const mapa = {};
  Object.keys(obj || {}).forEach(k => { mapa[norm(k).replace(/[^a-z0-9]/g, "")] = obj[k]; });
  for (const n of nomes) {
    const v = mapa[n];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}
function normalizarCheck(c) {
  return {
    professorEmail: pick(c, "professoremail", "email").toLowerCase(),
    disciplina: pick(c, "disciplinakey", "disciplina"),
    serie: pick(c, "serie"),
    semana: pick(c, "semana"),
    dia: pick(c, "dia"),
    aulaIndex: pick(c, "aulaindex"),
    status: pick(c, "status"),
    dataHora: pick(c, "datahora")
  };
}
function normalizarProfessor(p) {
  return {
    nome: pick(p, "nome"),
    email: pick(p, "email", "professoremail").toLowerCase(),
    disciplinas: splitDisc(pick(p, "disciplinas", "disciplinakey", "disciplina")),
    unidades: splitDisc(pick(p, "unidade", "unidades")),
    unidade: splitDisc(pick(p, "unidade", "unidades")).join(", ")
  };
}
// Identidade única de um check: professor/disciplina/série/semana/DIA/aula
function chaveCheck(c) { return [c.disciplina, c.serie, c.semana, c.dia, c.aulaIndex].join("|"); }
function nomeDisciplina(key) {
  for (const ano of Object.keys(DISCIPLINAS_POR_ANO)) {
    if (DISCIPLINAS_POR_ANO[ano][key]) return DISCIPLINAS_POR_ANO[ano][key].nome;
  }
  return key || "—";
}
function formatarDataHora(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/* ================= LOGIN / CADASTRO ================= */
function abrirModalAuth(tipo) {
  alternarAuth(tipo || "login");
  document.getElementById("auth-modal").style.display = "flex";
}
function fecharModalAuth() { document.getElementById("auth-modal").style.display = "none"; }

function alternarAuth(tipo) {
  const login = tipo === "login";
  document.getElementById("tab-login").classList.toggle("active", login);
  document.getElementById("tab-register").classList.toggle("active", !login);
  document.getElementById("login-form").style.display = login ? "block" : "none";
  document.getElementById("register-form").style.display = login ? "none" : "block";
}

function montarChecklistUnidades() {
  const box = document.getElementById("reg-unidades");
  if (!box) return;
  box.innerHTML = UNIDADES.map(u => `<label class="check-item"><input type="checkbox" value="${esc(u)}"> ${esc(u)}</label>`).join("");
}

function montarChecklistDisciplinas() {
  const mapa = {};
  Object.values(DISCIPLINAS_POR_ANO).forEach(ano => Object.keys(ano).forEach(k => { mapa[k] = ano[k].nome; }));
  const chaves = Object.keys(mapa).sort((a, b) => mapa[a].localeCompare(mapa[b], "pt-BR"));
  document.getElementById("reg-disciplinas").innerHTML = chaves
    .map(k => `<label class="check-item"><input type="checkbox" value="${esc(k)}"> ${esc(mapa[k])}</label>`).join("");
}

async function realizarLogin() {
  const email = val("login-email").trim().toLowerCase();
  const senha = val("login-senha").trim();
  if (!email || !senha) { alert("Informe o e-mail e a senha."); return; }

  const btn = document.getElementById("btn-login");
  btn.disabled = true;
  showLoading("Autenticando...");
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=login&email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`);
    const json = await res.json();
    if (json && json.status === "success") {
      usuarioLogado = normalizarProfessor(json.professor);
      await carregarChecksDoServidor();
      hideLoading();
      aplicarLoginUI();
    } else {
      hideLoading();
      alert((json && json.message) || "E-mail ou senha inválidos.");
    }
  } catch (e) {
    hideLoading();
    alert("Erro ao conectar com o banco de dados.");
  }
  btn.disabled = false;
}

async function realizarCadastro() {
  const nome = val("reg-nome").trim();
  const email = val("reg-email").trim().toLowerCase();
  const senha = val("reg-senha").trim();
  const boxU = document.getElementById("reg-unidades");
  const unidades = boxU ? [...boxU.querySelectorAll("input:checked")].map(i => i.value) : splitDisc(val("reg-unidade"));
  const unidade = unidades.join(",");
  const disciplinas = [...document.querySelectorAll("#reg-disciplinas input:checked")].map(i => i.value);

  if (!nome || !email || !senha) { alert("Preencha nome, e-mail e senha."); return; }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { alert("Informe um e-mail válido."); return; }
  if (senha.length < 6) { alert("A senha precisa ter pelo menos 6 caracteres."); return; }
  if (!disciplinas.length) { alert("Marque pelo menos uma disciplina."); return; }
  if (!unidades.length) { alert("Marque pelo menos uma unidade."); return; }

  const btn = document.getElementById("btn-cadastrar");
  btn.disabled = true;
  showLoading("Cadastrando...");
  try {
    const url = `${APPS_SCRIPT_URL}?action=cadastrar&nome=${encodeURIComponent(nome)}&email=${encodeURIComponent(email)}` +
      `&senha=${encodeURIComponent(senha)}&disciplinas=${encodeURIComponent(disciplinas.join(","))}&unidade=${encodeURIComponent(unidade)}`;
    const res = await fetch(url);
    const json = await res.json();
    hideLoading();
    if (json && json.status === "success") {
      usuarioLogado = normalizarProfessor(json.professor);
      checksSet = new Set();
      relCarregado = false;
      aplicarLoginUI();
    } else {
      alert((json && json.message) || "Erro ao cadastrar.");
    }
  } catch (e) {
    hideLoading();
    alert("Erro ao cadastrar.");
  }
  btn.disabled = false;
}

async function carregarChecksDoServidor() {
  checksSet = new Set();
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=getChecks&email=${encodeURIComponent(usuarioLogado.email)}`);
    const data = await res.json();
    (Array.isArray(data) ? data : []).map(normalizarCheck).forEach(c => {
      if (c.professorEmail === usuarioLogado.email) checksSet.add(chaveCheck(c));
    });
  } catch (e) { /* segue sem checks */ }
}

function textoTituloHome() {
  if (!usuarioLogado) return "Disciplinas Disponíveis";
  return (usuarioLogado.disciplinas || []).length > 1 ? "Suas Disciplinas" : "Sua Disciplina";
}

function aplicarLoginUI() {
  fecharModalAuth();
  document.getElementById("btn-logout").style.display = "inline-flex";
  document.getElementById("grid-title-txt").innerText = textoTituloHome();
  irParaInicio();
  montarDashboard();
}

function fazerLogout() {
  usuarioLogado = null;
  checksSet = new Set();
  document.getElementById("btn-logout").style.display = "none";
  document.getElementById("grid-title-txt").innerText = textoTituloHome();
  irParaInicio();
  montarDashboard();
}

/* ================= NAVEGAÇÃO ================= */
function mostrarTela(nome) {
  document.getElementById("home-screen").style.display = nome === "home" ? "block" : "none";
  document.getElementById("app-screen").style.display = nome === "app" ? "block" : "none";
  document.getElementById("report-screen").style.display = nome === "report" ? "block" : "none";
}

function irParaInicio() {
  mostrarTela("home");
  document.getElementById("hero").style.display = usuarioLogado ? "none" : "block";
  SUB.innerText = usuarioLogado
    ? `Prof. ${usuarioLogado.nome} (${usuarioLogado.unidade || "Pensi"})`
    : "Painel Pedagógico";
}

function mudarAno(ano) {
  anoAtual = ano;
  DISCIPLINAS = DISCIPLINAS_POR_ANO[ano] || {};
  dadosCache = {};
  montarDashboard();
}

function montarDashboard() {
  const grid = document.getElementById("subjects-grid");
  grid.innerHTML = "";

  let chaves = Object.keys(DISCIPLINAS);
  if (usuarioLogado) {
    const minhas = usuarioLogado.disciplinas || [];
    chaves = chaves.filter(k => minhas.includes(k));
  }

  if (!chaves.length) {
    grid.innerHTML = `<div class="empty-year">${usuarioLogado
      ? `Nenhuma das suas disciplinas está disponível em ${anoAtual}.`
      : `As disciplinas de ${anoAtual} ainda não foram adicionadas.`}</div>`;
    return;
  }

  chaves.forEach(key => {
    const disc = DISCIPLINAS[key];
    const card = document.createElement("div");
    card.className = "subject-card";
    card.onclick = () => selecionarDisciplina(key);
    card.innerHTML = `<div class="subject-icon">${ic("book", 20)}</div>
      <div class="txt"><h3>${esc(disc.nome)}</h3></div>
      <span class="go">${ic("arrowRight", 18)}</span>`;
    grid.appendChild(card);
  });
}

/* ================= CARREGAMENTO DAS PLANILHAS ================= */
async function selecionarDisciplina(key) {
  disciplinaAtualKey = key;
  const disc = DISCIPLINAS[key];
  dadosCache[key] = {};
  mostrarTela("app");
  resetarDetalhe();
  document.getElementById("calendar-container").innerHTML = "";
  await abrirTelaCalendario(disc);
}

async function obterAbas(disc) {
  if (disc.abas) return disc.abas;
  const res = await fetch(`${APPS_SCRIPT_URL}?action=getAbas&id=${encodeURIComponent(disc.id)}&fresh=1&_=${Date.now()}`);
  const json = await res.json();
  if (!json || json.status !== "success") throw new Error((json && json.message) || "Falha ao ler as abas.");
  return json.abas.filter(n => norm(n).indexOf("orienta") === -1);
}

async function abrirTelaCalendario(disc) {
  const key = disciplinaAtualKey;
  const select = document.getElementById("series-select");
  select.innerHTML = "";
  showLoading("Carregando abas...");
  let abas = [];
  try { abas = await obterAbas(disc); } catch (e) { abas = []; }
  hideLoading();
  if (key !== disciplinaAtualKey) return;

  if (!abas.length) {
    document.getElementById("calendar-container").innerHTML =
      `<div class="detail-empty"><h3>Não foi possível carregar as abas desta planilha.</h3></div>`;
    return;
  }
  abas.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.innerText = name;
    select.appendChild(opt);
  });
  mesesDisp = [];
  mudarSerie(abas[0]);
}

function carregarAbaEspecifica(key, sheetName) {
  if (dadosCache[key] && dadosCache[key][sheetName]) return Promise.resolve();
  const id = anoAtual + "|" + key + "|" + sheetName;
  if (emVoo[id]) return emVoo[id];
  const disc = DISCIPLINAS[key];
  const p = (disc.fonte === "script" ? carregarViaScript(key, sheetName, disc) : carregarViaGviz(key, sheetName, disc))
    .finally(() => { delete emVoo[id]; });
  emVoo[id] = p;
  return p;
}

function carregarViaGviz(key, sheetName, disc) {
  const ano = anoAtual;
  const nomes = [sheetName];
  if (sheetName.trim() !== sheetName) nomes.push(sheetName.trim());

  // Nome do callback SEMPRE ascii (a chave "redacão" tinha "ã" e o Google recusava, travando o carregamento).
  // Se a resposta não vier (planilha privada/nome errado), o timeout destrava.
  const tentar = nome => new Promise(resolve => {
    const cb = "cbg" + Math.random().toString(36).slice(2);
    const script = document.createElement("script");
    let fim = false;
    const limpar = () => { if (fim) return; fim = true; clearTimeout(t); delete window[cb]; script.remove(); };
    const t = setTimeout(() => { limpar(); resolve(null); }, 12000);
    window[cb] = json => { const rows = json && json.table ? parseGvizTable(json.table) : null; limpar(); resolve(rows); };
    script.onerror = () => { limpar(); resolve(null); };
    script.src = `https://docs.google.com/spreadsheets/d/${disc.id}/gviz/tq?tqx=responseHandler:${cb}&sheet=${encodeURIComponent(nome)}`;
    document.body.appendChild(script);
  });

  return (async () => {
    for (const nome of nomes) {
      const rows = await tentar(nome);
      if (rows) {
        if (ano === anoAtual) (dadosCache[key] = dadosCache[key] || {})[sheetName] = rows;
        return;
      }
    }
  })();
}

async function carregarViaScript(key, sheetName, disc) {
  const ano = anoAtual;
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=getAba&id=${encodeURIComponent(disc.id)}&aba=${encodeURIComponent(sheetName)}&fresh=1&_=${Date.now()}`);
    const json = await res.json();
    if (json && json.rows && ano === anoAtual) {
      (dadosCache[key] = dadosCache[key] || {})[sheetName] = json.rows;
    }
  } catch (e) { /* aba fica sem dados */ }
}

function valorCelula(cell) {
  if (!cell) return "";
  const v = cell.v;
  if (v === null || v === undefined) return (cell.f !== undefined && cell.f !== null) ? cell.f : "";
  if (typeof v === "string" && v.indexOf("Date(") === 0) return cell.f || v;
  return v;
}

function parseGvizTable(table) {
  const rowsParsed = [];
  if (table.cols && table.cols.some(c => c && c.label)) {
    rowsParsed.push(table.cols.map(c => (c && c.label) ? c.label : ""));
  }
  table.rows.forEach(r => {
    const rowObj = [];
    (r.c || []).forEach((cell, idx) => { rowObj[idx] = valorCelula(cell); });
    rowsParsed.push(rowObj);
  });
  return rowsParsed;
}

async function mudarSerie(sheetName) {
  currentSheetName = sheetName;
  const key = disciplinaAtualKey;
  document.getElementById("series-select").value = sheetName;
  showLoading(`Carregando ${sheetName}...`);
  try { await carregarAbaEspecifica(key, sheetName); } catch (e) { /* tratado abaixo */ } finally { hideLoading(); }
  if (sheetName !== currentSheetName || key !== disciplinaAtualKey) return;
  try {
    processarDadosAba(sheetName);
  } catch (e) {
    console.error(e);
    document.getElementById("calendar-container").innerHTML = `<div class="detail-empty"><h3>Erro ao montar o calendário desta aba.</h3><p>${esc(e && e.message)}</p></div>`;
  }

  const abas = [...document.getElementById("series-select").options].map(o => o.value);
  prefetchAbas(key, abas);
}

async function prefetchAbas(key, abas) {
  for (const a of abas) {
    if (key !== disciplinaAtualKey) return;
    await carregarAbaEspecifica(key, a);
  }
}

/* ================= LEITURA INTELIGENTE ================= */
function detectarModelo(rows) {
  const limite = Math.min(rows.length, 30);
  for (let i = 0; i < limite; i++) {
    const r = rows[i] || [];
    for (let j = 0; j < r.length; j++) {
      if (nh(r[j]).indexOf("divisao do conteudo") === 0) return "semana";
    }
  }
  return "aula";
}

function processarDadosAba(sheetName) {
  const rows = (dadosCache[disciplinaAtualKey] || {})[sheetName] || [];
  if (!rows.length) {
    currentWeeks = []; mesesDisp = [];
    document.getElementById("calendar-container").innerHTML =
      `<div class="detail-empty"><h3>Não foi possível carregar a guia "${esc(sheetName)}".</h3><p>Confira se o nome da guia está igual ao da planilha e se a planilha está compartilhada (qualquer pessoa com o link pode ver).</p></div>`;
    resetarDetalhe();
    return;
  }
  currentModelo = detectarModelo(rows);
  if (currentModelo === "semana") processarModeloSemana(rows);
  else processarModeloAula(rows);

  prepararMeses();
  renderizarCalendario();

  const disc = DISCIPLINAS[disciplinaAtualKey];
  SUB.innerText = `${disc.nome} · Guia: ${sheetName}`;
  resetarDetalhe();
}

function resetarDetalhe() {
  document.getElementById("detail").innerHTML = `
    <div class="detail-empty">
      ${ic("calendar", 36)}
      <h2>Selecione uma data</h2>
      <p>Clique em qualquer dia do calendário ao lado para abrir o detalhamento das aulas.</p>
    </div>`;
}

/* ---------- Referências de aula/semana: tolera "Semana 1", "1", "1 e 2", "1-2", "1;2;3", "1, 2 e 3"... ---------- */
function expandirNumeros(s) {
  const toks = String(s).match(/\d+|-|–|—|\bate\b|\ba\b/g) || [];
  const out = [];
  let prev = null, intervalo = false;
  toks.forEach(t => {
    if (/^\d+$/.test(t)) {
      const v = parseInt(t, 10);
      if (intervalo && prev !== null && v > prev && v - prev <= 60) {
        for (let k = prev + 1; k < v; k++) out.push(k);
      }
      out.push(v);
      prev = v;
      intervalo = false;
    } else {
      intervalo = true;
    }
  });
  return [...new Set(out)];
}

const SEP_REF = "(?:;|,|\\/|&|\\+|-|–|—|\\be\\b|\\ba\\b|\\bate\\b)";
const RE_REF = new RegExp("^(aulas?|semanas?|sem\\.?)?\\s*(\\d+(?:\\s*" + SEP_REF + "\\s*(?:aulas?\\s*|semanas?\\s*|sem\\.?\\s*)?\\d+)*)");

function resolverReferencia(texto) {
  const n = nh(texto).replace(/[ªº°]/g, "");
  if (!n) return { tipo: null, nums: [] };
  const m = n.match(RE_REF);
  if (!m) return { tipo: null, nums: [] };
  let tipo = "numero";
  if (m[1]) tipo = m[1].indexOf("aula") === 0 ? "aula" : "semana";
  else if (/\bsemanas?\b|\bsem\b/.test(n)) tipo = "semana";
  else if (/\baulas?\b/.test(n)) tipo = "aula";
  return { tipo, nums: expandirNumeros(m[2]) };
}

function extrairAulas(texto) {
  const r = resolverReferencia(texto);
  return r.tipo === "semana" ? [] : r.nums;
}

function extrairCapitulos(texto) {
  let t = String(texto || "");
  const lista = [];
  t = t.replace(/(\d+)\s*(?:a|à|até|-|–)\s*(\d+)/gi, (_, a, b) => {
    a = parseInt(a, 10); b = parseInt(b, 10);
    if (b >= a && b - a < 30) for (let k = a; k <= b; k++) lista.push(k);
    return " ";
  });
  (t.match(/\d+/g) || []).forEach(x => lista.push(parseInt(x, 10)));
  return [...new Set(lista)].sort((a, b) => a - b);
}

/* ---------- Modelo 2026 ---------- */
function detectarColunas(rows) {
  const col = {};
  let headerRow = -1, aulaHeaderRow = -1;
  const limite = Math.min(rows.length, 20);

  for (let i = 0; i < limite; i++) {
    const r = rows[i] || [];
    for (let j = 0; j < r.length; j++) {
      const n = norm(r[j]);
      if (!n) continue;
      const set = (k, cond) => { if (cond && col[k] === undefined) col[k] = j; };
      set("seg", n.indexOf("segunda") === 0);
      set("ter", n.indexOf("terca") === 0);
      set("qua", n.indexOf("quarta") === 0);
      set("qui", n.indexOf("quinta") === 0);
      set("sex", n.indexOf("sexta") === 0);
      set("sab", n.indexOf("sabado") === 0 || n === "sab");
      set("ementas", n.indexOf("ementa") === 0);
      set("obs", n.indexOf("observa") === 0);
      set("aula", /^(n\s*(da\s*)?)?aulas?(\s*n)?$/.test(n.replace(/[ºª°.]/g, "").trim()));
      set("cap", n === "capitulo" || n === "cap.");
      set("tema", n.indexOf("tema") === 0);
      set("expect", n.indexOf("expectativa") === 0);
      set("instr", n.indexOf("instruc") === 0);
      set("exerc", n.indexOf("exercicio") === 0);
    }
    if (headerRow < 0 && col.seg !== undefined) headerRow = i;
    if (aulaHeaderRow < 0 && col.aula !== undefined) aulaHeaderRow = i;
  }

  const padrao = { seg: 2, ter: 3, qua: 4, qui: 5, sex: 6, sab: 7, ementas: 8, obs: 9, aula: 11, cap: 12, tema: 13, expect: 14, instr: 15, exerc: 16 };
  Object.keys(padrao).forEach(k => { if (col[k] === undefined) col[k] = padrao[k]; });
  return { col, headerRow, aulaHeaderRow };
}

function uniqueKey(usadas, chave) {
  if (usadas[chave]) { usadas[chave]++; return chave + " #" + usadas[chave]; }
  usadas[chave] = 1;
  return chave;
}

function processarModeloAula(rows) {
  const { col, headerRow, aulaHeaderRow } = detectarColunas(rows);
  const aulasMap = {};
  const capsMap = {};

  for (let i = aulaHeaderRow + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r) continue;
    const aulaCell = cel(r, col.aula);
    const nAulaCell = norm(aulaCell);
    if (nAulaCell.indexOf("cortad") !== -1 || nAulaCell === "capitulo") break;

    const cap = cel(r, col.cap);
    const tema = cel(r, col.tema);
    const linha = {
      numAula: aulaCell, cap, tema,
      expectativas: cel(r, col.expect),
      instrucoes: cel(r, col.instr),
      exercicios: cel(r, col.exerc)
    };
    if (!tema && !cap && !linha.expectativas && !linha.instrucoes && !linha.exercicios) continue;

    expandirNumeros(aulaCell.replace(/[ªº°]/g, "")).forEach(n => { (aulasMap[n] = aulasMap[n] || []).push(linha); });
    extrairCapitulos(cap).forEach(c => { (capsMap[c] = capsMap[c] || []).push(linha); });
  }

  const semanas = [];
  const chavesUsadas = {};
  const temPeriodo = col.seg > 0;
  const reDataPeriodo = /\d{1,2}\s*[\/.-]\s*(?:[a-z]{3,}|\d{1,2})/;

  for (let i = headerRow + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r) continue;
    const dias = {
      "Segunda": cel(r, col.seg), "Terça": cel(r, col.ter), "Quarta": cel(r, col.qua),
      "Quinta": cel(r, col.qui), "Sexta": cel(r, col.sex), "Sábado": cel(r, col.sab)
    };
    const valores = Object.values(dias);
    const temTexto = valores.some(v => v);

    const periodo = temPeriodo ? cel(r, 0) : "";
    const np = norm(periodo);
    let temData = false;
    if (temPeriodo) {
      if (!np) continue;
      if (np === "semana" || np === "periodo" || np.indexOf("capitulos") !== -1 || np.indexOf("trabalhados") !== -1) continue;
      temData = reDataPeriodo.test(np);
    }
    // semana com data aparece SEMPRE (mesmo vazia); sem data, só se tiver texto
    if (!temData && !temTexto) continue;
    if (!temData && !temPeriodo && valores.every(v => /^\d+$/.test(v))) continue;

    semanas.push({
      key: uniqueKey(chavesUsadas, periodo || ("Semana " + (semanas.length + 1))),
      periodo, ementas: cel(r, col.ementas), obs: cel(r, col.obs), dias
    });
  }

  currentWeeks = semanas;
  currentAulas = aulasMap;
  currentCaps = capsMap;
  currentSemanas = {};
  currentAulaIdx = {};
}

/* ---------- Modelo 2027 ---------- */
function extrairAulasDaDivisao(texto) {
  const aulas = [];
  String(texto || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean).forEach(linha => {
    const m = linha.match(/aula\s*0*(\d+)/i);
    if (m) aulas.push({ num: parseInt(m[1], 10), key: "A" + parseInt(m[1], 10), texto: linha });
    else if (aulas.length) aulas[aulas.length - 1].texto += "\n" + linha;
  });
  return aulas;
}

function processarModeloSemana(rows) {
  let headerRow = -1;
  for (let i = 0; i < Math.min(rows.length, 40); i++) {
    if ((rows[i] || []).some(c => nh(c).indexOf("segunda") === 0)) { headerRow = i; break; }
  }

  const col = {}, rc = {};
  if (headerRow >= 0) {
    const r = rows[headerRow];
    r.forEach((c, j) => {
      const n = nh(c);
      if (!n) return;
      const set = (k, cond) => { if (cond && col[k] === undefined) col[k] = j; };
      set("per", n === "semana");
      set("seg", n.indexOf("segunda") === 0);
      set("ter", n.indexOf("terca") === 0);
      set("qua", n.indexOf("quarta") === 0);
      set("qui", n.indexOf("quinta") === 0);
      set("sex", n.indexOf("sexta") === 0);
      set("sab", n.indexOf("sabado") === 0);
      set("ementas", n.indexOf("ementa") === 0);
      set("obs", n.indexOf("observa") === 0);
    });
    const lim = col.obs !== undefined ? col.obs : (col.ementas !== undefined ? col.ementas : (col.sab !== undefined ? col.sab : 0));
    r.forEach((c, j) => {
      if (j <= lim) return;
      const n = nh(c);
      if (!n) return;
      const set = (k, cond) => { if (cond && rc[k] === undefined) rc[k] = j; };
      set("sem", n.indexOf("semana") === 0);
      set("tema", n.indexOf("tema") === 0);
      set("mod", n.indexOf("modulo") === 0);
      set("div", n.indexOf("divisao") === 0);
      set("obj", n.indexOf("objetivo") === 0);
      set("sala", n.indexOf("exercicio") === 0 && n.indexOf("sala") >= 0);
      set("casa", n.indexOf("exercicio") === 0 && n.indexOf("casa") >= 0);
      set("prat", n.indexOf("pratica") >= 0);
    });
  }
  const defEsq = { per: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6, ementas: 7, obs: 8 };
  const defDir = { sem: 10, mod: 11, tema: 12, div: 13, obj: 14, sala: 15, casa: 16, prat: 17 };
  Object.keys(defEsq).forEach(k => { if (col[k] === undefined) col[k] = defEsq[k]; });
  Object.keys(defDir).forEach(k => { if (rc[k] === undefined) rc[k] = defDir[k]; });

  const semanas = [], semanasMap = {}, aulaIdx = {};
  const usadas = {};
  const reData = /\d{1,2}\s*[\/.-]\s*(?:[a-z]{3,}|\d{1,2})/;

  for (let i = headerRow + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r) continue;

    const periodo = cel(r, col.per);
    if (reData.test(norm(periodo))) {
      semanas.push({
        key: uniqueKey(usadas, periodo),
        periodo,
        ementas: cel(r, col.ementas),
        obs: cel(r, col.obs),
        dias: {
          "Segunda": cel(r, col.seg), "Terça": cel(r, col.ter), "Quarta": cel(r, col.qua),
          "Quinta": cel(r, col.qui), "Sexta": cel(r, col.sex), "Sábado": cel(r, col.sab)
        }
      });
    }

    // Coluna "Semana": aceita "1", "Semana 1", "1 e 2", "1-2", "1;2;3"...
    const celSem = cel(r, rc.sem);
    let nums = resolverReferencia(celSem).nums;
    if (!nums.length) { const m = celSem.match(/\d+/); if (m) nums = [parseInt(m[0], 10)]; }
    if (nums.length) {
      const d = {
        num: nums[0],
        modulo: cel(r, rc.mod), tema: cel(r, rc.tema), divisao: cel(r, rc.div),
        objetivos: cel(r, rc.obj), sala: cel(r, rc.sala), casa: cel(r, rc.casa), prat: cel(r, rc.prat)
      };
      d.aulas = extrairAulasDaDivisao(d.divisao);
      const temConteudo = d.modulo || d.tema || d.divisao || d.objetivos || d.sala || d.casa || d.prat;
      if (temConteudo) {
        nums.forEach(num => {
          if (semanasMap[num]) return;
          semanasMap[num] = d;
          d.aulas.forEach(a => { (aulaIdx[a.num] = aulaIdx[a.num] || []).push(num); });
        });
      }
    }
  }

  currentWeeks = semanas;
  currentSemanas = semanasMap;
  currentAulaIdx = aulaIdx;
  currentAulas = {};
  currentCaps = {};
}

/* ================= CALENDÁRIO MENSAL ================= */
function parsePeriodoInicio(periodo, ano) {
  const t = norm(periodo);
  let m = t.match(/(\d{1,2})\s*[\/.-]\s*([a-z]{3})/);
  if (m) {
    const mes = MESES.indexOf(m[2]);
    return mes < 0 ? null : new Date(ano, mes, parseInt(m[1], 10));
  }
  m = t.match(/(\d{1,2})\s*[\/.-]\s*(\d{1,2})/);
  if (m) {
    const mes = parseInt(m[2], 10) - 1;
    return (mes < 0 || mes > 11) ? null : new Date(ano, mes, parseInt(m[1], 10));
  }
  return null;
}

function prepararMeses() {
  const lembrar = mesesDisp[mesIdx];
  let ano = parseInt(anoAtual, 10), ant = null, temData = false;

  currentWeeks.forEach(w => {
    let d = parsePeriodoInicio(w.periodo, ano);
    if (d && ant && d < ant) { ano++; d = parsePeriodoInicio(w.periodo, ano); }
    if (!d && ant) d = new Date(ant.getFullYear(), ant.getMonth(), ant.getDate() + 7);
    if (d) { ant = d; temData = true; }
    w.inicio = d;
    w.datas = d ? [0, 1, 2, 3, 4, 5].map(k => new Date(d.getFullYear(), d.getMonth(), d.getDate() + k)) : null;
  });

  if (!temData) {
    mesesDisp = [{ y: 0, m: -1, rotulo: "Todas as semanas" }];
    mesIdx = 0;
  } else {
    const set = new Map();
    currentWeeks.forEach(w => {
      if (!w.datas) return;
      w.datas.slice(0, 5).forEach(d => {
        const k = d.getFullYear() * 12 + d.getMonth();
        if (!set.has(k)) set.set(k, { y: d.getFullYear(), m: d.getMonth() });
      });
    });
    const base = parseInt(anoAtual, 10);
    mesesDisp = [...set.entries()].sort((a, b) => a[0] - b[0])
      .map(([, v]) => ({ y: v.y, m: v.m, rotulo: NOMES_MES[v.m] + (v.y !== base ? " " + v.y : "") }));

    let i = lembrar ? mesesDisp.findIndex(x => x.y === lembrar.y && x.m === lembrar.m) : -1;
    if (i < 0) {
      const hoje = new Date();
      i = mesesDisp.findIndex(x => x.y === hoje.getFullYear() && x.m === hoje.getMonth());
    }
    mesIdx = i >= 0 ? i : 0;
  }

  const sel = document.getElementById("month-select");
  sel.innerHTML = mesesDisp.map((x, i) => `<option value="${i}">${esc(x.rotulo)}</option>`).join("");
  sel.value = String(mesIdx);
}

function mudarMes(v) { mesIdx = parseInt(v, 10) || 0; renderizarCalendario(); }
function mesAnterior() { if (mesIdx > 0) { mesIdx--; sincronizarMes(); } }
function mesProximo() { if (mesIdx < mesesDisp.length - 1) { mesIdx++; sincronizarMes(); } }
function sincronizarMes() { document.getElementById("month-select").value = String(mesIdx); renderizarCalendario(); }

function renderizarCalendario() {
  const container = document.getElementById("calendar-container");
  if (!currentWeeks.length || !mesesDisp.length) {
    container.innerHTML = `<div class="detail-empty"><h3>Nenhum dado encontrado nesta aba.</h3></div>`;
    return;
  }
  const mes = mesesDisp[mesIdx];
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  let html = "", n = 0;

  currentWeeks.forEach((sem, idx) => {
    if (mes.m >= 0) {
      if (sem.datas && !sem.datas.slice(0, 5).some(d => d.getFullYear() === mes.y && d.getMonth() === mes.m)) return;
    }
    n++;
    html += `
      <div class="week-grid" data-idx="${idx}">
        <div class="week-info"><strong>${esc(sem.periodo || ("Semana " + (idx + 1)))}</strong></div>`;
    COLUNAS_DIAS.forEach(([nomeDia, abrev], k) => {
      const txt = sem.dias[nomeDia];
      const d = sem.datas ? sem.datas[k] : null;
      const fora = d && mes.m >= 0 && !(d.getFullYear() === mes.y && d.getMonth() === mes.m);
      const ehHoje = d && d.getTime() === hoje.getTime();
      const dataTxt = d ? (fora ? `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}` : pad2(d.getDate())) : "";
      html += `
        <div class="day${fora ? " other-month" : ""}${ehHoje ? " today" : ""}" onclick="abrirDetalhesSemana(${idx}, ${k}, this)">
          <div class="date"><span>${abrev}${dataTxt ? " " + dataTxt : ""}</span></div>
          <div class="tag">${txt ? esc(txt) : "—"}</div>
        </div>`;
    });
    html += `</div>`;
  });

  container.innerHTML = n ? html : `<div class="detail-empty"><h3>Nenhuma semana neste mês.</h3></div>`;
}

/* ================= DETALHES DO DIA ================= */
function blocoCampo(rows, campo, titulo) {
  const comValor = rows.filter(r => r[campo]);
  if (!comValor.length) return "";
  const vistos = new Map();
  comValor.forEach(r => {
    if (!vistos.has(r[campo])) vistos.set(r[campo], []);
    vistos.get(r[campo]).push(r.tema);
  });
  if (vistos.size === 1) return `<p><strong>${titulo}:</strong> ${fmt([...vistos.keys()][0])}</p>`;
  let li = "";
  vistos.forEach((temas, valor) => {
    const rotulo = [...new Set(temas.filter(Boolean))].join(" / ");
    li += `<li>${rotulo ? `<em>${esc(rotulo)}</em>: ` : ""}${fmt(valor)}</li>`;
  });
  return `<p><strong>${titulo}:</strong></p><ul>${li}</ul>`;
}

function blocoTemas(rows) {
  const temas = [...new Set(rows.map(r => r.tema).filter(Boolean))];
  if (!temas.length) return `<p><strong>Tema do Capítulo:</strong> Não especificado</p>`;
  if (temas.length === 1) return `<p><strong>Tema do Capítulo:</strong> ${fmt(temas[0])}</p>`;
  return `<p><strong>Temas do Capítulo:</strong></p><ul>${temas.map(t => `<li>${fmt(t)}</li>`).join("")}</ul>`;
}

function blocoTexto(titulo, texto) {
  if (!texto) return "";
  return `<div class="txt-sec"><strong>${titulo}</strong><div class="txt-block">${fmt(texto)}</div></div>`;
}

// O check é sempre do DIA aberto (diaAtualK): mesma aula em outro dia da semana é outro registro.
function dadosCheck(semKey, aulaKey) {
  return { disciplina: disciplinaAtualKey, serie: currentSheetName, semana: semKey, dia: COLUNAS_DIAS[diaAtualK][0], aulaIndex: aulaKey };
}

function botaoCheck(idx, aulaKey, semKey) {
  const feito = checksSet.has(chaveCheck(dadosCheck(semKey, aulaKey)));
  return `<button class="btn-check ${feito ? "checked" : ""}" id="btn-check-${idx}-${diaAtualK}-${aulaKey}" ${feito ? "disabled" : ""} onclick="darCheck(${idx}, ${diaAtualK}, '${aulaKey}')">${ic("check", 14)} ${feito ? "Concluído" : "Dar Check"}</button>`;
}

function abrirDetalhesSemana(idx, k, element) {
  document.querySelectorAll(".day.selected").forEach(el => el.classList.remove("selected"));
  if (element) element.classList.add("selected");

  const semData = currentWeeks[idx];
  if (!semData) return;
  diaAtualK = k;
  const diaNome = COLUNAS_DIAS[k][0];
  const tagDia = semData.dias[diaNome] || "";

  const d = semData.datas ? semData.datas[k] : null;
  const dataTxt = d ? `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}` : "";

  let html = `
    <div class="detail-head">
      <div class="date">Período: ${esc(semData.periodo || ("Semana " + (idx + 1)))} (${diaNome}${dataTxt ? ", " + dataTxt : ""})</div>
      <h2>Atividade do Dia: ${esc(tagDia || "Sem atividade especificada")}</h2>
      ${semData.ementas ? `<div class="ementa-box"><strong>Ementa:</strong> ${fmt(semData.ementas)}</div>` : ""}
      ${semData.obs ? `<div class="obs-box"><strong>Observação:</strong> ${fmt(semData.obs)}</div>` : ""}
    </div>`;

  html += currentModelo === "semana" ? detalheModeloSemana(idx, semData, tagDia) : detalheModeloAula(idx, semData, tagDia);

  document.getElementById("detail").innerHTML = html;
  if (window.innerWidth <= 850) {
    document.getElementById("detail").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function detalheModeloAula(idx, semData, tagDia) {
  let html = "";
  const aulasDoDia = extrairAulas(tagDia);

  if (aulasDoDia.length > 0) {
    html += `<div class="sec-title">Aulas Correspondentes</div>`;
    aulasDoDia.forEach(n => {
      const linhas = currentAulas[n] || [];
      if (!linhas.length) {
        html += `<div class="lesson-card"><div class="lesson-header"><span>Aula ${n}</span>${botaoCheck(idx, "A" + n, semData.key)}</div>
          <div class="lesson-body"><p>Esta aula ainda não tem conteúdo cadastrado na planilha.</p></div></div>`;
        return;
      }
      const caps = [...new Set(linhas.map(l => l.cap).filter(Boolean))];
      html += `
        <div class="lesson-card">
          <div class="lesson-header">
            <span>Aula ${n}${caps.length ? " — Capítulo" + (caps.length > 1 ? "s " : " ") + esc(caps.join(" e ")) : ""}</span>
            ${botaoCheck(idx, "A" + n, semData.key)}
          </div>
          <div class="lesson-body">
            ${blocoTemas(linhas)}
            ${blocoCampo(linhas, "expectativas", "Expectativas de Aprendizagem")}
            ${blocoCampo(linhas, "instrucoes", "Instruções de Trabalho")}
            ${blocoCampo(linhas, "exercicios", "Exercícios Sugeridos")}
          </div>
        </div>`;
    });
  } else {
    html += tagDia
      ? `<div class="not-found">Sem aula numerada vinculada a este dia: <strong>${fmt(tagDia)}</strong></div>`
      : `<div class="not-found">Nenhuma atividade registrada para este dia.</div>`;
    const capsEmenta = extrairCapitulos(semData.ementas).filter(c => currentCaps[c]);
    if (tagDia && capsEmenta.length) {
      html += `<div class="sec-title">Conteúdo da Ementa (Capítulos ${capsEmenta.join(", ")})</div>`;
      capsEmenta.forEach(c => {
        const linhas = currentCaps[c];
        html += `<div class="lesson-card"><div class="lesson-header"><span>Capítulo ${c}</span></div>
          <div class="lesson-body">${blocoTemas(linhas)}${blocoCampo(linhas, "expectativas", "Expectativas de Aprendizagem")}</div></div>`;
      });
    }
  }
  return html;
}

function detalheModeloSemana(idx, semData, tagDia) {
  const ref = resolverReferencia(tagDia);

  if (!ref.nums.length) {
    return `<div class="detail-empty"><h3>Este dia (${esc(tagDia || "sem atividade")}) refere-se a evento/recesso/feriado/avaliação/revisão e não possui semana de aula vinculada.</h3></div>`;
  }

  let tipo = ref.tipo;
  if (tipo === "numero") tipo = ref.nums.some(n => currentAulaIdx[n]) ? "aula" : "semana";

  const alvos = new Map();
  const faltando = [];
  ref.nums.forEach(n => {
    if (tipo === "semana") {
      if (currentSemanas[n]) alvos.set(n, null); else faltando.push(n);
    } else {
      const s = (currentAulaIdx[n] || [])[0];
      if (s === undefined) { faltando.push(n); return; }
      if (!alvos.has(s)) alvos.set(s, new Set());
      if (alvos.get(s)) alvos.get(s).add(n);
    }
  });

  const rotulo = tipo === "semana" ? "Semana" : "Aula";
  let html = "";
  if (alvos.size) html += `<div class="sec-title">${tipo === "semana" ? "Semana de Aula" : "Aulas Correspondentes"}</div>`;

  alvos.forEach((foco, s) => {
    const d = currentSemanas[s];
    let aulas = d.aulas.length ? d.aulas : [{ num: null, key: "S" + s, texto: d.divisao || "Conteúdo da semana" }];
    if (foco) aulas = aulas.filter(a => foco.has(a.num));

    const linhasAula = aulas.map(a => `
      <div class="aula-row">
        <div class="aula-txt">${fmt(a.texto)}</div>
        ${botaoCheck(idx, a.key, semData.key)}
      </div>`).join("");

    html += `
      <div class="lesson-card">
        <div class="lesson-header"><span>Semana ${s}${d.modulo ? " — " + esc(d.modulo) : ""}</span></div>
        <div class="lesson-body">
          ${d.tema ? `<p><strong>Tema do Módulo:</strong> ${fmt(d.tema)}</p>` : ""}
          <div class="txt-sec"><strong>${d.aulas.length ? "Divisão do conteúdo por aula" : "Conteúdo"}</strong>${linhasAula}</div>
          ${blocoTexto("Objetivos de aprendizagem", d.objetivos)}
          ${blocoTexto("Exercícios de sala", d.sala)}
          ${blocoTexto("Exercícios de casa", d.casa)}
          ${blocoTexto("Atividades práticas", d.prat)}
        </div>
      </div>`;
  });

  if (faltando.length) {
    html += `<div class="not-found">${rotulo}${faltando.length > 1 ? "s" : ""} ${faltando.join(", ")} (${esc(tagDia)}) ainda não ${faltando.length > 1 ? "têm" : "tem"} conteúdo cadastrado na segunda parte da planilha.</div>`;
  }
  return html;
}

/* ================= CHECK DE AULA ================= */
function darCheck(weekIdx, k, aulaKey) {
  if (!usuarioLogado) {
    abrirModalAuth("login");
    return;
  }
  const sem = currentWeeks[weekIdx];
  if (!sem) return;

  const dia = COLUNAS_DIAS[k][0];
  const dados = { disciplina: disciplinaAtualKey, serie: currentSheetName, semana: sem.key, dia, aulaIndex: aulaKey };
  const chave = chaveCheck(dados);
  if (checksSet.has(chave)) return;
  checksSet.add(chave);
  relCarregado = false;

  // Só o botão deste dia/aula é alterado.
  const btn = document.getElementById(`btn-check-${weekIdx}-${k}-${aulaKey}`);
  const desfazer = () => {
    checksSet.delete(chave);
    if (btn) { btn.classList.remove("checked"); btn.innerHTML = `${ic("check", 14)} Dar Check`; btn.disabled = false; }
  };
  if (btn) { btn.classList.add("checked"); btn.innerHTML = `${ic("check", 14)} Concluído`; btn.disabled = true; }

  fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipo: "check",
      professorEmail: usuarioLogado.email,
      disciplina: dados.disciplina,
      serie: dados.serie,
      semana: dados.semana,
      dia: dados.dia,
      aulaIndex: dados.aulaIndex,
      status: "Concluído",
      dataHora: new Date().toISOString()
    })
  }).catch(() => {
    desfazer();
    alert("Não foi possível registrar o check. Verifique a conexão e tente de novo.");
  });
}

/* ================= RELATÓRIOS ================= */
function abrirRelatorios() {
  mostrarTela("report");
  SUB.innerText = "Relatórios de Acompanhamento";
  if (!relCarregado) carregarRelatorio();
}

async function carregarRelatorio() {
  showLoading("Gerando relatório...");
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=getRelatorio`);
    const data = await res.json();
    if (!data || !Array.isArray(data.professores) || !Array.isArray(data.checks)) throw new Error("resposta inválida");
    relProfessores = data.professores.map(normalizarProfessor).filter(p => p.email);
    relChecks = data.checks.map(normalizarCheck).filter(c => c.professorEmail);
    relCarregado = true;
    popularFiltrosRelatorio();
    renderizarRelatorio();
  } catch (e) {
    document.getElementById("rel-cards").innerHTML = "";
    RELPROF.innerHTML = `<div class="rel-vazio">Erro ao carregar os dados do relatório. Confira se o Apps Script foi reimplantado e tente atualizar.</div>`;
    document.getElementById("rel-series").innerHTML = "";
    document.getElementById("rel-historico").innerHTML = "";
  }
  hideLoading();
}

function popularFiltrosRelatorio() {
  const selDisc = document.getElementById("rel-disciplina");
  const selUni = document.getElementById("rel-unidade");
  const discAnt = selDisc.value, uniAnt = selUni.value;

  const discs = [...new Set([...relProfessores.flatMap(p => p.disciplinas), ...relChecks.map(c => c.disciplina)].filter(Boolean))]
    .sort((a, b) => nomeDisciplina(a).localeCompare(nomeDisciplina(b), "pt-BR"));
  const unis = [...new Set(relProfessores.flatMap(p => p.unidades).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));

  selDisc.innerHTML = `<option value="">Todas</option>` + discs.map(d => `<option value="${esc(d)}">${esc(nomeDisciplina(d))}</option>`).join("");
  selUni.innerHTML = `<option value="">Todas</option>` + unis.map(u => `<option value="${esc(u)}">${esc(u)}</option>`).join("");
  selDisc.value = discs.includes(discAnt) ? discAnt : "";
  selUni.value = unis.includes(uniAnt) ? uniAnt : "";
}

function limparFiltrosRelatorio() {
  ["rel-professor", "rel-disciplina", "rel-unidade", "rel-situacao", "rel-de", "rel-ate"].forEach(id => document.getElementById(id).value = "");
  renderizarRelatorio();
}

function rotuloAula(idx) {
  return String(idx || "").replace(/^A(\d+)$/, "Aula $1").replace(/^S(\d+)$/, "Semana $1");
}

function renderizarRelatorio() {
  const fDisc = val("rel-disciplina");
  const fUni = val("rel-unidade");
  const fSit = val("rel-situacao");
  const fProf = norm(val("rel-professor"));
  const fDe = val("rel-de");
  const fAte = val("rel-ate");
  const dtDe = fDe ? new Date(fDe + "T00:00:00") : null;
  const dtAte = fAte ? new Date(fAte + "T23:59:59") : null;

  const mapaProf = {};
  relProfessores.forEach(p => { mapaProf[p.email] = p; });
  const profOk = email => {
    if (!fProf) return true;
    const p = mapaProf[email];
    return norm((p ? p.nome : "") + " " + email).indexOf(fProf) >= 0;
  };

  const checks = relChecks.filter(c => {
    const p = mapaProf[c.professorEmail];
    if (fDisc && c.disciplina !== fDisc) return false;
    if (fUni && (!p || !p.unidades.includes(fUni))) return false;
    if (!profOk(c.professorEmail)) return false;
    if (dtDe || dtAte) {
      const d = new Date(c.dataHora);
      if (isNaN(d.getTime())) return false;
      if (dtDe && d < dtDe) return false;
      if (dtAte && d > dtAte) return false;
    }
    return true;
  });

  // um registro por professor/disciplina/série/semana/dia/aula
  const unicos = new Map();
  checks.forEach(c => {
    const k = [c.professorEmail, c.disciplina, c.serie, c.semana, c.dia, c.aulaIndex].join("|");
    const ant = unicos.get(k);
    if (!ant || new Date(c.dataHora) > new Date(ant.dataHora)) unicos.set(k, c);
  });
  const checksUnicos = [...unicos.values()];

  // ---- conformidade por professor ----
  const porProf = {};
  relProfessores.forEach(p => {
    if (fDisc && !p.disciplinas.includes(fDisc)) return;
    if (fUni && !p.unidades.includes(fUni)) return;
    if (!profOk(p.email)) return;
    porProf[p.email] = { nome: p.nome || p.email, email: p.email, unidade: p.unidade, disciplinas: p.disciplinas, aulas: 0, ultimo: null };
  });
  checksUnicos.forEach(c => {
    if (!porProf[c.professorEmail]) {
      const p = mapaProf[c.professorEmail];
      porProf[c.professorEmail] = { nome: p ? (p.nome || p.email) : c.professorEmail, email: c.professorEmail, unidade: p ? p.unidade : "", disciplinas: p ? p.disciplinas : [c.disciplina], aulas: 0, ultimo: null };
    }
    const o = porProf[c.professorEmail];
    o.aulas++;
    const d = new Date(c.dataHora);
    if (!isNaN(d.getTime()) && (!o.ultimo || d > o.ultimo)) o.ultimo = d;
  });
  const todosProf = Object.values(porProf).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const comRegistro = todosProf.filter(p => p.aulas > 0).length;
  const semRegistro = todosProf.length - comRegistro;

  document.getElementById("rel-cards").innerHTML = `
    <div class="stat-card"><div class="num">${comRegistro}</div><div class="lbl">Professores com registro</div></div>
    <div class="stat-card"><div class="num">${semRegistro}</div><div class="lbl">Professores sem registro</div></div>`;

  relListaProf = todosProf.filter(p => fSit === "com" ? p.aulas > 0 : fSit === "sem" ? p.aulas === 0 : true);
  if (!relListaProf.length) {
    RELPROF.innerHTML = `<div class="rel-vazio">Nenhum professor encontrado para os filtros escolhidos.</div>`;
  } else {
    let t = `<table class="rel-table"><thead><tr><th>Professor</th><th>E-mail</th><th>Unidade</th><th>Disciplina(s)</th><th>Aulas dadas</th><th>Última atividade</th><th>Situação</th></tr></thead><tbody>`;
    relListaProf.forEach(p => {
      t += `<tr>
        <td>${esc(p.nome)}</td>
        <td>${esc(p.email)}</td>
        <td>${esc(p.unidade || "—")}</td>
        <td>${esc(p.disciplinas.map(nomeDisciplina).join(", ") || "—")}</td>
        <td class="num">${p.aulas}</td>
        <td>${p.ultimo ? formatarDataHora(p.ultimo.toISOString()) : "—"}</td>
        <td>${p.aulas > 0 ? '<span class="pill ok">Com registro</span>' : '<span class="pill zero">Sem registro</span>'}</td>
      </tr>`;
    });
    RELPROF.innerHTML = t + `</tbody></table>`;
  }

  // ---- aulas por disciplina e série ----
  const porSerie = {};
  checksUnicos.forEach(c => {
    const k = c.disciplina + "|" + c.serie;
    if (!porSerie[k]) porSerie[k] = { disciplina: c.disciplina, serie: c.serie, aulas: 0, profs: new Set(), semanas: new Set() };
    porSerie[k].aulas++;
    porSerie[k].profs.add(c.professorEmail);
    porSerie[k].semanas.add(c.semana);
  });
  relListaSerie = Object.values(porSerie).sort((a, b) =>
    nomeDisciplina(a.disciplina).localeCompare(nomeDisciplina(b.disciplina), "pt-BR") || a.serie.localeCompare(b.serie, "pt-BR", { numeric: true }));
  if (!relListaSerie.length) {
    document.getElementById("rel-series").innerHTML = `<div class="rel-vazio">Nenhuma aula registrada para os filtros escolhidos.</div>`;
  } else {
    let t = `<table class="rel-table"><thead><tr><th>Disciplina</th><th>Série</th><th>Aulas dadas</th><th>Semanas com registro</th><th>Professores</th></tr></thead><tbody>`;
    relListaSerie.forEach(s => {
      t += `<tr><td>${esc(nomeDisciplina(s.disciplina))}</td><td>${esc(s.serie)}</td><td class="num">${s.aulas}</td><td class="num">${s.semanas.size}</td><td class="num">${s.profs.size}</td></tr>`;
    });
    document.getElementById("rel-series").innerHTML = t + `</tbody></table>`;
  }

  // ---- histórico ----
  relHistoricoFiltrado = checks.slice().sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
  const LIMITE = 200;
  document.getElementById("rel-hist-info").innerText = relHistoricoFiltrado.length > LIMITE
    ? `(mostrando os ${LIMITE} mais recentes de ${relHistoricoFiltrado.length} — o PDF traz todos)`
    : `(${relHistoricoFiltrado.length} registros)`;
  if (!relHistoricoFiltrado.length) {
    document.getElementById("rel-historico").innerHTML = `<div class="rel-vazio">Nenhum check encontrado.</div>`;
  } else {
    let t = `<table class="rel-table"><thead><tr><th>Data/Hora</th><th>Professor</th><th>Unidade</th><th>Disciplina</th><th>Série</th><th>Semana</th><th>Dia</th><th>Aula</th><th>Status</th></tr></thead><tbody>`;
    relHistoricoFiltrado.slice(0, LIMITE).forEach(c => {
      const p = mapaProf[c.professorEmail];
      t += `<tr>
        <td>${formatarDataHora(c.dataHora)}</td>
        <td>${esc(p ? p.nome : c.professorEmail)}</td>
        <td>${esc(p ? p.unidade || "—" : "—")}</td>
        <td>${esc(nomeDisciplina(c.disciplina))}</td>
        <td>${esc(c.serie)}</td>
        <td>${esc(c.semana)}</td>
        <td>${esc(c.dia || "—")}</td>
        <td>${esc(rotuloAula(c.aulaIndex))}</td>
        <td>${esc(c.status || "—")}</td>
      </tr>`;
    });
    document.getElementById("rel-historico").innerHTML = t + `</tbody></table>`;
  }
}

/* ================= EXPORTAÇÃO PDF ================= */
function exportarPDF() {
  if (!window.jspdf || !window.jspdf.jsPDF) { alert("A biblioteca de PDF não foi carregada. Verifique a conexão e recarregue a página."); return; }
  if (!relListaProf.length && !relListaSerie.length && !relHistoricoFiltrado.length) { alert("Não há dados para exportar com os filtros atuais."); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const mapaProf = {};
  relProfessores.forEach(p => { mapaProf[p.email] = p; });
  const sel = id => { const s = document.getElementById(id); return s.selectedIndex > 0 ? s.options[s.selectedIndex].text : "Todas"; };
  const de = val("rel-de"), ate = val("rel-ate");
  const filtros = `Professor: ${val("rel-professor").trim() || "Todos"}  |  Disciplina: ${sel("rel-disciplina")}  |  Unidade: ${sel("rel-unidade")}  |  Situação: ${val("rel-situacao") ? sel("rel-situacao") : "Todos"}  |  Período: ${de || "início"} a ${ate || "hoje"}`;

  doc.setFont("helvetica", "bold"); doc.setFontSize(16);
  doc.text("Sincronismo Pensi - Relatório de Acompanhamento", 40, 42);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100);
  doc.text(`Emitido em ${formatarDataHora(new Date().toISOString())}`, 40, 58);
  doc.text(filtros, 40, 72, { maxWidth: 760 });

  const estilo = { fontSize: 8, cellPadding: 4 };
  const cab = { fillColor: [33, 33, 33], textColor: 255 };
  let y = 92;
  const secao = (titulo, head, body) => {
    if (!body.length) return;
    if (y > doc.internal.pageSize.getHeight() - 90) { doc.addPage(); y = 40; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(33);
    doc.text(titulo, 40, y);
    doc.autoTable({ startY: y + 8, head: [head], body, styles: estilo, headStyles: cab, margin: { left: 40, right: 40 } });
    y = doc.lastAutoTable.finalY + 24;
  };

  secao("Conformidade por professor",
    ["Professor", "E-mail", "Unidade", "Disciplina(s)", "Aulas dadas", "Última atividade", "Situação"],
    relListaProf.map(p => [p.nome, p.email, p.unidade || "-", p.disciplinas.map(nomeDisciplina).join(", ") || "-", p.aulas, p.ultimo ? formatarDataHora(p.ultimo.toISOString()) : "-", p.aulas > 0 ? "Com registro" : "Sem registro"]));
  secao("Aulas dadas por disciplina e série",
    ["Disciplina", "Série", "Aulas dadas", "Semanas com registro", "Professores"],
    relListaSerie.map(s => [nomeDisciplina(s.disciplina), s.serie, s.aulas, s.semanas.size, s.profs.size]));
  secao("Histórico de checks",
    ["Data/Hora", "Professor", "Unidade", "Disciplina", "Série", "Semana", "Dia", "Aula", "Status"],
    relHistoricoFiltrado.map(c => { const p = mapaProf[c.professorEmail]; return [formatarDataHora(c.dataHora), p ? p.nome : c.professorEmail, p ? p.unidade || "-" : "-", nomeDisciplina(c.disciplina), c.serie, c.semana, c.dia || "-", rotuloAula(c.aulaIndex), c.status || "-"]; }));

  doc.save("relatorio-sincronismo-pensi.pdf");
}

/* ================= INICIALIZAÇÃO ================= */
hidratarIcones();
montarChecklistDisciplinas();
montarChecklistUnidades();
montarDashboard();
irParaInicio();
