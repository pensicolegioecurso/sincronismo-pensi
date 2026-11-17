// src/components/dashboard/feed/FeedList.jsx
import {
  MessageSquare, CheckCircle2, Send, Clock, MapPin, BookOpen,
  User, AlertCircle, CalendarDays, ChevronDown,
} from "lucide-react";

function getPostStyle(post) {
  if (post.tipo === "justificativa") {
    return { iconColor: "text-pink-500", icon: MessageSquare, label: "Justificativa registrada" };
  }
  return { iconColor: "text-green-600", icon: CheckCircle2, label: "Check de aula" };
}

export default function FeedList({ carregando, posts, comentariosAbertos, toggleComentarios }) {
  return (
    <div className="space-y-2.5">
      {carregando && (
        <div className="py-12 text-center text-gray-400 font-bold flex flex-col items-center">
          <span className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin mb-3" />
          Carregando o feed...
        </div>
      )}

      {!carregando && posts.length === 0 && (
        <div className="bg-white border-2 border-black border-dashed rounded-xl p-8 text-center shadow-[2px_2px_0px_#000]">
          <div className="w-12 h-12 bg-gray-100 border-2 border-black rounded-xl flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-black uppercase text-black">Nenhuma atividade encontrada</h3>
          <p className="text-[11px] text-gray-500 mt-1.5">Não há registros para exibir com esses filtros.</p>
        </div>
      )}

      {!carregando && posts.map((post) => {
        const style = getPostStyle(post);
        const StatusIcon = style.icon;
        const aberto = comentariosAbertos[post.id];
        return (
          <article key={post.id} className="bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] overflow-hidden">
            <div className="flex flex-col md:flex-row relative">
              <div className="flex-1 min-w-0 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-black text-black">{post.professor}</h3>
                    <span className="text-[10px] bg-gray-100 border border-black rounded px-1.5 font-bold uppercase tracking-wider text-gray-600">{post.aula}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-1 mt-2">
                    <span className="flex items-center gap-1.5 text-[11px] text-gray-700 font-bold">
                      <BookOpen className="w-3.5 h-3.5 shrink-0" /> {post.disciplina} • {post.turma}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 shrink-0" /> {post.unidade}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-1 mt-1.5">
                    <span className="flex items-center gap-1.5 text-[11px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      <CalendarDays className="w-3.5 h-3.5 shrink-0" /> Aula de {post.diaSemana}, {post.dataReferencia}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                      <Clock className="w-3.5 h-3.5 shrink-0" /> Registrado em {post.dataHoraFormatada} às {post.horaFormatada}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                  <div className="flex items-center gap-1.5 mb-2">
                    <StatusIcon className={`w-4 h-4 ${style.iconColor}`} strokeWidth={2.5} />
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">{style.label}</span>
                  </div>
                  {post.tipo === "justificativa" && post.justificativa && (
                    <div className="bg-pink-50 border border-pink-200 rounded p-2 mb-2">
                      <p className="text-[10px] font-bold text-pink-700 uppercase tracking-wider mb-0.5">Motivo:</p>
                      <p className="text-xs text-gray-800 font-medium">{post.justificativa}</p>
                    </div>
                  )}
                  {post.tipo === "aula" && post.observacao && (
                    <div className="bg-gray-50 border border-gray-200 rounded p-2 mb-2">
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-0.5">Observação:</p>
                      <p className="text-xs text-gray-800 font-medium">{post.observacao}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:w-[160px] shrink-0 bg-gray-50 border-t-2 md:border-t-0 md:border-l-2 border-black p-3 flex md:flex-col justify-between gap-2">
                <div className="hidden md:block">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Ações</span>
                </div>
                <div className="flex items-center gap-2 md:flex-col md:items-stretch">
                  <button onClick={() => toggleComentarios(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${aberto ? "bg-pensi-yellow" : "bg-white"}`}
                    aria-expanded={aberto}>
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>0</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${aberto ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>
            </div>

            {aberto && (
              <div className="border-t-2 border-black bg-gray-50 p-3 animate-fade-in">
                <p className="text-[11px] text-gray-400 italic mb-3">Nenhum comentário ainda.</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="relative flex-1">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Escreva um comentário..."
                      className="w-full bg-white border-2 border-black rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium focus:outline-none focus:bg-pensi-yellow/20 placeholder:text-gray-400 transition-colors shadow-[2px_2px_0px_#000]" />
                  </div>
                  <button className="w-9 h-9 bg-pensi-yellow border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center justify-center hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all shrink-0" aria-label="Enviar comentário">
                    <Send size={15} className="text-black" />
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}