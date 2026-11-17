import { UserPlus } from "lucide-react";

export default function UsersHeader({
  ehRegional,
  ehDirecao,
  podeGerenciar,
  onOpenCadastro,
  total,
  inativos,
}) {
  return (
    <section className="mb-5 mt-7 pb-4 border-b-2 border-black/40">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 bg-pensi-yellow border border-black rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
              {ehRegional ? "Gestão regional" : ehDirecao ? "Gestão da unidade" : "Gestão de acessos"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-none">
            Usuários<span className="text-pensi-yellow">.</span>
          </h1>

          <p className="text-xs text-gray-500 mt-2 max-w-xl leading-relaxed">
            Gerencie usuários, cargos e permissões.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {podeGerenciar && (
            <button
              onClick={onOpenCadastro}
              className="flex items-center gap-1.5 px-3 py-2 bg-pensi-yellow border-2 border-black rounded-md text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Cadastrar usuário
            </button>
          )}

          <div className="bg-white border-2 border-black rounded-md px-3 py-2 shadow-[2px_2px_0px_#000]">
            <span className="block text-[9px] font-black uppercase tracking-widest text-gray-400">
              Total
            </span>
            <span className="text-lg font-black text-black tabular-nums">
              {total.toString().padStart(2, "0")}
            </span>
          </div>

          <div className="bg-pensi-yellow border-2 border-black rounded-md px-3 py-2 shadow-[2px_2px_0px_#000]">
            <span className="block text-[9px] font-black uppercase tracking-widest text-black/60">
              Inativos
            </span>
            <span className="text-lg font-black text-black tabular-nums">
              {inativos.toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}