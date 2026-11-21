export default function RegisterStepHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-6 pb-4 border-b border-gray-100">
      {eyebrow && (
        <span className="inline-block bg-pensi-yellow text-[#111111] rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="text-[20px] font-bold text-[#111111] leading-tight">{title}</h2>
      {subtitle && (
        <p className="text-[13px] font-medium text-gray-500 mt-2 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}