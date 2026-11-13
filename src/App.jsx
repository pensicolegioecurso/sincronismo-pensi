import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./hooks/useAuth";
import Home from "./pages/Home";
import CalendarPage from "./pages/Calendar";
import Reports from "./pages/Reports";
import Header from "./components/home/Header";
import ProfileModal from "./components/ProfileModal";
import AdminDashboard from "./pages/AdminDashboard";
import DirectionDashboard from "./pages/DirectionDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Redefine from "./pages/Redefine";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import SeletorCargo from "./components/SeletorCargo";
import { parseTurmasPorUnidade, chaveTurma } from "./utils/turmas";

const CARGOS_VALIDOS = ["admin", "diretor", "direcao", "coordenador", "nucleo", "regional", "professor"];
const CARGOS_DIRECAO = ["diretor", "direcao", "coordenador"];
const CARGOS_ADMIN   = ["admin"];
const CARGOS_REGIONAL = ["regional"];
const CARGOS_NUCLEO  = ["nucleo"];
const CARGOS_PROF    = ["professor"];

const TELAS_COM_MODAL = ["home", "login", "register", "redefine", "auth", "auth-callback"];

function telaDoCargo(cargo) {
  if (CARGOS_ADMIN.includes(cargo)) return "admin";
  if (CARGOS_REGIONAL.includes(cargo)) return "admin";
  if (CARGOS_NUCLEO.includes(cargo)) return "admin";
  if (CARGOS_DIRECAO.includes(cargo)) return "direcao";
  return "professor";
}

function professorTemTurmaAtiva(user) {
  if (!user) return false;
  const mapa = parseTurmasPorUnidade(user.turmas || "");
  const inativasU = new Set(user.unidadesInativas || []);
  const inativasT = new Set(user.turmasInativas || []);
  return Object.entries(mapa).some(([uni, turmas]) => {
    if (inativasU.has(uni)) return false;
    return turmas.some((t) => !inativasT.has(chaveTurma(uni, t)));
  });
}

