import { useMemo, useState } from "react";
import {
  Trophy,
  Medal,
  Users,
  CheckCircle2,
  TrendingUp,
  Filter,
  ChevronDown
} from "lucide-react";

function normalizarTexto(valor) {
  return String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export default function OverviewTeacherRanking({ professores = [], unidades = [] }) {
  const [unidadeSelecionada, setUnidadeSelecionada] = useState("todas");
  const [ordenacao, setOrdenacao] = useState("concluidas");
  const [mostrarFiltroUnidade, setMostrarFiltroUnidade] = useState(false);

  const ranking = useMemo(() => {
    let lista = [...professores];
    if (unidadeSelecionada !== "todas") {
      lista = lista.filter((p) => normalizarTexto(p.unidade) === normalizarTexto(unidadeSelecionada));
    } else {
      const agrupados = new Map();
      lista.forEach((p) => {
        const chave = p.uid || normalizarTexto(p.email) || normalizarTexto(p.nome);
        if (!agrupados.has(chave)) agrupados.set(chave, { ...p, unidades: [p.unidade], concluidas: 0, pendentes: 0, justificadas: 0 });
        const atual = agrupados.get(chave);
        if (!atual.unidades.some((u) => normalizarTexto(u) === normalizarTexto(p.unidade))) atual.unidades.push(p.unidade);
        atual.concluidas += p.concluidas || 0;
        atual.pendentes += p.pendentes || 0;
        atual.justificadas += p.justificadas || 0;
      });
      lista = Array.from(agrupados.values()).map((p) => {
        const total = p.concluidas + p.pendentes + p.justificadas;
        return { ...p, total, percentual: total ? Math.round((p.concluidas / total) * 100) : 0 };
      });
    }

    if (ordenacao === "concluidas") lista.sort((a, b) => b.concluidas - a.concluidas || b.percentual - a.percentual || a.nome.localeCompare(b.nome, "pt-BR"));
    else if (ordenacao === "percentual") lista.sort((a, b) => b.percentual - a.percentual || b.concluidas - a.concluidas);
    else if (ordenacao === "az") lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    else if (ordenacao === "za") lista.sort((a, b) => b.nome.localeCompare(a.nome, "pt-BR"));

    return lista.slice(0, 10);
  }, [professores, unidadeSelecionada, ordenacao]);

  const totalProfessores = useMemo(() => {
    if (unidadeSelecionada === "todas") {
      return new Set(professores.map((p) => p.uid || normalizarTexto(p.email) || normalizarTexto(p.nome))).size;
    }
    return professores.filter((p) => normalizarTexto(p.unidade) === normalizarTexto(unidadeSelecionada)).length;
  }, [professores, unidadeSelecionada]);

  const opcoesUnidades = useMemo(() => [...new Set(unidades)].sort((a, b) => a.localeCompare(b, "pt-BR")), [unidades]);

  function obterPosicao(index) { return `${index + 1}º`; }
  function obterCorPosicao(index) {
    if (index === 0) return "text-yellow-600 font-black";
    if (index === 1) return "text-gray-500 font-bold";
    if (index === 2) return "text-orange-600 font-bold";
    return "text-gray-400 font-bold";
  }

  return (
    <section className="mt-10">
      {/* LIQUID GLASS REAL NO RANKING */}
      <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-gradient-to-br from-white/80 via-white/50 to-white/20 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.8)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-black/5 bg-white/20">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-gray-600" />
            <h2 className="text-sm font-bold text-gray-800">Top 10 professores</h2>
          </div>
          <span className="self-start sm:self-auto rounded-full border border-white/50 bg-white/40 px-3 py-1 text-[10px] font-bold text-gray-600 shadow-sm">
            {totalProfessores} professores
          </span>
        </div>

        <div className="border-b border-black/5 px-4 py-3 sm:px-5 flex flex-wrap items-center gap-2 bg-white/10">
          <div className="flex items-center gap-1.5 text-gray-500">
             <Filter size={12} />
          </div>
          
          <div className="relative">
            <button
              type="button"
              onClick={() => setMostrarFiltroUnidade(!mostrarFiltroUnidade)}
              className="flex items-center gap-2 rounded-lg border border-white/50 bg-white/50 px-2.5 py-1.5 text-[11px] font-bold text-gray-700 transition hover:bg-white/80 shadow-sm"
            >
              <span className="max-w-[150px] truncate">{unidadeSelecionada === "todas" ? "Todas as unidades" : unidadeSelecionada}</span>
              <ChevronDown size={12} className={`shrink-0 transition ${mostrarFiltroUnidade ? "rotate-180" : ""}`} />
            </button>

            {mostrarFiltroUnidade && (
              <div className="absolute left-0 top-full z-30 mt-2 max-h-56 w-56 overflow-y-auto rounded-xl border border-white/60 bg-white/80 backdrop-blur-xl p-1 shadow-xl">
                <button
                  type="button"
                  onClick={() => { setUnidadeSelecionada("todas"); setMostrarFiltroUnidade(false); }}
                  className={`w-full rounded-lg px-2.5 py-2 text-left text-xs font-medium transition ${unidadeSelecionada === "todas" ? "bg-pensi-yellow/30 text-black" : "text-gray-600 hover:bg-white"}`}
                >
                  Todas as unidades
                </button>
                {opcoesUnidades.map((unidade) => (
                  <button
                    type="button"
                    key={unidade}
                    onClick={() => { setUnidadeSelecionada(unidade); setMostrarFiltroUnidade(false); }}
                    className={`w-full rounded-lg px-2.5 py-2 text-left text-xs font-medium transition ${normalizarTexto(unidadeSelecionada) === normalizarTexto(unidade) ? "bg-pensi-yellow/30 text-black" : "text-gray-600 hover:bg-white"}`}
                  >
                    {unidade}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1 ml-auto">
            {[{ id: "concluidas", label: "Mais aulas" }, { id: "percentual", label: "Maior taxa" }, { id: "az", label: "A–Z" }, { id: "za", label: "Z–A" }].map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setOrdenacao(item.id)}
                className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition ${ordenacao === item.id ? "bg-pensi-yellow text-black shadow-sm" : "bg-white/40 text-gray-600 hover:bg-white/70"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 sm:px-5">
          {ranking.length > 0 ? (
            <div className="divide-y divide-black/5">
              {ranking.map((professor, index) => {
                const percentual = Math.min(professor.percentual || 0, 100);
                return (
                  <div key={professor.uid || professor.email || professor.nome} className="py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] ${obterCorPosicao(index)}`}>
                        {index < 3 ? <Medal size={14} /> : obterPosicao(index)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-xs font-bold text-gray-900">{professor.nome}</h3>
                        </div>
                        <p className="mt-0.5 truncate text-[10px] text-gray-500">
                          {professor.unidades?.length ? professor.unidades.join(", ") : professor.unidade}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-bold text-gray-900">{professor.concluidas} <span className="font-normal text-gray-500">aulas</span></p>
                        <p className="mt-0.5 text-[10px] text-gray-500">{percentual}%</p>
                      </div>
                    </div>

                    <div className="ml-10 mt-2.5 flex items-center gap-3">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-black/5 shadow-inner">
                        <div className="h-full rounded-full bg-pensi-yellow shadow-[0_0_8px_rgba(234,179,8,0.6)] transition-all duration-700" style={{ width: `${percentual}%` }} />
                      </div>
                      <span className="min-w-[55px] text-right text-[9px] text-gray-500">{professor.total} reg.</span>
                    </div>

                    <div className="ml-10 mt-2 flex flex-wrap items-center gap-3 text-[9px] font-medium text-gray-500">
                      <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-gray-400" /> {professor.concluidas} ok</span>
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-gray-300" /> {professor.pendentes} pend</span>
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-gray-300" /> {professor.justificadas} just</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/40">
                <Users size={18} className="text-gray-400" />
              </div>
              <p className="text-xs font-bold text-gray-700">Nenhum professor encontrado</p>
              <p className="mt-1 max-w-[230px] text-[10px] text-gray-400">Não existem registros para esse filtro.</p>
            </div>
          )}
        </div>

        {ranking.length > 0 && (
          <div className="flex items-center justify-between border-t border-black/5 bg-white/20 px-5 py-2.5">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={12} className="text-gray-500" />
              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-wider">Ranking por aulas</span>
            </div>
            <span className="text-[9px] font-bold text-gray-500">TOP {ranking.length}</span>
          </div>
        )}
      </div>
    </section>
  );
}