import { useState, useEffect, useRef } from "react";
import {
  Triangle,
  Square,
  Circle,
  LogIn,
  BookOpen,
  CheckCheck,
} from "lucide-react";

// Animação de entrada
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`h-full transition-all duration-1000 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Ícones geométricos
function IconeGeometrico() {
  return (
    <div className="flex items-center gap-2 mb-4 justify-end">
      <Triangle className="w-4 h-4 text-gray-900" strokeWidth={2} />
      <Square className="w-3.5 h-3.5 text-gray-900" strokeWidth={2} />
      <Circle className="w-3.5 h-3.5 text-gray-900" strokeWidth={2} />
    </div>
  );
}

const passos = [
  {
    numero: "01",
    titulo: "Acesse sua conta",
    descricao:
      "Entre com seu e-mail institucional para liberar o acesso ao seu painel de disciplinas.",
    icon: LogIn,
    cor: "bg-pensi-yellow",
    deslocamento: "md:mt-[-10px]",
    delay: 0,
  },
  {
    numero: "02",
    titulo: "Escolha a disciplina",
    descricao:
      "No Acesso Rápido, clique na matéria que você leciona para abrir o calendário.",
    icon: BookOpen,
    cor: "bg-[#B9D8FF]",
    deslocamento: "md:mt-16",
    delay: 100,
  },
  {
    numero: "03",
    titulo: "Dê o check",
    descricao:
      'Navegue pelo calendário, encontre a aula do dia e clique em "Dar Check" para registrar.',
    icon: CheckCheck,
    cor: "bg-[#C7F0D8]",
    deslocamento: "md:mt-30",
    delay: 200,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="relative w-full py-16 md:py-20"
    >
      <div className="relative z-10 max-w-[1100px] mx-auto px-6">

        {/* Título */}
        <div className="flex flex-col items-end text-right mb-8 md:mb-0">
          <IconeGeometrico />

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Como Funciona?
          </h2>

          <p className="text-sm text-gray-600 font-light max-w-md">
            Três passos simples para manter o acompanhamento em dia.
          </p>
        </div>

        {/* Cards */}
        <div
          className="
            grid grid-cols-1
            md:grid-cols-3
            gap-8
            w-full
            items-start
            md:-mt-8
            md:pb-24
          "
        >
          {passos.map((passo) => {
            const Icon = passo.icon;

            return (
              <div
                key={passo.numero}
                className={passo.deslocamento}
              >
                <Reveal delay={passo.delay}>
                  <div
                    className="
                      group
                      relative
                      bg-white
                      border-[3px] border-black
                      rounded-2xl
                      p-7 md:p-8
                      min-h-[280px]
                      flex flex-col
                      shadow-[8px_8px_0px_0px_#000000]
                      hover:bg-[#FFFDF3]
                      transition-colors duration-200
                    "
                  >
                    {/* Número e ícone */}
                    <div className="flex items-start justify-between mb-8">

                      {/* Número sem encapsulamento */}
                      <span className="text-6xl font-grey text-gray-900 tracking-tighter leading-none">
                        {passo.numero}
                      </span>

                      {/* Ícone */}
                      <div
                        className={`
                          ${passo.cor}
                          w-12 h-12
                          flex items-center justify-center
                          border-2 border-black
                          rounded-full
                        `}
                      >
                        <Icon
                          className="w-6 h-6 text-gray-900"
                          strokeWidth={2}
                        />
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        {passo.titulo}
                      </h3>

                      <p className="text-sm text-gray-600 leading-relaxed">
                        {passo.descricao}
                      </p>
                    </div>

                    {/* Detalhes decorativos */}
                    <div className="flex items-center gap-1.5 mt-8">
                      <div className="w-8 h-2 rounded-full bg-black" />
                      <div className="w-2 h-2 rounded-full bg-pensi-yellow border border-black" />
                      <div className="w-2 h-2 rounded-full bg-white border border-black" />
                    </div>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}