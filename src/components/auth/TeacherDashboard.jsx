import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import DashboardNavbar from "../layout/DashboardNavbar";
import ProfileModal from "../layout/ProfileModal";
import StartTab from "../dashboard/start/StartTab";
import FeedTab from "../dashboard/feed/FeedTab";

export default function TeacherDashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("inicio");
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-pensi-bg flex flex-col font-sans text-pensi-dark relative pb-28 selection:bg-pensi-yellow selection:text-black">
      
      {/* Brilhos de fundo no mesmo estilo da Home */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pensi-yellow/10 rounded-full blur-[120px] pointer-events-none z-0" />
      
      <main className="relative z-10 flex-1 w-full max-w-[1100px] mx-auto px-4 pt-8">
        {activeTab === "inicio" && <StartTab onNavigate={onNavigate} />}
        {activeTab === "feed" && <FeedTab user={user} />}
      </main>

      <DashboardNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onProfileOpen={() => setProfileOpen(true)}
        logout={logout}
      />

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}