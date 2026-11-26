// Arquivo: src/pages/DashboardPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import ProfileModal from "../components/ProfileModal";
import AdminOverview from "../components/dashboard/AdminOverview";
import AdminUsers from "../components/dashboard/AdminUsers";
import TurmasAdmin from "../components/dashboard/TurmasAdmin";
import DirecaoCalendario from "../components/dashboard/DirecaoCalendario";
import StartTab from "../components/dashboard/StartTab";
import FeedTab from "../components/dashboard/FeedTab";
import TeacherProfileModal from "../components/dashboard/TeacherProfileModal";
import DirectMessagesModal from "../components/dashboard/DirectMessagesModal";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const DIRECTION_ROLES = ["diretor", "direcao", "coordenador"];
const ADMIN_MANAGER_ROLES = ["admin", "nucleo", "regional"];

export default function DashboardPage({ onNavigate, perfilAtivo }) {
  const { user, logout } = useAuth();
  const isTeacher = perfilAtivo === "professor";

  const [activeTab, setActiveTab] = useState(isTeacher ? "inicio" : "dashboard");
  const [profileOpen, setProfileOpen] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [directOpen, setDirectOpen] = useState(false);
  const [directTarget, setDirectTarget] = useState(null);
  const [atalhosInicio, setAtalhosInicio] = useState([]);
  const [atalhosPessoa, setAtalhosPessoa] = useState([]);
  const abrirDirects = (contacto = null) => {
    setProfileOpen(false);
    setTeacherProfile(null);
    setDirectTarget(contacto);
    setDirectOpen(true);
  };
  const handleNavigate = (card) => {
    if (!card) return;

    onNavigate(
      "calendar",
      card.key,
      card.ano || "2026",
      card.unidade,
      card.turma
    );
  };

  useEffect(() => {
    setActiveTab(isTeacher ? "inicio" : "dashboard");
  }, [perfilAtivo, isTeacher]);

  useEffect(() => {
    setAtalhosInicio(user?.atalhosInicio || []);
    setAtalhosPessoa(user?.atalhosPessoa || []);
  }, [user?.uid]);

  const adicionarAtalhoPessoa = async (profile) => {
    if (!user?.uid || !profile?.id || profile.id === user.uid) return;
    const atalho = {
      id: profile.id,
      nome: profile.nome || "Professor",
      email: profile.email || "",
      unidade: profile.unidade || "",
      turmas: profile.turmas || "",
      disciplinas: profile.disciplinas || [],
      unidadesInativas: profile.unidadesInativas || [],
      turmasInativas: profile.turmasInativas || [],
      criadoEm: profile.criadoEm || null,
    };
    try {
      await updateDoc(doc(db, "users", user.uid), { atalhosPessoa: arrayUnion(atalho) });
      setAtalhosPessoa((atuais) => atuais.some((item) => item.id === atalho.id) ? atuais : [...atuais, atalho]);
    } catch (error) {
      console.error("Erro ao adicionar atalho de pessoa:", error);
    }
  };

  const isAdmin = perfilAtivo === "admin";
  const isNucleo = perfilAtivo === "nucleo";
  const isRegional = perfilAtivo === "regional";
  const isDirection = DIRECTION_ROLES.includes(perfilAtivo);
  const isManager = ADMIN_MANAGER_ROLES.includes(perfilAtivo) || isDirection;
  const podeConfigurar = isAdmin || isNucleo;

  let unidadesEscopo = null;
  let unidadeFoco = null;

  if (isRegional) {
    unidadesEscopo = user?.unidadesComando || [];
  } else if (isDirection) {
    unidadesEscopo = (user?.unidade || "")
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);
    unidadeFoco = unidadesEscopo[0] || null;
  } else if (isTeacher) {
    unidadeFoco = user?.unidade?.split(",")[0]?.trim() || null;
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans text-gray-800 relative pb-28">
      <main className="relative z-10 flex-1 w-full max-w-[1100px] mx-auto px-4 pt-4">
        {isManager && activeTab === "dashboard" && (
          <AdminOverview
            unidadeFoco={unidadeFoco}
            unidadesEscopo={unidadesEscopo}
            currentUser={user}
            onProfileOpen={() => setProfileOpen(true)}
            onDirects={isAdmin ? undefined : () => abrirDirects()}
            atalhosInicio={atalhosInicio}
          />
        )}

        {isManager && activeTab === "usuarios" && (
          <AdminUsers
            unidadesEscopo={unidadesEscopo}
            perfilAtivo={perfilAtivo}
            currentUser={user}
            onProfileOpen={(profile) => profile?.id ? setTeacherProfile(profile) : setProfileOpen(true)}
            onDirects={isAdmin ? undefined : () => abrirDirects()}
          />
        )}

        {podeConfigurar && activeTab === "turmas" && (
          <TurmasAdmin
            perfilAtivo={perfilAtivo}
            unidadeFoco={unidadeFoco}
            unidadesEscopo={unidadesEscopo}
          />
        )}

        {isDirection && !podeConfigurar && activeTab === "calendario" && (
          <DirecaoCalendario perfilAtivo={perfilAtivo} />
        )}

        {isTeacher && activeTab === "inicio" && (
          <StartTab
            onNavigate={handleNavigate}
            onDirects={() => abrirDirects()}
            onOpenProfile={() => setProfileOpen(true)}
            onOpenTab={setActiveTab}
            atalhosInicio={atalhosInicio}
            atalhosPessoa={atalhosPessoa}
            onOpenPerson={(profile) => setTeacherProfile(profile)}
          />
        )}

        {activeTab === "feed" && (
          <FeedTab
            user={user}
            perfilAtivo={perfilAtivo}
            unidadeFoco={unidadeFoco}
            unidadesEscopo={unidadesEscopo}
            onProfileOpen={() => setProfileOpen(true)}
            onDirects={() => abrirDirects()}
          />
        )}
      </main>

      <DashboardNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onProfileOpen={() => setProfileOpen(true)}
        logout={logout}
        isAdmin={isAdmin}
        isNucleo={isNucleo}
        isDirecao={isRegional || isDirection}
        perfilAtivo={{ cargo: perfilAtivo }}
        unidadesEscopo={unidadesEscopo}
        onNavigate={handleNavigate}
        user={{ ...user, atalhosPessoa }}
        onShortcutsChange={setAtalhosInicio}
        onPersonShortcutsChange={setAtalhosPessoa}
      />

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
      {teacherProfile && (
        <TeacherProfileModal user={teacherProfile} onClose={() => setTeacherProfile(null)} onDirectMessage={!isAdmin && teacherProfile.id !== user?.uid ? abrirDirects : undefined} onAddShortcut={teacherProfile.id !== user?.uid ? adicionarAtalhoPessoa : undefined} />
      )}
      {directOpen && <DirectMessagesModal user={user} perfilAtivo={perfilAtivo} initialContact={directTarget} onClose={() => { setDirectOpen(false); setDirectTarget(null); }} />}
    </div>
  );
}
