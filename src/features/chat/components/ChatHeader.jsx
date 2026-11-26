export function ChatHeader({ onClose }) {
  return (
    <header className="chat-header">
      <div className="chat-header-info">
        <div className="chat-avatar">✦</div>
        <div>
          <h1 className="chat-title">Pergunte aos Sincronismos</h1>
          <p className="chat-subtitle">
            Unidades · Professores · Checks · Calendário
          </p>
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