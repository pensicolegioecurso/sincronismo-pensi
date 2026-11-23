import { useState, useEffect } from "react";
import {
  MessageSquare, CheckCircle2, Send, Clock, MapPin, BookOpen,
  User, AlertCircle, CalendarDays, ChevronDown, Loader2,
} from "lucide-react";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";

function getPostStyle(post) {
  if (post.tipo === "justificativa") {
    return { iconColor: "text-pink-500", icon: MessageSquare, label: "Justificativa registrada" };
  }
  return { iconColor: "text-emerald-600", icon: CheckCircle2, label: "Check de aula" };
}

function formatarHorario(timestamp) {
  if (!timestamp) return "Enviando...";
  const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if (Number.isNaN(data.getTime())) return "";
  return `${data.toLocaleDateString("pt-BR")} às ${data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

function ComentariosPost({ post, aberto, user }) {
  const [comentarios, setComentarios] = useState([]);
  const [texto, setTexto] = useState("");
  const [carregandoComentarios, setCarregandoComentarios] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const comentariosRef = collection(db, "checks", post.id, "comentarios");
    const consulta = query(comentariosRef, orderBy("criadoEm", "asc"));
    const unsubscribe = onSnapshot(consulta, (snapshot) => {
      setComentarios(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setCarregandoComentarios(false);
    }, (error) => {
      console.error("Erro ao carregar comentários:", error);
      setCarregandoComentarios(false);
      setErro("Não foi possível carregar os comentários.");
    });
    return unsubscribe;
  }, [post.id]);

  async function enviarComentario(e) {
    e.preventDefault();
    const mensagem = texto.trim();
    if (!mensagem || enviando) return;
    if (!user?.uid) { setErro("Você precisa estar autenticado para comentar."); return; }
    setEnviando(true); setErro("");
    try {
      const nome = user.nome || user.displayName || user.email?.split("@")[0] || "Usuário";
      await addDoc(collection(db, "checks", post.id, "comentarios"), {
        texto: mensagem, autorUid: user.uid, autorNome: nome, criadoEm: serverTimestamp(),
      });
      setTexto("");
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      setErro("Não foi possível enviar o comentário. Tente novamente.");
    } finally { setEnviando(false); }
  }

  if (!aberto) return null;

  return (
    <div className="border-t border-gray-100 bg-gray-50 p-4 sm:p-5 animate-fade-in w-full">
      <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
        {carregandoComentarios && (
          <div className="flex items-center justify-center gap-2 py-4 text-gray-400 text-xs font-bold">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando comentários...
          </div>
        )}
        {!carregandoComentarios && comentarios.length === 0 && (
          <p className="text-[11px] text-gray-400 italic py-2">Nenhum comentário ainda. Seja o primeiro!</p>
        )}
        {comentarios.map((comentario) => (
          <div key={comentario.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm w-full">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 shrink-0 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs uppercase">
                  {(comentario.autorNome || "U").charAt(0)}
                </div>
                <span className="text-xs font-bold text-gray-900 truncate">{comentario.autorNome || "Usuário"}</span>
              </div>
              <span className="text-[9px] text-gray-400 font-medium shrink-0">{formatarHorario(comentario.criadoEm)}</span>
            </div>
            <p className="text-xs text-gray-700 font-medium whitespace-pre-wrap break-words pl-9">{comentario.texto}</p>
          </div>
        ))}
      </div>
      {erro && <p className="text-[11px] text-red-600 font-bold mb-2">{erro}</p>}
      
      <form onSubmit={enviarComentario} className="flex items-center gap-2 w-full">
        <div className="relative flex-1">
          <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva um comentário..." maxLength={1000} disabled={enviando}
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm font-medium focus:outline-none focus:border-black placeholder:text-gray-400 transition-colors" />
        </div>
        <button type="submit" disabled={!texto.trim() || enviando}
          className="w-11 h-11 bg-black border border-transparent rounded-xl flex items-center justify-center hover:bg-gray-800 transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
          {enviando ? <Loader2 size={16} className="animate-spin text-white" /> : <Send size={16} className="text-white" />}
        </button>
      </form>
    </div>
  );
}

function FeedPost({ post, comentariosAbertos, toggleComentarios, user }) {
  const style = getPostStyle(post);
  const StatusIcon = style.icon;
  const aberto = !!comentariosAbertos[post.id];
  const inicialProf = post.professor ? post.professor.charAt(0).toUpperCase() : "P";

  return (
    <article className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-4 relative">
      <div className="p-5 pb-16 relative">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm mr-1 shrink-0">
            {inicialProf}
          </div>
          <h3 className="text-sm font-bold text-gray-900">{post.professor}</h3>
          {post.aula && (
            <span className="text-[10px] bg-gray-50 border border-gray-100 rounded px-1.5 font-bold uppercase tracking-wider text-gray-500">
              {post.aula}
            </span>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-gray-700 font-medium">
            <BookOpen className="w-3.5 h-3.5 shrink-0" />{post.disciplina} • {post.turma}
          </span>
          <span className="flex items-center gap-1.5 text-gray-500 font-medium">
            <MapPin className="w-3.5 h-3.5 shrink-0" />{post.unidade}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-2 mt-3">
          <span className="flex items-center gap-1.5 text-[11px] text-pensi-yellow font-bold">
            <CalendarDays className="w-3.5 h-3.5 shrink-0" />Aula de {post.diaSemana}, {post.dataReferencia}
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
            <Clock className="w-3.5 h-3.5 shrink-0" />Registrado em {post.dataHoraFormatada} às {post.horaFormatada}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5 mb-2">
            <StatusIcon className={`w-4 h-4 ${style.iconColor}`} strokeWidth={2.5} />
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">{style.label}</span>
          </div>
          {post.tipo === "justificativa" && post.justificativa && (
            <div className="bg-pink-50 border border-pink-100 rounded-lg p-3 mb-2">
              <p className="text-[10px] font-bold text-pink-700 uppercase tracking-wider mb-0.5">Motivo:</p>
              <p className="text-xs text-gray-800 font-medium">{post.justificativa}</p>
            </div>
          )}
          {post.tipo === "aula" && post.observacao && (
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-2">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-0.5">Observação:</p>
              <p className="text-xs text-gray-800 font-medium">{post.observacao}</p>
            </div>
          )}
        </div>

        {/* Botão no canto (posicionado absolutamente) */}
        <div className="absolute bottom-4 right-5">
          <button
            onClick={() => toggleComentarios(post.id)}
            className={`flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors ${aberto ? "bg-gray-100 text-black" : "bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> 
            <span>{aberto ? "Ocultar" : "Comentários"}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${aberto ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Comentários abrem embaixo */}
      <ComentariosPost post={{ id: post.id }} aberto={aberto} user={user} />
    </article>
  );
}

export default function FeedList({ carregando, posts, comentariosAbertos, toggleComentarios, user }) {
  return (
    <div className="space-y-4">
      {carregando && (
        <div className="py-12 text-center text-gray-400 font-bold flex flex-col items-center">
          <Loader2 className="w-6 h-6 animate-spin mb-3" /> Carregando o feed...
        </div>
      )}
      {!carregando && posts.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-bold uppercase text-gray-900">Nenhuma atividade encontrada</h3>
          <p className="text-[11px] text-gray-500 mt-1.5">Não há registros para exibir com esses filtros.</p>
        </div>
      )}
      {!carregando && posts.map((post) => (
        <FeedPost key={post.id} post={post} comentariosAbertos={comentariosAbertos} toggleComentarios={toggleComentarios} user={user} />
      ))}
    </div>
  );
}