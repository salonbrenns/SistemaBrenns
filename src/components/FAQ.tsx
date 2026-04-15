import FAQ from "@/components/FAQ";

export const metadata = {
  title: "Preguntas Frecuentes",
  description: "Resolvemos tus dudas más comunes.",
};

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <FAQ />
    </main>
  );
}