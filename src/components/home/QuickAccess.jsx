import { useState, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { DISCIPLINAS_POR_ANO } from "../../data/disciplinas";
import SubjectCard from "../SubjectCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ITENS_POR_PAGINA = 6;

export default function QuickAccess({ onNavigate }) {
  const { user } = useAuth();
  const [ano, setAno] = useState("2026");
  const [pagina, setPagina] = useState(1);

  const disciplinas = useMemo(() => {
    const base = DISCIPLINAS_POR_ANO[ano] || {};
    const keys = Object.keys(base);
    if (!user) return keys;
    return keys.filter((key) => (user.disciplinas || []).includes(key));
  }, [ano, user]);

  const totalPaginas = Math.ceil(disciplinas.length / ITENS_POR_PAGINA);
  const paginaAtual = Math.min(pagina, Math.max(totalPaginas, 1));

  const disciplinasPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return disciplinas.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [disciplinas, paginaAtual]);

  return (
    <section id="acesso-rapido" className="w-full max-w-[1100px] mx-auto px-6 py-16 relative z-20">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h2 className="text-[36px] sm:text-[44px] font-black tracking-[-0.03em] text-pensi-dark uppercase leading-none mb-3">
            Acesso Rápido<span className="text-pensi-yellow">.</span>
          </h2>
          <p className="text-[15px] text-gray-500 font-medium">Selecione uma disciplina para visualizar o planejamento.</p>
        </div>
        
        <select
          value={ano}
          onChange={(e) => { setAno(e.target.value); setPagina(1); }}
          className="bg-white border border-gray-200 text-pensi-dark font-bold text-[13px] rounded-xl px-5 py-2.5 cursor-pointer shadow-sm focus:ring-2 focus:ring-pensi-yellow outline-none"
        >
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {disciplinasPaginadas.length === 0 && (
            <p className="text-gray-400 font-medium py-8 col-span-full">Nenhuma disciplina disponível.</p>
        )}
        {disciplinasPaginadas.map((key) => {
          const nome = DISCIPLINAS_POR_ANO[ano][key].nome;
          const card = { id: `${ano}-${key}`, nome, unidade: null, turma: null, qtdTurmas: null, key, ano };
          return (
            <SubjectCard key={`${ano}-${paginaAtual}-${key}`} card={card} onClick={() => onNavigate("calendar", key, ano)} />
          );
        })}
      </div>

      {totalPaginas > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-10 pt-6 border-t border-gray-200">
          <span className="text-[13px] font-medium text-gray-500 order-2 sm:order-1">
            Página {paginaAtual} de {totalPaginas}
          </span>
          
          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            <button 
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              disabled={paginaAtual === 1}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-pensi-dark" />
            </button>
            <button 
              onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual === totalPaginas}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-pensi-dark" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}