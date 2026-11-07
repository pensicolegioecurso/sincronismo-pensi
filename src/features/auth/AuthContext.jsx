import { createContext, useState } from "react";
import { loginRequest, registerRequest, getChecks } from "../../services/api";
import { normalizarProfessor, chaveCheck } from "../../utils/formatters";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("pensi_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [checksSet, setChecksSet] = useState(new Set());
  const [loading, setLoading] = useState(false);

  async function login(email, senha) {
    setLoading(true);
    
    // ==========================================
    // LÓGICA DE TESTE (MOCK)
    // ==========================================
    if (email === "teste1@gmail.com" && senha === "123456") {
      const fakeUserProf = {
        nome: "Professor Teste",
        email: email,
        cargos: ["professor"],
        unidades: ["Icaraí 1"],
        disciplinas: ["matematica", "fisica"] 
      };
      setUser(fakeUserProf);
      localStorage.setItem("pensi_user", JSON.stringify(fakeUserProf));
      setLoading(false);
      return { ok: true, user: fakeUserProf };
    }

    if (email === "teste2@gmail.com" && senha === "123456") {
      const fakeUserAdmin = {
        nome: "Admin Teste",
        email: email,
        cargos: ["admin"],
        unidades: ["Matriz"],
        disciplinas: []
      };
      setUser(fakeUserAdmin);
      localStorage.setItem("pensi_user", JSON.stringify(fakeUserAdmin));
      setLoading(false);
      return { ok: true, user: fakeUserAdmin };
    }

    if (email === "teste3@gmail.com" && senha === "123456") {
      const fakeUserDirecao = {
        nome: "Direção Teste",
        email: email,
        cargos: ["direcao"],
        unidades: ["Icaraí 1"], // Unidade focada
        disciplinas: []
      };
      setUser(fakeUserDirecao);
      localStorage.setItem("pensi_user", JSON.stringify(fakeUserDirecao));
      setLoading(false);
      return { ok: true, user: fakeUserDirecao };
    }
    // ==========================================
    // FIM DO MOCK
    // ==========================================

    try {
      const json = await loginRequest(email, senha);
      if (json?.status === "success") {
        const prof = normalizarProfessor(json.professor);
        setUser(prof);
        localStorage.setItem("pensi_user", JSON.stringify(prof));
        
        const checks = await getChecks(prof.email);
        const set = new Set();
        (Array.isArray(checks) ? checks : []).map(normalizarCheckSafe).forEach((c) => {
          if (c.professorEmail === prof.email) set.add(chaveCheck(c));
        });
        setChecksSet(set);
        return { ok: true, user: prof };
      }
      return { ok: false, message: json?.message || "E-mail ou senha inválidos." };
    } catch (error) {
      console.error("Erro no login:", error);
      return { ok: false, message: "Erro de conexão com o servidor." };
    } finally { 
      setLoading(false); 
    }
  }

  async function register(payload) {
    setLoading(true);
    try {
      const json = await registerRequest(payload);
      if (json?.status === "success") {
        const prof = normalizarProfessor(json.professor);
        setUser(prof);
        setChecksSet(new Set());
        return { ok: true, user: prof };
      }
      return { ok: false, message: json?.message || "Erro ao cadastrar." };
    } finally { 
      setLoading(false); 
    }
  }

  function logout() {
    setUser(null);
    setChecksSet(new Set());
    localStorage.removeItem("pensi_user");
  }

  return (
    <AuthContext.Provider value={{ user, checksSet, setChecksSet, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function normalizarCheckSafe(c) {
  const pick = (obj, ...nomes) => {
    const mapa = {};
    Object.keys(obj || {}).forEach((k) => { mapa[k.toLowerCase().replace(/[^a-z0-9]/g, "")] = obj[k]; });
    for (const n of nomes) {
      const v = mapa[n];
      if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
    }
    return "";
  };
  return {
    professorEmail: pick(c, "professoremail", "email").toLowerCase(),
    disciplina: pick(c, "disciplinakey", "disciplina"),
    serie: pick(c, "serie"),
    semana: pick(c, "semana"),
    dia: pick(c, "dia"),
    aulaIndex: pick(c, "aulaindex"),
    status: pick(c, "status"),
    dataHora: pick(c, "datahora"),
  };
}