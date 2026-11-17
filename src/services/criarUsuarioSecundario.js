
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export async function criarUsuarioSecundario(email, senha) {
  const nomeApp = `cadastro-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const appSecundario = initializeApp(auth.app.options, nomeApp);

  try {
    const authSecundario = getAuth(appSecundario);
    const credencial = await createUserWithEmailAndPassword(
      authSecundario,
      email,
      senha
    );

    return credencial.user.uid;
  } finally {
    await deleteApp(appSecundario);
  }
}
