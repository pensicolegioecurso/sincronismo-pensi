import { CheckCircle2, X } from "lucide-react";

export default function RegisterPasswordRequirement({ ok, text }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-medium ${ok ? "text-green-600" : "text-gray-400"}`}>
      {ok ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} /> : <X className="w-3.5 h-3.5 shrink-0 opacity-50" strokeWidth={2.5} />}
      <span>{text}</span>
    </div>
  );
}