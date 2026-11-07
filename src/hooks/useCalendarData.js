import { useState, useCallback } from "react";
import { DISCIPLINAS_POR_ANO } from "../data/disciplinas";
import { getAba, getAbas, loadGvizSheet } from "../services/api";
import { norm, nh, resolverReferencia } from "../utils/formatters";

export function useCalendarData() {
  const [dadosCache, setDadosCache] = useState({});
  const [currentWeeks, setCurrentWeeks] = useState([]);
  const [currentAulas, setCurrentAulas] = useState({});
  const [currentCaps, setCurrentCaps] = useState({});
  const [currentSemanas, setCurrentSemanas] = useState({});
  const [currentAulaIdx, setCurrentAulaIdx] = useState({});
  const [currentModelo, setCurrentModelo] = useState("aula");

  const fetchAbas = useCallback(async (disc) => {
    if (disc.abas) return disc.abas;
    const json = await getAbas(disc.id);
    if (!json || json.status !== "success") throw new Error(json?.message || "Falha ao ler abas.");
    return json.abas.filter((n) => norm(n).indexOf("orienta") === -1);
  }, []);

  const carregarAba = useCallback(async (anoAtual, key, sheetName) => {
    const disc = DISCIPLINAS_POR_ANO[anoAtual]?.[key];
    if (!disc) return [];
    let rows = [];
    if (disc.fonte === "script") {
      try {
        const json = await getAba(disc.id, sheetName);
        rows = json?.rows || [];
      } catch { rows = []; }
    } else {
      rows = (await loadGvizSheet(disc.id, sheetName)) || [];
    }
    setDadosCache((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [sheetName]: rows },
    }));
    return rows;
  }, []);

  const detectarModelo = (rows) => {
    const limite = Math.min(rows.length, 30);
    for (let i = 0; i < limite; i++) {
      const r = rows[i] || [];
      for (let j = 0; j < r.length; j++) {
        if (nh(r[j]).indexOf("divisao do conteudo") === 0) return "semana";
      }
    }
    return "aula";
  };

  const processar = useCallback((rows) => {
    const modelo = detectarModelo(rows);
    setCurrentModelo(modelo);
    if (modelo === "semana") processarModeloSemana(rows, setCurrentWeeks, setCurrentSemanas, setCurrentAulaIdx);
    else processarModeloAula(rows, setCurrentWeeks, setCurrentAulas, setCurrentCaps);
  }, []);

  return {
    dadosCache, currentWeeks, currentAulas, currentCaps, currentSemanas,
    currentAulaIdx, currentModelo, fetchAbas, carregarAba, processar,
  };
}


