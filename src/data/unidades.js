export const UNIDADES = [
  "Todas", "Cabo Frio", "Campos", "Copacabana", "Flamengo", "Freguesia", 
  "Icaraí 1", "Icaraí 2", "Icaraí 3", "Ilha do Governador", "Itaipu", 
  "Méier", "Petrópolis", "Recreio 1", "Recreio 2", "Rio das Ostras", 
  "Teresópolis", "Tijuca 1", "Tijuca 2", "Vila da Penha", "Vila Isabel"
];

// Mapeamento de Regionais (Baseado na imagem)
export const REGIONAIS = {
  "Beatriz": ["Cabo Frio", "Campos", "Copacabana", "Flamengo", "Freguesia", "Icaraí 1", "Icaraí 2", "Icaraí 3", "Ilha do Governador", "Itaipu", "Méier", "Petrópolis", "Recreio 1", "Recreio 2", "Rio das Ostras", "Teresópolis", "Tijuca 1", "Tijuca 2", "Vila da Penha", "Vila Isabel"],
  "Débora": ["Copacabana", "Icaraí 3", "Petrópolis", "Teresópolis", "Tijuca 1", "Tijuca 2", "Vila Isabel"],
  "Paula": ["Cabo Frio", "Campos", "Flamengo", "Icaraí 1", "Icaraí 2", "Itaipu", "Rio das Ostras"]
};
// Nota: Como você não especificou qual unidade pertence a qual regional na imagem, 
// deixei a "Beatriz" com todas e as outras como exemplo. Você pode ajustar o array acima.

export const getRegionalDaUnidade = (unidade) => {
  for (const [regional, unidades] of Object.entries(REGIONAIS)) {
    if (unidades.includes(unidade)) return regional;
  }
  return "N/A";
};

export const CARGOS = ["professor", "admin", "direcao"];