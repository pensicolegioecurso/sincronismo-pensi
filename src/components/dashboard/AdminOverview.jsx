// src/components/dashboard/AdminOverview.jsx
import { useState, useEffect, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { getRegionalDaUnidade } from "../../data/unidades";
import { Loader2 } from "lucide-react";
import { parseTurmasPorUnidade, chaveTurma } from "../../utils/turmas";
import OverviewHeader from "./overview/OverviewHeader";
import OverviewFilters from "./overview/OverviewFilters";
import OverviewSummary from "./overview/OverviewSummary";
import OverviewUnits from "./overview/OverviewUnits";

function normalizarTexto(t) {
  return String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function gerarDiasUteis(dataInicio, dataFim) {
  const dias = [];
  let atual = new Date(dataInicio);
  while (atual <= dataFim) {
    const diaSemana = atual.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) {
      const strData = new Date(atual.getTime() - (atual.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
      dias.push(strData);
    }
    atual.setDate(atual.getDate() + 1);
  }
  return dias;
}

export default function AdminOverview({ unidadeFoco, unidadesEscopo }) {
  const [filtroRegional, setFiltroRegional] = useState("Todas");
  const [filtroUnidade, setFiltroUnidade] = useState("Todas");
  const [filtroPeriodo, setFiltroPeriodo] = useState("geral");
  const [mostrarEstatisticas, setMostrarEstatisticas] = useState(false);
  const [cardExpandido, setCardExpandido] = useState(null);
  const [checks, setChecks] = useState([]);
  const [users, setUsers] = useState([]);
  const [calendarios, setCalendarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const isDiretor = Boolean(unidadeFoco);
  const isRegional = Array.isArray(unidadesEscopo) && unidadesEscopo.length > 0;

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      try {
        let snapChecks = { forEach: () => {} };
        let snapUsers = { forEach: () => {} };
        let snapCal = { forEach: () => {} };
        try { snapChecks = await getDocs(collection(db, "checks")); } catch { console.warn("Sem permissão: checks"); }
        try { snapUsers = await getDocs(collection(db, "users")); } catch { console.warn("Sem permissão: users"); }
        try { snapCal = await getDocs(collection(db, "calendarios")); } catch { console.warn("Sem permissão: calendarios"); }
        if (cancelado) return;

        const listaChecks = [];
        snapChecks.forEach((d) => {
          const data = d.data();
          listaChecks.push({
            id: d.id,
            tipo: normalizarTexto(data.tipo) || "aula",
            status: normalizarTexto(data.status),
            unidade: data.unidade || "Sem unidade",
            dataReal: data.dataReal || "",
            professorUid: data.professorUid || "",
            serie: normalizarTexto(data.serie || data.turma),
          });
        });
        setChecks(listaChecks);

        const listaUsers = [];
        snapUsers.forEach((d) => {
          const data = d.data();
          let dtCriacao = new Date(0);
          if (data.criadoEm) {
            dtCriacao = data.criadoEm.toDate ? data.criadoEm.toDate() : new Date(data.criadoEm);
          }
          listaUsers.push({
            uid: d.id,
            nome: data.nome || "",
            unidade: data.unidade || "",
            criadoEm: dtCriacao,
            turmas: data.turmas || "",
            disciplinas: data.disciplinas || [],
            unidadesInativas: data.unidadesInativas || [],
            turmasInativas: data.turmasInativas || [],
          });
        });
        setUsers(listaUsers);

        const listaCal = [];
        snapCal.forEach((d) => listaCal.push(d.data()));
        setCalendarios(listaCal);
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }
    carregar();
    return () => { cancelado = true; };
  }, []);

  const dadosFiltrados = useMemo(() => {
    if (carregando) return { total: { concluidas: 0, pendentes: 0, justificadas: 0 }, porUnidade: [] };

    const agora = new Date(); agora.setHours(0, 0, 0, 0);
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const total = { concluidas: 0, pendentes: 0, justificadas: 0 };
    const porUnidade = [];

    let usersVisiveis = users.filter(u => (u.disciplinas || []).length > 0);
    if (isDiretor) {
      usersVisiveis = usersVisiveis.filter(u => normalizarTexto(u.unidade).includes(normalizarTexto(unidadeFoco)));
    } else if (isRegional) {
      const escopoNorm = unidadesEscopo.map(normalizarTexto);
      usersVisiveis = usersVisiveis.filter(u => escopoNorm.some(esc => normalizarTexto(u.unidade).includes(esc)));
    } else {
      if (filtroRegional !== "Todas") {
        usersVisiveis = usersVisiveis.filter(u => normalizarTexto(u.unidade).split(",").some(uni => getRegionalDaUnidade(uni.trim()) === filtroRegional));
      }
      if (filtroUnidade !== "Todas") {
        usersVisiveis = usersVisiveis.filter(u => normalizarTexto(u.unidade).includes(normalizarTexto(filtroUnidade)));
      }
    }

    const calAtivo = calendarios[0];
    let diasUteisAno = [];
    if (calAtivo && calAtivo.inicio && calAtivo.fim) {
      diasUteisAno = gerarDiasUteis(new Date(calAtivo.inicio + "T12:00:00"), new Date(calAtivo.fim + "T12:00:00"));
    }

    const mapaUnidades = {};

    usersVisiveis.forEach(prof => {
      const mapaTurmasProf = parseTurmasPorUnidade(prof.turmas);
      const inativasU = new Set(prof.unidadesInativas || []);
      const inativasT = new Set(prof.turmasInativas || []);
      const checksDoProf = checks.filter(c => c.professorUid === prof.uid);

      Object.keys(mapaTurmasProf).forEach(uni => {
        if (inativasU.has(uni)) return;
        if (isRegional && !unidadesEscopo.includes(uni)) return;
        const turmasAtivas = mapaTurmasProf[uni].filter(t => !inativasT.has(chaveTurma(uni, t)));
        if (turmasAtivas.length === 0) return;
        const uniNorm = normalizarTexto(uni);

        if (!mapaUnidades[uni]) {
          mapaUnidades[uni] = { nome: uni, regional: getRegionalDaUnidade(uni), c: 0, p: 0, j: 0 };
        }

        const checksUni = checksDoProf.filter(c => normalizarTexto(c.unidade) === uniNorm || uniNorm.includes(normalizarTexto(c.unidade)) || normalizarTexto(c.unidade).includes(uniNorm));
        const turmasUniNorm = turmasAtivas.map(normalizarTexto);

        checksUni.forEach(c => {
          if (!c.dataReal) return;
          const dt = new Date(`${c.dataReal}T12:00:00`);
          if (filtroPeriodo === "hoje" && dt.getTime() !== agora.getTime()) return;
          if (filtroPeriodo === "mes" && dt < inicioMes) return;
          if (c.status === "justificado" || c.tipo === "justificativa") {
            total.justificadas++;
            mapaUnidades[uni].j++;
          } else {
            total.concluidas++;
            mapaUnidades[uni].c++;
          }
        });

        diasUteisAno.forEach(diaStr => {
          const dt = new Date(diaStr + "T12:00:00");
          if (dt < prof.criadoEm || dt > agora) return;
          if (filtroPeriodo === "hoje" && dt.getTime() !== agora.getTime()) return;
          if (filtroPeriodo === "mes" && dt < inicioMes) return;

          let isFeriado = false;
          if (calAtivo?.excecoes) {
            isFeriado = calAtivo.excecoes.some(exc => {
              const fim = exc.dataFim || exc.dataInicio;
              if (diaStr >= exc.dataInicio && diaStr <= fim) {
                if (exc.tipo === "todas") return true;
                if (exc.tipo === "turma" && turmasUniNorm.includes(normalizarTexto(exc.turma))) return true;
              }
              return false;
            });
          }
          if (isFeriado) return;

          turmasUniNorm.forEach(turma => {
            const temCheck = checksUni.some(c => c.dataReal === diaStr && (c.serie.includes(turma) || turma.includes(c.serie)));
            if (!temCheck) {
              total.pendentes++;
              mapaUnidades[uni].p++;
            }
          });
        });
      });
    });

    Object.values(mapaUnidades).forEach(u => {
      if (u.c > 0 || u.p > 0 || u.j > 0) porUnidade.push(u);
    });

    return { total, porUnidade };
  }, [checks, users, calendarios, filtroRegional, filtroUnidade, filtroPeriodo, isDiretor, isRegional, unidadeFoco, unidadesEscopo, carregando]);

  const totalGeral = dadosFiltrados.total.concluidas + dadosFiltrados.total.pendentes + dadosFiltrados.total.justificadas;
  const percentualConcluidas = totalGeral > 0 ? Math.round((dadosFiltrados.total.concluidas / totalGeral) * 100) : 0;
  const temFiltrosAtivos = !isDiretor && !isRegional && (filtroRegional !== "Todas" || filtroUnidade !== "Todas" || filtroPeriodo !== "geral");

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Carregando indicadores...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 pb-10 animate-fade-in">
      <div className="max-w-5xl mx-auto px-1">
        <OverviewHeader isDiretor={isDiretor} isRegional={isRegional} unidadeFoco={unidadeFoco} unidadesEscopo={unidadesEscopo} />
        <OverviewFilters
          isDiretor={isDiretor} isRegional={isRegional}
          unidadeFoco={unidadeFoco} unidadesEscopo={unidadesEscopo}
          filtroRegional={filtroRegional} setFiltroRegional={setFiltroRegional}
          filtroUnidade={filtroUnidade} setFiltroUnidade={setFiltroUnidade}
          filtroPeriodo={filtroPeriodo} setFiltroPeriodo={setFiltroPeriodo}
          temFiltrosAtivos={temFiltrosAtivos}
        />
        <OverviewSummary totalGeral={totalGeral} percentualConcluidas={percentualConcluidas} total={dadosFiltrados.total} />
        {!isDiretor && (
          <OverviewUnits
            mostrarEstatisticas={mostrarEstatisticas}
            setMostrarEstatisticas={setMostrarEstatisticas}
            porUnidade={dadosFiltrados.porUnidade}
            cardExpandido={cardExpandido}
            setCardExpandido={setCardExpandido}
          />
        )}
      </div>
    </div>
  );
}