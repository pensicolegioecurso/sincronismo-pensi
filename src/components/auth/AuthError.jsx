export default function AuthError({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="mb-4 bg-red-50 border-[2px] border-black rounded-lg px-3 py-2 text-[11px] font-medium text-red-700">
      {children}
    </div>
  );
}