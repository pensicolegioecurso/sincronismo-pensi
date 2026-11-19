
import { useState, useEffect, useMemo } from "react";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../services/firebase";

let cacheGlobal = null;

function normalizarLista(valor) {
  if (Array.isArray(valor)) {
    return valor.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof valor === "string") {
    return valor.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function possuiCargo(perfil, cargos) {
  const lista = [
    ...(Array.isArray(perfil.cargos) ? perfil.cargos : []),
    perfil.cargo,
  ]
    .filter(Boolean)
    .map((cargo) => String(cargo).toLowerCase());

  return cargos.some((cargo) => lista.includes(cargo));
}

export function useTurmas({ somenteAtivas = false } = {}) {
  const [todas, setTodas] = useState(cacheGlobal || []);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot = null;
    let ativo = true;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!ativo) return;

      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!firebaseUser) {
        setTodas([]);
        setCarregando(false);
        return;
      }

      setCarregando(true);

      try {
        const perfilRef = doc(db, "users", firebaseUser.uid);
        const perfilSnap = await getDoc(perfilRef);

        if (!ativo) return;

        if (!perfilSnap.exists()) {
          setTodas([]);
          setCarregando(false);
          return;
        }

        const perfil = perfilSnap.data();

        const admin = possuiCargo(perfil, ["admin", "administrador"]);
        const nucleo = possuiCargo(perfil, ["nucleo"]);
        const regional = possuiCargo(perfil, ["regional"]);
        const direcao = possuiCargo(perfil, [
          "diretor",
          "direcao",
          "coordenador",
        ]);

        let consulta = collection(db, "turmas_escolares");

        if (admin || nucleo) {
          // Admin e Núcleo podem consultar todas as turmas.
        } else {
          let unidadesPermitidas = [];

          if (regional) {
            unidadesPermitidas = normalizarLista(perfil.unidadesComando);
          } else if (direcao) {
            unidadesPermitidas = normalizarLista(perfil.unidade);
          } else {
            setTodas([]);
            setCarregando(false);
            return;
          }

          if (!unidadesPermitidas.length) {
            setTodas([]);
            setCarregando(false);
            return;
          }

          consulta = query(
            collection(db, "turmas_escolares"),
            where("unidade", "in", unidadesPermitidas.slice(0, 30))
          );
        }

        unsubscribeSnapshot = onSnapshot(
          consulta,
          (snap) => {
            if (!ativo) return;

            const lista = snap.docs.map((d) => {
              const data = d.data();

              return {
                id: d.id,
                unidade: data.unidade,
                serie: data.serie,
                turno: data.turno,
                turma: data.turma,
                ativo: data.ativo !== false,
              };
            });

            lista.sort((a, b) =>
              [a.unidade, a.serie, a.turno, a.turma]
                .join("|")
                .localeCompare(
                  [b.unidade, b.serie, b.turno, b.turma].join("|"),
                  "pt-BR"
                )
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
      } catch (err) {
        console.error("Erro ao carregar perfil para consultar turmas:", err);
        setTodas([]);
        setCarregando(false);
      }
    });

    return () => {
      ativo = false;

      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }

      unsubscribeAuth();
    };
  }, []);

  const turmas = useMemo(() => {
    if (!somenteAtivas) return todas;

    return todas.filter((t) => t.ativo);
  }, [todas, somenteAtivas]);

  const getSeriesPorUnidades = (unidadesSelecionadas) => {
    if (!unidadesSelecionadas?.length) return [];

    const filtradas = turmas.filter((t) =>
      unidadesSelecionadas.includes(t.unidade)
    );

    return [...new Set(filtradas.map((t) => t.serie))].sort(
      (a, b) => a.localeCompare(b, "pt-BR")
    );
  };

  const getTurmasPorUnidadesESeries = (
    unidadesSelecionadas,
    seriesSelecionadas
  ) => {
    if (!unidadesSelecionadas?.length || !seriesSelecionadas?.length) {
      return [];
    }

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
