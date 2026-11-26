import { useRef, useEffect } from "react";
import { ChatHeader } from "./components/ChatHeader";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { SuggestionChips } from "./components/SuggestionChips";
import { TypingIndicator } from "./components/TypingIndicator";
import { useChatEngine } from "./hooks/useChatEngine";
import { useChatContext } from "./hooks/useChatContext";
import { SUGESTOES_INICIAIS } from "./data/sugestoes";

export default function ChatPage({ onClose }) {
  const ctx = useChatContext();
  const { messages, send, typing, reset } = useChatEngine(ctx);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  return (
    <div className="chat-root">
      <ChatHeader onClose={onClose} />

      <main className="chat-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-avatar">✦</div>
            <h2 className="chat-empty-title">O que você quer saber?</h2>
            <p className="chat-empty-sub">
              Pergunte em linguagem natural — eu entendo
            </p>
            <div className="chat-empty-chips">
              <SuggestionChips sugestoes={SUGESTOES_INICIAIS} onPick={send} />
            </div>
          </div>
        )}

        {messages.map((m) => (
          <ChatMessage key={m.id} msg={m} onSugestao={send} />
        ))}
        {typing && <TypingIndicator />}
      </main>

      <footer className="chat-footer">
        {messages.length > 0 && (
          <button onClick={reset} className="chat-reset">
            limpar conversa
          </button>
        )}
        <ChatInput onSend={send} disabled={typing} />
      </footer>
    </div>
  );
}