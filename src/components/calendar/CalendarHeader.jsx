// src/components/calendar/CalendarHeader.jsx
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

export default function CalendarHeader({
  onBack, mesIdx, setMesIdx, meses,
  user, abas, opcoesProfessor,
  turmaSelecionada, setTurmaSelecionada,
  serie, setSerie,
  mostrarSeletor, turmaPreSelecionada, unicaOpcao,
}) {
  return (
    <div className="bg-white/40 backdrop-blur-2xl border-b-[2px] border-white/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-sm">
      <button onClick={onBack} className="flex items-center gap-2 bg-pensi-yellow text-black border-[2px] border-black rounded-lg px-4 py-2 font-medium text-sm shadow-[3px_3px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
        <ArrowLeft className="w-4 h-4" strokeWidth={2.5} /> Voltar
      </button>

      <div className="flex items-center gap-3">
        <button className="w-10 h-10 rounded-lg bg-white/60 backdrop-blur-sm border-[2px] border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center hover:bg-pensi-yellow active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all" onClick={() => setMesIdx((i) => Math.max(0, i - 1))}>
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
        </button>
        <div className="bg-pensi-yellow border-[2px] border-black rounded-lg px-4 py-2 shadow-[3px_3px_0px_0px_#000]">
          <select value={mesIdx} onChange={(e) => setMesIdx(parseInt(e.target.value, 10))} className="bg-transparent font-medium text-black text-sm uppercase tracking-wider focus:outline-none cursor-pointer">
            {meses.map((m, i) => <option key={i} value={i}>{m.rotulo}</option>)}
          </select>
        </div>
        <button className="w-10 h-10 rounded-lg bg-white/60 backdrop-blur-sm border-[2px] border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center hover:bg-pensi-yellow active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all" onClick={() => setMesIdx((i) => Math.min(meses.length - 1, i + 1))}>
          <ChevronRight className="w-5 h-5 text-black" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {mostrarSeletor && (
          <div className="bg-white/60 backdrop-blur-sm border-[2px] border-black rounded-lg shadow-[3px_3px_0px_0px_#000] px-3 py-2">
            <select
              value={user ? turmaSelecionada : serie}
              onChange={(e) => {
                if (user) {
                  const turma = e.target.value;
                  const opcao = opcoesProfessor.find((o) => o.turma === turma);
                  setTurmaSelecionada(turma);
                  if (opcao) setSerie(opcao.aba);
                } else { setSerie(e.target.value); }
              }}
              className="bg-transparent font-medium text-black text-sm focus:outline-none cursor-pointer"
            >
              {user ? opcoesProfessor.map((o) => <option key={o.turma} value={o.turma}>{o.serie} - {o.turma}</option>) : abas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}
        {!mostrarSeletor && user && (turmaPreSelecionada || unicaOpcao) && (
          <div className="bg-pensi-yellow border-[2px] border-black rounded-lg px-3 py-2 text-[11px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_#000]">
            {turmaPreSelecionada ? (opcoesProfessor.find((o) => o.turma === turmaPreSelecionada)?.serie || "") + " - " + turmaPreSelecionada : `${unicaOpcao?.serie} - ${unicaOpcao?.turma}`}
          </div>
        )}
      </div>
    </div>
  );
}