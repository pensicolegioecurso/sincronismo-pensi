import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import ProfileModal from "../components/ProfileModal";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import AdminOverview from "../components/admin/AdminOverview";
import AdminUsers from "../components/admin/AdminUsers";
import TurmasAdmin from "../components/admin/TurmasAdmin";
import FeedTab from "../components/dashboard/FeedTab";

export default function DirectionDashboard({ onNavigate, perfilAtivo }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profileOpen, setProfileOpen] = useState(false);

  const unidadesDoDiretor = (user?.unidade || "").split(",").map(u => u.trim()).filter(Boolean);
  const unidadeFoco = unidadesDoDiretor[0] || "Todas";

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans text-gray-800 relative pb-28">
      <main className="relative z-10 flex-1 w-full max-w-[1100px] mx-auto px-4 pt-4">
        {activeTab === "dashboard" && (
          <AdminOverview unidadeFoco={unidadeFoco} unidadesEscopo={unidadesDoDiretor} />
        )}
        {activeTab === "usuarios" && (
          <AdminUsers unidadesEscopo={unidadesDoDiretor} perfilAtivo={perfilAtivo} currentUser={user} />
        )}
        {activeTab === "turmas" && (
          <TurmasAdmin perfilAtivo={perfilAtivo} unidadeFoco={unidadeFoco} unidadesEscopo={unidadesDoDiretor} />
        )}
        {activeTab === "feed" && (
          <FeedTab user={user} unidadeFoco={unidadeFoco} unidadesEscopo={unidadesDoDiretor} />
        )}
      </main>

      <DashboardNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onProfileOpen={() => setProfileOpen(true)}
        logout={logout}
        isDirecao={true}
        isAdmin={false}
        isNucleo={false}
      />

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}