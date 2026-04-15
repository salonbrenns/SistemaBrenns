"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FAQFormProps {
  initialData?: {
    id?: number;
    pregunta: string;
    respuesta: string;
    orden: number;
    activo: boolean;
  };
}

export default function FAQForm({ initialData }: FAQFormProps) {
  const isEditing = !!initialData?.id;
  const router = useRouter();

  const [form, setForm] = useState({
    pregunta: initialData?.pregunta ?? "",
    respuesta: initialData?.respuesta ?? "",
    orden: initialData?.orden ?? 0,
    activo: initialData?.activo ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isEditing ? `/api/admin/faq/${initialData.id}` : "/api/admin/faq";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, orden: Number(form.orden) }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al guardar");
      }

      router.push("/admin/faq");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 mb-3 flex items-center gap-1"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? "Editar pregunta" : "Nueva pregunta"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pregunta <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="pregunta"
            value={form.pregunta}
            onChange={handleChange}
            placeholder="¿Cuánto tiempo dura el envío?"
            required
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Respuesta <span className="text-red-500">*</span>
          </label>
          <textarea
            name="respuesta"
            value={form.respuesta}
            onChange={handleChange}
            placeholder="El envío tarda entre 3 y 5 días hábiles..."
            required
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition resize-none"
          />
        </div>

        <div className="flex gap-4 items-end">
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
            <input
              type="number"
              name="orden"
              value={form.orden}
              onChange={handleChange}
              min={0}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
            />
          </div>
          <div className="flex items-center gap-2 pb-2.5">
            <input
              type="checkbox"
              name="activo"
              id="activo"
              checked={form.activo}
              onChange={handleChange}
              className="w-4 h-4 accent-pink-600"
            />
            <label htmlFor="activo" className="text-sm font-medium text-gray-700">
              Activo (visible en el sitio)
            </label>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear pregunta"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-gray-200 hover:bg-gray-50 text-gray-600 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}