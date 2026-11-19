import { Apple, Bot, CalendarDays, Check, ArrowUpRight, Sparkles } from "lucide-react";

export default function AppDownload() {
  return (
    <section id="app-download" className="relative w-full py-24 px-6 bg-transparent overflow-hidden">
      
      {/* Brilho de fundo para dar profundidade */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-pensi-yellow/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="bg-pensi-dark rounded-[48px] p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-16 relative overflow-hidden shadow-2xl border border-white/5">
          
          {/* Detalhe sutil no canto do card escuro */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pensi-yellow/20 to-transparent rounded-bl-full pointer-events-none" />

          <div className="max-w-xl w-full z-10 flex flex-col justify-center">
            
       

            <h2 className="text-[40px] sm:text-[56px] font-black leading-[0.95] tracking-[-0.03em] text-white mb-6">
              Seu planejamento,<br />
              <span className="bg-pensi-yellow text-pensi-dark px-3 py-1 inline-block mt-2 transform -rotate-1">onde você estiver.</span>
            </h2>
            
            <p className="text-[16px] text-gray-400 font-medium leading-relaxed mb-10 max-w-md">
             O Sincronismo Pedagógico também estará no seu celular. Consulte suas aulas, acompanhe seu planejamento e registre seus checks com a praticidade que você já conhece.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button className="group flex-1 flex items-center justify-between gap-4 bg-white hover:bg-gray-100 rounded-2xl px-6 py-4 transition-all duration-300 cursor-not-allowed shadow-lg">
                <div className="flex items-center gap-4">
                  <Apple className="w-8 h-8 text-pensi-dark" />
                  <div className="text-left">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Em breve para</p>
                    <p className="text-[18px] text-pensi-dark font-black leading-tight">iOS</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button className="group flex-1 flex items-center justify-between gap-4 bg-pensi-yellow hover:bg-pensi-yellow-hover rounded-2xl px-6 py-4 transition-all duration-300 cursor-not-allowed shadow-lg shadow-pensi-yellow/20">
                <div className="flex items-center gap-4">
                  <Bot className="w-8 h-8 text-pensi-dark" />
                  <div className="text-left">
                    <p className="text-[10px] text-pensi-dark/70 font-bold uppercase tracking-wider">Em breve para</p>
                    <p className="text-[18px] text-pensi-dark font-black leading-tight">Android</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-pensi-dark/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          {/* Celular Refinado */}
          <div className="relative z-10 shrink-0 flex items-center justify-center lg:mr-8">
            {/* Anel de brilho atrás do celular */}
            <div className="absolute inset-0 bg-pensi-yellow/20 blur-[60px] rounded-full scale-110 pointer-events-none" />

            <div className="w-[260px] h-[530px] bg-[#1c1c1c] rounded-[48px] border-[8px] border-[#2a2a2a] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative ring-1 ring-white/10">
              
              {/* Câmera/Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20 flex items-center justify-end px-2">
                 <div className="w-2 h-2 rounded-full bg-[#1c1c1c] border border-gray-600" />
              </div>
              
              <div className="flex-1 bg-[#F1F2F4] rounded-[40px] overflow-hidden flex flex-col mt-2 relative">
                
                {/* Reflexo da tela */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-40 pointer-events-none z-30" />

                <div className="bg-white px-6 pt-10 pb-5 shadow-sm z-10">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Meu planejamento</p>
                    <div className="w-2 h-2 rounded-full bg-pensi-yellow" />
                  </div>
                  <h3 className="text-[18px] font-black text-pensi-dark">Minhas aulas</h3>
                </div>

                <div className="p-5 flex-1 overflow-y-auto space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="w-4 h-4 text-pensi-dark" />
                    <span className="text-[11px] font-bold text-pensi-dark uppercase">Hoje, 12 de Nov</span>
                  </div>

                  {/* Card de Aula Concluída */}
                  <div className="bg-white rounded-[20px] p-4 shadow-sm flex items-center justify-between border border-transparent hover:border-pensi-yellow/30 transition-colors">
                    <div>
                      <p className="text-[13px] font-bold text-pensi-dark">Matemática</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Aula 01 · Concluída</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-pensi-yellow flex items-center justify-center shadow-sm">
                      <Check className="w-4 h-4 text-pensi-dark" strokeWidth={3} />
                    </div>
                  </div>

                  {/* Card de Aula Pendente */}
                  <div className="bg-white rounded-[20px] p-4 shadow-sm flex items-center justify-between border border-transparent">
                    <div>
                      <p className="text-[13px] font-bold text-pensi-dark">Ciências</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Aula 02 · Pendente</p>
                    </div>
                    <div className="w-8 h-8 rounded-full border-[2px] border-gray-200 hover:border-pensi-yellow transition-colors cursor-pointer" />
                  </div>

                  {/* Card de Aula Pendente */}
                  <div className="bg-white rounded-[20px] p-4 shadow-sm flex items-center justify-between border border-transparent">
                    <div>
                      <p className="text-[13px] font-bold text-pensi-dark">História</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Aula 03 · Pendente</p>
                    </div>
                    <div className="w-8 h-8 rounded-full border-[2px] border-gray-200 hover:border-pensi-yellow transition-colors cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}