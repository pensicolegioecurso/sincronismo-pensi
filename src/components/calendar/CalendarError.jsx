import { ArrowLeft, WifiOff } from "lucide-react";

export default function CalendarError({ onBack }) {
  return (
    <div className="min-h-screen bg-[#F1F2F4] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="relative z-10 bg-white border border-gray-100 rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.05)] max-w-md w-full p-10 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-8 h-8 text-red-500" strokeWidth={2.5} />
        </div>
        <h2 className="text-[22px] font-bold text-[#111111] mb-2">Não foi possível carregar.</h2>
        <p className="text-[15px] text-gray-500 font-medium mb-8">Ocorreu um erro ao buscar os dados.</p>
        <button onClick={onBack} className="w-full flex items-center justify-center gap-2 bg-pensi-yellow text-[#111111] rounded-full px-5 py-4 font-bold hover:bg-pensi-yellow-hover transition-colors">
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} /> Voltar para o início
        </button>
      </div>
    </div>
  );
}