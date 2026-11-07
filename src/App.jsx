import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import Home from "./pages/Home";
import CalendarPage from "./pages/Calendar";
import Reports from "./pages/Reports";
import Header from "./components/Header";
import ProfileModal from "./components/ProfileModal";
import AdminDashboard from "./pages/AdminDashboard";
import DirectionDashboard from "./pages/DirectionDashboard"; // Import nova página
import Login from "./pages/Login";
import Register from "./pages/Register";
import Redefine from "./pages/Redefine";
import ProfessorDashboard from "./pages/ProfessorDashboard";

export default function App() {
  const { user } = useAuth();
  
  const [screen, setScreen] = useState(() => {
    const path = window.location.pathname.replace("/", "");
    return path || "home";
  });
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [calendarContext, setCalendarContext] = useState({ disciplinaKey: null, ano: "2026" });

  const navigate = (target, key, ano) => {
    if (target === "calendar") {
      setCalendarContext({ disciplinaKey: key, ano: ano || "2026" });
    }
    const path = target === "home" ? "/" : `/${target}`;
    window.history.pushState({}, "", path);
    setScreen(target);
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace("/", "");
      setScreen(path || "home");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Verificações de Permissão
  const isAdmin = () => {
    if (!user) return false;
    return user.cargos?.includes("admin") || user.cargo === "admin";
  };

  const isDirecao = () => {
    if (!user) return false;
    return user.cargos?.includes("direcao") || user.cargo === "direcao";
  };

  const showHeader = !["login", "register", "redefine", "professor", "admin", "direcao", "calendar"].includes(screen);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      {showHeader && (
        <Header
          onReports={() => navigate("reports")}
          onAdmin={() => navigate("admin")}
          onProfile={() => setProfileOpen(true)}
        />
      )}

      <main className="flex-1">
        {screen === "home" && (
          <Home
            onNavigate={navigate}
            onLogin={() => navigate("login")}
            onRegister={() => navigate("register")}
          />
        )}

        {screen === "professor" && <ProfessorDashboard onNavigate={navigate} />}
        {screen === "login" && <Login onNavigate={navigate} />}
        {screen === "register" && <Register onNavigate={navigate} />}
        {screen === "redefine" && <Redefine onNavigate={navigate} />}

        {screen === "calendar" && (
          <CalendarPage
            disciplinaKey={calendarContext.disciplinaKey}
            ano={calendarContext.ano}
            onBack={() => navigate(user ? "professor" : "home")}
          />
        )}

        {screen === "reports" && <Reports onBack={() => navigate("home")} />}

        {/* Rotas Protegidas */}
        {screen === "admin" && isAdmin() && (
          <AdminDashboard onNavigate={navigate} />
        )}

        {screen === "direcao" && isDirecao() && (
          <DirectionDashboard onNavigate={navigate} />
        )}
        
        {/* Bloqueio de Acesso */}
        {screen === "admin" && !isAdmin() && (
          <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Acesso Negado</h1>
            <button onClick={() => navigate("home")} className="px-6 py-2 bg-pensi-yellow border-[2px] border-black rounded-lg font-bold shadow-[2px_2px_0px_0px_#000]">Voltar</button>
          </div>
        )}

        {screen === "direcao" && !isDirecao() && (
          <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Acesso Negado</h1>
            <button onClick={() => navigate("home")} className="px-6 py-2 bg-pensi-yellow border-[2px] border-black rounded-lg font-bold shadow-[2px_2px_0px_0px_#000]">Voltar</button>
          </div>
        )}
      </main>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}