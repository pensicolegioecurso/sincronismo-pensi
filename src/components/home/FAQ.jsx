import { useState } from "react";
import { Plus } from "lucide-react";

const perguntas = [
  { q: "Esqueci minha senha, como recuperar?", a: "Na tela de login, clique em 'Esqueci minha senha' e siga as instruções enviadas para o seu e-mail institucional." },
  { q: "Posso alterar meus dados cadastrais?", a: "Sim! Basta clicar no seu nome no topo da tela para acessar o seu perfil e atualizar telefone ou senha." },
  { q: "O que acontece se eu não der o check?", a: "O check é fundamental para o acompanhamento pedagógico. A ausência dele será registrada nos relatórios da direção." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="w-full py-20 px-6 bg-pensi-bg">
      <div className="max-w-[700px] mx-auto">
        <h2 className="text-[45px] sm:text-[60px] font-black leading-[0.95] tracking-[-0.03em] uppercase  mb-12 text-pensi-dark">
          Perguntas<br />Frequentes.
        </h2>

        <div className="space-y-3">
          {perguntas.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-[20px] overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer border border-gray-100"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
              >
                <div className="flex items-center justify-between p-5">
                  <h3 className="text-[15px] sm:text-[16px] font-bold text-pensi-dark pr-4">{item.q}</h3>
                  <div className={`w-8 h-8 rounded-full bg-pensi-bg flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45 bg-pensi-yellow' : ''}`}>
                    <Plus className="w-4 h-4 text-pensi-dark" strokeWidth={3} />
                  </div>
                </div>
                <div className={`px-5 pb-5 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden p-0'}`}>
                  <p className="text-[14px] text-gray-500 font-medium leading-relaxed border-t border-gray-100 pt-4">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}