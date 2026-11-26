import { useState, useEffect, useMemo, useRef } from "react";
import {
  X, ChevronLeft, ChevronRight, Search, Trash2, Upload, CheckCircle2,
  UserPlus, UserMinus, GraduationCap, Building2, CalendarPlus, CalendarX,
  UserCheck, FileSpreadsheet, Layers, PlusCircle, Settings
} from "lucide-react";

import {
  collection, addDoc, doc, getDoc, updateDoc, deleteDoc, serverTimestamp,
  writeBatch, query, onSnapshot, getDocs, where,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../services/firebase";
import { useTurmas } from "../../hooks/useTurmas";
import { useUnidades } from "../../hooks/useUnidades";
import { useSegmentos } from "../../hooks/useSegmentos";

import CadastrarUsuario from "./users/CadastrarUsuario";

const TURNOS = ["M", "T"];

const SERIES_FALLBACK = [
  "Infantil 2", "Infantil 3", "Infantil 4", "Infantil 5",
  "1º ano", "2º ano", "3º ano", "4º ano", "5º ano",
  "6º ano", "7º ano", "8º ano", "9º ano",
  "1ª série ENEM e Vestibulares", "2ª série ENEM e Vestibulares",
  "3ª série ENEM e Vestibulares", "Pré-ENEM e Vestibulares",
];

const field =
  "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] outline-none focus:border-black transition-colors";
const btnPrimary =
  "w-full rounded-full bg-black py-4 font-semibold text-white disabled:opacity-30 transition-all active:scale-[0.98]";

/* ---------- helpers ---------- */

function normalizarNome(nome) {
  const v = nome.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
  return v.charAt(0).toLocaleUpperCase("pt-BR") + v.slice(1);
}

function normalizarCargos(perfil) {
  if (!perfil) return [];
  const s = new Set();
  if (Array.isArray(perfil.cargos)) perfil.cargos.forEach((c) => c && s.add(String(c).toLowerCase()));
  if (typeof perfil.cargo === "string") s.add(perfil.cargo.toLowerCase());
  return Array.from(s);
}

function normalizarUnidadesComando(perfil) {
  if (!perfil) return [];
  const l = perfil.unidadesComando;
  if (Array.isArray(l)) {
    return l
      .flatMap((i) => (typeof i === "string" ? i.split(",") : []))
      .map((i) => i.trim())
      .filter(Boolean);
  }
  if (typeof l === "string") return l.split(",").map((i) => i.trim()).filter(Boolean);
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
  if (!Array.isArray(escopo) || !escopo.length) return false;
  const alvo = String(unidade).toLocaleLowerCase("pt-BR");
  return escopo.some((i) => String(i).toLocaleLowerCase("pt-BR") === alvo);
}

function unidadeDaExcecao(e) {
  const v = e?.unidade;
  if (v === null || v === undefined || v === "") return null;
  return String(v);
}

function unidadesDoUsuario(u) {
  const v = u?.unidade;
  const lista = Array.isArray(v) ? v : typeof v === "string" ? v.split(",") : [];
  return lista.map((i) => String(i).trim()).filter(Boolean);
}

const fmt = (iso) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR") : "—";

/* ---------- componentes visuais ---------- */

function Label({ children }) {
  return <p className="mb-2 mt-4 text-sm font-semibold text-gray-600">{children}</p>;
}

function Chip({ ativo, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        ativo ? "bg-black text-white" : "bg-[#f2f2f2] text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

function ItemLista({ titulo, subtitulo, onClick, excluir, desabilitado }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#f2f2f2] px-4 py-3">
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className="min-w-0 flex-1 text-left"
      >
        <span className="block truncate font-semibold">{titulo}</span>
        {subtitulo && <span className="block truncate text-sm text-gray-500">{subtitulo}</span>}
      </button>
      {excluir && (
        <button
          type="button"
          onClick={excluir}
          disabled={desabilitado}
          title="Excluir"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-rose-600 disabled:opacity-30 hover:bg-rose-50 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}

function Vazio({ children }) {
  return <p className="py-8 text-center text-sm text-gray-400">{children}</p>;
}

/* ---------- componente principal ---------- */

export default function MaisModal({
  onClose, perfilAtivo: _perfilDoPai, unidadesEscopo, onProfileOpen, onUsuarioCadastrado,
}) {
  const { todas: turmas = [] } = useTurmas();
  const { todasUnidades = [], criarUnidade, excluirUnidade } = useUnidades();
  const { segmentos, criarSegmento, excluirSegmento } = useSegmentos();

  const [perfilAtivo, setPerfilAtivo] = useState(null);
  const [perfilCarregando, setPerfilCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        if (ativo) {
          setPerfilAtivo(null);
          setPerfilCarregando(false);
        }
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (ativo) setPerfilAtivo(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      } catch (e) {
        console.error("Erro ao carregar perfil:", e);
        if (ativo) setPerfilAtivo(null);
      } finally {
        if (ativo) setPerfilCarregando(false);
      }
    });
    return () => {
      ativo = false;
      unsub();
    };
  }, []);

  const cargos = useMemo(() => normalizarCargos(perfilAtivo), [perfilAtivo]);
  const ehAdmin = cargos.includes("admin") || cargos.includes("administrador");
  const ehNucleo = cargos.includes("nucleo");
  const ehRegional = cargos.includes("regional");
  const ehDirecao =
    cargos.includes("diretor") || cargos.includes("direcao") || cargos.includes("coordenador");

  const adminNucleo = ehAdmin || ehNucleo;
  const gerente = adminNucleo || ehRegional || ehDirecao;
  const podeTurma = adminNucleo || ehRegional;

  const unidadesComando = useMemo(() => normalizarUnidadesComando(perfilAtivo), [perfilAtivo]);
  const unidadesDireção = useMemo(() => unidadesDoUsuario(perfilAtivo), [perfilAtivo]);
  const unidadePerfil = useMemo(() => obterUnidadePerfil(perfilAtivo), [perfilAtivo]);

  const unidadesPermitidas = useMemo(() => {
    if (adminNucleo) return todasUnidades;
    if (ehRegional) {
      return todasUnidades.filter((u) => pertenceAoEscopo(u, unidadesComando));
    }
    if (ehDirecao) {
      return todasUnidades.filter((u) => pertenceAoEscopo(u, unidadesDireção));
    }
    return [];
  }, [todasUnidades, adminNucleo, ehRegional, ehDirecao, unidadesComando, unidadesDireção]);

  const turmasPermitidas = useMemo(() => {
    if (adminNucleo) return turmas;
    return turmas.filter((t) => pertenceAoEscopo(t.unidade, unidadesPermitidas));
  }, [turmas, adminNucleo, unidadesPermitidas]);

  /* ---------- navegação e estado ---------- */
  const [modo, setModo] = useState("adicionar");
  const [tela, setTela] = useState(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState("");

  const [novoSegmento, setNovoSegmento] = useState("");
  const [novaUnidadeNome, setNovaUnidadeNome] = useState("");
  const [novaTurma, setNovaTurma] = useState({ unidade: "", serie: "", turno: "M", turma: "" });
  const [novoCal, setNovoCal] = useState({ nome: "", inicio: "", fim: "" });

  const fileInputRef = useRef(null);
  const [csvData, setCsvData] = useState([]);
  const [csvErros, setCsvErros] = useState([]);

  const [calendarios, setCalendarios] = useState([]);
  const [calSelId, setCalSelId] = useState(null);
  const [unidExc, setUnidExc] = useState("");
  const [excecao, setExcecao] = useState({
    dataInicio: "", dataFim: "", motivo: "", tipo: "todas", serie: "", turma: "",
  });

  const [regionais, setRegionais] = useState([]);
  const [regSel, setRegSel] = useState(null);
  const [unidadesTemp, setUnidadesTemp] = useState([]);

  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "calendarios"),
      (snap) => {
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        lista.sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime());
        setCalendarios(lista);
      },
      (e) => console.error("Erro ao carregar calendários:", e)
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (tela !== "regional" || !adminNucleo) return;
    (async () => {
      try {
        const res = await getDocs(
          query(collection(db, "users"), where("cargos", "array-contains", "regional"))
        );
        setRegionais(
          res.docs.map((d) => {
            const x = d.data();
            return {
              id: d.id,
              nome: x.nome || "Sem nome",
              email: x.email || "",
              unidadesComando: x.unidadesComando || [],
            };
          })
        );
      } catch (e) {
        console.error("Erro ao carregar regionais:", e);
      }
    })();
  }, [tela, adminNucleo]);

  useEffect(() => {
    if (tela !== "r-usuario") return;
    (async () => {
      try {
        const res = await getDocs(collection(db, "users"));
        setUsuarios(res.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Erro ao carregar usuários:", e);
        setErro("Erro ao carregar usuários.");
      }
    })();
  }, [tela]);

  const calSel = calendarios.find((c) => c.id === calSelId) || null;
  const unidadesExc = adminNucleo ? ["Todas", ...unidadesPermitidas] : unidadesPermitidas;
  const unidadeAtual = unidExc || unidadesExc[0] || "";

  const listaSeries = segmentos.length > 0 
    ? segmentos.map(s => s.nome) 
    : SERIES_FALLBACK;

  /* ---------- ações ---------- */

  const limpar = () => {
    setErro("");
    setBusca("");
    setCalSelId(null);
    setRegSel(null);
    setCsvData([]);
    setCsvErros([]);
    setNovoSegmento("");
  };

  const ir = (id) => {
    limpar();
    setSucesso("");
    if (id === "turma") {
      setNovaTurma({ unidade: unidadesPermitidas[0] || "", serie: "", turno: "M", turma: "" });
    }
    if (id === "unidade") setNovaUnidadeNome("");
    if (id === "calendario") setNovoCal({ nome: "", inicio: "", fim: "" });
    if (id === "excecao") {
      setUnidExc("");
      setExcecao({ dataInicio: "", dataFim: "", motivo: "", tipo: "todas", serie: "", turma: "" });
    }
    setTela(id);
  };

  const voltar = () => {
    limpar();
    setTela(null);
  };

  const concluir = (msg) => {
    limpar();
    setTela(null);
    setSucesso(msg);
    setTimeout(() => setSucesso(""), 3500);
  };

  const adicionarSegmento = async () => {
    setErro("");
    if (!adminNucleo) {
      setErro("Apenas Admin e Núcleo podem cadastrar segmentos.");
      return;
    }
    const nome = normalizarNome(novoSegmento);
    if (!nome) {
      setErro("Informe o nome do segmento.");
      return;
    }
    setSalvando(true);
    try {
      await criarSegmento(nome);
      concluir("Segmento cadastrado com sucesso.");
    } catch (e) {
      console.error(e);
      setErro(e.message || "Erro ao cadastrar segmento.");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirSegmento = async (id, nome) => {
    setErro("");
    if (!adminNucleo) {
      setErro("Apenas Admin e Núcleo podem excluir segmentos.");
      return;
    }
    if (!window.confirm(`Excluir o segmento "${nome}"?`)) return;
    try {
      await excluirSegmento(id);
    } catch (e) {
      console.error(e);
      setErro("Erro ao excluir segmento.");
    }
  };

  const adicionarTurma = async () => {
    setErro("");
    if (!podeTurma) {
      setErro("Você não tem permissão para cadastrar turmas.");
      return;
    }
    const nome = novaTurma.turma.trim();
    if (!novaTurma.unidade || !novaTurma.serie || !novaTurma.turno || !nome) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (!pertenceAoEscopo(novaTurma.unidade, unidadesPermitidas)) {
      setErro("Você não tem permissão para cadastrar turmas nessa unidade.");
      return;
    }
    const duplicada = turmas.some(
      (t) =>
        t.unidade === novaTurma.unidade &&
        t.turma?.trim().toLocaleLowerCase("pt-BR") === nome.toLocaleLowerCase("pt-BR")
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
        turma: nome,
        ativo: true,
        criadoEm: serverTimestamp(),
      });
      concluir("Turma cadastrada com sucesso.");
    } catch (e) {
      console.error(e);
      setErro("Erro ao cadastrar turma.");
    } finally {
      setSalvando(false);
    }
  };

  const adicionarUnidade = async () => {
    setErro("");
    if (!adminNucleo) {
      setErro("Você não tem permissão para cadastrar unidades.");
      return;
    }
    const nome = normalizarNome(novaUnidadeNome);
    if (!nome) {
      setErro("Informe o nome da unidade.");
      return;
    }
    if (todasUnidades.some((u) => u.toLocaleLowerCase("pt-BR") === nome.toLocaleLowerCase("pt-BR"))) {
      setErro("Essa unidade já está cadastrada.");
      return;
    }
    setSalvando(true);
    try {
      const r = await criarUnidade(nome);
      if (!r) {
        setErro("Não foi possível cadastrar a unidade.");
        return;
      }
      concluir("Unidade cadastrada com sucesso.");
    } catch (e) {
      console.error(e);
      setErro("Erro ao cadastrar unidade.");
    } finally {
      setSalvando(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const linhas = ev.target.result.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const dados = [];
      const erros = [];
      linhas.forEach((linha, index) => {
        if (index === 0 && linha.toLowerCase().includes("unidade")) return;
        const partes = linha.split(",").map((p) => p.trim());
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
        dados.push({ unidade: normalizarNome(unidade), serie, turno: turno.toUpperCase(), turma });
      });
      setCsvData(dados);
      setCsvErros(erros);
    };
    reader.readAsText(file, "UTF-8");
    event.target.value = "";
  };

  const confirmarImportacao = async () => {
    if (!adminNucleo) {
      setErro("Você não tem permissão para importar turmas.");
      return;
    }
    if (!csvData.length || csvErros.length) return;
    setSalvando(true);
    try {
      const batch = writeBatch(db);
      const existentes = new Set(todasUnidades.map((u) => u.toLocaleLowerCase("pt-BR")));
      const novas = new Set();
      csvData.forEach((item) => {
        const k = item.unidade.toLocaleLowerCase("pt-BR");
        if (!existentes.has(k)) {
          novas.add(item.unidade);
          existentes.add(k);
        }
      });
      novas.forEach((nome) => {
        batch.set(doc(collection(db, "unidades_db")), { nome, criadoEm: serverTimestamp() });
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
      concluir("Importação concluída.");
    } catch (e) {
      console.error(e);
      setErro("Erro ao importar os dados.");
    } finally {
      setSalvando(false);
    }
  };

  const criarCalendario = async () => {
    setErro("");
    if (!adminNucleo) {
      setErro("Você não tem permissão para criar calendários.");
      return;
    }
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
      concluir("Calendário criado com sucesso.");
    } catch (e) {
      console.error(e);
      setErro("Erro ao criar calendário.");
    } finally {
      setSalvando(false);
    }
  };

  const adicionarExcecao = async () => {
    setErro("");
    if (!calSel) return;
    if (!gerente) {
      setErro("Você não tem permissão para adicionar exceções.");
      return;
    }
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
    const unidadeExcecao = unidadeAtual === "Todas" ? null : unidadeAtual;
    if (unidadeExcecao && !pertenceAoEscopo(unidadeExcecao, unidadesPermitidas)) {
      setErro("Você não tem permissão para adicionar exceções nessa unidade.");
      return;
    }
    if (!adminNucleo && !unidadeExcecao) {
      setErro("Selecione uma unidade específica para adicionar a exceção.");
      return;
    }
    if (ehDirecao && !ehRegional && !adminNucleo && unidadeExcecao !== unidadePerfil) {
      setErro("Você só pode adicionar exceções na sua unidade.");
      return;
    }
    setSalvando(true);
    try {
      const nova = {
        id: crypto.randomUUID(),
        dataInicio: excecao.dataInicio,
        dataFim: fim,
        motivo: excecao.motivo.trim() || "Sem motivo",
        tipo: excecao.tipo,
        serie: excecao.tipo === "serie" ? excecao.serie : null,
        turma: excecao.tipo === "turma" ? excecao.turma : null,
        unidade: unidadeExcecao,
      };
      await updateDoc(doc(db, "calendarios", calSel.id), {
        excecoes: [...(calSel.excecoes || []), nova],
      });
      setExcecao({ dataInicio: "", dataFim: "", motivo: "", tipo: "todas", serie: "", turma: "" });
      concluir("Exceção adicionada.");
    } catch (e) {
      console.error(e);
      setErro("Erro ao adicionar exceção.");
    } finally {
      setSalvando(false);
    }
  };

  const removerExcecao = async (id) => {
    if (!calSel) return;
    const alvo = (calSel.excecoes || []).find((e) => e.id === id);
    if (!alvo) return;
    if (!podeTurma) {
      setErro("Você não tem permissão para remover exceções.");
      return;
    }
    if (!adminNucleo) {
      const u = unidadeDaExcecao(alvo);
      if (u === null || !pertenceAoEscopo(u, unidadesPermitidas)) {
        setErro("Você só pode remover exceções das suas unidades.");
        return;
      }
    }
    if (!window.confirm("Remover esta exceção?")) return;
    try {
      await updateDoc(doc(db, "calendarios", calSel.id), {
        excecoes: (calSel.excecoes || []).filter((e) => e.id !== id),
      });
    } catch (e) {
      console.error(e);
      setErro("Erro ao remover exceção.");
    }
  };

  const excluirTurma = async (turma) => {
    setErro("");
    if (!podeTurma) {
      setErro("Você não tem permissão para excluir turmas.");
      return;
    }
    if (!pertenceAoEscopo(turma.unidade, unidadesPermitidas)) {
      setErro("Você não tem permissão para excluir turmas dessa unidade.");
      return;
    }
    if (!window.confirm(`Excluir a turma "${turma.turma}"?`)) return;
    try {
      await deleteDoc(doc(db, "turmas_escolares", turma.id));
    } catch (e) {
      console.error(e);
      setErro("Não foi possível excluir a turma.");
    }
  };

  const excluirUnidadeCompleta = async (nome) => {
    setErro("");
    if (!adminNucleo) {
      setErro("Você não tem permissão para excluir unidades.");
      return;
    }
    const daUnidade = turmas.filter((t) => t.unidade === nome);
    const msg =
      `Deseja excluir a unidade "${nome}"?` +
      (daUnidade.length ? `\n\n${daUnidade.length} turma(s) também serão excluídas.` : "");
    if (!window.confirm(msg)) return;
    setSalvando(true);
    try {
      const batch = writeBatch(db);
      daUnidade.forEach((t) => batch.delete(doc(db, "turmas_escolares", t.id)));
      await batch.commit();
      await excluirUnidade(nome);
    } catch (e) {
      console.error(e);
      setErro("Erro ao excluir unidade.");
    } finally {
      setSalvando(false);
    }
  };

  const excluirCalendario = async (cal) => {
    setErro("");
    if (!adminNucleo) {
      setErro("Você não tem permissão para excluir calendários.");
      return;
    }
    if (!window.confirm(`Excluir o calendário "${cal.nome}"?`)) return;
    try {
      await deleteDoc(doc(db, "calendarios", cal.id));
    } catch (e) {
      console.error(e);
      setErro("Erro ao excluir calendário.");
    }
  };

  const salvarRegional = async () => {
    if (!regSel || !adminNucleo) return;
    setSalvando(true);
    try {
      await updateDoc(doc(db, "users", regSel.id), { unidadesComando: unidadesTemp });
      concluir("Unidades do regional salvas.");
    } catch (e) {
      console.error(e);
      setErro("Erro ao salvar as unidades do regional.");
    } finally {
      setSalvando(false);
    }
  };

  const usuarioNoEscopo = (u) => {
    const meuEmail = String(perfilAtivo?.email || "").toLowerCase();
    if (meuEmail && String(u.email || "").toLowerCase() === meuEmail) return false;
    if (adminNucleo) return true;
    if (!podeTurma || !unidadesPermitidas.length) return false;
    const cs = normalizarCargos(u);
    if (cs.some((c) => ["admin", "administrador", "nucleo", "regional"].includes(c))) return false;
    return unidadesDoUsuario(u).some((x) => pertenceAoEscopo(x, unidadesPermitidas));
  };

  const excluirUsuario = async (u) => {
    setErro("");
    if (!usuarioNoEscopo(u)) {
      setErro("Você não tem permissão para excluir este usuário.");
      return;
    }
    if (!window.confirm(`Excluir o usuário "${u.nome || u.email}"? Esta ação é permanente.`)) return;
    try {
      await deleteDoc(doc(db, "users", u.id));
      setUsuarios((a) => a.filter((x) => x.id !== u.id));
    } catch (e) {
      console.error(e);
      setErro("Não foi possível excluir o usuário.");
    }
  };

  /* ---------- menu ---------- */

  const ADD = [
    { id: "usuario", icon: UserPlus, label: "Adicionar usuário", desc: "Novo acesso", ok: gerente },
    { id: "turma", icon: GraduationCap, label: "Nova turma", desc: "Cadastrar turma", ok: podeTurma },
    { id: "excecao", icon: CalendarX, label: "Nova exceção", desc: "Feriados/Recessos", ok: gerente },
    { id: "unidade", icon: Building2, label: "Nova unidade", desc: "Cadastrar unidade", ok: adminNucleo },
    { id: "segmento", icon: Layers, label: "Novo segmento", desc: "Adicionar série", ok: adminNucleo },
    { id: "csv", icon: FileSpreadsheet, label: "Importar CSV", desc: "Várias turmas", ok: adminNucleo },
    { id: "calendario", icon: CalendarPlus, label: "Novo calendário", desc: "Calendário acadêmico", ok: adminNucleo },
    { id: "regional", icon: UserCheck, label: "Atribuir unidades", desc: "Vincular regional", ok: adminNucleo },
  ].filter((a) => a.ok);

  const REM = [
    { id: "r-excecao", icon: CalendarX, label: "Remover exceção", desc: "Excluir dia", ok: podeTurma },
    { id: "r-turma", icon: GraduationCap, label: "Remover turma", desc: "Excluir turma", ok: podeTurma },
    { id: "r-usuario", icon: UserMinus, label: "Remover usuário", desc: "Excluir usuário", ok: podeTurma },
    { id: "r-segmento", icon: Layers, label: "Remover segmento", desc: "Excluir série", ok: adminNucleo },
    { id: "r-unidade", icon: Building2, label: "Remover unidade", desc: "Excluir unidade", ok: adminNucleo },
    { id: "r-calendario", icon: CalendarX, label: "Remover calendário", desc: "Excluir calendário", ok: adminNucleo },
  ].filter((a) => a.ok);

  const TITULOS = {
    turma: "Nova turma", unidade: "Nova unidade", csv: "Importar turmas",
    calendario: "Novo calendário", excecao: "Nova exceção", regional: "Atribuir unidades",
    segmento: "Novo segmento",
    "r-turma": "Remover turma", "r-unidade": "Remover unidade",
    "r-calendario": "Remover calendário", "r-excecao": "Remover exceção",
    "r-usuario": "Remover usuário", "r-segmento": "Remover segmento",
  };

  if (perfilCarregando) {
    return (
      <div className="fixed inset-0 z-[999] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
        <div className="w-full rounded-t-[28px] bg-white px-8 py-6 text-sm font-semibold sm:w-auto sm:rounded-[28px]" onClick={(e) => e.stopPropagation()}>
          Carregando...
        </div>
      </div>
    );
  }

  if (tela === "usuario") {
    return (
      <CadastrarUsuario
        onClose={onClose}
        onSuccess={() => onUsuarioCadastrado?.()}
        perfilAtivo={perfilAtivo}
        unidadesEscopo={unidadesEscopo}
      />
    );
  }

  const termo = busca.trim().toLocaleLowerCase("pt-BR");
  const filtra = (...partes) =>
    !termo || partes.join(" ").toLocaleLowerCase("pt-BR").includes(termo);

  const excecoesVisiveis = (cal) =>
    (cal?.excecoes || []).filter((e) => {
      if (adminNucleo) return true;
      const u = unidadeDaExcecao(e);
      return u !== null && pertenceAoEscopo(u, unidadesPermitidas);
    });

  const listaCalendarios = (
    <div className="flex flex-col gap-2">
      {calendarios.length === 0 ? (
        <Vazio>Nenhum calendário cadastrado.</Vazio>
      ) : (
        calendarios.map((c) => (
          <ItemLista
            key={c.id}
            titulo={c.nome}
            subtitulo={`${fmt(c.inicio)} até ${fmt(c.fim)}`}
            onClick={() => setCalSelId(c.id)}
          />
        ))
      )}
    </div>
  );

  const turmasDaUnidadeExc = turmasPermitidas
    .filter((t) => t.unidade === unidadeAtual && t.ativo !== false)
    .sort((a, b) => String(a.turma).localeCompare(String(b.turma), "pt-BR"));

  const turmasRemover = turmasPermitidas
    .filter((t) => filtra(t.turma, t.unidade, t.serie))
    .sort(
      (a, b) =>
        String(a.unidade).localeCompare(String(b.unidade), "pt-BR") ||
        String(a.turma).localeCompare(String(b.turma), "pt-BR")
    );

  const usuariosRemover = usuarios
    .filter(usuarioNoEscopo)
    .filter((u) => filtra(u.nome, u.email))
    .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));

  const unidadesRemover = unidadesPermitidas.filter((u) => filtra(u));

  const acaoVoltar = () => {
    if (calSel && (tela === "excecao" || tela === "r-excecao")) return setCalSelId(null);
    if (regSel) return setRegSel(null);
    return voltar();
  };

  const mostrarRemover = modo === "remover" && REM.length > 0;

  const ServicoBotao = ({ icon: Icon, label, onClick, perigo }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-95"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-black">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <span className="text-center text-[11px] font-semibold text-gray-700 leading-tight">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-center bg-black/50 backdrop-blur-sm p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] sm:rounded-[28px] bg-white p-5 pb-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`::-webkit-scrollbar { display: none; }`}</style>
        
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {tela ? (
              <button
                type="button"
                onClick={acaoVoltar}
                aria-label="Voltar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2f2f2] hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
            ) : (
              <Settings size={24} className="text-gray-900" />
            )}
            <h2 className="truncate text-xl font-extrabold text-gray-900">
              {tela ? TITULOS[tela] : "Mais"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2f2f2] hover:bg-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {sucesso && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <CheckCircle2 size={16} /> {sucesso}
          </div>
        )}

        {erro && (
          <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {erro}
          </div>
        )}

        {/* ============ MENU INICIAL ============ */}
        {!tela && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 rounded-full bg-[#f2f2f2] px-4 py-3 text-gray-500">
              <Search size={18} />
              <span className="text-sm">Do que você precisa?</span>
            </div>

            {REM.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`::-webkit-scrollbar { display: none; }`}</style>
                <button
                  type="button"
                  onClick={() => setModo("adicionar")}
                  className={`relative flex min-w-[200px] flex-1 snap-start flex-col justify-between overflow-hidden rounded-2xl p-4 text-left transition-all ${
                    modo === "adicionar" 
                      ? "bg-yellow-400 text-gray-900 shadow-lg" 
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold leading-tight">Adicionar</h3>
                    <p className={`text-xs ${modo === "adicionar" ? "text-yellow-800" : "text-gray-400"}`}>Criar novos registros</p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold relative z-10">
                    Acessar <ChevronRight size={14} />
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <PlusCircle size={80} />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setModo("remover")}
                  className={`relative flex min-w-[200px] flex-1 snap-start flex-col justify-between overflow-hidden rounded-2xl p-4 text-left transition-all ${
                    modo === "remover" 
                      ? "bg-yellow-400 text-gray-900 shadow-lg" 
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold leading-tight">Remover</h3>
                    <p className={`text-xs ${modo === "remover" ? "text-yellow-800" : "text-gray-400"}`}>Excluir registros</p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold relative z-10">
                    Acessar <ChevronRight size={14} />
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <Trash2 size={80} />
                  </div>
                </button>
              </div>
            )}

            <div>
              <h3 className="mb-3 text-lg font-bold text-gray-900">Serviços</h3>
              <div className="grid grid-cols-4 gap-3">
                {(mostrarRemover ? REM : ADD).map((a) => (
                  <ServicoBotao
                    key={a.id}
                    icon={mostrarRemover ? Trash2 : a.icon}
                    label={a.label}
                    perigo={mostrarRemover}
                    onClick={() => ir(a.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============ NOVO SEGMENTO ============ */}
        {tela === "segmento" && (
          <div>
            <Label>Nome do segmento / série</Label>
            <input
              autoFocus
              value={novoSegmento}
              onChange={(e) => setNovoSegmento(e.target.value)}
              placeholder="Ex.: 1ª série Ensino Médio"
              className={field}
            />
            <p className="mt-2 text-sm text-gray-400">
              Este item aparecerá na lista de seleção ao criar turmas e exceções.
            </p>
            <button type="button" onClick={adicionarSegmento} disabled={salvando} className={`${btnPrimary} mt-5`}>
              {salvando ? "Salvando..." : "Cadastrar segmento"}
            </button>
          </div>
        )}

        {/* ============ NOVA TURMA ============ */}
        {tela === "turma" && (
          <div>
            <Label>Unidade</Label>
            <select
              value={novaTurma.unidade}
              onChange={(e) => setNovaTurma((a) => ({ ...a, unidade: e.target.value }))}
              className={field}
            >
              <option value="">Selecione uma unidade</option>
              {unidadesPermitidas.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>

            <Label>Série / Segmento</Label>
            <select
              value={novaTurma.serie}
              onChange={(e) => setNovaTurma((a) => ({ ...a, serie: e.target.value }))}
              className={field}
            >
              <option value="">Selecione uma série</option>
              {listaSeries.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <Label>Turno</Label>
            <div className="flex gap-2">
              {TURNOS.map((t) => (
                <Chip key={t} ativo={novaTurma.turno === t} onClick={() => setNovaTurma((a) => ({ ...a, turno: t }))}>
                  {t === "M" ? "Manhã" : "Tarde"}
                </Chip>
              ))}
            </div>

            <Label>Nome da turma</Label>
            <input
              value={novaTurma.turma}
              onChange={(e) => setNovaTurma((a) => ({ ...a, turma: e.target.value }))}
              placeholder="Ex.: 6º ano A"
              className={field}
            />

            <button
              type="button"
              onClick={adicionarTurma}
              disabled={salvando || !unidadesPermitidas.length}
              className={`${btnPrimary} mt-5`}
            >
              {salvando ? "Salvando..." : "Cadastrar turma"}
            </button>
          </div>
        )}

        {/* ============ NOVA UNIDADE ============ */}
        {tela === "unidade" && (
          <div>
            <Label>Nome da unidade</Label>
            <input
              autoFocus
              value={novaUnidadeNome}
              onChange={(e) => setNovaUnidadeNome(e.target.value)}
              placeholder="Ex.: Icaraí 1"
              className={field}
            />
            <p className="mt-2 text-sm text-gray-400">
              A primeira letra será convertida automaticamente para maiúscula.
            </p>
            <button type="button" onClick={adicionarUnidade} disabled={salvando} className={`${btnPrimary} mt-5`}>
              {salvando ? "Salvando..." : "Cadastrar unidade"}
            </button>
          </div>
        )}

        {/* ============ IMPORTAR CSV ============ */}
        {tela === "csv" && (
          <div>
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              O CSV deve ter as colunas nesta ordem:
              <b className="mt-1 block">Unidade, Série, Turno, Nome da Turma</b>
            </div>

            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#f2f2f2] py-4 font-semibold hover:bg-gray-200 transition-colors"
            >
              <Upload size={18} /> Selecionar arquivo CSV
            </button>

            {csvErros.length > 0 && (
              <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3">
                <p className="mb-1 text-sm font-bold text-rose-700">{csvErros.length} erro(s) encontrado(s)</p>
                <div className="max-h-36 overflow-y-auto">
                  {csvErros.map((e, i) => <p key={i} className="text-sm text-rose-700">{e}</p>)}
                </div>
              </div>
            )}

            {csvData.length > 0 && csvErros.length === 0 && (
              <>
                <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 size={16} /> {csvData.length} turma(s) prontas para importação.
                </p>
                <div className="mt-2 flex max-h-56 flex-col gap-2 overflow-y-auto">
                  {csvData.map((item, i) => (
                    <div key={i} className="rounded-2xl bg-[#f2f2f2] px-4 py-2">
                      <p className="font-semibold">{item.turma}</p>
                      <p className="text-sm text-gray-500">
                        {item.unidade} · {item.serie} · {item.turno === "M" ? "Manhã" : "Tarde"}
                      </p>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={confirmarImportacao} disabled={salvando} className={`${btnPrimary} mt-4`}>
                  {salvando ? "Importando..." : "Confirmar importação"}
                </button>
              </>
            )}
          </div>
        )}

        {/* ============ NOVO CALENDÁRIO ============ */}
        {tela === "calendario" && (
          <div>
            <Label>Nome do calendário</Label>
            <input
              value={novoCal.nome}
              onChange={(e) => setNovoCal((a) => ({ ...a, nome: e.target.value }))}
              placeholder="Ex.: Ano letivo 2027"
              className={field}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data inicial</Label>
                <input type="date" value={novoCal.inicio} onChange={(e) => setNovoCal((a) => ({ ...a, inicio: e.target.value }))} className={field} />
              </div>
              <div>
                <Label>Data final</Label>
                <input type="date" value={novoCal.fim} onChange={(e) => setNovoCal((a) => ({ ...a, fim: e.target.value }))} className={field} />
              </div>
            </div>
            <button type="button" onClick={criarCalendario} disabled={salvando} className={`${btnPrimary} mt-5`}>
              {salvando ? "Salvando..." : "Criar calendário"}
            </button>
          </div>
        )}

        {/* ============ NOVA EXCEÇÃO ============ */}
        {tela === "excecao" && !calSel && (
          <div>
            <p className="mb-3 text-sm text-gray-500">Escolha o calendário:</p>
            {listaCalendarios}
          </div>
        )}

        {tela === "excecao" && calSel && (
          <div>
            <p className="mb-1 text-sm text-gray-500">
              {calSel.nome} · {fmt(calSel.inicio)} até {fmt(calSel.fim)}
            </p>

            <Label>Unidade</Label>
            <div className="flex flex-wrap gap-2">
              {unidadesExc.length === 0 && <p className="text-sm text-gray-400">Nenhuma unidade disponível.</p>}
              {unidadesExc.map((u) => (
                <Chip key={u} ativo={unidadeAtual === u} onClick={() => setUnidExc(u)}>
                  {u === "Todas" ? "Todas as unidades" : u}
                </Chip>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data inicial</Label>
                <input type="date" value={excecao.dataInicio} onChange={(e) => setExcecao((a) => ({ ...a, dataInicio: e.target.value }))} className={field} />
              </div>
              <div>
                <Label>Data final</Label>
                <input type="date" value={excecao.dataFim} min={excecao.dataInicio || undefined} onChange={(e) => setExcecao((a) => ({ ...a, dataFim: e.target.value }))} className={field} />
              </div>
            </div>

            <Label>Motivo</Label>
            <input
              value={excecao.motivo}
              onChange={(e) => setExcecao((a) => ({ ...a, motivo: e.target.value }))}
              placeholder="Ex.: Feriado municipal"
              className={field}
            />

            <Label>Aplicar em</Label>
            <div className="flex flex-wrap gap-2">
              {[["todas", "Toda a unidade"], ["serie", "Uma série"], ["turma", "Uma turma"]].map(([id, label]) => (
                <Chip
                  key={id}
                  ativo={excecao.tipo === id}
                  onClick={() => setExcecao((a) => ({ ...a, tipo: id, serie: "", turma: "" }))}
                >
                  {label}
                </Chip>
              ))}
            </div>

            {excecao.tipo === "serie" && (
              <>
                <Label>Série / Segmento</Label>
                <select value={excecao.serie} onChange={(e) => setExcecao((a) => ({ ...a, serie: e.target.value }))} className={field}>
                  <option value="">Selecione uma série</option>
                  {listaSeries.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </>
            )}

            {excecao.tipo === "turma" && (
              <>
                <Label>Turma</Label>
                <select value={excecao.turma} onChange={(e) => setExcecao((a) => ({ ...a, turma: e.target.value }))} className={field}>
                  <option value="">Selecione uma turma</option>
                  {turmasDaUnidadeExc.map((t) => <option key={t.id} value={t.turma}>{t.turma}</option>)}
                </select>
                {turmasDaUnidadeExc.length === 0 && (
                  <p className="mt-2 text-sm text-rose-600">Nenhuma turma encontrada para esta unidade.</p>
                )}
              </>
            )}

            <button
              type="button"
              onClick={adicionarExcecao}
              disabled={salvando || !unidadeAtual || (excecao.tipo === "turma" && turmasDaUnidadeExc.length === 0)}
              className={`${btnPrimary} mt-5`}
            >
              {salvando ? "Salvando..." : "Adicionar exceção"}
            </button>
          </div>
        )}

        {/* ============ ATRIBUIR UNIDADES (REGIONAL) ============ */}
        {tela === "regional" && !regSel && (
          <div className="flex flex-col gap-2">
            {regionais.length === 0 ? (
              <Vazio>Nenhum regional cadastrado.</Vazio>
            ) : (
              regionais.map((r) => (
                <ItemLista
                  key={r.id}
                  titulo={r.nome}
                  subtitulo={`${r.email} · ${r.unidadesComando.length} unidade(s)`}
                  onClick={() => { setRegSel(r); setUnidadesTemp([...(r.unidadesComando || [])]); }}
                />
              ))
            )}
          </div>
        )}

        {tela === "regional" && regSel && (
          <div>
            <p className="mb-3 text-sm text-gray-500">
              Unidades que <b className="text-black">{regSel.nome}</b> poderá gerenciar:
            </p>
            <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
              {todasUnidades.map((u) => {
                const sel = unidadesTemp.includes(u);
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() =>
                      setUnidadesTemp((at) => (sel ? at.filter((i) => i !== u) : [...at, u]))
                    }
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left font-semibold transition-colors ${
                      sel ? "bg-black text-white" : "bg-[#f2f2f2] hover:bg-gray-200"
                    }`}
                  >
                    {u}
                    {sel && <CheckCircle2 size={16} />}
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={salvarRegional} disabled={salvando} className={`${btnPrimary} mt-5`}>
              {salvando ? "Salvando..." : "Salvar unidades"}
            </button>
          </div>
        )}

        {/* ============ REMOVER TURMA ============ */}
        {tela === "r-turma" && (
          <div>
            <div className="mb-3 flex items-center gap-3 rounded-2xl bg-[#f2f2f2] px-4 py-3">
              <Search size={18} className="text-gray-400" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar turma..."
                className="flex-1 bg-transparent text-[16px] outline-none"
              />
            </div>
            <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
              {turmasRemover.map((t) => (
                <ItemLista
                  key={t.id}
                  titulo={t.turma}
                  subtitulo={`${t.unidade} · ${t.serie} · ${t.turno === "M" ? "Manhã" : "Tarde"}`}
                  excluir={() => excluirTurma(t)}
                />
              ))}
              {turmasRemover.length === 0 && <Vazio>Nada encontrado.</Vazio>}
            </div>
          </div>
        )}

        {/* ============ REMOVER USUÁRIO ============ */}
        {tela === "r-usuario" && (
          <div>
            <div className="mb-3 flex items-center gap-3 rounded-2xl bg-[#f2f2f2] px-4 py-3">
              <Search size={18} className="text-gray-400" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar usuário..."
                className="flex-1 bg-transparent text-[16px] outline-none"
              />
            </div>
            <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
              {usuariosRemover.map((u) => (
                <ItemLista
                  key={u.id}
                  titulo={u.nome || "Sem nome"}
                  subtitulo={`${u.email || "—"}${
                    unidadesDoUsuario(u).length ? ` · ${unidadesDoUsuario(u).join(", ")}` : ""
                  }`}
                  excluir={() => excluirUsuario(u)}
                />
              ))}
              {usuariosRemover.length === 0 && <Vazio>Nenhum usuário encontrado.</Vazio>}
            </div>
          </div>
        )}

        {/* ============ REMOVER UNIDADE ============ */}
        {tela === "r-unidade" && (
          <div>
            <div className="mb-3 flex items-center gap-3 rounded-2xl bg-[#f2f2f2] px-4 py-3">
              <Search size={18} className="text-gray-400" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar unidade..."
                className="flex-1 bg-transparent text-[16px] outline-none"
              />
            </div>
            <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
              {unidadesRemover.map((u) => {
                const qtd = turmas.filter((t) => t.unidade === u).length;
                return (
                  <ItemLista
                    key={u}
                    titulo={u}
                    subtitulo={`${qtd} ${qtd === 1 ? "turma" : "turmas"}`}
                    excluir={() => excluirUnidadeCompleta(u)}
                    desabilitado={salvando}
                  />
                );
              })}
              {unidadesRemover.length === 0 && <Vazio>Nada encontrado.</Vazio>}
            </div>
          </div>
        )}

        {/* ============ REMOVER SEGMENTO ============ */}
        {tela === "r-segmento" && (
          <div>
            <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
              {segmentos.length === 0 ? (
                <Vazio>Nenhum segmento cadastrado no banco.</Vazio>
              ) : (
                segmentos.map((s) => (
                  <ItemLista
                    key={s.id}
                    titulo={s.nome}
                    subtitulo="Série / Segmento"
                    excluir={() => handleExcluirSegmento(s.id, s.nome)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* ============ REMOVER CALENDÁRIO ============ */}
        {tela === "r-calendario" && (
          <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
            {calendarios.length === 0 ? (
              <Vazio>Nenhum calendário cadastrado.</Vazio>
            ) : (
              calendarios.map((c) => (
                <ItemLista
                  key={c.id}
                  titulo={c.nome}
                  subtitulo={`${fmt(c.inicio)} até ${fmt(c.fim)}`}
                  excluir={() => excluirCalendario(c)}
                />
              ))
            )}
          </div>
        )}

        {/* ============ REMOVER EXCEÇÃO ============ */}
        {tela === "r-excecao" && !calSel && (
          <div>
            <p className="mb-3 text-sm text-gray-500">Escolha o calendário:</p>
            {listaCalendarios}
          </div>
        )}

        {tela === "r-excecao" && calSel && (
          <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
            {excecoesVisiveis(calSel).length === 0 ? (
              <Vazio>Nenhuma exceção neste calendário.</Vazio>
            ) : (
              excecoesVisiveis(calSel).map((e) => (
                <ItemLista
                  key={e.id}
                  titulo={`${fmt(e.dataInicio)}${
                    e.dataFim && e.dataFim !== e.dataInicio ? ` até ${fmt(e.dataFim)}` : ""
                  }`}
                  subtitulo={`${e.motivo} · ${unidadeDaExcecao(e) || "Todas as unidades"} · ${
                    e.tipo === "todas" ? "Toda a unidade" : e.tipo === "serie" ? e.serie : e.turma
                  }`}
                  excluir={() => removerExcecao(e.id)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}