export default function RegisterCountBadge({ count, label, singular, plural }) {
  const texto = count === 1 ? (singular || label) : (plural || label);
  return (
    <span className="inline-flex items-center gap-1 bg-pensi-yellow text-[#111111] rounded-full px-3 py-1 text-[11px] font-bold">
      {count} {texto}
    </span>
  );
}