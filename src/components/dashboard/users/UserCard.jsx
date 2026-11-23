import {
  GraduationCap, Building2, ClipboardList, Users, Globe, UserRound,
  SlidersHorizontal, Eye, ShieldCheck, Trash2,
} from "lucide-react";
import { CARGOS } from "./ui";

const ICONE_CARGO = {
  professor: GraduationCap,
  diretor: Building2,
  coordenador: ClipboardList,
  nucleo: Users,
  regional: Globe,
};

const COR_STATUS = {
  Ativo: "text-emerald-600",
  Parcial: "text-amber-600",
  Inativo: "text-gray-400",
};

const acao =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-900 hover:text-white active:scale-95";

// Linha estilo "extrato": ícone em círculo | nome + detalhes | status + ações
export default function UserCard({
  user,
  podeGerenciar,
  ehDirecao,
  onOpenStatus,
  onOpenPermissions,
  onOpenProfile,
  onDelete,
}) {
  const unidades = (user.unidade || "").split(",").map((i) => i.trim()).filter(Boolean);
  const inativas = user.unidadesInativas || [];
  const cargos = user.cargos || [];

  const temAtiva = unidades.some((u) => !inativas.includes(u));
  const status = !inativas.length ? "Ativo" : temAtiva ? "Parcial" : "Inativo";

  const Icone = ICONE_CARGO[cargos[0]] || UserRound;
  const cargosTexto = cargos.map((c) => CARGOS[c]?.[0] || c).join(", ");
  const unidadesTexto = unidades.length ? unidades.join(", ") : "Sem unidade";

  return (
    <article className="mb-3 rounded-[32px] border border-gray-100 bg-white px-4 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:px-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-800">
          <Icone size={22} strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1 basis-[180px]">
          <h3 className="truncate text-base font-bold text-gray-900">{user.nome}</h3>
          <p className="truncate text-sm font-medium text-gray-400">
            {cargosTexto} · {unidadesTexto}
          </p>
          <p className="truncate text-[11px] font-medium text-gray-300">{user.email}</p>
        </div>

        <span className={`shrink-0 text-base font-bold ${COR_STATUS[status]}`}>{status}</span>

        <div className="flex items-center gap-1.5 max-sm:w-full max-sm:justify-end max-sm:border-t max-sm:border-gray-50 max-sm:pt-3">
          {!ehDirecao && (
            <button type="button" onClick={onOpenStatus} title="Acessos" aria-label="Acessos" className={acao}>
              <SlidersHorizontal size={15} />
            </button>
          )}

          {cargos.includes("professor") && (
            <button type="button" onClick={onOpenProfile} title="Perfil" aria-label="Perfil" className={acao}>
              <Eye size={15} />
            </button>
          )}

          {podeGerenciar && (
            <>
              <button type="button" onClick={onOpenPermissions} title="Permissões" aria-label="Permissões" className={acao}>
                <ShieldCheck size={15} />
              </button>
              <button
                type="button"
                onClick={onDelete}
                title="Excluir"
                aria-label="Excluir"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-300 transition hover:bg-rose-50 hover:text-rose-500 active:scale-95"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}