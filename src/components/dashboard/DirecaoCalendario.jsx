
import { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  BookOpen,
  Settings2,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

import {
  doc,
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db, auth } from "../../services/firebase";
import { useAuth } from "../../hooks/useAuth";
import { useTurmas } from "../../hooks/useTurmas";
import CalendarExceptionsModal from "./config/CalendarExceptionsModal";

const SERIES_DISPONIVEIS = [
  "Infantil 2", "Infantil 3", "Infantil 4", "Infantil 5",
  "1º ano", "2º ano", "3º ano", "4º ano", "5º ano",
  "6º ano", "7º ano", "8º ano", "9º ano",
  "1ª série ENEM e Vestibulares",
  "2ª série ENEM e Vestibulares",
  "3ª série ENEM e Vestibulares",
  "Pré-ENEM e Vestibulares",
  "1º ano bilíngue", "2º ano bilíngue", "3º ano bilíngue",
  "4º ano bilíngue", "5º Ano Bilíngue", "6º ano bilíngue",
  "7º ano bilíngue", "8º ano bilíngue", "9º ano bilíngue",
  "Infantil 2 bilíngue", "Infantil 3 bilíngue",
  "Infantil 4 bilíngue", "Infantil 5 bilíngue",
  "1ª série medicina", "2ª série medicina", "3ª série Medicina",
  "Medicina", "9º ano preparatório militar",
  "1ª série preparatória militar", "2ª série preparatória militar",
  "3ª série IME/ITA", "IME/ITA", "Preparatório CN",
  "3ª série AFA/EN/EFOMM", "AFA/EN/EFOMM",
  "Curso Pré IME/ITA 1", "Curso Pré IME/ITA 2",
].sort((a, b) => a.localeCompare(b, "pt-BR"));

const inputClass =
  "w-full rounded-xl border-2 border-black bg-white px-3 py-2.5 text-sm font-semibold outline-none transition focus:bg-yellow-50";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border-2 border-black px-4 py-2.5 text-xs font-black uppercase shadow-[3px_3px_0_#000] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50";

function normalizarUnidade(valor) {
  return String(valor || "").trim().toLowerCase();
}

function pertenceAUnidade(excecao, unidade) {
  if (!excecao || !unidade) return false;

  const unidadeExcecao = normalizarUnidade(excecao.unidade);
  const unidadeAtual = normalizarUnidade(unidade);

  // Exceções antigas sem unidade são tratadas como globais.
  if (!unidadeExcecao) return true;

  return unidadeExcecao === unidadeAtual;
}

function calcularDiasLetivos(cal, unidade) {
  if (!cal.inicio || !cal.fim) return 0;

  const inicio = new Date(`${cal.inicio}T12:00:00`);
  const fim = new Date(`${cal.fim}T12:00:00`);
  const datasExcluidas = new Set();

  (cal.excecoes || [])
    .filter((item) => pertenceAUnidade(item, unidade))
    .forEach((item) => {
      if (!item.dataInicio) return;

      const inicioExcecao = new Date(`${item.dataInicio}T12:00:00`);
      const fimExcecao = new Date(
        `${item.dataFim || item.dataInicio}T12:00:00`
      );

      for (
        let data = new Date(inicioExcecao);
        data <= fimExcecao;
        data.setDate(data.getDate() + 1)
      ) {
        if (data.getDay() !== 0 && data.getDay() !== 6) {
          datasExcluidas.add(data.toISOString().split("T")[0]);
        }
      }
    });

  let diasUteis = 0;

  for (
    let data = new Date(inicio);
    data <= fim;
    data.setDate(data.getDate() + 1)
  ) {
    if (data.getDay() === 0 || data.getDay() === 6) continue;

    if (datasExcluidas.has(data.toISOString().split("T")[0])) {
      continue;
    }

    diasUteis++;
  }

  return Math.max(0, diasUteis);
}

export default function DirecaoCalendario({ perfilAtivo }) {
  const { user } = useAuth();
  const { turmas = [] } = useTurmas();

  const unidadesDoPerfil = useMemo(() => {
    if (!user?.unidade) return [];

    return String(user.unidade)
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);
  }, [user?.unidade]);

  const unidadePerfil = unidadesDoPerfil[0] || "";

  const [calendarios, setCalendarios] = useState([]);
  const [excecoes, setExcecoes] = useState([]);
  const [carregandoCal, setCarregandoCal] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [modalExcecao, setModalExcecao] = useState(null);

  const [excecao, setExcecao] = useState({
    dataInicio: "",
    dataFim: "",
    motivo: "",
    tipo: "todas",
    serie: "",
    turma: "",
  });

  // ==========================================
  // CALENDÁRIOS
  // ==========================================

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "calendarios"),
      (snapshot) => {
        const lista = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        lista.sort(
          (a, b) =>
            new Date(b.inicio).getTime() -
            new Date(a.inicio).getTime()
        );

        setCalendarios(lista);
        setCarregandoCal(false);
      },
      (error) => {
        console.error("Erro ao carregar calendários:", error);
        setErro("Não foi possível carregar os calendários.");
        setCarregandoCal(false);
      }
    );

    return unsubscribe;
  }, []);

  // ==========================================
  // EXCEÇÕES DA UNIDADE
  // Independentemente de quem cadastrou.
  // ==========================================

  useEffect(() => {
    if (!unidadePerfil) {
      setExcecoes([]);
      return;
    }

    const consulta = query(
      collection(db, "excecoes_calendario"),
      where("unidade", "==", unidadePerfil)
    );

    const unsubscribe = onSnapshot(
      consulta,
      (snapshot) => {
        const lista = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setExcecoes(lista);
      },
      (error) => {
        console.error("Erro ao carregar exceções:", error);
        setErro("Não foi possível carregar as exceções.");
      }
    );

    return unsubscribe;
  }, [unidadePerfil]);

  // ==========================================
  // UNIFICAR EXCEÇÕES ANTIGAS E NOVAS
  // ==========================================

  const calendariosComExcecoes = useMemo(() => {
    return calendarios.map((cal) => {
      const excecoesAntigas = Array.isArray(cal.excecoes)
        ? cal.excecoes
        : [];

      const excecoesNovas = excecoes.filter(
        (item) => item.calendarioId === cal.id
      );

      // Mantém exceções antigas e acrescenta as novas.
      const todasExcecoes = [
        ...excecoesAntigas,
        ...excecoesNovas,
      ];

      // Remove duplicatas pelo ID.
      const unicas = Array.from(
        new Map(
          todasExcecoes.map((item, index) => [
            item.id || `${item.dataInicio}-${item.motivo}-${index}`,
            item,
          ])
        ).values()
      );

      return {
        ...cal,
        excecoes: unicas,
      };
    });
  }, [calendarios, excecoes]);

  // ==========================================
  // CALENDÁRIOS DA UNIDADE
  // ==========================================

  const calendariosDaUnidade = useMemo(() => {
    if (!unidadesDoPerfil.length) return [];

    return calendariosComExcecoes.filter((cal) => {
      if (!cal.unidade) return true;

      return unidadesDoPerfil.some(
        (u) =>
          normalizarUnidade(u) === normalizarUnidade(cal.unidade)
      );
    });
  }, [calendariosComExcecoes, unidadesDoPerfil]);

  // ==========================================
  // ABRIR MODAL
  // ==========================================

  const abrirExcecoes = (cal) => {
    setErro("");
    setModalExcecao(cal);
  };

  // ==========================================
  // ADICIONAR EXCEÇÃO
  // ==========================================

  const adicionarExcecao = async (event) => {
    event.preventDefault();
    setErro("");
    setSucesso("");

    if (!excecao.dataInicio) {
      setErro("Informe a data inicial.");
      return;
    }

    const fim = excecao.dataFim || excecao.dataInicio;

    if (fim < excecao.dataInicio) {
      setErro("A data final é inválida.");
      return;
    }

    if (excecao.tipo === "serie" && !excecao.serie) {
      setErro("Selecione uma série.");
      return;
    }

    if (excecao.tipo === "turma" && !excecao.turma) {
      setErro("Selecione uma turma.");
      return;
    }

    if (!unidadePerfil) {
      setErro("Sua unidade não está definida.");
      return;
    }

    const usuarioUid = auth.currentUser?.uid;

    if (!usuarioUid) {
      setErro("Usuário não autenticado. Faça login novamente.");
      return;
    }

    if (!modalExcecao?.id) {
      setErro("Calendário não identificado.");
      return;
    }

    setSalvando(true);

    try {
      const novaExcecao = {
        calendarioId: modalExcecao.id,
        calendarioNome: modalExcecao.nome || "Calendário",
        unidade: unidadePerfil,
        dataInicio: excecao.dataInicio,
        dataFim: fim,
        motivo: excecao.motivo.trim() || "Sem motivo",
        tipo: excecao.tipo,
        serie: excecao.tipo === "serie" ? excecao.serie : "",
        turma: excecao.tipo === "turma" ? excecao.turma : "",
        criadoPor: usuarioUid,
        criadoEm: serverTimestamp(),
      };

      const referencia = await addDoc(
        collection(db, "excecoes_calendario"),
        novaExcecao
      );

      const excecaoCriada = {
        ...novaExcecao,
        id: referencia.id,
        criadoEm: new Date(),
      };

      setExcecoes((atual) => [
        ...atual,
        excecaoCriada,
      ]);

      setModalExcecao((atual) => {
        if (!atual) return atual;

        return {
          ...atual,
          excecoes: [
            ...(atual.excecoes || []),
            excecaoCriada,
          ],
        };
      });

      setExcecao({
        dataInicio: "",
        dataFim: "",
        motivo: "",
        tipo: "todas",
        serie: "",
        turma: "",
      });

      setSucesso("Exceção adicionada com sucesso.");
      setTimeout(() => setSucesso(""), 3000);
    } catch (error) {
      console.error("Erro ao adicionar exceção:", error);

      setErro(
        error.code === "permission-denied"
          ? "Permissão negada ao salvar a exceção."
          : "Erro ao adicionar exceção."
      );
    } finally {
      setSalvando(false);
    }
  };

  // ==========================================
  // REMOVER EXCEÇÃO
  // ==========================================

  const removerExcecao = async (id) => {
    if (!window.confirm("Remover esta exceção?")) return;

    setErro("");

    try {
      await deleteDoc(
        doc(db, "excecoes_calendario", id)
      );

      setExcecoes((atual) =>
        atual.filter((item) => item.id !== id)
      );

      setModalExcecao((atual) => {
        if (!atual) return atual;

        return {
          ...atual,
          excecoes: (atual.excecoes || []).filter(
            (item) => item.id !== id
          ),
        };
      });

      setSucesso("Exceção removida com sucesso.");
      setTimeout(() => setSucesso(""), 3000);
    } catch (error) {
      console.error("Erro ao remover exceção:", error);

      setErro(
        error.code === "permission-denied"
          ? "Você não tem permissão para remover esta exceção."
          : "Erro ao remover exceção."
      );
    }
  };

  // ==========================================
  // EXCEÇÕES EXIBIDAS NO MODAL
  // ==========================================

  const excecoesDaUnidade = useMemo(() => {
    if (!modalExcecao) return [];

    return (modalExcecao.excecoes || []).filter((item) =>
      pertenceAUnidade(item, unidadePerfil)
    );
  }, [modalExcecao, unidadePerfil]);

  // ==========================================
  // SEM UNIDADE
  // ==========================================

  if (!unidadePerfil) {
    return (
      <div className="rounded-xl border-2 border-black bg-white p-8 text-center shadow-[4px_4px_0_#000]">
        <AlertCircle
          size={28}
          className="mx-auto mb-3 text-red-600"
        />

        <p className="text-sm font-black uppercase">
          Sua unidade não está definida
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Entre em contato com a administração para atualizar seu cadastro.
        </p>
      </div>
    );
  }

  // ==========================================
  // INTERFACE
  // ==========================================

  return (
    <div className="w-full min-w-0 space-y-6 pb-10">

      <div className="rounded-xl border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-black bg-pensi-yellow shadow-[2px_2px_0_#000]">
            <CalendarIcon size={22} />
          </div>

          <div>
            <h1 className="text-lg font-black uppercase tracking-wide">
              Calendário
            </h1>

            <p className="text-xs font-bold text-gray-500">
              Unidade:{" "}
              <span className="text-black">{unidadePerfil}</span>
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-600">
          Aqui você pode consultar os dias letivos e adicionar exceções
          (feriados, recessos, etc.) para a sua unidade.
        </p>
      </div>

      {erro && !modalExcecao && (
        <div className="flex items-center gap-2 rounded-xl border-2 border-red-400 bg-red-50 p-3 text-sm font-bold text-red-700">
          <AlertCircle size={17} />
          {erro}

          <button onClick={() => setErro("")} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {sucesso && (
        <div className="flex items-center gap-2 rounded-xl border-2 border-green-500 bg-green-50 p-3 text-sm font-bold text-green-800">
          <CheckCircle2 size={17} />
          {sucesso}

          <button onClick={() => setSucesso("")} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {carregandoCal ? (
        <div className="rounded-xl border-2 border-black bg-white p-8 text-center shadow-[4px_4px_0_#000]">
          <CalendarIcon size={28} className="mx-auto mb-3 animate-pulse" />

          <p className="text-xs font-black uppercase">
            Carregando calendários...
          </p>
        </div>
      ) : calendariosDaUnidade.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-black bg-white p-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl border-2 border-black bg-pensi-yellow shadow-[3px_3px_0_#000]">
            <CalendarIcon size={26} />
          </div>

          <p className="text-sm font-black uppercase">
            Nenhum calendário para sua unidade
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Aguarde a administração cadastrar um calendário.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {calendariosDaUnidade.map((cal) => {
            const excecoesDoCalendario = (cal.excecoes || []).filter(
              (item) => pertenceAUnidade(item, unidadePerfil)
            );

            return (
              <article
                key={cal.id}
                className="overflow-hidden rounded-xl border-[2.5px] border-black bg-white shadow-[5px_5px_0_#000]"
              >
                <div className="flex items-center justify-between gap-3 border-b-[2.5px] border-black bg-pensi-yellow p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-white shadow-[2px_2px_0_#000]">
                      <CalendarIcon size={20} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-black uppercase tracking-wide text-black">
                        {cal.nome}
                      </h3>

                      <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-black/60">
                        Calendário acadêmico
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full border border-black bg-pensi-yellow" />

                      <p className="text-[10px] font-black uppercase tracking-widest">
                        Período letivo
                      </p>
                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <div className="rounded-lg border-2 border-black bg-gray-100 p-3 shadow-[2px_2px_0_#000]">
                        <p className="text-[9px] font-black uppercase text-gray-500">
                          Início
                        </p>

                        <p className="mt-1 text-sm font-black tabular-nums">
                          {new Date(
                            `${cal.inicio}T12:00:00`
                          ).toLocaleDateString("pt-BR")}
                        </p>
                      </div>

                      <ChevronRight size={19} strokeWidth={3} />

                      <div className="rounded-lg border-2 border-black bg-gray-100 p-3 shadow-[2px_2px_0_#000]">
                        <p className="text-[9px] font-black uppercase text-gray-500">
                          Término
                        </p>

                        <p className="mt-1 text-sm font-black tabular-nums">
                          {new Date(
                            `${cal.fim}T12:00:00`
                          ).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 overflow-hidden rounded-xl border-2 border-black bg-green-200 p-4 shadow-[3px_3px_0_#000]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-black bg-white shadow-[2px_2px_0_#000]">
                        <BookOpen size={20} />
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-wide">
                          Dias letivos
                        </p>

                        <p className="text-[9px] font-bold uppercase text-green-900">
                          Total do calendário
                        </p>
                      </div>
                    </div>

                    <span className="text-4xl font-black tabular-nums tracking-tighter">
                      {calcularDiasLetivos(cal, unidadePerfil)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-black pt-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-pensi-yellow">
                        <Settings2 size={15} />
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase">
                          {excecoesDoCalendario.length}{" "}
                          {excecoesDoCalendario.length === 1
                            ? "exceção"
                            : "exceções"}
                        </p>

                        <p className="text-[9px] font-bold text-gray-500">
                          Em {unidadePerfil}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => abrirExcecoes(cal)}
                      className="flex items-center gap-2 rounded-lg border-2 border-black bg-white px-3 py-2.5 text-[10px] font-black uppercase shadow-[3px_3px_0_#000] transition-colors hover:bg-pensi-yellow"
                    >
                      <Settings2 size={14} />
                      Gerenciar dias
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {modalExcecao && (
        <CalendarExceptionsModal
          calendario={modalExcecao}
          onClose={() => {
            setModalExcecao(null);
            setErro("");
          }}
          adicionarExcecao={adicionarExcecao}
          excecao={excecao}
          setExcecao={setExcecao}
          unidadeCalendario={unidadePerfil}
          SERIES_DISPONIVEIS={SERIES_DISPONIVEIS}
          turmas={turmas}
          inputClass={inputClass}
          buttonClass={buttonClass}
          salvando={salvando}
          erro={erro}
          excecoesDaUnidade={excecoesDaUnidade}
          removerExcecao={removerExcecao}
          podeGerenciar={true}
          podeAdicionarGeral={false}
          ehDirecao={true}
          ehRegional={false}
        />
      )}
    </div>
  );
}
