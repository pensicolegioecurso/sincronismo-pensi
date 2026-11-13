export default function RegisterCountBadge({ count, label, singular, plural }) {
  const texto = count === 1 ? (singular || label) : (plural || label);
  return (
    <span className="inline-flex items-center gap-1 bg-pensi-yellow text-black border-[2px] border-black rounded-md px-2 py-0.5 text-[10px] font-bold shadow-[2px_2px_0px_0px_#000]">
      {count} {texto}
    </span>
  );
}