import { useMemo } from "react";
import { Users } from "lucide-react";
import UserCard from "./UserCard";

function chaveDia(ms) {
  if (!ms) return "sem-data";
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function rotuloDia(ms) {
  if (!ms) return "Sem data de cadastro";
  const d = new Date(ms);
  const texto = d
    .toLocaleDateString("pt-BR", { day: "numeric", month: "long" })
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
  return d.getFullYear() === new Date().getFullYear() ? texto : `${texto} ${d.getFullYear()}`;
}

/* --- SKELETON BONITO PARA USUÁRIOS --- */
function SkeletonUserCard() {
  return (
    <div className="py-4 flex gap-3 w-400 animate-pulse border-b border-gray-100 last:border-0">
      <div className="shrink-0">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 rounded-md w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded-full w-12"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded-md w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded-md w-1/4"></div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export default function UsersList({
  users,
  carregando,
  totalFiltrado,
  totalGeral,
  ativos,
  inativos,
  podeGerenciar,
  ehDirecao,
  onOpenStatus,
  onOpenPermissions,
  onOpenProfile,
  onDelete,
}) {
  const grupos = useMemo(() => {
    const mapa = new Map();
    users.forEach((u) => {
      const chave = chaveDia(u.criadoEmMs);
      if (!mapa.has(chave)) mapa.set(chave, { chave, rotulo: rotuloDia(u.criadoEmMs), itens: [] });
      mapa.get(chave).itens.push(u);
    });
    return [...mapa.values()];
  }, [users]);

  return (
    <section className="w-full min-w-0 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Contadores no topo */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 mt-4">
        <div className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-[11px] font-bold text-gray-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {ativos} ativos
          <span className="mx-0.5 h-2 w-px bg-gray-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
          {inativos} inativos
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          <span>Exibindo</span>
          <span className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-0.5 text-black">{totalFiltrado}</span>
          <span>de {totalGeral}</span>
        </div>
      </div>

      {/* Skeletons enquanto carrega */}
      {carregando && (
        <div className="flex flex-col gap-1">
          <SkeletonUserCard />
          <SkeletonUserCard />
          <SkeletonUserCard />
          <SkeletonUserCard />
        </div>
      )}

      {/* Lista Vazia */}
      {!carregando && users.length === 0 && (
        <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-bold uppercase text-gray-900">Nenhum usuário encontrado</h3>
          <p className="mt-1.5 text-[11px] text-gray-500">Não há usuários para exibir com esses filtros.</p>
        </div>
      )}

      {/* Lista de Usuários */}
      {!carregando && grupos.map((grupo) => (
        <div key={grupo.chave} className="mb-6">
          <h3 className="mb-2 px-1 text-xs font-bold text-gray-400 uppercase tracking-wider">{grupo.rotulo}</h3>
          <div className="divide-y divide-gray-100">
            {grupo.itens.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                podeGerenciar={podeGerenciar}
                ehDirecao={ehDirecao}
                onOpenStatus={() => onOpenStatus(user)}
                onOpenPermissions={() => onOpenPermissions(user)}
                onOpenProfile={() => onOpenProfile(user)}
                onDelete={() => onDelete(user)}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}