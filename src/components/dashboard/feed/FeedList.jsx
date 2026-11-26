import { useState, useEffect } from "react";
import {
  MessageSquare, CheckCircle2, Send, Clock, MapPin, BookOpen,
  User, AlertCircle, CalendarDays, Loader2,
} from "lucide-react";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";

function formatarHorario(timestamp) {
  if (!timestamp) return "";
  const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if (Number.isNaN(data.getTime())) return "";
  const diffMin = Math.floor((new Date() - data) / 60000);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHoras = Math.floor(diffMin / 60);
  if (diffHoras < 24) return `${diffHoras}h`;
  return data.toLocaleDateString("pt-BR");
}

/* --- COMPONENTE DE SKELETON --- */
function SkeletonPost() {
  return (
    <div className="py-5 flex gap-3 w-full animate-pulse">
      {/* Avatar skeleton */}
      <div className="shrink-0">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      </div>
      
      <div className="flex-1 min-w-0 space-y-3">
        {/* Nome e data skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded-md w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded-md w-1/6"></div>
        </div>
        
        {/* Texto skeleton */}
        <div className="space-y-1.5">
          <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
        </div>

        {/* Card de aula skeleton */}
        <div className="rounded-2xl border border-gray-100 p-4 space-y-3 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-md"></div>
            <div className="h-3 bg-gray-200 rounded-md w-1/3"></div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-3 bg-gray-200 rounded-md w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded-md w-2/5"></div>
          </div>
        </div>
        
        {/* Botão skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="h-3 bg-gray-200 rounded-md w-16"></div>
        </div>
      </div>
    </div>
  );
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
    <div className="border-t border-gray-100 bg-gray-50/50 p-4 animate-fade-in w-full mt-3 rounded-b-2xl">
      <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
        {carregandoComentarios && (
          <div className="space-y-3 animate-pulse">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-3 h-16"></div>
            </div>
          </div>
        )}
        {!carregandoComentarios && comentarios.length === 0 && (
          <p className="text-sm text-gray-400 italic py-2 text-center">Nenhum comentário ainda.</p>
        )}
        {comentarios.map((comentario) => (
          <div key={comentario.id} className="flex gap-3">
            <div className="w-8 h-8 shrink-0 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs uppercase mt-1">
              {(comentario.autorNome || "U").charAt(0)}
            </div>
            <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-bold text-gray-900 truncate">{comentario.autorNome || "Usuário"}</span>
                <span className="text-[10px] text-gray-400 font-medium shrink-0">{formatarHorario(comentario.criadoEm)}</span>
              </div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{comentario.texto}</p>
            </div>
          </div>
        ))}
      </div>
      {erro && <p className="text-[11px] text-red-600 font-bold mb-2">{erro}</p>}
      
      <form onSubmit={enviarComentario} className="flex items-center gap-2 w-full mt-2">
        <div className="w-8 h-8 shrink-0 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
          <User size={16} />
        </div>
        <div className="relative flex-1">
          <input type="text" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva uma resposta..." maxLength={1000} disabled={enviando}
            className="w-full bg-white border border-gray-200 rounded-full pl-4 pr-12 py-2.5 text-sm font-medium focus:outline-none focus:border-black placeholder:text-gray-400 transition-colors" />
          <button type="submit" disabled={!texto.trim() || enviando}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-black rounded-full hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {enviando ? <Loader2 size={14} className="animate-spin text-white" /> : <Send size={14} className="text-white" />}
          </button>
        </div>
      </form>
    </div>
  );
}

function FeedPost({ post, comentariosAbertos, toggleComentarios, user, qtdComentarios }) {
  const aberto = !!comentariosAbertos[post.id];
  const inicialProf = post.professor ? post.professor.charAt(0).toUpperCase() : "P";
  const handle = `@${post.professor?.toLowerCase().replace(/\s/g, '') || 'user'}`;

  return (
    <article className="py-5 flex gap-3 w-full">
      <div className="shrink-0">
        <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
          {inicialProf}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-[15px]">
          <span className="font-bold text-gray-900 truncate">{post.professor}</span>
          <span className="text-gray-500 truncate">{handle}</span>
          <span className="text-gray-400 text-xs px-1">·</span>
          <span className="text-gray-500 shrink-0 text-sm">{post.dataHoraFormatada}</span>
        </div>

        <p className="text-[15px] text-gray-900 mt-1 leading-snug whitespace-pre-wrap">
          {post.disciplina} • {post.turma}
          {post.observacao && `\n\n${post.observacao}`}
        </p>

        <div className="mt-3 rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                <BookOpen size={14} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Registro de Aula</span>
            </div>
            
            <div className="space-y-2 mt-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" /> {post.unidade}
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-gray-400" /> {post.diaSemana}, {post.dataReferencia}
              </div>
              <div className="flex items-center gap-2">
                {post.tipo === 'justificativa' ? (
                  <><AlertCircle size={16} className="text-pink-500" /> Justificativa: {post.justificativa}</>
                ) : (
                  <><CheckCircle2 size={16} className="text-emerald-500" /> Check de aula realizado</>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center mt-3">
          <button onClick={() => toggleComentarios(post.id)} className="flex items-center gap-1.5 text-gray-500 hover:text-black transition group">
            <div className="p-2 rounded-full group-hover:bg-gray-100 transition"><MessageSquare size={18} /></div>
            <span className="text-xs font-bold">{qtdComentarios > 0 ? `${qtdComentarios} Comentários` : "Comentar"}</span>
          </button>
        </div>

        <ComentariosPost post={{ id: post.id }} aberto={aberto} user={user} />
      </div>
    </article>
  );
}

export default function FeedList({ carregando, posts, comentariosAbertos, toggleComentarios, user, contagemComentarios }) {
  return (
    <div className="divide-y divide-gray-300/70 w-full">
      {/* Substituído o Spinner pelo Skeleton */}
      {carregando && (
        <div className="flex flex-col">
          <SkeletonPost />
          <SkeletonPost />
          <SkeletonPost />
        </div>
      )}
      
      {!carregando && posts.length === 0 && (
        <div className="p-8 text-center">
          <h3 className="text-lg font-bold text-gray-900">Nenhuma atividade encontrada</h3>
          <p className="text-sm text-gray-500 mt-1">Não há registros para exibir com esses filtros.</p>
        </div>
      )}
      
      {!carregando && posts.map((post) => (
        <FeedPost 
          key={post.id} 
          post={post} 
          comentariosAbertos={comentariosAbertos} 
          toggleComentarios={toggleComentarios} 
          user={user} 
          qtdComentarios={contagemComentarios[post.id] || 0}
        />
      ))}
    </div>
  );
}