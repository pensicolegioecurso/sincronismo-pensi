import { MessageTable } from "./MessageTable";

export function ChatMessage({ msg, onSugestao }) {
  const isBot = msg.role === "bot";
  return (
    <div className={`chat-msg ${isBot ? "chat-msg-bot" : "chat-msg-user"}`}>
      {isBot && <div className="chat-msg-avatar">✦</div>}
      <div className="chat-msg-bubble">
        <p
          className="chat-msg-text"
          dangerouslySetInnerHTML={{ __html: formatar(msg.text) }}
        />

        {msg.data?.tipo === "lista" && (
          <ul className="chat-list">
            {msg.data.itens.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        )}

        {msg.data?.tipo === "ranking" && (
          <MessageTable ranking={msg.data.ranking} unidade={msg.data.unidade} />
        )}

        {msg.data?.tipo === "sugestoes" && onSugestao && (
          <div className="chat-sugestoes-inline">
            {[
              "Qual a melhor unidade?",
              "Checks hoje",
              "Ranking de professores",
            ].map((s) => (
              <button
                key={s}
                onClick={() => onSugestao(s)}
                className="chat-chip"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatar(t) {
  return String(t)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}