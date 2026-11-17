// src/components/dashboard/start/StartHeader.jsx
export default function StartHeader({ user, viewMode, totalMaterias, totalTurmas }) {
  return (
    <section className="mb-7 mt-7 pb-4 border-b-2 border-black/40">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 bg-pensi-yellow border border-black rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">Início</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-none">
            Olá, {user?.nome?.split(" ")[0] || "Professor"}
            <span className="text-pensi-yellow">.</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-xl leading-relaxed">
            {viewMode === "materias"
              ? "Selecione uma matéria para visualizar os detalhes."
              : "Selecione uma turma para visualizar os detalhes."}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2 self-start lg:self-auto">
          <div className="bg-white border-2 border-black rounded-xl px-3 py-2 shadow-[2px_2px_0px_#000]">
            <span className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Matérias</span>
            <span className="text-base font-black text-black tabular-nums leading-none">
              {totalMaterias.toString().padStart(2, "0")}
            </span>
          </div>
          <div className="bg-pensi-yellow border-2 border-black rounded-xl px-4 py-2.5 shadow-[3px_3px_0px_#000]">
            <span className="block text-[10px] font-black uppercase tracking-widest text-black/70 mb-1">Turmas</span>
            <span className="text-3xl font-black text-black tabular-nums leading-none">
              {totalTurmas.toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}