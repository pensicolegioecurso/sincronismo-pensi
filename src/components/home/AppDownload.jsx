import { Apple, Bot, Check, ArrowUpRight, Wifi, Signal, BatteryFull } from "lucide-react";

export default function AppDownload() {
  return (
    <section id="app-download" className="py-14 sm:py-20 px-4 sm:px-6 max-w-[945px] mx-auto">
      <div className="relative lg:min-h-[700px]">
        <h2 className="text-[2.6rem] sm:text-[3.4rem] md:text-[80px] font-black z-10 uppercase leading-[0.88] tracking-tighter mb-5 text-pensi-dark">
          Seu<br /> planejamento,<br />
          <span className="bg-pensi-yellow px-4 py-3 inline-block mt-2 transform -rotate-2 text-black">
            onde você estiver.
          </span>
        </h2>

        <p className="text-gray-600 text-sm max-w-md mb-8">
          O Sincronismo Pedagógico também estará no seu celular. Consulte suas aulas, acompanhe seu planejamento e registre seus checks com a praticidade que você já conhece.
        </p>

        {/* Botões logo depois do texto */}
        <div className="w-full max-w-[340px] sm:max-w-md">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {/* iOS — preto, sombra dura amarela */}
            <button className="group flex-1 flex items-center justify-between gap-4 bg-[#0a0a0a] rounded-[20px] px-5 py-4 sm:py-5 transition-all duration-150 cursor-not-allowed translate-y-0 shadow-[6px_6px_0_0_#F5C518]">
              <div className="flex items-center gap-3">
                <Apple className="w-7 h-7 sm:w-8 sm:h-8 text-white shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Em breve para</p>
                  <p className="text-base sm:text-lg text-white font-black leading-tight">iOS</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-white/40 shrink-0" />
            </button>

            {/* ANDROID — branco, sombra dura preta */}
            <button className="group flex-1 flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-[20px] px-5 py-4 sm:py-5 transition-all duration-150 cursor-not-allowed translate-y-0 shadow-[6px_6px_0_0_#0a0a0a]">
              <div className="flex items-center gap-3">
                <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-black shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Em breve para</p>
                  <p className="text-base sm:text-lg text-black font-black leading-tight">ANDROID</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 shrink-0" />
            </button>
          </div>

          <div className="mt-5 sm:mt-6 flex items-center gap-2 text-[11px] text-gray-500">
            <span className="w-2 h-2 rounded-full bg-pensi-yellow animate-pulse" />
            Avisaremos assim que estiver disponível.
          </div>
        </div>

        {/* Mockup do celular */}
        <div className="relative z-10 flex justify-center mt-10 sm:mt-12 lg:mt-0 lg:absolute lg:right-10 lg:top-[160px]">
          <div className="w-[220px] h-[440px] sm:w-[250px] sm:h-[500px] bg-[#1c1c1c] rounded-[44px] border-[5px] border-[#1c1c1c] shadow-2xl overflow-hidden relative ring-1 ring-white/15">
            <div className="h-full w-full bg-white rounded-[39px] overflow-hidden relative flex flex-col">
              {/* Barra de status */}
              <div className="absolute top-0 inset-x-0 h-9 px-5 flex items-center justify-between z-10">
                <span className="text-[11px] font-bold text-[#111]">9:41</span>
                <div className="absolute left-1/2 -translate-x-1/2 top-2 w-[76px] h-[22px] bg-black rounded-full" />
                <div className="flex items-center gap-1 text-[#111]">
                  <Signal className="w-3 h-3" strokeWidth={2.5} />
                  <Wifi className="w-3 h-3" strokeWidth={2.5} />
                  <BatteryFull className="w-4 h-4" strokeWidth={2} />
                </div>
              </div>

              <div className="flex flex-col flex-1 px-4 pt-12 pb-3">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-black tracking-tight text-[#111]">
                    sincronismo<span className="text-pensi-yellow">.</span>
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400">Novembro</span>
                </div>

                {/* Semana */}
                <div className="flex justify-between mt-4">
                  {[
                    ["Seg", "9"],
                    ["Ter", "10"],
                    ["Qua", "11"],
                    ["Qui", "12"],
                    ["Sex", "13"],
                  ].map(([d, n]) => (
                    <div
                      key={n}
                      className={`flex flex-col items-center justify-center w-[34px] py-2 rounded-xl ${n === "12" ? "bg-pensi-yellow text-black" : "text-gray-400"
                        }`}
                    >
                      <span className="text-[9px] font-semibold">{d}</span>
                      <span className={`text-[14px] font-black leading-tight ${n === "12" ? "text-black" : "text-[#111]/70"}`}>{n}</span>
                    </div>
                  ))}
                </div>

                {/* Título da lista */}
                <div className="flex items-baseline justify-between mt-5 mb-2.5">
                  <h3 className="text-[15px] font-black tracking-tight text-[#111]">Aulas de hoje</h3>
                  <span className="text-[10px] font-semibold text-gray-400">1 de 3</span>
                </div>

                <div className="flex flex-col gap-2">
                  {/* Concluída */}
                  <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-3.5 py-3">
                    <span className="text-[10px] font-bold text-gray-400 w-9 shrink-0">07:30</span>
                    <div className="flex-1 leading-tight">
                      <p className="text-[13px] font-bold text-[#111]">Matemática</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Aula 01 · Concluída</p>
                    </div>
                    <Check className="w-4 h-4 text-[#111]" strokeWidth={3} />
                  </div>

                  {/* Agora */}
                  <div className="bg-[#111] text-white rounded-2xl px-3.5 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white">Agora · 09:10</span>
                      <span className="text-[10px] text-gray-400">Aula 02</span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-[15px] font-black tracking-tight">Ciências</p>
                      <span className="bg-pensi-yellow text-black text-[10px] font-black px-3 py-1.5 rounded-lg">Dar aula</span>
                    </div>
                  </div>

                  {/* Próxima */}
                  <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-3.5 py-3">
                    <span className="text-[10px] font-bold text-gray-400 w-9 shrink-0">14:20</span>
                    <div className="flex-1 leading-tight">
                      <p className="text-[13px] font-bold text-[#111]">História</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Aula 03 · Pendente</p>
                    </div>
                    <span className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  </div>
                </div>

                <div className="mt-auto mx-auto w-24 h-1 rounded-full bg-black/80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}