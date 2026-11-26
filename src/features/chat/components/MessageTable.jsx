export function MessageTable({ ranking, unidade }) {
  if (!ranking?.length) return null;
  return (
    <table className="chat-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Nome</th>
          <th>{unidade || "Total"}</th>
        </tr>
      </thead>
      <tbody>
        {ranking.map(([nome, qtd], i) => (
          <tr key={`${nome}-${i}`}>
            <td>{i + 1}</td>
            <td>{nome}</td>
            <td>{qtd}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}