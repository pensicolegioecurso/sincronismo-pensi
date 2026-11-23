import { useMemo, useState } from "react";
import {
  Building2, ChevronUp, ChevronDown, CheckCircle2, AlertCircle, Clock, History, X, Filter, CalendarDays, GraduationCap, User,
} from "lucide-react";

function formatarTipo(tipo) {
  if (!tipo) return "Atividade";
  return String(tipo).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function StatusBadge({ status }) {
  const map = {
    realizado: { text: "Realizada", color: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
    justificado: { text: "Justificada", color: "bg-sky-50 text-sky-700", icon: AlertCircle },
    pendente: { text: "Pendente", color: "bg-rose-50 text-rose-700", icon: Clock },
  };
  const cfg = map[status] || map.pendente;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${cfg.color}`}>
      <Icon size={12} /> {cfg.text}
    </span>
  );
}

export default function OverviewUnitCard({ u, isExpanded, onToggle, onClose }) {
  const [filtroTurma, setFiltroTurma] = useState("Todas");

  const historicoFiltrado = useMemo(() => {
    return (u.historico || [])
      .filter((item) => filtroTurma === "Todas" || item.turma === filtroTurma)
      .sort((a, b) => b.data.localeCompare(a.data));
  }, [u.historico, filtroTurma]);

  return (
    <div className={`overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all ${isExpanded ? "col-span-1 md:col-span-2 xl:col-span-3" : ""}`}>
      <button onClick={onToggle} className="flex w-full items-center gap-3 p-4 text-left hover:bg-gray-50 transition sm:p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-gray-700">
          <Building2 size={20} strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-900">{u.nome}</p>
          <p className="mt-0.5 truncate text-[11px] font-medium text-gray-500">
            Regional: {u.regional || "Sem regional"}
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-500">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 bg-[#fbfbfb] p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">{u.nome}</h3>
              <p className="mt-0.5 text-xs text-gray-500">Regional: {u.regional || "Não identificada"}</p>
            </div>
            <button onClick={onClose} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-white hover:text-black transition">
              <X size={14} /> Fechar
            </button>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
            <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
              <span className="block text-[10px] font-bold text-gray-500 uppercase">Realizadas</span>
              <span className="mt-1 block text-2xl font-bold text-emerald-600">{u.c}</span>
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
              <span className="block text-[10px] font-bold text-gray-500 uppercase">Justificadas</span>
              <span className="mt-1 block text-2xl font-bold text-sky-600">{u.j}</span>
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
              <span className="block text-[10px] font-bold text-gray-500 uppercase">Pendentes</span>
              <span className="mt-1 block text-2xl font-bold text-rose-600">{u.p}</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <div className="flex flex-col items-start justify-between gap-3 border-b border-gray-100 bg-gray-50/50 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <History className="text-gray-400" size={16} />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Histórico</h4>
                  <p className="text-[11px] text-gray-500">{historicoFiltrado.length} registros</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 border border-gray-200">
                <Filter className="text-gray-400" size={13} />
                <select value={filtroTurma} onChange={(e) => setFiltroTurma(e.target.value)} className="bg-transparent text-xs font-semibold text-gray-700 outline-none">
                  <option value="Todas">Todas as turmas</option>
                  {(u.turmas || []).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {historicoFiltrado.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">Nenhum registro encontrado.</div>
            ) : (
              <div className="p-4 sm:p-5">
                <div className="relative space-y-0">
                  {historicoFiltrado.map((item, idx) => (
                    <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
                      {/* Linha vertical e Ícone */}
                      <div className="relative flex flex-col items-center shrink-0">
                        <div className={`z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 ${
                          item.status === "realizado" ? "border-emerald-200" :
                          item.status === "justificado" ? "border-sky-200" : "border-rose-200"
                        }`}>
                          {item.status === "realizado" ? <CheckCircle2 size={14} className="text-emerald-500" /> :
                           item.status === "justificado" ? <AlertCircle size={14} className="text-sky-500" /> :
                           <Clock size={14} className="text-rose-500" />}
                        </div>
                        {idx !== historicoFiltrado.length - 1 && <div className="absolute top-8 bottom-0 w-px bg-gray-100" />}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 pt-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                            <CalendarDays size={12} className="text-gray-400" />
                            {item.dataFormatada}
                          </span>
                          <StatusBadge status={item.status} />
                        </div>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{formatarTipo(item.tipo)}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-medium text-gray-500">
                          <span className="flex items-center gap-1"><GraduationCap size={13} /> {item.turma || "Sem turma"}</span>
                          <span className="flex items-center gap-1"><User size={12} /> {item.responsavel || "Não identificado"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}