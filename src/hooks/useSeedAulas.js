import { useEffect } from "react";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { AULAS_PORTUGUES } from "../data/aulasPortugues";

export function useSeedAulas() {
  useEffect(() => {
    async function salvarAulas() {
      try {
        const snap = await getDocs(collection(db, "calendario_global"));
        const jaTem = snap.docs.some(d => d.data().disciplina === "portugues");
        
        if (jaTem) return;

        const batch = writeBatch(db);
        const discKey = "portugues";
        const bases = ["6ano", "7ano"]; // Salva para o 6 e 7

        AULAS_PORTUGUES.forEach((diaLetivo) => {
          bases.forEach((base) => {
            diaLetivo.aulas.forEach((numeroAula) => {
              const id = `${discKey}_${base}_${diaLetivo.data}_${diaLetivo.dia}_A${numeroAula}`.replace(/\//g, "_");
              const ref = doc(db, "calendario_global", id);
              
              batch.set(ref, {
                disciplina: discKey,
                base: base,
                data: diaLetivo.data,
                dia: diaLetivo.dia,
                aulaIndex: `A${numeroAula}`
              });
            });
          });
        });

        await batch.commit();
        console.log("✅ Aulas salvas com base 6ano e 7ano!");
      } catch (err) {
        console.error("Erro:", err);
      }
    }

    salvarAulas();
  }, []);
}