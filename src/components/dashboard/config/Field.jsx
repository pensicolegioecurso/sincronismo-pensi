export default function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
        {label}
      </span>
      {children}
    </label>
  );
}