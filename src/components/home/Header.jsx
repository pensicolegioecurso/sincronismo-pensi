import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import logoPensi from "../../assets/logoPensi.png";
import { Menu, X, ArrowUpRight } from "lucide-react";

export default function Header({ onReports, onAdmin, onProfile }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header 
        className={`fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-[1100px] z-50 transition-all duration-300 rounded-full border border-white/10 flex items-center justify-between px-8 py-5 shadow-2xl ${
          scrolled ? "bg-pensi-dark/95 backdrop-blur-xl" : "bg-pensi-dark"
        }`}
      >
        <div className="flex items-center gap-3 cursor-pointer z-50" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src={logoPensi} alt="Logo Pensi" className="h-9 md:h-10 w-auto object-contain" />
        </div>

        <div className="hidden md:flex items-center gap-8">
          {!user ? (
            <>
              <button onClick={() => scrollToSection("acesso-rapido")} className="text-[14px] font-bold text-gray-300 hover:text-white transition-colors">Sincronismos</button>
              <button onClick={() => scrollToSection("faq")} className="text-[14px] font-bold text-gray-300 hover:text-white transition-colors">Dúvidas</button>
              <button onClick={() => scrollToSection("como-funciona")} className="text-[14px] font-bold text-gray-300 hover:text-white transition-colors">Como funciona</button>
              <button onClick={() => scrollToSection("app-download")} className="bg-pensi-yellow text-pensi-dark px-7 py-3 rounded-full font-bold text-[14px] hover:bg-pensi-yellow-hover transition-colors flex items-center gap-2">
                Baixar App <ArrowUpRight className="w-4 h-4" strokeWidth={3} />
              </button>
            </>
          ) : (
            <>
              <button onClick={onReports} className="text-[14px] font-bold text-gray-300 hover:text-white transition-colors">Relatórios</button>
              {user?.cargo === "admin" && <button onClick={onAdmin} className="text-[14px] font-bold text-gray-300 hover:text-white transition-colors">Admin</button>}
              <button onClick={onProfile} className="text-[14px] font-bold text-white px-5 py-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors">{user.nome?.split(" ")[0]}</button>
              <button onClick={logout} className="text-[14px] font-bold text-red-400 hover:text-red-300 transition-colors">Sair</button>
            </>
          )}
        </div>

        <button className="md:hidden z-50 p-2 text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      <div className={`fixed inset-0 bg-pensi-dark z-40 transition-all duration-300 flex flex-col items-center justify-center gap-8 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        {!user ? (
          <>
            <button onClick={() => scrollToSection("acesso-rapido")} className="text-2xl font-black text-white hover:text-pensi-yellow transition-colors">Sincronismos</button>
            <button onClick={() => scrollToSection("faq")} className="text-2xl font-black text-white hover:text-pensi-yellow transition-colors">Dúvidas</button>
            <button onClick={() => scrollToSection("como-funciona")} className="text-2xl font-black text-white hover:text-pensi-yellow transition-colors">Como funciona</button>
            <button onClick={() => scrollToSection("app-download")} className="mt-4 px-8 py-3 rounded-full bg-pensi-yellow text-pensi-dark font-bold text-lg">Baixar Aplicativo</button>
          </>
        ) : (
          <>
            <button onClick={() => { setMenuOpen(false); onReports(); }} className="text-2xl font-black text-white">Relatórios</button>
            {user?.cargo === "admin" && <button onClick={() => { setMenuOpen(false); onAdmin(); }} className="text-2xl font-black text-white">Painel Admin</button>}
            <button onClick={() => { setMenuOpen(false); onProfile(); }} className="text-2xl font-black text-white">Meu Perfil</button>
            <button onClick={() => { setMenuOpen(false); logout(); }} className="mt-4 px-8 py-3 rounded-full bg-red-500/20 text-red-400 font-bold text-lg">Sair da conta</button>
          </>
        )}
      </div>
    </>
  );
}