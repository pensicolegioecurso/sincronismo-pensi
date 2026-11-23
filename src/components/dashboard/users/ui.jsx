// Classes e constantes compartilhadas pela área de Usuários

export const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-black";

export const labelClass =
  "mb-1.5 block text-[10px] font-black uppercase tracking-wider text-gray-500";

export const btnPrimary =
  "flex items-center justify-center gap-2 rounded-xl bg-pensi-yellow px-5 py-3 text-[11px] font-black uppercase tracking-wide text-black shadow-sm transition hover:brightness-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";

export const btnSecondary =
  "flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-[11px] font-black uppercase tracking-wide text-gray-700 transition hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";

export const btnDanger =
  "flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-3 text-[11px] font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-rose-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";

export const panelClass = "rounded-2xl border border-gray-100 bg-gray-50/60 p-4";

export const optionClass = (ativo) =>
  `flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
    ativo
      ? "border-black bg-gray-50 shadow-sm"
      : "border-gray-200 bg-white hover:border-gray-400"
  }`;

export const chipClass = (ativo) =>
  `rounded-full border px-3 py-1.5 text-[11px] font-bold transition active:scale-95 ${
    ativo
      ? "border-gray-900 bg-gray-900 text-white"
      : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
  }`;

export const CARGOS = {
  diretor: ["Diretor", "bg-violet-100 text-violet-800"],
  coordenador: ["Coordenador", "bg-indigo-100 text-indigo-800"],
  nucleo: ["Núcleo", "bg-sky-100 text-sky-800"],
  professor: ["Professor", "bg-emerald-100 text-emerald-800"],
  regional: ["Regional", "bg-orange-100 text-orange-800"],
  admin: ["Admin", "bg-rose-100 text-rose-800"],
};