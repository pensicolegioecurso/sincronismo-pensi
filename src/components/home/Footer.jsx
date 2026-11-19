import { useAuth } from "../../hooks/useAuth";
import logoPensi from "../../assets/logoPensi.png";
import { ArrowUpRight, LogIn, UserPlus } from "lucide-react";

export default function Footer({ onLogin, onRegister }) {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  const links = [
    { label: "Sincronismos", href: "#acesso-rapido" },
    { label: "Dúvidas frequentes", href: "#faq" },
    { label: "Baixar o aplicativo", href: "#app-download" },
  ];

  return (
    <footer className="w-full bg-pensi-dark pt-20 pb-10 px-6">
      <div className="max-w-[1100px] mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
             <div className="mb-8">
               <img src={logoPensi} alt="Logo Pensi" className="h-10 object-contain filter brightness-0 invert" />
             </div>
             <h3 className="text-[32px] font-black uppercase leading-tight mb-4 text-white">
               Sincronismo<br />Pedagógico<span className="text-pensi-yellow">.</span>
             </h3>
             <p className="text-[15px] text-gray-400 font-medium max-w-sm">
               Consulte seu planejamento, registre os checks das suas aulas e acompanhe suas disciplinas em um só lugar.
             </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between md:justify-end gap-12 md:gap-24">
            <div>
              <h4 className="text-[14px] font-bold text-white uppercase tracking-wide mb-6">Navegação</h4>
              <ul className="space-y-4">
                {links.map(l => (
                  <li key={l.href}>
                    <a href={l.href} className="flex items-center gap-1.5 text-[15px] font-medium text-gray-400 hover:text-pensi-yellow transition-colors group">
                      {l.label}
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-pensi-yellow" strokeWidth={3} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 p-6 rounded-[24px] border border-white/10 min-w-[280px]">
              <h4 className="text-[18px] font-bold mb-2 text-white">{user ? "Sua conta." : "Vamos começar?"}</h4>
              <p className="text-[13px] text-gray-400 font-medium mb-6">
                {user ? "Acompanhe suas disciplinas e mantenha tudo em dia." : "Entre ou crie sua conta para acessar o painel."}
              </p>

              {!user ? (
                <div className="flex flex-col gap-3">
                  <button onClick={onLogin} className="w-full flex items-center justify-between bg-pensi-yellow text-pensi-dark rounded-full px-5 py-3 hover:bg-pensi-yellow-hover transition-colors">
                    <span className="flex items-center gap-2 text-[13px] font-bold"><LogIn className="w-4 h-4" /> Entrar</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <button onClick={onRegister} className="w-full flex items-center justify-between bg-transparent border border-white/20 text-white rounded-full px-5 py-3 hover:bg-white/10 transition-colors">
                    <span className="flex items-center gap-2 text-[13px] font-bold"><UserPlus className="w-4 h-4" /> Criar conta</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-black/30 p-3 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-pensi-yellow flex items-center justify-center font-black text-pensi-dark">
                    {user.nome?.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[13px] font-bold text-white truncate">{user.nome}</p>
                    <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] font-medium text-gray-500">© {currentYear} Sincronismo Pensi. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
            <span className="text-[11px] font-medium text-gray-400">Desenvolvido por <strong className="text-white">Silvia</strong></span>
            <span className="w-1.5 h-1.5 rounded-full bg-pensi-yellow" />
            <span className="text-[10px] font-black text-gray-500">v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}