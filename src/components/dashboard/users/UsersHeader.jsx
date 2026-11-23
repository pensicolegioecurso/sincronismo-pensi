import { ArrowLeft, MessageCircle, Users, UserPlus } from "lucide-react";

// Mesma estrutura do FeedHeader:
// linha 1 -> voltar à esquerda / pílula com chat + família à direita
// linha 2 -> título + subtítulo à esquerda / ação principal à direita
export default function UsersHeader({
  ehRegional,
  ehDirecao,
  podeGerenciar,
  onBack,
  onChat,
  onFamily,
  onOpenCadastro,
}) {
  const subtitulo = ehRegional
    ? "Gestão regional."
    : ehDirecao
      ? "Gestão da unidade."
      : "Gestão de acessos da plataforma.";

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
          <button onClick={onChat} className="flex h-9 w-9 items-center justify-center rounded-full text-black transition hover:bg-gray-50">
            <MessageCircle size={18} />
          </button>
          <button onClick={onFamily} className="flex h-9 w-9 items-center justify-center rounded-full text-black transition hover:bg-gray-50">
            <Users size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex min-w-0 flex-col">
          <h1 className="text-3xl font-black uppercase leading-tight tracking-tight text-gray-900 sm:text-4xl">
            USUÁRIOS
          </h1>
          <span className="mt-1 text-sm font-bold uppercase tracking-wide text-gray-400">{subtitulo}</span>
        </div>

        {podeGerenciar && (
          <button
            onClick={onOpenCadastro}
            className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-pensi-yellow px-5 py-2.5 text-xs font-black uppercase shadow-sm transition-all hover:brightness-95 active:scale-95"
          >
            <UserPlus size={16} strokeWidth={2.5} />
            Adicionar usuário
          </button>
        )}
      </div>
    </header>
  );
}