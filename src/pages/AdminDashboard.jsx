import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import ProfileModal from "../components/ProfileModal";
import AdminOverview from "../components/admin/AdminOverview";
import AdminUsers from "../components/admin/AdminUsers";

export default function AdminDashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans text-gray-800 relative pb-28">
      
      <main className="relative z-10 flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* CONTAINER PRINCIPAL: LIQUID GLASS + NEO-BRUTALISMO */}
        <div className="bg-white/60 backdrop-blur-2xl border-[2px] border-black rounded-[2rem] shadow-[8px_8px_0px_0px_#000] p-5 sm:p-8 min-h-[80vh]">
          
          {/* CABEÇALHO COM PONTINHOS E TÍTULO */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="w-3 h-3 rounded-full bg-pensi-yellow border border-black" />
              <span className="w-3 h-3 rounded-full bg-[#D8E8FF] border border-black" />
              <span className="w-3 h-3 rounded-full bg-[#F8DCEB] border border-black" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {activeTab === "dashboard" ? "Painel Administrativo" : "Gestão de Usuários"}
              <span className="text-pensi-yellow">.</span>
            </h1>
          </div>

          {activeTab === "dashboard" && <AdminOverview />}
          {activeTab === "usuarios" && <AdminUsers />}

        </div>
      </main>

      <DashboardNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onProfileOpen={() => setProfileOpen(true)} 
        logout={logout}
        isAdmin={true} 
      />

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}