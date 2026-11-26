import { useState } from "react";
import { createPortal } from "react-dom";
import { doc, updateDoc } from "firebase/firestore";
import { Check, Settings, X } from "lucide-react";
import { db } from "../../services/firebase";

export default function DashboardSettingsModal({ user, navItems, onClose, onSave }) {
  const [itensNav, setItensNav] = useState(user?.navbarItens || navItems.map((item) => item.key));
  const [atalhos, setAtalhos] = useState(user?.atalhosInicio || []);
  const [atalhosPessoa, setAtalhosPessoa] = useState(user?.atalhosPessoa || []);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const cargos = [...(user?.cargos || []), user?.cargo].filter(Boolean).map((cargo) => String(cargo).toLowerCase());
  const isManager = cargos.some((cargo) => ["admin", "administrador", "nucleo", "regional", "diretor", "direcao", "coordenador"].includes(cargo));
  const acoesInicio = [
    { id: "feed", label: "Abrir o feed" },
    { id: "directs", label: "Meus directs" },
    { id: "profile", label: "Meu perfil" },
    ...(isManager ? [{ id: "relatorio-excel", label: "Baixar relatório Excel" }, { id: "relatorio-pdf", label: "Gerar relatório PDF" }] : []),
  ];

  const alternar = (list, setter, id) => setter((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  async function salvar() {
    if (!user?.uid) return setErro("N\u00e3o foi poss\u00edvel identificar sua conta.");
    if (!itensNav.length) return setErro("Mantenha pelo menos uma op\u00e7\u00e3o na barra inferior.");
    setSaving(true);
    setErro("");
    try {
      await updateDoc(doc(db, "users", user.uid), { navbarItens: itensNav, atalhosInicio: atalhos, atalhosPessoa });
      onSave({ navbarItens: itensNav, atalhosInicio: atalhos, atalhosPessoa });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar atalhos:", error);
      setErro("N\u00e3o foi poss\u00edvel salvar suas configura\u00e7\u00f5es.");
    } finally {
      setSaving(false);
    }
  }

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[1000001] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <section role="dialog" aria-modal="true" aria-label="Configurar atalhos" onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
        <header className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pensi-yellow"><Settings size={20} /></div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black">Personalizar atalhos</h2>
            <p className="text-xs text-gray-500">Escolha o que aparece na navega\u00e7\u00e3o e no In\u00edcio.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-full p-2 text-gray-500 hover:bg-gray-100"><X size={18} /></button>
        </header>

        <div className="space-y-6">
          <fieldset>
            <legend className="mb-2 text-xs font-black uppercase tracking-wide text-gray-500">Barra inferior</legend>
            <div className="grid grid-cols-2 gap-2">
              {navItems.map(({ key, title }) => (
                <label key={key} className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm font-bold ${itensNav.includes(key) ? "border-amber-300 bg-amber-50" : "border-gray-200"}`}>
                  <input type="checkbox" checked={itensNav.includes(key)} onChange={() => alternar(itensNav, setItensNav, key)} className="accent-black" />
                  {title}
                </label>
              ))}
            </div>
          </fieldset>
          {user?.atalhosPessoa?.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-xs font-black uppercase tracking-wide text-gray-500">Pessoas salvas na tela Início</legend>
              <div className="space-y-2">
                {user.atalhosPessoa.map((pessoa) => (
                  <label key={pessoa.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 p-3 text-sm font-bold">
                    <input type="checkbox" checked={atalhosPessoa.some((item) => item.id === pessoa.id)} onChange={() => setAtalhosPessoa((items) => items.some((item) => item.id === pessoa.id) ? items.filter((item) => item.id !== pessoa.id) : [...items, pessoa])} className="accent-black" />
                    {pessoa.nome}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <fieldset>
            <legend className="mb-2 text-xs font-black uppercase tracking-wide text-gray-500">Atalhos na tela In\u00edcio</legend>
            <div className="space-y-2">
              {acoesInicio.map(({ id, label }) => (
                <label key={id} className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm font-bold ${atalhos.includes(id) ? "border-amber-300 bg-amber-50" : "border-gray-200"}`}>
                  <input type="checkbox" checked={atalhos.includes(id)} onChange={() => alternar(atalhos, setAtalhos, id)} className="accent-black" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        {erro && <p role="alert" className="mt-4 text-xs font-semibold text-rose-600">{erro}</p>}
        <footer className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100">Cancelar</button>
          <button type="button" onClick={salvar} disabled={saving} className="flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? "Salvando..." : <><Check size={16} /> Salvar</>}</button>
        </footer>
      </section>
    </div>,
    document.body
  );
}
