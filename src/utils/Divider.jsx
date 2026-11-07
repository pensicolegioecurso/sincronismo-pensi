export default function Divider() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 my-2 flex items-center justify-center relative z-10">
      <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-gray-300 to-gray-200"></div>
      <div className="w-2.5 h-2.5 rotate-45 border-2 border-gray-300 mx-6 bg-white/50"></div>
      <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-gray-300 to-gray-200"></div>
    </div>
  );
}