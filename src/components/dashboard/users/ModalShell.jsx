import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Casca padrão de TODOS os modais.
 * - Renderiza em document.body (portal) com z-index máximo: cobre navbar, sidebar, tudo.
 * - Bolinhas de navegador iguais ao AuthCard.
 * - Trava o scroll da página e fecha com ESC / clique fora.
 */
export default function ModalShell({
  title,
  subtitle,
  icon: Icon,
  onClose,
  maxWidth = "max-w-lg",
  role = "dialog",
  footer,
  children,
}) {
  useEffect(() => {
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const aoTeclar = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", aoTeclar);

    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483000] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <section
        role={role}
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[92dvh] w-full ${maxWidth} flex-col overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)]`}
      >
        {/* Bolinhas de navegador */}
        <div className="absolute left-8 top-6 flex items-center gap-2" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-pensi-yellow" />
          <span className="h-3 w-3 rounded-full bg-gray-200" />
          <span className="h-3 w-3 rounded-full bg-gray-100" />
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-5 top-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-black"
        >
          <X size={18} />
        </button>

        <header className="shrink-0 px-6 pb-4 pt-14 sm:px-8">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-gray-800">
                <Icon size={20} strokeWidth={2} />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-lg font-black uppercase leading-tight tracking-tight text-gray-900">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 truncate text-xs font-bold uppercase tracking-wide text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 sm:px-8">{children}</div>

        {footer && (
          <footer className="shrink-0 border-t border-gray-100 bg-white px-6 py-4 sm:px-8">
            {footer}
          </footer>
        )}
      </section>
    </div>,
    document.body
  );
}