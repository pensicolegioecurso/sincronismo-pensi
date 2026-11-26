
import { X, Mail, MapPin, UserRound, MessageCircle, Star } from "lucide-react";

const DOTS = ["bg-[#F5B800]", "bg-[#D7E7FF]", "bg-[#F4D5E5]"];

export default function ProfileHeader({ user, onClose, onDirectMessage, onAddShortcut }) {
  return (
    <header className="border-b-2 border-black bg-white px-5 pb-4 pt-4">
      <div className="mb-4 flex items-center gap-1.5">
        {DOTS.map((color, index) => (
          <span
            key={index}
            className={`h-3 w-3 rounded-full border border-black/30 ${color}`}
          />
        ))}

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar perfil"
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:border-black hover:bg-pensi-yellow hover:text-black"
        >
          <X size={17} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-pensi-yellow shadow-[2px_2px_0px_#000]">
          <UserRound size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-black uppercase leading-tight tracking-tight text-black">
            {user?.nome || "Professor"}
          </h2>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex min-w-0 items-center gap-1 text-[10px] font-semibold text-gray-500">
              <Mail size={11} />
              <span className="truncate">{user?.email}</span>
            </span>

            <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-500">
              <MapPin size={11} />
              <span className="truncate">{user?.unidade || "Sem unidade"}</span>
            </span>
          </div>
        </div>
        {onDirectMessage && (
          <button type="button" onClick={() => onDirectMessage(user)} className="flex shrink-0 items-center gap-2 rounded-full bg-black px-3 py-2 text-xs font-bold text-white hover:bg-gray-800">
            <MessageCircle size={15} /> Direct
          </button>
        )}
        {onAddShortcut && (
          <button type="button" onClick={() => onAddShortcut(user)} className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-amber-50">
            <Star size={15} /> Atalho
          </button>
        )}
      </div>
    </header>
  );
}
