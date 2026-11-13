import { useState, useEffect } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../../services/firebase";
import {
  X, CheckCircle2, Clock, AlertCircle, MapPin, Mail, Phone, History,
  BellRing, BookOpen, CalendarDays, UserRound, ChevronRight, GraduationCap,
  Users, Loader2,
} from "lucide-react";

const ABAS_BASE = [
  { id: "pendente", label: "Pendentes", descricao: "Aguardando registro", icon: Clock, cor: "bg-red-300", indicador: "bg-red-400" },
  { id: "feito", label: "Realizadas", descricao: "Aulas registradas", icon: CheckCircle2, cor: "bg-green-300", indicador: "bg-green-400" },
  { id: "justificado", label: "Justificadas", descricao: "Ocorrências justificadas", icon: AlertCircle, cor: "bg-yellow-300", indicador: "bg-yellow-400" },
];

export default function TeacherProfileModal({ user, onClose }) {
  const [abaAtiva, setAbaAtiva] = useState("pendente");
  // [MUDOU] dados reais
  const [checks, setChecks] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, []);

  // [MUDOU] busca checks do Firestore
  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      try {
        const snap = await getDocs(query(
          collection(db, "checks"),
          where("professorUid", "==", user.id),
          limit(300)
        ));
        if (cancelado) return;
        const lista = [];
        snap.forEach((d) => {
          const data = d.data();
          const dataHora = data.dataHora ? new Date(data.dataHora) : null;
          lista.push({
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
        lista.sort((a, b) => (b.dataHora?.getTime() || 0) - (a.dataHora?.getTime() || 0));
        setChecks(lista);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }
    if (user?.id) carregar();
    return () => { cancelado = true; };
  }, [user?.id]);

  // [MUDOU] stats reais + atividades por aba
  const stats = {
    feitos: checks.filter((c) => c.tipo === "aula" || c.status === "realizado").length,
    pendentes: checks.filter((c) => c.status === "pendente").length,
    justificados: checks.filter((c) => c.tipo === "justificativa").length,
  };

  const ABAS = ABAS_BASE.map((aba) => ({
    ...aba,
    valor: aba.id === "feito" ? stats.feitos : aba.id === "pendente" ? stats.pendentes : stats.justificados,
  }));

  const atividadesFiltradas = checks.filter((c) => {
    if (abaAtiva === "feito") return c.tipo === "aula" || c.status === "realizado";
    if (abaAtiva === "pendente") return c.status === "pendente";
    return c.tipo === "justificativa";
  });

  const totalAtividades = stats.feitos + stats.pendentes + stats.justificados;
  const percentualConcluido = totalAtividades > 0 ? Math.round((stats.feitos / totalAtividades) * 100) : 0;

  const handleEnviarLembrete = () => {
    alert(`Lembrete enviado para ${user.nome}!`);
  };

  const formatarData = (d) => {
    if (!d) return "";
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-[#f5f5f2] border-2 border-black rounded-md shadow-[6px_6px_0px_#000] w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* CABEÇALHO */}
        <div className="relative bg-[#171717] text-white border-b-2 border-black rounded-t-md shrink-0">
          <div className="relative flex items-center justify-between px-4 sm:px-5 py-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 bg-pensi-yellow border border-black rounded-full" />
                <span className="text-[8px] font-black uppercase tracking-[0.22em] text-gray-400">Gestão de equipe / Perfil</span>
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight">
                Perfil do professor<span className="text-pensi-yellow">.</span>
              </h2>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center border-2 border-white/30 rounded-md text-white hover:bg-pensi-yellow hover:text-black hover:border-black transition-all"
              aria-label="Fechar perfil">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* IDENTIFICAÇÃO */}
        <div className="bg-white border-b-2 border-black p-4 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-pensi-yellow border-2 border-black rounded-md shadow-[2px_2px_0px_#000] flex items-center justify-center">
                <span className="text-xl font-black text-black">{user.nome.charAt(0)}</span>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Professor</span>
                  <span className={`px-1.5 py-0.5 border border-black rounded-md text-[7px] font-black uppercase tracking-wider ${user.status === "Ativo" ? "bg-green-300 text-black" : "bg-gray-200 text-gray-600"}`}>
                    {user.status}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-black leading-tight break-words">{user.nome}</h3>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-gray-500">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {user.unidade}
                </div>
              </div>
            </div>
            <div className="sm:border-l-2 sm:border-gray-200 sm:pl-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-600 min-w-0">
                <Mail className="w-3 h-3 shrink-0 text-gray-400" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.telefone && (
                <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                  <Phone className="w-3 h-3 shrink-0 text-gray-400" />
                  {user.telefone}
                </div>
              )}
            </div>
          </div>

          {/* [NOVO] resumo de cargos/unidades/séries */}
          <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex flex-wrap gap-2">
            {(user.cargos || []).map((c) => (
              <span key={c} className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-gray-100 border border-black rounded">{c}</span>
            ))}
            {(user.unidadesInativas || []).length > 0 && (
              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-red-100 border border-red-400 text-red-700 rounded">
                {user.unidadesInativas.length} unidade(s) inativa(s)
              </span>
            )}
            {(user.turmasInativas || []).length > 0 && (
              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-orange-100 border border-orange-400 text-orange-700 rounded">
                {user.turmasInativas.length} turma(s) inativa(s)
              </span>
            )}
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <section className="p-4 sm:p-5">
            <div className="flex items-end justify-between gap-2 mb-2.5">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <UserRound className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Visão geral</span>
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-black">Desempenho das atividades</h3>
              </div>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">{totalAtividades} registros</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {ABAS.map((aba) => {
                const Icon = aba.icon;
                const selecionada = abaAtiva === aba.id;
                return (
                  <button key={aba.id} onClick={() => setAbaAtiva(aba.id)}
                    className={`relative text-left p-2.5 border-2 border-black rounded-md transition-all ${selecionada ? "bg-white shadow-[2px_2px_0px_#000] -translate-y-0.5" : "bg-white/60 shadow-[1px_1px_0px_#000] hover:bg-white hover:-translate-y-0.5"}`}>
                    <div className="flex items-start justify-between gap-1">
                      <div className={`w-7 h-7 flex items-center justify-center border-2 border-black rounded-md ${aba.cor}`}>
                        <Icon className="w-3.5 h-3.5 text-black" />
                      </div>
                      {selecionada && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                    </div>
                    <p className="text-2xl font-black text-black mt-2 tabular-nums leading-none">{aba.valor}</p>
                    <p className="text-[9px] font-black uppercase tracking-wider text-black mt-1">{aba.label}</p>
                    <p className="text-[8px] font-medium text-gray-400 mt-0.5 truncate">{aba.descricao}</p>
                    <div className={`absolute bottom-0 left-0 w-full h-1 rounded-b-[4px] ${aba.indicador}`} />
                  </button>
                );
              })}
            </div>

            <div className="mt-3 p-3 bg-white border-2 border-black rounded-md shadow-[2px_2px_0px_#000]">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Atividades registradas</p>
                  <p className="text-[11px] font-bold text-black mt-0.5">{stats.feitos} de {totalAtividades} atividades</p>
                </div>
                <span className="text-base font-black text-black">{percentualConcluido}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 border-2 border-black rounded-full overflow-hidden">
                <div className="h-full bg-green-400 border-r-2 border-black transition-all duration-500" style={{ width: `${percentualConcluido}%` }} />
              </div>
            </div>
          </section>

          <section className="px-4 sm:px-5 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <History className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Acompanhamento</span>
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-black">
                  Histórico de {abaAtiva === "pendente" ? "pendências" : abaAtiva === "feito" ? "aulas realizadas" : "justificativas"}
                </h3>
              </div>
              {abaAtiva === "pendente" && atividadesFiltradas.length > 0 && (
                <button onClick={handleEnviarLembrete}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-pensi-yellow text-black border-2 border-black rounded-md text-[9px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                  <BellRing className="w-3.5 h-3.5" /> Enviar lembrete
                </button>
              )}
            </div>

            {carregando ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                <span className="ml-2 text-[11px] text-gray-500 font-bold">Carregando atividades...</span>
              </div>
            ) : atividadesFiltradas.length === 0 ? (
              <div className="bg-white border-2 border-black border-dashed rounded-md p-6 text-center">
                <div className="w-10 h-10 bg-gray-100 border-2 border-black rounded-md flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-wider text-black">Nenhum registro encontrado</p>
                <p className="text-[9px] text-gray-400 mt-1">Não existem atividades nesta categoria.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {atividadesFiltradas.map((ativ) => {
                  const config = {
                    feito: { cor: "bg-green-300", texto: "Registrada", icon: CheckCircle2 },
                    pendente: { cor: "bg-red-300", texto: "Pendente", icon: Clock },
                    justificado: { cor: "bg-yellow-300", texto: "Justificada", icon: AlertCircle },
                  }[abaAtiva];
                  const Icon = config.icon;
                  const dataFmt = formatarData(ativ.dataHora);
                  return (
                    <article key={ativ.id} className="bg-white border-2 border-black rounded-md shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] transition-all overflow-hidden">
                      <div className="flex items-stretch">
                        <div className={`w-1.5 shrink-0 ${config.cor}`} />
                        <div className="flex-1 min-w-0 p-3">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className="text-[8px] font-black uppercase tracking-wider text-gray-400">Atividade #{String(ativ.id).slice(-4)}</span>
                                <span className={`flex items-center gap-1 px-1.5 py-0.5 border border-black rounded-md text-[7px] font-black uppercase tracking-wider ${config.cor}`}>
                                  <Icon className="w-2.5 h-2.5" /> {config.texto}
                                </span>
                              </div>
                              <h4 className="text-xs font-black text-black">{ativ.disciplina}</h4>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                                {ativ.serie} {ativ.unidade ? `• ${ativ.unidade}` : ""}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-[8px] font-black uppercase text-gray-400 shrink-0">
                              <CalendarDays className="w-3 h-3" />
                              {dataFmt}
                            </div>
                          </div>
                          {(ativ.justificativa || ativ.observacao) && (
                            <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                              <p className="text-[11px] text-gray-600 leading-relaxed">
                                {ativ.justificativa || ativ.observacao}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* RODAPÉ */}
        <div className="shrink-0 bg-white border-t-2 border-black px-4 py-2.5 flex items-center justify-between gap-2 rounded-b-md">
          <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Painel de acompanhamento</span>
          <button onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] text-white border-2 border-black rounded-md text-[9px] font-black uppercase tracking-wider hover:bg-pensi-yellow hover:text-black transition-colors">
            <X className="w-3 h-3" /> Fechar perfil
          </button>
        </div>
      </div>
    </div>
  );
}