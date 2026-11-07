import {
  LogIn,
  UserPlus,
  ArrowDown,
  ArrowUpRight,
  Sparkles,
  Plus,
} from "lucide-react";

export default function Hero({ onLogin, onRegister }) {
  const scrollToAccess = () => {
    document.getElementById("acesso-rapido")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative z-10 flex flex-col items-center overflow-hidden bg-[#0f0f0f] text-white px-6 pt-28 md:pt-32 pb-44 md:pb-52">
      
      {/* Iluminação amarela */}
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[850px] h-[600px] bg-pensi-yellow opacity-[0.065] rounded-full blur-[130px] pointer-events-none" aria-hidden="true" />

      {/* Elementos neo-brutalistas de fundo (Posições ajustadas) */}
      <div className="absolute top-[20%] left-[8%] hidden xl:flex w-14 h-14 items-center justify-center border-[2px] border-pensi-yellow/70 rounded-lg rotate-[-14deg] shadow-[4px_4px_0px_0px_rgba(245,197,24,0.18)] pointer-events-none" aria-hidden="true">
        <Plus className="w-6 h-6 text-pensi-yellow" strokeWidth={2} />
      </div>

      <div className="absolute top-[25%] right-[10%] hidden xl:block w-12 h-12 bg-pensi-yellow border-[2px] border-black rounded-full shadow-[4px_4px_0px_0px_#FFFFFF] pointer-events-none" aria-hidden="true" />

      <div className="absolute bottom-[25%] left-[15%] hidden xl:block w-16 h-[3px] bg-pensi-yellow/70 rotate-[-22deg] pointer-events-none" aria-hidden="true" />

      <div className="absolute bottom-[28%] right-[15%] hidden xl:block text-pensi-yellow/60 rotate-[12deg] pointer-events-none" aria-hidden="true">
        <Sparkles className="w-7 h-7" strokeWidth={1.5} />
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center">
        
        {/* Etiqueta */}
        <div className="inline-flex items-center gap-2 bg-pensi-yellow text-[#111111] border-[2px] border-black rounded-md px-4 py-2 mb-9 shadow-[4px_4px_0px_0px_#FFFFFF] -rotate-2">
          <span className="w-2 h-2 bg-[#111111] rounded-full" />
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em]">
            Sua rotina, em sincronia
          </span>
          <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
        </div>

        {/* Título - Ajustado para ser mais equilibrado */}
        <h1 className="text-[28px] sm:text-[36px] md:text-[42px] font-bold tracking-[-0.03em] leading-[1.15] mb-6 text-white">
          Bem-vindo(a) ao
          <br className="hidden sm:block" />{" "}
          <span className="relative inline-block mt-1">
            Sincronismo
            <span className="text-pensi-yellow"> Pedagógico</span>
            <span className="text-pensi-yellow">.</span>
          </span>
        </h1>

        {/* Descrição - Mais leve */}
        <p className="text-gray-400 text-[14px] sm:text-[15px] max-w-xl mx-auto mb-11 leading-[1.8] font-light">
          Consulte o planejamento das suas aulas, realize os checks diários e mantenha o acompanhamento sempre em dia.
        </p>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
          
          <button
            type="button"
            onClick={onLogin}
            className="group w-full sm:w-[235px] min-h-[54px] flex items-center justify-center gap-3 bg-pensi-yellow text-[#111111] border-[2px] border-black rounded-lg px-6 py-3.5 text-[13px] font-bold shadow-[5px_5px_0px_0px_#FFFFFF] hover:bg-[#ffdb4d] hover:shadow-[2px_2px_0px_0px_#FFFFFF] hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none active:translate-x-[5px] active:translate-y-[5px] transition-all duration-200 cursor-pointer"
          >
            <LogIn className="w-[18px] h-[18px]" strokeWidth={2.5} />
            Entrar na conta
            <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={onRegister}
            className="group w-full sm:w-[235px] min-h-[54px] flex items-center justify-center gap-3 bg-[#1c1c1c] text-white border-[2px] border-pensi-yellow rounded-lg px-6 py-3.5 text-[13px] font-semibold shadow-[5px_5px_0px_0px_#F5C518] hover:bg-[#292929] hover:shadow-[2px_2px_0px_0px_#F5C518] hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none active:translate-x-[5px] active:translate-y-[5px] transition-all duration-200 cursor-pointer"
          >
            <UserPlus className="w-[18px] h-[18px]" strokeWidth={2.5} />
            Criar uma conta
            <ArrowUpRight className="w-4 h-4 text-pensi-yellow transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Explorar disciplinas */}
        <button
          type="button"
          onClick={scrollToAccess}
          aria-label="Explorar disciplinas"
          className="group flex flex-col items-center gap-3 mt-14 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
        >
          <span className="text-[10px] font-medium tracking-[0.17em] uppercase">Explore as disciplinas</span>
          <span className="flex items-center justify-center w-10 h-10 border-[1.5px] border-pensi-yellow/70 rounded-lg bg-[#1c1c1c] shadow-[3px_3px_0px_0px_#F5C518] group-hover:bg-pensi-yellow group-hover:text-[#111111] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[2px_2px_0px_0px_#F5C518] transition-all duration-200">
            <ArrowDown className="w-4 h-4" strokeWidth={1.8} />
          </span>
        </button>
      </div>

      {/* Onda de transição */}
      <div className="absolute bottom-[-1px] left-0 w-full leading-none pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="block w-full h-[75px] sm:h-[95px] md:h-[120px]" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,75 C250,30 450,110 720,75 C1000,40 1210,80 1440,45 L1440,160 L0,160 Z" fill="#e9ebee" />
          <path d="M0,98 C260,55 480,130 750,100 C1020,65 1230,105 1440,80 L1440,160 L0,160 Z" fill="#f8f9fa" />
        </svg>
      </div>
    </section>
  );
}