export default function AuthFormField({
  id, label, type = "text", value, onChange, placeholder,
  icon: Icon, rightElement, required = false, className = "",
}) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-[11px] font-medium text-gray-800 mb-1">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
        )}
        <input
          id={id} type={type} required={required} value={value}
          onChange={onChange} placeholder={placeholder}
          className={`w-full bg-gray-50 border-[2px] border-gray-300 rounded-lg ${Icon ? "pl-9" : "pl-4"} ${rightElement ? "pr-10" : "pr-4"} py-2.5 text-[13px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:bg-white focus:shadow-[3px_3px_0px_0px_#F5C518] transition-all duration-200 ${className}`}
        />
        {rightElement && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>}
      </div>
    </div>
  );
}