export default function AuthCard({ children, maxWidth = "max-w-[850px]" }) {
  return (
    <div className={`relative z-10 w-full ${maxWidth} bg-white border-[3px] border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] px-8 py-8 sm:px-10 sm:py-10`}>
      <div className="absolute top-5 left-6 flex items-center gap-1.5" aria-hidden="true">
        <span className="w-2.5 h-2.5 rounded-full bg-pensi-yellow border border-black/30" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#D8E8FF] border border-black/30" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#F8DCEB] border border-black/30" />
      </div>
      {children}
    </div>
  );
}