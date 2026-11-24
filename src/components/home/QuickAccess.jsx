import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { DISCIPLINAS_POR_ANO } from "../../utils/disciplinas";
import SubjectCard from "../SubjectCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ITENS_DESKTOP = 6;
const ANOS = ["2026", "2027"];

export default function QuickAccess({ onNavigate }) {
  const { user } = useAuth();
  const [ano, setAno] = useState("2026");
  const [pagina, setPagina] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const itensPorPagina = isMobile ? 1 : ITENS_DESKTOP;

  const disciplinas = useMemo(() => {
    const base = DISCIPLINAS_POR_ANO[ano] || {};
    const keys = Object.keys(base);
    if (!user) return keys;
    return keys.filter((key) => (user.disciplinas || []).includes(key));
  }, [ano, user]);

  const totalPaginas = Math.ceil(disciplinas.length / itensPorPagina);
  const paginaAtual = Math.min(pagina, Math.max(totalPaginas, 1));

  useEffect(() => {
    setPagina(1);
  }, [isMobile]);

  const disciplinasPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return disciplinas.slice(inicio, inicio + itensPorPagina);
  }, [disciplinas, paginaAtual, itensPorPagina]);

  return (
    <section id="acesso-rapido" className="py-14 sm:py-20 px-4 max-w-[930px] mx-auto mt-[-90px]">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row-reverse justify-between items-end mb-8 sm:mb-10 gap-4 sm:gap-5">
        <div className="text-right">
          <h2 className="text-4xl sm:text-5xl md:text-[56px] font-black uppercase leading-[0.9] tracking-tighter text-[#111] mb-3">
            Acesso <br />
            <span className="text-black px-2 inline-block mt-1 rounded-md">rápido.</span>
          </h2>
          <p className="text-14 sm:text-sm text-gray-500 font-medium max-w-[280px] ml-auto leading-snug">
            Selecione uma disciplina para visualizar o planejamento.
          </p>
        </div>

        {/* Filtro de ano em pílulas — esquerda no mobile */}
        <div
          className="flex items-center gap-1 bg-gray-100 rounded-full p-1 self-start md:self-auto"
          role="group"
          aria-label="Filtrar por ano"
        >
          {ANOS.map((a) => (
            <button
              key={a}
              onClick={() => { setAno(a); setPagina(1); }}
              aria-pressed={ano === a}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                ano === a ? "bg-[#111] text-white shadow-sm" : "text-gray-500 hover:text-[#111]"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 sm:mt-10 pt-6 border-t border-gray-200">
          <span className="text-[13px] font-medium text-gray-500 order-2 sm:order-1">
            Página {paginaAtual} de {totalPaginas}
          </span>

          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaAtual === 1}
              aria-label="Página anterior"
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-[#111]" />
            </button>
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual === totalPaginas}
              aria-label="Próxima página"
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-[#111]" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}