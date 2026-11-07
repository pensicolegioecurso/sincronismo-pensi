import { useState } from "react";
import { COLUNAS_DIAS, extrairAulas, resolverReferencia, pad2, extrairCapitulos, chaveCheck } from "../utils/formatters";
import { X, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";

export default function DetailPanel({
  semData, diaIdx, currentModelo, currentAulas, currentCaps, currentSemanas, currentAulaIdx,
  checksSet, onCheck, disciplinaAtualKey, currentSheetName, weekIdx,
}) {
  // Estados do Modal de Ação (Aula / Justificativa)
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoAcao, setTipoAcao] = useState(null); // 'aula' ou 'justificativa'
  const [aulaSelecionada, setAulaSelecionada] = useState(null);
  
  // Estados dos formulários do modal
  const [textoJustificativa, setTextoJustificativa] = useState("");
  const [aplicarTodasTurmas, setAplicarTodasTurmas] = useState(true);
  const [obsAula, setObsAula] = useState("");
  const [erroModal, setErroModal] = useState("");

  if (!semData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-10 bg-transparent min-h-[400px]">
        <div className="w-14 h-14 bg-pensi-yellow border-[2px] border-black rounded-xl shadow-[3px_3px_0px_0px_#000] flex items-center justify-center mb-4 -rotate-3">
          <span className="text-2xl font-semibold">?</span>
        </div>
        <h2 className="text-lg font-semibold text-black uppercase mb-1">Selecione uma data</h2>
        <p className="text-sm font-medium text-gray-500">Clique em qualquer dia do calendário ao lado para abrir o detalhamento.</p>
      </div>
    );
  }

  const diaNome = COLUNAS_DIAS[diaIdx][0];
  const tagDia = semData.dias[diaNome] || "";
  const d = semData.datas ? semData.datas[diaIdx] : null;
  const dataTxt = d ? `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}` : "";

  const jaTemCheck = (aulaKey) => {
    const chave = chaveCheck({
      disciplina: disciplinaAtualKey, serie: currentSheetName,
      semana: semData.key, dia: diaNome, aulaIndex: aulaKey,
    });
    return checksSet.has(chave);
  };

  const abrirModal = (tipo, aulaKey) => {
    if (jaTemCheck(aulaKey)) return;
    setAulaSelecionada(aulaKey);
    setTipoAcao(tipo);
    setModalAberto(true);
    setErroModal("");
    setTextoJustificativa("");
    setObsAula("");
    setAplicarTodasTurmas(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setTipoAcao(null);
    setAulaSelecionada(null);
  };

  const handleConfirmarAcao = () => {
    setErroModal("");
    
    if (tipoAcao === "justificativa" && !textoJustificativa.trim()) {
      return setErroModal("Por favor, escreva o motivo da justificativa.");
    }

    // Aqui você conecta com a sua função de salvar no banco de dados.
    // Estou passando os dados extras (justificativa, obs, aplicarTodasTurmas) no console para simulação.
    console.log("Ação Confirmada:", {
      tipo: tipoAcao,
      aulaKey: aulaSelecionada,
      justificativa: textoJustificativa,
      observacao: obsAula,
      todasAsTurmas: tipoAcao === "aula" ? aplicarTodasTurmas : true,
    });

    // Executa a função de check original
    onCheck({ semana: semData.key, dia: diaNome, aulaIndex: aulaSelecionada });
    
    fecharModal();
  };

  const renderizarAcoes = (aulaKey) => {
    const feito = jaTemCheck(aulaKey);
    if (feito) {
      return (
        <div className="flex items-center gap-1.5 text-green-700 bg-green-100 px-3 py-1.5 rounded-lg border border-green-700 text-xs font-bold uppercase">
          <CheckCircle2 className="w-4 h-4" /> Concluído
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => abrirModal("aula", aulaKey)}
          className="text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 bg-white text-black border border-black rounded-lg shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] transition-all flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Dar Aula
        </button>
        <button
          onClick={() => abrirModal("justificativa", aulaKey)}
          className="text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 bg-gray-100 text-gray-700 border border-black rounded-lg shadow-[2px_2px_0px_0px_#000] hover:bg-gray-200 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] transition-all flex items-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" /> Justificar
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="bg-transparent relative">
        <div className="border-b border-gray-200 p-5">
          <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
            {semData.periodo || `Semana ${weekIdx + 1}`} ({diaNome}{dataTxt ? `, ${dataTxt}` : ""})
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mt-1 uppercase">
            {tagDia || "Sem atividade especificada"}
          </h2>
          {semData.ementas && (
            <div className="mt-3 p-3 bg-yellow-50 border-l-[3px] border-pensi-yellow text-xs text-gray-800 rounded-r-md">
              <strong className="block text-[10px] font-semibold uppercase mb-0.5">Ementa</strong> {semData.ementas}
            </div>
          )}
          {semData.obs && (
            <div className="mt-2 p-3 bg-gray-50 border-l-[3px] border-gray-400 text-xs text-gray-800 rounded-r-md">
              <strong className="block text-[10px] font-semibold uppercase mb-0.5">Observação</strong> {semData.obs}
            </div>
          )}
        </div>

        <div className="p-5">
          {currentModelo === "semana"
            ? renderDetalheSemana(tagDia, currentSemanas, currentAulaIdx, renderizarAcoes)
            : renderDetalheAula(tagDia, currentAulas, currentCaps, renderizarAcoes, semData, currentCaps)}
        </div>
      </div>

      {/* MODAL DE AÇÃO (Aula / Justificativa) */}
      {modalAberto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/95 backdrop-blur-2xl border-[2px] border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] w-full max-w-md overflow-hidden animate-scale-in">
            
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-5 border-b-[2px] border-black bg-gray-50">
              <div className="flex items-center gap-2">
                {tipoAcao === "aula" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                )}
                <h3 className="text-lg font-bold text-gray-900">
                  {tipoAcao === "aula" ? "Registrar Aula" : "Justificar Aula"}
                </h3>
              </div>
              <button 
                onClick={fecharModal}
                className="p-1.5 bg-white border-[1.5px] border-black rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* Corpo do Modal */}
            <div className="p-5 space-y-4">
              
              {erroModal && (
                <div className="bg-red-50 border-[1.5px] border-red-600 text-red-700 text-xs font-bold px-3 py-2 rounded-lg">
                  {erroModal}
                </div>
              )}

              {/* Formulário: JUSTIFICATIVA */}
              {tipoAcao === "justificativa" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Motivo da Justificativa <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={textoJustificativa}
                    onChange={(e) => setTextoJustificativa(e.target.value)}
                    placeholder="Descreva o motivo pelo qual a aula não foi ministrada..."
                    rows={4}
                    className="w-full bg-white border-[2px] border-gray-300 rounded-xl p-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:shadow-[3px_3px_0px_0px_#F5C518] transition-all resize-none"
                  />
                </div>
              )}

              {/* Formulário: AULA */}
              {tipoAcao === "aula" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Esta aula foi dada para:
                    </label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 p-2.5 border-[1.5px] border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input 
                          type="radio" 
                          name="turmas" 
                          checked={aplicarTodasTurmas} 
                          onChange={() => setAplicarTodasTurmas(true)}
                          className="accent-black w-4 h-4"
                        />
                        <span className="text-sm font-medium text-gray-800">Todas as minhas turmas</span>
                      </label>
                      <label className="flex items-center gap-2 p-2.5 border-[1.5px] border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input 
                          type="radio" 
                          name="turmas" 
                          checked={!aplicarTodasTurmas} 
                          onChange={() => setAplicarTodasTurmas(false)}
                          className="accent-black w-4 h-4"
                        />
                        <span className="text-sm font-medium text-gray-800">Apenas esta turma ({currentSheetName})</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Observações (Opcional)
                    </label>
                    <textarea
                      value={obsAula}
                      onChange={(e) => setObsAula(e.target.value)}
                      placeholder="Algum detalhe extra sobre a aula?"
                      rows={3}
                      className="w-full bg-white border-[2px] border-gray-300 rounded-xl p-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:shadow-[3px_3px_0px_0px_#F5C518] transition-all resize-none"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="p-5 border-t-[2px] border-black bg-gray-50 flex justify-end gap-2">
              <button
                onClick={fecharModal}
                className="px-4 py-2.5 text-sm font-bold text-gray-600 hover:text-black transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarAcao}
                className="px-5 py-2.5 bg-pensi-yellow text-black text-sm font-bold border-[2px] border-black rounded-xl shadow-[2px_2px_0px_0px_#000] hover:bg-[#ffdb4d] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
              >
                Confirmar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

// --- SUBCOMPONENTES ---

function renderDetalheAula(tagDia, currentAulas, currentCaps, renderizarAcoes, semData, capsGerais) {
  const aulasDoDia = extrairAulas(tagDia);
  const blocos = [];

  if (aulasDoDia.length) {
    aulasDoDia.forEach((n) => {
      const linhas = currentAulas[n] || [];
      const caps = [...new Set(linhas.map((l) => l.cap).filter(Boolean))];
      const titulo = `Aula ${n}${caps.length ? " — Cap. " + caps.join(", ") : ""}`;

      blocos.push(
        <div key={n} className="mb-6 last:mb-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 bg-pensi-yellow border border-black px-2 py-0.5 rounded shadow-sm">{titulo}</h3>
            {renderizarAcoes("A" + n)}
          </div>
          
          <div className="pl-1 space-y-4">
            {!linhas.length ? (
              <p className="text-sm font-medium text-gray-500 italic">Esta aula ainda não tem conteúdo cadastrado na planilha.</p>
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
  } else {
    const isProva = /prova|avaliação|simulado|recuperação/i.test(tagDia);
    const capsEmenta = extrairCapitulos(semData.ementas);
    const capsGeral = Object.keys(capsGerais || {}).map(Number).filter(Boolean);
    const todosCaps = [...new Set([...capsEmenta, ...capsGeral])].sort((a,b) => a - b);

    blocos.push(
      <div key="nf" className="bg-gray-50 border border-gray-200 border-dashed p-4 rounded-xl text-center mb-6">
        <p className="text-sm font-medium text-gray-500 uppercase">
          {tagDia ? `Evento: ${tagDia}` : "Nenhuma atividade registrada para este dia."}
        </p>
      </div>
    );
    
    if ((isProva || todosCaps.length > 0) && semData.ementas) {
      blocos.push(
        <div key="prova" className="bg-white border border-gray-300 p-5 rounded-xl shadow-sm">
          <h4 className="text-xs font-semibold uppercase mb-3 text-gray-900 bg-pensi-yellow inline-block px-2 py-0.5 rounded border border-black">
            Conteúdo da Ementa {todosCaps.length > 0 && `(Capítulos ${todosCaps.join(", ")})`}
          </h4>
          <p className="text-sm font-medium text-gray-800 whitespace-pre-wrap mb-4">{semData.ementas}</p>
          
          {todosCaps.length > 0 && currentCaps && (
            <div className="space-y-5 mt-5 border-t border-gray-200 pt-4">
              {todosCaps.map(capNum => {
                const linhasCap = currentCaps[capNum] || [];
                if (!linhasCap.length) return null;
                
                return (
                  <div key={capNum} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h5 className="text-xs font-semibold uppercase text-gray-900 mb-2 bg-white border border-black inline-block px-2 py-0.5 rounded">Capítulo {capNum}</h5>
                    <BlocoTemas linhas={linhasCap} />
                    <BlocoCampo linhas={linhasCap} campo="expectativas" titulo="Expectativas de Aprendizagem" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }
  }
  return <div>{blocos}</div>;
}

function renderDetalheSemana(tagDia, currentSemanas, currentAulaIdx, renderizarAcoes) {
  const ref = resolverReferencia(tagDia);
  if (!ref.nums.length) {
    return <div className="text-center text-gray-500 font-medium text-sm py-6 bg-gray-50 border border-dashed border-gray-300 rounded-xl">Este dia refere-se a evento/recesso/feriado/avaliação/revisão.</div>;
  }

  let tipo = ref.tipo;
  if (tipo === "numero") tipo = ref.nums.some((n) => currentAulaIdx[n]) ? "aula" : "semana";

  const alvos = new Map();
  ref.nums.forEach((n) => {
    if (tipo === "semana") {
      if (currentSemanas[n]) alvos.set(n, null);
    } else {
      const s = (currentAulaIdx[n] || [])[0];
      if (s === undefined) return;
      if (!alvos.has(s)) alvos.set(s, new Set());
      alvos.get(s).add(n);
    }
  });

  const blocos = [];
  alvos.forEach((foco, s) => {
    const d = currentSemanas[s];
    let aulas = d.aulas.length ? d.aulas : [{ num: null, key: "S" + s, texto: d.divisao || "Conteúdo da semana" }];
    if (foco) aulas = aulas.filter((a) => foco.has(a.num));

    blocos.push(
      <div key={s} className="mb-6 last:mb-0">
        <h3 className="text-sm font-semibold text-gray-900 bg-pensi-yellow border border-black px-2 py-0.5 rounded inline-block mb-3 shadow-sm">
          Semana {s}{d.modulo ? ` — ${d.modulo}` : ""}
        </h3>
        
        {d.tema && <p className="text-sm mb-2 font-medium"><strong className="text-gray-600 text-[10px] uppercase block">Tema</strong> {d.tema}</p>}
        
        <div className="space-y-4 mb-4">
          {aulas.map((a, i) => (
            <div key={i} className="flex flex-col gap-2 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="text-xs leading-relaxed whitespace-pre-wrap font-medium">{a.texto}</div>
              {renderizarAcoes(a.key)}
            </div>
          ))}
        </div>
        
        <div className="space-y-3">
          <BlocoTexto titulo="Objetivos de aprendizagem" texto={d.objetivos} />
          <BlocoTexto titulo="Exercícios de sala" texto={d.sala} />
          <BlocoTexto titulo="Exercícios de casa" texto={d.casa} />
          <BlocoTexto titulo="Atividades práticas" texto={d.prat} />
        </div>
      </div>
    );
  });
  return <div>{blocos}</div>;
}

function BlocoTemas({ linhas }) {
  const temas = [...new Set(linhas.map((r) => r.tema).filter(Boolean))];
  if (!temas.length) return <p className="text-sm mb-2 text-gray-500 italic">Tema não especificado.</p>;
  if (temas.length === 1) return <p className="text-sm mb-2"><strong className="text-[10px] font-semibold uppercase text-gray-500 block mb-0.5">Tema do Capítulo</strong> {temas[0]}</p>;
  return (
    <div className="mb-2">
      <p className="text-[10px] font-semibold uppercase text-gray-500 mb-1">Temas do Capítulo</p>
      <ul className="list-disc list-inside text-sm space-y-0.5">{temas.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </div>
  );
}

function BlocoCampo({ linhas, campo, titulo }) {
  const comValor = linhas.filter((r) => r[campo]);
  if (!comValor.length) return null;
  const vistos = new Map();
  comValor.forEach((r) => {
    if (!vistos.has(r[campo])) vistos.set(r[campo], []);
    vistos.get(r[campo]).push(r.tema);
  });
  if (vistos.size === 1) return <p className="text-sm mb-1"><strong className="text-[10px] font-semibold uppercase text-gray-500 block mb-0.5">{titulo}</strong> {[...vistos.keys()][0]}</p>;
  return (
    <div className="mb-2">
      <p className="text-[10px] font-semibold uppercase text-gray-500 mb-1">{titulo}</p>
      <ul className="list-disc list-inside text-sm space-y-0.5">
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
    <div className="mt-2">
      <strong className="block text-[10px] font-semibold uppercase text-gray-500 mb-1">{titulo}</strong>
      <div className="text-xs leading-relaxed bg-gray-50 border border-gray-200 rounded-lg p-3 whitespace-pre-wrap">{texto}</div>
    </div>
  );
}