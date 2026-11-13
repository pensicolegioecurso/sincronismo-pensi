import { CheckCircle2 } from "lucide-react";

export default function RegisterGoogleBanner({ email }) {
  return (
    <div className="mb-4 flex items-start gap-2 bg-pensi-yellow/30 border-[2px] border-black rounded-lg px-3 py-2 shadow-[3px_3px_0px_0px_#000]">
      <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" strokeWidth={2.5} />
      <p className="text-[11px] font-medium text-gray-800 leading-relaxed">
        Conectado como <strong className="font-bold">{email}</strong>. Complete os dados abaixo.
      </p>
    </div>
  );
}