import { Building2, MapPin, ChevronRight } from "lucide-react";

export default function OverviewUnits({
  isDiretor = false,
  porUnidade,
  onOpenUnit,
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-black text-gray-900">
          {isDiretor ? "Unidade" : "Unidades"}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {porUnidade.map((unidade) => {
          const total = (unidade.c || 0) + (unidade.p || 0) + (unidade.j || 0);
          const percentual = total ? Math.round((unidade.c / total) * 100) : 0;

          return (
            <button
              type="button"
              key={unidade.nome}
              onClick={() => onOpenUnit(unidade)}
              // LIQUID GLASS REAL NA UNIDADE
              className="group relative flex flex-col overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-br from-white/80 via-white/50 to-white/20 backdrop-blur-2xl p-5 text-left shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.8)] transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:bg-white/90"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

              <div className="relative z-10 mb-4 flex w-full items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/60 shadow-sm text-gray-700 border border-white/50">
                    <Building2 size={16} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-gray-900">{unidade.nome}</h3>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-gray-500 uppercase">
                      <MapPin size={10} /> {unidade.regional || "Sem regional"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mb-2 flex w-full items-center justify-between">
                <span className="text-[11px] font-bold text-gray-600">{percentual}% concluído</span>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-black transition-colors" />
              </div>

              <div className="relative z-10 h-1.5 w-full overflow-hidden rounded-full bg-black/5 shadow-inner">
                <div className="h-full rounded-full bg-pensi-yellow shadow-[0_0_8px_rgba(234,179,8,0.6)]" style={{ width: `${percentual}%` }} />
              </div>

              <div className="relative z-10 mt-4 flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase border-t border-black/5 pt-3">
                <span>{unidade.c || 0} Ok</span>
                <span className="text-gray-400">{unidade.p || 0} Pend</span>
                <span className="text-gray-400">{unidade.j || 0} Just</span>
              </div>
            </button>
          );
        })}

        {porUnidade.length === 0 && (
          <div className="col-span-full rounded-[28px] border border-dashed border-white/60 bg-white/40 backdrop-blur-xl p-10 text-center">
            <Building2 className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm font-bold text-gray-500">Nenhuma unidade encontrada</p>
          </div>
        )}
      </div>
    </section>
  );
}