
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

export function normalizarCPF(valor) {
  return String(valor || "").replace(/\D/g, "");
}

export function validarCPF(valor) {
  const cpf = normalizarCPF(valor);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let digito = (soma * 10) % 11;
  if (digito === 10) digito = 0;

  if (digito !== Number(cpf[9])) return false;

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }

  digito = (soma * 10) % 11;
  if (digito === 10) digito = 0;

  return digito === Number(cpf[10]);
}

export function formatarCPF(valor) {
  return normalizarCPF(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function erroCPF(codigo, mensagem) {
  const error = new Error(mensagem);
  error.code = codigo;
  return error;
}

// Verifica se o CPF está disponível.
export async function verificarCPFDisponivel(
  valor,
  { permitirPreCadastro = false } = {}
) {
  const cpf = normalizarCPF(valor);

  if (!validarCPF(cpf)) {
    throw erroCPF("cpf/invalido", "O CPF informado é inválido.");
  }

  const referenciaCPF = doc(db, "cpfs", cpf);
  const cpfSnap = await getDoc(referenciaCPF);

  if (cpfSnap.exists()) {
    const dados = cpfSnap.data();

    if (dados.uid) {
      throw erroCPF(
        "cpf/ja-vinculado",
        "Este CPF já está vinculado a um usuário."
      );
    }

    if (!permitirPreCadastro) {
      throw erroCPF(
        "cpf/ja-cadastrado",
        "Este CPF já está cadastrado na base de CPFs."
      );
    }
  }

  return cpf;
}

// Cadastro isolado de CPF pela administração.
// Não cria usuário no Authentication.
export async function cadastrarCPFIsolado(valor) {
  const cpf = normalizarCPF(valor);

  if (!validarCPF(cpf)) {
    throw erroCPF("cpf/invalido", "O CPF informado é inválido.");
  }

  const referenciaCPF = doc(db, "cpfs", cpf);

  await runTransaction(db, async (transaction) => {
    const cpfSnap = await transaction.get(referenciaCPF);

    if (cpfSnap.exists()) {
      const dados = cpfSnap.data();

      throw erroCPF(
        dados.uid ? "cpf/ja-vinculado" : "cpf/ja-cadastrado",
        dados.uid
          ? "Este CPF já está vinculado a um usuário."
          : "Este CPF já está cadastrado."
      );
    }

    transaction.set(referenciaCPF, {
      cpf,
      criadoEm: serverTimestamp(),
      origem: "cadastro-cpf",
    });
  });

  return cpf;
}

// Cadastro administrativo completo.
export async function salvarUsuarioComCPF(
  uid,
  payload,
  origem = "cadastro-manual"
) {
  const cpf = normalizarCPF(payload.cpf);

  if (!uid) {
    throw new Error("UID do usuário não informado.");
  }

  if (!validarCPF(cpf)) {
    throw erroCPF("cpf/invalido", "O CPF informado é inválido.");
  }

  const referenciaCPF = doc(db, "cpfs", cpf);
  const referenciaUsuario = doc(db, "users", uid);

  await runTransaction(db, async (transaction) => {
    const cpfSnap = await transaction.get(referenciaCPF);

    if (cpfSnap.exists()) {
      const dadosCPF = cpfSnap.data();

      if (dadosCPF.uid && dadosCPF.uid !== uid) {
        throw erroCPF(
          "cpf/ja-vinculado",
          "Este CPF já pertence a outro usuário."
        );
      }
    }

    transaction.set(referenciaUsuario, {
      ...payload,
      cpf,
    });

    transaction.set(
      referenciaCPF,
      {
        cpf,
        uid,
        origem: cpfSnap.exists()
          ? "pre-cadastro-vinculado"
          : origem,
        criadoEm: cpfSnap.exists()
          ? cpfSnap.data().criadoEm || serverTimestamp()
          : serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      },
      { merge: true }
    );
  });

  return { ok: true, uid, cpf };
}

// Consulta exclusiva do cadastro público.
// Deve ser chamada somente depois da autenticação.
export async function verificarCPFPreCadastrado(valor) {
  const cpf = normalizarCPF(valor);

  if (!validarCPF(cpf)) {
    throw erroCPF("cpf/invalido", "O CPF informado é inválido.");
  }

  const referenciaCPF = doc(db, "cpfs", cpf);
  const cpfSnap = await getDoc(referenciaCPF);

  if (!cpfSnap.exists()) {
    throw erroCPF(
      "cpf/nao-autorizado",
      "CPF não autorizado. Solicite à administração o pré-cadastro do seu CPF."
    );
  }

  const dados = cpfSnap.data();

  if (dados.origem !== "cadastro-cpf") {
    throw erroCPF(
      "cpf/origem-invalida",
      "Este CPF não está liberado para cadastro público."
    );
  }

  if (dados.uid) {
    throw erroCPF(
      "cpf/ja-vinculado",
      "Este CPF já está vinculado a uma conta."
    );
  }

  return cpf;
}

// Vincula o CPF ao usuário já autenticado.
// Não substitui os demais dados do perfil.
export async function salvarUsuarioPublicoComCPF(uid, payload) {
  const cpf = normalizarCPF(payload.cpf);

  if (!uid) {
    throw new Error("UID do usuário não informado.");
  }

  if (!validarCPF(cpf)) {
    throw erroCPF("cpf/invalido", "O CPF informado é inválido.");
  }

  const referenciaCPF = doc(db, "cpfs", cpf);
  const referenciaUsuario = doc(db, "users", uid);

  await runTransaction(db, async (transaction) => {
    const [cpfSnap, usuarioSnap] = await Promise.all([
      transaction.get(referenciaCPF),
      transaction.get(referenciaUsuario),
    ]);

    if (!usuarioSnap.exists()) {
      throw new Error(
        "Perfil do usuário não encontrado. Complete o cadastro antes de informar o CPF."
      );
    }

    if (!cpfSnap.exists()) {
      throw erroCPF(
        "cpf/nao-autorizado",
        "CPF não autorizado para cadastro."
      );
    }

    const dadosCPF = cpfSnap.data();

    if (dadosCPF.origem !== "cadastro-cpf") {
      throw erroCPF(
        "cpf/origem-invalida",
        "Este CPF não está liberado para cadastro público."
      );
    }

    if (dadosCPF.uid) {
      throw erroCPF(
        "cpf/ja-vinculado",
        "Este CPF já está vinculado a uma conta."
      );
    }

    transaction.update(referenciaUsuario, {
      cpf,
      atualizadoEm: serverTimestamp(),
    });

    transaction.update(referenciaCPF, {
      uid,
      origem: "pre-cadastro-vinculado",
      atualizadoEm: serverTimestamp(),
    });
  });

  return { ok: true, cpf, uid };
}
