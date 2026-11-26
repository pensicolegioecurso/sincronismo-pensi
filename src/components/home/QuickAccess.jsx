import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { DISCIPLINAS_POR_ANO } from "../../utils/disciplinas";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useMaterias } from "../../hooks/useMaterias";
import { obterTurmasAtivas } from "../../utils/turmasAtivas";
import { extrairSerieTurma, normalizarTurma } from "../../utils/turmas";
import SubjectCard from "../SubjectCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ITENS_DESKTOP = 6;
const ANOS_BASE = Object.keys(DISCIPLINAS_POR_ANO);

export default function QuickAccess({ onNavigate }) {
  const { user } = useAuth();
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const [pagina, setPagina] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [sincronismos, setSincronismos] = useState([]);
  const [erroSincronismos, setErroSincronismos] = useState(false);
  const { materias } = useMaterias();
  const turmasAtivas = useMemo(() => Object.values(obterTurmasAtivas(user)).flat(), [user]);

  useEffect(() => {
    if (!user?.uid) {
      setSincronismos([]);
      setErroSincronismos(false);
      return undefined;
    }
    return onSnapshot(collection(db, "sincronismos"), (snapshot) => {
      setErroSincronismos(false);
      setSincronismos(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.ativo !== false));
    }, (error) => {
      console.error("Erro ao carregar sincronismos:", error);
      setErroSincronismos(true);
    });
  }, [user?.uid]);

  const anos = useMemo(() => [...new Set([...ANOS_BASE, String(new Date().getFullYear()), String(new Date().getFullYear() + 1), ...sincronismos.map((item) => String(item.ano))])].sort((a, b) => Number(a) - Number(b)), [sincronismos]);
  const cargosGestao = ["admin", "administrador", "nucleo", "regional", "diretor", "direcao", "coordenador"];
  const ehGestor = user?.cargos?.some((cargo) => cargosGestao.includes(String(cargo).toLowerCase())) || cargosGestao.includes(String(user?.cargo || "").toLowerCase());

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const itensPorPagina = isMobile ? 1 : ITENS_DESKTOP;

  const disciplinas = useMemo(() => {
    const materiasValidas = new Set(materias.map((item) => item.key));
    const sincronismosDoAno = sincronismos.filter((item) => String(item.ano) === String(ano) && materiasValidas.has(item.materia));
    if (String(ano) === "2026") return [...new Set([...Object.keys(DISCIPLINAS_POR_ANO["2026"] || {}), ...sincronismosDoAno.map((item) => item.materia)])];
    const serieTurmas = new Set(turmasAtivas.map((turma) => extrairSerieTurma(turma) || normalizarTurma(turma)));
    const unidadesUsuario = [...new Set([
      ...String(user?.unidade || "").split(","),
      ...(Array.isArray(user?.unidadesComando) ? user.unidadesComando : String(user?.unidadesComando || "").split(",")),
    ].map((item) => String(item).trim().toLocaleLowerCase("pt-BR")).filter(Boolean))];
    const sincronismosVisiveis = !user || ehGestor ? sincronismosDoAno : sincronismosDoAno.filter((item) => {
      const unidadeOk = item.todasUnidades !== false || (Array.isArray(item.unidades) && item.unidades.some((unidade) => unidadesUsuario.includes(String(unidade).trim().toLocaleLowerCase("pt-BR"))));
      const segmentoOk = ehGestor || !turmasAtivas.length || (item.segmentos || []).some((segmento) => serieTurmas.has(extrairSerieTurma(segmento) || normalizarTurma(segmento)));
      return unidadeOk && segmentoOk;
    });
    return [...new Set(sincronismosVisiveis.map((item) => item.materia))];
  }, [ano, user, ehGestor, sincronismos, materias, turmasAtivas]);

  const materiasPorChave = useMemo(() => Object.fromEntries(materias.map((item) => [item.key, item.nome])), [materias]);

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
          {anos.map((a) => (
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
          <input aria-label="Outro ano" type="number" min="2026" step="1" value={ano} onChange={(event) => { setAno(event.target.value); setPagina(1); }} className="w-20 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-center" />
        </div>
      </div>

      {erroSincronismos && <p role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">Não foi possível carregar os sincronismos salvos. As regras publicadas no Firebase precisam permitir a leitura da coleção <code>sincronismos</code>.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {disciplinasPaginadas.length === 0 && (
          <p className="text-gray-400 font-medium py-8 col-span-full">Nenhuma disciplina disponível.</p>
        )}
        {disciplinasPaginadas.map((key) => {
          const nome = materiasPorChave[key] || sincronismos.find((item) => item.materia === key)?.materiaNome || DISCIPLINAS_POR_ANO[ano]?.[key]?.nome || key;
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
