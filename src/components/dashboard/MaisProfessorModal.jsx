import { useMemo, useState } from "react";
import {
  X, ChevronLeft, ChevronRight, Search, BookOpen, GraduationCap, Building2, User,
  LayoutGrid, Settings
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { DISCIPLINAS_POR_ANO } from "../../utils/disciplinas";
import { obterTurmasAtivas } from "../../utils/turmasAtivas";

const ABAS = [
  ["materia", "Matéria", BookOpen],
  ["turma", "Turma", GraduationCap],
  ["unidade", "Unidade", Building2],
];

function Item({ icon: Icon, titulo, subtitulo, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl bg-[#f2f2f2] px-4 py-3 text-left transition-transform active:scale-[0.99]"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black">
        <Icon size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{titulo}</span>
        {subtitulo && <span className="block truncate text-sm text-gray-400">{subtitulo}</span>}
      </span>
      <ChevronRight size={18} className="shrink-0 text-gray-300" />
    </button>
  );
}

function Vazio({ children }) {
  return <p className="py-8 text-center text-sm text-gray-400">{children}</p>;
}

export default function MaisProfessorModal({ onClose, onNavigate }) {
  const { user } = useAuth();
  const [aba, setAba] = useState("materia");
  const [busca, setBusca] = useState("");
  const [unidadeSel, setUnidadeSel] = useState(null);

  const turmasPorUnidade = useMemo(() => obterTurmasAtivas(user), [user]);

  const disciplinas = useMemo(() => {
    if (!user || !Array.isArray(user.disciplinas)) return [];
    const base = DISCIPLINAS_POR_ANO["2026"] || {};
    return user.disciplinas.filter(Boolean).map((key) => ({
      key,
      nome: base[key]?.nome || key,
    }));
  }, [user]);

  const cardsMateria = useMemo(() => {
    const lista = [];
    disciplinas.forEach((d) => {
      Object.entries(turmasPorUnidade).forEach(([unidade, turmas]) => {
        lista.push({
          id: `${d.key}-${unidade}`,
          nome: d.nome,
          unidade,
          turma: null,
          qtdTurmas: turmas.length,
          key: d.key,
          ano: "2026",
        });
      });
    });
    return lista;
  }, [disciplinas, turmasPorUnidade]);

  const cardsTurma = useMemo(() => {
    const lista = [];
    disciplinas.forEach((d) => {
      Object.entries(turmasPorUnidade).forEach(([unidade, turmas]) => {
        turmas.forEach((turma) => {
          lista.push({
            id: `${d.key}-${unidade}-${turma}`,
            nome: d.nome,
            unidade,
            turma,
            qtdTurmas: null,
            key: d.key,
            ano: "2026",
          });
        });
      });
    });
    return lista;
  }, [disciplinas, turmasPorUnidade]);

  const unidades = useMemo(
    () =>
      Object.entries(turmasPorUnidade)
        .map(([nome, turmas]) => ({ nome, qtd: turmas.length }))
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    [turmasPorUnidade]
  );

  const termo = busca.trim().toLocaleLowerCase("pt-BR");
  const bate = (...partes) =>
    !termo || partes.filter(Boolean).join(" ").toLocaleLowerCase("pt-BR").includes(termo);

  const abrir = (card) => {
    onNavigate?.(card);
    onClose();
  };

  const trocarAba = (id) => {
    setAba(id);
    setBusca("");
    setUnidadeSel(null);
  };

  const materiasFiltradas = cardsMateria.filter((c) => bate(c.nome, c.unidade));
  const turmasFiltradas = cardsTurma.filter((c) => bate(c.turma, c.nome, c.unidade));
  const unidadesFiltradas = unidades.filter((u) => bate(u.nome));
  const materiasDaUnidade = cardsMateria.filter(
    (c) => c.unidade === unidadeSel && bate(c.nome)
  );

  const titulo = unidadeSel || "Mais";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 backdrop-blur-sm p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] sm:rounded-[28px] bg-white p-5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`::-webkit-scrollbar { display: none; }`}</style>

        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {unidadeSel ? (
              <button
                type="button"
                onClick={() => { setUnidadeSel(null); setBusca(""); }}
                aria-label="Voltar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2f2f2]"
              >
                <ChevronLeft size={18} />
              </button>
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-800">
                <LayoutGrid size={20} />
              </div>
            )}
            <h2 className="truncate text-xl font-extrabold">{titulo}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2f2f2]"
          >
            <X size={18} />
          </button>
        </div>

        {!unidadeSel && (
          <div className="mb-4 flex rounded-2xl bg-[#f2f2f2] p-1">
            {ABAS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => trocarAba(id)}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-colors ${
                  aba === id ? "bg-white shadow-sm" : "text-gray-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-[#f2f2f2] px-4 py-3">
          <Search size={18} className="text-gray-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar..."
            className="flex-1 bg-transparent text-[16px] outline-none"
          />
        </div>

        <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
          {aba === "materia" && !unidadeSel && (
            <>
              {materiasFiltradas.map((c) => (
                <Item
                  key={c.id}
                  icon={BookOpen}
                  titulo={c.nome}
                  subtitulo={`${c.unidade} · ${c.qtdTurmas} ${c.qtdTurmas === 1 ? "turma" : "turmas"}`}
                  onClick={() => abrir(c)}
                />
              ))}
              {materiasFiltradas.length === 0 && <Vazio>Nenhuma matéria encontrada.</Vazio>}
            </>
          )}

          {aba === "turma" && !unidadeSel && (
            <>
              {turmasFiltradas.map((c) => (
                <Item
                  key={c.id}
                  icon={GraduationCap}
                  titulo={c.turma}
                  subtitulo={`${c.nome} · ${c.unidade}`}
                  onClick={() => abrir(c)}
                />
              ))}
              {turmasFiltradas.length === 0 && <Vazio>Nenhuma turma encontrada.</Vazio>}
            </>
          )}

          {aba === "unidade" && !unidadeSel && (
            <>
              {unidadesFiltradas.map((u) => (
                <Item
                  key={u.nome}
                  icon={Building2}
                  titulo={u.nome}
                  subtitulo={`${u.qtd} ${u.qtd === 1 ? "turma" : "turmas"}`}
                  onClick={() => { setUnidadeSel(u.nome); setBusca(""); }}
                />
              ))}
              {unidadesFiltradas.length === 0 && <Vazio>Nenhuma unidade encontrada.</Vazio>}
            </>
          )}

          {unidadeSel && (
            <>
              {materiasDaUnidade.map((c) => (
                <Item
                  key={c.id}
                  icon={BookOpen}
                  titulo={c.nome}
                  subtitulo={`${c.qtdTurmas} ${c.qtdTurmas === 1 ? "turma" : "turmas"}`}
                  onClick={() => abrir(c)}
                />
              ))}
              {materiasDaUnidade.length === 0 && <Vazio>Nenhuma matéria encontrada.</Vazio>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}