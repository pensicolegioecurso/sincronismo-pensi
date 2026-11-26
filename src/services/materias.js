import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { DISCIPLINAS_POR_ANO } from "../utils/disciplinas";
import { removerSincronismo } from "./sincronismos";

export function baseMaterias() {
  const mapa = new Map();
  Object.values(DISCIPLINAS_POR_ANO).forEach((ano) => {
    Object.entries(ano).forEach(([key, materia]) => {
      if (!mapa.has(key)) mapa.set(key, { key, nome: materia.nome });
    });
  });
  return [...mapa.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export function assinarMaterias(onChange, onError) {
  return onSnapshot(collection(db, "materias_db"), (snapshot) => {
    const lista = snapshot.docs.filter((item) => item.id !== "__catalog__").map((item) => ({ key: item.id, ...item.data() })).filter((item) => item.ativa !== false);
    const inicializado = snapshot.docs.some((item) => item.id === "__catalog__");
    onChange(lista.length ? lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")) : inicializado ? [] : baseMaterias());
  }, onError);
}

export async function cadastrarMateria(nome) {
  const nomeLimpo = String(nome || "").trim().replace(/\s+/g, " ");
  if (!nomeLimpo) throw new Error("Informe o nome da matéria.");
  const key = nomeLimpo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  if (!key) throw new Error("O nome da matéria não gerou uma chave válida.");
  const atual = await getDocs(collection(db, "materias_db"));
  if (atual.docs.some((item) => item.id === key || String(item.data().nome).toLocaleLowerCase("pt-BR") === nomeLimpo.toLocaleLowerCase("pt-BR"))) {
    throw new Error("Esta matéria já está cadastrada.");
  }
  await setDoc(doc(db, "materias_db", key), { key, nome: nomeLimpo, ativa: true, criadoEm: serverTimestamp() });
}

export async function removerMateria(materia) {
  const sincronismos = await getDocs(query(collection(db, "sincronismos"), where("materia", "==", materia.key)));
  for (const sincronismo of sincronismos.docs) await removerSincronismo(sincronismo.id);
  await deleteDoc(doc(db, "materias_db", materia.id || materia.key));
}

export async function popularBaseMaterias() {
  const atual = await getDocs(collection(db, "materias_db"));
  if (!atual.empty) return;
  const batch = writeBatch(db);
  baseMaterias().forEach((materia) => {
    batch.set(doc(db, "materias_db", materia.key), { ...materia, ativa: true });
  });
  batch.set(doc(db, "materias_db", "__catalog__"), { inicializado: true });
  await batch.commit();
}