function cel(r, c) {
  if (c === undefined || c < 0 || !r) return "";
  const v = r[c];
  return v == null ? "" : String(v).trim();
}
function uniqueKey(usadas, chave) {
  if (usadas[chave]) { usadas[chave]++; return chave + " #" + usadas[chave]; }
  usadas[chave] = 1; return chave;
}
function expandirNumeros(s) {
  const toks = String(s).match(/\d+|-|–|—|\bate\b|\ba\b/g) || [];
  const out = []; let prev = null, intervalo = false;
  toks.forEach((t) => {
    if (/^\d+$/.test(t)) {
      const v = parseInt(t, 10);
      if (intervalo && prev !== null && v > prev && v - prev <= 60)
        for (let k = prev + 1; k < v; k++) out.push(k);
      out.push(v); prev = v; intervalo = false;
    } else intervalo = true;
  });
  return [...new Set(out)];
}
function extrairCapitulos(texto) {
  let t = String(texto || ""); const lista = [];
  t = t.replace(/(\d+)\s*(?:a|à|até|-|–)\s*(\d+)/gi, (_, a, b) => {
    a = parseInt(a, 10); b = parseInt(b, 10);
    if (b >= a && b - a < 30) for (let k = a; k <= b; k++) lista.push(k);
    return " ";
  });
  (t.match(/\d+/g) || []).forEach((x) => lista.push(parseInt(x, 10)));
  return [...new Set(lista)].sort((a, b) => a - b);
}
function detectarColunas(rows) {
  const col = {}; let headerRow = -1, aulaHeaderRow = -1;
  const limite = Math.min(rows.length, 20);
  for (let i = 0; i < limite; i++) {
    const r = rows[i] || [];
    for (let j = 0; j < r.length; j++) {
      const n = norm(r[j]); if (!n) continue;
      const set = (k, cond) => { if (cond && col[k] === undefined) col[k] = j; };
      set("seg", n.startsWith("segunda")); set("ter", n.startsWith("terca"));
      set("qua", n.startsWith("quarta")); set("qui", n.startsWith("quinta"));
      set("sex", n.startsWith("sexta")); set("sab", n.startsWith("sabado") || n === "sab");
      set("ementas", n.startsWith("ementa")); set("obs", n.startsWith("observa"));
      set("aula", /^(n\s*(da\s*)?)?aulas?(\s*n)?$/.test(n.replace(/[ºª°.]/g, "").trim()));
      set("cap", n === "capitulo" || n === "cap.");
      set("tema", n.startsWith("tema")); set("expect", n.startsWith("expectativa"));
      set("instr", n.startsWith("instruc")); set("exerc", n.startsWith("exercicio"));
    }
    if (headerRow < 0 && col.seg !== undefined) headerRow = i;
    if (aulaHeaderRow < 0 && col.aula !== undefined) aulaHeaderRow = i;
  }
  const padrao = { seg: 2, ter: 3, qua: 4, qui: 5, sex: 6, sab: 7, ementas: 8, obs: 9, aula: 11, cap: 12, tema: 13, expect: 14, instr: 15, exerc: 16 };
  Object.keys(padrao).forEach((k) => { if (col[k] === undefined) col[k] = padrao[k]; });
  return { col, headerRow, aulaHeaderRow };
}
function processarModeloAula(rows, setCurrentWeeks, setCurrentAulas, setCurrentCaps) {
  const { col, headerRow, aulaHeaderRow } = detectarColunas(rows);
  const aulasMap = {}, capsMap = {};

  for (let i = aulaHeaderRow + 1; i < rows.length; i++) {
    const r = rows[i]; if (!r) continue;
    const aulaCell = cel(r, col.aula);
    const nAulaCell = norm(aulaCell);
    if (nAulaCell.indexOf("cortad") !== -1 || nAulaCell === "capitulo") break;

    const cap = cel(r, col.cap), tema = cel(r, col.tema);
    const linha = {
      numAula: aulaCell, cap, tema,
      expectativas: cel(r, col.expect),
      instrucoes: cel(r, col.instr),
      exercicios: cel(r, col.exerc),
    };
    if (!tema && !cap && !linha.expectativas && !linha.instrucoes && !linha.exercicios) continue;

    expandirNumeros(aulaCell.replace(/[ªº°]/g, "")).forEach((n) => {
      (aulasMap[n] = aulasMap[n] || []).push(linha);
    });
    extrairCapitulos(cap).forEach((c) => {
      (capsMap[c] = capsMap[c] || []).push(linha);
    });
  }

  const semanas = [], chavesUsadas = {};
  const temPeriodo = col.seg > 0;
  const reDataPeriodo = /\d{1,2}\s*[\/.-]\s*(?:[a-z]{3,}|\d{1,2})/;

  for (let i = headerRow + 1; i < rows.length; i++) {
    const r = rows[i]; if (!r) continue;
    const dias = {
      "Segunda": cel(r, col.seg), "Terça": cel(r, col.ter), "Quarta": cel(r, col.qua),
      "Quinta": cel(r, col.qui), "Sexta": cel(r, col.sex), "Sábado": cel(r, col.sab),
    };
    const valores = Object.values(dias);
    const temTexto = valores.some((v) => v);
    const periodo = temPeriodo ? cel(r, 0) : "";
    const np = norm(periodo);
    let temData = false;
    if (temPeriodo) {
      if (!np) continue;
      if (np === "semana" || np === "periodo" || np.includes("capitulos") || np.includes("trabalhados")) continue;
      temData = reDataPeriodo.test(np);
    }
    if (!temData && !temTexto) continue;
    if (!temData && !temPeriodo && valores.every((v) => /^\d+$/.test(v))) continue;

    semanas.push({
      key: uniqueKey(chavesUsadas, periodo || ("Semana " + (semanas.length + 1))),
      periodo, ementas: cel(r, col.ementas), obs: cel(r, col.obs), dias,
    });
  }

  setCurrentWeeks(semanas);
  setCurrentAulas(aulasMap);
  setCurrentCaps(capsMap);
}
function extrairAulasDaDivisao(texto) {
  const aulas = [];
  String(texto || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean).forEach((linha) => {
    const m = linha.match(/aula\s*0*(\d+)/i);
    if (m) aulas.push({ num: parseInt(m[1], 10), key: "A" + parseInt(m[1], 10), texto: linha });
    else if (aulas.length) aulas[aulas.length - 1].texto += "\n" + linha;
  });
  return aulas;
}
function processarModeloSemana(rows, setCurrentWeeks, setCurrentSemanas, setCurrentAulaIdx) {
  let headerRow = -1;
  for (let i = 0; i < Math.min(rows.length, 40); i++) {
    if ((rows[i] || []).some((c) => nh(c).startsWith("segunda"))) { headerRow = i; break; }
  }
  const col = {}, rc = {};
  if (headerRow >= 0) {
    const r = rows[headerRow];
    r.forEach((c, j) => {
      const n = nh(c); if (!n) return;
      const set = (k, cond) => { if (cond && col[k] === undefined) col[k] = j; };
      set("per", n === "semana"); set("seg", n.startsWith("segunda"));
      set("ter", n.startsWith("terca")); set("qua", n.startsWith("quarta"));
      set("qui", n.startsWith("quinta")); set("sex", n.startsWith("sexta"));
      set("sab", n.startsWith("sabado")); set("ementas", n.startsWith("ementa"));
      set("obs", n.startsWith("observa"));
    });
    const lim = col.obs !== undefined ? col.obs : (col.ementas !== undefined ? col.ementas : (col.sab !== undefined ? col.sab : 0));
    r.forEach((c, j) => {
      if (j <= lim) return;
      const n = nh(c); if (!n) return;
      const set = (k, cond) => { if (cond && rc[k] === undefined) rc[k] = j; };
      set("sem", n.startsWith("semana")); set("tema", n.startsWith("tema"));
      set("mod", n.startsWith("modulo")); set("div", n.startsWith("divisao"));
      set("obj", n.startsWith("objetivo"));
      set("sala", n.startsWith("exercicio") && n.includes("sala"));
      set("casa", n.startsWith("exercicio") && n.includes("casa"));
      set("prat", n.includes("pratica"));
    });
  }
  const defEsq = { per: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6, ementas: 7, obs: 8 };
  const defDir = { sem: 10, mod: 11, tema: 12, div: 13, obj: 14, sala: 15, casa: 16, prat: 17 };
  Object.keys(defEsq).forEach((k) => { if (col[k] === undefined) col[k] = defEsq[k]; });
  Object.keys(defDir).forEach((k) => { if (rc[k] === undefined) rc[k] = defDir[k]; });

  const semanas = [], semanasMap = {}, aulaIdx = {}, usadas = {};
  const reData = /\d{1,2}\s*[\/.-]\s*(?:[a-z]{3,}|\d{1,2})/;

  for (let i = headerRow + 1; i < rows.length; i++) {
    const r = rows[i]; if (!r) continue;
    const periodo = cel(r, col.per);
    if (reData.test(norm(periodo))) {
      semanas.push({
        key: uniqueKey(usadas, periodo), periodo,
        ementas: cel(r, col.ementas), obs: cel(r, col.obs),
        dias: {
          "Segunda": cel(r, col.seg), "Terça": cel(r, col.ter), "Quarta": cel(r, col.qua),
          "Quinta": cel(r, col.qui), "Sexta": cel(r, col.sex), "Sábado": cel(r, col.sab),
        },
      });
    }
    const celSem = cel(r, rc.sem);
    let nums = resolverReferencia(celSem).nums;
    if (!nums.length) { const m = celSem.match(/\d+/); if (m) nums = [parseInt(m[0], 10)]; }
    if (nums.length) {
      const d = {
        num: nums[0], modulo: cel(r, rc.mod), tema: cel(r, rc.tema),
        divisao: cel(r, rc.div), objetivos: cel(r, rc.obj),
        sala: cel(r, rc.sala), casa: cel(r, rc.casa), prat: cel(r, rc.prat),
      };
      d.aulas = extrairAulasDaDivisao(d.divisao);
      const temConteudo = d.modulo || d.tema || d.divisao || d.objetivos || d.sala || d.casa || d.prat;
      if (temConteudo) {
        nums.forEach((num) => {
          if (semanasMap[num]) return;
          semanasMap[num] = d;
          d.aulas.forEach((a) => { (aulaIdx[a.num] = aulaIdx[a.num] || []).push(num); });
        });
      }
    }
  }
  setCurrentWeeks(semanas);
  setCurrentSemanas(semanasMap);
  setCurrentAulaIdx(aulaIdx);
}