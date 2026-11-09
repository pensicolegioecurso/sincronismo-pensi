import { Home, LayoutGrid, User, LogOut, LayoutDashboard, Users } from "lucide-react";

export default function DashboardNavbar({ activeTab, setActiveTab, onProfileOpen, logout, isAdmin = false }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex justify-center">
      <div className="
        relative overflow-hidden
        bg-black/70 backdrop-blur-3xl backdrop-saturate-150
        border border-white/10
        shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.6)]
        rounded-full px-6 py-3 
        flex items-center justify-center gap-5 sm:gap-6
        before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:via-transparent before:to-transparent before:opacity-50 before:pointer-events-none
      ">
        
        {isAdmin ? (
          <>
            <button 
              onClick={() => setActiveTab("dashboard")} 
              className={`relative z-10 flex items-center justify-center p-2.5 rounded-full transition-all duration-300 ${activeTab === "dashboard" ? "text-pensi-yellow bg-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
              title="Visão Geral"
            >
              <LayoutDashboard className={`w-6 h-6 ${activeTab === "dashboard" ? "fill-pensi-yellow" : ""}`} />
            </button>

            <button 
              onClick={() => setActiveTab("usuarios")} 
              className={`relative z-10 flex items-center justify-center p-2.5 rounded-full transition-all duration-300 ${activeTab === "usuarios" ? "text-pensi-yellow bg-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
              title="Usuários"
            >
              <Users className={`w-6 h-6 ${activeTab === "usuarios" ? "fill-pensi-yellow" : ""}`} />
            </button>

            <button 
              onClick={() => setActiveTab("feed")} 
              className={`relative z-10 flex items-center justify-center p-2.5 rounded-full transition-all duration-300 ${activeTab === "feed" ? "text-pensi-yellow bg-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
              title="Feed"
            >
              <LayoutGrid className={`w-6 h-6 ${activeTab === "feed" ? "fill-pensi-yellow" : ""}`} />
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setActiveTab("inicio")} 
              className={`relative z-10 flex items-center justify-center p-2.5 rounded-full transition-all duration-300 ${activeTab === "inicio" ? "text-pensi-yellow bg-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
              title="Início"
            >
              <Home className={`w-6 h-6 ${activeTab === "inicio" ? "fill-pensi-yellow" : ""}`} />
            </button>

            <button 
              onClick={() => setActiveTab("feed")} 
              className={`relative z-10 flex items-center justify-center p-2.5 rounded-full transition-all duration-300 ${activeTab === "feed" ? "text-pensi-yellow bg-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
              title="Feed"
            >
              <LayoutGrid className={`w-6 h-6 ${activeTab === "feed" ? "fill-pensi-yellow" : ""}`} />
            </button>
          </>
        )}

        <div className="w-[1px] h-6 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1 relative z-10"></div>

        <button onClick={onProfileOpen} className="relative z-10 flex items-center justify-center p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300" title="Perfil">
          <User className="w-6 h-6" />
        </button>

        <button onClick={logout} className="relative z-10 flex items-center justify-center p-2.5 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-300" title="Sair da conta">
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}