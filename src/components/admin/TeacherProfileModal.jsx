import { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  History,
  BellRing,
  BookOpen,
  CalendarDays,
  UserRound,
  ChevronRight,
} from "lucide-react";

const MOCK_ATIVIDADES = [
  {
    id: 1,
    tipo: "feito",
    disciplina: "Matemática",
    turma: "9º Ano A",
    data: "Há 2 horas",
    detalhe: "Aula sobre funções quadráticas.",
  },
  {
    id: 2,
    tipo: "pendente",
    disciplina: "Física",
    turma: "2ª Série B",
    data: "Ontem",
    detalhe: "Aula não registrada no sistema.",
  },
  {
    id: 3,
    tipo: "justificado",
    disciplina: "Matemática",
    turma: "1ª Série A",
    data: "Segunda-feira",
    detalhe: "Feriado municipal.",
  },
  {
    id: 4,
    tipo: "feito",
    disciplina: "Física",
    turma: "2ª Série B",
    data: "Semana passada",
    detalhe: "Aula sobre termodinâmica.",
  },
  {
    id: 5,
    tipo: "pendente",
    disciplina: "Matemática",
    turma: "9º Ano A",
    data: "Semana passada",
    detalhe: "Aula não registrada.",
  },
  {
    id: 6,
    tipo: "justificado",
    disciplina: "Matemática",
    turma: "9º Ano A",
    data: "Mês passado",
    detalhe: "Atestado médico.",
  },
];

const MOCK_STATS = {
  feitos: 124,
  pendentes: 3,
  justificados: 5,
};

const ABAS = [
  {
    id: "pendente",
    label: "Pendentes",
    descricao: "Aguardando registro",
    valor: MOCK_STATS.pendentes,
    icon: Clock,
    cor: "bg-red-300",
    indicador: "bg-red-400",
  },
  {
    id: "feito",
    label: "Realizadas",
    descricao: "Aulas registradas",
    valor: MOCK_STATS.feitos,
    icon: CheckCircle2,
    cor: "bg-green-300",
    indicador: "bg-green-400",
  },
  {
    id: "justificado",
    label: "Justificadas",
    descricao: "Ocorrências justificadas",
    valor: MOCK_STATS.justificados,
    icon: AlertCircle,
    cor: "bg-yellow-300",
    indicador: "bg-yellow-400",
  },
];

