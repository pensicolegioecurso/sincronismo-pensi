import { ArrowLeft } from "lucide-react";

export default function AuthBackButton({ onClick, label = "Voltar" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg- black absolute top-6 left-6 sm:top-8 sm:left-8 z-30 inline-flex items-center gap-2 text-gray-500 hover:text-[#111111] text-[13px] font-bold transition-colors duration-200"
    >
      <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
      {label}
    </button>
  );
}