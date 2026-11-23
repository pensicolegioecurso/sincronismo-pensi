import { useState } from "react";
import { Trash2, Search } from "lucide-react";
import Modal from "./Modal";

const TITULOS = {
  turma: "Remover turma",
  unidade: "Remover unidade",
  calendario: "Remover calendário",
};

const fmt = (iso) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR") : "—";

export default function RemoveModal({
  tipo,
  onClose,
  turmas = [],
  unidades = [],
  calendarios = [],
  excluirTurma,
  excluirUnidadeCompleta,
  excluirCalendario,
  podeExcluirUnidade,
  erro,
  salvando,
}) {
  const [busca, setBusca] = useState("");
  const termo = busca.trim().toLocaleLowerCase("pt-BR");

  let itens = [];

  if (tipo === "turma") {
    itens = [...turmas]
      .sort(
        (a, b) =>
          String(a.unidade).localeCompare(String(b.unidade), "pt-BR") ||
          String(a.turma).localeCompare(String(b.turma), "pt-BR")
      )
      .map((t) => ({
        id: t.id,
        titulo: t.turma,
        subtitulo: `${t.unidade} · ${t.serie} · ${t.turno === "M" ? "Manhã" : "Tarde"}`,
        excluir: () => excluirTurma(t),
      }));
  }

  if (tipo === "unidade") {
    itens = unidades.map((u) => {
      const qtd = turmas.filter((t) => t.unidade === u).length;
      return {
        id: u,
        titulo: u,
        subtitulo: `${qtd} ${qtd === 1 ? "turma" : "turmas"}`,
        bloqueado: !podeExcluirUnidade,
        excluir: () => excluirUnidadeCompleta(u),
      };
    });
  }

  if (tipo === "calendario") {
    itens = calendarios.map((c) => ({
      id: c.id,
      titulo: c.nome,
      subtitulo: `${fmt(c.inicio)} até ${fmt(c.fim)}`,
      excluir: () => excluirCalendario(c),
    }));
  }

  if (termo) {
    itens = itens.filter((i) =>
      `${i.titulo} ${i.subtitulo}`.toLocaleLowerCase("pt-BR").includes(termo)
    );
  }

  return (
    <Modal titulo={TITULOS[tipo] || "Remover"} tamanho="max-w-lg" onClose={onClose}>
      <div className="space-y-3 p-5">
        {erro && (
          <p className="rounded-lg border-2 border-red-300 bg-red-50 p-2 text-xs font-bold text-red-700">
            {erro}
          </p>
        )}

        <div className="flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3 py-2.5">
          <Search size={16} className="text-gray-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar..."
            className="flex-1 bg-transparent text-sm font-semibold outline-none"
          />
        </div>

        <div className="max-h-[50vh] space-y-2 overflow-y-auto">
          {itens.length === 0 ? (
            <p className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center text-xs font-bold text-gray-400">
              Nada encontrado.
            </p>
          ) : (
            itens.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-white p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-black">{item.titulo}</p>
                  <p className="mt-0.5 truncate text-[10px] font-semibold text-gray-500">
                    {item.subtitulo}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={item.excluir}
                  disabled={salvando || item.bloqueado}
                  title="Excluir"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-red-100 text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}