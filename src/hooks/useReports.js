import { useState, useCallback } from "react";
import { getRelatorio } from "../services/api";
import { normalizarProfessor, normalizarCheck, nomeDisciplina, formatarDataHora } from "../utils/formatters";
import { DISCIPLINAS_POR_ANO } from "../data/disciplinas";

export function useReports() {
  const [professores, setProfessores] = useState([]);
  const [checks, setChecks] = useState([]);
  const [carregado, setCarregado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true); setErro(null);
    try {
      const data = await getRelatorio();
      if (!data || !Array.isArray(data.professores) || !Array.isArray(data.checks)) {
        throw new Error("Resposta inválida do servidor");
      }
      setProfessores(data.professores.map(normalizarProfessor).filter((p) => p.email));
      setChecks(data.checks.map(normalizarCheck).filter((c) => c.professorEmail));
      setCarregado(true);
    } catch (e) {
      setErro(e.message || "Erro ao carregar relatório.");
    } finally { setLoading(false); }
  }, []);

  return { professores, checks, carregado, loading, erro, carregar, nomeDisciplina: (k) => nomeDisciplina(k, DISCIPLINAS_POR_ANO), formatarDataHora };
}