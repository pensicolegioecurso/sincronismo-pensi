
import { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "./useAuth";

import {
  normalizarTurma,
  normalizarUnidade,
  extrairSerieTurma,
} from "../utils/turmas";

function formatarData(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function converterData(valor) {
  if (!valor) return "";

  if (typeof valor === "string") {
    return valor.slice(0, 10);
  }

  if (valor instanceof Date) {
    return formatarData(valor);
  }

  if (typeof valor.toDate === "function") {
    return formatarData(valor.toDate());
  }

  return "";
}

function normalizarSerie(valor) {
  return (
    extrairSerieTurma(valor) ||
    normalizarTurma(valor)
  );
}

export function useCalendario() {
  const { user } = useAuth();
  const [calendarios, setCalendarios] = useState([]);
  const [erroCarregamento, setErroCarregamento] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setCalendarios([]);
      setErroCarregamento(false);
      return undefined;
    }
    const unsubscribe = onSnapshot(
      collection(db, "calendarios"),
      (snapshot) => {
        setErroCarregamento(false);
        setCalendarios(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      },
      (error) => {
        console.error("Erro ao carregar calendários:", error);
        setErroCarregamento(true);
      }
    );

    return unsubscribe;
  }, [user?.uid]);

  const isDiaLetivo = useCallback(
    (dataObj, turmaNome, serieNome, unidadeNome) => {
      if (!dataObj) return false;

      const dataDate =
        dataObj instanceof Date
          ? dataObj
          : new Date(dataObj);

      if (Number.isNaN(dataDate.getTime())) {
        return false;
      }

      const diaSemana = dataDate.getDay();

      if (diaSemana === 0 || diaSemana === 6) {
        return false;
      }

      const data = formatarData(dataDate);

      const unidadeAtual = normalizarUnidade(unidadeNome);
      const turmaAtual = normalizarTurma(turmaNome);
      const serieAtual = normalizarSerie(serieNome);

      return !calendarios.some((calendario) => {
        const inicioCalendario = converterData(calendario.inicio);
        const fimCalendario = converterData(calendario.fim);

        if (!inicioCalendario || !fimCalendario) {
          return false;
        }

        if (
          data < inicioCalendario ||
          data > fimCalendario
        ) {
          return false;
        }

        return (calendario.excecoes || []).some((excecao) => {
          const inicioExcecao = converterData(
            excecao.dataInicio
          );

          const fimExcecao =
            converterData(excecao.dataFim) ||
            inicioExcecao;

          if (!inicioExcecao) return false;

          if (
            data < inicioExcecao ||
            data > fimExcecao
          ) {
            return false;
          }

          // Se a exceção possui unidade, ela só vale
          // para aquela unidade.
          if (excecao.unidade) {
            const unidadeExcecao = normalizarUnidade(
              excecao.unidade
            );

            if (unidadeExcecao !== unidadeAtual) {
              return false;
            }
          }

          // Exceção para todas as turmas da unidade.
          if (excecao.tipo === "todas") {
            return true;
          }

          // Exceção para uma série inteira.
          if (excecao.tipo === "serie") {
            return (
              normalizarSerie(excecao.serie) === serieAtual
            );
          }

          // Exceção para uma turma específica.
          if (excecao.tipo === "turma") {
            return (
              normalizarTurma(excecao.turma) === turmaAtual
            );
          }

          return false;
        });
      });
    },
    [calendarios]
  );

  return {
    calendarios,
    isDiaLetivo,
    erroCarregamento,
  };
}
