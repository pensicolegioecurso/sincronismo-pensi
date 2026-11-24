import { useState } from "react";
import {
  LayoutDashboard, Users, MessageSquare, Home, Plus, LogOut,
} from "lucide-react";

import MaisModal from "./MaisModal"; // ⚠️ ajuste o caminho se precisar
import MaisProfessorModal from "./MaisProfessorModal"; // ⚠️ mesma pasta do MaisModal

export default function DashboardNavbar({
  activeTab, setActiveTab, onProfileOpen, logout,
  isAdmin = false, isDirecao = false, isNucleo = false, isRegional = false,
  perfilAtivo, unidadesEscopo, onUsuarioCadastrado, onNavigate,
}) {
  const [maisAberto, setMaisAberto] = useState(false);

  const cargosPerfil = [
    ...(Array.isArray(perfilAtivo?.cargos) ? perfilAtivo.cargos : []),
    perfilAtivo?.cargo,
  ].filter(Boolean).map((c) => String(c).toLowerCase());

  const isManager =
    isAdmin || isDirecao || isNucleo || isRegional ||
    cargosPerfil.some((c) =>
      ["admin", "administrador", "nucleo", "regional", "diretor", "direcao", "coordenador"].includes(c)
    );

  const itens = isManager
    ? [
      { key: "dashboard", icon: LayoutDashboard, title: "Visão Geral" },
      { key: "usuarios", icon: Users, title: "Usuários" },
      { key: "feed", icon: MessageSquare, title: "Feed" },
    ]
    : [
      { key: "inicio", icon: Home, title: "Início" },
      { key: "feed", icon: MessageSquare, title: "Feed" },
    ];

  const todos = [...itens, { key: "__sair", icon: LogOut, title: "Sair", sair: true }];

  const metade = Math.ceil(todos.length / 2);
  const leftItems = todos.slice(0, metade);
  const rightItems = todos.slice(metade);

  const renderButton = ({ key, icon: Icon, title, sair }) => {
    const isActive = !sair && activeTab === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => (sair ? logout?.() : setActiveTab(key))}
        className={`pointer-events-auto flex h-full flex-1 cursor-pointer flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold ${isActive ? "text-black" : sair ? "text-gray-400 active:text-rose-600" : "text-gray-400"
          }`}
      >
        <Icon size={24} strokeWidth={2} className="pointer-events-none" />
        <span className="pointer-events-none">{title}</span>
      </button>
    );
  };

  return (
    <>
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex w-full justify-center">
        <nav className="pointer-events-auto relative flex w-full max-w-[1100px] items-center justify-between rounded-t-[32px] bg-white px-2 pb-2 pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          {leftItems.map(renderButton)}

          <div className="pointer-events-none relative flex h-16 w-16 shrink-0 justify-center">
            <button
              type="button"
              onClick={() => setMaisAberto(true)}
              aria-label="Mais"
              className="pointer-events-auto absolute -top-9 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-black shadow-xl transition-transform active:scale-90"
            >
              <Plus size={28} strokeWidth={2.5} color="#fff" className="pointer-events-none" />
            </button>
          </div>

          {rightItems.map(renderButton)}
        </nav>
      </div>

      {maisAberto && isManager && (
        <MaisModal
          onClose={() => setMaisAberto(false)}
          perfilAtivo={perfilAtivo}
          unidadesEscopo={unidadesEscopo}
          onProfileOpen={onProfileOpen}
          logout={logout}
          onUsuarioCadastrado={onUsuarioCadastrado}
        />
      )}

      {maisAberto && !isManager && (
        <MaisProfessorModal
          onClose={() => setMaisAberto(false)}
          onNavigate={onNavigate}
          onProfileOpen={onProfileOpen}
        />
      )}
    </>
  );
}