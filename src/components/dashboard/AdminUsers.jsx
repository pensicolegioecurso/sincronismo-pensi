import { useState, useEffect, useMemo, useRef } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

import { db } from "../../services/firebase";
import { useTurmas } from "../../hooks/useTurmas";
import { useUnidades } from "../../hooks/useUnidades";

import UsersHeader from "./users/UsersHeader";
import UsersList from "./users/UsersList";
import UsersPagination from "./users/UsersPagination";

import StatusModal from "./users/StatusModal";
import PermissionsModal from "./users/PermissionsModal";
import DeleteModal from "./users/DeleteModal";
import CadastrarUsuario from "./users/CadastrarUsuario";
import TeacherProfileModal from "./TeacherProfileModal";
import { ChatModal } from "../../features/chat/components/ChatModal";
import { useChatModal } from "../../features/chat/hooks/useChatModal";

const POR_PAGINA = 10;

function normalizarTexto(texto) {
  return String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function obterUnidades(usuario) {
  const unidade = Array.isArray(usuario.unidade) ? usuario.unidade : String(usuario.unidade || "").split(",");
  return [
    ...new Set(
      [...unidade, ...(usuario.unidadesComando || [])].map((u) => String(u).trim()).filter(Boolean)
    ),
  ];
}

function dataParaMs(valor) {
  if (!valor) return 0;
  if (typeof valor.toDate === "function") return valor.toDate().getTime();
  if (valor instanceof Date) return valor.getTime();
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

function obterStatus(usuario) {
  const cargos = usuario.cargos || [];

  if (cargos.includes("regional") || obterUnidades(usuario).length === 0) {
    return usuario.status || "Ativo";
  }

  const unidades = obterUnidades(usuario);
  const inativas = usuario.unidadesInativas || [];

  return unidades.some((u) => !inativas.includes(u)) ? "Ativo" : "Inativo";
}

export default function AdminUsers({
  unidadesEscopo,
  perfilAtivo,
  currentUser,
  onBack,
  onChat,
  onFamily,
  onProfileOpen,
  onDirects,
}) {
  const chat = useChatModal();
  const { todas: todasTurmasDb } = useTurmas();
  const { todasUnidades } = useUnidades();

  const [users, setUsers] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);

  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  // Estados dos filtros
  const [busca, setBusca] = useState("");
  const [filtroCargo, setFiltroCargo] = useState("todos");
  const [filtroUnidade, setFiltroUnidade] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroRegional, setFiltroRegional] = useState([]);

  const [paginaAtual, setPaginaAtual] = useState(1);

  const [modalPermissoes, setModalPermissoes] = useState(null);
  const [modalStatus, setModalStatus] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [perfilProfessor, setPerfilProfessor] = useState(null);

  const isAdminOrNucleo = ["admin", "nucleo"].includes(perfilAtivo);
  const podeGerenciar = ["admin", "nucleo", "regional"].includes(perfilAtivo);
  const ehRegional = perfilAtivo === "regional";
  const ehDirecao = ["diretor", "coordenador"].includes(perfilAtivo);

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
          cargos: Array.isArray(data.cargos) ? data.cargos : ["professor"],
          unidade: data.unidade || "",
          unidadesComando: data.unidadesComando || [],
          unidadesInativas: data.unidadesInativas || [],
          turmasInativas: data.turmasInativas || [],
          turmas: data.turmas || "",
          disciplinas: data.disciplinas || [],
          series: data.series || "",
          status: data.status || "Ativo",
          criadoEm: data.criadoEm,
          criadoEmMs: dataParaMs(data.criadoEm),
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

  const regionaisDisponiveis = useMemo(() => {
    return users
      .filter((u) => u.cargos.includes("regional"))
      .map((u) => ({ id: u.id, nome: u.nome, unidades: u.unidadesComando || [] }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [users]);

  const cargosDisponiveis = useMemo(() => {
    return [...new Set(users.filter((u) => !u.cargos.includes("admin")).flatMap((u) => u.cargos || []))].sort(
      (a, b) => a.localeCompare(b, "pt-BR")
    );
  }, [users]);

  const usersVisiveis = useMemo(() => {
    return users.filter((u) => {
      if (u.cargos.includes("admin")) return false;
      if (currentUser && u.id === currentUser.uid) return false;

      if (ehDirecao || ehRegional) {
        if (ehDirecao && !u.cargos.includes("professor")) return false;

        const unidadesDoUser = obterUnidades(u);
        if (!unidadesDoUser.some((uni) => (unidadesEscopo || []).includes(uni))) return false;
      }

      return true;
    });
  }, [users, ehRegional, ehDirecao, unidadesEscopo, currentUser]);

  const unidadesUnicas = useMemo(() => {
    let unidades = usersVisiveis.flatMap(obterUnidades);

    if (filtroRegional.length > 0) {
      const permitidas = regionaisDisponiveis
        .filter((r) => filtroRegional.includes(r.id))
        .flatMap((r) => r.unidades || []);
      unidades = unidades.filter((u) => permitidas.includes(u));
    }

    return [...new Set(unidades)].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [usersVisiveis, filtroRegional, regionaisDisponiveis]);

  const usersFiltrados = useMemo(() => {
    const termoBusca = normalizarTexto(busca);

    return usersVisiveis
      .filter((u) => {
        const matchBusca =
          normalizarTexto(u.nome).includes(termoBusca) || normalizarTexto(u.email).includes(termoBusca);

        const matchCargo = filtroCargo === "todos" || u.cargos.includes(filtroCargo);

        const unidadesDoUser = obterUnidades(u);
        const matchUnidade =
          filtroUnidade.length === 0 || unidadesDoUser.some((uni) => filtroUnidade.includes(uni));

        const matchStatus = filtroStatus === "todos" || obterStatus(u) === filtroStatus;

        let matchRegional = true;
        if (filtroRegional.length > 0) {
          const unidadesRegionais = regionaisDisponiveis
            .filter((r) => filtroRegional.includes(r.id))
            .flatMap((r) => r.unidades || []);
          matchRegional =
            filtroRegional.includes(u.id) || unidadesDoUser.some((uni) => unidadesRegionais.includes(uni));
        }

        return matchBusca && matchCargo && matchUnidade && matchStatus && matchRegional;
      })
      .sort((a, b) => b.criadoEmMs - a.criadoEmMs || a.nome.localeCompare(b.nome, "pt-BR"));
  }, [usersVisiveis, busca, filtroCargo, filtroUnidade, filtroStatus, filtroRegional, regionaisDisponiveis]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroCargo, filtroUnidade, filtroStatus, filtroRegional]);

  useEffect(() => {
    if (filtroUnidade.some((u) => !unidadesUnicas.includes(u))) {
      setFiltroUnidade((atual) => atual.filter((u) => unidadesUnicas.includes(u)));
    }
  }, [unidadesUnicas, filtroUnidade]);

  const totalPaginas = Math.max(1, Math.ceil(usersFiltrados.length / POR_PAGINA));
  const paginaSegura = Math.min(paginaAtual, totalPaginas);
  const inicio = (paginaSegura - 1) * POR_PAGINA;
  const usersPaginados = usersFiltrados.slice(inicio, inicio + POR_PAGINA);

  const totalInativos = usersVisiveis.filter((u) => obterStatus(u) === "Inativo").length;
  const totalAtivos = usersVisiveis.length - totalInativos;

  const confirmarMudancaStatus = async (unidadesInativas, turmasInativas) => {
    setProcessando(true);
    try {
      await updateDoc(doc(db, "users", modalStatus.id), { unidadesInativas, turmasInativas });
      setUsers((prev) =>
        prev.map((u) => (u.id === modalStatus.id ? { ...u, unidadesInativas, turmasInativas } : u))
      );
      setModalStatus(null);
    } catch {
      alert("Erro ao mudar status.");
    } finally {
      setProcessando(false);
    }
  };

  const confirmarCargos = async (cargosFinais) => {
    setProcessando(true);
    try {
      await updateDoc(doc(db, "users", modalPermissoes.id), { cargos: cargosFinais });
      setUsers((prev) => prev.map((u) => (u.id === modalPermissoes.id ? { ...u, cargos: cargosFinais } : u)));
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

  const adicionarUnidade = async (userId, novasUnidades, novaStringTurmas) => {
    try {
      await updateDoc(doc(db, "users", userId), { unidade: novasUnidades, turmas: novaStringTurmas });

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, unidade: novasUnidades, turmas: novaStringTurmas } : u))
      );

      setModalStatus((prev) =>
        prev ? { ...prev, unidade: novasUnidades, turmas: novaStringTurmas } : prev
      );
    } catch {
      alert("Erro ao adicionar unidade.");
    }
  };

  // Removi aquele `if (carregando) return <Loader />` que travava a tela inteira

  return (
    <div className="w-full min-w-0 pb-10 animate-fade-in bg-gray-50/30 min-h-screen">
      <div className="mx-auto max-w-5xl">
        
        <UsersHeader
          user={currentUser} 
          busca={busca} setBusca={setBusca}
          onBack={onBack || (() => window.history.back())}
          onChat={onChat || chat.abrir}
          onFamily={onFamily}
          onProfileOpen={onProfileOpen}
          onDirects={onDirects}
          filtroCargo={filtroCargo} setFiltroCargo={setFiltroCargo}
          filtroStatus={filtroStatus} setFiltroStatus={setFiltroStatus}
          filtroRegional={filtroRegional} setFiltroRegional={setFiltroRegional}
          filtroUnidade={filtroUnidade} setFiltroUnidade={setFiltroUnidade}
          regionaisDisponiveis={regionaisDisponiveis}
          unidadesDisponiveis={unidadesUnicas}
          cargosDisponiveis={cargosDisponiveis}
        />

        <UsersList
          carregando={carregando} // Passando para exibir o Skeleton
          users={usersPaginados}
          totalFiltrado={usersFiltrados.length}
          totalGeral={usersVisiveis.length}
          ativos={totalAtivos}
          inativos={totalInativos}
          podeGerenciar={podeGerenciar}
          ehDirecao={ehDirecao}
          onOpenStatus={setModalStatus}
          onOpenPermissions={setModalPermissoes}
          onOpenProfile={setPerfilProfessor}
          onDelete={setDeleteUser}
        />

        {/* Paginação só aparece se não estiver carregando */}
        {!carregando && (
          <UsersPagination
            paginaAtual={paginaSegura}
            setPaginaAtual={setPaginaAtual}
            totalPaginas={totalPaginas}
            total={usersFiltrados.length}
          />
        )}
      </div>

      {modalStatus && (
        <StatusModal
          user={modalStatus}
          ehRegional={ehRegional}
          perfilAtivo={perfilAtivo}
          unidadesEscopo={unidadesEscopo}
          todasTurmasDb={todasTurmasDb}
          todasUnidades={todasUnidades}
          processando={processando}
          onClose={() => setModalStatus(null)}
          onSave={confirmarMudancaStatus}
          onAddUnit={adicionarUnidade}
        />
      )}

      {modalPermissoes && podeGerenciar && (
        <PermissionsModal
          user={modalPermissoes}
          processando={processando}
          onClose={() => setModalPermissoes(null)}
          onSave={confirmarCargos}
        />
      )}

      {deleteUser && (
        <DeleteModal
          user={deleteUser}
          processando={processando}
          onClose={() => setDeleteUser(null)}
          onConfirm={confirmarExclusao}
        />
      )}

      {perfilProfessor && <TeacherProfileModal user={perfilProfessor} onClose={() => setPerfilProfessor(null)} />}

      {isCadastroOpen && (
        <CadastrarUsuario
          onClose={() => setIsCadastroOpen(false)}
          onSuccess={() => {
            setIsCadastroOpen(false);
            carregarUsers();
          }}
          perfilAtivo={perfilAtivo}
          unidadesEscopo={unidadesEscopo}
        />
      )}
      <ChatModal aberto={chat.aberto} onClose={chat.fechar} />
    </div>
  );
}
