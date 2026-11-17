// src/components/auth/TeacherDashboard.jsx
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
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans text-gray-800 relative pb-28">
      <main className="relative z-10 flex-1 w-full max-w-[1100px] mx-auto px-4 pt-4">
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