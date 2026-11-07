
import {
  Apple,
  Bot,
  ArrowUpRight,
  Smartphone,
  CalendarDays,
  Check,
} from "lucide-react";

export default function AppDownload() {
  return (
    <section className="w-full max-w-5xl mx-auto mt-20 mb-12 px-3 sm:px-4">
      <div
        className="
          relative
          overflow-hidden
          bg-pensi-yellow
          border-[2px] border-black
          rounded-[24px]
          shadow-[9px_9px_0px_0px_#000000]
          px-7 pt-12
          sm:px-10
          md:px-14 md:pt-14
        "
      >
        {/* Pontinhos decorativos */}
        <div
          className="absolute top-5 left-6 flex items-center gap-1.5"
          aria-hidden="true"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-black" />
          <span className="w-2.5 h-2.5 rounded-full bg-black/45" />
          <span className="w-2.5 h-2.5 rounded-full bg-black/20" />
        </div>

        {/* Geometria discreta */}
        <div
          className="
            absolute -right-16 -top-20
            w-[300px] h-[300px]
            rounded-full
            border-[2px] border-black/10
            pointer-events-none
          "
          aria-hidden="true"
        />

        <div
          className="
            relative z-10
            grid grid-cols-1
            md:grid-cols-[minmax(0,1fr)_280px]
            items-center
            gap-10 md:gap-12
          "
        >
          {/* Conteúdo */}
          <div className="text-center md:text-left pb-4 md:pb-14">
            

            {/* Título */}
            <h2
              className="
                text-[30px]
                sm:text-[36px]
                md:text-[40px]
                font-medium
                tracking-[-0.045em]
                leading-[1.15]
                text-[#111111]
                mb-5
              "
            >
              Seu planejamento,
              <br />
              onde você estiver
              <span className="text-white">.</span>
            </h2>

            {/* Descrição */}
            <p
              className="
                max-w-[420px]
                mx-auto md:mx-0
                text-[14px] md:text-[15px]
                font-normal
                leading-[1.8]
                text-black/70
                mb-9
              "
            >
              Em breve, o Sincronismo Pedagógico também
              estará no seu celular. Consulte suas aulas,
              acompanhe seu planejamento e registre seus
              checks com praticidade.
            </p>

            {/* Botões de download */}
            <div
              className="
                flex flex-col sm:flex-row
                items-stretch sm:items-center
                justify-center md:justify-start
                gap-4
              "
            >
              {/* iOS */}
              <button
                type="button"
                disabled
                aria-label="Download para iOS em breve"
                className="
                  w-full sm:w-auto
                  min-w-[185px]
                  flex items-center justify-center
                  gap-3
                  px-6 py-4
                  bg-[#151515]
                  text-white
                  border-[2px] border-black
                  rounded-xl
                  shadow-[5px_5px_0px_0px_#FFFFFF]
                  cursor-not-allowed
                "
              >
                <Apple
                  className="w-7 h-7 shrink-0"
                  strokeWidth={1.7}
                />

                <div className="text-left">
                  <span className="block text-[10px] font-light text-gray-300 leading-tight">
                    Em breve para
                  </span>
                  <span className="block text-[18px] font-semibold leading-tight">
                    iOS
                  </span>
                </div>
              </button>

              {/* Android */}
              <button
                type="button"
                disabled
                aria-label="Download para Android em breve"
                className="
                  w-full sm:w-auto
                  min-w-[185px]
                  flex items-center justify-center
                  gap-3
                  px-6 py-4
                  bg-[#151515]
                  text-white
                  border-[2px] border-black
                  rounded-xl
                  shadow-[5px_5px_0px_0px_#FFFFFF]
                  cursor-not-allowed
                "
              >
                <Bot
                  className="w-7 h-7 shrink-0"
                  strokeWidth={1.7}
                />

                <div className="text-left">
                  <span className="block text-[10px] font-light text-gray-300 leading-tight">
                    Em breve para
                  </span>
                  <span className="block text-[18px] font-semibold leading-tight">
                    Android
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Celular ilustrativo */}
          <div
            className="
              relative
              flex justify-center items-end
              md:self-end
              h-[280px]
              sm:h-[320px]
              md:h-[350px]
            "
            aria-hidden="true"
          >
            {/* Círculo preto atrás do celular */}
            <div
              className="
                absolute
                bottom-[-110px]
                w-[310px] h-[310px]
                rounded-full
                bg-[#171717]
              "
            />

            {/* Celular */}
            <div
              className="
                relative
                w-[205px] sm:w-[220px]
                h-[390px]
                bg-[#111111]
                border-[5px] border-black
                rounded-[32px]
                shadow-[9px_9px_0px_0px_rgba(0,0,0,0.35)]
                p-[5px]
                translate-y-16
              "
            >
              {/* Tela */}
              <div
                className="
                  relative
                  w-full h-full
                  overflow-hidden
                  bg-[#f8f9fa]
                  rounded-[24px]
                "
              >
                {/* Câmera */}
                <div
                  className="
                    absolute top-2 left-1/2
                    -translate-x-1/2
                    w-16 h-4
                    bg-[#111111]
                    rounded-full
                    z-10
                  "
                />

                {/* Cabeçalho */}
                <div className="bg-white px-4 pt-9 pb-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-pensi-yellow rounded-full" />
                      <span className="text-[9px] font-semibold text-gray-900">
                        Sincronismo
                      </span>
                    </div>

                    <Smartphone className="w-3 h-3 text-gray-500" />
                  </div>

                  <p className="text-[8px] text-gray-400 mb-1">
                    Meu planejamento
                  </p>

                  <h3 className="text-[14px] font-semibold text-gray-900">
                    Minhas aulas
                  </h3>
                </div>

                {/* Conteúdo */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarDays className="w-3 h-3 text-gray-700" />
                    <span className="text-[9px] font-medium text-gray-700">
                      Hoje
                    </span>
                  </div>

                  {/* Aula concluída */}
                  <div
                    className="
                      bg-white
                      border-[1.5px] border-black/60
                      rounded-lg
                      p-3 mb-2
                      shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]
                    "
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-900">
                          Matemática
                        </p>
                        <p className="text-[8px] text-gray-400 mt-1">
                          Aula 01 · Planejamento
                        </p>
                      </div>

                      <div
                        className="
                          w-6 h-6
                          flex items-center justify-center
                          bg-pensi-yellow
                          border border-black
                          rounded-full
                        "
                      >
                        <Check className="w-3.5 h-3.5 text-black" />
                      </div>
                    </div>
                  </div>

                  {/* Aula pendente */}
                  <div
                    className="
                      bg-white
                      border-[1.5px] border-black/60
                      rounded-lg
                      p-3
                      shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]
                    "
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-900">
                          Ciências
                        </p>
                        <p className="text-[8px] text-gray-400 mt-1">
                          Aula 02 · Planejamento
                        </p>
                      </div>

                      <div
                        className="
                          w-6 h-6
                          border border-black/40
                          rounded-full
                        "
                      />
                    </div>
                  </div>

                  {/* Botão ilustrativo */}
                  <div
                    className="
                      flex items-center justify-center gap-1.5
                      bg-[#171717]
                      border border-black
                      rounded-lg
                      shadow-[2px_2px_0px_0px_#000000]
                      mt-4 py-2.5
                    "
                  >
                    <span className="text-[9px] font-medium text-white">
                      Ver planejamento
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-white" />
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
