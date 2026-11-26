import { Sparkles } from "lucide-react";

export function ChatHeader({ onClose }) {
  return (
    <header className="chat-header">
      <div className="chat-header-info">
        <div className="chat-avatar">✦</div>
        <div>
          <div className="chat-title-row">
            <h1 className="chat-title">Assistente Sincronismos</h1>
            <Sparkles size={15} aria-hidden="true" />
          </div>
          <p className="chat-subtitle">Dados de unidades, professores e checks</p>
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="chat-close" aria-label="Fechar">
          ✕
        </button>
      )}
    </header>
  );
}
