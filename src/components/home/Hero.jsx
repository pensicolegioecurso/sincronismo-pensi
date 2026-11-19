import { LogIn, UserPlus, ArrowDown, ArrowUpRight } from "lucide-react";

export default function Hero({ onLogin, onRegister }) {
  const scrollToAccess = () => {
    document.getElementById("acesso-rapido")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden pt-32 pb-24 px-6">
      <div className="relative z-10 w-full max-w-[1000px] mx-auto flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-gray-200 rounded-full px-5 py-2 mb-8 shadow-sm">
          <span className="w-2 h-2 bg-pensi-yellow rounded-full animate-pulse" />
          <span className="text-[12px] font-bold uppercase tracking-wider text-pensi-dark">Sua rotina, em sincronia</span>
        </div>

        {/* Título Inclinado */}
        <div className="flex flex-col items-center justify-center mb-8 relative">
          <h1 className="text-[55px] sm:text-[70px] md:text-[80px] font-black leading-[0.85] tracking-[-0.04em] uppercase text-pensi-dark">
            <span className="block transform -rotate-2">Sincronismo</span>
            <span className="block bg-pensi-yellow px-4 py-2 mt-2 transform rotate-2">Pedagógico<span className="text-white">.</span></span>
          </h1>
        </div>

        <p className="text-[18px] sm:text-[22px] text-gray-600 font-medium leading-relaxed mb-10 max-w-2xl">
          Consulte o planejamento das suas aulas, realize os checks diários e mantenha o acompanhamento sempre em dia. <strong className="text-black font-bold">Sem planilhas, sem estresse.</strong>
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={onLogin}
            className="group w-full sm:w-auto flex items-center justify-between gap-6 bg-pensi-dark text-white rounded-full px-8 py-4 font-bold text-[16px] transition-all shadow-lg"
          >
            <span className="flex items-center gap-2">
              <LogIn className="w-5 h-5" strokeWidth={2.5} />
              Entrar na conta
            </span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              <ArrowUpRight className="w-4 h-4" strokeWidth={3} />
            </div>
          </button>

          <button 
            onClick={onRegister}
            className="group w-full sm:w-auto flex items-center justify-between gap-6 bg-white border border-gray-200 text-pensi-dark rounded-full px-8 py-4 font-bold text-[16px] transition-all shadow-sm"
          >
            <span className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" strokeWidth={2.5} />
              Criar conta
            </span>
            <ArrowUpRight className="w-5 h-5 text-gray-400" strokeWidth={2.5} />
          </button>
        </div>

        <button onClick={scrollToAccess} className="mt-16 group flex flex-col items-center gap-3 text-gray-500 hover:text-pensi-dark transition-colors">
          <span className="text-[12px] font-bold uppercase tracking-widest">Ver disciplinas</span>
          <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center group-hover:border-pensi-yellow group-hover:bg-pensi-yellow/10 transition-all">
            <ArrowDown className="w-5 h-5" strokeWidth={2.5} />
          </div>
        </button>
      </div>
    </section>
  );
}