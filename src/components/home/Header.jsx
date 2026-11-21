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

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const scrollToSection = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const linkClass = "text-white hover:text-pensi-yellow transition";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 px-4">
        <div
          className={`relative bg-black rounded-2xl px-4 py-4 flex items-center justify-between w-full max-w-[940px] shadow-sm transition-all ${
            scrolled ? "shadow-md" : ""
          }`}
        >
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer pl-3"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
          >
            <img
              src={logoPensi}
              alt="Logo Pensi"
              className="h-9 w-auto object-contain"
            />
          </div>

          {/* Links desktop */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium absolute left-1/2 -translate-x-1/2">
            {!user ? (
              <>
                <button
                  onClick={() => scrollToSection("acesso-rapido")}
                  className={linkClass}
                >
                  Sincronismos
                </button>
                <button
                  onClick={() => scrollToSection("faq")}
                  className={linkClass}
                >
                  Dúvidas
                </button>
                <button
                  onClick={() => scrollToSection("como-funciona")}
                  className={linkClass}
                >
                  Como funciona
                </button>
              </>
            ) : (
              <>
                <button onClick={onReports} className={linkClass}>
                  Relatórios
                </button>
                {user?.cargo === "admin" && (
                  <button onClick={onAdmin} className={linkClass}>
                    Admin
                  </button>
                )}
              </>
            )}
          </div>

          {/* Ações desktop */}
          <div className="hidden md:flex items-center gap-5 text-sm font-medium">
            {!user ? (
              <button
                onClick={() => scrollToSection("app-download")}
                className="bg-pensi-yellow text-black px-6 py-2.5 rounded-xl text-sm font-bold hover:brightness-95 transition flex items-center gap-2"
              >
                Baixar App <ArrowUpRight size={16} strokeWidth={3} />
              </button>
            ) : (
              <>
                <button
                  onClick={onProfile}
                  className="bg-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-white/20 transition"
                >
                  {user.nome?.split(" ")[0]}
                </button>
                <button
                  onClick={logout}
                  className="text-red-500 hover:text-red-400 transition"
                >
                  Sair
                </button>
              </>
            )}
          </div>

          {/* Hambúrguer mobile */}
          <button
            className="md:hidden p-2.5 text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="w-7 h-7" />
            ) : (
              <Menu className="w-7 h-7" />
            )}
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      <div
        className={`md:hidden fixed inset-0 bg-white z-40 transition-all duration-300 flex flex-col items-center justify-center gap-9 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {!user ? (
          <>
            <button
              onClick={() => scrollToSection("acesso-rapido")}
              className="text-2xl font-black text-black hover:text-pensi-dark transition"
            >
              Sincronismos
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-2xl font-black text-black hover:text-pensi-dark transition"
            >
              Dúvidas
            </button>
            <button
              onClick={() => scrollToSection("como-funciona")}
              className="text-2xl font-black text-black hover:text-pensi-dark transition"
            >
              Como funciona
            </button>
            <button
              onClick={() => scrollToSection("app-download")}
              className="mt-4 px-9 py-4 rounded-full bg-black text-white font-bold text-lg"
            >
              Baixar Aplicativo
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setMenuOpen(false);
                onReports();
              }}
              className="text-2xl font-black text-black"
            >
              Relatórios
            </button>
            {user?.cargo === "admin" && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onAdmin();
                }}
                className="text-2xl font-black text-black"
              >
                Painel Admin
              </button>
            )}
            <button
              onClick={() => {
                setMenuOpen(false);
                onProfile();
              }}
              className="text-2xl font-black text-black"
            >
              Meu Perfil
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="mt-4 px-9 py-4 rounded-full bg-red-100 text-red-500 font-bold text-lg"
            >
              Sair da conta
            </button>
          </>
        )}
      </div>
    </>
  );
}