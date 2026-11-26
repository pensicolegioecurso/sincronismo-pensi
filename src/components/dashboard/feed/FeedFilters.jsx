import { Filter, ChevronDown } from "lucide-react";

export default function FeedFilters({
  filtroTipoFeed, setFiltroTipoFeed,
  isFilterOpen, setIsFilterOpen, filterRef,
}) {
  const getLabel = () => {
    if (filtroTipoFeed === "aula") return "Aulas";
    if (filtroTipoFeed === "justificativa") return "Justificativas";
    return "Tudo";
  };

  return (
    <div className="flex items-center gap-2 py-3 border-b border-gray-100 px-4" ref={filterRef}>
      <div className="relative">
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
        >
          <Filter size={16} />
          <span>Feed: {getLabel()}</span>
          <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
        </button>

        {isFilterOpen && (
          <div className="absolute top-full mt-2 left-0 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
            {[
              { id: "tudo", label: "Tudo" },
              { id: "aula", label: "Aulas" },
              { id: "justificativa", label: "Justificativas" }
            ].map((tipo) => (
              <button 
                key={tipo.id} 
                onClick={() => { setFiltroTipoFeed(tipo.id); setIsFilterOpen(false); }}
                className={`w-full text-left px-4 py-3 text-sm font-bold border-b border-gray-100 last:border-0 transition-colors ${filtroTipoFeed === tipo.id ? "bg-gray-50 text-black" : "hover:bg-gray-50 text-gray-600"}`}
              >
                {tipo.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}