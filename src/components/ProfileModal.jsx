import { useState } from "react";
import {
  X, User, Mail, LogOut, Link2, Unlink, CheckCircle2, AlertCircle, Loader2,
  Lock, Eye, EyeOff, KeyRound,
} from "lucide-react";
import {
  GoogleAuthProvider, linkWithPopup, unlink,
  EmailAuthProvider, reauthenticateWithCredential, updatePassword,
} from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuth } from "../hooks/useAuth";

export default function ProfileModal({ open, onClose }) {
  const { user, logout } = useAuth();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [, setAtualizar] = useState(0); // força re-render após vincular/desvincular

  // --- ESTADO DA TROCA DE SENHA ---
  const [senhaAberta, setSenhaAberta] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarAtual, setMostrarAtual] = useState(false);
  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarConf, setMostrarConf] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [erroSenha, setErroSenha] = useState("");
  const [sucessoSenha, setSucessoSenha] = useState("");

  if (!open || !user) return null;

  // FONTE CONFIÁVEL: providerData do usuário autenticado
  const providers = auth.currentUser?.providerData?.map((p) => p.providerId) || [];
  const temSenha = providers.includes("password");
  const temGoogle = providers.includes("google.com");

  // ---- VINCULAR / DESVINCULAR GOOGLE ----
  const handleVincularGoogle = async () => {
    setErro(""); setSucesso(""); setCarregando(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await linkWithPopup(auth.currentUser, provider);
      setSucesso("Conta do Google vinculada com sucesso!");
      setAtualizar((n) => n + 1);
    } catch (e) {
      console.error(e);
      if (e.code === "auth/credential-already-in-use") {
        setErro("Esta conta do Google já está vinculada a outro usuário.");
      } else if (e.code === "auth/email-already-in-use") {
        setErro("Este e-mail já está em uso por outra conta.");
      } else if (e.code === "auth/popup-closed-by-user") {
        setErro("Vinculação cancelada.");
      } else if (e.code === "auth/provider-already-linked") {
        setErro("Conta do Google já está vinculada.");
        setAtualizar((n) => n + 1);
      } else {
        setErro("Erro ao vincular. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleDesvincularGoogle = async () => {
    setErro(""); setSucesso(""); setCarregando(true);
    try {
      if (!temSenha) {
        setErro("Você precisa ter uma senha cadastrada antes de desvincular o Google.");
        return;
      }
      await unlink(auth.currentUser, "google.com");
      setSucesso("Conta do Google desvinculada.");
      setAtualizar((n) => n + 1);
    } catch (e) {
      console.error(e);
      setErro("Erro ao desvincular. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  // ---- TROCAR SENHA ----
  const resetarFormSenha = () => {
    setSenhaAtual(""); setNovaSenha(""); setConfirmarSenha("");
    setErroSenha(""); setSucessoSenha("");
    setMostrarAtual(false); setMostrarNova(false); setMostrarConf(false);
  };

  const validarNovaSenha = (s) => {
    if (s.length < 6) return "A senha deve ter pelo menos 6 caracteres.";
    return null;
  };

  const handleTrocarSenha = async (e) => {
    e.preventDefault();
    setErroSenha(""); setSucessoSenha("");

    // Se já tem senha, precisa confirmar a atual. Se não tem (só Google),
    // vamos apenas definir a primeira senha sem reauth.
    if (temSenha && !senhaAtual) {
      return setErroSenha("Digite sua senha atual.");
    }
    const erroValid = validarNovaSenha(novaSenha);
    if (erroValid) return setErroSenha(erroValid);
    if (novaSenha !== confirmarSenha) {
      return setErroSenha("As senhas não coincidem.");
    }
    if (temSenha && novaSenha === senhaAtual) {
      return setErroSenha("A nova senha precisa ser diferente da atual.");
    }

    setSalvandoSenha(true);
    try {
      // 1) Se já tem senha: reautenticar
      if (temSenha) {
        const credential = EmailAuthProvider.credential(user.email, senhaAtual);
        await reauthenticateWithCredential(auth.currentUser, credential);
      }
      // 2) Atualizar a senha
      await updatePassword(auth.currentUser, novaSenha);

      setSucessoSenha(temSenha ? "Senha alterada com sucesso!" : "Senha criada com sucesso!");
      resetarFormSenha();
      // manter sucesso visível
      setSucessoSenha(temSenha ? "Senha alterada com sucesso!" : "Senha criada com sucesso!");
      setAtualizar((n) => n + 1);
    } catch (e) {
      console.error(e);
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        setErroSenha("Senha atual incorreta.");
      } else if (e.code === "auth/weak-password") {
        setErroSenha("A nova senha é muito fraca.");
      } else if (e.code === "auth/requires-recent-login") {
        setErroSenha("Sessão expirada. Faça login novamente para alterar a senha.");
      } else {
        setErroSenha("Erro ao alterar senha. Tente novamente.");
      }
    } finally {
      setSalvandoSenha(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border-2 border-black rounded-md shadow-[6px_6px_0px_#000] w-full max-w-md max-h-[92vh] flex flex-col">
        <div className="bg-[#171717] text-white px-4 py-3 border-b-2 border-black flex justify-between items-center rounded-t-md shrink-0">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-pensi-yellow" />
            <h3 className="font-black text-xs uppercase tracking-wide">Meu perfil</h3>
          </div>
          <button onClick={onClose} className="p-1.5 border border-white/30 rounded-md hover:bg-white/10">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {erro && (
            <div className="flex items-start gap-2 p-2 bg-red-100 border-2 border-red-400 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-red-700">{erro}</p>
            </div>
          )}
          {sucesso && (
            <div className="flex items-start gap-2 p-2 bg-green-100 border-2 border-green-400 rounded-md">
              <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-green-700">{sucesso}</p>
            </div>
          )}

          {/* Identificação */}
          <div className="flex items-center gap-3 pb-3 border-b-2 border-dashed border-gray-200">
            <div className="w-12 h-12 bg-pensi-yellow border-2 border-black rounded-md flex items-center justify-center text-lg font-black text-black shadow-[2px_2px_0px_#000]">
              {(user.nome || user.email || "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-black text-black truncate">{user.nome || "Sem nome"}</h4>
              <p className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                <Mail className="w-2.5 h-2.5" /> {user.email}
              </p>
            </div>
          </div>

          {/* Métodos de login */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">
              Métodos de login
            </p>
            <div className="space-y-2">
              {/* Senha */}
              <div className={`flex items-center gap-2 p-2.5 border-2 rounded-md ${temSenha ? "border-black bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                <div className={`w-7 h-7 border-2 border-black rounded-md flex items-center justify-center ${temSenha ? "bg-green-300" : "bg-gray-200"}`}>
                  <Mail className="w-3.5 h-3.5 text-black" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-black text-black">E-mail e senha</p>
                  <p className="text-[9px] text-gray-500">{temSenha ? "Vinculado" : "Não vinculado"}</p>
                </div>
                {temSenha && <CheckCircle2 className="w-4 h-4 text-green-700" />}
              </div>

              {/* Google */}
              <div className={`flex items-center gap-2 p-2.5 border-2 rounded-md ${temGoogle ? "border-black bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                <div className={`w-7 h-7 border-2 border-black rounded-md flex items-center justify-center ${temGoogle ? "bg-green-300" : "bg-gray-200"}`}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-black text-black">Google</p>
                  <p className="text-[9px] text-gray-500">{temGoogle ? "Vinculado" : "Não vinculado"}</p>
                </div>
                {temGoogle && <CheckCircle2 className="w-4 h-4 text-green-700" />}
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="space-y-2 pt-2">
            {!temGoogle && (
              <button onClick={handleVincularGoogle} disabled={carregando}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-pensi-yellow border-2 border-black rounded-md text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-60">
                {carregando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                Vincular conta do Google
              </button>
            )}
            {temGoogle && temSenha && (
              <button onClick={handleDesvincularGoogle} disabled={carregando}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border-2 border-black rounded-md text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:bg-gray-50 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-60">
                {carregando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                Desvincular Google
              </button>
            )}
            {temGoogle && !temSenha && (
              <p className="text-[9px] text-gray-500 italic text-center">
                O Google é seu único método de login. Cadastre uma senha antes de desvincular.
              </p>
            )}
            {temSenha && !temGoogle && (
              <p className="text-[9px] text-gray-500 italic text-center">
                Você pode vincular o Google para entrar com um clique nas próximas vezes.
              </p>
            )}
          </div>

          {/* TROCAR / CRIAR SENHA */}
          <div className="pt-3 border-t-2 border-dashed border-gray-200">
            <button
              onClick={() => {
                setSenhaAberta((v) => !v);
                if (!senhaAberta) resetarFormSenha();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border-2 border-black rounded-md text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:bg-gray-50 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" />
              {temSenha ? "Trocar senha" : "Criar senha"}
            </button>

            {senhaAberta && (
              <form onSubmit={handleTrocarSenha} className="mt-3 space-y-2 p-3 border-2 border-black rounded-md bg-gray-50 animate-fade-in">
                {erroSenha && (
                  <div className="flex items-start gap-1.5 p-1.5 bg-red-100 border border-red-400 rounded">
                    <AlertCircle className="w-3 h-3 text-red-700 shrink-0 mt-0.5" />
                    <p className="text-[9px] font-bold text-red-700">{erroSenha}</p>
                  </div>
                )}
                {sucessoSenha && (
                  <div className="flex items-start gap-1.5 p-1.5 bg-green-100 border border-green-400 rounded">
                    <CheckCircle2 className="w-3 h-3 text-green-700 shrink-0 mt-0.5" />
                    <p className="text-[9px] font-bold text-green-700">{sucessoSenha}</p>
                  </div>
                )}

                {temSenha && (
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">
                      Senha atual
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={mostrarAtual ? "text" : "password"}
                        value={senhaAtual}
                        onChange={(e) => setSenhaAtual(e.target.value)}
                        className="w-full border-2 border-black rounded-md pl-9 pr-9 py-2 text-[12px] outline-none focus:bg-white transition-colors"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setMostrarAtual((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                        {mostrarAtual ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">
                    {temSenha ? "Nova senha" : "Senha"}
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={mostrarNova ? "text" : "password"}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      className="w-full border-2 border-black rounded-md pl-9 pr-9 py-2 text-[12px] outline-none focus:bg-white transition-colors"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button type="button" onClick={() => setMostrarNova((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                      {mostrarNova ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">
                    Confirmar {temSenha ? "nova senha" : "senha"}
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={mostrarConf ? "text" : "password"}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      className="w-full border-2 border-black rounded-md pl-9 pr-9 py-2 text-[12px] outline-none focus:bg-white transition-colors"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setMostrarConf((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                      {mostrarConf ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setSenhaAberta(false); resetarFormSenha(); }}
                    className="flex-1 py-2 bg-white text-black border-2 border-black rounded-md text-[9px] font-black uppercase shadow-[2px_2px_0px_#000]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvandoSenha}
                    className="flex-1 py-2 bg-pensi-yellow text-black border-2 border-black rounded-md text-[9px] font-black uppercase shadow-[2px_2px_0px_#000] disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    {salvandoSenha ? <Loader2 className="w-3 h-3 animate-spin" /> : <KeyRound className="w-3 h-3" />}
                    {temSenha ? "Salvar nova senha" : "Criar senha"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Logout */}
          <div className="pt-3 border-t-2 border-dashed border-gray-200">
            <button onClick={() => { onClose(); logout(); }}
              className="w-full flex items-center justify-center gap-2 py-2 bg-red-100 text-red-700 border-2 border-black rounded-md text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:bg-red-200 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
              <LogOut className="w-3.5 h-3.5" /> Sair da conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}