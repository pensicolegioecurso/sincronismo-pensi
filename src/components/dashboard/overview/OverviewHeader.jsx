// src/components/dashboard/overview/OverviewHeader.jsx
export default function OverviewHeader({ isDiretor, isRegional, unidadeFoco, unidadesEscopo }) {
  return (
    <section className="mb-5 mt-7 pb-4 border-b-2 border-black/40">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 bg-pensi-yellow border border-black rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
            {isDiretor ? "Direção / Visão da unidade" : isRegional ? "Dashboard geral das unidades" : "dashboard gereal das unidades"}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-none">
          {isDiretor ? unidadeFoco : isRegional ? "Olá, Regional" : "Olá, bem vindo(a) de volta"}
          <span className="text-pensi-yellow">!</span>
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-xl leading-relaxed">
          {isDiretor
            ? `Acompanhe os indicadores da unidade ${unidadeFoco}.`
            : isRegional
            ? `Indicadores das unidades: ${(unidadesEscopo || []).join(", ")}.`
            : "Acompanhamento de aulas e desempenho das unidades."}
        </p>
      </div>
    </section>
  );
}