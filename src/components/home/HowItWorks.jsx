import { LogIn, BookOpen, CheckCheck } from "lucide-react";

const passos = [
  {
    numero: "PASSO 01",
    titulo: "Acesse sua conta",
    descricao: "Entre com seu e-mail institucional para liberar o acesso ao seu painel de disciplinas.",
    icon: LogIn,
    angulo: "-rotate-3",
  },
  {
    numero: "PASSO 02",
    titulo: "Escolha a disciplina",
    descricao: "No Acesso Rápido, clique na matéria que você leciona para abrir o calendário.",
    icon: BookOpen,
    angulo: "rotate-2",
  },
  {
    numero: "PASSO 03",
    titulo: "Dê o check",
    descricao: 'Navegue pelo calendário, encontre a aula do dia e clique em "Dar Check" para registrar.',
    icon: CheckCheck,
    angulo: "-rotate-2",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="w-full py-24 px-6 bg-transparent">
      <div className="max-w-[1100px] mx-auto">
        
        <div className="mb-16">
          <h2 className="text-[40px] sm:text-[56px] font-black leading-[0.95] tracking-[-0.03em] uppercase mb-4 text-pensi-dark">
            Como<br />Funciona.
          </h2>
          <p className="text-[18px] text-gray-500 font-medium max-w-md leading-relaxed">
            Três passos simples para manter o acompanhamento em dia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {passos.map((passo, index) => {
            const Icon = passo.icon;
            return (
              <div 
                key={index}
                className="relative bg-gradient-to-br from-pensi-yellow/40 via-pensi-yellow/10 to-transparent rounded-[32px] p-4 pt-7 shadow-sm flex flex-col"
              >
                {/* Selo Inclinado no canto da borda amarela */}
                <div className={`absolute -top-3 right-6 z-20 bg-pensi-dark text-white text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-md shadow-md ${passo.angulo}`}>
                  {passo.numero}
                </div>

                {/* Bloco Branco Interno */}
                <div className="bg-white rounded-[24px] p-6 h-full flex flex-col justify-center items-center shadow-sm relative z-10 min-h-[160px]">
                  <div className="w-14 h-14 rounded-full bg-pensi-dark flex items-center justify-center">
                     <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>

                {/* Textos Abaixo do Bloco Branco */}
                <div className="mt-5 px-2">
                  <h3 className="text-[18px] font-bold text-pensi-dark mb-1.5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-pensi-dark text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {index + 1}
                    </span>
                    {passo.titulo}
                  </h3>
                  <p className="text-[14px] text-gray-500 font-medium leading-relaxed">
                    {passo.descricao}
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