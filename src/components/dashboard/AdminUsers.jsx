
import { useState, useEffect, useMemo } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "../../services/firebase";
import { useTurmas } from "../../hooks/useTurmas";
import { useUnidades } from "../../hooks/useUnidades";

import { Loader2, Search } from "lucide-react";

import UsersHeader from "./users/UsersHeader";
import UsersFilters from "./users/UsersFilters";
import UsersList from "./users/UsersList";
import UsersPagination from "./users/UsersPagination";

import StatusModal from "./users/StatusModal";
import PermissionsModal from "./users/PermissionsModal";
import DeleteModal from "./users/DeleteModal";
import CadastrarUsuario from "./users/CadastrarUsuario";
import TeacherProfileModal from "./TeacherProfileModal";

const POR_PAGINA = 10;

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function obterUnidades(usuario) {
  const unidade = Array.isArray(usuario.unidade)
    ? usuario.unidade
    : String(usuario.unidade || "").split(",");

  return [
    ...new Set([
      ...unidade,
      ...(usuario.unidadesComando || []),
    ].map((u) => String(u).trim()).filter(Boolean)),
  ];
}

function obterStatus(usuario) {
  const cargos = usuario.cargos || [];

  if (cargos.includes("regional") || obterUnidades(usuario).length === 0) {
    return usuario.status || "Ativo";
  }

  const unidades = obterUnidades(usuario);
  const inativas = usuario.unidadesInativas || [];

  return unidades.some((u) => !inativas.includes(u))
    ? "Ativo"
    : "Inativo";
}

