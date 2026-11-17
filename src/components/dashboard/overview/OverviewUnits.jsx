// src/components/dashboard/overview/OverviewUnits.jsx
import { MapPin, Building2, AlertCircle } from "lucide-react";
import OverviewUnitCard from "./OverviewUnitCard";

export default function OverviewUnits({
  mostrarEstatisticas, setMostrarEstatisticas,
  porUnidade, cardExpandido, setCardExpandido,
}) {
  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <h2 className="text-sm font-black uppercase tracking-wider text-black">Desempenho por unidade</h2>
          </div>
          <p className="text-[11px] text-gray-500 font-medium mt-0.5">Consulte os indicadores individuais de cada unidade.</p>
        </div>
        <button
          onClick={() => {
            setMostrarEstatisticas(!mostrarEstatisticas);
            if (mostrarEstatisticas) setCardExpandido(null);
          }}
          className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border-2 border-black text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${mostrarEstatisticas ? "bg-pensi-yellow text-black" : "bg-white text-black"}`}
        >
          <Building2 className="w-4 h-4" />
          {mostrarEstatisticas ? "Ocultar unidades" : "Ver estatísticas"}
        </button>
      </div>

      {mostrarEstatisticas && (
        <div className="animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 border-2 border-black rounded-xl px-3 py-2 mb-3">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Unidades encontradas</span>
            </div>
            <span className="bg-white border-2 border-black rounded-lg px-2.5 py-0.5 text-[12px] font-black">{porUnidade.length}</span>
          </div>
          {porUnidade.length === 0 ? (
            <div className="bg-white border-2 border-black border-dashed rounded-xl p-8 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-black uppercase">Nenhuma unidade encontrada</p>
              <p className="text-[11px] text-gray-500 mt-1">Tente alterar os filtros selecionados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {porUnidade.map((u) => (
                <OverviewUnitCard
                  key={u.nome}
                  u={u}
                  isExpanded={cardExpandido === u.nome}
                  onToggle={() => setCardExpandido(cardExpandido === u.nome ? null : u.nome)}
                  onClose={() => setCardExpandido(null)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}