const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyfK8QCoWrjiQh64UDJ9l_RL2eREZEOI2vUZ_rQ6_YpG4APA12doBTsOTErYiNWjRFshg/exec";

export async function loginRequest(email, senha) {
  const res = await fetch(`${APPS_SCRIPT_URL}?action=login&email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`);
  return res.json();
}

export async function registerRequest(payload) {
  const { nome, email, senha, disciplinas, unidade, cargo } = payload;
  const url =
    `${APPS_SCRIPT_URL}?action=cadastrar&nome=${encodeURIComponent(nome)}` +
    `&email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}` +
    `&disciplinas=${encodeURIComponent(disciplinas.join(","))}` +
    `&unidade=${encodeURIComponent(unidade)}&cargo=${encodeURIComponent(cargo || "professor")}`;
  const res = await fetch(url);
  return res.json();
}

export async function getChecks(email) {
  const res = await fetch(`${APPS_SCRIPT_URL}?action=getChecks&email=${encodeURIComponent(email)}`);
  return res.json();
}

export async function postCheck(payload) {
  return fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getRelatorio() {
  const res = await fetch(`${APPS_SCRIPT_URL}?action=getRelatorio`);
  return res.json();
}

export async function getAbas(id) {
  const res = await fetch(`${APPS_SCRIPT_URL}?action=getAbas&id=${encodeURIComponent(id)}&fresh=1&_=${Date.now()}`);
  return res.json();
}

export async function getAba(id, aba) {
  const res = await fetch(`${APPS_SCRIPT_URL}?action=getAba&id=${encodeURIComponent(id)}&aba=${encodeURIComponent(aba)}&fresh=1&_=${Date.now()}`);
  return res.json();
}

export function loadGvizSheet(sheetId, sheetName) {
  return new Promise((resolve) => {
    const cb = "cbg" + Math.random().toString(36).slice(2);
    const script = document.createElement("script");
    let fim = false;
    const limpar = () => { if (fim) return; fim = true; clearTimeout(t); delete window[cb]; script.remove(); };
    const t = setTimeout(() => { limpar(); resolve(null); }, 12000);
    window[cb] = (json) => { const rows = json?.table ? parseGvizTable(json.table) : null; limpar(); resolve(rows); };
    script.onerror = () => { limpar(); resolve(null); };
    script.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=responseHandler:${cb}&sheet=${encodeURIComponent(sheetName)}`;
    document.body.appendChild(script);
  });
}

function valorCelula(cell) {
  if (!cell) return "";
  const v = cell.v;
  if (v === null || v === undefined) return cell.f ?? "";
  if (typeof v === "string" && v.startsWith("Date(")) return cell.f || v;
  return v;
}

export function parseGvizTable(table) {
  const rows = [];
  if (table.cols?.some((c) => c?.label)) {
    rows.push(table.cols.map((c) => c?.label || ""));
  }
  table.rows.forEach((r) => {
    const rowObj = [];
    (r.c || []).forEach((cell, idx) => { rowObj[idx] = valorCelula(cell); });
    rows.push(rowObj);
  });
  return rows;
}