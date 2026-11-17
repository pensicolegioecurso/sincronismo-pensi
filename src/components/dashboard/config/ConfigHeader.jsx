
import { Plus, Building2 } from "lucide-react";

export default function ConfigHeader({
  buttonClass,
  podeGerenciar,
  ehDirecao,
  abrirNovaTurma,
  abrirNovaUnidade,
}) {
  return (
    <header className="flex flex-col gap-5 pb-6 mt-7 sm:flex-row sm:items-end sm:justify-between mb-7 mt-7 pb-4 border-b-2 border-black/40">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full border border-black bg-pensi-yellow" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            Unidades, turmas e calendário acadêmico
          </span>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
          Configurações<span className="text-pensi-yellow">.</span>
        </h1>

        <p className="mt-2 max-w-xl text-sm text-gray-500">
          Gerencie unidades, turmas, calendários e permissões de acesso.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 ">
        {(podeGerenciar || ehDirecao) && (
          <button
            onClick={abrirNovaTurma}
            className={`${buttonClass} bg-pensi-yellow`}
          >
            <Plus size={15} />
            Nova turma
          </button>
        )}

        {podeGerenciar && (
          <button
            onClick={abrirNovaUnidade}
            className={`${buttonClass} bg-white`}
          >
            <Building2 size={15} />
            Nova unidade
          </button>
        )}
      </div>
    </header>
  );
}
