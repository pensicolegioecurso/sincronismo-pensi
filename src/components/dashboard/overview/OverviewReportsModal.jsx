import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  FileSpreadsheet,
  FileText,
  Eye,
  Check,
  Building2,
  Users,
  CalendarDays,
  ClipboardList,
  ChartNoAxesCombined,
  Download,
  Printer,
  Clock3,
  ChevronDown,
  FileBarChart,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";

const OPCOES = [
  {
    id: "resumo",
    titulo: "Resumo geral",
    descricao: "Indicadores e percentual",
    Icon: ChartNoAxesCombined,
  },
  {
    id: "unidades",
    titulo: "Desempenho das unidades",
    descricao: "Resultados por unidade",
    Icon: Building2,
  },
  {
    id: "professores",
    titulo: "Ranking de professores",
    descricao: "Desempenho dos professores",
    Icon: Users,
  },
  {
    id: "pendencias",
    titulo: "Pendências por dia",
    descricao: "Pendências diárias",
    Icon: Clock3,
  },
  {
    id: "registros",
    titulo: "Registros detalhados",
    descricao: "Aulas e status",
    Icon: ClipboardList,
  },
  {
    id: "excecoes",
    titulo: "Exceções do calendário",
    descricao: "Feriados e recessos",
    Icon: CalendarDays,
  },
];

