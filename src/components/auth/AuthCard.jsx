export default function AuthCard({ children, maxWidth = "max-w-[1000px]" }) {
  return (
    <div className={`relative z-10 w-full ${maxWidth} bg-white border border-gray-100 rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] px-8 py-10 sm:px-14 sm:py-14`}>
      
      {/* Bolinhas de navegador */}
      <div className="absolute top-6 left-8 flex items-center gap-2" aria-hidden="true">
        <span className="w-3 h-3 rounded-full bg-pensi-yellow" />
        <span className="w-3 h-3 rounded-full bg-gray-200" />
        <span className="w-3 h-3 rounded-full bg-gray-100" />
      </div>

      {children}
    </div>
  );
}