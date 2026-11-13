export default function AuthSidePanel({ icon: Icon, title, description, order }) {
  return (
    <div className={`flex flex-col items-start text-left h-full pt-2 ${order}`}>
      <div className="w-12 h-12 flex items-center justify-center bg-pensi-yellow border-[2px] border-black rounded-full shadow-[3px_3px_0px_0px_#000] mb-6">
        <Icon className="w-5 h-5 text-black" strokeWidth={2.5} />
      </div>
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight text-gray-900 mb-3">
        {title}<span className="text-pensi-yellow">.</span>
      </h1>
      <p className="text-[13px] font-light leading-relaxed text-gray-500 max-w-[280px]">
        {description}
      </p>
    </div>
  );
}