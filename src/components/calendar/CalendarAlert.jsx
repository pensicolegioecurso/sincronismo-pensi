export default function CalendarAlert() {
  return (
    <div className="max-w-[1400px] mx-auto mt-6 px-6">
      <div className="bg-orange-50 border border-orange-200 rounded-[24px] p-5 text-center shadow-sm">
        <p className="text-sm font-bold text-orange-800 uppercase tracking-wide">
          Nenhuma turma ativa nesta unidade
        </p>
        <p className="text-[13px] font-medium text-orange-700 mt-1">
          A coordenação desativou as turmas desta unidade. Você pode visualizar o calendário, mas não pode registrar checks.
        </p>
      </div>
    </div>
  );
}