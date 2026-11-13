import { LayoutDashboard, Users, MessageSquare, LogOut, User, Home, GraduationCap, CalendarDays } from "lucide-react";

export default function DashboardNavbar({
  activeTab, setActiveTab, onProfileOpen, logout,
  isAdmin = false, isDirecao = false, isNucleo = false,
}) {
  const itens = [];
  if (isAdmin || isDirecao || isNucleo) {
    itens.push({ key: "dashboard", icon: LayoutDashboard, title: "Visão Geral" });
    itens.push({ key: "usuarios", icon: Users, title: "Usuários" });
    itens.push({ key: "turmas", icon: GraduationCap, title: "Turmas e Séries" });
    itens.push({ key: "calendario", icon: CalendarDays, title: "Calendário Letivo" }); // NOVO
    itens.push({ key: "feed", icon: MessageSquare, title: "Feed" });
  } else {
    itens.push({ key: "inicio", icon: Home, title: "Início" });
    itens.push({ key: "feed", icon: MessageSquare, title: "Feed" });
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex justify-center">
      <div className="relative overflow-hidden bg-[#1c1c1c]/65 backdrop-blur-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-full px-6 py-3 flex items-center justify-center gap-4 sm:gap-6">
        {itens.map(({ key, icon: Icon, title }) => (
          <button key={key} onClick={() => setActiveTab(key)} title={title}
            className={`relative z-10 flex items-center justify-center p-2.5 rounded-full transition-all duration-300 ${activeTab === key ? "text-pensi-yellow bg-white/10 shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
            <Icon className={`w-6 h-6 ${activeTab === key ? "fill-pensi-yellow" : ""}`} />
          </button>
        ))}
        <div className="w-[1px] h-6 bg-white/20 mx-1" />
        <button onClick={onProfileOpen} className="relative z-10 p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/5" title="Perfil">
          <User className="w-6 h-6" />
        </button>
        <button onClick={logout} className="relative z-10 p-2.5 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10" title="Sair">
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}