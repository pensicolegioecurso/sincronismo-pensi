import Hero from "../components/home/Hero";
import QuickAccess from "../components/home/QuickAccess";
import HowItWorks from "../components/home/HowItWorks";
import AppDownload from "../components/home/AppDownload";
import FAQ from "../components/home/FAQ";
import Footer from "../components/home/Footer";
import ScrollToTop from "../components/ScrollToTop";

export default function Home({ onNavigate, onLogin, onRegister }) {
  return (
    <div className="min-h-screen bg-pensi-bg flex flex-col font-sans text-pensi-dark relative selection:bg-pensi-yellow selection:text-black overflow-hidden">
      
      {/* Brilhos de fundo amarelos */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-pensi-yellow/20 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/3 z-0" />
      <div className="absolute top-[40%] left-0 w-[600px] h-[600px] bg-pensi-yellow/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 z-0" />
      <div className="absolute top-[70%] right-0 w-[700px] h-[700px] bg-pensi-yellow/15 rounded-full blur-[130px] pointer-events-none translate-x-1/3 z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Hero onLogin={onLogin} onRegister={onRegister} />
        <QuickAccess onNavigate={onNavigate} />
        <HowItWorks />
        <AppDownload />
        <FAQ />
        <Footer onLogin={onLogin} onRegister={onRegister} />
        <ScrollToTop />
      </div>
    </div>
  );
}