function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escaparHTML(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatarData(data) {
  if (!data) return "-";
  const partes = String(data).split("-");
  if (partes.length !== 3) return data;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obterStatus(status) {
  const valor = normalizarTexto(status);
  if (["realizado", "concluido", "concluida", "feito", "feita"].includes(valor)) {
    return "Concluída";
  }
  if (valor === "justificado" || valor === "justificada") {
    return "Justificada";
  }
  return "Pendente";
}

function construirRanking(porUnidade, users) {
  const usuariosPorId = new Map();
  users.forEach((user) => {
    usuariosPorId.set(user.uid || user.id, user);
  });

  return porUnidade.map((unidade) => {
    const professores = new Map();

    (unidade.historico || []).forEach((registro) => {
      const uid = registro.responsavelUid;
      if (!uid) return;

      const usuario = usuariosPorId.get(uid);
      const nome =
        registro.responsavel ||
        usuario?.nome ||
        usuario?.email ||
        "Professor não identificado";

      if (!professores.has(uid)) {
        professores.set(uid, {
          uid,
          nome,
          concluidas: 0,
          pendentes: 0,
          justificadas: 0,
          total: 0,
        });
      }

      const professor = professores.get(uid);
      professor.total++;

      if (registro.status === "realizado") {
        professor.concluidas++;
      } else if (registro.status === "justificado") {
        professor.justificadas++;
      } else {
        professor.pendentes++;
      }
    });

    const ranking = Array.from(professores.values())
      .map((professor) => ({
        ...professor,
        percentual: professor.total
          ? Math.round((professor.concluidas / professor.total) * 100)
          : 0,
      }))
      .sort(
        (a, b) =>
          b.concluidas - a.concluidas ||
          b.percentual - a.percentual ||
          a.nome.localeCompare(b.nome, "pt-BR")
      )
      .slice(0, 10);

    return {
      unidade: unidade.nome,
      professores: ranking,
    };
  });
}

export default function OverviewReportsModal({
  onClose,
  dadosFiltrados,
  users = [],
  excecoesCalendario = [],
  calendarios = [],
  filtroPeriodo = "mes",
  mesFiltro,
  dataInicioCustom,
  dataFimCustom,
  initialFormat = "excel",
}) {
  const [montado, setMontado] = useState(false);
  const [selecionados, setSelecionados] = useState([
    "resumo",
    "unidades",
    "pendencias",
    "registros",
  ]);
  const [visualizar, setVisualizar] = useState(true);
  const [formato, setFormato] = useState(initialFormat);
  const [exportando, setExportando] = useState(false);
  const [buscaPreview, setBuscaPreview] = useState("");
  const [tela, setTela] = useState(null);

  useEffect(() => {
    setMontado(true);
    return () => setMontado(false);
  }, []);

  const porUnidade = dadosFiltrados?.porUnidade || [];
  const total = dadosFiltrados?.total || { concluidas: 0, pendentes: 0, justificadas: 0 };
  const totalGeral = total.concluidas + total.pendentes + total.justificadas;
  const percentual = totalGeral ? Math.round((total.concluidas / totalGeral) * 100) : 0;

  const ranking = useMemo(() => construirRanking(porUnidade, users), [porUnidade, users]);

  const registros = useMemo(() => {
    return porUnidade
      .flatMap((unidade) =>
        (unidade.historico || []).map((registro) => {
          const usuario = users.find(
            (user) => (user.uid || user.id) === registro.responsavelUid
          );

          return {
            id: registro.id,
            unidade: registro.unidade || unidade.nome,
            professor:
              registro.responsavel ||
              usuario?.nome ||
              usuario?.email ||
              "Não identificado",
            professorUid: registro.responsavelUid || "",
            email: usuario?.email || "",
            data: registro.data || "",
            turma: registro.turma || "-",
            tipo: registro.tipo || "aula",
            status: obterStatus(registro.status),
            observacao: registro.observacao || "",
            justificativa:
              registro.justificativa ||
              registro.motivo ||
              registro.descricao ||
              registro.comentario ||
              "",
          };
        })
      )
      .sort((a, b) => String(b.data).localeCompare(String(a.data)));
  }, [porUnidade, users]);

  const pendencias = useMemo(() => {
    return registros
      .filter((registro) => normalizarTexto(registro.status) === "pendente")
      .sort((a, b) => {
        const data = String(b.data).localeCompare(String(a.data));
        if (data !== 0) return data;
        return a.professor.localeCompare(b.professor, "pt-BR");
      });
  }, [registros]);

  const excecoes = useMemo(() => {
    const lista = [
      ...excecoesCalendario,
      ...calendarios.flatMap((calendario) =>
        (calendario.excecoes || []).map((exc) => ({
          ...exc,
          calendarioNome: calendario.nome,
          calendarioId: calendario.id,
        }))
      ),
    ];

    const mapa = new Map();

    lista.forEach((exc) => {
      const chave = [
        exc.id || "",
        exc.calendarioId || "",
        exc.unidade || "",
        exc.dataInicio || "",
        exc.dataFim || "",
        exc.motivo || "",
      ].join("|");

      if (!mapa.has(chave)) {
        mapa.set(chave, {
          unidade: exc.unidade || "Todas as unidades",
          inicio: exc.dataInicio,
          fim: exc.dataFim || exc.dataInicio,
          motivo: exc.motivo || "Sem motivo informado",
          tipo: exc.tipo || "todas",
          turma: exc.turma || "-",
          serie: exc.serie || "-",
          calendario: exc.calendarioNome || "Calendário",
        });
      }
    });

    const unidadesVisiveis = new Set(
      porUnidade.map((unidade) => normalizarTexto(unidade.nome))
    );

    return Array.from(mapa.values())
      .filter(
        (exc) =>
          normalizarTexto(exc.unidade) === "todas as unidades" ||
          unidadesVisiveis.has(normalizarTexto(exc.unidade))
      )
      .sort((a, b) => String(a.inicio).localeCompare(String(b.inicio)));
  }, [excecoesCalendario, calendarios, porUnidade]);

  const periodoLabel = useMemo(() => {
    if (filtroPeriodo === "anual") {
      return `Ano ${mesFiltro?.getFullYear() || new Date().getFullYear()}`;
    }
    if (filtroPeriodo === "custom") {
      return `${formatarData(dataInicioCustom)} até ${formatarData(dataFimCustom)}`;
    }
    return mesFiltro
      ? mesFiltro.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
      : "Período mensal";
  }, [filtroPeriodo, mesFiltro, dataInicioCustom, dataFimCustom]);

  function alternarOpcao(id) {
    setSelecionados((atuais) =>
      atuais.includes(id)
        ? atuais.filter((item) => item !== id)
        : [...atuais, id]
    );
  }

  function selecionarTodos() {
    setSelecionados((atuais) =>
      atuais.length === OPCOES.length ? [] : OPCOES.map((opcao) => opcao.id)
    );
  }

  function criarSecoes() {
    const secoes = [];

    if (selecionados.includes("resumo")) {
      secoes.push({
        titulo: "Resumo geral",
        colunas: ["Indicador", "Quantidade"],
        linhas: [
          ["Total de registros", totalGeral],
          ["Concluídas", total.concluidas],
          ["Pendentes", pendencias.length],
          ["Justificadas", total.justificadas],
          ["Percentual de conclusão", `${percentual}%`],
        ],
      });
    }

    if (selecionados.includes("unidades")) {
      secoes.push({
        titulo: "Desempenho por unidade",
        colunas: ["Unidade", "Regional", "Concluídas", "Pendentes", "Justificadas", "Total", "Conclusão %"],
        linhas: porUnidade.map((unidade) => {
          const totalUnidade = unidade.c + unidade.p + unidade.j;
          return [
            unidade.nome,
            unidade.regional || "-",
            unidade.c,
            unidade.p,
            unidade.j,
            totalUnidade,
            totalUnidade ? `${Math.round((unidade.c / totalUnidade) * 100)}%` : "0%",
          ];
        }),
      });
    }

    if (selecionados.includes("professores")) {
      secoes.push({
        titulo: "Top 10 professores por unidade",
        colunas: ["Unidade", "Posição", "Professor", "Concluídas", "Pendentes", "Justificadas", "Total", "Conclusão %"],
        linhas: ranking.flatMap((grupo) =>
          grupo.professores.map((professor, index) => [
            grupo.unidade,
            index + 1,
            professor.nome,
            professor.concluidas,
            professor.pendentes,
            professor.justificadas,
            professor.total,
            `${professor.percentual}%`,
          ])
        ),
      });
    }

    if (selecionados.includes("pendencias")) {
      secoes.push({
        titulo: "Pendências por dia",
        colunas: ["Data da pendência", "Professor", "E-mail", "Unidade", "Turma", "Tipo", "Status"],
        linhas: pendencias.map((registro) => [
          formatarData(registro.data),
          registro.professor,
          registro.email || "-",
          registro.unidade,
          registro.turma,
          registro.tipo,
          "Pendente",
        ]),
      });
    }

    if (selecionados.includes("registros")) {
      secoes.push({
        titulo: "Registros detalhados",
        colunas: ["Unidade", "Professor", "E-mail", "Data", "Turma", "Tipo", "Status", "Observação", "Justificativa"],
        linhas: registros.map((registro) => [
          registro.unidade,
          registro.professor,
          registro.email || "-",
          formatarData(registro.data),
          registro.turma,
          registro.tipo,
          registro.status,
          registro.observacao,
          registro.justificativa,
        ]),
      });
    }

    if (selecionados.includes("excecoes")) {
      secoes.push({
        titulo: "Exceções do calendário",
        colunas: ["Calendário", "Unidade", "Data inicial", "Data final", "Tipo", "Turma", "Série", "Motivo"],
        linhas: excecoes.map((exc) => [
          exc.calendario,
          exc.unidade,
          formatarData(exc.inicio),
          formatarData(exc.fim),
          exc.tipo,
          exc.turma,
          exc.serie,
          exc.motivo,
        ]),
      });
    }

    return secoes;
  }

  const secoes = criarSecoes();

  const secoesFiltradas = secoes.map((secao) => ({
    ...secao,
    linhas: secao.linhas.filter((linha) =>
      linha.some((valor) =>
        normalizarTexto(valor).includes(normalizarTexto(buscaPreview))
      )
    ),
  }));

  function exportarExcel() {
    if (!selecionados.length) return;
    setExportando(true);

    try {
      const workbook = XLSX.utils.book_new();
      const nomesUsados = new Set();

      secoes.forEach((secao, index) => {
        const worksheet = XLSX.utils.aoa_to_sheet([
          [`RELATÓRIO PENSI - ${secao.titulo}`],
          [`Período: ${periodoLabel}`],
          [`Gerado em: ${new Date().toLocaleString("pt-BR")}`],
          [],
          secao.colunas,
          ...secao.linhas,
        ]);

        worksheet["!cols"] = secao.colunas.map((coluna, i) => {
          const maiorValor = Math.max(
            coluna.length,
            ...secao.linhas.map((linha) => String(linha[i] ?? "").length)
          );
          return { wch: Math.min(Math.max(maiorValor + 3, 15), 45) };
        });

        const base = secao.titulo
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9 ]/g, "")
          .slice(0, 25) || `Relatorio${index + 1}`;

        let nomeAba = base;
        let contador = 1;

        while (nomesUsados.has(nomeAba)) {
          nomeAba = `${base.slice(0, 21)} ${contador++}`;
        }

        nomesUsados.add(nomeAba);
        XLSX.utils.book_append_sheet(workbook, worksheet, nomeAba);
      });

      XLSX.writeFile(workbook, `Relatorio_Pensi_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (erro) {
      console.error("Erro ao exportar Excel:", erro);
      alert("Não foi possível gerar o Excel.");
    } finally {
      setExportando(false);
    }
  }

  function exportarPDF() {
    if (!selecionados.length) return;

    const conteudo = secoes
      .map((secao) => {
        const cabecalho = secao.colunas
          .map((coluna) => `<th>${escaparHTML(coluna)}</th>`)
          .join("");

        const linhas = secao.linhas.length
          ? secao.linhas
              .map(
                (linha) =>
                  `<tr>${linha.map((valor) => `<td>${escaparHTML(valor)}</td>`).join("")}</tr>`
              )
              .join("")
          : `<tr><td colspan="${secao.colunas.length}">Nenhum registro encontrado.</td></tr>`;

        return `
          <section>
            <h2>${escaparHTML(secao.titulo)}</h2>
            <table>
              <thead><tr>${cabecalho}</tr></thead>
              <tbody>${linhas}</tbody>
            </table>
            <p class="contador">${secao.linhas.length} registros</p>
          </section>
        `;
      })
      .join("");

    const janela = window.open("", "_blank");

    if (!janela) {
      alert("Permita pop-ups para gerar o PDF.");
      return;
    }

    janela.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Relatório Pensi</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; color: #171717; padding: 28px; }
          h1 { font-size: 25px; margin-bottom: 5px; }
          h2 { font-size: 17px; margin: 26px 0 10px; }
          .periodo { color: #666; font-size: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 5px; }
          th { background: #f5cf28; text-align: left; }
          th, td { border: 1px solid #ddd; padding: 7px; overflow-wrap: anywhere; }
          tr { page-break-inside: avoid; }
          .contador { color: #777; font-size: 10px; text-align: right; }
          section { page-break-inside: auto; }
          @media print { body { padding: 0; } @page { size: landscape; margin: 12mm; } }
        </style>
      </head>
      <body>
        <h1>Relatório Pensi</h1>
        <p class="periodo">
          Período: ${escaparHTML(periodoLabel)}
          <br />
          Gerado em: ${escaparHTML(new Date().toLocaleString("pt-BR"))}
        </p>
        ${conteudo}
        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `);

    janela.document.close();
  }

  function gerarRelatorio() {
    if (!selecionados.length || exportando) return;
    if (formato === "excel") {
      exportarExcel();
    } else {
      exportarPDF();
    }
  }

  function renderizarPreview(secao) {
    const secaoOpcao = OPCOES.find((opcao) =>
      secao.titulo.toLowerCase().includes(opcao.titulo.toLowerCase())
    );

    const Icon = secaoOpcao?.Icon || FileBarChart;

    return (
      <div key={secao.titulo} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <Icon size={15} />
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-xs font-black text-gray-900">{secao.titulo}</h4>
              <p className="text-[10px] text-gray-400">{secao.linhas.length} registros</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-yellow-100 px-2.5 py-1 text-[10px] font-black text-gray-800">
            {secao.linhas.length}
          </span>
        </div>

        <div className="max-h-56 overflow-x-auto overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`::-webkit-scrollbar { display: none; }`}</style>
          <table className="w-full min-w-max text-left text-[10px]">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr>
                {secao.colunas.slice(0, 6).map((coluna) => (
                  <th key={coluna} className="px-3 py-2.5 font-black text-gray-500">
                    {coluna}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {secao.linhas.slice(0, 12).map((linha, index) => (
                <tr key={index} className="border-t border-gray-50">
                  {linha.slice(0, 6).map((valor, i) => (
                    <td key={i} className="max-w-44 px-3 py-2.5 font-medium text-gray-700">
                      {String(valor ?? "-")}
                    </td>
                  ))}
                </tr>
              ))}
              {!secao.linhas.length && (
                <tr>
                  <td colSpan={Math.min(secao.colunas.length, 6)} className="px-3 py-6 text-center text-gray-400">
                    Nenhum dado encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {secao.linhas.length > 12 && (
          <p className="border-t border-gray-50 px-3 py-2 text-[10px] text-gray-400">
            Exibindo 12 de {secao.linhas.length} registros na prévia.
          </p>
        )}
      </div>
    );
  }

  if (!montado) return null;

  const acaoVoltar = () => setTela(null);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 backdrop-blur-sm p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] sm:rounded-[28px] bg-white p-5 pb-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`::-webkit-scrollbar { display: none; }`}</style>

        {/* CABEÇALHO PADRONIZADO */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {tela ? (
              <button
                type="button"
                onClick={acaoVoltar}
                aria-label="Voltar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2f2f2] hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
            ) : (
              <FileBarChart size={24} className="text-gray-900" />
            )}
            <h2 className="truncate text-xl font-extrabold text-gray-900">
              {tela === "selecionar" ? "O que incluir" : tela === "formato" ? "Formato de saída" : "Relatórios"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2f2f2] hover:bg-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ============ TELA INICIAL ============ */}
        {!tela && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 rounded-full bg-[#f2f2f2] px-4 py-3 text-gray-500">
              <Search size={18} />
              <span className="text-sm">Do que você precisa?</span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTela("selecionar")}
                className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl bg-yellow-400 p-4 text-left transition-all shadow-lg"
              >
                <div className="relative z-10">
                  <h3 className="text-lg font-bold leading-tight text-gray-900">Incluir</h3>
                  <p className="text-xs text-yellow-800">Selecionar seções</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-gray-900 relative z-10">
                  Acessar <ChevronRight size={14} />
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <PlusCircle size={80} />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTela("formato")}
                className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl bg-gray-100 p-4 text-left transition-all text-gray-500 hover:bg-gray-200"
              >
                <div className="relative z-10">
                  <h3 className="text-lg font-bold leading-tight">Formato</h3>
                  <p className="text-xs text-gray-400">Excel ou PDF</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold relative z-10">
                  Acessar <ChevronRight size={14} />
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <FileText size={80} />
                </div>
              </button>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-bold text-gray-900">Pré-visualização</h3>
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <button
                  onClick={() => setVisualizar(!visualizar)}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                >
                  <span className="flex items-center gap-2">
                    <Eye size={16} className="text-gray-500" />
                    <span className="text-xs font-black text-gray-800">Ver dados</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold text-gray-500">
                      {secoes.length} seções
                    </span>
                  </span>
                  <ChevronDown
                    size={17}
                    className={`text-gray-500 transition-transform ${visualizar ? "rotate-180" : ""}`}
                  />
                </button>

                {visualizar && (
                  <div className="space-y-3 border-t border-gray-100 p-3">
                    {selecionados.length > 0 && (
                      <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={buscaPreview}
                          onChange={(e) => setBuscaPreview(e.target.value)}
                          placeholder="Pesquisar na prévia..."
                          className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-yellow-400 focus:bg-white"
                        />
                      </div>
                    )}

                    {selecionados.length ? (
                      secoesFiltradas.map(renderizarPreview)
                    ) : (
                      <p className="rounded-xl bg-gray-50 p-5 text-center text-xs text-gray-400">
                        Selecione pelo menos uma seção.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={gerarRelatorio}
              disabled={!selecionados.length || exportando}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-4 font-semibold text-white disabled:opacity-30 transition-all active:scale-[0.98]"
            >
              {formato === "excel" ? <Download size={16} /> : <Printer size={16} />}
              {exportando ? "Gerando..." : formato === "excel" ? "Baixar Excel" : "Gerar PDF"}
            </button>
          </div>
        )}

        {/* ============ TELA SELECIONAR (LISTA VERTICAL) ============ */}
        {tela === "selecionar" && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-gray-500">Escolha as seções do relatório.</p>
              <button
                onClick={selecionarTodos}
                className="text-[10px] font-black uppercase tracking-wide text-gray-500 underline decoration-yellow-400 decoration-2 underline-offset-4 transition hover:text-black"
              >
                {selecionados.length === OPCOES.length ? "Limpar" : "Tudo"}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {OPCOES.map(({ id, titulo, descricao, Icon }) => {
                const ativo = selecionados.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => alternarOpcao(id)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors ${
                      ativo ? "bg-yellow-400 text-gray-900 shadow-sm" : "bg-[#f2f2f2] text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ativo ? "bg-yellow-300" : "bg-white text-black"}`}>
                        <Icon size={20} strokeWidth={2} />
                      </div>
                      <div>
                        <p className="font-semibold leading-tight">{titulo}</p>
                        <p className={`text-xs ${ativo ? "text-yellow-800" : "text-gray-500"}`}>{descricao}</p>
                      </div>
                    </div>
                    {ativo && <CheckCircle2 size={20} className="text-gray-900" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ============ TELA FORMATO (LISTA VERTICAL) ============ */}
        {tela === "formato" && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setFormato("excel")}
              className={`flex items-center justify-between rounded-2xl p-4 transition ${
                formato === "excel"
                  ? "bg-yellow-400 text-gray-900 shadow-sm"
                  : "bg-[#f2f2f2] text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet size={24} />
                <div>
                  <p className="font-bold">Excel</p>
                  <p className={`text-xs ${formato === "excel" ? "text-yellow-800" : "text-gray-400"}`}>Arquivo .xlsx</p>
                </div>
              </div>
              {formato === "excel" && <CheckCircle2 size={20} />}
            </button>

            <button
              onClick={() => setFormato("pdf")}
              className={`flex items-center justify-between rounded-2xl p-4 transition ${
                formato === "pdf"
                  ? "bg-yellow-400 text-gray-900 shadow-sm"
                  : "bg-[#f2f2f2] text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={24} />
                <div>
                  <p className="font-bold">PDF</p>
                  <p className={`text-xs ${formato === "pdf" ? "text-yellow-800" : "text-gray-400"}`}>Imprimir / salvar</p>
                </div>
              </div>
              {formato === "pdf" && <CheckCircle2 size={20} />}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
