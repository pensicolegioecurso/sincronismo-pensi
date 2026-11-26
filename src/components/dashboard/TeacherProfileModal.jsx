
// src/components/dashboard/TeacherProfileModal.jsx
import { createPortal } from "react-dom";
import { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useCalendario } from "../../hooks/useCalendario";
import { parseTurmasPorUnidade, chaveTurma } from "../../utils/turmas";
import { Loader2 } from "lucide-react";

import ProfileHeader from "./profile/ProfileHeader";
import ProfileTabs from "./profile/ProfileTabs";
import ProfileCheckList from "./profile/ProfileCheckList";

function normalizarTexto(t) {
  return String(t || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function gerarDiasUteis(dataInicio, dataFim) {
  const dias = [];
  let atual = new Date(dataInicio);

  while (atual <= dataFim) {
    const diaSemana = atual.getDay();

    if (diaSemana !== 0 && diaSemana !== 6) {
      const strData = new Date(
        atual.getTime() - atual.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];

      dias.push(strData);
    }

    atual.setDate(atual.getDate() + 1);
  }

  return dias;
}

export default function TeacherProfileModal({ user, onClose, onDirectMessage, onAddShortcut }) {
  const { isDiaLetivo, calendarios } = useCalendario();

  const [abaAtiva, setAbaAtiva] = useState("pendente");
  const [checksReais, setChecksReais] = useState([]);
  const [pendentesGerados, setPendentesGerados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const turmasAtivasPorUnidade = useMemo(() => {
    if (!user) return {};

    const mapa = parseTurmasPorUnidade(user.turmas || "");
    const inativasU = new Set(user.unidadesInativas || []);
    const inativasT = new Set(user.turmasInativas || []);
    const resultado = {};

    Object.entries(mapa).forEach(([uni, turmas]) => {
      if (inativasU.has(uni)) return;

      const ativas = turmas.filter(
        (t) => !inativasT.has(chaveTurma(uni, t))
      );

      if (ativas.length > 0) {
        resultado[uni] = ativas;
      }
    });

    return resultado;
  }, [user]);

  useEffect(() => {
    if (!user?.id || !calendarios.length) return;

    let cancelado = false;

    async function carregar() {
      setCarregando(true);

      try {
        const snap = await getDocs(
          query(
            collection(db, "checks"),
            where("professorUid", "==", user.id)
          )
        );

        if (cancelado) return;

        const listaChecks = [];

        snap.forEach((d) => {
          const data = d.data();
          const dataHora = data.dataHora
            ? new Date(data.dataHora)
            : null;

          listaChecks.push({
            id: d.id,
            tipo: data.tipo || "aula",
            status: data.status || "pendente",
            disciplina: data.disciplina || "",
            serie: data.serie || "",
            unidade: data.unidade || "",
            aulaIndex: data.aulaIndex || "",
            diaNome: data.diaNome || "",
            dataReal: data.dataReal || "",
            justificativa: data.justificativa || "",
            observacao: data.observacao || "",
            dataHora,
          });
        });

        listaChecks.sort(
          (a, b) =>
            (b.dataHora?.getTime() || 0) -
            (a.dataHora?.getTime() || 0)
        );

        setChecksReais(listaChecks);

        const agora = new Date();
        agora.setHours(0, 0, 0, 0);

        let dataCadastro = new Date(0);

        if (user.criadoEm) {
          dataCadastro = user.criadoEm.toDate
            ? user.criadoEm.toDate()
            : new Date(user.criadoEm);
        }

        dataCadastro.setHours(0, 0, 0, 0);

        const calAtivo = calendarios[0];
        const listaPendentes = [];

        if (calAtivo && calAtivo.inicio && calAtivo.fim) {
          const diasUteis = gerarDiasUteis(
            new Date(calAtivo.inicio + "T12:00:00"),
            new Date(calAtivo.fim + "T12:00:00")
          );

          diasUteis.forEach((diaStr) => {
            const dataObj = new Date(diaStr + "T12:00:00");

            if (dataObj < dataCadastro || dataObj > agora) return;
            if (!isDiaLetivo(dataObj, "", "")) return;

            Object.entries(turmasAtivasPorUnidade).forEach(
              ([uni, turmas]) => {
                turmas.forEach((turma) => {
                  const checkDoDia = listaChecks.find(
                    (c) =>
                      c.dataReal === diaStr &&
                      (
                        normalizarTexto(c.serie) ===
                          normalizarTexto(turma) ||
                        normalizarTexto(c.serie).includes(
                          normalizarTexto(turma)
                        ) ||
                        normalizarTexto(turma).includes(
                          normalizarTexto(c.serie)
                        )
                      )
                  );

                  if (!checkDoDia) {
                    listaPendentes.push({
                      id: `pendente_${diaStr}_${turma}`,
                      tipo: "pendente",
                      status: "pendente",
                      disciplina: "Aula não registrada",
                      serie: turma,
                      unidade: uni,
                      dataReal: diaStr,
                      dataHora: dataObj,
                    });
                  }
                });
              }
            );
          });
        }

        listaPendentes.sort(
          (a, b) =>
            (b.dataHora?.getTime() || 0) -
            (a.dataHora?.getTime() || 0)
        );

        if (!cancelado) {
          setPendentesGerados(listaPendentes);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelado) {
          setCarregando(false);
        }
      }
    }

    carregar();

    return () => {
      cancelado = true;
    };
  }, [user, calendarios, isDiaLetivo, turmasAtivasPorUnidade]);

  const counts = {
    pendente: pendentesGerados.length,
    feito: checksReais.filter(
      (c) =>
        c.status !== "justificado" &&
        c.tipo !== "justificativa"
    ).length,
    justificado: checksReais.filter(
      (c) =>
        c.status === "justificado" ||
        c.tipo === "justificativa"
    ).length,
  };

  const listaAtiva =
    abaAtiva === "pendente"
      ? pendentesGerados
      : abaAtiva === "justificado"
        ? checksReais.filter(
            (c) =>
              c.status === "justificado" ||
              c.tipo === "justificativa"
          )
        : checksReais.filter(
            (c) =>
              c.status !== "justificado" &&
              c.tipo !== "justificativa"
          );

  
return createPortal(
  <div
    className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm animate-fade-in sm:p-5"
    onClick={onClose}
  >
    <section
      role="dialog"
      aria-modal="true"
      aria-label={`Perfil de ${user?.nome || "Professor"}`}
      onClick={(event) => event.stopPropagation()}
      className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border-[3px] border-black bg-[#F7F7F5] shadow-[6px_6px_0px_#000]"
    >
      <ProfileHeader user={user} onClose={onClose} onDirectMessage={onDirectMessage} onAddShortcut={onAddShortcut} />

      <div className="border-b-2 border-black bg-[#F7F7F5] p-4">
        <ProfileTabs
          abaAtiva={abaAtiva}
          setAbaAtiva={setAbaAtiva}
          counts={counts}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F7F5] p-4 sm:p-5">
        {carregando ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-gray-500" />

            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Carregando atividades...
            </p>
          </div>
        ) : (
          <ProfileCheckList
            lista={listaAtiva}
            abaAtiva={abaAtiva}
          />
        )}
      </div>
    </section>
  </div>,
  document.body
);

}
