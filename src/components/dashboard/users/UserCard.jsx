
import {
  Mail,
  MapPin,
  ShieldCheck,
  Trash2,
  Power,
  PowerOff,
  Eye,
} from "lucide-react";

const CARGOS = {
  diretor: ["Diretor", "bg-violet-100"],
  coordenador: ["Coordenador", "bg-indigo-100"],
  nucleo: ["Núcleo", "bg-sky-100"],
  professor: ["Professor", "bg-emerald-100"],
  regional: ["Regional", "bg-orange-100"],
  admin: ["Admin", "bg-rose-100"],
};

const buttonBase =
  "flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-black px-2 py-2 text-[9px] font-black uppercase text-black shadow-[2px_2px_0px_#000] transition-all duration-150  hover:shadow-none   active:shadow-none sm:flex-none";

export default function UserCard({
  user,
  podeGerenciar,
  ehDirecao,
  onOpenStatus,
  onOpenPermissions,
  onOpenProfile,
  onDelete,
}) {
  const unidades = (user.unidade || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const inativas = user.unidadesInativas || [];
  const cargos = user.cargos || [];

  const temAtiva = unidades.some(
    (unidade) => !inativas.includes(unidade)
  );

  const status = !inativas.length
    ? "Ativo"
    : temAtiva
      ? "Parcial"
      : "Inativo";

  const estiloStatus = {
    Ativo: "bg-emerald-100",
    Parcial: "bg-amber-100",
    Inativo: "bg-gray-200",
  };

  return (
    <article className="overflow-hidden rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_#000] transition-all duration-150 hover:shadow-[6px_6px_0px_#000]">
      <div className="flex flex-col sm:flex-row">
        {/* Informações */}
        <div className="min-w-0 flex-1 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-pensi-yellow text-base font-black shadow-[2px_2px_0px_#000]">
              {user.nome?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-black text-gray-900">
                  {user.nome}
                </h3>

                <span
                  className={`rounded-md border-2 border-black px-2 py-0.5 text-[8px] font-black uppercase ${estiloStatus[status]}`}
                >
                  {status}
                </span>
              </div>

              <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-gray-500">
                <Mail size={12} className="shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t-2 border-dashed border-gray-200 pt-3">
            {/* Cargos */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-black uppercase text-gray-400">
                Cargos
              </span>

              {cargos.map((cargo) => {
                const [label, color] = CARGOS[cargo] || [
                  cargo,
                  "bg-gray-100",
                ];

                return (
                  <span
                    key={cargo}
                    className={`rounded-md border-2 border-black px-2 py-1 text-[9px] font-black uppercase shadow-[1px_1px_0px_#000] ${color}`}
                  >
                    {label}
                  </span>
                );
              })}
            </div>

            {/* Unidades */}
            <div className="flex flex-wrap items-center gap-2">
              <MapPin size={13} className="shrink-0 text-gray-500" />

              {unidades.length ? (
                unidades.map((unidade) => (
                  <span
                    key={unidade}
                    className={`rounded-md border-2 px-2 py-1 text-[9px] font-bold ${
                      inativas.includes(unidade)
                        ? "border-gray-300 bg-gray-100 text-gray-400 line-through"
                        : "border-black bg-[#FFF9DF] text-gray-800 shadow-[1px_1px_0px_#000]"
                    }`}
                  >
                    {unidade}
                  </span>
                ))
              ) : (
                <span className="text-[10px] italic text-gray-400">
                  Sem unidade vinculada
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Ações */}
        <aside className="flex shrink-0 flex-wrap items-center gap-2 border-t-2 border-black bg-[#F4F1EA] p-3 sm:w-40 sm:flex-col sm:items-stretch sm:justify-center sm:border-l-2 sm:border-t-0">
          {!ehDirecao && (
            <button
              type="button"
              onClick={onOpenStatus}
              className={`${buttonBase} ${
                !inativas.length
                  ? "bg-rose-100 hover:bg-rose-200"
                  : "bg-emerald-100 hover:bg-emerald-200"
              }`}
            >
              {!inativas.length ? (
                <PowerOff size={13} />
              ) : (
                <Power size={13} />
              )}
              Status
            </button>
          )}

          {cargos.includes("professor") && (
            <button
              type="button"
              onClick={onOpenProfile}
              className={`${buttonBase} bg-sky-100 hover:bg-sky-200`}
            >
              <Eye size={13} />
              Perfil
            </button>
          )}

          {podeGerenciar && (
            <>
              <button
                type="button"
                onClick={onOpenPermissions}
                className={`${buttonBase} bg-pensi-yellow hover:bg-yellow-300`}
              >
                <ShieldCheck size={13} />
                Permissões
              </button>

              <button
                type="button"
                onClick={onDelete}
                className={`${buttonBase} bg-white hover:bg-rose-100`}
              >
                <Trash2 size={13} />
                Excluir
              </button>
            </>
          )}
        </aside>
      </div>
    </article>
  );
}
