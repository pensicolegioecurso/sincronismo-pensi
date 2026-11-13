import { CheckCircle2, X } from "lucide-react";

export default function RegisterPasswordRequirement({ ok, text }) {
  return (
    <div className={`flex items-center gap-1 text-[10px] font-medium ${ok ? "text-green-700" : "text-gray-400"}`}>
      {ok ? <CheckCircle2 className="w-3 h-3 shrink-0" strokeWidth={2.5} /> : <X className="w-3 h-3 shrink-0 opacity-50" strokeWidth={2.5} />}
      <span>{text}</span>
    </div>
  );
}