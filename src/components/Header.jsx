import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import logoPensi from "../assets/logoPensi.png";
import { Menu, X } from "lucide-react";

export default function Header({ onReports, onAdmin, onProfile }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* Header Flutuante */}
      <header 
        className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-[1100px] z-50 transition-all duration-500 ease-in-out
          ${scrolled 
            ? "bg-black/40 backdrop-blur-2xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] py-4" 
            : "bg-transparent border-transparent py-6"
          } border rounded-full px-6 md:px-8 flex items-center justify-between`}
      >
        
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group z-50" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img 
            src={logoPensi} 
            alt="Logo Pensi" 
            className="h-9 md:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
          />
        </div>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {!user ? (
            <nav className="flex items-center gap-1 text-sm font-medium text-gray-300">
              
              <button onClick={() => scrollToSection("acesso-rapido")} className="relative px-5 py-3 rounded-full overflow-hidden group transition-colors">
                <span className="relative z-10 group-hover:text-white transition-colors">Sincronismos</span>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full backdrop-blur-md"></div>
              </button>

              <button onClick={() => scrollToSection("faq")} className="relative px-5 py-3 rounded-full overflow-hidden group transition-colors">
                <span className="relative z-10 group-hover:text-white transition-colors">FAQ</span>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full backdrop-blur-md"></div>
              </button>
              
              {/* BOTÃO BAIXAR APP - Amarelo forte direto */}
              <button 
                onClick={() => scrollToSection("app-download")} 
                className="relative ml-3 px-7 py-3 rounded-full overflow-hidden group
                           bg-pensi-yellow text-pensi-dark font-bold text-sm
                           transition-all duration-300 shadow-[0_0_15px_rgba(244,180,0,0.4)] hover:shadow-[0_0_25px_rgba(244,180,0,0.7)] hover:-translate-y-0.5"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Baixar App
                </span>
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>

            </nav>
          ) : (
            <div className="flex items-center gap-1 text-sm font-medium text-gray-300">
              
              <button onClick={onReports} className="relative px-5 py-3 rounded-full overflow-hidden group transition-colors">
                <span className="relative z-10 group-hover:text-white transition-colors">Relatórios</span>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full backdrop-blur-md"></div>
              </button>

              {user?.cargo === "admin" && (
                <button onClick={onAdmin} className="relative px-5 py-3 rounded-full overflow-hidden group transition-colors">
                  <span className="relative z-10 group-hover:text-white transition-colors">Admin</span>
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full backdrop-blur-md"></div>
                </button>
              )}

              <button onClick={onProfile} className="relative px-5 py-3 rounded-full overflow-hidden group transition-colors flex items-center gap-2">
                <span className="relative z-10 group-hover:text-white transition-colors">{user.nome?.split(" ")[0]}</span>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full backdrop-blur-md"></div>
              </button>

              <button onClick={logout} className="relative ml-3 px-5 py-3 rounded-full overflow-hidden group transition-colors border border-red-500/20">
                <span className="relative z-10 text-red-400 group-hover:text-red-300 transition-colors">Sair</span>
                <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full backdrop-blur-md"></div>
              </button>
            </div>
          )}
        </div>

        {/* Botão Hamburguer (Mobile) */}
        <button 
          className="md:hidden z-50 p-2.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white backdrop-blur-md transition-all"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Menu Mobile */}
      <div 
        className={`fixed inset-0 bg-[#0f0f0f]/80 backdrop-blur-2xl z-40 transition-all duration-500 ease-in-out flex flex-col items-center justify-center gap-6 md:hidden
          ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        {!user ? (
          <>
            <button onClick={() => scrollToSection("acesso-rapido")} className="text-2xl font-light text-gray-300 hover:text-white transition-colors">
              Sincronismos
            </button>
            <button onClick={() => scrollToSection("faq")} className="text-2xl font-light text-gray-300 hover:text-white transition-colors">
              FAQ
            </button>
            <button onClick={() => scrollToSection("app-download")} className="mt-6 px-10 py-4 rounded-full bg-pensi-yellow text-pensi-dark font-bold text-lg shadow-[0_0_30px_rgba(244,180,0,0.3)] transition-all">
              Baixar Aplicativo
            </button>
          </>
        ) : (
          <>
            <button onClick={() => { setMenuOpen(false); onReports(); }} className="text-2xl font-light text-gray-300 hover:text-white transition-colors">
              Relatórios
            </button>
            {user?.cargo === "admin" && (
              <button onClick={() => { setMenuOpen(false); onAdmin(); }} className="text-2xl font-light text-gray-300 hover:text-white transition-colors">
                Painel Admin
              </button>
            )}
            <button onClick={() => { setMenuOpen(false); onProfile(); }} className="text-2xl font-light text-gray-300 hover:text-white transition-colors">
              Meu Perfil
            </button>
            <button onClick={() => { setMenuOpen(false); logout(); }} className="mt-6 px-10 py-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-lg hover:bg-red-500/20 transition-all">
              Sair da conta
            </button>
          </>
        )}
      </div>
    </>
  );
}