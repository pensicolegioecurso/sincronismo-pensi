export default function LessonCard({ titulo, children, feito, onClickCheck }) {
  return (
    <div className="border border-pensi-line rounded-lg my-3 overflow-hidden bg-white">
      <div className="bg-gray-50 px-3 py-2.5 flex justify-between items-center flex-wrap gap-2 border-b border-pensi-line">
        <span className="font-bold text-xs text-pensi-dark">{titulo}</span>
        {onClickCheck && (
          <button
            onClick={onClickCheck} disabled={feito}
            className={`text-xs font-bold px-3 py-1.5 rounded-md shrink-0
              ${feito ? "bg-green-100 text-pensi-success cursor-default" : "bg-pensi-dark text-white hover:bg-black"}`}
          >
            {feito ? "✓ Concluído" : "Dar Check"}
          </button>
        )}
      </div>
      <div className="p-3 text-sm leading-relaxed text-gray-800">{children}</div>
    </div>
  );
}