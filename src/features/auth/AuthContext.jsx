import { createContext, useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { ouvirChecksDoProfessor } from "../../services/firestoreChecks";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checksSet, setChecksSet] = useState(new Set());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setChecksSet(new Set());
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...snap.data() });
        } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            nome: firebaseUser.displayName || "",
            cargos: [],
            perfilIncompleto: true,
          });
        }
      } catch (err) {
        console.error("Erro ao buscar dados do usuário:", err);
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, perfilIncompleto: true });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // OUVINTE EM TEMPO REAL DOS CHECKS
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

  const register = useCallback(async ({ nome, email, senha, disciplinas, unidade, series, turmas }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      const firebaseUser = cred.user;
      if (nome) await updateProfile(firebaseUser, { displayName: nome });

      const userData = {
        uid: firebaseUser.uid, nome: nome || "", email: email,
        disciplinas: disciplinas || [], unidade: unidade || "",
        series: series || "", turmas: turmas || "",
        cargos: ["professor"], criadoEm: serverTimestamp(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), userData);
      return { ok: true, user: firebaseUser };
    } catch (err) {
      console.error("Erro no register:", err);
      return { ok: false, message: "Não foi possível criar a conta." };
    }
  }, []);

  const atualizarPerfil = useCallback(async (dados) => {
    try {
      if (!auth.currentUser) throw new Error("Sem usuário autenticado");
      const uid = auth.currentUser.uid;

      const userRef = doc(db, "users", uid);
      const userData = {
        uid, email: auth.currentUser.email,
        nome: dados.nome || auth.currentUser.displayName || "",
        disciplinas: dados.disciplinas || [], unidade: dados.unidade || "",
        series: dados.series || "", turmas: dados.turmas || "",
        cargos: dados.cargos || ["professor"], criadoEm: serverTimestamp(),
      };

      await setDoc(userRef, userData, { merge: true });
      return { ok: true };
    } catch (err) {
      return { ok: false, message: "Não foi possível salvar os dados." };
    }
  }, []);

  const login = useCallback(async (email, senha) => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: "E-mail ou senha incorretos." };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: "Erro ao sair." };
    }
  }, []);

  const redefine = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: "Não foi possível enviar o e-mail." };
    }
  }, []);

  const value = {
    user, loading, checksSet, setChecksSet,
    register, atualizarPerfil, login, logout, redefine,
    isAuthenticated: !!user, perfilIncompleto: !!user?.perfilIncompleto,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}