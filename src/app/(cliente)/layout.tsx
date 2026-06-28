// src/app/(cliente)/layout.tsx
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import AuthGuard from "@/components/ui/AuthGuard";
import AdminBar from "@/components/ui/AdminBar";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AdminBar />
      <Header />
      <main className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
        {children}
      </main>
      <Footer />
    </AuthGuard>
  );
}
