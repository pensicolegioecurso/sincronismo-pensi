const MESES = {
  janeiro: 1, fevereiro: 2, marco: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

export function hoje() {
  const d = new Date();
  return {
    dia: d.getDate(),
    mes: d.getMonth() + 1,
    ano: d.getFullYear(),
    dow: d.getDay(),
  };
}

export function mesmaData(dataStr, alvo) {
  if (!dataStr) return false;
  const s = String(dataStr);
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return +iso[3] === alvo.dia && +iso[2] === alvo.mes;
  const br = s.match(/(\d{1,2})\s*[\/\-]\s*(\d{1,2})/);
  if (br) return +br[1] === alvo.dia && +br[2] === alvo.mes;
  return false;
}

export function parseData(texto) {
  let m = texto.match(/(\d{1,2})\s*[\/\-]\s*(\d{1,2})(?:\s*[\/\-]\s*(\d{2,4}))?/);
  if (m)
    return {
      dia: +m[1],
      mes: +m[2],
      ano: m[3] ? +m[3] : hoje().ano,
    };

  m = texto.match(/(\d{1,2})\s*de\s*([a-z]+)/);
  if (m && MESES[m[2]]) return { dia: +m[1], mes: MESES[m[2]], ano: hoje().ano };

  if (texto.includes("hoje")) return hoje();
  if (texto.includes("ontem")) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return {
      dia: d.getDate(),
      mes: d.getMonth() + 1,
      ano: d.getFullYear(),
    };
  }
  if (texto.includes("amanha")) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return {
      dia: d.getDate(),
      mes: d.getMonth() + 1,
      ano: d.getFullYear(),
    };
  }

  return null;
}