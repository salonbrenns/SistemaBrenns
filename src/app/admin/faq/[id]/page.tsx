import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import FAQForm from "@/components/FAQForm";

interface Props {
  params: Promise<{ id: string }>;   // ← Cambiado a Promise
}

export default async function EditarFAQPage({ params }: Props) {
  const { id } = await params;        // ← Ahora hay que hacer await
  const faqId = parseInt(id);

  const faq = await prisma.preguntaFrecuente.findUnique({
    where: { id: faqId }
  });

  if (!faq) return notFound();

  return (
    <FAQForm
      initialData={{
        id: faq.id,
        pregunta: faq.pregunta,
        respuesta: faq.respuesta,
        orden: faq.orden,
        activo: faq.activo,
      }}
    />
  );
}