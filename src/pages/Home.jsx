
import Hero from "../components/home/Hero";
import QuickAccess from "../components/home/QuickAccess";
import FAQ from "../components/home/FAQ";
import HowItWorks from "../components/home/HowItWorks";
import AppDownload from "../components/home/AppDownload";
import Footer from "../components/Footer";
import Divider from "../utils/Divider";
import Reveal from "../utils/Reveal";
import ScrollToTop from "../components/ScrollToTop";

export default function Home({
  onNavigate,
  onLogin,
  onRegister,
}) {
  return (
    <div
      className="
        min-h-screen
        bg-[#f8f9fa]
        flex flex-col
        font-sans
        text-gray-800
        relative
      "
    >
      {/* Blobs de fundo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[15%] left-[10%] w-[400px] h-[400px] bg-pensi-yellow/15 rounded-full blur-[100px]" />

        <div className="absolute top-[45%] right-[5%] w-[500px] h-[500px] bg-blue-300/15 rounded-full blur-[120px]" />

        <div className="absolute bottom-[10%] left-[15%] w-[400px] h-[400px] bg-pink-200/15 rounded-full blur-[100px]" />
      </div>

      {/* Hero */}
      <Hero
        onLogin={onLogin}
        onRegister={onRegister}
      />

      {/* Acesso Rápido: seção independente */}
      <QuickAccess onNavigate={onNavigate} />

      <Divider />

      <HowItWorks />

      <FAQ />

      {/* Aplicativo */}
      <div className="w-full max-w-[1100px] mx-auto px-6 mb-24 relative z-10">
        <Reveal delay={100}>
          <AppDownload />
        </Reveal>
      </div>

      <Footer
        onLogin={onLogin}
        onRegister={onRegister}
      />
        <ScrollToTop />
    </div>
  );
}
