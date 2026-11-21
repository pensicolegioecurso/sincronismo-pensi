import { CheckCircle2 } from "lucide-react";

export default function RegisterGoogleBanner({ email }) {
  return (
    <div className="mb-5 flex items-start gap-3 bg-pensi-yellow/10 border border-pensi-yellow/30 rounded-2xl px-4 py-3">
      <CheckCircle2 className="w-5 h-5 text-pensi-dark shrink-0 mt-0.5" strokeWidth={2.5} />
      <p className="text-[13px] font-medium text-gray-600 leading-relaxed">
        Conectado como <strong className="font-bold text-[#111111]">{email}</strong>. Complete os dados abaixo.
      </p>
    </div>
  );
}