
import {
  Building2,
  Eye,
  EyeOff,
  ChevronRight,
  MapPin,
  BookOpen,
} from "lucide-react";

export default function OverviewUnits({
  isDiretor = false,
  mostrarEstatisticas,
  setMostrarEstatisticas,
  porUnidade,
  onOpenUnit,
}) {
  const exibirEstatisticas = isDiretor || mostrarEstatisticas;

  return (
    <section className="mt-8 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black uppercase">
            {isDiretor ? "Minha unidade" : "Unidades"}
          </h2>

          <p className="text-xs font-semibold text-gray-500">
            {isDiretor
              ? "Consulte os indicadores e o desempenho das turmas da sua unidade."
              : "Selecione uma unidade para consultar os indicadores detalhados."}
          </p>
        </div>

        {!isDiretor && (
          <button
            type="button"
            onClick={() =>
              setMostrarEstatisticas(!mostrarEstatisticas)
            }
            className="flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-black shadow-[3px_3px_0_#000] transition hover:-translate-y-0.5"
          >
            {mostrarEstatisticas ? (
              <EyeOff size={15} />
            ) : (
              <Eye size={15} />
            )}

            {mostrarEstatisticas ? "Ocultar" : "Estatísticas"}
          </button>
        )}
      </div>

      {exibirEstatisticas && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {porUnidade.map((unidade) => {
            const total =
              (unidade.c || 0) +
              (unidade.p || 0) +
              (unidade.j || 0);

            const percentual = total
              ? Math.round((unidade.c / total) * 100)
              : 0;

            return (
              <button
                type="button"
                key={unidade.nome}
                onClick={() => onOpenUnit(unidade)}
                className="group rounded-2xl border-2 border-black bg-white p-4 text-left shadow-[4px_4px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000]"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pensi-yellow">
                      <Building2 size={17} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-black uppercase">
                        {unidade.nome}
                      </h3>

                      <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] font-semibold text-gray-400">
                        <MapPin size={10} />
                        {unidade.regional || "Sem regional"}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    size={17}
                    className="shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-black"
                  />
                </div>

                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                    <BookOpen size={12} />
                    {unidade.turmas?.length || 0} turmas
                  </span>

                  <span className="text-xs font-black">
                    {percentual}% concluído
                  </span>
                </div>

                <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${percentual}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-emerald-50 px-2 py-2">
                    <p className="text-[9px] font-bold uppercase text-emerald-700">
                      Concluídas
                    </p>

                    <p className="text-lg font-black text-emerald-800">
                      {unidade.c || 0}
                    </p>
                  </div>

                  <div className="rounded-lg bg-rose-50 px-2 py-2">
                    <p className="text-[9px] font-bold uppercase text-rose-700">
                      Pendentes
                    </p>

                    <p className="text-lg font-black text-rose-800">
                      {unidade.p || 0}
                    </p>
                  </div>

                  <div className="rounded-lg bg-sky-50 px-2 py-2">
                    <p className="text-[9px] font-bold uppercase text-sky-700">
                      Justificadas
                    </p>

                    <p className="text-lg font-black text-sky-800">
                      {unidade.j || 0}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}

          {porUnidade.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 text-center sm:col-span-2">
              <Building2 className="mx-auto mb-2 h-8 w-8 text-gray-300" />

              <p className="text-xs font-black uppercase text-gray-500">
                Nenhuma unidade encontrada
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                Confira o cadastro da unidade e o escopo de acesso do usuário.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
