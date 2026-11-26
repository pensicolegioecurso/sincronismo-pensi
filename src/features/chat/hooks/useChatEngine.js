import { useState, useCallback, useEffect } from "react";
import { matchIntent } from "../engine/matcher";
import { HANDLERS, fallback } from "../engine/handlers";

const STORAGE_KEY = "chat-sincronismos-history";

export function useChatEngine(ctx) {
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
  }, [messages]);

  const send = useCallback(
    async (textoBruto) => {
      const texto = String(textoBruto || "").trim();
      if (!texto) return;

      const userMsg = {
        id: crypto.randomUUID(),
        role: "user",
        text: texto,
        ts: Date.now(),
      };
      setMessages((m) => [...m, userMsg]);
      setTyping(true);

      await new Promise((r) => setTimeout(r, 350 + Math.random() * 450));

      const intent = matchIntent(texto);
      let resposta;
      try {
        if (intent && HANDLERS[intent.handler]) {
          resposta = HANDLERS[intent.handler]({
            texto,
            ctx,
            extract: intent.extract,
          });
        } else {
          resposta = fallback({ texto, ctx });
        }
      } catch (e) {
        console.error("Chat handler error:", e);
        resposta = { text: "Tive um problema ao consultar os dados 😅." };
      }

      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "bot",
          text: resposta.text,
          data: resposta.data,
          ts: Date.now(),
        },
      ]);
    },
    [ctx]
  );

  const reset = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { messages, send, typing, reset };
}