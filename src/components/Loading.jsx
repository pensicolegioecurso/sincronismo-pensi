import { Loader2 } from "lucide-react";

export default function Loading({ texto = "Carregando..." }) {
  return (
    // Fundo preto com baixa opacidade e desfoque, cobrindo a tela inteira
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
      
      {/* Spinner gigante e amarelo */}
      <Loader2 
        className="w-24 h-24 text-pensi-yellow animate-spin" 
        strokeWidth={1.5} 
      />
      
      {/* Texto opcional abaixo */}
      <p className="mt-6 text-sm font-bold text-white uppercase tracking-widest drop-shadow-md">
        {texto}
      </p>
    </div>
  );
}