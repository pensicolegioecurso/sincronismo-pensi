
import { useAuth } from "../hooks/useAuth";
import logoPensi from "../assets/logoPensi.png";
import {
  ArrowUpRight,
  LogIn,
  UserPlus,
  ArrowRight,
} from "lucide-react";

export default function Footer({ onLogin, onRegister }) {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  const links = [
    { label: "Sincronismos", href: "#acesso-rapido" },
    { label: "Dúvidas frequentes", href: "#faq" },
    { label: "Baixar o aplicativo", href: "#app-download" },
  ];

  return (
    <footer
      className="
        relative
        w-full
        bg-[#111111]
        text-white
        mt-auto
        overflow-hidden
        pt-20 pb-8
        px-6
        border-t-[5px] border-pensi-yellow
      "
    >
      {/* Elementos geométricos discretos */}
      <div
        className="
          absolute
          -top-20 -right-20
          w-64 h-64
          rounded-full
          border-[2px] border-white/10
          pointer-events-none
        "
        aria-hidden="true"
      />

      <div
        className="
          absolute
          top-16 right-16
          w-20 h-20
          border-[2px] border-pensi-yellow/20
          rotate-12
          pointer-events-none
          hidden lg:block
        "
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1180px] mx-auto">
        {/* Conteúdo principal */}
        <div
          className="
            grid grid-cols-1
            md:grid-cols-12
            gap-12 md:gap-8
            mb-16
          "
        >
          {/* Identidade */}
          <div className="md:col-span-5">
            <div
              className="
                inline-flex
                items-center justify-center
    
                px-5 py-4
                mb-8
              "
            >
              <img
                src={logoPensi}
                alt="Logo Pensi"
                className="h-11 md:h-12 object-contain"
              />
            </div>

            <h3
              className="
                text-[22px] sm:text-[25px]
                font-medium
                tracking-[-0.035em]
                leading-tight
                text-white
                mb-4
              "
            >
              Sincronismo
              <br />
              Pedagógico<span className="text-pensi-yellow">.</span>
            </h3>

            <p
              className="
                text-[13px] sm:text-sm
                font-light
                leading-[1.8]
                text-gray-400
                max-w-[330px]
              "
            >
              Consulte seu planejamento, registre os checks
              das suas aulas e acompanhe suas disciplinas
              em um só lugar.
            </p>
          </div>

          {/* Navegação */}
          <nav className="md:col-span-3 md:pt-2" aria-label="Navegação do rodapé">
            <div className="flex items-center gap-2 mb-7">
              <span className="w-2 h-2 bg-pensi-yellow rounded-full" />

              <h4
                className="
                  text-[13px]
                  font-medium
                  tracking-wide
                  text-white
                "
              >
                Navegação
              </h4>
            </div>

            <ul className="space-y-5">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="
                      group
                      inline-flex items-center gap-2
                      text-[13px]
                      font-light
                      text-gray-400
                      hover:text-pensi-yellow
                      transition-colors duration-200
                    "
                  >
                    <ArrowUpRight
                      className="
                        w-3.5 h-3.5
                        text-pensi-yellow/60
                        group-hover:text-pensi-yellow
                        transition-colors duration-200
                      "
                      strokeWidth={1.7}
                    />

                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Área de conta */}
          <div className="md:col-span-4">
            <div
              className="
                relative
                bg-[#1c1c1c]
                border-[1.5px] border-white/70
                rounded-2xl
                shadow-[6px_6px_0px_0px_#F5C518]
                p-6
              "
            >
              {/* Detalhe superior */}
              <div
                className="
                  flex items-center gap-1.5
                  mb-6
                "
                aria-hidden="true"
              >
                <span className="w-2 h-2 bg-pensi-yellow rounded-full" />
                <span className="w-2 h-2 bg-white/50 rounded-full" />
                <span className="w-2 h-2 bg-white/20 rounded-full" />
              </div>

              <h4
                className="
                  text-[20px]
                  font-medium
                  tracking-[-0.035em]
                  text-white
                  mb-2
                "
              >
                {user ? "Sua conta." : "Vamos começar?"}
              </h4>

              <p
                className="
                  text-[12px]
                  font-light
                  leading-relaxed
                  text-gray-400
                  mb-7
                "
              >
                {user
                  ? "Acompanhe suas disciplinas e mantenha seus checks em dia."
                  : "Entre na sua conta para acompanhar o planejamento e registrar suas aulas."}
              </p>

              {!user ? (
                <div className="flex flex-col gap-3">
                  {/* Entrar */}
                  <button
                    type="button"
                    onClick={onLogin}
                    className="
                      group
                      w-full
                      flex items-center justify-between
                      bg-pensi-yellow
                      text-[#111111]
                      border-[1.5px] border-black
                      rounded-lg
                      px-4 py-3.5
                      shadow-[3px_3px_0px_0px_#FFFFFF]
                      hover:bg-[#ffdb4d]
                      transition-colors duration-200
                      cursor-pointer
                    "
                  >
                    <span className="flex items-center gap-2.5">
                      <LogIn className="w-4 h-4" strokeWidth={1.8} />

                      <span className="text-[13px] font-medium">
                        Entrar na conta
                      </span>
                    </span>

                    <ArrowRight
                      className="w-4 h-4"
                      strokeWidth={1.7}
                    />
                  </button>

                  {/* Criar conta */}
                  <button
                    type="button"
                    onClick={onRegister}
                    className="
                      group
                      w-full
                      flex items-center justify-between
                      bg-transparent
                      text-white
                      border-[1.5px] border-white/70
                      rounded-lg
                      px-4 py-3.5
                      hover:bg-white/10
                      transition-colors duration-200
                      cursor-pointer
                    "
                  >
                    <span className="flex items-center gap-2.5">
                      <UserPlus className="w-4 h-4" strokeWidth={1.8} />

                      <span className="text-[13px] font-medium">
                        Criar uma conta
                      </span>
                    </span>

                    <ArrowUpRight
                      className="w-4 h-4"
                      strokeWidth={1.7}
                    />
                  </button>
                </div>
              ) : (
                <div
                  className="
                    flex items-center gap-3
                    bg-[#111111]
                    border border-white/20
                    rounded-xl
                    p-3
                  "
                >
                  {/* Avatar */}
                  <div
                    className="
                      w-11 h-11
                      shrink-0
                      flex items-center justify-center
                      bg-pensi-yellow
                      text-black
                      border border-black
                      rounded-full
                      text-lg font-medium
                    "
                  >
                    {user.nome?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-white truncate">
                      {user.nome}
                    </p>

                    <p className="text-[11px] font-light text-gray-400 truncate mt-1">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="w-full h-px bg-white/15 mb-7" />

        {/* Rodapé inferior */}
        <div
          className="
            flex flex-col
            md:flex-row
            items-center justify-between
            gap-5
          "
        >
          <p
            className="
              text-[11px]
              font-light
              text-gray-500
              text-center md:text-left
            "
          >
            © {currentYear} Sincronismo Pensi. Todos os direitos reservados.
          </p>

          <div
            className="
              flex items-center
              gap-3
              text-[11px]
              font-light
              text-gray-500
            "
          >
            <span>
              Desenvolvido por{" "}
              <span className="text-gray-300 font-medium">
                Silvia
              </span>
            </span>

            <span className="w-1 h-1 rounded-full bg-pensi-yellow" />

            <span
              className="
                px-2.5 py-1
                border border-white/20
                rounded-md
                text-gray-400
                text-[10px]
              "
            >
              v1.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
