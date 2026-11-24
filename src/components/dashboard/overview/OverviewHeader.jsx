
import { ArrowLeft, MessageCircle, Users, FileSpreadsheet } from "lucide-react";

export default function OverviewHeader({
  isDiretor,
  unidadeFoco,
  nomeUsuario,
  cargoUsuario,
  onBack,
  onChat,
  onFamily,
  onDownloadPDF,
  onReports,
  familyMode,
  filtroPeriodo,
  setFiltroPeriodo,
  mesFiltro,
  setMesFiltro,
}) {
  let titulo = "VISÃO GERAL";
  let subtitulo = "";

  if (isDiretor && unidadeFoco) {
    titulo = unidadeFoco.toUpperCase();
    subtitulo = "Diretor(a)";
  } else if (nomeUsuario && !isDiretor) {
    const primeiroNome = nomeUsuario.split(" ")[0] || "Usuário";
    titulo = `OLÁ, ${primeiroNome.toUpperCase()}!`;
    subtitulo = cargoUsuario
      ? cargoUsuario.charAt(0).toUpperCase() + cargoUsuario.slice(1)
      : "";
  }

  const opcoesPeriodo = [
    { id: "anual", label: "Anual" },
    { id: "mes", label: "Mensal" },
    { id: "custom", label: "Período" },
  ];

  return (
    <header className="mb-6">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-100 bg-white text-black shadow-sm transition-transform active:scale-95"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>

        <div className="flex gap-1 rounded-[22px] border border-gray-100 bg-white px-2 py-1 shadow-sm">
          <button
            onClick={onChat}
            className="flex h-9 w-9 items-center justify-center rounded-full text-black transition hover:bg-gray-50"
            title="Chat"
          >
            <MessageCircle size={18} />
          </button>

          <button
            onClick={onFamily}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-black transition hover:bg-gray-50"
            title="Família"
          >
            <Users size={18} />

            {familyMode && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </button>

          <button
            onClick={onReports || onDownloadPDF}
            className="flex h-9 w-9 items-center justify-center rounded-full text-black transition hover:bg-yellow-50 hover:text-yellow-700"
            title="Relatórios"
          >
            <FileSpreadsheet size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex min-w-0 flex-col">
          <h1 className="text-3xl font-black uppercase leading-tight tracking-tight text-gray-900 sm:text-4xl">
            {titulo}
          </h1>

          {subtitulo && (
            <span className="mt-1 text-sm font-bold uppercase tracking-wide text-gray-400">
              {subtitulo}
            </span>
          )}
        </div>

        <div className="flex shrink-0 self-start rounded-full border border-gray-100 bg-white p-1 shadow-sm md:self-auto">
          {opcoesPeriodo.map((opcao) => (
            <button
              key={opcao.id}
              onClick={() => {
                setFiltroPeriodo(opcao.id);

                if (opcao.id !== "custom") {
                  setMesFiltro(new Date());
                }
              }}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-all ${
                filtroPeriodo === opcao.id
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {opcao.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
