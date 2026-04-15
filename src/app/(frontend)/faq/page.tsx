"use client";

import { useEffect, useState } from "react";

interface FAQ {
  id: number;
  pregunta: string;
  respuesta: string;
}

export default function FAQComponent() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [abierto, setAbierto] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/faq")
      .then((r) => r.json())
      .then(setFaqs)
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: number) => setAbierto((prev) => (prev === id ? null : id));

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    );
  }

  if (faqs.length === 0) return null;

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
        Preguntas frecuentes
      </h2>
      <p className="text-center text-gray-500 mb-10 text-sm">
        ¿Tienes dudas? Aquí encontrarás las respuestas más comunes.
      </p>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
          >
            <button
              onClick={() => toggle(faq.id)}
              className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-800 text-sm">{faq.pregunta}</span>
              <span
                className={`text-pink-500 text-xl transition-transform duration-200 ${
                  abierto === faq.id ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            {abierto === faq.id && (
              <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                <p className="pt-3">{faq.respuesta}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}