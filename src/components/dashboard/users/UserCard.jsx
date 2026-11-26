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

// Cores mais suaves para o status
const COR_STATUS = {
  Ativo: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Parcial: "bg-amber-50 text-amber-700 border-amber-200",
  Inativo: "bg-gray-50 text-gray-500 border-gray-200",
};

const acao =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/50 text-gray-500 transition hover:bg-black hover:text-white active:scale-95 shadow-sm";

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
    <article className="mb-3 relative overflow-hidden rounded-[24px] border border-white/60 bg-gradient-to-br from-white/80 via-white/50 to-white/20 backdrop-blur-2xl px-4 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)] sm:px-5 transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      
      {/* Linha de brilho no topo (Liquid Glass) */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        
        {/* Ícone do Cargo em Círculo */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/60 border border-white/50 shadow-sm text-gray-700">
          <Icone size={20} strokeWidth={1.75} />
        </div>

        {/* Informações do Usuário */}
        <div className="min-w-0 flex-1 basis-[180px]">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-bold text-gray-900">{user.nome}</h3>
            {/* Status como Pill sutil */}
            <span className={`hidden sm:inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${COR_STATUS[status]}`}>
              {status}
            </span>
          </div>
          <p className="truncate text-xs font-medium text-gray-500 mt-0.5">
            {cargosTexto} · {unidadesTexto}
          </p>
          <p className="truncate text-[10px] font-medium text-gray-400 mt-0.5">{user.email}</p>
        </div>

        {/* Status Mobile */}
        <span className={`sm:hidden shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${COR_STATUS[status]}`}>
          {status}
        </span>

        {/* Ações */}
        <div className="flex items-center gap-1.5 max-sm:w-full max-sm:justify-end max-sm:border-t max-sm:border-black/5 max-sm:pt-3">
          {!ehDirecao && (
            <button type="button" onClick={onOpenStatus} title="Acessos" aria-label="Acessos" className={acao}>
              <SlidersHorizontal size={14} />
            </button>
          )}

          {cargos.includes("professor") && (
            <button type="button" onClick={onOpenProfile} title="Perfil" aria-label="Perfil" className={acao}>
              <Eye size={14} />
            </button>
          )}

          {podeGerenciar && (
            <>
              <button type="button" onClick={onOpenPermissions} title="Permissões" aria-label="Permissões" className={acao}>
                <ShieldCheck size={14} />
              </button>
              <button
                type="button"
                onClick={onDelete}
                title="Excluir"
                aria-label="Excluir"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-rose-50 hover:text-rose-500 active:scale-95"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}