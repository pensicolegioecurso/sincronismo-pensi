// src/components/dashboard/DashboardNavbar.jsx
import {
  LayoutDashboard, Users, MessageSquare, LogOut, User, Home, Settings,
} from "lucide-react";
import logoPensi from "../../assets/logoPensi.png";

export default function DashboardNavbar({
  activeTab,
  setActiveTab,
  onProfileOpen,
  logout,
  isAdmin = false,
  isDirecao = false,
  isNucleo = false,
  showLogo = false,
}) {
  const isManager = isAdmin || isDirecao || isNucleo;

  const itens = isManager
    ? [
        { key: "dashboard", icon: LayoutDashboard, title: "Visão Geral" },
        { key: "usuarios", icon: Users, title: "Usuários" },
        { key: "turmas", icon: Settings, title: "Configurações e Cadastros" },
        { key: "feed", icon: MessageSquare, title: "Feed" },
      ]
    : [
        { key: "inicio", icon: Home, title: "Início" },
        { key: "feed", icon: MessageSquare, title: "Feed" },
      ];

  const botaoBase =
    "flex items-center justify-center rounded-full p-2.5 transition-colors";

  return (
    <nav className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center justify-center">
      <div className="flex items-center gap-4 rounded-full border border-white/20 bg-[#1c1c1c]/75 px-5 py-3 shadow-lg backdrop-blur-xl sm:gap-6">
        {showLogo && (
          <>
            <img src={logoPensi} alt="Logo Pensi" className="h-7 object-contain" />
            <span className="h-6 w-px bg-white/20" />
          </>
        )}

        {itens.map(({ key, icon: Icon, title }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            title={title}
            aria-label={title}
            className={`${botaoBase} ${
              activeTab === key
                ? "bg-white/10 text-pensi-yellow"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon
              size={24}
              className={activeTab === key ? "fill-pensi-yellow" : ""}
            />
          </button>
        ))}

        <span className="h-6 w-px bg-white/20" />

        <button
          type="button"
          onClick={onProfileOpen}
          title="Perfil"
          aria-label="Perfil"
          className={`${botaoBase} text-gray-400 hover:bg-white/5 hover:text-white`}
        >
          <User size={24} />
        </button>

        <button
          type="button"
          onClick={logout}
          title="Sair"
          aria-label="Sair"
          className={`${botaoBase} text-red-400 hover:bg-red-500/10 hover:text-red-300`}
        >
          <LogOut size={24} />
        </button>
      </div>
    </nav>
  );
}