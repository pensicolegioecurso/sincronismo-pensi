import { useState, useEffect, useMemo } from "react";
import {
  Search, ShieldCheck, Trash2, X, AlertCircle, MapPin,
  Download, Power, PowerOff, SlidersHorizontal, Eye,
  ChevronLeft, ChevronRight, Filter, Mail, Building2,
  RotateCcw, FileText, FileSpreadsheet, Loader2, UserPlus, GraduationCap,
} from "lucide-react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { getRegionalDaUnidade } from "../../data/unidades";
import TeacherProfileModal from "./TeacherProfileModal";
import CadastrarUsuario from "./CadastrarUsuario";
import { parseTurmasPorUnidade, chaveTurma } from "../../utils/turmas";

const CARGOS_ATRIBUIVEIS = [
  { id: "diretor", label: "Diretor", cor: "bg-purple-300 text-black" },
  { id: "coordenador", label: "Coordenador", cor: "bg-indigo-300 text-black" },
  { id: "nucleo", label: "Núcleo", cor: "bg-blue-300 text-black" },
  { id: "regional", label: "Regional", cor: "bg-orange-300 text-black" },
  { id: "professor", label: "Professor", cor: "bg-green-300 text-black" },
];

const REGIONAIS_LIST = ["Todas", "Beatriz", "Débora", "Paula"];
const POR_PAGINA = 10;

