import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import ProfileModal from "../components/ProfileModal";
import AdminOverview from "../components/admin/AdminOverview";
import AdminUsers from "../components/admin/AdminUsers";
import TurmasAdmin from "../components/admin/TurmasAdmin";
import CalendarioAdmin from "../components/admin/CalendarioAdmin"; // NOVO IMPORT
import FeedTab from "../components/dashboard/FeedTab";

export default function AdminDashboard({ onNavigate, perfilAtivo }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profileOpen, setProfileOpen] = useState(false);

  const isRegional = perfilAtivo === "regional";
  const isNucleo = perfilAtivo === "nucleo";
  const isAdmin = perfilAtivo === "admin";

  const unidadesEscopo = isRegional ? (user?.unidadesComando || []) : null;

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans text-gray-800 relative pb-28">
      <main className="relative z-10 flex-1 w-full mx-auto pt-10">
        {activeTab === "dashboard" && <AdminOverview unidadesEscopo={unidadesEscopo} />}
        {activeTab === "usuarios" && (
          <AdminUsers
            unidadesEscopo={unidadesEscopo}
            perfilAtivo={perfilAtivo}
            currentUser={user}
          />
        )}
        {activeTab === "turmas" && <TurmasAdmin perfilAtivo={perfilAtivo} />}
        
        {/* NOVA ABA AQUI */}
        {activeTab === "calendario" && <CalendarioAdmin perfilAtivo={perfilAtivo} />}
        
        {activeTab === "feed" && <FeedTab user={user} />}
      </main>

      <DashboardNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onProfileOpen={() => setProfileOpen(true)}
        logout={logout}
        isAdmin={isAdmin}
        isNucleo={isNucleo}
        isDirecao={isRegional}
      />

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}