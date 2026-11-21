export default function RegisterProgress({ step, totalSteps = 3, title }) {
  return (
    <div className="mt-auto w-full max-w-[260px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          Passo {step} de {totalSteps}
        </span>
        <span className="text-[11px] font-bold text-gray-500">{title}</span>
      </div>
      <div className="flex items-center gap-1.5 w-full">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((numero) => (
          <div
            key={numero}
            className={`h-2 flex-1 rounded-full transition-colors ${step >= numero ? "bg-pensi-yellow" : "bg-gray-200"}`}
          />
        ))}
      </div>
    </div>
  );
}