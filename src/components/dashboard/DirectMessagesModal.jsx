import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { ArrowLeft, MessageCircle, Send, X, Plus, Search } from "lucide-react";
import { db } from "../../services/firebase";

function idDaConversa(a, b) {
  return [a, b].sort().join("__");
}

const CARGOS_GESTAO = ["regional", "diretor", "direcao", "coordenador", "nucleo"];
const normalizar = (v) => String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
const cargosDe = (u) => [...(Array.isArray(u?.cargos) ? u.cargos : []), u?.cargo].filter(Boolean).map(normalizar);
const unidadesDe = (u) => [...(Array.isArray(u?.unidadesComando) ? u.unidadesComando : []), ...String(u?.unidade || "").split(",")].map(normalizar).filter(Boolean);

export default function DirectMessagesModal({ user, perfilAtivo, initialContact, onClose }) {
  const [conversas, setConversas] = useState([]);
  const [conversaAtiva, setConversaAtiva] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");
  const [contatos, setContatos] = useState([]);
  const [novoContato, setNovoContato] = useState(false);
  const [buscaContato, setBuscaContato] = useState("");
  const cargoAtual = normalizar(perfilAtivo);
  const podeEnviar = cargoAtual !== "admin" && cargoAtual !== "administrador";

  useEffect(() => {
    if (!podeEnviar || !user?.uid) return;
    getDocs(collection(db, "users")).then((snapshot) => {
      const meuEscopo = unidadesDe(user);
      const resultado = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((pessoa) => {
        if (pessoa.id === user.uid) return false;
        const cargos = cargosDe(pessoa);
        if (cargos.some((cargo) => ["admin", "administrador"].includes(cargo))) return false;
        if (cargoAtual === "nucleo") return true;
        if (cargoAtual === "regional") {
          if (cargos.includes("nucleo")) return true;
          if (!cargos.some((cargo) => ["diretor", "direcao", "coordenador", "professor"].includes(cargo))) return false;
          return unidadesDe(pessoa).some((unidade) => meuEscopo.includes(unidade));
        }
        if (cargoAtual === "professor") return true;
        return false;
      });
      setContatos(resultado);
    }).catch(() => setErro("N\u00e3o foi poss\u00edvel carregar a lista de contatos."));
  }, [user?.uid, user?.unidade, user?.unidadesComando, perfilAtivo, podeEnviar]);

  useEffect(() => {
    if (!user?.uid) return undefined;
    return onSnapshot(
      query(collection(db, "direct_chats"), where("participants", "array-contains", user.uid)),
      (snapshot) => setConversas(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0))),
      () => setErro("N\u00e3o foi poss\u00edvel carregar suas conversas.")
    );
  }, [user?.uid]);

  const abrirContato = useCallback(async (contato) => {
    if (!podeEnviar || !contatos.some((item) => item.id === contato?.id) || !user?.uid || !contato?.id || contato.id === user.uid) return;
    const id = idDaConversa(user.uid, contato.id);
    try {
      await setDoc(doc(db, "direct_chats", id), {
        participants: [user.uid, contato.id].sort(),
        names: { [user.uid]: user.nome || user.email || "Voc\u00ea", [contato.id]: contato.nome || contato.email || "Pessoa" },
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setConversaAtiva({ id, otherUid: contato.id, otherName: contato.nome || contato.email || "Pessoa" });
      setErro("");
    } catch (error) {
      console.error("Erro ao abrir conversa direta:", error);
      setErro("N\u00e3o foi poss\u00edvel abrir esta conversa.");
    }
  }, [user?.uid, user?.nome, user?.email, podeEnviar, contatos]);

  useEffect(() => {
    if (initialContact?.id) abrirContato(initialContact);
  }, [initialContact?.id, initialContact?.nome, initialContact?.email, abrirContato]);

  useEffect(() => {
    if (!conversaAtiva?.id) { setMensagens([]); return undefined; }
    return onSnapshot(
      query(collection(db, "direct_chats", conversaAtiva.id, "messages"), orderBy("createdAt", "asc")),
      (snapshot) => setMensagens(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
      () => setErro("N\u00e3o foi poss\u00edvel carregar as mensagens.")
    );
  }, [conversaAtiva?.id]);

  const listaConversas = useMemo(() => conversas.map((conversa) => {
    const otherUid = conversa.participants?.find((uid) => uid !== user?.uid);
    return { ...conversa, otherUid, otherName: conversa.names?.[otherUid] || "Conversa direta" };
  }).filter((conversa) => contatos.some((contato) => contato.id === conversa.otherUid)), [conversas, user?.uid, contatos]);

  async function enviar(event) {
    event.preventDefault();
    const mensagem = texto.trim();
    if (!mensagem || !conversaAtiva || !user?.uid || !contatos.some((contato) => contato.id === conversaAtiva.otherUid)) return;
    setTexto("");
    try {
      const conversaRef = doc(db, "direct_chats", conversaAtiva.id);
      await addDoc(collection(conversaRef, "messages"), { senderUid: user.uid, text: mensagem, createdAt: serverTimestamp() });
      await updateDoc(conversaRef, { lastMessage: mensagem, updatedAt: serverTimestamp() });
    } catch (error) {
      console.error("Erro ao enviar mensagem direta:", error);
      setTexto(mensagem);
      setErro("N\u00e3o foi poss\u00edvel enviar a mensagem.");
    }
  }

  if (!podeEnviar || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/50 p-3" onClick={onClose}>
      <section role="dialog" aria-modal="true" aria-label="Meus directs" onClick={(event) => event.stopPropagation()} className="flex h-[min(720px,90vh)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:flex-row">
        <aside className={`${conversaAtiva ? "hidden sm:flex" : "flex"} w-full shrink-0 flex-col border-r border-gray-100 sm:w-72`}>
          <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="flex items-center gap-2 font-black"><MessageCircle size={18} /> Meus directs</h2>
            <div className="flex items-center gap-1"><button type="button" onClick={() => { setNovoContato((v) => !v); setBuscaContato(""); }} aria-label="Nova mensagem" title="Nova mensagem" className="rounded-full p-2 text-gray-600 hover:bg-amber-50"><Plus size={18} /></button><button type="button" onClick={onClose} aria-label="Fechar directs" className="rounded-full p-2 text-gray-500 hover:bg-gray-100"><X size={18} /></button></div>
          </header>
          {novoContato && <div className="border-b border-gray-100 p-3"><label className="relative block"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input autoFocus value={buscaContato} onChange={(e) => setBuscaContato(e.target.value)} placeholder="Com quem você quer falar?" className="w-full rounded-full bg-gray-100 py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-amber-300"/></label><div className="mt-2 max-h-40 overflow-y-auto">{contatos.filter((p) => normalizar(p.nome || p.email).includes(normalizar(buscaContato))).slice(0, 12).map((p) => <button key={p.id} type="button" onClick={() => { setNovoContato(false); abrirContato(p); }} className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-amber-50"><span className="block font-semibold">{p.nome || p.email || "Pessoa"}</span><span className="text-xs text-gray-500">{cargosDe(p).filter((c) => CARGOS_GESTAO.includes(c)).join(", ")}</span></button>)}{!contatos.length && <p className="p-3 text-center text-xs text-gray-500">Nenhum contato disponível.</p>}</div></div>}
          <div className="flex-1 overflow-y-auto p-2">
            {listaConversas.map((conversa) => (
              <button key={conversa.id} type="button" onClick={() => setConversaAtiva(conversa)} className={`w-full rounded-2xl px-3 py-3 text-left hover:bg-gray-50 ${conversaAtiva?.id === conversa.id ? "bg-amber-50" : ""}`}>
                <span className="block truncate text-sm font-bold">{conversa.otherName}</span>
                <span className="mt-1 block truncate text-xs text-gray-500">{conversa.lastMessage || "Comece a conversa"}</span>
              </button>
            ))}
            {!listaConversas.length && <p className="px-4 py-8 text-center text-sm text-gray-500">Suas conversas diretas aparecerão aqui.</p>}
          </div>
        </aside>
        <div className={`${conversaAtiva ? "flex" : "hidden sm:flex"} min-w-0 flex-1 flex-col`}>
          {conversaAtiva ? (
            <>
              <header className="flex items-center gap-3 border-b border-gray-100 px-4 py-4">
                <button type="button" className="rounded-full p-2 text-gray-500 hover:bg-gray-100 sm:hidden" onClick={() => setConversaAtiva(null)} aria-label="Voltar"><ArrowLeft size={18} /></button>
                <h3 className="min-w-0 flex-1 truncate font-black">{conversaAtiva.otherName}</h3>
                <button type="button" onClick={onClose} aria-label="Fechar directs" className="rounded-full p-2 text-gray-500 hover:bg-gray-100"><X size={18} /></button>
              </header>
              <div className="flex-1 space-y-2 overflow-y-auto bg-gray-50 p-4">
                {mensagens.map((mensagem) => <div key={mensagem.id} className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mensagem.senderUid === user?.uid ? "ml-auto bg-black text-white" : "bg-white text-gray-900 shadow-sm"}`}>{mensagem.text}</div>)}
              </div>
              {erro && <p role="alert" className="px-4 pt-2 text-xs font-semibold text-rose-600">{erro}</p>}
              <form onSubmit={enviar} className="flex gap-2 border-t border-gray-100 p-3">
                <input value={texto} onChange={(event) => setTexto(event.target.value)} maxLength={2000} placeholder="Escreva uma mensagem..." className="min-w-0 flex-1 rounded-full bg-gray-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-300" />
                <button type="submit" disabled={!texto.trim()} aria-label="Enviar mensagem" className="rounded-full bg-pensi-yellow p-3 text-black disabled:opacity-50"><Send size={17} /></button>
              </form>
            </>
          ) : <div className="m-auto p-8 text-center text-sm text-gray-500">Selecione uma conversa para começar.</div>}
        </div>
      </section>
    </div>,
    document.body
  );
}
