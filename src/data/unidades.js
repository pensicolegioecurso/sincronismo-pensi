export const UNIDADES = [
  "Cabo Frio",
  "Campos dos Goytacazes",
  "Copacabana",
  "Flamengo",
  "Freguesia",
  "Icaraí 1",
  "Icaraí 2",
  "Icaraí 3",
  "Ilha do Governador",
  "Itaipu",
  "Méier",
  "Petrópolis",
  "Recreio 1",
  "Recreio 2",
  "Rio das Ostras",
  "Teresópolis",
  "Tijuca 1",
  "Tijuca 2",
  "Vila da Penha",
  "Vila Isabel",
];


export const REGIONAIS = {
  Beatriz: [
    "Cabo Frio", "Campos dos Goytacazes", "Copacabana", "Flamengo", "Freguesia",
    "Icaraí 1", "Icaraí 2", "Icaraí 3", "Ilha do Governador", "Itaipu",
    "Méier", "Petrópolis", "Recreio 1", "Recreio 2", "Rio das Ostras",
    "Teresópolis", "Tijuca 1", "Tijuca 2", "Vila da Penha", "Vila Isabel",
  ],
  Débora: ["Copacabana", "Icaraí 3", "Petrópolis", "Teresópolis", "Tijuca 1", "Tijuca 2", "Vila Isabel"],
  Paula: ["Cabo Frio", "Campos dos Goytacazes", "Flamengo", "Icaraí 1", "Icaraí 2", "Itaipu", "Rio das Ostras"],
};

export const getRegionalDaUnidade = (unidade) => {
  for (const [regional, unidades] of Object.entries(REGIONAIS)) {
    if (unidades.includes(unidade)) return regional;
  }
  return "N/A";
};

export const CARGOS = ["professor", "admin", "direcao"];