// src/app/(public)/layout.tsx
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import AdminBar from "@/components/ui/AdminBar";
import WhatsAppFAB from "@/components/ui/WhatsAppFAB";
import SplashScreen from "@/components/pwa/SplashScreen";
import AvisoConexion from "@/components/pwa/AvisoConexion";
import RegistrarSW from "@/components/pwa/RegistrarSW";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RegistrarSW />
      <SplashScreen />
      <AdminBar />
      <Header />
      <main className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
        {children}
      </main>
      <Footer />
      <WhatsAppFAB />
      <AvisoConexion />
    </>
  );
}
