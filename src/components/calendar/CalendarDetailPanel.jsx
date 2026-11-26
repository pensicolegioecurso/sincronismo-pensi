import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { COLUNAS_DIAS, extrairAulas, resolverReferencia, pad2, extrairCapitulos } from "../../utils/formatters";
import { gerarIdCheck } from "../../services/firestoreChecks";
import { X, CheckCircle2, MessageSquare, AlertCircle, Lock, CalendarX } from "lucide-react";

export default function CalendarDetailPanel({
  semData, diaIdx, currentModelo, currentAulas, currentCaps, currentSemanas,
  currentAulaIdx, checksSet, onCheck, disciplinaAtualKey, currentSheetName,
  turmasDoProfessor = [], weekIdx, unidadeSelecionada,
  isDiaLetivo, turmaSelecionada, serie, podeRegistrarChecks = true,
}) {
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoAcao, setTipoAcao] = useState(null);
  const [aulaSelecionada, setAulaSelecionada] = useState(null);
  const [textoJustificativa, setTextoJustificativa] = useState("");
  const [aplicarTodasTurmas, setAplicarTodasTurmas] = useState(true);
  const [obsAula, setObsAula] = useState("");
  const [erroModal, setErroModal] = useState("");
  const [itensVisiveis, setItensVisiveis] = useState(12);

  useEffect(() => setItensVisiveis(12), [semData, diaIdx]);

  if (!semData || diaIdx == null) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-10 bg-white rounded-[32px] border border-gray-100 shadow-sm min-h-[400px]">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <span className="text-2xl font-bold text-gray-400">?</span>
        </div>
        <h2 className="text-[24px] font-black text-[#111111] uppercase transform -rotate-1 mb-1">Selecione</h2>
        <h2 className="text-[24px] font-black uppercase transform rotate-1 mb-4">
          <span className="bg-pensi-yellow px-3 py-1 inline-block text-[#111111]">uma data.</span>
        </h2>
        <p className="text-[14px] font-medium text-gray-500 max-w-[240px]">
          Clique em qualquer dia do calendário ao lado para abrir o detalhamento.
        </p>
      </div>
    );
  }

  const diaNome = COLUNAS_DIAS[diaIdx][0];
  const tagDia = semData.dias?.[diaNome] || "";
  const d = semData.datas ? semData.datas[diaIdx] : null;
  const dataTxt = d ? `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}` : "";

  let dataReal = "";
  if (d) {
    const dataCerta = new Date(d);
    dataCerta.setHours(12, 0, 0, 0);
    const y = dataCerta.getFullYear();
    const m = String(dataCerta.getMonth() + 1).padStart(2, "0");
    const dd = String(dataCerta.getDate()).padStart(2, "0");
    dataReal = `${y}-${m}-${dd}`;
  }

  const diaLetivo = d && typeof isDiaLetivo === "function"
    ? isDiaLetivo(d, turmaSelecionada || currentSheetName, serie || currentSheetName, unidadeSelecionada)
    : true;

  const diaBloqueado = !d || !diaLetivo;
  const registroPermitido = diaLetivo && podeRegistrarChecks;

  const jaTemCheck = (aulaKey) => {
    const id = gerarIdCheck({ disciplina: disciplinaAtualKey, serie: currentSheetName, semanaIdx: dataReal, diaNome: diaNome, aulaIndex: aulaKey });
    return checksSet?.has(id) || false;
  };

  const abrirModal = (tipo, aulaKey) => {
    if (diaBloqueado) { alert("Não é possível registrar ações em um dia com exceção no calendário."); return; }
    if (!podeRegistrarChecks) { alert("Não existem turmas ativas nesta unidade. Você pode visualizar o calendário, mas não pode registrar checks."); return; }
    if (jaTemCheck(aulaKey)) { alert("Ação bloqueada: Esta aula já foi registrada!"); return; }
    setAulaSelecionada(aulaKey); setTipoAcao(tipo); setModalAberto(true); setErroModal(""); setTextoJustificativa(""); setObsAula(""); setAplicarTodasTurmas(true);
  };

  const fecharModal = () => { setModalAberto(false); setTipoAcao(null); setAulaSelecionada(null); setErroModal(""); };

  const handleConfirmarAcao = () => {
    setErroModal("");
    if (diaBloqueado) { setErroModal("Este dia possui uma exceção no calendário. O registro está bloqueado."); return; }
    if (!podeRegistrarChecks) { setErroModal("Não existem turmas ativas nesta unidade. Não é possível registrar checks."); return; }
    if (!aulaSelecionada || !tipoAcao) { setErroModal("Não foi possível identificar a aula selecionada."); return; }
    if (jaTemCheck(aulaSelecionada)) { setErroModal("Esta aula já foi registrada."); return; }
    if (tipoAcao === "justificativa" && !textoJustificativa.trim()) { setErroModal("Por favor, escreva o motivo da justificativa."); return; }

    const turmasParaAplicar = tipoAcao === "aula" && aplicarTodasTurmas ? turmasDoProfessor : [currentSheetName];
    if (!turmasParaAplicar.length) { setErroModal("Nenhuma turma disponível para registrar esta aula."); return; }

    onCheck({
      semanaIdx: dataReal, diaNome: diaNome, aulaIndex: aulaSelecionada, tipo: tipoAcao,
      justificativa: tipoAcao === "justificativa" ? textoJustificativa : "",
      observacao: tipoAcao === "aula" ? obsAula : "",
      turmasParaAplicar, unidade: unidadeSelecionada,
    });
    fecharModal();
  };

  const renderizarAcoes = (aulaKey) => {
    const feito = jaTemCheck(aulaKey);

    // Estado: Já Registrado (Tag elegante branca com check preto)
    if (feito) {
      return (
        <div className="inline-flex items-center gap-2 text-[#111111] bg-white border border-gray-200 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest cursor-default shadow-sm">
          <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} /> Registrado
        </div>
      );
    }

    // Estado: Dia Bloqueado (Tag cinza elegante)
    if (diaBloqueado) {
      return (
        <div className="inline-flex items-center gap-2 text-gray-500 bg-gray-100 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest cursor-not-allowed border border-gray-200">
          <Lock className="w-4 h-4" strokeWidth={2.5} /> Dia bloqueado
        </div>
      );
    }

    // Estado: Sem Turmas Ativas
    if (!podeRegistrarChecks) {
      return (
        <div className="inline-flex items-center gap-2 text-gray-500 bg-gray-100 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest cursor-not-allowed border border-gray-200">
          <Lock className="w-4 h-4" strokeWidth={2.5} /> Sem turmas
        </div>
      );
    }

    // Estado: Ações Disponíveis (Botões em preto e amarelo, com leve inclinação)
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button 
          type="button" 
          onClick={() => abrirModal("aula", aulaKey)} 
          className="group inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md hover:-translate-y-0.5 transform -rotate-1"
        >
          <CheckCircle2 className="w-4 h-4 text-pensi-yellow" strokeWidth={2.5} /> 
          Dar Aula
        </button>
        
        <button 
          type="button" 
          onClick={() => abrirModal("justificativa", aulaKey)} 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-pensi-yellow text-[#111111] rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-pensi-yellow-hover transition-all shadow-sm hover:-translate-y-0.5 transform rotate-1"
        >
          <MessageSquare className="w-4 h-4" strokeWidth={2.5} /> 
          Justificar
        </button>
      </div>
    );
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {tipoAcao === "aula" ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <AlertCircle className="w-6 h-6 text-amber-500" />}
            <h3 className="text-[20px] font-bold text-[#111111]">{tipoAcao === "aula" ? "Registrar Aula" : "Justificar Aula"}</h3>
          </div>
          <button type="button" onClick={fecharModal} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {erroModal && <div className="bg-red-50 text-red-600 text-[13px] font-bold px-4 py-3 rounded-xl">{erroModal}</div>}

          {tipoAcao === "justificativa" && (
            <div>
              <label className="block text-[13px] font-bold text-[#111111] mb-2">Motivo da Justificativa <span className="text-red-500">*</span></label>
              <textarea value={textoJustificativa} onChange={(e) => setTextoJustificativa(e.target.value)} placeholder="Descreva o motivo..." rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-[14px] text-[#111111] outline-none focus:border-pensi-yellow focus:ring-4 focus:ring-pensi-yellow/20 transition-all resize-none" />
            </div>
          )}

          {tipoAcao === "aula" && (
            <>
              <div>
                <label className="block text-[13px] font-bold text-[#111111] mb-3">Esta aula foi dada para:</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="radio" name="turmas" checked={aplicarTodasTurmas} onChange={() => setAplicarTodasTurmas(true)} className="accent-pensi-yellow w-4 h-4" />
                    <span className="text-[14px] font-medium text-gray-700">Todas as minhas turmas ({turmasDoProfessor.length})</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="radio" name="turmas" checked={!aplicarTodasTurmas} onChange={() => setAplicarTodasTurmas(false)} className="accent-pensi-yellow w-4 h-4" />
                    <span className="text-[14px] font-medium text-gray-700">Apenas esta turma ({currentSheetName})</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#111111] mb-2">Observações (Opcional)</label>
                <textarea value={obsAula} onChange={(e) => setObsAula(e.target.value)} placeholder="Algum detalhe extra?" rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-[14px] text-[#111111] outline-none focus:border-pensi-yellow focus:ring-4 focus:ring-pensi-yellow/20 transition-all resize-none" />
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button type="button" onClick={fecharModal} className="px-5 py-3 text-[14px] font-bold text-gray-500 hover:text-[#111111] transition-colors">Cancelar</button>
          <button type="button" onClick={handleConfirmarAcao} className="px-6 py-3 bg-pensi-yellow text-[#111111] text-[14px] font-bold rounded-full hover:bg-pensi-yellow-hover transition-colors">Confirmar</button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className={`bg-white rounded-[32px] relative transition-all border border-gray-100 shadow-sm h-full flex flex-col ${diaBloqueado ? "opacity-50 grayscale" : ""}`}>
        <div className="border-b border-gray-100 p-6">
          <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{semData.periodo || `Semana ${(weekIdx ?? 0) + 1}`} ({diaNome}{dataTxt ? `, ${dataTxt}` : ""})</div>
          
          <div className="mt-2 mb-4">
            <h2 className="text-[28px] font-black text-[#111111] uppercase transform -rotate-1 leading-none">{tagDia || "Sem atividade"}</h2>
            <h2 className="text-[28px] font-black uppercase transform rotate-1 mt-1">
              <span className="bg-pensi-yellow px-2 py-0.5 inline-block text-[#111111]">especificada.</span>
            </h2>
          </div>

          {diaBloqueado && (
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
              <CalendarX className="w-6 h-6 text-gray-400 shrink-0" />
              <div>
                <p className="text-[13px] font-bold uppercase text-gray-600">Dia bloqueado / exceção</p>
                <p className="text-[12px] font-medium text-gray-500 mt-0.5">Não é possível registrar aula ou justificativa nesta data.</p>
              </div>
            </div>
          )}

          {!diaBloqueado && !podeRegistrarChecks && (
            <div className="mt-4 p-4 bg-amber-50 rounded-2xl flex items-center gap-3">
              <Lock className="w-6 h-6 text-amber-500 shrink-0" />
              <div>
                <p className="text-[13px] font-bold uppercase text-amber-800">Nenhuma turma ativa</p>
                <p className="text-[12px] font-medium text-amber-700 mt-0.5">Você pode visualizar, mas não pode registrar checks.</p>
              </div>
            </div>
          )}

          {semData.ementas && (
            <div className="mt-4 p-4 bg-pensi-yellow/10 rounded-2xl border-l-4 border-pensi-yellow text-[13px] text-gray-700">
              <strong className="block text-[11px] font-bold uppercase mb-1 text-[#111111]">Ementa</strong>
              {semData.ementas}
            </div>
          )}
        </div>

        {/* Aumentei o padding aqui (p-8) e o espaço entre os blocos (space-y-6) */}
        <div className="p-8 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {currentModelo === "semana"
            ? renderDetalheSemana(tagDia, currentSemanas, currentAulaIdx, renderizarAcoes, itensVisiveis, () => setItensVisiveis((n) => n + 12))
            : renderDetalheAula(tagDia, currentAulas, currentCaps, renderizarAcoes, semData, itensVisiveis, () => setItensVisiveis((n) => n + 12))}
        </div>
      </div>

      {modalAberto && registroPermitido && createPortal(modalContent, document.body)}
    </>
  );
}

function renderDetalheAula(tagDia, currentAulas, currentCaps, renderizarAcoes, semData, limite, carregarMais) {
  const aulasDoDia = extrairAulas(tagDia);
  const blocos = [];

  if (aulasDoDia.length) {
    aulasDoDia.slice(0, limite).forEach((n) => {
      const linhas = currentAulas[n] || [];
      const caps = [...new Set(linhas.map((l) => l.cap).filter(Boolean))];
      const titulo = `Aula ${n}${caps.length ? " — Cap. " + caps.join(", ") : ""}`;

      blocos.push(
        <div key={n} className="mb-8 last:mb-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h3 className="text-[16px] font-bold text-[#111111] bg-pensi-yellow px-4 py-1.5 rounded-lg shadow-sm">{titulo}</h3>
            {renderizarAcoes("A" + n)}
          </div>
          <div className="pl-1 space-y-5">
            {!linhas.length ? (
              <p className="text-[14px] font-medium text-gray-500 italic">Esta aula ainda não tem conteúdo cadastrado na planilha.</p>
            ) : (
              <>
                <BlocoTemas linhas={linhas} />
                <BlocoCampo linhas={linhas} campo="expectativas" titulo="Expectativas de Aprendizagem" />
                <BlocoCampo linhas={linhas} campo="instrucoes" titulo="Instruções de Trabalho" />
                <BlocoCampo linhas={linhas} campo="exercicios" titulo="Exercícios Sugeridos" />
              </>
            )}
          </div>
        </div>
      );
    });
    if (aulasDoDia.length > limite) blocos.push(<button key="mais-aulas" type="button" onClick={carregarMais} className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm font-bold">Carregar mais aulas</button>);
  } else {
    const isProva = /prova|avaliação|simulado|recuperação/i.test(tagDia);
    const capsEmenta = extrairCapitulos(semData.ementas);
    // Render only chapters referenced by this day's ementa. Listing every
    // chapter in a large guide here can create thousands of nodes on click.
    const todosCaps = [...new Set(capsEmenta)].sort((a, b) => a - b);

    blocos.push(
      <div key="nf" className="bg-gray-50 border border-gray-100 border-dashed p-6 rounded-2xl text-center mb-6">
        <p className="text-[15px] font-bold text-gray-500 uppercase">{tagDia ? `Evento: ${tagDia}` : "Nenhuma atividade registrada para este dia."}</p>
      </div>
    );

    if ((isProva || todosCaps.length > 0) && semData.ementas) {
      blocos.push(
        <div key="prova" className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <h4 className="text-[13px] font-bold uppercase mb-4 text-[#111111] bg-pensi-yellow inline-block px-4 py-1.5 rounded-lg">
            Conteúdo da Ementa {todosCaps.length > 0 && `(Capítulos ${todosCaps.join(", ")})`}
          </h4>
          <p className="text-[15px] font-medium text-gray-700 whitespace-pre-wrap mb-5">{semData.ementas}</p>
          {todosCaps.length > 0 && currentCaps && (
            <div className="space-y-6 mt-5 border-t border-gray-100 pt-5">
          {todosCaps.slice(0, limite).map((capNum) => {
                const linhasCap = currentCaps[capNum] || [];
                if (!linhasCap.length) return null;
                return (
                  <div key={capNum} className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <h5 className="text-[12px] font-bold uppercase text-[#111111] mb-4 bg-white px-3 py-1 rounded-lg inline-block shadow-sm">Capítulo {capNum}</h5>
                    <BlocoTemas linhas={linhasCap} />
                    <BlocoCampo linhas={linhasCap} campo="expectativas" titulo="Expectativas de Aprendizagem" />
                  </div>
                );
              })}
          {todosCaps.length > limite && <button type="button" onClick={carregarMais} className="mt-4 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm font-bold">Carregar mais capítulos</button>}
            </div>
          )}
        </div>
      );
    }
  }

  return <div>{blocos}</div>;
}

function renderDetalheSemana(tagDia, currentSemanas, currentAulaIdx, renderizarAcoes, limite, carregarMais) {
  const ref = resolverReferencia(tagDia);
  if (!ref.nums.length) {
    return <div className="text-center text-gray-500 font-medium text-[15px] py-8 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">Este dia refere-se a evento/recesso/feriado/avaliação/revisão.</div>;
  }

  let tipo = ref.tipo;
  if (tipo === "numero") { tipo = ref.nums.some((n) => currentAulaIdx[n]) ? "aula" : "semana"; }

  const alvos = new Map();
  ref.nums.forEach((n) => {
    if (tipo === "semana") { if (currentSemanas[n]) alvos.set(n, null); }
    else {
      const s = (currentAulaIdx[n] || [])[0];
      if (s === undefined) return;
      if (!alvos.has(s)) alvos.set(s, new Set());
      alvos.get(s).add(n);
    }
  });

  const blocos = [];
  [...alvos.entries()].slice(0, limite).forEach(([s, foco]) => {
    const d = currentSemanas[s];
    if (!d) return;

    let aulas = d.aulas.length ? d.aulas : [{ num: null, key: "S" + s, texto: d.divisao || "Conteúdo da semana" }];
    if (foco) { aulas = aulas.filter((a) => foco.has(a.num)); }

    blocos.push(
      <div key={s} className="mb-8 last:mb-0">
        <h3 className="text-[16px] font-bold text-[#111111] bg-pensi-yellow px-4 py-1.5 rounded-lg inline-block mb-5 shadow-sm">Semana {s}{d.modulo ? ` — ${d.modulo}` : ""}</h3>
        {d.tema && <p className="text-[15px] mb-4 font-medium text-gray-600"><strong className="text-gray-400 text-[11px] uppercase block mb-1">Tema</strong>{d.tema}</p>}
        <div className="space-y-6 mb-6">
        {aulas.slice(0, limite).map((a, i) => (
            <div key={i} className="flex flex-col gap-3 pb-5 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium text-gray-700">{a.texto}</div>
              {renderizarAcoes(a.key)}
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <BlocoTexto titulo="Objetivos de aprendizagem" texto={d.objetivos} />
          <BlocoTexto titulo="Exercícios de sala" texto={d.sala} />
          <BlocoTexto titulo="Exercícios de casa" texto={d.casa} />
          <BlocoTexto titulo="Atividades práticas" texto={d.prat} />
        </div>
      </div>
    );
  });

  const temMais = alvos.size > limite || [...alvos.values()].some((foco, index) => {
    const semana = [...alvos.keys()][index];
    const dados = currentSemanas[semana];
    return dados && (foco ? dados.aulas.filter((a) => foco.has(a.num)).length : dados.aulas.length) > limite;
  });
  if (temMais) blocos.push(<button key="mais-semanas" type="button" onClick={carregarMais} className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm font-bold">Carregar mais conteúdo</button>);

  return <div>{blocos}</div>;
}

function BlocoTemas({ linhas }) {
  const temas = [...new Set(linhas.map((r) => r.tema).filter(Boolean))];
  if (!temas.length) { return <p className="text-[15px] mb-3 italic font-medium text-gray-400">Tema não especificado.</p>; }
  if (temas.length === 1) {
    return <p className="text-[15px] mb-4 text-gray-700"><strong className="text-[11px] font-bold uppercase block mb-1 text-gray-400">Tema do Capítulo</strong>{temas[0]}</p>;
  }
  return (
    <div className="mb-4">
      <p className="text-[11px] font-bold uppercase mb-2 text-gray-400">Temas do Capítulo</p>
      <ul className="list-disc list-inside text-[15px] space-y-1 text-gray-700">{temas.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </div>
  );
}

function BlocoCampo({ linhas, campo, titulo }) {
  const comValor = linhas.filter((r) => r[campo]);
  if (!comValor.length) return null;
  const vistos = new Map();
  comValor.forEach((r) => { if (!vistos.has(r[campo])) vistos.set(r[campo], []); vistos.get(r[campo]).push(r.tema); });

  if (vistos.size === 1) {
    return <p className="text-[15px] mb-3 text-gray-700"><strong className="text-[11px] font-bold uppercase block mb-1 text-gray-400">{titulo}</strong>{[...vistos.keys()][0]}</p>;
  }

  return (
    <div className="mb-4">
      <p className="text-[11px] font-bold uppercase mb-2 text-gray-400">{titulo}</p>
      <ul className="list-disc list-inside text-[15px] space-y-1 text-gray-700">
        {[...vistos.entries()].map(([valor, temas], i) => {
          const rotulo = [...new Set(temas.filter(Boolean))].join(" / ");
          return <li key={i}>{rotulo && <em className="font-semibold text-gray-500">{rotulo}: </em>}{valor}</li>;
        })}
      </ul>
    </div>
  );
}

function BlocoTexto({ titulo, texto }) {
  if (!texto) return null;
  return (
    <div className="mt-3">
      <strong className="block text-[11px] font-bold uppercase mb-2 text-gray-400">{titulo}</strong>
      <div className="text-[15px] leading-relaxed bg-gray-50 border border-gray-100 rounded-2xl p-5 whitespace-pre-wrap text-gray-700">{texto}</div>
    </div>
  );
}
