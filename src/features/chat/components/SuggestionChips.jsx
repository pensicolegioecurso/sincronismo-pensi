export function SuggestionChips({ sugestoes, onPick }) {
  return (
    <div className="chat-chips">
      {sugestoes.map((s) => (
        <button key={s} className="chat-chip" onClick={() => onPick(s)}>
          {s}
        </button>
      ))}
    </div>
  );
}