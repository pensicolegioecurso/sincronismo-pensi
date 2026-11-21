import Hero from "../components/home/Hero";
import QuickAccess from "../components/home/QuickAccess";
import HowItWorks from "../components/home/HowItWorks";
import AppDownload from "../components/home/AppDownload";
import FAQ from "../components/home/FAQ";
import Footer from "../components/home/Footer";
import ScrollToTop from "../components/ScrollToTop";

export default function Home({ onNavigate, onLogin, onRegister }) {
  return (
    <div className="min-h-screen bg-[#f2f2f2] text-[#111] font-sans selection:bg-pensi-yellow selection:text-black overflow-x-hidden">
      <Hero onLogin={onLogin} onRegister={onRegister} />
      <QuickAccess onNavigate={onNavigate} />
      <HowItWorks />
      <AppDownload />
      <FAQ />
      <Footer onLogin={onLogin} onRegister={onRegister} />
      <ScrollToTop />
    </div>
  );
}