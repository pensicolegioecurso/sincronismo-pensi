
import Reveal from "../../utils/Reveal";
import {
  ChevronDown,
  Triangle,
  Square,
  Circle,
  HelpCircle
} from "lucide-react";

const perguntas = [
  {
    q: "Esqueci minha senha, como recuperar?",
    a: "Na tela de login, clique em 'Esqueci minha senha' e siga as instruções enviadas para o seu e-mail institucional."
  },
  {
    q: "Posso alterar meus dados cadastrais?",
    a: "Sim! Basta clicar no seu nome no topo da tela para acessar o seu perfil e atualizar telefone ou senha."
  },
  {
    q: "O que acontece se eu não der o check?",
    a: "O check é fundamental para o acompanhamento pedagógico. A ausência dele será registrada nos relatórios da direção."
  }
];

export default function FAQ() {
  return (
    <section className="w-full max-w-[1100px] mx-auto px-6 mb-24 relative z-10">

      <div
        id="faq"
        className="scroll-mt-28 w-full max-w-6xl mx-auto py-8"
      >
        <Reveal delay={200}>

          <div className="grid md:grid-cols-[1fr_1.5fr] gap-12 md:gap-30 items-start">

            {/* Título */}
            <div className="md:sticky md:top-28">

              {/* Ícones geométricos */}
              <div className="flex items-center gap-2 mb-4">
                <Triangle className="w-4 h-4 text-gray-900 stroke-[2]" />
                <Square className="w-3.5 h-3.5 text-gray-900 stroke-[2]" />
                <Circle className="w-3.5 h-3.5 text-gray-900 stroke-[2]" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-3">
                Perguntas
                <br />
                Frequentes
              </h2>

              <p className="text-sm text-gray-500 font-light leading-relaxed max-w-xs mb-6">
                Encontre respostas rápidas para as perguntas mais comuns.
              </p>

              {/* Elemento decorativo */}
              <div className="hidden md:flex items-center justify-center w-16 h-16 bg-pensi-yellow border-[3px] border-black rounded-2xl shadow-[5px_5px_0px_0px_#000000]">
                <HelpCircle
                  className="w-8 h-8 text-gray-900"
                  strokeWidth={2}
                />
              </div>

            </div>

            {/* Perguntas */}
            <div className="space-y-6">

              {perguntas.map((item, idx) => (

                <Reveal key={idx} delay={idx * 50 + 200}>

                  <details
                    className="
                      group
                      bg-white
                      border-[2px] border-black
                      rounded-xl
                      shadow-[6px_6px_0px_0px_#000000]
                      open:bg-[#FFF7D6]
                      hover:bg-[#FFFDF3]
                      transition-colors duration-200
                      overflow-hidden
                    "
                  >

                    {/* Pergunta */}
                    <summary
                      className="
                        flex items-center justify-between
                        gap-4
                        p-5
                        cursor-pointer
                        list-none
                        [&::-webkit-details-marker]:hidden
                      "
                    >

                      <span className="text-sm font-bold text-gray-900 leading-relaxed">
                        {item.q}
                      </span>

                      {/* Ícone de expansão */}
                      <span
                        className="
                          w-8 h-8
                          flex items-center justify-center
                          shrink-0
                          bg-pensi-yellow
                          border-2 border-black
                          rounded-lg
                          group-open:bg-white
                          transition-colors duration-200
                        "
                      >
                        <ChevronDown
                          className="
                            w-4 h-4
                            text-gray-900
                            transition-transform duration-200
                            group-open:rotate-180
                          "
                          strokeWidth={2.5}
                        />
                      </span>

                    </summary>

                    {/* Resposta */}
                    <div className="px-5 pb-5">

                      <div className="border-t-2 border-black/10 pt-4">

                        <p className="text-sm text-gray-700 leading-relaxed">
                          {item.a}
                        </p>

                      </div>

                    </div>

                  </details>

                </Reveal>

              ))}

            </div>

          </div>

        </Reveal>
      </div>
    </section>
  );
}
