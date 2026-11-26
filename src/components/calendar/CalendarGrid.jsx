import { COLUNAS_DIAS, pad2 } from "../../utils/formatters";

export default function CalendarGrid({
  weeks, mesSelecionado, onDayClick, diaSelecionado,
  isDiaLetivo, turmaSelecionada, serie, unidadeSelecionada, maxWeeks = 12, onLoadMore,
}) {
  if (!weeks.length) {
    return (
      <div className="text-center text-[#111111] font-bold py-8 bg-white border border-gray-100 rounded-[24px] shadow-sm">
        Nenhum dado encontrado nesta aba.
      </div>
    );
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const visiveis = weeks.filter((sem) => {
    if (mesSelecionado.m < 0) return true;
    return (
      !sem.datas ||
      sem.datas.slice(0, 5).some(
        (d) => d.getFullYear() === mesSelecionado.y && d.getMonth() === mesSelecionado.m
      )
    );
  });

  if (!visiveis.length) {
    return (
      <div className="text-center text-[#111111] font-bold py-8 bg-white border border-gray-100 rounded-[24px] shadow-sm">
        Nenhuma semana neste mês.
      </div>
    );
  }

  const paginaVisivel = visiveis.slice(0, maxWeeks);

  return (
    <div className="space-y-4">
      {paginaVisivel.map((sem) => {
        const originalIdx = weeks.indexOf(sem);

        return (
          <div key={sem.key} className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm flex items-stretch">
            
            {/* Coluna Lateral Ultra Compacta (Período em Amarelo) */}
            <div className="bg-pensi-yellow flex flex-col items-center justify-center px-2 sm:w-[70px] md:w-[85px] shrink-0 border-r border-black/5">
              <span className="text-[10px] sm:text-[11px] font-black text-[#111111] uppercase tracking-tighter text-center leading-tight">
                {sem.periodo || `Sem. ${originalIdx + 1}`}
              </span>
            </div>

            {/* Dias da Semana (Máximo Espaço) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 p-2.5 flex-1">
              {COLUNAS_DIAS.map(([nomeDia, abrev], k) => {
                const d = sem.datas ? sem.datas[k] : null;

                const fora =
                  d && mesSelecionado.m >= 0 &&
                  !(d.getFullYear() === mesSelecionado.y && d.getMonth() === mesSelecionado.m);

                const ehHoje = d && d.getTime() === hoje.getTime();

                const dataTxt = d
                  ? fora
                    ? `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`
                    : pad2(d.getDate())
                  : "";

                const letivo = d
                  ? isDiaLetivo(d, turmaSelecionada, serie, unidadeSelecionada)
                  : false;

                const isSelected =
                  letivo &&
                  diaSelecionado?.weekIdx === originalIdx &&
                  diaSelecionado?.diaIdx === k;

                return (
                  <button
                    key={nomeDia}
                    type="button"
                    onClick={() => {
                      if (letivo) {
                        onDayClick(originalIdx, k);
                      }
                    }}
                    disabled={!letivo}
                    aria-disabled={!letivo}
                    title={!letivo ? "Dia bloqueado ou não letivo" : nomeDia}
                    className={`
                      relative flex flex-col justify-between min-h-[85px] p-2.5 rounded-[16px] text-left transition-all duration-200
                      ${isSelected 
                        ? "bg-[#111111] text-white border-2 border-[#111111] shadow-md" 
                        : "bg-gray-50 border border-transparent hover:border-gray-200"
                      }
                      ${!isSelected && fora ? "bg-gray-100 opacity-50" : ""}
                      ${!isSelected && ehHoje && letivo && !isSelected ? "bg-green-50/50 border-green-200" : ""}
                      ${!isSelected && !fora && letivo && !isSelected ? "hover:bg-gray-100 cursor-pointer" : ""}
                      ${!letivo ? "bg-gray-50 opacity-40 grayscale cursor-not-allowed" : ""}
                    `}
                  >
                    <div className={`text-[10px] font-black uppercase flex items-center justify-between w-full mb-2 ${isSelected ? "text-pensi-yellow" : "text-gray-400"}`}>
                      <span>{abrev}</span>
                      {dataTxt && (
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${isSelected ? "bg-white/20 text-white" : ehHoje && letivo ? "bg-[#111111] text-white" : "bg-gray-200/50 text-gray-600"}`}>
                          {dataTxt}
                        </span>
                      )}
                    </div>

                    <div className={`text-[11px] font-bold leading-tight break-words ${isSelected ? "text-white" : letivo ? "text-gray-700" : "text-gray-400"}`}>
                      {letivo ? (sem.dias[nomeDia] || "—") : "Exceção"}
                    </div>

                    {isSelected && (
                      <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-pensi-yellow rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {visiveis.length > maxWeeks && <button type="button" onClick={onLoadMore} className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50">Carregar mais semanas</button>}
    </div>
  );
}
