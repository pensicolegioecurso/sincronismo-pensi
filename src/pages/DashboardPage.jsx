
// src/pages/DashboardPage.jsx
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import ProfileModal from "../components/ProfileModal";
import AdminOverview from "../components/dashboard/AdminOverview";
import AdminUsers from "../components/dashboard/AdminUsers";
import TurmasAdmin from "../components/dashboard/TurmasAdmin";
import StartTab from "../components/dashboard/StartTab";
import FeedTab from "../components/dashboard/FeedTab";
import { ArrowUp } from "lucide-react";

const DIRECTION_ROLES = ["diretor", "direcao", "coordenador"];
const ADMIN_MANAGER_ROLES = ["admin", "nucleo", "regional"];

export default function DashboardPage({ onNavigate, perfilAtivo }) {
  const { user, logout } = useAuth();
  const isTeacher = perfilAtivo === "professor";
  const [activeTab, setActiveTab] = useState(isTeacher ? "inicio" : "dashboard");
  const [profileOpen, setProfileOpen] = useState(false);

  const isAdmin = perfilAtivo === "admin";
  const isNucleo = perfilAtivo === "nucleo";
  const isRegional = perfilAtivo === "regional";
  const isDirection = DIRECTION_ROLES.includes(perfilAtivo);
  const isManager = ADMIN_MANAGER_ROLES.includes(perfilAtivo) || isDirection;

  let unidadesEscopo = null;
  let unidadeFoco = null;

  if (isRegional) {
    unidadesEscopo = user?.unidadesComando || [];
  } else if (isDirection) {
    unidadesEscopo = (user?.unidade || "")
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);
    unidadeFoco = unidadesEscopo[0] || "Todas";
  } else if (isTeacher) {
    unidadeFoco = user?.unidade?.split(",")[0]?.trim() || null;
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans text-gray-800 relative pb-28">
      <main className="relative z-10 flex-1 w-full max-w-[1100px] mx-auto px-4 pt-4">
        {isManager && activeTab === "dashboard" && (
          <AdminOverview
            unidadeFoco={unidadeFoco}
            unidadesEscopo={unidadesEscopo}
          />
        )}

        {isManager && activeTab === "usuarios" && (
          <AdminUsers
            unidadesEscopo={unidadesEscopo}
            perfilAtivo={perfilAtivo}
            currentUser={user}
          />
        )}

        {isManager && activeTab === "turmas" && (
          <TurmasAdmin />
        )}

        {isTeacher && activeTab === "inicio" && (
          <StartTab onNavigate={onNavigate} />
        )}

        {activeTab === "feed" && (
          <FeedTab
            user={user}
            unidadeFoco={unidadeFoco}
            unidadesEscopo={unidadesEscopo}
          />
        )}
      </main>

      {isTeacher && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-28 right-6 z-50 p-3 bg-white border-[2px] border-black text-gray-900 rounded-full shadow-[3px_3px_0px_0px_#000] hover:-translate-y-1 hover:bg-gray-50 transition-all animate-fade-in"
        >
          <ArrowUp className="w-5 h-5" strokeWidth={3} />
        </button>
      )}

      <DashboardNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onProfileOpen={() => setProfileOpen(true)}
        logout={logout}
        isAdmin={isAdmin}
        isNucleo={isNucleo}
        isDirecao={isRegional || isDirection}
      />

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}
