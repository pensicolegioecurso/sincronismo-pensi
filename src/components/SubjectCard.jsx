import { BookOpen } from "lucide-react";

export default function SubjectCard({ card, onClick }) {
  const { nome } = card;

  return (
    <button
      onClick={onClick}
      className="group relative w-full flex flex-col text-left rounded-[28px] p-2.5 pb-5 bg-gradient-to-br from-[#fcf8e3] via-[#fdfaf1] to-[#f8f8f8] shadow-sm hover:shadow-md transition-all duration-300 ease-out cursor-pointer"
    >
      <div className="absolute -top-2.5 right-5 z-20 bg-[#111] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-md rotate-2 group-hover:rotate-0 transition-transform">
        Acessar
      </div>

      <div className="bg-white rounded-[22px] p-6 h-[140px] flex flex-col justify-center items-center shadow-sm border border-gray-100 relative z-10 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#111] flex items-center justify-center mb-1.5">
          <BookOpen className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </div>
        <h3 className="w-full text-center text-sm font-bold tracking-tight leading-tight text-[#111] line-clamp-2">
          {nome}
        </h3>
      </div>

      <div className="px-2 flex items-center justify-between mt-auto">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Planejamento</span>
        <div className="w-1.5 h-1.5 rounded-full bg-pensi-yellow group-hover:scale-150 transition-transform" />
      </div>
    </button>
  );
}