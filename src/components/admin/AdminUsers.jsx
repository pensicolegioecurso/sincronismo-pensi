import { useState, useMemo } from "react";
import {
  Search,
  ShieldCheck,
  Trash2,
  X,
  AlertCircle,
  MapPin,
  Download,
  Power,
  PowerOff,
  SlidersHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Mail,
  Phone,
  Building2,
  RotateCcw,
  FileText,
  FileSpreadsheet,
} from "lucide-react";

import { getRegionalDaUnidade } from "../../data/unidades";
import TeacherProfileModal from "./TeacherProfileModal";

const MOCK_USERS = [
  {
    id: 1,
    nome: "Teste 1",
    email: "teste1.com.br",
    cargos: ["professor"],
    unidade: "Icaraí 1",
    telefone: "(21) 99999-1111",
    status: "Ativo",
  },
  {
    id: 2,
    nome: "teste 2",
    email: "teste2@gmail.com.br",
    cargos: ["direcao", "professor"],
    unidade: "Flamengo",
    telefone: "(21) 99999-2222",
    status: "Ativo",
  },
  {
    id: 3,
    nome: "Teste 3",
    email: "teste3@pensi.com.br",
    cargos: ["admin", "nucleo"],
    unidade: "Matriz",
    telefone: "(21) 99999-3333",
    status: "Ativo",
  },
  {
    id: 4,
    nome: "teste 4",
    email: "teste4@pensi.com.br",
    cargos: ["professor"],
    unidade: "Tijuca 1",
    telefone: "(21) 99999-4444",
    status: "Inativo",
  },
  {
    id: 5,
    nome: "teste 5",
    email: "teste5.com.br",
    cargos: ["professor"],
    unidade: "Icaraí 1",
    telefone: "(21) 98888-5555",
    status: "Ativo",
  },
];

const CARGOS_DISPONIVEIS = [
  { id: "admin", label: "Admin", cor: "bg-red-300 text-black" },
  { id: "direcao", label: "Direção", cor: "bg-purple-300 text-black" },
  { id: "nucleo", label: "Núcleo", cor: "bg-blue-300 text-black" },
  { id: "professor", label: "Professor", cor: "bg-green-300 text-black" },
];

const REGIONAIS_LIST = ["Todas", "Beatriz", "Débora", "Paula"];
const POR_PAGINA = 10;

