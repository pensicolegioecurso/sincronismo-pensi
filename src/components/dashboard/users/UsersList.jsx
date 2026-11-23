import { useMemo } from "react";
import { Users } from "lucide-react";
import UserCard from "./UserCard";

function chaveDia(ms) {
  if (!ms) return "sem-data";
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "18 De Novembro" (acrescenta o ano quando não é o ano atual)
function rotuloDia(ms) {
  if (!ms) return "Sem data de cadastro";
  const d = new Date(ms);
  const texto = d
    .toLocaleDateString("pt-BR", { day: "numeric", month: "long" })
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
  return d.getFullYear() === new Date().getFullYear() ? texto : `${texto} ${d.getFullYear()}`;
}

export default function UsersList({
  users,
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
  // Agrupa por dia de cadastro, preservando a ordem (já vem do mais recente para o mais antigo)
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
    <section className="w-full min-w-0">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-800">
            Usuários cadastrados
          </span>

          <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {ativos} ativos
            <span className="mx-0.5 h-3 w-px bg-gray-200" />
            <span className="h-2 w-2 rounded-full bg-gray-300" />
            {inativos} inativos
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          <span>Exibindo</span>
          <span className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-0.5 text-black">{totalFiltrado}</span>
          <span>de {totalGeral}</span>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-bold uppercase text-gray-900">Nenhum usuário encontrado</h3>
          <p className="mt-1.5 text-[11px] text-gray-500">Não há usuários para exibir com esses filtros.</p>
        </div>
      ) : (
        grupos.map((grupo) => (
          <div key={grupo.chave}>
            <h3 className="mb-3 mt-6 px-2 text-sm font-bold text-gray-500">{grupo.rotulo}</h3>
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
        ))
      )}
    </section>
  );
}