export default function AuthFormField({
  id, label, type = "text", value, onChange, placeholder,
  icon: Icon, rightElement, required = false, className = "",
}) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-[12px] font-bold text-[#111111] mb-1.5">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
        )}
        <input
          id={id} type={type} required={required} value={value}
          onChange={onChange} placeholder={placeholder}
          className={`w-full bg-white border border-gray-200 rounded-2xl ${Icon ? "pl-11" : "pl-5"} ${rightElement ? "pr-12" : "pr-5"} py-4 text-[14px] text-[#111111] placeholder:text-gray-400 outline-none focus:border-pensi-yellow focus:ring-4 focus:ring-pensi-yellow/20 transition-all duration-200 ${className}`}
        />
        {rightElement && <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightElement}</div>}
      </div>
    </div>
  );
}