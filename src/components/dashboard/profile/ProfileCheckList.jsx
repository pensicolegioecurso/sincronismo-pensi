
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  BookOpen,
  CalendarDays,
} from "lucide-react";

function formatarData(date) {
  if (!date) return "";

  const d = date instanceof Date ? date : new Date(date);

  return d.toLocaleDateString("pt-BR");
}

function InfoItem({ icon: Icon, children }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold text-gray-500">
      <Icon size={12} className="shrink-0 text-gray-400" />
      <span className="truncate">{children}</span>
    </span>
  );
}

export default function ProfileCheckList({ lista, abaAtiva }) {
  if (!lista.length) {
    return (
      <div className="flex min-h-[190px] flex-col items-center justify-center rounded-xl border-2 border-black bg-white px-4 py-8 text-center shadow-[2px_2px_0px_#000]">
        <AlertCircle size={27} className="mb-3 text-gray-500" />

        <h3 className="text-xs font-black uppercase tracking-wide text-black">
          Nenhum registro
        </h3>

        <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-gray-500">
          Não há atividades nesta categoria no momento.
        </p>
      </div>
    );
  }

  const Icone =
    abaAtiva === "pendente"
      ? Clock
      : abaAtiva === "justificado"
        ? AlertCircle
        : CheckCircle2;

  const corIcone =
    abaAtiva === "pendente"
      ? "text-red-700"
      : abaAtiva === "justificado"
        ? "text-yellow-700"
        : "text-green-700";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
          Histórico de atividades
        </span>

        <span className="rounded-md border-2 border-black bg-white px-2 py-1 text-[9px] font-black tabular-nums text-black shadow-[1px_1px_0px_#000]">
          {lista.length.toString().padStart(2, "0")} registros
        </span>
      </div>

      {lista.map((item) => (
        <article
          key={item.id}
          className="overflow-hidden rounded-lg border-2 border-black bg-white shadow-[2px_2px_0px_#000] transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000]"
        >
          <div className="flex items-start gap-3 p-3 sm:p-4">
            <div className="shrink-0 pt-0.5">
              <Icone
                size={21}
                strokeWidth={2.5}
                className={corIcone}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-xs font-black text-black">
                  {item.disciplina}
                </h4>

                {item.serie && (
                  <span className="rounded-md border border-black bg-gray-100 px-2 py-0.5 text-[8px] font-black uppercase text-gray-700">
                    {item.serie}
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                {item.unidade && (
                  <InfoItem icon={MapPin}>
                    {item.unidade}
                  </InfoItem>
                )}

                <InfoItem icon={BookOpen}>
                  {item.aulaIndex || "—"}
                </InfoItem>

                <InfoItem icon={CalendarDays}>
                  {formatarData(item.dataHora || item.dataReal)}
                </InfoItem>
              </div>

              {item.justificativa && (
                <div className="mt-3 rounded-lg border-2 border-pink-200 bg-pink-50 p-2.5">
                  <p className="mb-1 text-[9px] font-black uppercase tracking-wider text-pink-700">
                    Justificativa
                  </p>

                  <p className="text-[11px] leading-relaxed text-gray-700">
                    {item.justificativa}
                  </p>
                </div>
              )}

              {item.observacao && (
                <div className="mt-2 rounded-lg border-2 border-gray-200 bg-gray-50 p-2.5">
                  <p className="mb-1 text-[9px] font-black uppercase tracking-wider text-gray-500">
                    Observação
                  </p>

                  <p className="text-[11px] leading-relaxed text-gray-700">
                    {item.observacao}
                  </p>
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
