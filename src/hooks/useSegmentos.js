import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

export function useSegmentos() {
  const [segmentos, setSegmentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "segmentos_db"),
      (snap) => {
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
        setSegmentos(lista);
        setCarregando(false);
      },
      (e) => {
        console.error("Erro ao carregar segmentos:", e);
        setErro("Não foi possível carregar os segmentos.");
        setCarregando(false);
      }
    );
    return unsub;
  }, []);

  const criarSegmento = async (nome, unidades = []) => {
    if (!nome || !nome.trim()) throw new Error("Nome inválido");
    const nomeFormatado = nome.trim().replace(/\s+/g, " ");
    
    // Verifica duplicata localmente antes de enviar
    if (segmentos.some((s) => s.nome.toLowerCase() === nomeFormatado.toLowerCase())) {
      throw new Error("Este segmento já está cadastrado.");
    }

    await addDoc(collection(db, "segmentos_db"), {
      nome: nomeFormatado,
      unidades: [...new Set(unidades)].filter(Boolean),
      criadoEm: serverTimestamp(),
    });
  };

  const excluirSegmento = async (id) => {
    await deleteDoc(doc(db, "segmentos_db", id));
  };

  return {
    segmentos,
    carregando,
    erro,
    criarSegmento,
    excluirSegmento,
  };
}
