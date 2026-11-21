import { useAuth } from "../../hooks/useAuth";
import logoPensi from "../../assets/logoPensi.png";

export default function Footer({ onLogin, onRegister }) {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="px-4 pb-8 max-w-[930px] mx-auto">
      <div className="bg-[#0a0a0a] text-white rounded-[40px] p-8 md:p-10">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-5 max-w-[300px] leading-snug">
              Feito com dedicação, para quem busca a sincronia perfeita.
            </h3>
          </div>

          <div className="flex gap-16 text-sm">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                Produto
              </p>
              <ul className="flex flex-col gap-3 font-medium">
                <li>
                  <a href="#como-funciona" className="hover:text-pensi-yellow transition">
                    Como funciona
                  </a>
                </li>
                <li>
                  <a href="#acesso-rapido" className="hover:text-pensi-yellow transition">
                    Sincronismos
                  </a>
                </li>
                <li>
                  <a href="#app-download" className="hover:text-pensi-yellow transition">
                    Aplicativo
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                Ajuda
              </p>
              <ul className="flex flex-col gap-3 font-medium">
                <li>
                  <a href="#faq" className="hover:text-pensi-yellow transition">
                    Perguntas frequentes
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-pensi-yellow transition">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Logo Pensi */}
        <div className="mb-8">
          <img
            src={logoPensi}
            alt="Logo Pensi"
            className="h-10 md:h-12 w-auto object-contain object-left"
          />
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between gap-4 text-[11px] text-gray-500 font-medium">
          <span>
            © {currentYear} Sincronismo Pensi. Todos os direitos reservados.
          </span>
          <span>
            Desenvolvido por <span className="text-white">Silvia</span> · Versão 1.0
          </span>
        </div>
      </div>
    </footer>
  );
}