import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

let cacheGlobal = null;

export function useTurmas({ somenteAtivas = false } = {}) {
  const [todas, setTodas] = useState(cacheGlobal || []);
  const [carregando, setCarregando] = useState(!cacheGlobal);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "turmas_escolares"),
      (snap) => {
        const lista = [];
        snap.forEach((d) => {
          const data = d.data();
          lista.push({
            id: d.id,
            unidade: data.unidade,
            serie: data.serie,
            turno: data.turno,
            turma: data.turma,
            ativo: data.ativo !== false,
          });
        });
        lista.sort((a, b) =>
          [a.unidade, a.serie, a.turno, a.turma]
            .join("|")
            .localeCompare([b.unidade, b.serie, b.turno, b.turma].join("|"), "pt-BR")
        );
        cacheGlobal = lista;
        setTodas(lista);
        setCarregando(false);
      },
      (err) => {
        console.error("Erro ao escutar turmas_escolares:", err);
        setCarregando(false);
      }
    );
    return unsub;
  }, []);

  const turmas = useMemo(() => {
    if (!somenteAtivas) return todas;
    return todas.filter((t) => t.ativo);
  }, [todas, somenteAtivas]);

  const getSeriesPorUnidades = (unidadesSelecionadas) => {
    if (!unidadesSelecionadas?.length) return [];
    const filtradas = turmas.filter((t) => unidadesSelecionadas.includes(t.unidade));
    return [...new Set(filtradas.map((t) => t.serie))].sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );
  };

  const getTurmasPorUnidadesESeries = (unidadesSelecionadas, seriesSelecionadas) => {
    if (!unidadesSelecionadas?.length || !seriesSelecionadas?.length) return [];
    return turmas.filter(
      (t) =>
        unidadesSelecionadas.includes(t.unidade) &&
        seriesSelecionadas.includes(t.serie)
    );
  };

  return {
    turmas,
    todas,
    carregando,
    getSeriesPorUnidades,
    getTurmasPorUnidadesESeries,
  };
}