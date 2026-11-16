import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

export function useUnidades() {
  const [unidadesDb, setUnidadesDb] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "unidades_db"), (snap) => {
      const lista = [];
      snap.forEach(d => lista.push({ id: d.id, nome: d.data().nome }));
      lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
      setUnidadesDb(lista);
      setCarregando(false);
    });
    return unsub;
  }, []);

  const todasUnidades = unidadesDb.map(u => u.nome);

  const criarUnidade = async (nome) => {
    if (!nome) return false;
    if (todasUnidades.includes(nome.trim())) return false; // Já existe
    await addDoc(collection(db, "unidades_db"), {
      nome: nome.trim(),
      criadoEm: serverTimestamp()
    });
    return true;
  };

  const excluirUnidade = async (nome) => {
    const unidadeParaExcluir = unidadesDb.find(u => u.nome === nome);
    if (unidadeParaExcluir) {
      await deleteDoc(doc(db, "unidades_db", unidadeParaExcluir.id));
    }
  };

  return { unidadesDb, todasUnidades, carregando, criarUnidade, excluirUnidade };
}