import { ArrowLeft } from "lucide-react";

export default function AuthBackButton({ onClick, label = "Voltar" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-6 left-6 sm:top-8 sm:left-8 z-30 inline-flex items-center gap-2 text-[#171717] text-[12px] font-medium bg-white border-[2px] border-black rounded-lg px-4 py-2 shadow-[3px_3px_0px_0px_#000] hover:bg-gray-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150"
    >
      <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
      {label}
    </button>
  );
}