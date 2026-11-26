import { useMemo } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useReports } from "../../../hooks/useReports";
import { useUnidades } from "../../../hooks/useUnidades";
import { useSegmentos } from "../../../hooks/useSegmentos";
import { obterTurmasAtivas } from "../../../utils/turmasAtivas";

export function useChatContext() {
  const { user } = useAuth();
  const { professores, checks } = useReports();
  const { unidadesDb } = useUnidades();
  const { segmentos } = useSegmentos();

  // Se você já tem hook de calendário, troque essa linha depois
  const calendario = useMemo(() => [], []);

  const turmasAtivas = useMemo(() => obterTurmasAtivas(user), [user]);

  return {
    professores: professores || [],
    checks: checks || [],
    unidades: unidadesDb || [],
    segmentos: segmentos || [],
    calendario,
    turmasAtivas,
    user,
  };
}