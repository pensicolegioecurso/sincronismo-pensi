export function TypingIndicator() {
  return (
    <div className="chat-msg chat-msg-bot">
      <div className="chat-msg-avatar">✦</div>
      <div className="chat-msg-bubble chat-typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}