export default function AdminUsers({
  unidadesEscopo,
  perfilAtivo,
  currentUser,
}) {
  const { todas: todasTurmasDb } = useTurmas();
  const { todasUnidades } = useUnidades();

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

  const [modalPermissoes, setModalPermissoes] = useState(null);
  const [modalStatus, setModalStatus] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [perfilProfessor, setPerfilProfessor] = useState(null);

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
          cargos: Array.isArray(data.cargos)
            ? data.cargos
            : ["professor"],
          unidade: data.unidade || "",
          unidadesComando: data.unidadesComando || [],
          unidadesInativas: data.unidadesInativas || [],
          turmasInativas: data.turmasInativas || [],
          turmas: data.turmas || "",
          disciplinas: data.disciplinas || [],
          series: data.series || "",
          status: data.status || "Ativo",
          criadoEm: data.criadoEm,
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
      .map((u) => ({
        id: u.id,
        nome: u.nome,
        unidades: u.unidadesComando || [],
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [users]);

  const cargosDisponiveis = useMemo(() => {
    return [
      ...new Set(
        users
          .filter((u) => !u.cargos.includes("admin"))
          .flatMap((u) => u.cargos || [])
      ),
    ].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [users]);

  const usersVisiveis = useMemo(() => {
    return users.filter((u) => {
      if (u.cargos.includes("admin")) return false;
      if (currentUser && u.id === currentUser.uid) return false;

      if (ehDirecao || ehRegional) {
        if (ehDirecao && !u.cargos.includes("professor")) {
          return false;
        }

        const unidadesDoUser = obterUnidades(u);

        if (
          !unidadesDoUser.some((uni) =>
            (unidadesEscopo || []).includes(uni)
          )
        ) {
          return false;
        }
      }

      return true;
    });
  }, [users, ehRegional, ehDirecao, unidadesEscopo, currentUser]);

  const unidadesUnicas = useMemo(() => {
    let unidades = usersVisiveis.flatMap(obterUnidades);

    if (filtroRegional !== "Todas") {
      const regional = regionaisDisponiveis.find(
        (r) => r.id === filtroRegional
      );

      unidades = unidades.filter((u) =>
        (regional?.unidades || []).includes(u)
      );
    }

    return [
      "Todas",
      ...new Set(unidades),
    ].sort((a, b) => {
      if (a === "Todas") return -1;
      if (b === "Todas") return 1;
      return a.localeCompare(b, "pt-BR");
    });
  }, [usersVisiveis, filtroRegional, regionaisDisponiveis]);

  const usersFiltrados = useMemo(() => {
    const termoBusca = normalizarTexto(busca);

    return usersVisiveis.filter((u) => {
      const matchBusca =
        normalizarTexto(u.nome).includes(termoBusca) ||
        normalizarTexto(u.email).includes(termoBusca);

      const matchCargo =
        filtroCargo === "todos" ||
        u.cargos.includes(filtroCargo);

      const unidadesDoUser = obterUnidades(u);

      const matchUnidade =
        filtroUnidade === "Todas" ||
        unidadesDoUser.includes(filtroUnidade);

      const matchStatus =
        filtroStatus === "todos" ||
        obterStatus(u) === filtroStatus;

      let matchRegional = true;

      if (filtroRegional !== "Todas") {
        const regional = regionaisDisponiveis.find(
          (r) => r.id === filtroRegional
        );

        const unidadesRegionais = regional?.unidades || [];

        matchRegional =
          u.id === filtroRegional ||
          unidadesDoUser.some((uni) =>
            unidadesRegionais.includes(uni)
          );
      }

      return (
        matchBusca &&
        matchCargo &&
        matchUnidade &&
        matchStatus &&
        matchRegional
      );
    }).sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR")
    );
  }, [
    usersVisiveis,
    busca,
    filtroCargo,
    filtroUnidade,
    filtroStatus,
    filtroRegional,
    regionaisDisponiveis,
  ]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroCargo, filtroUnidade, filtroStatus, filtroRegional]);

  useEffect(() => {
    if (
      filtroUnidade !== "Todas" &&
      !unidadesUnicas.includes(filtroUnidade)
    ) {
      setFiltroUnidade("Todas");
    }
  }, [unidadesUnicas, filtroUnidade]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(usersFiltrados.length / POR_PAGINA)
  );

  const paginaSegura = Math.min(paginaAtual, totalPaginas);
  const inicio = (paginaSegura - 1) * POR_PAGINA;

  const usersPaginados = usersFiltrados.slice(
    inicio,
    inicio + POR_PAGINA
  );

  const totalInativos = usersVisiveis.filter(
    (u) => obterStatus(u) === "Inativo"
  ).length;

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

  const confirmarMudancaStatus = async (
    unidadesInativas,
    turmasInativas
  ) => {
    setProcessando(true);

    try {
      await updateDoc(doc(db, "users", modalStatus.id), {
        unidadesInativas,
        turmasInativas,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === modalStatus.id
            ? { ...u, unidadesInativas, turmasInativas }
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

  const confirmarCargos = async (cargosFinais) => {
    setProcessando(true);

    try {
      await updateDoc(doc(db, "users", modalPermissoes.id), {
        cargos: cargosFinais,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === modalPermissoes.id
            ? { ...u, cargos: cargosFinais }
            : u
        )
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

      setUsers((prev) =>
        prev.filter((u) => u.id !== deleteUser.id)
      );

      setDeleteUser(null);
    } catch {
      alert("Erro ao excluir usuário.");
    } finally {
      setProcessando(false);
    }
  };

  const adicionarUnidade = async (
    userId,
    novasUnidades,
    novaStringTurmas
  ) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        unidade: novasUnidades,
        turmas: novaStringTurmas,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                unidade: novasUnidades,
                turmas: novaStringTurmas,
              }
            : u
        )
      );

      setModalStatus((prev) =>
        prev
          ? {
              ...prev,
              unidade: novasUnidades,
              turmas: novaStringTurmas,
            }
          : prev
      );
    } catch {
      alert("Erro ao adicionar unidade.");
    }
  };

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-gray-400" />
        <p className="text-sm font-bold uppercase tracking-wider text-gray-500">
          Carregando usuários...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 pb-8 animate-fade-in">
      <div className="w-full min-w-0 px-1">
        <UsersHeader
          ehRegional={ehRegional}
          ehDirecao={ehDirecao}
          total={usersFiltrados.length}
          inativos={totalInativos}
        />

        <section className="mb-6 w-full rounded-lg border-2 border-black bg-white px-4 py-4 shadow-[3px_3px_0px_#000]">
          <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
            <div className="min-w-[200px] flex-[1.2]">
              <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-gray-500">
                Buscar usuário
              </label>

              <div className="flex h-9 items-center gap-2 border-b border-gray-300 px-1 transition-colors focus-within:border-black">
                <Search size={15} className="shrink-0 text-gray-400" />

                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Nome ou e-mail..."
                  className="h-full w-full min-w-0 bg-transparent text-[11px] font-medium text-gray-700 outline-none placeholder:text-gray-400"
                />
              </div>

              <p className="mt-2 text-[9px] font-medium text-gray-400">
                Exibindo{" "}
                <span className="font-bold text-gray-700">
                  {usersFiltrados.length}
                </span>{" "}
                de {usersVisiveis.length} usuários
              </p>
            </div>

            <div className="min-w-0 flex-[2.8]">
              <UsersFilters
                ehRegional={ehRegional}
                ehDirecao={ehDirecao}
                filtroRegional={filtroRegional}
                setFiltroRegional={setFiltroRegional}
                filtroUnidade={filtroUnidade}
                setFiltroUnidade={setFiltroUnidade}
                filtroCargo={filtroCargo}
                setFiltroCargo={setFiltroCargo}
                filtroStatus={filtroStatus}
                setFiltroStatus={setFiltroStatus}
                regionaisDisponiveis={regionaisDisponiveis}
                cargosDisponiveis={cargosDisponiveis}
                unidadesUnicas={unidadesUnicas}
                limparFiltros={limparFiltros}
                temFiltrosAtivos={temFiltrosAtivos}
              />
            </div>
          </div>
        </section>

        <main className="w-full min-w-0">
          <UsersList
            users={usersPaginados}
            podeGerenciar={podeGerenciar}
            ehDirecao={ehDirecao}
            onOpenCadastro={() => setIsCadastroOpen(true)}
            onOpenStatus={setModalStatus}
            onOpenPermissions={setModalPermissoes}
            onOpenProfile={setPerfilProfessor}
            onDelete={setDeleteUser}
          />

          <UsersPagination
            paginaAtual={paginaSegura}
            setPaginaAtual={setPaginaAtual}
            totalPaginas={totalPaginas}
            total={usersFiltrados.length}
          />
        </main>
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

      {perfilProfessor && (
        <TeacherProfileModal
          user={perfilProfessor}
          onClose={() => setPerfilProfessor(null)}
        />
      )}

      {isCadastroOpen && (
        <CadastrarUsuario
          onClose={() => setIsCadastroOpen(false)}
          onSuccess={() => {
            setIsCadastroOpen(false);
            carregarUsers();
          }}
          perfilAtivo={perfilAtivo}
          currentUser={currentUser}
          unidadesEscopo={unidadesEscopo}
        />
      )}
    </div>
  );
}
