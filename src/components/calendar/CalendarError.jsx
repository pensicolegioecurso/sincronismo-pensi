// src/components/calendar/CalendarError.jsx
import { ArrowLeft, WifiOff } from "lucide-react";

export default function CalendarError({ onBack }) {
  return (
    <div className="min-h-screen bg-[#e6e8eb] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="relative z-10 bg-white border-[3px] border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-red-100 border-[2px] border-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0px_0px_#ef4444]">
          <WifiOff className="w-8 h-8 text-red-600" strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Não foi possível carregar.</h2>
        <p className="text-sm text-gray-600 font-medium mb-8">Ocorreu um erro ao buscar os dados.</p>
        <button onClick={onBack} className="w-full flex items-center justify-center gap-2 bg-pensi-yellow text-black border-[2px] border-black rounded-lg px-5 py-3 font-semibold shadow-[3px_3px_0px_0px_#000] hover:bg-[#ffdb4d] transition-all">
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} /> Voltar para o início
        </button>
      </div>
    </div>
  );
}