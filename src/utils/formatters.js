const MESES = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
export const NOMES_MES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
export const COLUNAS_DIAS = [["Segunda","Seg"],["Terça","Ter"],["Quarta","Qua"],["Quinta","Qui"],["Sexta","Sex"],["Sábado","Sáb"]];

export const norm = (s) =>
  String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
export const nh = (s) => norm(s).replace(/\s+/g, " ");
export const pad2 = (n) => String(n).padStart(2, "0");

export function formatarDataHora(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function nomeDisciplina(key, DISCIPLINAS_POR_ANO) {
  for (const ano of Object.keys(DISCIPLINAS_POR_ANO)) {
    if (DISCIPLINAS_POR_ANO[ano][key]) return DISCIPLINAS_POR_ANO[ano][key].nome;
  }
  return key || "—";
}

export function parsePeriodoInicio(periodo, ano) {
  const t = norm(periodo);
  let m = t.match(/(\d{1,2})\s*[\/.-]\s*([a-z]{3})/);
  if (m) {
    const mes = MESES.indexOf(m[2]);
    return mes < 0 ? null : new Date(ano, mes, parseInt(m[1], 10));
  }
  m = t.match(/(\d{1,2})\s*[\/.-]\s*(\d{1,2})/);
  if (m) {
    const mes = parseInt(m[2], 10) - 1;
    return mes < 0 || mes > 11 ? null : new Date(ano, mes, parseInt(m[1], 10));
  }
  return null;
}

export function resolverReferencia(texto) {
  const n = nh(texto).replace(/[ªº°]/g, "");
  if (!n) return { tipo: null, nums: [] };
  const SEP = "(?:;|,|\\/|&|\\+|-|–|—|\\be\\b|\\ba\\b|\\bate\\b)";
  const RE = new RegExp("^(aulas?|semanas?|sem\\.?)?\\s*(\\d+(?:\\s*" + SEP + "\\s*(?:aulas?\\s*|semanas?\\s*|sem\\.?\\s*)?\\d+)*)");
  const m = n.match(RE);
  if (!m) return { tipo: null, nums: [] };
  let tipo = "numero";
  if (m[1]) tipo = m[1].startsWith("aula") ? "aula" : "semana";
  else if (/\bsemanas?\b|\bsem\b/.test(n)) tipo = "semana";
  else if (/\baulas?\b/.test(n)) tipo = "aula";

  const toks = String(m[2]).match(/\d+|-|–|—|\bate\b|\ba\b/g) || [];
  const out = [];
  let prev = null, intervalo = false;
  toks.forEach((t) => {
    if (/^\d+$/.test(t)) {
      const v = parseInt(t, 10);
      if (intervalo && prev !== null && v > prev && v - prev <= 60) {
        for (let k = prev + 1; k < v; k++) out.push(k);
      }
      out.push(v); prev = v; intervalo = false;
    } else intervalo = true;
  });
  return { tipo, nums: [...new Set(out)] };
}

export const extrairAulas = (texto) => {
  const r = resolverReferencia(texto);
  return r.tipo === "semana" ? [] : r.nums;
};

export function extrairCapitulos(texto) {
  let t = String(texto || "");
  const lista = [];
  t = t.replace(/(\d+)\s*(?:a|à|até|-|–)\s*(\d+)/gi, (_, a, b) => {
    a = parseInt(a, 10); b = parseInt(b, 10);
    if (b >= a && b - a < 30) for (let k = a; k <= b; k++) lista.push(k);
    return " ";
  });
  (t.match(/\d+/g) || []).forEach((x) => lista.push(parseInt(x, 10)));
  return [...new Set(lista)].sort((a, b) => a - b);
}

export function chaveCheck(c) {
  return [c.disciplina, c.serie, c.semana, c.dia, c.aulaIndex].join("|");
}

export function normalizarCheck(c) {
  const pick = (obj, ...nomes) => {
    const mapa = {};
    Object.keys(obj || {}).forEach((k) => { mapa[norm(k).replace(/[^a-z0-9]/g, "")] = obj[k]; });
    for (const n of nomes) {
      const v = mapa[n];
      if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
    }
    return "";
  };
  return {
    professorEmail: pick(c, "professoremail", "email").toLowerCase(),
    disciplina: pick(c, "disciplinakey", "disciplina"),
    serie: pick(c, "serie"),
    semana: pick(c, "semana"),
    dia: pick(c, "dia"),
    aulaIndex: pick(c, "aulaindex"),
    status: pick(c, "status"),
    dataHora: pick(c, "datahora"),
  };
}

export function normalizarProfessor(p) {
  const pick = (obj, ...nomes) => {
    const mapa = {};
    Object.keys(obj || {}).forEach((k) => { mapa[norm(k).replace(/[^a-z0-9]/g, "")] = obj[k]; });
    for (const n of nomes) {
      const v = mapa[n];
      if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
    }
    return "";
  };
  const splitDisc = (s) => String(s || "").split(/[,;|]/).map((x) => x.trim()).filter(Boolean);
  const unidades = splitDisc(pick(p, "unidade", "unidades"));
  return {
    nome: pick(p, "nome"),
    email: pick(p, "email", "professoremail").toLowerCase(),
    disciplinas: splitDisc(pick(p, "disciplinas", "disciplinakey", "disciplina")),
    unidades,
    unidade: unidades.join(", "),
    cargo: pick(p, "cargo") || "professor",
  };
}