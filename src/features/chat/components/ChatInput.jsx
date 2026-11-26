import { useState } from "react";

export function ChatInput({ onSend, disabled }) {
  const [texto, setTexto] = useState("");

  const enviar = () => {
    if (!texto.trim()) return;
    onSend(texto);
    setTexto("");
  };

  return (
    <div className="chat-input-wrap">
      <textarea
        className="chat-input"
        placeholder="Pergunte algo... ex: qual a melhor unidade?"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            enviar();
          }
        }}
        rows={1}
      />
      <button
        className="chat-send"
        onClick={enviar}
        disabled={disabled || !texto.trim()}
        aria-label="Enviar"
      >
        ➤
      </button>
    </div>
  );
}