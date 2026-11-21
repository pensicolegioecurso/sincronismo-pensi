export default function AuthDivider({ label = "ou e-mail" }) {
  return (
    <div className="flex items-center gap-4 mb-6 mt-2">
      <div className="flex-1 h-[1px] bg-gray-200" />
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-[1px] bg-gray-200" />
    </div>
  );
}