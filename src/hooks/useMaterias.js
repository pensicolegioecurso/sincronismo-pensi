import { useEffect, useState } from "react";
import { assinarMaterias, baseMaterias } from "../services/materias";

export function useMaterias() {
  const [materias, setMaterias] = useState(baseMaterias);
  const [carregandoMaterias, setCarregandoMaterias] = useState(true);

  useEffect(() => assinarMaterias((lista) => {
    setMaterias(lista);
    setCarregandoMaterias(false);
  }, (error) => {
    console.error("Erro ao carregar matérias:", error);
    setCarregandoMaterias(false);
  }), []);

  return { materias, carregandoMaterias };
}