export default function AdminUsers({ unidadeFoco }) {
  const [users, setUsers] = useState(MOCK_USERS);
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
  const [perfilProfessor, setPerfilProfessor] = useState(null);

  const unidadesUnicas = useMemo(() => {
    let base = ["Todas", ...new Set(users.map((u) => u.unidade))];
    if (filtroRegional !== "Todas") {
      base = [
        "Todas",
        ...base
          .slice(1)
          .filter((u) => getRegionalDaUnidade(u) === filtroRegional),
      ];
    }
    return base;
  }, [users, filtroRegional]);

  const usersFiltrados = useMemo(() => {
    let lista = users;
    if (unidadeFoco) lista = lista.filter((u) => u.unidade === unidadeFoco);

    const filtrados = lista.filter((u) => {
      const matchBusca =
        u.nome.toLowerCase().includes(busca.toLowerCase()) ||
        u.email.toLowerCase().includes(busca.toLowerCase());
      const matchCargo =
        filtroCargo === "todos" || u.cargos.includes(filtroCargo);
      const matchUnidade = unidadeFoco
        ? true
        : filtroUnidade === "Todas" || u.unidade === filtroUnidade;

      let matchStatus = true;
      if (filtroStatus === "Ativo") matchStatus = u.status === "Ativo";
      else if (filtroStatus === "Inativo") matchStatus = u.status === "Inativo";
      else if (filtroStatus === "pendentes")
        matchStatus = (u.pendencias ?? 0) > 0;

      const matchRegional = unidadeFoco
        ? true
        : filtroRegional === "Todas" ||
          getRegionalDaUnidade(u.unidade) === filtroRegional;

      return (
        matchBusca && matchCargo && matchUnidade && matchStatus && matchRegional
      );
    });

    return filtrados.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [
    users,
    busca,
    filtroCargo,
    filtroUnidade,
    filtroStatus,
    filtroRegional,
    unidadeFoco,
  ]);

  useMemo(() => {
    setPaginaAtual(1);
  }, [busca, filtroCargo, filtroUnidade, filtroStatus, filtroRegional]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(usersFiltrados.length / POR_PAGINA)
  );
  const paginaSegura = Math.min(paginaAtual, totalPaginas);
  const inicio = (paginaSegura - 1) * POR_PAGINA;
  const usersPaginados = usersFiltrados.slice(inicio, inicio + POR_PAGINA);

  const totalInativos = users.filter((u) => u.status === "Inativo").length;

  const abrirPermissoes = (user) => {
    setModalPermissoes(user);
    setCargosTemp([...user.cargos]);
  };

  const salvarCargos = () => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === modalPermissoes.id ? { ...u, cargos: cargosTemp } : u
      )
    );
    setModalPermissoes(null);
  };

  const confirmarMudancaStatus = () => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === modalStatus.id
          ? { ...u, status: u.status === "Ativo" ? "Inativo" : "Ativo" }
          : u
      )
    );
    setModalStatus(null);
  };

  const confirmarExclusao = () => {
    setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
    setDeleteUser(null);
  };

  const handleExportar = (formato) => {
    const dadosExport = usersFiltrados.map((u) => ({
      Nome: u.nome,
      Email: u.email,
      Unidade: u.unidade,
      Telefone: u.telefone,
      Cargos: u.cargos.join(", "),
      Status: u.status,
    }));
    console.table(dadosExport);
    alert(
      `Exportando ${usersFiltrados.length} usuários para ${formato.toUpperCase()}.`
    );
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

  return (
    <div className="w-full min-w-0 pb-8 animate-fade-in">
      <div className="max-w-5xl mx-auto px-1">
        {/* CABEÇALHO */}
        <section className="mb-5">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 bg-pensi-yellow border border-black rounded-full" />
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-gray-500">
                  Gestão de acessos
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-none">
                {unidadeFoco ? "Professores" : "Usuários"}
                <span className="text-pensi-yellow">.</span>
              </h1>

              <p className="text-xs text-gray-500 mt-2 max-w-xl leading-relaxed">
                {unidadeFoco
                  ? `Visualize os professores vinculados à unidade ${unidadeFoco}.`
                  : "Gerencie os usuários, acompanhe os acessos e organize as permissões da plataforma."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
              <div className="bg-white border-2 border-black rounded-md px-3 py-2 shadow-[2px_2px_0px_#000]">
                <span className="block text-[8px] font-black uppercase tracking-widest text-gray-400">
                  Total cadastrado
                </span>
                <span className="text-lg font-black text-black tabular-nums">
                  {users.length.toString().padStart(2, "0")}
                </span>
              </div>

              <div className="bg-pensi-yellow border-2 border-black rounded-md px-3 py-2 shadow-[2px_2px_0px_#000]">
                <span className="block text-[8px] font-black uppercase tracking-widest text-black/60">
                  Total inativo
                </span>
                <span className="text-lg font-black text-black tabular-nums">
                  {totalInativos.toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-4 items-start">
          {/* FILTROS */}
          <aside className="bg-white border-2 border-black rounded-md shadow-[3px_3px_0px_#000] overflow-hidden">
            <div className="bg-[#171717] text-white px-3 py-3 flex items-center justify-between border-b-2 border-black">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-pensi-yellow" />
                <h2 className="text-[10px] font-black uppercase tracking-widest">
                  Filtros
                </h2>
              </div>
              <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400">
                Refinar
              </span>
            </div>

            <div className="p-3 space-y-4">
              {!unidadeFoco && (
                <>
                  <div>
                    <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                      <MapPin className="w-3 h-3" />
                      Regional
                    </label>
                    <select
                      value={filtroRegional}
                      onChange={(e) => {
                        setFiltroRegional(e.target.value);
                        setFiltroUnidade("Todas");
                      }}
                      className="w-full bg-gray-50 border-2 border-black rounded-md px-2.5 py-2 text-[11px] font-bold text-black outline-none focus:bg-pensi-yellow transition-colors cursor-pointer"
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
                      <Building2 className="w-3 h-3" />
                      Unidade
                    </label>
                    <select
                      value={filtroUnidade}
                      onChange={(e) => setFiltroUnidade(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-black rounded-md px-2.5 py-2 text-[11px] font-bold text-black outline-none focus:bg-pensi-yellow transition-colors cursor-pointer"
                    >
                      {unidadesUnicas.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                  <ShieldCheck className="w-3 h-3" />
                  Cargo
                </label>
                <select
                  value={filtroCargo}
                  onChange={(e) => setFiltroCargo(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-black rounded-md px-2.5 py-2 text-[11px] font-bold text-black outline-none focus:bg-pensi-yellow transition-colors cursor-pointer"
                >
                  <option value="todos">Todos os cargos</option>
                  {CARGOS_DISPONIVEIS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                  <Power className="w-3 h-3" />
                  Situação do acesso
                </label>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-black rounded-md px-2.5 py-2 text-[11px] font-bold text-black outline-none focus:bg-pensi-yellow transition-colors cursor-pointer"
                >
                  <option value="todos">Todos os status</option>
                  <option value="Ativo">Ativos</option>
                  <option value="Inativo">Inativos</option>
                  <option value="pendentes">Com pendências</option>
                </select>
              </div>

              <div className="pt-2.5 border-t-2 border-dashed border-gray-200">
                <button
                  onClick={limparFiltros}
                  disabled={!temFiltrosAtivos}
                  className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-black rounded-md text-[9px] font-black uppercase tracking-widest transition-all hover:bg-pensi-yellow disabled:opacity-40 disabled:cursor-not-allowed shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                  <RotateCcw className="w-3 h-3" />
                  Limpar filtros
                </button>
              </div>
            </div>
          </aside>

          {/* LISTAGEM */}
          <main className="min-w-0">
            {/* BARRA DE PESQUISA */}
            <div className="bg-white border-2 border-black rounded-md shadow-[3px_3px_0px_#000] p-3 mb-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou e-mail..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-black rounded-md pl-9 pr-3 py-2 text-xs font-medium text-black outline-none placeholder:text-gray-400 focus:bg-pensi-yellow/20 transition-colors"
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setIsExportOpen(!isExportOpen)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-green-300 text-black border-2 border-black rounded-md text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:bg-green-400 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all w-full sm:w-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Exportar
                  </button>

                  {isExportOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsExportOpen(false)}
                      />
                      <div className="absolute top-full mt-2 right-0 w-48 bg-white border-2 border-black rounded-md shadow-[3px_3px_0px_#000] z-50 overflow-hidden">
                        <button
                          onClick={() => handleExportar("pdf")}
                          className="w-full text-left px-3 py-2 text-[11px] font-bold flex items-center gap-2 hover:bg-pensi-yellow/40 border-b-2 border-black/10"
                        >
                          <FileText size={14} />
                          Exportar como PDF
                        </button>
                        <button
                          onClick={() => handleExportar("excel")}
                          className="w-full text-left px-3 py-2 text-[11px] font-bold flex items-center gap-2 hover:bg-pensi-yellow/40"
                        >
                          <FileSpreadsheet size={14} />
                          Exportar como Excel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3 h-3 text-gray-400" />
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                    Exibindo
                  </span>
                  <span className="bg-pensi-yellow border border-black rounded-md px-1.5 py-0.5 text-[9px] font-black text-black">
                    {usersFiltrados.length}
                  </span>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                    de {users.length} usuários
                  </span>
                </div>

                {temFiltrosAtivos && (
                  <button
                    onClick={limparFiltros}
                    className="text-[9px] font-black uppercase tracking-wider text-gray-500 hover:text-black underline underline-offset-2"
                  >
                    Remover filtros
                  </button>
                )}
              </div>
            </div>

            {/* CABEÇALHO DA LISTAGEM */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-black">
                  {unidadeFoco ? "Equipe da unidade" : "Todos os usuários"}
                </h2>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Consulte as informações e gerencie os acessos.
                </p>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                Lista de cadastros
              </span>
            </div>

            {/* LISTA DE USUÁRIOS */}
            <div className="space-y-2.5">
              {usersFiltrados.length === 0 && (
                <div className="bg-white border-2 border-black border-dashed rounded-md p-8 text-center">
                  <div className="w-11 h-11 bg-gray-100 border-2 border-black rounded-md flex items-center justify-center mx-auto mb-3">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <h3 className="text-xs font-black uppercase text-black">
                    Nenhum usuário encontrado
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    Não encontramos resultados com os filtros selecionados.
                  </p>
                  <button
                    onClick={limparFiltros}
                    className="mt-4 inline-flex items-center gap-1.5 bg-pensi-yellow border-2 border-black rounded-md px-3 py-1.5 text-[9px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Limpar pesquisa
                  </button>
                </div>
              )}

              {usersPaginados.map((u) => (
                <article
                  key={u.id}
                  className="bg-white border-2 border-black rounded-md shadow-[2px_2px_0px_#000] hover:shadow-[4px_4px_0px_#000] transition-all overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* IDENTIFICAÇÃO */}
                    <div className="flex-1 min-w-0 p-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 shrink-0 bg-pensi-yellow border-2 border-black rounded-md flex items-center justify-center text-sm font-black text-black shadow-[2px_2px_0px_#000]">
                          {u.nome.charAt(0)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h3 className="text-xs font-black text-black">
                              {u.nome}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 border border-black rounded-md text-[7px] font-black uppercase tracking-wider ${
                                u.status === "Ativo"
                                  ? "bg-green-300 text-black"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              <span
                                className={`w-1 h-1 rounded-full ${
                                  u.status === "Ativo"
                                    ? "bg-green-800"
                                    : "bg-gray-500"
                                }`}
                              />
                              {u.status}
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-3 gap-y-0.5 mt-1">
                            <span className="flex items-center gap-1 text-[10px] text-gray-500 min-w-0">
                              <Mail className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{u.email}</span>
                            </span>
                            {u.telefone && (
                              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                <Phone className="w-2.5 h-2.5 shrink-0" />
                                {u.telefone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* INFORMAÇÕES COMPLEMENTARES */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3 pt-2.5 border-t border-dashed border-gray-200">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-black uppercase tracking-wider text-gray-400">
                            Cargos
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {u.cargos.map((c) => {
                              const info = CARGOS_DISPONIVEIS.find(
                                (cd) => cd.id === c
                              );
                              return (
                                <span
                                  key={c}
                                  className={`px-1.5 py-0.5 border border-black rounded-md text-[8px] font-black uppercase tracking-wide ${
                                    info?.cor || "bg-gray-200 text-black"
                                  }`}
                                >
                                  {info?.label || c}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <div className="hidden sm:block w-px h-4 bg-gray-200" />

                        <div className="flex items-center gap-1 text-[9px] font-bold text-gray-600">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {u.unidade}
                        </div>
                      </div>
                    </div>

                    {/* AÇÕES */}
                    <div className="md:w-[160px] shrink-0 bg-gray-50 border-t-2 md:border-t-0 md:border-l-2 border-black p-2.5 flex md:flex-col justify-between gap-2">
                      <div className="hidden md:block">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                          Gerenciar
                        </span>
                      </div>

                      <div className="flex items-center md:items-stretch gap-1.5 md:flex-col">
                        {!unidadeFoco && (
                          <button
                            onClick={() => setModalStatus(u)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 border-2 border-black rounded-md text-[8px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${
                              u.status === "Ativo"
                                ? "bg-red-200 text-black"
                                : "bg-green-300 text-black"
                            }`}
                            title={u.status === "Ativo" ? "Inativar" : "Ativar"}
                          >
                            {u.status === "Ativo" ? (
                              <PowerOff className="w-3 h-3" />
                            ) : (
                              <Power className="w-3 h-3" />
                            )}
                            <span>
                              {u.status === "Ativo" ? "Inativar" : "Ativar"}
                            </span>
                          </button>
                        )}

                        {unidadeFoco ? (
                          <button
                            onClick={() => setPerfilProfessor(u)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-blue-200 text-black border-2 border-black rounded-md text-[8px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                            title="Ver Perfil"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Ver perfil</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => abrirPermissoes(u)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white text-black border-2 border-black rounded-md text-[8px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:bg-pensi-yellow hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                            title="Permissões"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Permissões</span>
                          </button>
                        )}

                        {!unidadeFoco && (
                          <button
                            onClick={() => setDeleteUser(u)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-100 text-red-700 border-2 border-black rounded-md text-[8px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:bg-red-200 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                            title="Excluir"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span className="md:hidden">Excluir</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="h-1 bg-pensi-yellow" />
                </article>
              ))}
            </div>

            {/* PAGINAÇÃO CENTRALIZADA — SÓ BOTÕES */}
            {usersFiltrados.length > 0 && (
              <div className="flex items-center justify-center gap-1.5 mt-4">
                <button
                  onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                  disabled={paginaSegura === 1}
                  className="flex items-center justify-center w-7 h-7 border-2 border-black rounded-md bg-white shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-[2px_2px_0px_#000] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPaginaAtual(p)}
                      className={`w-7 h-7 flex items-center justify-center border-2 border-black rounded-md text-[10px] font-black transition-all shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${
                        p === paginaSegura
                          ? "bg-pensi-yellow text-black"
                          : "bg-white text-black"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    setPaginaAtual((p) => Math.min(totalPaginas, p + 1))
                  }
                  disabled={paginaSegura === totalPaginas}
                  className="flex items-center justify-center w-7 h-7 border-2 border-black rounded-md bg-white shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-[2px_2px_0px_#000] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                  aria-label="Próxima página"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE STATUS */}
      {modalStatus && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-black rounded-md shadow-[6px_6px_0px_#000] w-full max-w-xs">
            <div className="bg-[#171717] text-white px-4 py-3 border-b-2 border-black flex items-center justify-between rounded-t-md">
              <span className="text-[9px] font-black uppercase tracking-widest">
                Alteração de acesso
              </span>
              <button
                onClick={() => setModalStatus(null)}
                className="text-white hover:text-pensi-yellow"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 text-center">
              <div
                className={`w-12 h-12 flex items-center justify-center mx-auto mb-4 border-2 border-black rounded-md shadow-[3px_3px_0px_#000] ${
                  modalStatus.status === "Ativo" ? "bg-red-200" : "bg-green-300"
                }`}
              >
                {modalStatus.status === "Ativo" ? (
                  <PowerOff className="w-6 h-6 text-black" />
                ) : (
                  <Power className="w-6 h-6 text-black" />
                )}
              </div>

              <h3 className="text-base font-black uppercase text-black">
                {modalStatus.status === "Ativo"
                  ? "Inativar usuário?"
                  : "Ativar usuário?"}
              </h3>

              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                Tem certeza que deseja{" "}
                {modalStatus.status === "Ativo" ? "inativar" : "ativar"} o
                acesso de{" "}
                <strong className="text-black">{modalStatus.nome}</strong>?
              </p>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setModalStatus(null)}
                  className="flex-1 py-2 bg-white text-black text-[9px] font-black uppercase tracking-wider border-2 border-black rounded-md shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarMudancaStatus}
                  className={`flex-1 py-2 text-black text-[9px] font-black uppercase tracking-wider border-2 border-black rounded-md shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${
                    modalStatus.status === "Ativo"
                      ? "bg-red-300"
                      : "bg-green-300"
                  }`}
                >
                  Sim, {modalStatus.status === "Ativo" ? "inativar" : "ativar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PERMISSÕES */}
      {modalPermissoes && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-black rounded-md shadow-[6px_6px_0px_#000] w-full max-w-sm overflow-hidden">
            <div className="bg-[#171717] text-white px-4 py-3 border-b-2 border-black flex justify-between items-center">
              <div>
                <span className="block text-[8px] font-black uppercase tracking-widest text-pensi-yellow">
                  Gerenciamento
                </span>
                <h3 className="font-black text-xs uppercase tracking-wide mt-0.5">
                  Permissões do usuário
                </h3>
              </div>
              <button
                onClick={() => setModalPermissoes(null)}
                className="p-1.5 border border-white/30 rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 border-2 border-black rounded-md mb-4">
                <div className="w-8 h-8 bg-pensi-yellow border-2 border-black rounded-md flex items-center justify-center font-black text-black text-xs">
                  {modalPermissoes.nome.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-black">
                    {modalPermissoes.nome}
                  </p>
                  <p className="text-[9px] text-gray-500 truncate">
                    {modalPermissoes.email}
                  </p>
                </div>
              </div>

              <div className="mb-2.5">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                  Selecione os cargos
                </h4>
                <p className="text-[9px] text-gray-400 mt-0.5">
                  O usuário poderá acumular mais de uma função.
                </p>
              </div>

              <div className="space-y-1.5">
                {CARGOS_DISPONIVEIS.map((cargo) => (
                  <label
                    key={cargo.id}
                    className={`flex items-center gap-2.5 p-2.5 border-2 rounded-md cursor-pointer transition-all ${
                      cargosTemp.includes(cargo.id)
                        ? "border-black bg-pensi-yellow/20 shadow-[2px_2px_0px_#000]"
                        : "border-gray-200 hover:border-black"
                    }`}
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
                    <span className="flex-1 text-[11px] font-black text-black">
                      {cargo.label}
                    </span>
                    {cargosTemp.includes(cargo.id) && (
                      <span className="text-[8px] font-black uppercase tracking-widest">
                        Selecionado
                      </span>
                    )}
                  </label>
                ))}
              </div>

              <button
                onClick={salvarCargos}
                className="w-full mt-4 py-2.5 bg-pensi-yellow text-black text-[10px] font-black uppercase tracking-widest border-2 border-black rounded-md shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Salvar permissões
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EXCLUSÃO */}
      {deleteUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-black rounded-md shadow-[6px_6px_0px_#000] w-full max-w-xs overflow-hidden">
            <div className="bg-red-300 px-4 py-3 border-b-2 border-black flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest">
                Atenção: ação permanente
              </span>
              <AlertCircle className="w-3.5 h-3.5" />
            </div>

            <div className="p-5 text-center">
              <div className="w-12 h-12 bg-red-100 border-2 border-black rounded-md shadow-[3px_3px_0px_#000] flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>

              <h3 className="text-base font-black uppercase text-black">
                Excluir usuário?
              </h3>

              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                Tem certeza que deseja excluir{" "}
                <strong className="text-black">{deleteUser.nome}</strong>? Esta
                ação não pode ser desfeita.
              </p>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setDeleteUser(null)}
                  className="flex-1 py-2 bg-white text-black text-[9px] font-black uppercase tracking-wider border-2 border-black rounded-md shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarExclusao}
                  className="flex-1 py-2 bg-red-400 text-black text-[9px] font-black uppercase tracking-wider border-2 border-black rounded-md shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  Sim, excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PERFIL DO PROFESSOR */}
      {perfilProfessor && (
        <TeacherProfileModal
          user={perfilProfessor}
          onClose={() => setPerfilProfessor(null)}
        />
      )}
    </div>
  );
}