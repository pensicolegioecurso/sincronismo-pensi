export default function ReportTable({ titulo, colunas, linhas, vazio = "Nenhum registro." }) {
  if (!linhas?.length) {
    return (
      <div className="bg-white border border-pensi-line rounded-xl p-4">
        <h3 className="text-sm font-bold mb-2">{titulo}</h3>
        <div className="text-center text-pensi-muted text-xs py-4">{vazio}</div>
      </div>
    );
  }
  return (
    <div className="bg-white border border-pensi-line rounded-xl p-4">
      <h3 className="text-sm font-bold mb-3">{titulo}</h3>
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        <table className="rel-table">
          <thead>
            <tr>{colunas.map((c) => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {linhas.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => <td key={j}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}