
import { Users, UserPlus } from "lucide-react";
import UserCard from "./UserCard";

export default function UsersList({
  users,
  podeGerenciar,
  ehDirecao,
  onOpenCadastro,
  onOpenStatus,
  onOpenPermissions,
  onOpenProfile,
  onDelete,
}) {
  return (
    <section className="w-full min-w-0">

      {/* CABEÇALHO */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-800">
            Usuários cadastrados
          </span>

          <span className="text-xs font-medium text-gray-400">
            {users.length} {users.length === 1 ? "resultado" : "resultados"}
          </span>
        </div>

        {podeGerenciar && (
          <button
            type="button"
            onClick={onOpenCadastro}
            className="flex items-center gap-2 rounded-lg border-2 border-black bg-pensi-yellow px-4 py-2.5 text-[10px] font-black uppercase tracking-wide shadow-[2px_2px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <UserPlus size={15} strokeWidth={2.5} />
            Adicionar usuário
          </button>
        )}
      </div>

      {/* ESTADO VAZIO */}
      {users.length === 0 ? (
        <div className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-5 py-14 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg border-2 border-black bg-gray-100">
            <Users size={22} className="text-gray-600" />
          </div>

          <h3 className="text-sm font-black uppercase text-gray-800">
            Nenhum usuário encontrado
          </h3>

          <p className="mt-1 max-w-xs text-xs text-gray-500">
            Não encontramos usuários com os filtros ou termos pesquisados.
          </p>
        </div>
      ) : (

        /* GRID DE CARDS */
        <div className="
          grid
          w-full
          min-w-0
          grid-cols-1
          gap-5
          md:grid-cols-2
          2xl:grid-cols-3
          auto-rows-fr
          items-stretch
        ">
          {users.map((user) => (
            <div
              key={user.id}
              className="
                flex
                h-full
                min-w-0
                [&>*]:h-full
                [&>*]:w-full
              "
            >
              <UserCard
                user={user}
                podeGerenciar={podeGerenciar}
                ehDirecao={ehDirecao}
                onOpenStatus={() => onOpenStatus(user)}
                onOpenPermissions={() => onOpenPermissions(user)}
                onOpenProfile={() => onOpenProfile(user)}
                onDelete={() => onDelete(user)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
