import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const perguntas = [
  { q: "Esqueci minha senha, como recuperar?", a: "Na tela de login, clique em 'Esqueci minha senha' e siga as instruções enviadas para o seu e-mail institucional." },
  { q: "Posso alterar meus dados cadastrais?", a: "Sim! Basta clicar no seu nome no topo da tela para acessar o seu perfil e atualizar telefone ou senha." },
  { q: "O que acontece se eu não der o check?", a: "O check é fundamental para o acompanhamento pedagógico. A ausência dele será registrada nos relatórios da direção." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-14 sm:py-20 px-4 sm:px-6 max-w-[930px] mt-[-20px] sm:mt-[-50px] mx-auto">
      <div className="flex flex-col items-end text-right mb-8 sm:mb-10">
        <h2 className="text-4xl sm:text-5xl md:text-[56px] font-black uppercase leading-[0.9] tracking-tighter mb-3 text-[#111]">
          Perguntas <br />
          <span className="text-black px-2 inline-block mt-1 rounded-md">frequentes.</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-[280px] leading-snug">
          Tire suas dúvidas sobre o Sincronismo Pedagógico.
        </p>
      </div>

      {/* Perguntas alinhadas à direita */}
      <div className="flex flex-col gap-2 max-w-[500px] ml-auto w-full">
        {perguntas.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="bg-white rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-[11px] sm:text-xs font-bold text-left text-pensi-dark"
              >
                {faq.q}
                {isOpen ? <Minus size={14} className="shrink-0" /> : <Plus size={14} className="shrink-0" />}
              </button>
              {isOpen && <div className="px-4 pb-4 text-[11px] sm:text-xs text-gray-500 leading-relaxed">{faq.a}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}