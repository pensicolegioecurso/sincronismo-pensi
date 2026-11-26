import { useState, useCallback, useEffect } from "react";

export function useChatModal() {
  const [aberto, setAberto] = useState(false);

  const abrir = useCallback(() => setAberto(true), []);
  const fechar = useCallback(() => setAberto(false), []);
  const toggle = useCallback(() => setAberto((v) => !v), []);

  // Fecha com ESC
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e) => {
      if (e.key === "Escape") fechar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto, fechar]);

  // Trava o scroll do body enquanto aberto
  useEffect(() => {
    if (!aberto) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [aberto]);

  return { aberto, abrir, fechar, toggle };
}