export default function ConfigHeader() {
  return (
    <header className="mb-7 mt-7 flex flex-col gap-5 border-b-2 border-black/40 pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full border border-black bg-pensi-yellow" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            Unidades, turmas e calendário acadêmico
          </span>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
          Configurações<span className="text-pensi-yellow">.</span>
        </h1>

        <p className="mt-2 max-w-xl text-sm text-gray-500">
          Gerencie unidades, turmas, calendários e permissões de acesso.
        </p>
      </div>
    </header>
  );
}