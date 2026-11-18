import { useState, useEffect, useMemo, useRef } from "react";

import {
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  query,
  onSnapshot,
  getDocs,
  where,
} from "firebase/firestore";

import { db } from "../../services/firebase";
import { useTurmas } from "../../hooks/useTurmas";
import { useUnidades } from "../../hooks/useUnidades";

import ConfigHeader from "./config/ConfigHeader";
import UnitsSection from "./config/UnitsSection";
import CalendarsSection from "./config/CalendarsSection";
import RegionalsSection from "./config/RegionalsSection";

import UnitModal from "./config/UnitModal";
import ClassModal from "./config/ClassModal";
import ImportClassesModal from "./config/ImportClassesModal";
import RegionalModal from "./config/RegionalModal";
import CalendarModal from "./config/CalendarModal";
import CalendarExceptionsModal from "./config/CalendarExceptionsModal";

const TURNOS = ["M", "T"];

const SERIES_DISPONIVEIS = [
  "Infantil 2", "Infantil 3", "Infantil 4", "Infantil 5",
  "1º ano", "2º ano", "3º ano", "4º ano", "5º ano",
  "6º ano", "7º ano", "8º ano", "9º ano",
  "1ª série ENEM e Vestibulares", "2ª série ENEM e Vestibulares",
  "3ª série ENEM e Vestibulares", "Pré-ENEM e Vestibulares",
  "1º ano bilíngue", "2º ano bilíngue", "3º ano bilíngue",
  "4º ano bilíngue", "5º Ano Bilíngue", "6º ano bilíngue",
  "7º ano bilíngue", "8º ano bilíngue", "9º ano bilíngue",
  "Infantil 2 bilíngue", "Infantil 3 bilíngue",
  "Infantil 4 bilíngue", "Infantil 5 bilíngue",
  "1ª série medicina", "2ª série medicina", "3ª série Medicina",
  "Medicina", "9º ano preparatório militar",
  "1ª série preparatória militar", "2ª série preparatória militar",
  "3ª série IME/ITA", "IME/ITA", "Preparatório CN",
  "3ª série AFA/EN/EFOMM", "AFA/EN/EFOMM",
  "Curso Pré IME/ITA 1", "Curso Pré IME/ITA 2",
].sort((a, b) => a.localeCompare(b, "pt-BR"));

