export default function RegisterStepHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-5 pb-4 border-b-[2px] border-black">
      {eyebrow && (
        <span className="inline-block bg-pensi-yellow text-black border-[2px] border-black rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] mb-2">
          {eyebrow}
        </span>
      )}
      <h2 className="text-lg font-bold text-gray-900 leading-tight">{title}</h2>
      {subtitle && (
        <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}