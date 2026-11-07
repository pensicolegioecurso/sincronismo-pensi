
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const verificarScroll = () => {
      setVisivel(window.scrollY > 350);
    };

    verificarScroll();

    window.addEventListener("scroll", verificarScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", verificarScroll);
    };
  }, []);

  const voltarAoTopo = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={voltarAoTopo}
      aria-label="Voltar ao topo da página"
      title="Voltar ao topo"
      tabIndex={visivel ? 0 : -1}
      className={`
        fixed bottom-6 right-6
        sm:bottom-8 sm:right-8
        z-50
        w-15 h-15
        flex items-center justify-center
        bg-pensi-yellow
        text-[#171717]
        border-[1.5px] border-black
        rounded-xl
        shadow-[3px_3px_0px_0px_#171717]
        hover:bg-[#ffdb4d]
        hover:shadow-[2px_2px_0px_0px_#171717]
        hover:translate-x-[1px]
        hover:translate-y-[1px]
        active:shadow-none
        active:translate-x-[3px]
        active:translate-y-[3px]
        transition-all duration-300
        cursor-pointer
        focus-visible:outline-2
        focus-visible:outline-offset-4
        focus-visible:outline-black
        ${
          visivel
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }
      `}
    >
      <ArrowUp className="w-5 h-5" strokeWidth={1.8} />
    </button>
  );
}
