import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

const MAX_TEXTO_POR_DOCUMENTO = 500_000;
const MAX_OPERACOES_POR_LOTE = 450;

function dividirTexto(texto) {
  const partes = [];
  let parte = "";
  let bytes = 0;
  const encoder = new TextEncoder();

  for (const caractere of texto) {
    const tamanho = encoder.encode(caractere).length;
    if (parte && bytes + tamanho > MAX_TEXTO_POR_DOCUMENTO) {
      partes.push(parte);
      parte = "";
      bytes = 0;
    }
    parte += caractere;
    bytes += tamanho;
  }

  if (parte || partes.length === 0) partes.push(parte);
  return partes;
}

export async function salvarSincronismo(meta, guias) {
  const sincronismoRef = doc(collection(db, "sincronismos"));
  const segmentosAtribuidos = [...new Set(guias.flatMap((guia) => guia.segmentos || (guia.segmento ? [guia.segmento] : [])))];
  await setDoc(sincronismoRef, {
    ...meta,
    segmentos: segmentosAtribuidos,
  });

  let batch = writeBatch(db);
  let operacoes = 0;
  const adicionar = async (referencia, dados) => {
    batch.set(referencia, dados);
    operacoes += 1;
    if (operacoes >= MAX_OPERACOES_POR_LOTE) {
      await batch.commit();
      batch = writeBatch(db);
      operacoes = 0;
    }
  };

  try {
    for (let index = 0; index < guias.length; index += 1) {
      const guia = guias[index];
      const guiaId = `guia-${index}`;
      const texto = JSON.stringify(guia.rows || []);
      const partes = dividirTexto(texto);
      const segmentosDaGuia = [...new Set(guia.segmentos || (guia.segmento ? [guia.segmento] : []))];

      await adicionar(doc(db, "sincronismos", sincronismoRef.id, "guias", guiaId), {
        nome: guia.nome,
        segmento: segmentosDaGuia[0] || "",
        segmentos: segmentosDaGuia,
        ordem: index,
        quantidadePartes: partes.length,
      });

      for (let parteIndex = 0; parteIndex < partes.length; parteIndex += 1) {
        await adicionar(
          doc(db, "sincronismos", sincronismoRef.id, "guias", guiaId, "partes", `parte-${parteIndex}`),
          { ordem: parteIndex, texto: partes[parteIndex] }
        );
      }
    }

    if (operacoes > 0) await batch.commit();
    return sincronismoRef.id;
  } catch (error) {
    if (operacoes > 0) {
      try { await batch.commit(); } catch { /* tenta limpar também os lotes parcialmente gravados */ }
    }
    try { await removerSincronismo(sincronismoRef.id); } catch { /* mantém o erro original */ }
    throw error;
  }
}

export async function carregarLinhasGuia(sincronismoId, guia) {
  if (Array.isArray(guia.rows)) return guia.rows;
  const partesSnap = await getDocs(collection(db, "sincronismos", sincronismoId, "guias", guia.id, "partes"));
  const texto = partesSnap.docs
    .map((parte) => parte.data())
    .sort((a, b) => a.ordem - b.ordem)
    .map((parte) => parte.texto || "")
    .join("");
  return texto ? JSON.parse(texto) : [];
}

export async function removerSincronismo(sincronismoId) {
  let batch = writeBatch(db);
  let operacoes = 0;
  const excluir = async (referencia) => {
    batch.delete(referencia);
    operacoes += 1;
    if (operacoes >= MAX_OPERACOES_POR_LOTE) {
      await batch.commit();
      batch = writeBatch(db);
      operacoes = 0;
    }
  };

  const guiasSnap = await getDocs(collection(db, "sincronismos", sincronismoId, "guias"));
  for (const guiaDoc of guiasSnap.docs) {
    const partesSnap = await getDocs(collection(db, "sincronismos", sincronismoId, "guias", guiaDoc.id, "partes"));
    for (const parteDoc of partesSnap.docs) await excluir(parteDoc.ref);
    await excluir(guiaDoc.ref);
  }
  await excluir(doc(db, "sincronismos", sincronismoId));
  if (operacoes > 0) await batch.commit();
}

export async function obterSincronismosDaMateria(ano, materia) {
  const snapshot = await getDocs(query(collection(db, "sincronismos"), where("materia", "==", materia)));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((item) => item.ativo !== false && String(item.ano) === String(ano));
}

export async function obterGuiasSincronismo(sincronismoId) {
  const snapshot = await getDocs(collection(db, "sincronismos", sincronismoId, "guias"));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => a.ordem - b.ordem);
}

export async function obterGuiasPorSegmento(sincronismoId, segmento) {
  const snapshot = await getDocs(query(
    collection(db, "sincronismos", sincronismoId, "guias"),
    where("segmentos", "array-contains", segmento)
  ));
  const compatibilidadeLegada = snapshot.empty
    ? await getDocs(query(collection(db, "sincronismos", sincronismoId, "guias"), where("segmento", "==", segmento)))
    : snapshot;
  return compatibilidadeLegada.docs
    .sort((a, b) => (a.data().ordem || 0) - (b.data().ordem || 0))
    .map((item) => ({ id: item.id, ...item.data() }));
}
