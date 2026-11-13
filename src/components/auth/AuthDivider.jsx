export default function AuthDivider({ label = "ou e-mail" }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-1 h-[1px] bg-gray-200" />
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-[1px] bg-gray-200" />
    </div>
  );
}