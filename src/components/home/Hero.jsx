import { LogIn, UserPlus, ArrowDown, CheckCircle2, BookOpen, Clock } from "lucide-react";

export default function Hero({ onLogin, onRegister }) {
  return (
    <section className="relative px-4 overflow-hidden min-h-[100svh] flex flex-col justify-center pt-24 pb-10 sm:pt-28 sm:pb-12">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-pensi-yellow/50 via-pensi-yellow/10 to-transparent rounded-full blur-[190px] pointer-events-none translate-x-1/4 -translate-y-1/4" />

      <style>
        {`
          @keyframes floatA { 0%,100% { transform: translateY(0) rotate(var(--r)); } 50% { transform: translateY(-10px) rotate(var(--r)); } }
          @keyframes floatB { 0%,100% { transform: translateY(0) rotate(var(--r)); } 50% { transform: translateY(-14px) rotate(var(--r)); } }
          .float-a { animation: floatA 5s ease-in-out infinite; }
          .float-b { animation: floatB 6s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) { .float-a, .float-b { animation: none; transform: rotate(var(--r)); } }
        `}
      </style>

      {/* Mesma largura da nav */}
      <div className="relative z-10 w-full max-w-[900px] mx-auto">
        <h1 className="text-[clamp(2.4rem,12vw,4.5rem)] font-black leading-[0.9] tracking-[-0.05em] text-[#111] mb-0 sm:mb-8 lg:mb-10 text-center lg:text-left">
          SUA <br />ROTINA EM <br /><span className=" text-black px-2.5 inline-block rounded-md  lg:origin-left">SINCRONIA.</span>
        </h1>

        <div className="grid lg:grid-cols-[1.25fr_1fr] gap-0 lg:gap-12 items-center">
          {/* Esquerda */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <p className="text-[14px] sm:text-[17px] mt-5 mb-10 sm:mt-[-15px] text-gray-500 max-w-[460px] mb-6 sm:mb-8 leading-snug mx-auto lg:mx-0">
              Organize suas aulas e registre os checks em poucos toques.{" "}
              <span className="font-bold text-[#111]">Sem planilha, sem a direção cobrando atraso.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[340px] sm:max-w-none mb-6 sm:mb-8 mx-auto lg:mx-0">
              {/* ENTRAR — preto, sombra dura amarela */}
              <button
                onClick={onLogin}
                className="group flex-1 flex items-center justify-between gap-4 bg-[#0a0a0a] rounded-[20px] px-5 py-4 sm:py-5 transition-all duration-150 translate-y-0 hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#F5C518] active:translate-y-[6px] active:shadow-none shadow-[6px_6px_0_0_#F5C518]"
              >
                <div className="flex items-center gap-3">
                  <LogIn className="w-7 h-7 sm:w-8 sm:h-8 text-white shrink-0" />
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Já tenho conta
                    </p>
                    <p className="text-base sm:text-lg text-white font-black leading-tight">
                      Entrar
                    </p>
                  </div>
                </div>
                <ArrowDown className="w-5 h-5 text-white/40 shrink-0 rotate-[-45deg] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>

              {/* CRIAR CONTA — branco, sombra dura preta */}
              <button
                onClick={onRegister}
                className="group flex-1 flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-[20px] px-5 py-4 sm:py-5 transition-all duration-150 translate-y-0 hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#0a0a0a] active:translate-y-[6px] active:shadow-none shadow-[6px_6px_0_0_#0a0a0a]"
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="w-7 h-7 sm:w-8 sm:h-8 text-black shrink-0" />
                  <div className="text-left">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      Primeiro acesso
                    </p>
                    <p className="text-base sm:text-lg text-black font-black leading-tight">
                      Criar conta
                    </p>
                  </div>
                </div>
                <ArrowDown className="w-5 h-5 text-gray-400 shrink-0 rotate-[-45deg] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>

            <button
              onClick={() => document.getElementById("acesso-rapido")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black transition-colors self-center lg:self-start"
            >
              Ver disciplinas <ArrowDown size={14} />
            </button>
          </div>

          {/* Direita: só as coisinhas flutuando */}
          <div className="mt-11 hidden lg:block lg:absolute lg:top-0 lg:right-0 lg:w-[340px] lg:h-[330px] lg:scale-[0.85] lg:origin-top-right">
            {/* Notificação 1 */}
            <div
              style={{ "--r": "-4deg" }}
              className="float-a absolute top-0 right-0 w-60 bg-white/90 backdrop-blur rounded-[20px] ring-1 ring-black/5 shadow-[0_16px_40px_rgba(0,0,0,0.10)] px-4 py-3.5"
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[13px] font-black tracking-tight text-[#111]">
                  sincronismo<span className="text-pensi-yellow">.</span>
                </span>
                <span className="text-[11px] text-gray-400">agora</span>
              </div>
              <p className="text-[13px] text-gray-500 leading-snug">
                Check de <b className="text-[#111] font-bold">Matemática</b> registrado. A direção já viu.
              </p>
            </div>

            {/* Check feito */}
            <div
              style={{ "--r": "0deg" }}
              className="float-b absolute top-[92px] left-6 w-44 bg-white p-3.5 rounded-[20px] ring-1 ring-black/5 shadow-[0_12px_30px_rgba(0,0,0,0.07)]"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 size={15} className="text-black" />
                <p className="text-[11px] font-semibold text-gray-500">Check feito</p>
              </div>
              <p className="text-base font-black tracking-tight text-[#111] leading-none mb-2.5">Matemática</p>
              <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full w-3/4 rounded-full bg-black" />
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">3 de 4 checks hoje</p>
            </div>

            {/* Selo amarelo */}
            <div
              style={{ "--r": "6deg" }}
              className="float-a absolute top-[104px] right-2 bg-black text-white text-[13px] font-black tracking-tight px-4 py-2.5 rounded-2xl ring-1 ring-black/5 "
            >
              Tudo em dia!
            </div>

            {/* Notificação 2 */}
            <div
              style={{ "--r": "3deg" }}
              className="float-b absolute top-[188px] right-4 w-60 bg-white/90 backdrop-blur rounded-[20px] ring-1 ring-black/5 shadow-[0_16px_40px_rgba(0,0,0,0.10)] px-4 py-3.5"
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[13px] font-black tracking-tight text-[#111]">
                  sincronismo<span className="text-pensi-yellow">.</span>
                </span>
                <span className="text-[11px] text-gray-400">2 min</span>
              </div>
              <p className="text-[13px] text-gray-500 leading-snug">
                Falta só o planejamento de <b className="text-[#111] font-bold">Ciências</b>. Dá tempo.
              </p>
            </div>

            {/* Próxima aula */}
            <div
              style={{ "--r": "-3deg" }}
              className="float-a absolute top-[262px] left-2 w-44 bg-[#111] p-3.5 rounded-[20px] ring-1 ring-white/10 shadow-[0_14px_30px_rgba(0,0,0,0.22)]"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Clock size={14} className="text-white" />
                <p className="text-[11px] font-semibold text-gray-400">Próxima aula</p>
              </div>
              <p className="text-base font-black tracking-tight text-white leading-none">História</p>
              <p className="text-[11px] font-bold text-white mt-1.5">Hoje, 14:20</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}