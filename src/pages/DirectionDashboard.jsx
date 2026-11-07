
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import ProfileModal from "../components/ProfileModal";
import AdminOverview from "../components/admin/AdminOverview";
import AdminUsers from "../components/admin/AdminUsers";
import FeedTab from "../components/dashboard/FeedTab";
import { LayoutDashboard, Users, MessageSquare, LogOut, User } from "lucide-react";

export default function DirectionDashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [profileOpen, setProfileOpen] = useState(false);
  
  // Pega a unidade da direção (ex: Icaraí 1)
  const unidadeFoco = user?.unidades?.[0] || "Icaraí 1";

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans text-gray-800 relative pb-28">

      <main className="relative z-10 flex-1 w-full max-w-[1100px] mx-auto px-4 pt-4">
        {activeTab === "dashboard" && <AdminOverview unidadeFoco={unidadeFoco} />}
        {activeTab === "usuarios" && <AdminUsers unidadeFoco={unidadeFoco} />}
        {activeTab === "feed" && <FeedTab user={user} unidadeFoco={unidadeFoco} />}
      </main>

      {/* NAVBAR INFERIOR */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex justify-center">
        <div className="
          relative overflow-hidden
          bg-[#1c1c1c]/65 backdrop-blur-3xl 
          border border-white/20 
          shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-1px_1px_rgba(0,0,0,0.5)]
          rounded-full px-6 py-3 
          flex items-center justify-center gap-6 sm:gap-8
          before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:opacity-50 before:pointer-events-none
        ">
          
          <button 
            onClick={() => setActiveTab("dashboard")} 
            className={`relative z-10 flex items-center justify-center p-2.5 rounded-full transition-all duration-300 ${activeTab === "dashboard" ? "text-pensi-yellow bg-white/10 shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            title="Visão Geral"
          >
            <LayoutDashboard className={`w-6 h-6 ${activeTab === "dashboard" ? "fill-pensi-yellow" : ""}`} />
          </button>

          <button 
            onClick={() => setActiveTab("usuarios")} 
            className={`relative z-10 flex items-center justify-center p-2.5 rounded-full transition-all duration-300 ${activeTab === "usuarios" ? "text-pensi-yellow bg-white/10 shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            title="Professores da Unidade"
          >
            <Users className={`w-6 h-6 ${activeTab === "usuarios" ? "fill-pensi-yellow" : ""}`} />
          </button>

          <button 
            onClick={() => setActiveTab("feed")} 
            className={`relative z-10 flex items-center justify-center p-2.5 rounded-full transition-all duration-300 ${activeTab === "feed" ? "text-pensi-yellow bg-white/10 shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            title="Feed da Unidade"
          >
            <MessageSquare className={`w-6 h-6 ${activeTab === "feed" ? "fill-pensi-yellow" : ""}`} />
          </button>

          <div className="w-[1px] h-6 bg-white/20 mx-1"></div>

          <button onClick={() => setProfileOpen(true)} className="relative z-10 flex items-center justify-center p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300" title="Perfil">
            <User className="w-6 h-6" />
          </button>

          <button onClick={logout} className="relative z-10 flex items-center justify-center p-2.5 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300" title="Sair da conta">
            <LogOut className="w-6 h-6" />
          </button>

        </div>
      </div>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
