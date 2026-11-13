import { useEffect, useRef } from "react";
import { collection, doc, writeBatch, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { DISCIPLINAS_POR_ANO } from "../data/disciplinas";
import { getAba, getAbas, loadGvizSheet } from "../services/api";

function norm(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function cell(row, col) {
  if (col === undefined || col < 0 || !row) return "";
  return row[col] == null ? "" : String(row[col]).trim();
}
function parseDataPeriodo(periodo, ano) {
  const t = String(periodo || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  let m = t.match(/(\d{1,2})\s*[\/.-]\s*([a-z]{3})/);
  if (m) {
    const mes = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"].indexOf(m[2]);
    return mes < 0 ? null : new Date(ano, mes, parseInt(m[1], 10));
  }
  m = t.match(/(\d{1,2})\s*[\/.-]\s*(\d{1,2})/);
  if (m) {
    const mes = parseInt(m[2], 10) - 1;
    return mes < 0 || mes > 11 ? null : new Date(ano, mes, parseInt(m[1], 10));
  }
  return null;
}
function obterDataExata(dataInicio, idxDia) {
  const data = new Date(dataInicio);
  data.setHours(12, 0, 0, 0); 
  data.setDate(data.getDate() + idxDia);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

export default function SincronizadorPlanilha() {
  const jaRodou = useRef(false);

  useEffect(() => {
    if (jaRodou.current) return;
    jaRodou.current = true;

    async function sincronizar() {
      console.log("Iniciando sincronização do calendário...");
      const discKey = "artes"; // Pode expandir para todas depois
      const discInfo = DISCIPLINAS_POR_ANO["2026"]?.[discKey];
      if (!discInfo) return;

      try {
        const abas = await getAbas(discInfo.id);
        const batch = writeBatch(db);
        let total = 0;

        for (const aba of abas) {
          const rows = await loadGvizSheet(discInfo.id, aba);
          if (!rows) continue;

          rows.forEach((r) => {
            const periodoText = cell(r, 0).trim();
            const dataInicio = parseDataPeriodo(periodoText, 2026);
            if (!dataInicio) return;

            const colunasDias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
            colunasDias.forEach((diaNome, idxDia) => {
              const colIdx = idxDia + 2; 
              const conteudoDia = cell(r, colIdx);
              if (!conteudoDia) return;

              const dataStr = obterDataExata(dataInicio, idxDia);
              
              // Extrai as aulas (ex: se for "Aula 1 e 2", salva a data duas vezes)
              const matches = conteudoDia.match(/\d+/g);
              const nums = matches ? matches.map(n => parseInt(n, 10)).filter(n => n > 0 && n < 100) : [1];
              const aulas = [...new Set(nums)];

              aulas.forEach(numAula => {
                const id = `${discKey}_${aba}_${dataStr}_${diaNome}_A${numAula}`.replace(/\//g, "_");
                const ref = doc(db, "calendario_global", id);
                
                // Salva apenas o essencial
                batch.set(ref, {
                  disciplina: discKey,
                  turma: aba,
                  data: dataStr,
                  dia: diaNome,
                  aulaIndex: `A${numAula}`
                });
                total++;
              });
            });
          });
        }

        await batch.commit();
        console.log(`Sincronização concluída! ${total} aulas salvas no banco.`);
      } catch (err) {
        console.error("Erro ao sincronizar:", err);
      }
    }

    sincronizar();
  }, []);

  return null; // Não renderiza nada na tela
}