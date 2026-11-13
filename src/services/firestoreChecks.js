import { doc, setDoc, writeBatch, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

function limpar(s) {
  return String(s || "").trim().toLowerCase();
}

export function gerarIdCheck({ disciplina, serie, semanaIdx, diaNome, aulaIndex }) {
  const d = limpar(disciplina);
  const s = limpar(serie);
  const data = limpar(semanaIdx); 
  const dia = limpar(diaNome);
  const a = limpar(aulaIndex);
  return `${d}_${s}_${data}_${dia}_${a}`;
}

export async function salvarCheck({
  uid, email, disciplina, serie, unidade, turmasParaAplicar, semanaIdx, diaNome, aulaIndex,
  tipo, justificativa, observacao,
}) {
  const batch = writeBatch(db);
  const chavesGeradas = [];

  turmasParaAplicar.forEach((nomeTurma) => {
    const id = gerarIdCheck({ disciplina, serie: nomeTurma, semanaIdx, diaNome, aulaIndex });
    const ref = doc(db, "checks", id);

    const payload = {
      professorUid: uid,
      professorEmail: email,
      disciplina: limpar(disciplina),
      serie: limpar(nomeTurma),
      unidade: unidade || "", // <-- SALVANDO A UNIDADE NO BANCO
      dataReal: limpar(semanaIdx),
      diaNome: limpar(diaNome),
      aulaIndex: limpar(aulaIndex),
      tipo: tipo || "aula", 
      status: tipo === "aula" ? "Concluído" : "Justificado",
      justificativa: justificativa || "",
      observacao: observacao || "",
      dataHora: new Date().toISOString(),
    };

    batch.set(ref, payload);
    chavesGeradas.push(id);
  });

  await batch.commit();
  return chavesGeradas;
}

export function ouvirChecksDoProfessor(uid, callback) {
  const q = query(collection(db, "checks"), where("professorUid", "==", uid));
  return onSnapshot(q, (snap) => {
    const checks = new Set();
    snap.forEach((doc) => {
      checks.add(doc.id);
    });
    callback(checks);
  });
}