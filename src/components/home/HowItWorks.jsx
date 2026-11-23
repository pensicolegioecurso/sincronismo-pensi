import { LogIn, BookOpen, CheckCheck, ArrowRight, ArrowUpRight } from "lucide-react";

const passos = [
  { n: "1", titulo: "Entrar no painel", desc: "Acesse com a sua conta em segundos.", icon: LogIn },
  { n: "2", titulo: "Escolher a disciplina", desc: "Selecione a turma e a matéria do dia.", icon: BookOpen, destaque: true },
  { n: "3", titulo: "Dar o check diário", desc: "Um toque e a aula fica registrada.", icon: CheckCheck },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-14 sm:py-20 px-4 max-w-[930px] mx-auto">
      <div className="bg-[#0a0a0a] rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 md:p-10 text-white shadow-2xl flex flex-col lg:flex-row gap-8 sm:gap-12 items-center">
        {/* Esquerda: Texto */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-4xl sm:text-5xl md:text-[58px] font-black uppercase leading-[0.9] tracking-tighter mb-5 sm:mb-6 text-white">
            Como<br />
            funciona<br />
            <span className="text-black px-2 inline-block mt-2" style={{ background: "#F5C542" }}>o seu</span><br />
            <span className="text-black px-2 inline-block" style={{ background: "#F5C542" }}>sincronismo</span><br />
            na rotina?
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm max-w-sm mb-6 sm:mb-8 leading-relaxed">
            Chega de planilhas perdidas ou cadernos bagunçados. O Sincronismo organiza a sua rotina pedagógica em poucos cliques.
          </p>

          <button
            onClick={() => document.getElementById("acesso-rapido")?.scrollIntoView({ behavior: "smooth" })}
            className="border border-white/30 text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-white hover:text-black transition-colors w-fit"
          >
            Acessar painel <ArrowRight size={14} />
          </button>
        </div>

        {/* Direita: passos */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4.5">
          {passos.map(({ n, titulo, desc, icon: Icon, destaque }, i) => (
            <div
              key={n}
              className={`group flex items-center gap-2 rounded-2xl px-5 sm:px-10 py-3.5 ${
                destaque
                  ? "bg-pensi-yellow text-black lg:translate-x-5 "
                  : "bg-[#171717] text-white"
              }`}
            >
              <span
                className={`text-2xl sm:text-3xl font-black leading-none tracking-tighter w-6 shrink-0 ${
                  destaque ? "text-black" : "text-white/25"
                }`}
              >
                {n}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] sm:text-sm font-extrabold tracking-tight leading-tight">{titulo}</p>
                <p className={`text-[10px] sm:text-[11px] mt-0.5 leading-snug ${destaque ? "text-black/70" : "text-gray-400"}`}>{desc}</p>
              </div>

              <Icon size={18} className={destaque ? "text-black" : "text-pensi-yellow"} />
            </div>
          ))}

          {/* Fechamento */}
          <div className="flex items-center gap-4 rounded-2xl border border-dashed border-white/20 px-4 sm:px-5 py-3.5 mt-1">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-[11px] text-gray-400 mb-0.5">E no final do mês?</p>
              <p className="text-[13px] sm:text-sm font-extrabold tracking-tight leading-tight text-white">
                Relatórios prontos para a direção.
              </p>
            </div>
            <ArrowUpRight size={18} className="text-white/50 shrink-0" />
          </div>
        </div>
      </div>
    </section>
  );
}