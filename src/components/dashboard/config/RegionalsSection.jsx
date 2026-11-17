
import { useState } from "react";
import { Users, UserCheck, Eye, EyeOff } from "lucide-react";

export default function RegionalsSection({
  carregandoReg,
  regionais,
  abrirModalRegional,
  buttonClass,
}) {
  const [regionaisVisiveis, setRegionaisVisiveis] = useState(false);

  return (
    <section className="space-y-4  pt-7">

      {/* CABEÇALHO */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users size={18} />
            <h2 className="text-lg font-black uppercase">
              Regionais
            </h2>
          </div>

          <p className="mt-1 text-xs text-gray-500">
            Vincule os usuários regionais às unidades que eles gerenciam.
          </p>
        </div>

        <button
          onClick={() => setRegionaisVisiveis((atual) => !atual)}
          className="inline-flex w-auto flex-row items-center justify-center gap-2 whitespace-nowrap rounded-2xl border-2 border-black bg-white px-5 py-3 text-xs font-black uppercase tracking-wide text-black shadow-[5px_5px_0_#000] transition-colors hover:bg-gray-100"
        >
          {regionaisVisiveis ? (
            <>
              <EyeOff size={17} />
              Ocultar
            </>
          ) : (
            <>
              <Eye size={17} />
              Exibir
            </>
          )}
        </button>
      </div>

      {/* CONTEÚDO */}
      {regionaisVisiveis && (
        <>
          {carregandoReg ? (
            <p className="rounded-xl border-2 border-black bg-white p-6 text-center text-xs font-bold shadow-[3px_3px_0_#000]">
              Carregando regionais...
            </p>
          ) : regionais.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-black bg-white p-8 text-center shadow-[3px_3px_0_#000]">
              <UserCheck
                size={28}
                className="mx-auto mb-2 text-gray-400"
              />

              <p className="text-sm font-black uppercase">
                Nenhum regional cadastrado
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Cadastre um usuário com o cargo Regional na área de usuários.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {regionais.map((regional) => (
                <article
                  key={regional.id}
                  className="overflow-hidden rounded-xl border-[2.5px] border-black bg-white shadow-[5px_5px_0_#000]"
                >
                  {/* CABEÇALHO DO REGIONAL */}
                  <div className="flex items-center gap-3 border-b-[2.5px] border-black bg-pensi-yellow p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-white shadow-[2px_2px_0_#000]">
                      <UserCheck size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-black uppercase">
                        {regional.nome}
                      </h3>

                      <p className="truncate text-[11px] font-bold text-gray-700">
                        {regional.email}
                      </p>
                    </div>

                    <button
                      onClick={() => abrirModalRegional(regional)}
                      className="shrink-0 rounded-lg border-2 border-black bg-white px-3 py-2 text-[9px] font-black uppercase shadow-[3px_3px_0_#000] transition-colors hover:bg-gray-100"
                    >
                      Atribuir unidades
                    </button>
                  </div>

                  {/* UNIDADES ATRIBUÍDAS */}
                  <div className="p-4">
                    <p className="mb-3 text-[10px] font-black uppercase text-gray-500">
                      Unidades atribuídas (
                      {regional.unidadesComando.length})
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {regional.unidadesComando.length ? (
                        regional.unidadesComando.map((unidade) => (
                          <span
                            key={unidade}
                            className="rounded-md border-2 border-black bg-gray-100 px-2.5 py-1.5 text-[10px] font-black shadow-[2px_2px_0_#000]"
                          >
                            {unidade}
                          </span>
                        ))
                      ) : (
                        <span className="border-2 border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-[11px] font-bold italic text-gray-400">
                          Nenhuma unidade atribuída.
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
