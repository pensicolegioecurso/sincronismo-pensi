import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import ProfileModal from "../components/ProfileModal";
import AdminOverview from "../components/admin/AdminOverview";
import AdminUsers from "../components/admin/AdminUsers";
import FeedTab from "../components/dashboard/FeedTab"; // Importação do Feed

export default function AdminDashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans text-gray-800 relative pb-28">
      
      {/* ÁREA PRINCIPAL */}
      <main className="relative z-10 flex-1 w-full mx-auto pt-10">
        {activeTab === "dashboard" && <AdminOverview />}
        {activeTab === "usuarios" && <AdminUsers />}
        {activeTab === "feed" && <FeedTab user={user} />}
      </main>

      {/* NAVBAR INFERIOR */}
      <DashboardNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onProfileOpen={() => setProfileOpen(true)} 
        logout={logout}
        isAdmin={true} 
      />

      {/* MODAL DE PERFIL */}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}