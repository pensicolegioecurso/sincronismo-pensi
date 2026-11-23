import { Building2, Eye, EyeOff, MapPin, ChevronRight } from "lucide-react";

export default function OverviewUnits({
  isDiretor = false,
  mostrarEstatisticas,
  setMostrarEstatisticas,
  porUnidade,
  onOpenUnit,
}) {
  const exibirEstatisticas = isDiretor || mostrarEstatisticas;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-black text-gray-900">
          {isDiretor ? "Unidade" : "Unidades"}
        </h2>
        {!isDiretor && (
          <button
            onClick={() => setMostrarEstatisticas(!mostrarEstatisticas)}
            className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-black shadow-sm border border-gray-100 transition"
          >
            {mostrarEstatisticas ? <EyeOff size={14} /> : <Eye size={14} />}
            {mostrarEstatisticas ? "Ocultar" : "Mostrar"}
          </button>
        )}
      </div>

      {exibirEstatisticas && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {porUnidade.map((unidade) => {
            const total = (unidade.c || 0) + (unidade.p || 0) + (unidade.j || 0);
            const percentual = total ? Math.round((unidade.c / total) * 100) : 0;

            return (
              <button
                type="button"
                key={unidade.nome}
                onClick={() => onOpenUnit(unidade)}
                className="group relative flex flex-col overflow-hidden rounded-[28px] bg-white border border-gray-100 p-5 text-left shadow-sm transition-all"
              >
                <div className="relative z-10 mb-4 flex w-full items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-gray-700">
                      <Building2 size={18} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-gray-900">{unidade.nome}</h3>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] font-bold text-gray-400 uppercase">
                        <MapPin size={10} /> {unidade.regional || "Sem regional"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 mb-2 flex w-full items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500">{percentual}% concluído</span>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>

                <div className="relative z-10 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-pensi-yellow" style={{ width: `${percentual}%` }} />
                </div>

                <div className="relative z-10 mt-4 flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase border-t border-gray-100 pt-3">
                  <span>{unidade.c || 0} Ok</span>
                  <span className="text-rose-500">{unidade.p || 0} Pend</span>
                  <span className="text-sky-500">{unidade.j || 0} Just</span>
                </div>
              </button>
            );
          })}

          {porUnidade.length === 0 && (
            <div className="col-span-full rounded-[28px] border border-dashed border-gray-200 bg-white p-10 text-center">
              <Building2 className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              <p className="text-sm font-bold text-gray-500">Nenhuma unidade encontrada</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}