export default function App() {
  const { user, loading, perfilIncompleto } = useAuth();

  const [screen, setScreen] = useState(() => {
    const path = window.location.pathname.replace(/^\/+/, "");
    return path || "home";
  });

  const [profileOpen, setProfileOpen] = useState(false);
  const [calendarContext, setCalendarContext] = useState({
    disciplinaKey: null, ano: "2026", unidade: null, turma: null,
  });

  const [perfilAtivo, setPerfilAtivoState] = useState(null);
  const uidAtualRef = useRef(null);

  const setPerfilAtivo = useCallback((cargo) => setPerfilAtivoState(cargo), []);

  const navigate = useCallback((target, key, ano, unidade, turma) => {
    if (target === "calendar") {
      setCalendarContext({
        disciplinaKey: key, ano: ano || "2026",
        unidade: unidade || null, turma: turma || null,
      });
    }
    const path = target === "home" ? "/" : `/${target}`;
    window.history.pushState({}, "", path);
    setScreen(target);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/+/, "");
      setScreen(path || "home");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const uid = user?.uid || null;
    if (uidAtualRef.current !== uid) {
      uidAtualRef.current = uid;
      setPerfilAtivoState(null);
    }
  }, [user?.uid]);

  const cargosValidos = (user?.cargos || []).filter((c) => CARGOS_VALIDOS.includes(c));
  const temMultiplosCargos = cargosValidos.length > 1;
  const precisaEscolherCargo = !!user && !perfilAtivo && temMultiplosCargos;

  const ehSomenteProfessor = cargosValidos.length === 1 && cargosValidos[0] === "professor";
  const professorBloqueado = !!user && ehSomenteProfessor && !professorTemTurmaAtiva(user);

  const isGestorAdmin = () => ["admin", "regional", "nucleo"].includes(perfilAtivo);
  const isDirecao = () => CARGOS_DIRECAO.includes(perfilAtivo);
  const isProfessor = () => CARGOS_PROF.includes(perfilAtivo);

  useEffect(() => {
    if (loading || !user || !perfilIncompleto) return;
    if (precisaEscolherCargo) return;
    if (professorBloqueado) return;
    if (["professor", "admin", "direcao", "calendar", "reports"].includes(screen)) {
      navigate("register");
    }
  }, [loading, user, perfilIncompleto, screen, precisaEscolherCargo, professorBloqueado, navigate]);

  useEffect(() => {
    if (loading || !user || perfilIncompleto) return;
    if (precisaEscolherCargo) return;
    if (professorBloqueado) return;
    if (!perfilAtivo && cargosValidos.length === 1) {
      setPerfilAtivo(cargosValidos[0]);
      return;
    }
    if (!perfilAtivo) return;
    if (!TELAS_COM_MODAL.includes(screen)) return;
    navigate(telaDoCargo(perfilAtivo));
  }, [loading, user, perfilIncompleto, screen, perfilAtivo, cargosValidos.length, precisaEscolherCargo, professorBloqueado, navigate, setPerfilAtivo]);

  const handleSelecionarPerfil = (cargo) => {
    setPerfilAtivo(cargo);
    navigate(telaDoCargo(cargo));
  };

  const showHeader = !["login", "register", "redefine", "professor", "admin", "direcao", "calendar", "auth", "auth-callback"].includes(screen);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-black border-t-pensi-yellow rounded-full animate-spin" />
          <span className="text-[12px] font-medium text-gray-500">Carregando...</span>
        </div>
      </div>
    );
  }

  if (professorBloqueado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4">
        <div className="bg-white border-2 border-black rounded-md shadow-[6px_6px_0px_#000] max-w-md w-full p-6 text-center">
          <div className="w-14 h-14 bg-red-100 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-lg font-black uppercase text-black">Acesso desativado</h1>
          <p className="text-[12px] text-gray-600 mt-2 leading-relaxed">
            Sua conta de professor está sem unidades ou turmas ativas no momento.
            Entre em contato com a coordenação para reativar seu acesso.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 px-5 py-2.5 bg-pensi-yellow border-2 border-black rounded-md text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      {precisaEscolherCargo && (
        <SeletorCargo cargos={cargosValidos} onSelect={handleSelecionarPerfil} />
      )}

      {showHeader && (
        <Header onReports={() => navigate("reports")} onAdmin={() => navigate("admin")} onProfile={() => setProfileOpen(true)} />
      )}

      <main className="flex-1">
        {screen === "home" && (
          <Home onNavigate={navigate} onLogin={() => navigate("login")} onRegister={() => navigate("register")} />
        )}
        {screen === "professor" && isProfessor() && (
          <ProfessorDashboard onNavigate={navigate} perfilAtivo={perfilAtivo} />
        )}
        {screen === "login" && <Login onNavigate={navigate} />}
        {screen === "register" && <Register onNavigate={navigate} />}
        {screen === "redefine" && <Redefine onNavigate={navigate} />}
        {screen === "calendar" && (
          <CalendarPage
            disciplinaKey={calendarContext.disciplinaKey}
            ano={calendarContext.ano}
            unidadePreSelecionada={calendarContext.unidade}
            turmaPreSelecionada={calendarContext.turma}
            onBack={() => navigate(user ? "professor" : "home")}
          />
        )}
        {screen === "reports" && <Reports onBack={() => navigate("home")} />}
        {screen === "admin" && isGestorAdmin() && (
          <AdminDashboard onNavigate={navigate} perfilAtivo={perfilAtivo} />
        )}
        {screen === "direcao" && isDirecao() && (
          <DirectionDashboard onNavigate={navigate} perfilAtivo={perfilAtivo} />
        )}
        {screen === "admin" && !isGestorAdmin() && <AcessoNegado onVoltar={() => navigate("home")} />}
        {screen === "direcao" && !isDirecao() && <AcessoNegado onVoltar={() => navigate("home")} />}
        {screen === "professor" && !isProfessor() && <AcessoNegado onVoltar={() => navigate("home")} />}
      </main>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}

function AcessoNegado({ onVoltar }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
      <h1 className="text-2xl font-bold text-gray-900">Acesso Negado</h1>
      <button onClick={onVoltar} className="px-6 py-2 bg-pensi-yellow border-[2px] border-black rounded-lg font-bold shadow-[2px_2px_0px_0px_#000]">Voltar</button>
    </div>
  );
}