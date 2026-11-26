import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

export default function CalendarHeader({
  onBack, mesIdx, setMesIdx, meses,
  user, abas, opcoesProfessor,
  turmaSelecionada, setTurmaSelecionada,
  serie, setSerie,
  mostrarSeletor, turmaPreSelecionada, unicaOpcao, modoConferencia = false,
}) {
  return (
    <div className="sticky top-6 z-40 max-w-[1200px] mx-auto px-6 pt-2">
      <div className="bg-[#111111] rounded-full px-5 py-3 flex flex-wrap items-center justify-between gap-4 shadow-xl border border-white/10">
        
        <button onClick={onBack} className="flex items-center gap-2 bg-white text-[#111111] rounded-full px-5 py-2.5 font-bold text-sm hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} /> Voltar
        </button>

        <div className="flex items-center gap-2 bg-white/10 p-1 rounded-full border border-white/10">
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors" onClick={() => setMesIdx((i) => Math.max(0, i - 1))}>
            <ChevronLeft className="w-4 h-4 text-white" strokeWidth={2.5} />
          </button>
          <div className="px-4 py-2">
            <select value={mesIdx} onChange={(e) => setMesIdx(parseInt(e.target.value, 10))} className="bg-transparent font-bold text-white text-sm uppercase tracking-wider focus:outline-none cursor-pointer">
              {meses.map((m, i) => <option key={i} value={i} className="text-black">{m.rotulo}</option>)}
            </select>
          </div>
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors" onClick={() => setMesIdx((i) => Math.min(meses.length - 1, i + 1))}>
            <ChevronRight className="w-4 h-4 text-white" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {mostrarSeletor && (
            <div className="bg-pensi-yellow rounded-full px-4 py-2.5">
              <select
                value={user && !modoConferencia ? turmaSelecionada : serie}
                onChange={(e) => {
                  if (user && !modoConferencia) {
                    const turma = e.target.value;
                    const opcao = opcoesProfessor.find((o) => o.turma === turma);
                    setTurmaSelecionada(turma);
                    if (opcao) setSerie(opcao.aba);
                  } else { setSerie(e.target.value); }
                }}
                className="bg-transparent font-black text-[#111111] text-[13px] uppercase focus:outline-none cursor-pointer"
              >
                {user && !modoConferencia ? opcoesProfessor.map((o) => <option key={`${o.unidade}-${o.turma}`} value={o.turma}>{o.serie} - {o.turma}</option>) : abas.map((a) => <option key={a.id || a} value={a.id || a}>{a.rotulo || a}</option>)}
              </select>
            </div>
          )}
          {!mostrarSeletor && user && (turmaPreSelecionada || unicaOpcao) && (
            <div className="bg-pensi-yellow rounded-full px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-[#111111]">
              {turmaPreSelecionada ? (opcoesProfessor.find((o) => o.turma === turmaPreSelecionada)?.serie || "") + " - " + turmaPreSelecionada : `${unicaOpcao?.serie} - ${unicaOpcao?.turma}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
