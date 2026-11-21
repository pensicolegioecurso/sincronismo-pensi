import RegisterPasswordRequirement from "./RegisterPasswordRequirement";

export default function RegisterPasswordStrength({ senha }) {
  const temMinLength = senha.length >= 8;
  const temMaiuscula = /[A-Z]/.test(senha);
  const temMinuscula = /[a-z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temEspecial = /[^A-Za-z0-9]/.test(senha);
  const reqAtendidos = [temMinLength, temMaiuscula, temMinuscula, temNumero, temEspecial].filter(Boolean).length;

  let forcaSenha = 0;
  if (senha.length > 0) {
    if (reqAtendidos <= 2) forcaSenha = 1;
    else if (reqAtendidos <= 4) forcaSenha = 2;
    else forcaSenha = 3;
  }

  const corForca = ["bg-gray-200", "bg-red-500", "bg-amber-400", "bg-green-500"][forcaSenha];
  const textoForca = ["", "Fraca", "Média", "Forte"][forcaSenha];

  if (senha.length === 0) return null;

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mt-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Força da senha</span>
        <span className="text-[11px] font-bold text-gray-600">{textoForca}</span>
      </div>
      <div className="flex gap-1.5 mb-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`h-1.5 flex-1 rounded-full ${forcaSenha >= n ? corForca : "bg-gray-200"}`} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <RegisterPasswordRequirement ok={temMinLength} text="8+ caracteres" />
        <RegisterPasswordRequirement ok={temMaiuscula} text="Letra maiúscula" />
        <RegisterPasswordRequirement ok={temMinuscula} text="Letra minúscula" />
        <RegisterPasswordRequirement ok={temNumero} text="Número" />
        <RegisterPasswordRequirement ok={temEspecial} text="Símbolo especial" />
      </div>
    </div>
  );
}