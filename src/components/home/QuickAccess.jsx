import { useState, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { DISCIPLINAS_POR_ANO } from "../../data/disciplinas";
import SubjectCard from "../SubjectCard";
import Reveal from "../../utils/Reveal";
import {
  Triangle,
  Square,
  Circle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ITENS_POR_PAGINA = 6;

export default function QuickAccess({ onNavigate }) {
  const { user } = useAuth();

  const [ano, setAno] = useState("2026");
  const [pagina, setPagina] = useState(1);

  const disciplinas = useMemo(() => {
    const base = DISCIPLINAS_POR_ANO[ano] || {};
    const keys = Object.keys(base);

    if (!user) return keys;

    return keys.filter((key) =>
      (user.disciplinas || []).includes(key)
    );
  }, [ano, user]);

  const totalPaginas = Math.ceil(
    disciplinas.length / ITENS_POR_PAGINA
  );

  const paginaAtual = Math.min(
    pagina,
    Math.max(totalPaginas, 1)
  );

  const disciplinasPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;

    return disciplinas.slice(
      inicio,
      inicio + ITENS_POR_PAGINA
    );
  }, [disciplinas, paginaAtual]);

  const mudarPagina = (novaPagina) => {
    if (novaPagina < 1 || novaPagina > totalPaginas) return;
    setPagina(novaPagina);
  };

  const mudarAno = (novoAno) => {
    setAno(novoAno);
    setPagina(1);
  };

  return (
    <section
      className="
        relative z-20
        w-full max-w-[980px]
        mx-auto
        px-8 sm:px-10 lg:px-6
        -mt-24 md:-mt-46
        mb-14
      "
    >
      {/* Container Liquid Glass + Neo-Brutalismo */}
      <div
        id="acesso-rapido"
        className="
          scroll-mt-28
          relative
          bg-white
          border-[2px] border-black
          rounded-3xl
          shadow-[6px_6px_0px_0px_#000]
          p-6 sm:p-8 md:p-10
          overflow-hidden
        "
      >
        {/* Brilho interno do vidro */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none opacity-40 z-0"></div>

        {/* Cabeçalho */}
        <div
          className="
            relative z-10
            flex flex-col
            items-center text-center
            mb-8 pt-4
          "
        >
          {/* Formas geométricas pretas */}
          <div
            className="flex items-center gap-2 mb-4"
            aria-hidden="true"
          >
            <Triangle
              className="w-4 h-4 text-gray-900"
              strokeWidth={2}
            />

            <Square
              className="w-3.5 h-3.5 text-gray-900"
              strokeWidth={2}
            />

            <Circle
              className="w-3.5 h-3.5 text-gray-900"
              strokeWidth={2}
            />
          </div>

          <h2
            className="
              text-[26px] sm:text-[30px]
              font-bold
              tracking-[-0.04em]
              text-gray-900
              mb-2
            "
          >
            Acesso Rápido
            <span className="text-pensi-yellow">.</span>
          </h2>

          <p
            className="
              text-[13px] sm:text-sm
              text-gray-600
              font-light
            "
          >
            Selecione uma disciplina para visualizar.
          </p>
        </div>

        {/* Seletor de ano - Liquid Glass + Neo-Brutalismo */}
        <div className="relative z-10 flex justify-end mb-5">
          <select
            value={ano}
            onChange={(e) => mudarAno(e.target.value)}
            aria-label="Selecionar ano letivo"
            className="
              px-3 py-2
              bg-white/60 backdrop-blur-md
              border-[2px] border-black
              shadow-[2px_2px_0px_0px_#000]
              rounded-xl
              font-bold text-sm
              text-gray-800
              cursor-pointer
              focus:outline-none
              hover:bg-white/80
              transition-colors duration-200
            "
          >
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>

        {/* Disciplinas */}
        <div
          className="
            relative z-10
            grid grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-6
          "
        >
          {disciplinasPaginadas.length === 0 && (
            <div
              className="
                col-span-full
                text-center
                text-gray-500 text-sm font-medium
                py-10
                bg-white/50
                backdrop-blur-sm
                rounded-xl
                border-[2px] border-black border-dashed
              "
            >
              Nenhuma disciplina disponível.
            </div>
          )}

          {disciplinasPaginadas.map((key, index) => (
            <Reveal
              key={`${ano}-${paginaAtual}-${key}`}
              delay={index * 50}
            >
              <SubjectCard
                nome={DISCIPLINAS_POR_ANO[ano][key].nome}
                onClick={() =>
                  onNavigate("calendar", key, ano)
                }
              />
            </Reveal>
          ))}
        </div>

        {/* Paginação centralizada - Agora igual ao outro arquivo */}
        {totalPaginas > 1 && (
          <nav
            className="
              relative z-10
              flex flex-col
              items-center justify-center
              gap-4
              mt-8 pt-6
              border-t-[2px] border-black/20
            "
            aria-label="Paginação de disciplinas"
          >
            {/* Contador centralizado */}
            <p
              className="
                text-[13px]
                font-bold
                text-gray-800
                text-center
              "
            >
              Exibindo{" "}
              {(paginaAtual - 1) * ITENS_POR_PAGINA + 1}
              {"–"}
              {Math.min(
                paginaAtual * ITENS_POR_PAGINA,
                disciplinas.length
              )}
              {" de "}
              {disciplinas.length} disciplinas
            </p>

            {/* Botões centralizados */}
            <div
              className="
                flex flex-wrap
                items-center justify-center
                gap-2
              "
            >
              {/* Anterior */}
              <button
                type="button"
                onClick={() => mudarPagina(paginaAtual - 1)}
                disabled={paginaAtual === 1}
                aria-label="Página anterior"
                className="
                  p-2
                  flex items-center justify-center
                  bg-white/60 backdrop-blur-md
                  border-[2px] border-black
                  rounded-xl
                  shadow-[2px_2px_0px_0px_#000]
                  text-gray-900
                  hover:bg-white/80
                  disabled:opacity-30
                  disabled:cursor-not-allowed
                  transition-all duration-200
                  cursor-pointer
                "
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
              </button>

              {/* Números das páginas */}
              {Array.from(
                { length: totalPaginas },
                (_, index) => index + 1
              ).map((numero) => (
                <button
                  key={numero}
                  type="button"
                  onClick={() => mudarPagina(numero)}
                  aria-label={`Página ${numero}`}
                  aria-current={
                    paginaAtual === numero
                      ? "page"
                      : undefined
                  }
                  className={`
                    w-9 h-9
                    flex items-center justify-center
                    rounded-xl
                    text-[13px] font-bold
                    border-[2px] border-black
                    transition-all duration-200
                    cursor-pointer
                    ${
                      paginaAtual === numero
                        ? "bg-pensi-yellow text-gray-900 shadow-[2px_2px_0px_0px_#000] -translate-y-0.5"
                        : "bg-white/60 backdrop-blur-md text-gray-800 shadow-[2px_2px_0px_0px_#000] hover:bg-white/80"
                    }
                  `}
                >
                  {numero}
                </button>
              ))}

              {/* Próxima */}
              <button
                type="button"
                onClick={() => mudarPagina(paginaAtual + 1)}
                disabled={paginaAtual === totalPaginas}
                aria-label="Próxima página"
                className="
                  p-2
                  flex items-center justify-center
                  bg-white/60 backdrop-blur-md
                  border-[2px] border-black
                  rounded-xl
                  shadow-[2px_2px_0px_0px_#000]
                  text-gray-900
                  hover:bg-white/80
                  disabled:opacity-30
                  disabled:cursor-not-allowed
                  transition-all duration-200
                  cursor-pointer
                "
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </nav>
        )}
      </div>
    </section>
  );
}