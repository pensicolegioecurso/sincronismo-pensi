import { useRef } from "react";
import { createPortal } from "react-dom";
import ChatPage from "../ChatPage";

export function ChatModal({ aberto, onClose }) {
  const overlayRef = useRef(null);

  if (!aberto) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="chat-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="chat-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Assistente Sincronismos"
      >
        <ChatPage onClose={onClose} />
      </div>
    </div>,
    document.body
  );
}
