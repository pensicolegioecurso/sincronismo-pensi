import { useAuth } from "../hooks/useAuth";
import logoPensi from "../assets/logoPensi.png";
import { LogOut, User } from "lucide-react";

export default function ProfessorNavbar({ onProfile }) { // <-- Nova prop
  const { user, logout } = useAuth();

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-[1100px] z-50 flex justify-center">
      <header className="w-full bg-[#0f0f0f]/90 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={logoPensi} alt="Logo Pensi" className="h-7 object-contain" />
        </div>

        {/* Ações do Usuário */}
        <div className="flex items-center gap-2">
          {/* Botão de Perfil */}
          <button 
            onClick={onProfile}
            className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-white/20"
          >
            <User className="w-4 h-4 text-pensi-yellow" />
            Meu Perfil
          </button>

          {/* Botão Sair */}
          <button 
            onClick={logout} 
            className="flex items-center justify-center w-9 h-9 text-gray-400 hover:text-red-400 transition-colors bg-white/5 rounded-full border border-white/10 hover:border-red-400/30"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>
    </div>
  );
}