export default function TeacherProfileModal({ user, onClose }) {
  const [abaAtiva, setAbaAtiva] = useState("pendente");

  // Trava o scroll do body enquanto o modal está aberto
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const atividadesFiltradas = MOCK_ATIVIDADES.filter(
    (a) => a.tipo === abaAtiva
  );

  const totalAtividades =
    MOCK_STATS.feitos + MOCK_STATS.pendentes + MOCK_STATS.justificados;

  const percentualConcluido = Math.round(
    (MOCK_STATS.feitos / totalAtividades) * 100
  );

  const handleEnviarLembrete = () => {
    alert(`Lembrete enviado para ${user.nome}!`);
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
                <span className="text-[8px] font-black uppercase tracking-[0.22em] text-gray-400">
                  Gestão de equipe / Perfil
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight">
                Perfil do professor
                <span className="text-pensi-yellow">.</span>
              </h2>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center border-2 border-white/30 rounded-md text-white hover:bg-pensi-yellow hover:text-black hover:border-black transition-all"
              aria-label="Fechar perfil"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* IDENTIFICAÇÃO */}
        <div className="bg-white border-b-2 border-black p-4 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-pensi-yellow border-2 border-black rounded-md shadow-[2px_2px_0px_#000] flex items-center justify-center">
                <span className="text-xl font-black text-black">
                  {user.nome.charAt(0)}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                    Professor
                  </span>
                  <span
                    className={`px-1.5 py-0.5 border border-black rounded-md text-[7px] font-black uppercase tracking-wider ${
                      user.status === "Ativo"
                        ? "bg-green-300 text-black"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-black leading-tight break-words">
                  {user.nome}
                </h3>

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
        </div>

        {/* CONTEÚDO COM ROLAGEM */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* RESUMO */}
          <section className="p-4 sm:p-5">
            <div className="flex items-end justify-between gap-2 mb-2.5">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <UserRound className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                    Visão geral
                  </span>
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-black">
                  Desempenho das atividades
                </h3>
              </div>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                {totalAtividades} registros
              </span>
            </div>

            {/* INDICADORES COMO ABAS */}
            <div className="grid grid-cols-3 gap-2">
              {ABAS.map((aba) => {
                const Icon = aba.icon;
                const selecionada = abaAtiva === aba.id;

                return (
                  <button
                    key={aba.id}
                    onClick={() => setAbaAtiva(aba.id)}
                    className={`relative text-left p-2.5 border-2 border-black rounded-md transition-all ${
                      selecionada
                        ? "bg-white shadow-[2px_2px_0px_#000] -translate-y-0.5"
                        : "bg-white/60 shadow-[1px_1px_0px_#000] hover:bg-white hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div
                        className={`w-7 h-7 flex items-center justify-center border-2 border-black rounded-md ${aba.cor}`}
                      >
                        <Icon className="w-3.5 h-3.5 text-black" />
                      </div>

                      {selecionada && (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>

                    <p className="text-2xl font-black text-black mt-2 tabular-nums leading-none">
                      {aba.valor}
                    </p>

                    <p className="text-[9px] font-black uppercase tracking-wider text-black mt-1">
                      {aba.label}
                    </p>

                    <p className="text-[8px] font-medium text-gray-400 mt-0.5 truncate">
                      {aba.descricao}
                    </p>

                    <div
                      className={`absolute bottom-0 left-0 w-full h-1 rounded-b-[4px] ${aba.indicador}`}
                    />
                  </button>
                );
              })}
            </div>

            {/* PROGRESSO */}
            <div className="mt-3 p-3 bg-white border-2 border-black rounded-md shadow-[2px_2px_0px_#000]">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                    Atividades registradas
                  </p>
                  <p className="text-[11px] font-bold text-black mt-0.5">
                    {MOCK_STATS.feitos} de {totalAtividades} atividades
                  </p>
                </div>
                <span className="text-base font-black text-black">
                  {percentualConcluido}%
                </span>
              </div>

              <div className="w-full h-2.5 bg-gray-200 border-2 border-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 border-r-2 border-black transition-all duration-500"
                  style={{ width: `${percentualConcluido}%` }}
                />
              </div>
            </div>
          </section>

          {/* HISTÓRICO */}
          <section className="px-4 sm:px-5 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <History className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                    Acompanhamento
                  </span>
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-black">
                  Histórico de{" "}
                  {abaAtiva === "pendente"
                    ? "pendências"
                    : abaAtiva === "feito"
                    ? "aulas realizadas"
                    : "justificativas"}
                </h3>
              </div>

              {abaAtiva === "pendente" &&
                atividadesFiltradas.length > 0 && (
                  <button
                    onClick={handleEnviarLembrete}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-pensi-yellow text-black border-2 border-black rounded-md text-[9px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    Enviar lembrete
                  </button>
                )}
            </div>

            <div className="space-y-2">
              {atividadesFiltradas.length === 0 ? (
                <div className="bg-white border-2 border-black border-dashed rounded-md p-6 text-center">
                  <div className="w-10 h-10 bg-gray-100 border-2 border-black rounded-md flex items-center justify-center mx-auto mb-2">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-black">
                    Nenhum registro encontrado
                  </p>
                  <p className="text-[9px] text-gray-400 mt-1">
                    Não existem atividades nesta categoria.
                  </p>
                </div>
              ) : (
                atividadesFiltradas.map((ativ) => {
                  const configuracao = {
                    feito: {
                      cor: "bg-green-300",
                      texto: "Registrada",
                      icon: CheckCircle2,
                    },
                    pendente: {
                      cor: "bg-red-300",
                      texto: "Pendente",
                      icon: Clock,
                    },
                    justificado: {
                      cor: "bg-yellow-300",
                      texto: "Justificada",
                      icon: AlertCircle,
                    },
                  }[ativ.tipo];

                  const Icon = configuracao.icon;

                  return (
                    <article
                      key={ativ.id}
                      className="bg-white border-2 border-black rounded-md shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] transition-all overflow-hidden"
                    >
                      <div className="flex items-stretch">
                        <div
                          className={`w-1.5 shrink-0 ${configuracao.cor}`}
                        />

                        <div className="flex-1 min-w-0 p-3">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className="text-[8px] font-black uppercase tracking-wider text-gray-400">
                                  Atividade #{String(ativ.id).padStart(2, "0")}
                                </span>
                                <span
                                  className={`flex items-center gap-1 px-1.5 py-0.5 border border-black rounded-md text-[7px] font-black uppercase tracking-wider ${configuracao.cor}`}
                                >
                                  <Icon className="w-2.5 h-2.5" />
                                  {configuracao.texto}
                                </span>
                              </div>

                              <h4 className="text-xs font-black text-black">
                                {ativ.disciplina}
                              </h4>

                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                                {ativ.turma}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 text-[8px] font-black uppercase text-gray-400 shrink-0">
                              <CalendarDays className="w-3 h-3" />
                              {ativ.data}
                            </div>
                          </div>

                          <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                            <p className="text-[11px] text-gray-600 leading-relaxed">
                              {ativ.detalhe}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* RODAPÉ */}
        <div className="shrink-0 bg-white border-t-2 border-black px-4 py-2.5 flex items-center justify-between gap-2 rounded-b-md">
          <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
            Painel de acompanhamento
          </span>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] text-white border-2 border-black rounded-md text-[9px] font-black uppercase tracking-wider hover:bg-pensi-yellow hover:text-black transition-colors"
          >
            <X className="w-3 h-3" />
            Fechar perfil
          </button>
        </div>
      </div>
    </div>
  );
}