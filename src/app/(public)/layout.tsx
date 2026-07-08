// src/app/(public)/layout.tsx
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import AdminBar from "@/components/ui/AdminBar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminBar />
      <Header />
      <main className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
        {children}
      </main>
      <Footer />
    </>
  );
}