const inputClass =
  "w-full rounded-xl border-2 border-black bg-white px-3 py-2.5 text-sm font-semibold outline-none transition focus:bg-yellow-50";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border-2 border-black px-4 py-2.5 text-xs font-black uppercase shadow-[3px_3px_0_#000] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50";

function normalizarNome(nome) {
  const valor = nome.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
  return valor.charAt(0).toLocaleUpperCase("pt-BR") + valor.slice(1);
}

function normalizarCargos(perfil) {
  if (!perfil) return [];
  const cargos = new Set();
  if (Array.isArray(perfil.cargos)) {
    perfil.cargos.forEach((c) => c && cargos.add(String(c).toLowerCase()));
  }
  if (typeof perfil.cargo === "string") {
    cargos.add(perfil.cargo.toLowerCase());
  }
  return Array.from(cargos);
}

function normalizarUnidadesComando(perfil) {
  if (!perfil) return [];
  const lista = perfil.unidadesComando;
  if (Array.isArray(lista)) {
    return lista
      .flatMap((item) => (typeof item === "string" ? item.split(",") : []))
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof lista === "string") {
    return lista.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function obterUnidadePerfil(perfil) {
  if (!perfil) return "";
  if (typeof perfil.unidade === "string" && perfil.unidade.trim()) {
    return perfil.unidade.trim().split(",")[0].trim();
  }
  if (Array.isArray(perfil.unidade) && perfil.unidade.length) {
    return String(perfil.unidade[0]).trim();
  }
  return "";
}

function pertenceAoEscopo(unidade, escopo) {
  if (!unidade) return false;
  if (!Array.isArray(escopo) || !escopo.length) return true;
  const alvo = String(unidade).toLocaleLowerCase("pt-BR");
  return escopo.some(
    (item) => String(item).toLocaleLowerCase("pt-BR") === alvo
  );
}

function unidadeDaExcecao(excecao) {
  if (!excecao) return null;
  const valor = excecao.unidade;
  if (valor === null || valor === undefined || valor === "") return null;
  return String(valor);
}

function excecaoContaParaUnidade(excecao, unidade) {
  const unidadeExcecao = unidadeDaExcecao(excecao);
  if (unidadeExcecao === null) return true;
  if (!unidade) return false;
  return unidadeExcecao === String(unidade);
}

function calcularDiasLetivos(cal, unidade) {
  if (!cal.inicio || !cal.fim) return 0;

  const inicio = new Date(`${cal.inicio}T12:00:00`);
  const fim = new Date(`${cal.fim}T12:00:00`);
  const datasExcluidas = new Set();

  const excecoes = cal.excecoes || [];
  const excecoesUnidade = unidade
    ? excecoes.filter((item) => excecaoContaParaUnidade(item, unidade))
    : excecoes;

  excecoesUnidade.forEach((item) => {
    const inicioExcecao = new Date(`${item.dataInicio}T12:00:00`);
    const fimExcecao = new Date(`${item.dataFim || item.dataInicio}T12:00:00`);

    for (
      let data = new Date(inicioExcecao);
      data <= fimExcecao;
      data.setDate(data.getDate() + 1)
    ) {
      if (data.getDay() !== 0 && data.getDay() !== 6) {
        datasExcluidas.add(data.toISOString().split("T")[0]);
      }
    }
  });

  let diasUteis = 0;

  for (let data = new Date(inicio); data <= fim; data.setDate(data.getDate() + 1)) {
    if (data.getDay() === 0 || data.getDay() === 6) continue;
    if (datasExcluidas.has(data.toISOString().split("T")[0])) continue;
    diasUteis++;
  }

  return Math.max(0, diasUteis);
}

export default function TurmasAdmin({
  perfilAtivo,
  unidadeFoco,
  unidadesEscopo,
}) {
  const { todas: turmas = [], carregando: carregandoTurmas } = useTurmas();

  const {
    todasUnidades = [],
    criarUnidade,
    excluirUnidade,
  } = useUnidades();

  const cargos = useMemo(() => normalizarCargos(perfilAtivo), [perfilAtivo]);

  const temPerfil = cargos.length > 0;

  const ehAdmin = cargos.includes("admin") || cargos.includes("administrador");
  const ehNucleo = cargos.includes("nucleo");
  const ehRegional = cargos.includes("regional");
  const ehDirecao =
    cargos.includes("diretor") ||
    cargos.includes("direcao") ||
    cargos.includes("coordenador");

  const podeGerenciar = temPerfil
    ? ehAdmin || ehNucleo || ehRegional || ehDirecao
    : true;

  const podeVerRegionais = temPerfil ? ehAdmin || ehNucleo : true;

  const unidadesComando = useMemo(
    () => normalizarUnidadesComando(perfilAtivo),
    [perfilAtivo]
  );

  const unidadePerfil = useMemo(
    () => obterUnidadePerfil(perfilAtivo),
    [perfilAtivo]
  );

  const escopoUnidades = useMemo(() => {
    if (!temPerfil) return todasUnidades;
    if (ehAdmin || ehNucleo) return todasUnidades;
    if (ehRegional) {
      const base = unidadesComando.length ? unidadesComando : [];
      if (!base.length) return todasUnidades;
      return todasUnidades.filter((u) => pertenceAoEscopo(u, base));
    }
    if (ehDirecao) {
      if (!unidadePerfil) return todasUnidades;
      return todasUnidades.filter((u) => pertenceAoEscopo(u, [unidadePerfil]));
    }
    return todasUnidades;
  }, [todasUnidades, temPerfil, ehAdmin, ehNucleo, ehRegional, ehDirecao, unidadesComando, unidadePerfil]);

  const unidadesPermitidas = escopoUnidades;

  const [secaoUnidadesVisivel, setSecaoUnidadesVisivel] = useState(true);
  const [unidadesAbertas, setUnidadesAbertas] = useState({});
  const [busca, setBusca] = useState("");
  const [filtroUnidade, setFiltroUnidade] = useState("Todas");

  const [modalUnidade, setModalUnidade] = useState(false);
  const [modalTurma, setModalTurma] = useState(false);
  const [modalImportar, setModalImportar] = useState(false);
  const [modalRegional, setModalRegional] = useState(null);
  const [modalNovoCal, setModalNovoCal] = useState(false);
  const [modalExcecao, setModalExcecao] = useState(null);

  const [novaUnidadeNome, setNovaUnidadeNome] = useState("");

  const [novaTurma, setNovaTurma] = useState({
    unidade: "",
    serie: "",
    turno: "M",
    turma: "",
  });

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const fileInputRef = useRef(null);
  const [csvData, setCsvData] = useState([]);
  const [csvErros, setCsvErros] = useState([]);

  const [calendarios, setCalendarios] = useState([]);
  const [carregandoCal, setCarregandoCal] = useState(true);
  const [unidadeCalendario, setUnidadeCalendario] = useState(
    ehDirecao && unidadePerfil ? unidadePerfil : "Todas"
  );

  useEffect(() => {
    if (ehDirecao && unidadePerfil) {
      setUnidadeCalendario(unidadePerfil);
      return;
    }
    if (
      unidadeCalendario !== "Todas" &&
      !unidadesPermitidas.some(
        (u) =>
          String(u).toLocaleLowerCase("pt-BR") ===
          String(unidadeCalendario).toLocaleLowerCase("pt-BR")
      )
    ) {
      setUnidadeCalendario(
        ehRegional ? (unidadesPermitidas[0] || "Todas") : "Todas"
      );
    }
  }, [ehDirecao, ehRegional, unidadePerfil, unidadesPermitidas, unidadeCalendario]);

  const [novoCal, setNovoCal] = useState({
    nome: "",
    inicio: "",
    fim: "",
  });

  const [excecao, setExcecao] = useState({
    dataInicio: "",
    dataFim: "",
    motivo: "",
    tipo: "todas",
    serie: "",
    turma: "",
  });

  const [regionais, setRegionais] = useState([]);
  const [carregandoReg, setCarregandoReg] = useState(false);
  const [unidadesTemp, setUnidadesTemp] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "calendarios"),
      (snapshot) => {
        const lista = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        lista.sort(
          (a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime()
        );

        setCalendarios(lista);
        setCarregandoCal(false);
      },
      (error) => {
        console.error("Erro ao carregar calendários:", error);
        setCarregandoCal(false);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!podeVerRegionais) return;

    async function carregarRegionais() {
      setCarregandoReg(true);

      try {
        const resultado = await getDocs(
          query(
            collection(db, "users"),
            where("cargos", "array-contains", "regional")
          )
        );

        setRegionais(
          resultado.docs.map((item) => {
            const data = item.data();

            return {
              id: item.id,
              nome: data.nome || "Sem nome",
              email: data.email || "",
              unidadesComando: data.unidadesComando || [],
            };
          })
        );
      } catch (error) {
        console.error("Erro ao carregar regionais:", error);
      } finally {
        setCarregandoReg(false);
      }
    }

    carregarRegionais();
  }, [podeVerRegionais]);

  const turmasPermitidas = useMemo(() => {
    if (!temPerfil) return turmas;
    if (ehAdmin || ehNucleo) return turmas;
    return turmas.filter((item) => pertenceAoEscopo(item.unidade, unidadesPermitidas));
  }, [turmas, temPerfil, ehAdmin, ehNucleo, unidadesPermitidas]);

  const turmasFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    return turmasPermitidas.filter((item) => {
      if (filtroUnidade !== "Todas" && item.unidade !== filtroUnidade) {
        return false;
      }

      if (termo) {
        const conteudo = [item.turma, item.serie, item.unidade, item.turno]
          .join(" ")
          .toLocaleLowerCase("pt-BR");

        if (!conteudo.includes(termo)) return false;
      }

      return true;
    });
  }, [turmasPermitidas, busca, filtroUnidade]);

  const totalTurmas = turmasFiltradas.length;

  const abrirNovaTurma = (unidade = "") => {
    setErro("");

    setNovaTurma({
      unidade: unidade || unidadesPermitidas[0] || "",
      serie: "",
      turno: "M",
      turma: "",
    });

    setModalTurma(true);
  };

  const abrirModalUnidade = () => {
    setErro("");
    setNovaUnidadeNome("");
    setModalUnidade(true);
  };

  const abrirNovoCalendario = () => {
    setErro("");
    setModalNovoCal(true);
  };

  const abrirExcecoes = (cal) => {
    setErro("");
    setModalExcecao(cal);
  };

  const abrirModalRegional = (regional) => {
    setModalRegional(regional);
    setUnidadesTemp([...(regional.unidadesComando || [])]);
  };

  const adicionarUnidade = async (event) => {
    event.preventDefault();
    setErro("");
    setSucesso("");

    const nome = normalizarNome(novaUnidadeNome);

    if (!nome) {
      setErro("Informe o nome da unidade.");
      return;
    }

    if (
      todasUnidades.some(
        (item) => item.toLocaleLowerCase("pt-BR") === nome.toLocaleLowerCase("pt-BR")
      )
    ) {
      setErro("Essa unidade já está cadastrada.");
      return;
    }

    setSalvando(true);

    try {
      const resultado = await criarUnidade(nome);

      if (!resultado) {
        setErro("Não foi possível cadastrar a unidade.");
        return;
      }

      setNovaUnidadeNome("");
      setModalUnidade(false);
      setSucesso("Unidade cadastrada com sucesso.");
      setTimeout(() => setSucesso(""), 3000);
    } catch (error) {
      console.error(error);
      setErro("Erro ao cadastrar unidade.");
    } finally {
      setSalvando(false);
    }
  };

  const adicionarTurma = async (event) => {
    event.preventDefault();
    setErro("");
    setSucesso("");

    const nomeTurma = novaTurma.turma.trim();

    if (!novaTurma.unidade || !novaTurma.serie || !novaTurma.turno || !nomeTurma) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (!pertenceAoEscopo(novaTurma.unidade, unidadesPermitidas)) {
      setErro("Você não tem permissão para cadastrar turmas nessa unidade.");
      return;
    }

    const duplicada = turmas.some(
      (item) =>
        item.unidade === novaTurma.unidade &&
        item.turma?.trim().toLocaleLowerCase("pt-BR") ===
          nomeTurma.toLocaleLowerCase("pt-BR")
    );

    if (duplicada) {
      setErro("Já existe uma turma com esse nome nessa unidade.");
      return;
    }

    setSalvando(true);

    try {
      await addDoc(collection(db, "turmas_escolares"), {
        unidade: novaTurma.unidade,
        serie: novaTurma.serie,
        turno: novaTurma.turno,
        turma: nomeTurma,
        ativo: true,
        criadoEm: serverTimestamp(),
      });

      setModalTurma(false);
      setSucesso("Turma cadastrada com sucesso.");
      setTimeout(() => setSucesso(""), 3000);
    } catch (error) {
      console.error(error);
      setErro("Erro ao cadastrar turma.");
    } finally {
      setSalvando(false);
    }
  };

  const excluirTurma = async (turma) => {
    if (!pertenceAoEscopo(turma.unidade, unidadesPermitidas)) {
      setErro("Você não tem permissão para excluir turmas dessa unidade.");
      return;
    }

    if (!window.confirm(`Excluir a turma "${turma.turma}"?`)) return;

    try {
      await deleteDoc(doc(db, "turmas_escolares", turma.id));
    } catch (error) {
      console.error(error);
      setErro("Não foi possível excluir a turma.");
    }
  };

  const excluirUnidadeCompleta = async (nomeUnidade) => {
    const turmasDaUnidade = turmas.filter((item) => item.unidade === nomeUnidade);

    const mensagem =
      `Deseja excluir a unidade "${nomeUnidade}"?` +
      (turmasDaUnidade.length
        ? `\n\n${turmasDaUnidade.length} turma(s) também serão excluídas.`
        : "");

    if (!window.confirm(mensagem)) return;

    setSalvando(true);

    try {
      const batch = writeBatch(db);

      turmasDaUnidade.forEach((item) => {
        batch.delete(doc(db, "turmas_escolares", item.id));
      });

      await batch.commit();
      await excluirUnidade(nomeUnidade);

      setSucesso("Unidade excluída.");
      setTimeout(() => setSucesso(""), 3000);
    } catch (error) {
      console.error(error);
      setErro("Erro ao excluir unidade.");
    } finally {
      setSalvando(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (loadEvent) => {
      const linhas = loadEvent.target.result
        .split(/\r?\n/)
        .map((linha) => linha.trim())
        .filter(Boolean);

      const dados = [];
      const erros = [];

      linhas.forEach((linha, index) => {
        if (index === 0 && linha.toLowerCase().includes("unidade")) return;

        const partes = linha.split(",").map((parte) => parte.trim());

        if (partes.length < 4) {
          erros.push(`Linha ${index + 1}: faltam colunas.`);
          return;
        }

        const [unidade, serie, turno, turma] = partes;

        if (!unidade || !serie || !turno || !turma) {
          erros.push(`Linha ${index + 1}: preencha todas as colunas.`);
          return;
        }

        if (!TURNOS.includes(turno.toUpperCase())) {
          erros.push(`Linha ${index + 1}: o turno deve ser M ou T.`);
          return;
        }

        dados.push({
          unidade: normalizarNome(unidade),
          serie,
          turno: turno.toUpperCase(),
          turma,
        });
      });

      setCsvData(dados);
      setCsvErros(erros);
    };

    reader.readAsText(file, "UTF-8");
    event.target.value = "";
  };

  const confirmarImportacao = async () => {
    if (!csvData.length || csvErros.length) return;

    setSalvando(true);

    try {
      const batch = writeBatch(db);

      const unidadesExistentes = new Set(
        todasUnidades.map((item) => item.toLocaleLowerCase("pt-BR"))
      );

      const unidadesNovas = new Set();

      csvData.forEach((item) => {
        const chave = item.unidade.toLocaleLowerCase("pt-BR");

        if (!unidadesExistentes.has(chave)) {
          unidadesNovas.add(item.unidade);
          unidadesExistentes.add(chave);
        }
      });

      unidadesNovas.forEach((nome) => {
        batch.set(doc(collection(db, "unidades_db")), {
          nome,
          criadoEm: serverTimestamp(),
        });
      });

      csvData.forEach((item) => {
        batch.set(doc(collection(db, "turmas_escolares")), {
          ...item,
          ativo: true,
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp(),
        });
      });

      await batch.commit();

      setModalImportar(false);
      setCsvData([]);
      setCsvErros([]);
      setSucesso("Importação concluída.");
      setTimeout(() => setSucesso(""), 3000);
    } catch (error) {
      console.error(error);
      setErro("Erro ao importar os dados.");
    } finally {
      setSalvando(false);
    }
  };

  const criarCalendario = async (event) => {
    event.preventDefault();
    setErro("");

    if (!novoCal.nome.trim() || !novoCal.inicio || !novoCal.fim) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (novoCal.fim < novoCal.inicio) {
      setErro("A data final deve ser posterior à inicial.");
      return;
    }

    setSalvando(true);

    try {
      await addDoc(collection(db, "calendarios"), {
        nome: novoCal.nome.trim(),
        inicio: novoCal.inicio,
        fim: novoCal.fim,
        excecoes: [],
        criadoEm: serverTimestamp(),
      });

      setNovoCal({ nome: "", inicio: "", fim: "" });
      setModalNovoCal(false);
    } catch (error) {
      console.error(error);
      setErro("Erro ao criar calendário.");
    } finally {
      setSalvando(false);
    }
  };

  const adicionarExcecao = async (event) => {
    event.preventDefault();
    setErro("");

    if (!excecao.dataInicio) {
      setErro("Informe a data inicial.");
      return;
    }

    const fim = excecao.dataFim || excecao.dataInicio;

    if (fim < excecao.dataInicio) {
      setErro("A data final é inválida.");
      return;
    }

    if (excecao.tipo === "serie" && !excecao.serie) {
      setErro("Selecione uma série.");
      return;
    }

    if (excecao.tipo === "turma" && !excecao.turma) {
      setErro("Selecione uma turma.");
      return;
    }

    const unidadeExcecao =
      unidadeCalendario === "Todas" ? null : unidadeCalendario;

    if (unidadeExcecao && !pertenceAoEscopo(unidadeExcecao, unidadesPermitidas)) {
      setErro("Você não tem permissão para adicionar exceções nessa unidade.");
      return;
    }

    if (ehRegional && !unidadeExcecao) {
      setErro("Selecione uma unidade específica para adicionar a exceção.");
      return;
    }

    if (ehDirecao && (!unidadeExcecao || unidadeExcecao !== unidadePerfil)) {
      setErro("Você só pode adicionar exceções na sua unidade.");
      return;
    }

    setSalvando(true);

    try {
      const novaExcecao = {
        id: crypto.randomUUID(),
        dataInicio: excecao.dataInicio,
        dataFim: fim,
        motivo: excecao.motivo.trim() || "Sem motivo",
        tipo: excecao.tipo,
        serie: excecao.tipo === "serie" ? excecao.serie : null,
        turma: excecao.tipo === "turma" ? excecao.turma : null,
        unidade: unidadeExcecao,
      };

      const novasExcecoes = [...(modalExcecao.excecoes || []), novaExcecao];

      await updateDoc(doc(db, "calendarios", modalExcecao.id), {
        excecoes: novasExcecoes,
      });

      setModalExcecao((atual) => ({ ...atual, excecoes: novasExcecoes }));

      setExcecao({
        dataInicio: "",
        dataFim: "",
        motivo: "",
        tipo: "todas",
        serie: "",
        turma: "",
      });
    } catch (error) {
      console.error(error);
      setErro("Erro ao adicionar exceção.");
    } finally {
      setSalvando(false);
    }
  };

  const removerExcecao = async (id) => {
    if (!window.confirm("Remover esta exceção?")) return;

    try {
      const novasExcecoes = (modalExcecao.excecoes || []).filter(
        (item) => item.id !== id
      );

      await updateDoc(doc(db, "calendarios", modalExcecao.id), {
        excecoes: novasExcecoes,
      });

      setModalExcecao((atual) => ({ ...atual, excecoes: novasExcecoes }));
    } catch (error) {
      console.error(error);
      setErro("Erro ao remover exceção.");
    }
  };

  const salvarUnidadesRegional = async () => {
    if (!modalRegional) return;

    setSalvando(true);

    try {
      await updateDoc(doc(db, "users", modalRegional.id), {
        unidadesComando: unidadesTemp,
      });

      setRegionais((atuais) =>
        atuais.map((item) =>
          item.id === modalRegional.id
            ? { ...item, unidadesComando: unidadesTemp }
            : item
        )
      );

      setModalRegional(null);
    } catch (error) {
      console.error(error);
      setErro("Erro ao salvar as unidades do regional.");
    } finally {
      setSalvando(false);
    }
  };

  const excecoesDaUnidade = modalExcecao
    ? (modalExcecao.excecoes || []).filter((item) => {
        const unidadeExcecao = unidadeDaExcecao(item);
        if (unidadeCalendario === "Todas") return unidadeExcecao === null;
        return unidadeExcecao === String(unidadeCalendario);
      })
    : [];

  const excluirCalendario = (cal) => {
    if (window.confirm("Excluir este calendário?")) {
      deleteDoc(doc(db, "calendarios", cal.id));
    }
  };

  const fecharModalUnidade = () => {
    setModalUnidade(false);
    setErro("");
  };

  const fecharModalTurma = () => {
    setModalTurma(false);
    setErro("");
  };

  const fecharModalImportacao = () => {
    setModalImportar(false);
    setCsvData([]);
    setCsvErros([]);
    setErro("");
  };

  const fecharModalCalendario = () => {
    setModalNovoCal(false);
    setErro("");
  };

  const fecharModalExcecao = () => {
    setModalExcecao(null);
    setErro("");
  };

  if (carregandoTurmas) {
    return (
      <div className="p-10 text-center text-sm font-bold">
        Carregando configurações...
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-8 pb-10">

      <ConfigHeader
        buttonClass={buttonClass}
        podeGerenciar={podeGerenciar}
        ehDirecao={ehDirecao}
        abrirNovaTurma={() => abrirNovaTurma()}
        abrirNovaUnidade={abrirModalUnidade}
      />

      {erro && !modalUnidade && !modalTurma && !modalNovoCal && !modalExcecao && (
        <div className="flex items-center gap-2 rounded-xl border-2 border-red-400 bg-red-50 p-3 text-sm font-bold text-red-700">
          <AlertCircle size={17} />
          {erro}
          <button onClick={() => setErro("")} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {sucesso && (
        <div className="flex items-center gap-2 rounded-xl border-2 border-green-500 bg-green-50 p-3 text-sm font-bold text-green-800">
          <CheckCircle2 size={17} />
          {sucesso}
          <button onClick={() => setSucesso("")} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      <UnitsSection
        unidadesPermitidas={unidadesPermitidas}
        turmasFiltradas={turmasFiltradas}
        totalTurmas={totalTurmas}
        busca={busca}
        setBusca={setBusca}
        filtroUnidade={filtroUnidade}
        setFiltroUnidade={setFiltroUnidade}
        ehRegional={ehRegional}
        ehDirecao={ehDirecao}
        podeGerenciar={podeGerenciar}
        secaoUnidadesVisivel={secaoUnidadesVisivel}
        setSecaoUnidadesVisivel={setSecaoUnidadesVisivel}
        unidadesAbertas={unidadesAbertas}
        setUnidadesAbertas={setUnidadesAbertas}
        excluirTurma={excluirTurma}
        abrirImportacao={() => setModalImportar(true)}
        inputClass={inputClass}
        buttonClass={buttonClass}
      />

      <CalendarsSection
        podeGerenciar={podeGerenciar}
        podeCriarCalendario={podeGerenciar}
        podeExcluirCalendario={podeGerenciar}
        ehDirecao={ehDirecao}
        ehRegional={ehRegional}
        unidadeAtivaPerfil={unidadePerfil}
        buttonClass={buttonClass}
        unidadeCalendario={unidadeCalendario}
        setUnidadeCalendario={setUnidadeCalendario}
        unidadesPermitidas={unidadesPermitidas}
        carregandoCal={carregandoCal}
        calendarios={calendarios}
        calcularDiasLetivos={calcularDiasLetivos}
        abrirNovoCalendario={abrirNovoCalendario}
        abrirExcecoes={abrirExcecoes}
        excluirCalendario={excluirCalendario}
      />

      {podeVerRegionais && (
        <RegionalsSection
          carregandoReg={carregandoReg}
          regionais={regionais}
          abrirModalRegional={abrirModalRegional}
          buttonClass={buttonClass}
        />
      )}

      {modalUnidade && (
        <UnitModal
          onClose={fecharModalUnidade}
          adicionarUnidade={adicionarUnidade}
          erro={erro}
          novaUnidadeNome={novaUnidadeNome}
          setNovaUnidadeNome={setNovaUnidadeNome}
          inputClass={inputClass}
          buttonClass={buttonClass}
          salvando={salvando}
        />
      )}

      {modalTurma && (
        <ClassModal
          onClose={fecharModalTurma}
          adicionarTurma={adicionarTurma}
          erro={erro}
          novaTurma={novaTurma}
          setNovaTurma={setNovaTurma}
          unidadesPermitidas={unidadesPermitidas}
          SERIES_DISPONIVEIS={SERIES_DISPONIVEIS}
          TURNOS={TURNOS}
          inputClass={inputClass}
          buttonClass={buttonClass}
          salvando={salvando}
        />
      )}

      {modalImportar && (
        <ImportClassesModal
          onClose={fecharModalImportacao}
          fileInputRef={fileInputRef}
          handleFileUpload={handleFileUpload}
          csvErros={csvErros}
          csvData={csvData}
          confirmarImportacao={confirmarImportacao}
          salvando={salvando}
          buttonClass={buttonClass}
        />
      )}

      {modalRegional && (
        <RegionalModal
          regional={modalRegional}
          onClose={() => setModalRegional(null)}
          todasUnidades={todasUnidades}
          unidadesTemp={unidadesTemp}
          setUnidadesTemp={setUnidadesTemp}
          salvarUnidadesRegional={salvarUnidadesRegional}
          salvando={salvando}
          buttonClass={buttonClass}
        />
      )}

      {modalNovoCal && (
        <CalendarModal
          onClose={fecharModalCalendario}
          criarCalendario={criarCalendario}
          novoCal={novoCal}
          setNovoCal={setNovoCal}
          erro={erro}
          inputClass={inputClass}
          buttonClass={buttonClass}
          salvando={salvando}
        />
      )}

      {modalExcecao && (
        <CalendarExceptionsModal
          calendario={modalExcecao}
          onClose={fecharModalExcecao}
          adicionarExcecao={adicionarExcecao}
          excecao={excecao}
          setExcecao={setExcecao}
          unidadeCalendario={unidadeCalendario}
          SERIES_DISPONIVEIS={SERIES_DISPONIVEIS}
          turmas={turmasPermitidas}
          inputClass={inputClass}
          buttonClass={buttonClass}
          salvando={salvando}
          erro={erro}
          excecoesDaUnidade={excecoesDaUnidade}
          removerExcecao={removerExcecao}
          podeGerenciar={podeGerenciar}
          podeAdicionarGeral={true}
          ehDirecao={ehDirecao}
          ehRegional={ehRegional}
        />
      )}

    </div>
  );
}