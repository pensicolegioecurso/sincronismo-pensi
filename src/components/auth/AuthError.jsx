export default function AuthError({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="mb-5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-[13px] font-medium text-red-600">
      {children}
    </div>
  );
}