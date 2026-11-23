import { ArrowLeft, MessageCircle, Users, FileDown } from "lucide-react";

export default function OverviewHeader({ 
  isDiretor,
  unidadeFoco,
  nomeUsuario,
  cargoUsuario, 
  onBack, 
  onChat, 
  onFamily, 
  onDownloadPDF, 
  familyMode,
  // Novas props para o filtro de período
  filtroPeriodo,
  setFiltroPeriodo,
  mesFiltro,
  setMesFiltro
}) {
  let titulo = "VISÃO GERAL";
  let subtitulo = "";

  if (isDiretor && unidadeFoco) {
    titulo = unidadeFoco.toUpperCase();
    subtitulo = "Diretor(a)";
  } else if (nomeUsuario && !isDiretor) {
    const primeiroNome = nomeUsuario.split(" ")[0] || "Usuário";
    titulo = `OLÁ, ${primeiroNome.toUpperCase()}!`;
    subtitulo = cargoUsuario ? cargoUsuario.charAt(0).toUpperCase() + cargoUsuario.slice(1) : "";
  }

  // Opções do seletor de período
  const opcoesPeriodo = [
    { id: "anual", label: "Anual" },
    { id: "mes", label: "Mensal" },
    { id: "custom", label: "Período" },
  ];

  return (
    <header className="mb-6">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack} 
          className="w-11 h-11 rounded-full bg-white flex justify-center items-center shadow-sm border border-gray-100 active:scale-95 transition-transform text-black"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>

        <div className="flex gap-1 bg-white rounded-[22px] px-2 py-1 border border-gray-100 shadow-sm">
          <button onClick={onChat} className="w-9 h-9 flex justify-center items-center text-black rounded-full hover:bg-gray-50 transition" title="Chat">
            <MessageCircle size={18} strokeWidth={2} />
          </button>
          <button onClick={onFamily} className="w-9 h-9 flex justify-center items-center text-black rounded-full hover:bg-gray-50 transition relative" title="Família">
            <Users size={18} strokeWidth={2} />
            {familyMode && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />}
          </button>
          <button onClick={onDownloadPDF} className="w-9 h-9 flex justify-center items-center text-black rounded-full hover:bg-gray-50 transition" title="PDF">
            <FileDown size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Linha do Título e Seletor de Período */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col min-w-0">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-gray-900 leading-tight">
            {titulo}
          </h1>
          {subtitulo && (
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wide mt-1">
              {subtitulo}
            </span>
          )}
        </div>

        {/* Seletor por Bolinhas */}
        <div className="flex bg-white rounded-full p-1 border border-gray-100 shadow-sm shrink-0 self-start md:self-auto">
          {opcoesPeriodo.map((opcao) => (
            <button
              key={opcao.id}
              onClick={() => {
                setFiltroPeriodo(opcao.id);
                if (opcao.id !== "custom") setMesFiltro(new Date()); // Reseta para o mês atual ao voltar
              }}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-all ${
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