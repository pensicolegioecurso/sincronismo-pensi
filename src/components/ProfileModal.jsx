import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { X, Phone, Lock, ShieldCheck, CheckCircle2, AlertCircle, User } from "lucide-react";
import { validarSenha } from "../utils/validators";

export default function ProfileModal({ open, onClose }) {
  const { user } = useAuth();
  
  // Estados dos formulários
  const [telefone, setTelefone] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // Estado da aba ativa
  const [abaAtiva, setAbaAtiva] = useState("perfil"); // 'perfil' ou 'seguranca'

  if (!open) return null;

  // Limpa os feedbacks ao trocar de aba
  const mudarAba = (aba) => {
    setAbaAtiva(aba);
    setErro("");
    setSucesso("");
  };

  const handleSalvarDados = (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("Dados atualizados com sucesso! (Simulação)");
    setTimeout(() => setSucesso(""), 3000);
  };

  const handleTrocarSenha = (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!senhaAtual || !novaSenha) {
      return setErro("Preencha a senha atual e a nova senha.");
    }
    const erroSenha = validarSenha(novaSenha);
    if (erroSenha) {
      return setErro(erroSenha);
    }

    setSucesso("Senha alterada com sucesso! (Simulação)");
    setSenhaAtual("");
    setNovaSenha("");
    setTimeout(() => setSucesso(""), 3000);
  };

  return (
    // Backdrop desfocado
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fade-in">
      
      {/* Container Principal do Modal */}
      <div className="
        relative w-full max-w-md 
        bg-white/90 backdrop-blur-2xl 
        border border-white/60 
        shadow-[0_8px_40px_rgba(0,0,0,0.12)]
        rounded-3xl overflow-hidden
        animate-scale-in
      ">
        
        {/* CABEÇALHO DO MODAL */}
        <div className="p-6 pb-4 border-b border-gray-200/50 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Meu Perfil</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Gerencie suas informações e segurança.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-gray-100 border border-transparent rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all mt-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ABAS (TABS) */}
        <div className="flex px-6 pt-4 gap-2">
          <button
            onClick={() => mudarAba("perfil")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-t-xl text-sm font-bold transition-all border-b-2 ${
              abaAtiva === "perfil" 
                ? "border-pensi-yellow text-black bg-pensi-yellow/10" 
                : "border-transparent text-gray-500 hover:bg-gray-50"
            }`}
          >
            <User className="w-4 h-4" /> Meus Dados
          </button>
          
          <button
            onClick={() => mudarAba("seguranca")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-t-xl text-sm font-bold transition-all border-b-2 ${
              abaAtiva === "seguranca" 
                ? "border-pensi-yellow text-black bg-pensi-yellow/10" 
                : "border-transparent text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Lock className="w-4 h-4" /> Segurança
          </button>
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <div className="p-6 pt-4">
          
          {/* ABA PERFIL */}
          {abaAtiva === "perfil" && (
            <div className="animate-fade-in space-y-6">
              
              {/* Card do Avatar */}
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div className="w-14 h-14 rounded-full bg-pensi-yellow flex items-center justify-center text-black font-black text-xl border-[2px] border-black shadow-sm">
                  {user?.nome?.charAt(0) || "P"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-base font-bold text-gray-900 truncate">{user?.nome}</p>
                  <p className="text-xs text-gray-600 font-medium truncate">{user?.email}</p>
                </div>
              </div>

              {/* Form: Telefone */}
              <form onSubmit={handleSalvarDados} className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-2">
                    <Phone className="w-4 h-4 text-gray-500" /> Telefone Celular
                  </label>
                  <input 
                    type="text" 
                    value={telefone} 
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(21) 99999-9999"
                    className="w-full px-4 py-3 bg-white border-[2px] border-black rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-pensi-yellow transition-all shadow-[2px_2px_0px_0px_#000]"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-pensi-yellow text-black font-bold py-3.5 rounded-xl border-[2px] border-black shadow-[2px_2px_0px_0px_#000] hover:bg-pensi-yellow-hover active:translate-y-0.5 active:shadow-none transition-all"
                >
                  Salvar Informações
                </button>
              </form>
            </div>
          )}

          {/* ABA SEGURANÇA */}
          {abaAtiva === "seguranca" && (
            <div className="animate-fade-in space-y-6">
              
              {/* Form: Trocar Senha */}
              <form onSubmit={handleTrocarSenha} className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-2">
                    <Lock className="w-4 h-4 text-gray-500" /> Senha Atual
                  </label>
                  <input 
                    type="password" 
                    value={senhaAtual} 
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white border-[2px] border-black rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-pensi-yellow transition-all shadow-[2px_2px_0px_0px_#000]"
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-2">
                    <ShieldCheck className="w-4 h-4 text-gray-500" /> Nova Senha
                  </label>
                  <input 
                    type="password" 
                    value={novaSenha} 
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white border-[2px] border-black rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-pensi-yellow transition-all shadow-[2px_2px_0px_0px_#000]"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-white text-black font-bold py-3.5 rounded-xl border-[2px] border-black shadow-[2px_2px_0px_0px_#000] hover:bg-gray-50 active:translate-y-0.5 active:shadow-none transition-all mt-2"
                >
                  Atualizar Senha
                </button>
              </form>
            </div>
          )}

          {/* FEEDBACK DE ERRO/SUCESSO */}
          {(erro || sucesso) && (
            <div className="mt-6 animate-fade-in">
              {erro && (
                <div className="flex items-center gap-3 bg-red-100 text-red-700 px-4 py-3 rounded-xl border-[2px] border-red-600 shadow-[2px_2px_0px_0px_#dc2626] text-sm font-bold">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {erro}
                </div>
              )}
              {sucesso && (
                <div className="flex items-center gap-3 bg-green-100 text-green-700 px-4 py-3 rounded-xl border-[2px] border-green-600 shadow-[2px_2px_0px_0px_#16a34a] text-sm font-bold">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  {sucesso}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}