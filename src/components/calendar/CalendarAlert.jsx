// src/components/calendar/CalendarAlert.jsx
export default function CalendarAlert() {
  return (
    <div className="max-w-[1400px] mx-auto mt-6 px-6">
      <div className="bg-orange-50 border-2 border-orange-400 rounded-xl p-4 text-center shadow-[3px_3px_0px_0px_#f97316]">
        <p className="text-sm font-black text-orange-800 uppercase tracking-wide">
          Nenhuma turma ativa nesta unidade
        </p>
        <p className="text-[11px] text-orange-700 mt-1">
          A coordenação desativou as turmas desta unidade. Você pode visualizar o calendário, mas não pode registrar checks.
        </p>
      </div>
    </div>
  );
}