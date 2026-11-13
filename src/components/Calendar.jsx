import { COLUNAS_DIAS, pad2 } from "../utils/formatters";

export default function Calendar({ 
  weeks, 
  mesSelecionado, 
  onDayClick, 
  diaSelecionado,
  isDiaLetivo, // <-- NOVA PROP
  turmaSelecionada, // <-- NOVA PROP (pra saber qual turma passar pro check)
  serie // <-- NOVA PROP (pra saber qual série passar pro check)
}) {
  if (!weeks.length) {
    return <div className="text-center text-black font-bold py-8 bg-white border-[2px] border-black rounded-xl shadow-[3px_3px_0px_0px_#000]">Nenhum dado encontrado nesta aba.</div>;
  }

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);

  const visiveis = weeks.filter((sem) => {
    if (mesSelecionado.m < 0) return true;
    return !sem.datas || sem.datas.slice(0, 5).some((d) => d.getFullYear() === mesSelecionado.y && d.getMonth() === mesSelecionado.m);
  });

  if (!visiveis.length) {
    return <div className="text-center text-black font-bold py-8 bg-white border-[2px] border-black rounded-xl shadow-[3px_3px_0px_0px_#000]">Nenhuma semana neste mês.</div>;
  }

  return (
    <div className="space-y-6">
      {visiveis.map((sem, idx) => {
        const originalIdx = weeks.indexOf(sem);
        return (
          <div key={sem.key} className="border-[3px] border-black rounded-xl overflow-hidden bg-black shadow-[5px_5px_0px_0px_#000]">
            
            <div className="grid grid-cols-[90px_repeat(6,1fr)]">
              {/* Coluna do Período */}
              <div className="px-2 py-3 bg-pensi-yellow border-r-[2px] border-black text-[10px] flex flex-col justify-center items-center text-center">
                <strong className="text-[10px] font-black text-black uppercase leading-tight">{sem.periodo || `Sem. ${originalIdx + 1}`}</strong>
              </div>

              {/* Dias */}
              {COLUNAS_DIAS.map(([nomeDia, abrev], k) => {
                const d = sem.datas ? sem.datas[k] : null;
                const fora = d && mesSelecionado.m >= 0 && !(d.getFullYear() === mesSelecionado.y && d.getMonth() === mesSelecionado.m);
                const ehHoje = d && d.getTime() === hoje.getTime();
                const dataTxt = d ? (fora ? `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}` : pad2(d.getDate())) : "";
                const isSelected = diaSelecionado?.weekIdx === originalIdx && diaSelecionado?.diaIdx === k;
                
                // VERIFICA SE O DIA É LETIVO
                const letivo = d && isDiaLetivo ? isDiaLetivo(d, turmaSelecionada, serie) : true;

                return (
                  <button
                    key={nomeDia}
                    onClick={() => letivo ? onDayClick(originalIdx, k) : null}
                    disabled={!letivo}
                    className={`
                      relative min-h-[85px] p-2 border-r-[2px] last:border-r-0 border-black text-left transition-colors duration-150
                      ${isSelected ? "bg-black text-pensi-yellow" : "bg-white"}
                      ${!isSelected && fora ? "bg-gray-100 opacity-60" : ""}
                      ${!isSelected && ehHoje ? "bg-green-50" : ""}
                      ${!isSelected && !fora && letivo ? "hover:bg-yellow-50" : ""}
                      ${!letivo ? "bg-gray-200 opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    {/* Topo: Abreviação e Data */}
                    <div className={`text-[10px] font-black uppercase flex items-center justify-between w-full
                      ${isSelected ? "text-pensi-yellow" : "text-gray-500"}`}>
                      
                      {/* Abreviação */}
                      <span className={!isSelected && ehHoje ? "bg-black text-pensi-yellow px-1.5 py-0.5 rounded" : ""}>
                        {abrev}
                      </span>

                      {/* Data */}
                      {dataTxt && (
                        <span className={`px-1 rounded ${!isSelected && ehHoje ? "bg-black text-white" : ""} ${!letivo ? "text-gray-400" : ""}`}>
                          {dataTxt}
                        </span>
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className={`text-[10px] mt-1.5 font-bold leading-tight break-words
                      ${isSelected ? "text-pensi-yellow" : letivo ? "text-gray-800" : "text-gray-400"}`}>
                      {letivo ? (sem.dias[nomeDia] || "—") : "Feriado / Recesso"}
                    </div>
                    
                    {/* Indicador de seleção */}
                    {isSelected && (
                      <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 bg-pensi-yellow rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}