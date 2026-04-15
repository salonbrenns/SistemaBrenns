"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FAQ {
  id: number;
  pregunta: string;
  respuesta: string;
  orden: number;
  activo: boolean;
}

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const router = useRouter();

  const cargarFaqs = async () => {
    try {
      const res = await fetch("/api/admin/faq");
      const data = await res.json();
      setFaqs(data);
    } catch (error) {
      console.error("Error al cargar FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFaqs();
  }, []);

  const eliminar = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta pregunta?")) return;
    setEliminando(id);
    try {
      await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setEliminando(null);
    }
  };

  const toggleActivo = async (faq: FAQ) => {
    try {
      await fetch(`/api/admin/faq/${faq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...faq, activo: !faq.activo }),
      });
      setFaqs((prev) =>
        prev.map((f) => (f.id === faq.id ? { ...f, activo: !f.activo } : f))
      );
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Preguntas Frecuentes</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona las preguntas que verán tus clientes</p>
        </div>
        <Link
          href="/admin/faq/nueva"
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          + Nueva pregunta
        </Link>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
        </div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-lg">No hay preguntas registradas</p>
          <Link
            href="/admin/faq/nueva"
            className="mt-4 inline-block text-pink-600 hover:underline text-sm"
          >
            Agregar la primera pregunta
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Orden</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Pregunta</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Estado</th>
                <th className="text-right px-5 py-3 text-gray-500 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {faqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-gray-400 font-mono">{faq.orden}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800 line-clamp-1">{faq.pregunta}</p>
                    <p className="text-gray-400 text-xs line-clamp-1 mt-0.5">{faq.respuesta}</p>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleActivo(faq)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        faq.activo
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {faq.activo ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => router.push(`/admin/faq/${faq.id}`)}
                        className="text-blue-500 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors text-xs"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminar(faq.id)}
                        disabled={eliminando === faq.id}
                        className="text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors text-xs disabled:opacity-50"
                      >
                        {eliminando === faq.id ? "..." : "Eliminar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}