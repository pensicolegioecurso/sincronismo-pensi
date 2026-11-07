import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { DISCIPLINAS_POR_ANO } from "../data/disciplinas";
import { UNIDADES } from "../data/unidades";
import { validarSenha, validarEmailInstitucional } from "../utils/validators";

export default function AuthModal({ open, onClose }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState("login");
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [erro, setErro] = useState("");

  // login
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // registro
  const [nome, setNome] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regSenha, setRegSenha] = useState("");
  const [regSenha2, setRegSenha2] = useState("");
  const [disciplinas, setDisciplinas] = useState([]);
  const [unidades, setUnidades] = useState([]);

  if (!open) return null;

  async function handleLogin(e) {
    e.preventDefault(); setErro("");
    if (!email || !senha) return setErro("Informe e-mail e senha.");
    setLoadingLocal(true);
    const res = await login(email.trim().toLowerCase(), senha.trim());
    setLoadingLocal(false);
    if (res.ok) { onClose(); setEmail(""); setSenha(""); }
    else setErro(res.message);
  }

  async function handleRegister(e) {
    e.preventDefault(); setErro("");
    if (!nome || !regEmail || !regSenha) return setErro("Preencha todos os campos obrigatórios.");
    if (!validarEmailInstitucional(regEmail)) return setErro("E-mail inválido.");
    if (regSenha !== regSenha2) return setErro("As senhas não coincidem.");
    const senhaErro = validarSenha(regSenha);
    if (senhaErro) return setErro(senhaErro);
    if (!disciplinas.length) return setErro("Selecione ao menos uma disciplina.");
    if (!unidades.length) return setErro("Selecione ao menos uma unidade.");

    setLoadingLocal(true);
    const res = await register({
      nome: nome.trim(), email: regEmail.trim().toLowerCase(),
      senha: regSenha.trim(), disciplinas, unidade: unidades.join(","),
    });
    setLoadingLocal(false);
    if (res.ok) { onClose(); }
    else setErro(res.message);
  }

  const disciplinasLista = Object.entries(
    Object.values(DISCIPLINAS_POR_ANO).reduce((acc, ano) => {
      Object.entries(ano).forEach(([k, v]) => { acc[k] = v.nome; });
      return acc;
    }, {})
  ).sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-2xl">
        <button className="absolute top-3 right-3 text-gray-500 hover:text-pensi-dark" onClick={onClose}>✕</button>

        <div className="flex gap-2.5 mb-6">
          <button
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold border ${tab === "login" ? "bg-pensi-yellow-light border-pensi-yellow text-pensi-dark" : "bg-gray-100 border-gray-200 text-gray-500"}`}
            onClick={() => setTab("login")}
          >Entrar</button>
          <button
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold border ${tab === "register" ? "bg-pensi-yellow-light border-pensi-yellow text-pensi-dark" : "bg-gray-100 border-gray-200 text-gray-500"}`}
            onClick={() => setTab("register")}
          >Criar Conta</button>
        </div>

        {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-md p-2.5 mb-3">{erro}</div>}

        {tab === "login" ? (
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">E-mail institucional</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome.sobrenome@pensi.com.br" />
            </div>
            <div className="mb-3">
              <label className="form-label">Senha</label>
              <input type="password" className="form-control" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loadingLocal} className="w-full bg-pensi-yellow text-pensi-dark font-bold py-3 rounded-md mt-2 hover:bg-pensi-yellow-hover disabled:opacity-60">
              {loadingLocal ? "Entrando..." : "Entrar"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label">Nome completo</label>
              <input className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">E-mail institucional</label>
              <input type="email" className="form-control" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="form-label">Senha</label>
                <input type="password" className="form-control" value={regSenha} onChange={(e) => setRegSenha(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Repetir senha</label>
                <input type="password" className="form-control" value={regSenha2} onChange={(e) => setRegSenha2(e.target.value)} />
              </div>
            </div>
            <p className="text-[11px] text-pensi-muted mb-3">
              Mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial.
            </p>

            <div className="mb-3">
              <label className="form-label">Disciplinas <span className="font-normal text-pensi-muted">— marque todas</span></label>
              <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto border border-pensi-line rounded-md p-2 bg-gray-50">
                {disciplinasLista.map(([k, nomeD]) => (
                  <label key={k} className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                    <input type="checkbox" checked={disciplinas.includes(k)}
                      onChange={(e) => setDisciplinas((prev) => e.target.checked ? [...prev, k] : prev.filter((x) => x !== k))}
                      className="accent-pensi-yellow"
                    />
                    {nomeD}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Unidades <span className="font-normal text-pensi-muted">— marque todas</span></label>
              <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto border border-pensi-line rounded-md p-2 bg-gray-50">
                {UNIDADES.map((u) => (
                  <label key={u} className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                    <input type="checkbox" checked={unidades.includes(u)}
                      onChange={(e) => setUnidades((prev) => e.target.checked ? [...prev, u] : prev.filter((x) => x !== u))}
                      className="accent-pensi-yellow"
                    />
                    {u}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loadingLocal} className="w-full bg-pensi-yellow text-pensi-dark font-bold py-3 rounded-md hover:bg-pensi-yellow-hover disabled:opacity-60">
              {loadingLocal ? "Cadastrando..." : "Criar conta"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}