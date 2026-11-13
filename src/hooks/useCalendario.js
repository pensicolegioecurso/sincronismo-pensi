import { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

export function useCalendario() {
  const [calendarios, setCalendarios] = useState([]);
  
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "calendarios"), (snap) => {
      const lista = [];
      snap.forEach(d => lista.push({ id: d.id, ...d.data() }));
      setCalendarios(lista);
    });
    return unsub;
  }, []);

  const isDiaLetivo = useCallback((dataObj, turmaNome, serieNome) => {
    if (!dataObj) return true;
    
    const diaSemana = dataObj.getDay();
    if (diaSemana === 0 || diaSemana === 6) return false; 

    const dateStr = dataObj.toISOString().split("T")[0]; 
    const cal = calendarios.find(c => dateStr >= c.inicio && dateStr <= c.fim);
    if (!cal) return true; 

    const excecoes = cal.excecoes || [];
    
    const temExcecao = excecoes.some(exc => {
      const excFim = exc.dataFim || exc.dataInicio;
      if (dateStr < exc.dataInicio || dateStr > excFim) return false;
      
      if (exc.tipo === "todas") return true;
      if (exc.tipo === "serie" && exc.serie === serieNome) return true;
      if (exc.tipo === "turma" && exc.turma === turmaNome) return true;
      
      return false;
    });

    return !temExcecao;
  }, [calendarios]); // Só recria se os calendários mudarem

  return { calendarios, isDiaLetivo };
}