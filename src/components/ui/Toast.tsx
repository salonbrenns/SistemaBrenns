"use client"
import { useEffect } from "react"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

type ToastType = "success" | "error" | "warning"

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-yellow-600"

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 ${bgColor} text-white px-5 py-4 rounded-2xl shadow-xl animate-slide-up`}>
      {type === "success" && <CheckCircle className="w-6 h-6" />}
      {type === "error" && <XCircle className="w-6 h-6" />}
      {type === "warning" && <AlertCircle className="w-6 h-6" />}
      <p className="font-medium pr-4">{message}</p>
      <button onClick={onClose} className="ml-auto text-white/80 hover:text-white">✕</button>
    </div>
  )
}