import { useEffect, useMemo, useState } from "react";
import { useReports } from "../hooks/useReports";
import { useAuth } from "../hooks/useAuth";
import Loading from "../components/Loading";

export default function Reports({ onBack }) {
  const { user } = useAuth();
  const {
    professores, checks, carregado, loading, erro, carregar,
    nomeDisciplina, formatarDataHora,
  } = useReports();

  const [buscaGlobal, setBuscaGlobal] = useState("");
  const [filtroSit, setFiltroSit] = useState("");
  const [filtroDe, setFiltroDe] = useState("");
  const [filtroAte, setFiltroAte] = useState("");
  const [filtroDisciplina, setFiltroDisciplina] = useState("");
  const [filtroUnidade, setFiltroUnidade] = useState("");

  useEffect(() => {
    if (!carregado) carregar();
  }, [carregado, carregar]);

  const podeVerTudo = user?.cargo === "admin" || user?.cargo === "direcao";
  
  const baseDados = useMemo(() => {
    let p = podeVerTudo ? professores : professores.filter((x) => x.email === user?.email);
    let c = podeVerTudo ? checks : checks.filter((x) => x.professorEmail === user?.email);
    return { p, c };
  }, [professores, checks, podeVerTudo, user]);

  const profMap = useMemo(() => Object.fromEntries(baseDados.p.map((p) => [p.email, p])), [baseDados.p]);

  const registrosUnicos = useMemo(() => {
    const unicos = new Map();
    const dtDe = filtroDe ? new Date(filtroDe + "T00:00:00") : null;
    const dtAte = filtroAte ? new Date(filtroAte + "T23:59:59") : null;

    baseDados.c.forEach((c) => {
      const p = profMap[c.professorEmail];
      
      // Filtros laterais
      if (filtroDisciplina && c.disciplina !== filtroDisciplina) return;
      if (filtroUnidade && !(p?.unidades || []).includes(filtroUnidade)) return;
      if (dtDe || dtAte) {
        const d = new Date(c.dataHora);
        if (isNaN(d.getTime())) return;
        if (dtDe && d < dtDe) return;
        if (dtAte && d > dtAte) return;
      }

      const k = [c.professorEmail, c.disciplina, c.serie, c.semana, c.dia, c.aulaIndex].join("|");
      const ant = unicos.get(k);
      if (!ant || new Date(c.dataHora) > new Date(ant.dataHora)) unicos.set(k, c);
    });
    return [...unicos.values()];
  }, [baseDados.c, profMap, filtroDisciplina, filtroUnidade, filtroDe, filtroAte]);

  const dadosFinais = useMemo(() => {
    const termo = buscaGlobal.toLowerCase().trim();
    let lista = registrosUnicos.filter((c) => {
      const p = profMap[c.professorEmail];
      if (termo && !String(p?.nome).toLowerCase().includes(termo) && !String(p?.email).toLowerCase().includes(termo)) return false;
      return true;
    });

    // Agrupar por Professor para exibir na tabela principal (como no layout)
    const agrupado = {};
    lista.forEach(c => {
      const email = c.professorEmail;
      if (!agrupado[email]) {
         const p = profMap[email];
         agrupado[email] = { 
           nome: p?.nome || email, 
           email, 
           unidade: p?.unidade || "—", 
           disciplinas: p?.disciplinas || [],
           totalChecks: 0, 
           ultimoCheck: null 
         };
      }
      agrupado[email].totalChecks++;
      const d = new Date(c.dataHora);
      if (!isNaN(d.getTime()) && (!agrupado[email].ultimoCheck || d > agrupado[email].ultimoCheck)) {
        agrupado[email].ultimoCheck = d;
      }
    });

    let res = Object.values(agrupado).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    if (filtroSit === "com") res = res.filter(r => r.totalChecks > 0);
    if (filtroSit === "sem") res = res.filter(r => r.totalChecks === 0);
    
    return res;
  }, [registrosUnicos, profMap, buscaGlobal, filtroSit]);

  const opcoesDisciplinas = useMemo(() => [...new Set(baseDados.p.flatMap(p => p.disciplinas))].filter(Boolean), [baseDados.p]);
  const opcoesUnidades = useMemo(() => [...new Set(baseDados.p.flatMap(p => p.unidades))].filter(Boolean), [baseDados.p]);

  if (loading) return <Loading texto="Gerando relatório..." />;

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-gray-800 flex justify-center py-6 px-4">
      <div className="w-full max-w-[1300px] bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-gray-200 min-h-[80vh]">
        
        {/* COLUNA ESQUERDA: BUSCA E TABELA */}
        <div className="flex-1 flex flex-col border-r border-gray-100">
          
          {/* Topbar de Busca */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition" title="Voltar">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por professor ou e-mail..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-pensi-yellow focus:bg-white transition"
                value={buscaGlobal}
                onChange={(e) => setBuscaGlobal(e.target.value)}
              />
            </div>
            <button className="px-4 py-2.5 bg-pensi-dark text-white rounded-lg text-sm font-bold shadow hover:bg-black transition hidden sm:block" onClick={carregar}>
              Atualizar
            </button>
          </div>

          {/* Cabeçalho da Tabela */}
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 px-6 py-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
            <div>Professor / E-mail</div>
            <div className="hidden sm:block">Disciplinas</div>
            <div className="text-center">Status / Checks</div>
          </div>

          {/* Lista de Resultados */}
          <div className="flex-1 overflow-y-auto p-2">
            {dadosFinais.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-10">Nenhum professor encontrado com os filtros atuais.</div>
            )}
            {dadosFinais.map((p, i) => (
              <div key={i} className="grid grid-cols-[2fr_1fr_1fr] gap-4 items-center px-4 py-4 hover:bg-gray-50 rounded-xl transition group cursor-pointer border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pensi-yellow-light text-pensi-yellow-hover flex items-center justify-center font-bold text-xs shrink-0">
                    {p.nome.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-800 group-hover:text-pensi-dark">{p.nome}</div>
                    <div className="text-xs text-gray-400">{p.email}</div>
                  </div>
                </div>
                <div className="hidden sm:block text-xs text-gray-500 truncate">
                  {p.disciplinas.map(nomeDisciplina).join(", ") || "—"}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${p.totalChecks > 0 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {p.totalChecks} Checks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA DIREITA: FILTROS */}
        <div className="w-full md:w-[320px] bg-[#fafafa] p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-gray-800">Filtros</h2>
            <button 
              className="text-xs text-gray-400 hover:text-pensi-yellow font-semibold"
              onClick={() => { setBuscaGlobal(""); setFiltroSit(""); setFiltroDisciplina(""); setFiltroUnidade(""); setFiltroDe(""); setFiltroAte(""); }}
            >
              Limpar
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="form-label text-gray-600 mb-1">Situação do Check</label>
              <select className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-pensi-yellow outline-none" value={filtroSit} onChange={(e) => setFiltroSit(e.target.value)}>
                <option value="">Todos os professores</option>
                <option value="com">Apenas com registro</option>
                <option value="sem">Apenas sem registro</option>
              </select>
            </div>

            <div>
              <label className="form-label text-gray-600 mb-1">Disciplina</label>
              <select className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-pensi-yellow outline-none" value={filtroDisciplina} onChange={(e) => setFiltroDisciplina(e.target.value)}>
                <option value="">Todas as disciplinas</option>
                {opcoesDisciplinas.map((d) => <option key={d} value={d}>{nomeDisciplina(d)}</option>)}
              </select>
            </div>

            <div>
              <label className="form-label text-gray-600 mb-1">Unidade</label>
              <select className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-pensi-yellow outline-none" value={filtroUnidade} onChange={(e) => setFiltroUnidade(e.target.value)}>
                <option value="">Todas as unidades</option>
                {opcoesUnidades.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div>
              <label className="form-label text-gray-600 mb-1">Período</label>
              <div className="flex items-center gap-2">
                <input type="date" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs focus:border-pensi-yellow outline-none" value={filtroDe} onChange={(e) => setFiltroDe(e.target.value)} />
                <span className="text-gray-400 text-xs">até</span>
                <input type="date" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs focus:border-pensi-yellow outline-none" value={filtroAte} onChange={(e) => setFiltroAte(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-200">
             <button className="w-full bg-pensi-yellow text-pensi-dark font-bold py-3 rounded-lg hover:bg-pensi-yellow-hover transition text-sm">
               Exportar Relatório (PDF)
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}