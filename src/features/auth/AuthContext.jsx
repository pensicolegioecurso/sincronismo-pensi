
import { createContext, useState, useEffect, useCallback } from "react";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../../services/firebase";
import { ouvirChecksDoProfessor } from "../../services/firestoreChecks";
import { normalizarCPF, validarCPF } from "../../services/cpfService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checksSet, setChecksSet] = useState(new Set());

  const primeiroAcessoPendente =
    user?.origem === "cadastro-manual" &&
    user?.primeiroAcessoConcluido !== true;

  const cpfPendente =
    !!user &&
    user?.origem !== "cadastro-manual" &&
    user?.cpfVinculado !== true;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setChecksSet(new Set());
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...snap.data(),
          });
        } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            nome: firebaseUser.displayName || "",
            cargos: [],
            perfilIncompleto: true,
            cpfVinculado: false,
          });
        }
      } catch (err) {
        console.error("Erro ao buscar dados do usuário:", err);

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          perfilIncompleto: true,
          cpfVinculado: false,
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setChecksSet(new Set());
      return;
    }

    const unsubscribe = ouvirChecksDoProfessor(user.uid, (checks) => {
      setChecksSet(checks);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const register = useCallback(async ({
    nome,
    email,
    senha,
    disciplinas,
    unidade,
    series,
    turmas,
  }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      const firebaseUser = cred.user;

      if (nome) {
        await updateProfile(firebaseUser, { displayName: nome });
      }

      const userData = {
        uid: firebaseUser.uid,
        nome: nome || "",
        email,
        disciplinas: disciplinas || [],
        unidade: unidade || "",
        series: series || "",
        turmas: turmas || "",
        cargos: ["professor"],
        origem: "cadastro-proprio",
        cpfVinculado: false,
        perfilIncompleto: false,
        primeiroAcessoConcluido: true,
        criadoEm: serverTimestamp(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), userData);

      setUser({
        ...userData,
        uid: firebaseUser.uid,
        email,
      });

      return { ok: true, user: firebaseUser, uid: firebaseUser.uid };
    } catch (err) {
      console.error("Erro no register:", err);

      let message = "Não foi possível criar a conta.";

      if (err.code === "auth/email-already-in-use") {
        message = "Este e-mail já possui uma conta.";
      } else if (err.code === "auth/weak-password") {
        message = "A senha é muito fraca.";
      } else if (err.code === "auth/invalid-email") {
        message = "E-mail inválido.";
      }

      return { ok: false, message };
    }
  }, []);

  const atualizarPerfil = useCallback(async (dados) => {
    try {
      if (!auth.currentUser) {
        throw new Error("Sem usuário autenticado.");
      }

      const uid = auth.currentUser.uid;
      const userRef = doc(db, "users", uid);

      const userData = {
        uid,
        email: auth.currentUser.email,
        nome: dados.nome || auth.currentUser.displayName || "",
        disciplinas: dados.disciplinas || [],
        unidade: dados.unidade || "",
        series: dados.series || "",
        turmas: dados.turmas || "",
        cargos: dados.cargos || ["professor"],
        origem: "cadastro-proprio",
        cpfVinculado: false,
        perfilIncompleto: false,
        primeiroAcessoConcluido: true,
      };

      await setDoc(userRef, userData, { merge: true });

      setUser((prev) => ({
        ...prev,
        ...userData,
      }));

      return { ok: true };
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);

      return {
        ok: false,
        message: "Não foi possível salvar os dados.",
      };
    }
  }, []);

  const atualizarUsername = useCallback(async (valor) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return { ok: false, message: "Faça login novamente para alterar seu @username." };

    const username = String(valor || "").trim().replace(/^@+/, "").toLowerCase();
    if (!/^[a-z0-9][a-z0-9._]{2,19}$/.test(username) || /[._]{2}|[._]$/.test(username)) {
      return { ok: false, message: "Use de 3 a 20 caracteres: letras, números, ponto ou underline. Não termine com pontuação." };
    }

    const userRef = doc(db, "users", firebaseUser.uid);
    try {
      await setDoc(userRef, { username, atualizadoEm: serverTimestamp() }, { merge: true });

      setUser((prev) => ({ ...prev, username }));
      return { ok: true, username };
    } catch (err) {
      console.error("Erro ao atualizar username:", err);
      return { ok: false, message: err.message || "Não foi possível atualizar seu @username." };
    }
  }, [user?.username]);

  const vincularCPF = useCallback(async (valor) => {
    try {
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        throw new Error("Nenhum usuário autenticado.");
      }

      const cpf = normalizarCPF(valor);

      if (!validarCPF(cpf)) {
        throw new Error("O CPF informado é inválido.");
      }

      const cpfRef = doc(db, "cpfs", cpf);
      const userRef = doc(db, "users", firebaseUser.uid);

      const { runTransaction } = await import("firebase/firestore");

      await runTransaction(db, async (transaction) => {
        const [cpfSnap, userSnap] = await Promise.all([
          transaction.get(cpfRef),
          transaction.get(userRef),
        ]);

        if (!userSnap.exists()) {
          throw new Error("Perfil do usuário não encontrado.");
        }

        if (!cpfSnap.exists()) {
          throw new Error(
            "CPF não autorizado. Solicite à administração o pré-cadastro do seu CPF."
          );
        }

        const dadosCPF = cpfSnap.data();

        if (dadosCPF.origem !== "cadastro-cpf") {
          throw new Error("Este CPF não está liberado para cadastro público.");
        }

        if (dadosCPF.uid) {
          throw new Error("Este CPF já está vinculado a uma conta.");
        }

        transaction.update(userRef, {
          cpf,
          cpfVinculado: true,
          atualizadoEm: serverTimestamp(),
        });

        transaction.update(cpfRef, {
          uid: firebaseUser.uid,
          origem: "pre-cadastro-vinculado",
          atualizadoEm: serverTimestamp(),
        });
      });

      setUser((prev) => ({
        ...prev,
        cpf,
        cpfVinculado: true,
      }));

      return { ok: true };
    } catch (err) {
      console.error("Erro ao vincular CPF:", err);

      return {
        ok: false,
        message: err.message || "Não foi possível vincular o CPF.",
      };
    }
  }, []);

  const login = useCallback(async (email, senha) => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      return { ok: true };
    } catch (err) {
      console.error("Erro no login:", err);
      return { ok: false, message: "E-mail ou senha incorretos." };
    }
  }, []);

  const concluirPrimeiroAcesso = useCallback(async (novaSenha) => {
    try {
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        throw new Error("Nenhum usuário autenticado.");
      }

      const userRef = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        throw new Error("Cadastro do usuário não encontrado.");
      }

      const dados = snap.data();

      if (
        dados.origem !== "cadastro-manual" ||
        dados.primeiroAcessoConcluido === true
      ) {
        throw new Error("Este usuário não possui primeiro acesso pendente.");
      }

      await updatePassword(firebaseUser, novaSenha);

      await updateDoc(userRef, {
        primeiroAcessoConcluido: true,
        atualizadoEm: serverTimestamp(),
      });

      setUser((prev) => ({
        ...prev,
        primeiroAcessoConcluido: true,
      }));

      return { ok: true };
    } catch (err) {
      console.error("Erro ao concluir primeiro acesso:", err);

      let message = "Não foi possível atualizar sua senha. Tente novamente.";

      if (err.code === "auth/weak-password") {
        message = "A senha deve possuir pelo menos 6 caracteres.";
      } else if (err.code === "auth/requires-recent-login") {
        message = "Sua sessão expirou. Entre novamente.";
      } else if (err.message) {
        message = err.message;
      }

      return { ok: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      return { ok: true };
    } catch (err) {
      console.error("Erro ao sair:", err);
      return { ok: false, message: "Erro ao sair." };
    }
  }, []);

  const redefine = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: "Não foi possível enviar o e-mail.",
      };
    }
  }, []);

  const value = {
    user,
    loading,
    checksSet,
    setChecksSet,
    register,
    atualizarPerfil,
    atualizarUsername,
    vincularCPF,
    login,
    logout,
    redefine,
    concluirPrimeiroAcesso,
    primeiroAcessoPendente,
    cpfPendente,
    isAuthenticated: !!user,
    perfilIncompleto: !!user?.perfilIncompleto,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
