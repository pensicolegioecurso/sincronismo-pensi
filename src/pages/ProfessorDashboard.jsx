import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import ProfileModal from "../components/ProfileModal";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import StartTab from "../components/dashboard/StartTab";
import FeedTab from "../components/dashboard/FeedTab";
import { ArrowUp } from "lucide-react";

export default function ProfessorDashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("inicio"); 
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans text-gray-800 relative pb-28">
      
      {/* ÁREA PRINCIPAL */}
      <main className="relative z-10 flex-1 w-full max-w-[900px] mx-auto px-4 mt-12">
        {activeTab === "inicio" && <StartTab user={user} onNavigate={onNavigate} />}
        {activeTab === "feed" && <FeedTab user={user} />}
      </main>

      {/* BOTÃO VOLTAR AO TOPO (Opcional, se quiser manter) */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-28 right-6 z-50 p-3 bg-white border-[2px] border-black text-gray-900 rounded-full shadow-[3px_3px_0px_0px_#000] hover:-translate-y-1 hover:bg-gray-50 transition-all animate-fade-in"
      >
        <ArrowUp className="w-5 h-5" strokeWidth={3} />
      </button>

      {/* NAVBAR INFERIOR */}
      <DashboardNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onProfileOpen={() => setProfileOpen(true)} 
        logout={logout} 
      />

      {/* MODAL DE PERFIL */}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}