export default function AdminUsers({ unidadesEscopo, perfilAtivo, currentUser }) {
  const [users, setUsers] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const [busca, setBusca] = useState("");
  const [filtroCargo, setFiltroCargo] = useState("todos");
  const [filtroUnidade, setFiltroUnidade] = useState("Todas");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroRegional, setFiltroRegional] = useState("Todas");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const [modalPermissoes, setModalPermissoes] = useState(null);
  const [modalStatus, setModalStatus] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const [cargosTemp, setCargosTemp] = useState([]);
  const [unidadesInativasTemp, setUnidadesInativasTemp] = useState([]);
  const [turmasInativasTemp, setTurmasInativasTemp] = useState([]);
  const [perfilProfessor, setPerfilProfessor] = useState(null);

  const podeGerenciar = ["admin", "nucleo", "regional"].includes(perfilAtivo);
  const ehRegional = perfilAtivo === "regional";

  // -------- CARREGAR USUÁRIOS --------
  async function carregarUsers() {
    try {
      const snap = await getDocs(collection(db, "users"));
      const lista = [];
      snap.forEach((d) => {
        const data = d.data();
        lista.push({
          id: d.id,
          nome: data.nome || "Sem nome",
          email: data.email || "Sem e-mail",
          cargos: data.cargos || ["professor"],
          unidade: data.unidade || "Não informada",
          unidadesComando: data.unidadesComando || [],
          unidadesInativas: data.unidadesInativas || [],
          turmasInativas: data.turmasInativas || [],
          turmas: data.turmas || "",
          disciplinas: data.disciplinas || [],
          series: data.series || "",
          status: data.status || "Ativo",
        });
      });
      setUsers(lista);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarUsers();
  }, []);

  // -------- ESCOPO / FILTRO BASE --------
  const usersVisiveis = useMemo(() => {
    return users.filter((u) => {
      if (u.cargos.includes("admin")) return false;
      if (currentUser && u.id === currentUser.uid) return false;

      if (ehRegional) {
        const unidadesDoUser = (u.unidade || "").split(",").map((s) => s.trim());
        const cobre = unidadesDoUser.some((uni) => (unidadesEscopo || []).includes(uni));
        if (!cobre) return false;
      }
      return true;
    });
  }, [users, ehRegional, unidadesEscopo, currentUser]);

  const unidadesUnicas = useMemo(() => {
    const todas = usersVisiveis.flatMap((u) => u.unidade.split(",").map((s) => s.trim())).filter(Boolean);
    let base = ["Todas", ...new Set(todas)].sort();
    if (filtroRegional !== "Todas") {
      base = ["Todas", ...base.slice(1).filter((u) => getRegionalDaUnidade(u) === filtroRegional)];
    }
    return base;
  }, [usersVisiveis, filtroRegional]);

  const usersFiltrados = useMemo(() => {
    const filtrados = usersVisiveis.filter((u) => {
      const matchBusca =
        u.nome.toLowerCase().includes(busca.toLowerCase()) ||
        u.email.toLowerCase().includes(busca.toLowerCase());
      const matchCargo = filtroCargo === "todos" || u.cargos.includes(filtroCargo);
      const matchUnidade = filtroUnidade === "Todas" || u.unidade.includes(filtroUnidade);
      const todasUnidades = u.unidade.split(",").map((s) => s.trim()).filter(Boolean);
      const inativas = u.unidadesInativas || [];
      const temUnidadeAtiva = todasUnidades.some((uni) => !inativas.includes(uni));
      let matchStatus = true;
      if (filtroStatus === "Ativo") matchStatus = temUnidadeAtiva;
      else if (filtroStatus === "Inativo") matchStatus = !temUnidadeAtiva;
      const primeiraUnidade = todasUnidades[0] || "";
      const matchRegional =
        filtroRegional === "Todas" || getRegionalDaUnidade(primeiraUnidade) === filtroRegional;
      return matchBusca && matchCargo && matchUnidade && matchStatus && matchRegional;
    });
    return filtrados.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [usersVisiveis, busca, filtroCargo, filtroUnidade, filtroStatus, filtroRegional]);

  useEffect(() => { setPaginaAtual(1); }, [busca, filtroCargo, filtroUnidade, filtroStatus, filtroRegional]);

  const totalPaginas = Math.max(1, Math.ceil(usersFiltrados.length / POR_PAGINA));
  const paginaSegura = Math.min(paginaAtual, totalPaginas);
  const inicio = (paginaSegura - 1) * POR_PAGINA;
  const usersPaginados = usersFiltrados.slice(inicio, inicio + POR_PAGINA);

  const totalInativos = usersVisiveis.filter((u) => {
    const todas = u.unidade.split(",").map((s) => s.trim()).filter(Boolean);
    const inativas = u.unidadesInativas || [];
    return !todas.some((uni) => !inativas.includes(uni));
  }).length;

  // -------- AÇÕES --------
  const abrirStatus = (u) => {
    setModalStatus(u);
    setUnidadesInativasTemp([...(u.unidadesInativas || [])]);
    setTurmasInativasTemp([...(u.turmasInativas || [])]);
  };

  const confirmarMudancaStatus = async () => {
    setProcessando(true);
    try {
      const ref = doc(db, "users", modalStatus.id);
      await updateDoc(ref, {
        unidadesInativas: unidadesInativasTemp,
        turmasInativas: turmasInativasTemp,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === modalStatus.id
            ? { ...u, unidadesInativas: unidadesInativasTemp, turmasInativas: turmasInativasTemp }
            : u
        )
      );
      setModalStatus(null);
    } catch {
      alert("Erro ao mudar status.");
    } finally {
      setProcessando(false);
    }
  };

  const abrirPermissoes = (u) => {
    setModalPermissoes(u);
    const sanitizados = (u.cargos || []).filter((c) =>
      CARGOS_ATRIBUIVEIS.some((x) => x.id === c)
    );
    setCargosTemp(sanitizados.length ? sanitizados : ["professor"]);
  };

  const salvarCargos = async () => {
    setProcessando(true);
    try {
      const ref = doc(db, "users", modalPermissoes.id);
      await updateDoc(ref, { cargos: cargosTemp });
      setUsers((prev) =>
        prev.map((u) => (u.id === modalPermissoes.id ? { ...u, cargos: cargosTemp } : u))
      );
      setModalPermissoes(null);
    } catch {
      alert("Erro ao salvar cargos.");
    } finally {
      setProcessando(false);
    }
  };

  const confirmarExclusao = async () => {
    setProcessando(true);
    try {
      await deleteDoc(doc(db, "users", deleteUser.id));
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      setDeleteUser(null);
    } catch {
      alert("Erro ao excluir usuário.");
    } finally {
      setProcessando(false);
    }
  };

  const handleExportar = (formato) => {
    const dadosExport = usersFiltrados.map((u) => ({
      Nome: u.nome,
      Email: u.email,
      Unidade: u.unidade,
      Cargos: u.cargos.join(", "),
      Status: u.status,
    }));
    console.table(dadosExport);
    alert(`Exportando ${usersFiltrados.length} usuários para ${formato.toUpperCase()}.`);
    setIsExportOpen(false);
  };

  const limparFiltros = () => {
    setBusca("");
    setFiltroCargo("todos");
    setFiltroUnidade("Todas");
    setFiltroStatus("todos");
    setFiltroRegional("Todas");
  };

  const temFiltrosAtivos =
    busca !== "" ||
    filtroCargo !== "todos" ||
    filtroUnidade !== "Todas" ||
    filtroStatus !== "todos" ||
    filtroRegional !== "Todas";

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 pb-8 animate-fade-in">
      <div className="max-w-5xl mx-auto px-1">
        <section className="mb-5">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 bg-pensi-yellow border border-black rounded-full" />
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-gray-500">
                  {ehRegional ? "Gestão regional" : "Gestão de acessos"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-none">
                Usuários<span className="text-pensi-yellow">.</span>
              </h1>
              <p className="text-xs text-gray-500 mt-2 max-w-xl leading-relaxed">
                Gerencie usuários, cargos e permissões.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
              {podeGerenciar && (
                <button
                  onClick={() => setIsCadastroOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-pensi-yellow border-2 border-black rounded-md text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Cadastrar usuário
                </button>
              )}
              <div className="bg-white border-2 border-black rounded-md px-3 py-2 shadow-[2px_2px_0px_#000]">
                <span className="block text-[8px] font-black uppercase tracking-widest text-gray-400">Total</span>
                <span className="text-lg font-black text-black tabular-nums">
                  {usersFiltrados.length.toString().padStart(2, "0")}
                </span>
              </div>
              <div className="bg-pensi-yellow border-2 border-black rounded-md px-3 py-2 shadow-[2px_2px_0px_#000]">
                <span className="block text-[8px] font-black uppercase tracking-widest text-black/60">Inativos</span>
                <span className="text-lg font-black text-black tabular-nums">
                  {totalInativos.toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-4 items-start">
          <aside className="bg-white border-2 border-black rounded-md shadow-[3px_3px_0px_#000] overflow-hidden">
            <div className="bg-[#171717] text-white px-3 py-3 flex items-center justify-between border-b-2 border-black">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-pensi-yellow" />
                <h2 className="text-[10px] font-black uppercase tracking-widest">Filtros</h2>
              </div>
            </div>
            <div className="p-3 space-y-4">
              {!ehRegional && (
                <>
                  <div>
                    <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                      <MapPin className="w-3 h-3" /> Regional
                    </label>
                    <select
                      value={filtroRegional}
                      onChange={(e) => { setFiltroRegional(e.target.value); setFiltroUnidade("Todas"); }}
                      className="w-full bg-gray-50 border-2 border-black rounded-md px-2.5 py-2 text-[11px] font-bold outline-none cursor-pointer"
                    >
                      {REGIONAIS_LIST.map((r) => (
                        <option key={r} value={r}>
                          {r === "Todas" ? "Todas as Regionais" : `Reg. ${r}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                      <Building2 className="w-3 h-3" /> Unidade
                    </label>
                    <select
                      value={filtroUnidade}
                      onChange={(e) => setFiltroUnidade(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-black rounded-md px-2.5 py-2 text-[11px] font-bold outline-none cursor-pointer"
                    >
                      {unidadesUnicas.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                  <ShieldCheck className="w-3 h-3" /> Cargo
                </label>
                <select
                  value={filtroCargo}
                  onChange={(e) => setFiltroCargo(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-black rounded-md px-2.5 py-2 text-[11px] font-bold outline-none cursor-pointer"
                >
                  <option value="todos">Todos os cargos</option>
                  {CARGOS_ATRIBUIVEIS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                  <Power className="w-3 h-3" /> Status
                </label>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-black rounded-md px-2.5 py-2 text-[11px] font-bold outline-none cursor-pointer"
                >
                  <option value="todos">Todos</option>
                  <option value="Ativo">Ativos</option>
                  <option value="Inativo">Inativos</option>
                </select>
              </div>
              <button
                onClick={limparFiltros}
                disabled={!temFiltrosAtivos}
                className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-black rounded-md text-[9px] font-black uppercase tracking-widest transition-all hover:bg-pensi-yellow disabled:opacity-40 disabled:cursor-not-allowed shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                <RotateCcw className="w-3 h-3" /> Limpar filtros
              </button>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="bg-white border-2 border-black rounded-md shadow-[3px_3px_0px_#000] p-3 mb-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou e-mail..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-black rounded-md pl-9 pr-3 py-2 text-xs font-medium outline-none placeholder:text-gray-400 focus:bg-pensi-yellow/20 transition-colors"
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setIsExportOpen(!isExportOpen)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-green-300 text-black border-2 border-black rounded-md text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:bg-green-400 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all w-full sm:w-auto"
                  >
                    <Download className="w-3.5 h-3.5" /> Exportar
                  </button>
                  {isExportOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsExportOpen(false)} />
                      <div className="absolute top-full mt-2 right-0 w-48 bg-white border-2 border-black rounded-md shadow-[3px_3px_0px_#000] z-50 overflow-hidden">
                        <button onClick={() => handleExportar("pdf")} className="w-full text-left px-3 py-2 text-[11px] font-bold flex items-center gap-2 hover:bg-pensi-yellow/40 border-b-2 border-black/10">
                          <FileText size={14} /> Exportar como PDF
                        </button>
                        <button onClick={() => handleExportar("excel")} className="w-full text-left px-3 py-2 text-[11px] font-bold flex items-center gap-2 hover:bg-pensi-yellow/40">
                          <FileSpreadsheet size={14} /> Exportar como Excel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3 h-3 text-gray-400" />
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Exibindo</span>
                  <span className="bg-pensi-yellow border border-black rounded-md px-1.5 py-0.5 text-[9px] font-black text-black">
                    {usersFiltrados.length}
                  </span>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                    de {usersVisiveis.length} usuários
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {usersPaginados.map((u) => {
                const todasUnidades = u.unidade.split(",").map((s) => s.trim()).filter(Boolean);
                const inativas = u.unidadesInativas || [];
                const temInativa = inativas.length > 0;
                const temAtiva = todasUnidades.some((uni) => !inativas.includes(uni));
                return (
                  <article key={u.id} className="bg-white border-2 border-black rounded-md shadow-[2px_2px_0px_#000] transition-all overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1 min-w-0 p-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-9 h-9 shrink-0 bg-pensi-yellow border-2 border-black rounded-md flex items-center justify-center text-sm font-black text-black shadow-[2px_2px_0px_#000]">
                            {u.nome.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h3 className="text-xs font-black text-black">{u.nome}</h3>
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 border border-black rounded-md text-[7px] font-black uppercase tracking-wider ${!temInativa ? "bg-green-300" : temAtiva ? "bg-yellow-300" : "bg-gray-200 text-gray-600"}`}>
                                {!temInativa ? "Ativo" : temAtiva ? "Parcial" : "Inativo"}
                              </span>
                            </div>
                            <span className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                              <Mail className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{u.email}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3 pt-2.5 border-t border-dashed border-gray-200">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] font-black uppercase text-gray-400">Cargos</span>
                            <div className="flex flex-wrap gap-1">
                              {u.cargos.map((c) => {
                                const info = CARGOS_ATRIBUIVEIS.find((cd) => cd.id === c);
                                return (
                                  <span key={c} className={`px-1.5 py-0.5 border border-black rounded-md text-[8px] font-black uppercase ${info?.cor || "bg-gray-200"}`}>
                                    {info?.label || c}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          <div className="hidden sm:block w-px h-4 bg-gray-200" />
                          <div className="flex flex-wrap items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {todasUnidades.map((uni) => (
                              <span key={uni} className={`text-[8px] font-bold px-1.5 py-0.5 rounded border border-black/20 ${inativas.includes(uni) ? "bg-red-100 text-red-700 line-through" : "bg-green-50 text-green-800"}`}>
                                {uni}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="md:w-[160px] shrink-0 bg-gray-50 border-t-2 md:border-t-0 md:border-l-2 border-black p-2.5 flex md:flex-col justify-between gap-2">
                        <div className="hidden md:block">
                          <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Gerenciar</span>
                        </div>
                        <div className="flex items-center md:items-stretch gap-1.5 md:flex-col">
                          <button
                            onClick={() => abrirStatus(u)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 border-2 border-black rounded-md text-[8px] font-black uppercase shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${!temInativa ? "bg-red-200" : "bg-green-300"}`}
                          >
                            {!temInativa ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                            Status
                          </button>
                          <button
                            onClick={() => setPerfilProfessor(u)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-blue-100 text-black border-2 border-black rounded-md text-[8px] font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-blue-200 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          >
                            <Eye className="w-3 h-3" /> Perfil
                          </button>
                          {podeGerenciar && (
                            <>
                              <button
                                onClick={() => abrirPermissoes(u)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white border-2 border-black rounded-md text-[8px] font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-pensi-yellow hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                              >
                                <ShieldCheck className="w-3 h-3" /> Permissões
                              </button>
                              <button
                                onClick={() => setDeleteUser(u)}
                                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-100 text-red-700 border-2 border-black rounded-md text-[8px] font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-red-200 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                              >
                                <Trash2 className="w-3 h-3" /> Excluir
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="h-1 bg-pensi-yellow" />
                  </article>
                );
              })}
            </div>

            {usersFiltrados.length > 0 && (
              <div className="flex items-center justify-center gap-1.5 mt-4">
                <button
                  onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                  disabled={paginaSegura === 1}
                  className="flex items-center justify-center w-7 h-7 border-2 border-black rounded-md bg-white shadow-[2px_2px_0px_#000] disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPaginaAtual(p)}
                    className={`w-7 h-7 flex items-center justify-center border-2 border-black rounded-md text-[10px] font-black shadow-[2px_2px_0px_#000] ${p === paginaSegura ? "bg-pensi-yellow text-black" : "bg-white"}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaSegura === totalPaginas}
                  className="flex items-center justify-center w-7 h-7 border-2 border-black rounded-md bg-white shadow-[2px_2px_0px_#000] disabled:opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ===================== MODAL STATUS (UNIDADES + TURMAS) ===================== */}
      {modalStatus && (() => {
        const turmasPorUnidade = parseTurmasPorUnidade(modalStatus.turmas);
        const unidadesDoUser = (modalStatus.unidade || "").split(",").map((s) => s.trim()).filter(Boolean);
        const unidadesVisiveis = unidadesDoUser.filter((uni) => {
          if (ehRegional) return (unidadesEscopo || []).includes(uni);
          return true;
        });

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border-2 border-black rounded-md shadow-[6px_6px_0px_#000] w-full max-w-lg max-h-[88vh] flex flex-col">
              <div className="bg-[#171717] text-white px-4 py-3 border-b-2 border-black flex items-center justify-between rounded-t-md shrink-0">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Status do usuário</span>
                  <p className="text-[10px] text-gray-400 mt-0.5">{modalStatus.nome}</p>
                </div>
                <button onClick={() => setModalStatus(null)} className="text-white hover:text-pensi-yellow">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1">
                <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                  Desmarque unidades ou turmas específicas em que <strong className="text-black">{modalStatus.nome}</strong> não deve ter acesso.
                </p>

                {unidadesVisiveis.length === 0 && (
                  <div className="text-center py-6 text-[11px] text-gray-500 italic">
                    Nenhuma unidade disponível para gerenciar.
                  </div>
                )}

                {unidadesVisiveis.map((uni) => {
                  const turmasDaUnidade = turmasPorUnidade[uni] || [];
                  const unidadeAtiva = !unidadesInativasTemp.includes(uni);
                  const turmasAtivas = turmasDaUnidade.filter(
                    (t) => !turmasInativasTemp.includes(chaveTurma(uni, t))
                  ).length;

                  return (
                    <div key={uni} className="mb-3 border-2 border-black rounded-md overflow-hidden">
                      <label className={`flex items-center gap-2.5 p-2.5 cursor-pointer transition-all ${unidadeAtiva ? "bg-green-50" : "bg-gray-50"}`}>
                        <input
                          type="checkbox"
                          checked={unidadeAtiva}
                          onChange={() => {
                            setUnidadesInativasTemp((prev) =>
                              prev.includes(uni) ? prev.filter((u) => u !== uni) : [...prev, uni]
                            );
                          }}
                          className="w-3.5 h-3.5 accent-black"
                        />
                        <MapPin className="w-3.5 h-3.5" />
                        <span className={`flex-1 text-[11px] font-black ${unidadeAtiva ? "text-black" : "text-gray-500"}`}>
                          {uni}
                        </span>
                        {turmasDaUnidade.length > 0 && (
                          <span className="text-[8px] font-bold text-gray-500">
                            {turmasAtivas}/{turmasDaUnidade.length} turmas
                          </span>
                        )}
                        <span className={`text-[8px] font-bold uppercase ${unidadeAtiva ? "text-green-700" : "text-red-500"}`}>
                          {unidadeAtiva ? "Ativa" : "Inativa"}
                        </span>
                      </label>

                      {turmasDaUnidade.length > 0 && (
                        <div className={`border-t-2 border-black p-2 space-y-1 ${unidadeAtiva ? "bg-white" : "bg-gray-100 opacity-60"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <GraduationCap className="w-3 h-3 text-gray-400" />
                              <span className="text-[8px] font-black uppercase text-gray-400">Turmas</span>
                            </div>
                            {unidadeAtiva && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTurmasInativasTemp((prev) =>
                                      prev.filter((c) => !turmasDaUnidade.some((t) => chaveTurma(uni, t) === c))
                                    );
                                  }}
                                  className="text-[8px] font-black uppercase text-green-700 hover:underline"
                                >
                                  Ativar todas
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTurmasInativasTemp((prev) => {
                                      const novas = new Set(prev);
                                      turmasDaUnidade.forEach((t) => novas.add(chaveTurma(uni, t)));
                                      return [...novas];
                                    });
                                  }}
                                  className="text-[8px] font-black uppercase text-red-600 hover:underline"
                                >
                                  Desativar todas
                                </button>
                              </div>
                            )}
                          </div>

                          {turmasDaUnidade.map((turma) => {
                            const chave = chaveTurma(uni, turma);
                            const turmaAtiva = !turmasInativasTemp.includes(chave);
                            return (
                              <label
                                key={chave}
                                className={`flex items-center gap-2 px-2 py-1.5 border rounded-md cursor-pointer ${turmaAtiva ? "border-gray-200 bg-white" : "border-gray-200 bg-gray-50"}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={turmaAtiva}
                                  disabled={!unidadeAtiva}
                                  onChange={() => {
                                    setTurmasInativasTemp((prev) =>
                                      prev.includes(chave)
                                        ? prev.filter((c) => c !== chave)
                                        : [...prev, chave]
                                    );
                                  }}
                                  className="w-3 h-3 accent-black"
                                />
                                <span className={`flex-1 text-[10px] font-bold ${turmaAtiva ? "text-black" : "text-gray-400 line-through"}`}>
                                  {turma}
                                </span>
                                {!turmaAtiva && (
                                  <span className="text-[7px] font-bold text-red-500 uppercase">off</span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {unidadesVisiveis.length > 0 && (
                  <div className="flex gap-2 mt-4 sticky bottom-0 bg-white pt-2">
                    <button
                      onClick={() => setModalStatus(null)}
                      className="flex-1 py-2 bg-white text-black text-[9px] font-black uppercase border-2 border-black rounded-md shadow-[2px_2px_0px_#000]"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmarMudancaStatus}
                      disabled={processando}
                      className="flex-1 py-2 bg-pensi-yellow text-black text-[9px] font-black uppercase border-2 border-black rounded-md shadow-[2px_2px_0px_#000] disabled:opacity-60"
                    >
                      {processando ? "Salvando..." : "Salvar alterações"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===================== MODAL PERMISSÕES ===================== */}
      {modalPermissoes && podeGerenciar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-black rounded-md shadow-[6px_6px_0px_#000] w-full max-w-sm">
            <div className="bg-[#171717] text-white px-4 py-3 border-b-2 border-black flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-wide">Permissões</h3>
              <button onClick={() => setModalPermissoes(null)} className="p-1.5 border border-white/30 rounded-md hover:bg-white/10">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4 space-y-1.5">
                {CARGOS_ATRIBUIVEIS.map((cargo) => (
                  <label
                    key={cargo.id}
                    className={`flex items-center gap-2.5 p-2.5 border-2 rounded-md cursor-pointer transition-all ${cargosTemp.includes(cargo.id) ? "border-black bg-pensi-yellow/20" : "border-gray-200"}`}
                  >
                    <input
                      type="checkbox"
                      checked={cargosTemp.includes(cargo.id)}
                      onChange={() =>
                        setCargosTemp((prev) =>
                          prev.includes(cargo.id)
                            ? prev.filter((c) => c !== cargo.id)
                            : [...prev, cargo.id]
                        )
                      }
                      className="w-3.5 h-3.5 accent-black"
                    />
                    <span className="flex-1 text-[11px] font-black text-black">{cargo.label}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={salvarCargos}
                disabled={processando}
                className="w-full py-2.5 bg-pensi-yellow text-black text-[10px] font-black uppercase border-2 border-black rounded-md shadow-[2px_2px_0px_#000]"
              >
                {processando ? "Salvando..." : "Salvar permissões"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL EXCLUIR ===================== */}
      {deleteUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-black rounded-md shadow-[6px_6px_0px_#000] w-full max-w-xs overflow-hidden">
            <div className="bg-red-300 px-4 py-3 border-b-2 border-black flex justify-between items-center">
              <span className="text-[9px] font-black uppercase">Ação permanente</span>
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <div className="p-5 text-center">
              <h3 className="text-base font-black uppercase text-black">Excluir usuário?</h3>
              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                Tem certeza que deseja excluir <strong className="text-black">{deleteUser.nome}</strong>?
              </p>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setDeleteUser(null)}
                  className="flex-1 py-2 bg-white text-black text-[9px] font-black uppercase border-2 border-black rounded-md shadow-[2px_2px_0px_#000]"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarExclusao}
                  disabled={processando}
                  className="flex-1 py-2 bg-red-400 text-black text-[9px] font-black uppercase border-2 border-black rounded-md shadow-[2px_2px_0px_#000]"
                >
                  {processando ? "Excluindo..." : "Sim, excluir"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {perfilProfessor && (
        <TeacherProfileModal user={perfilProfessor} onClose={() => setPerfilProfessor(null)} />
      )}

      {isCadastroOpen && (
        <CadastrarUsuario
          onClose={() => setIsCadastroOpen(false)}
          onSuccess={() => { setIsCadastroOpen(false); carregarUsers(); }}
          perfilAtivo={perfilAtivo}
          currentUser={currentUser}
          unidadesEscopo={unidadesEscopo}
        />
      )}
    </div>
  );
}