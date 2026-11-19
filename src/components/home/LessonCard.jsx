import { CheckCircle2 } from "lucide-react";

export default function LessonCard({ titulo, children, feito, onClickCheck }) {
  return (
    <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm my-3 overflow-hidden transition-shadow hover:shadow-md">
      <div className="bg-[#F1F2F4]/50 px-5 py-4 flex justify-between items-center flex-wrap gap-3 border-b border-gray-100">
        <span className="font-bold text-[15px] text-pensi-dark">{titulo}</span>
        {onClickCheck && (
          <button
            onClick={onClickCheck} 
            disabled={feito}
            className={`flex items-center gap-2 text-[13px] font-bold px-5 py-2 rounded-full shrink-0 transition-colors
              ${feito 
                ? "bg-green-100 text-green-700 cursor-default" 
                : "bg-pensi-dark text-white hover:bg-black shadow-sm"}`}
          >
            {feito ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Concluído
              </>
            ) : (
              "Dar Check"
            )}
          </button>
        )}
      </div>
      <div className="p-5 text-[15px] leading-relaxed text-gray-600 font-medium">
        {children}
      </div>
    </div>
  );
}