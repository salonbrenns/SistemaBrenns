"use client"
// Pantalla de carga que aparece al abrir la app (una vez por sesión)

import { useEffect, useState } from "react"
import Image from "next/image"

export default function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [saliendo, setSaliendo] = useState(false)

  useEffect(() => {
    let yaSeMostro = false
    try {
      yaSeMostro = sessionStorage.getItem("splash-visto") === "1"
    } catch {}

    // Si ya se vio en esta sesión se quita de inmediato, si no dura 1.4 s
    const espera = yaSeMostro ? 0 : 1400

    const t1 = setTimeout(() => setSaliendo(true), espera)
    const t2 = setTimeout(() => {
      setVisible(false)
      try { sessionStorage.setItem("splash-visto", "1") } catch {}
    }, espera + 500)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-950 transition-opacity duration-500 ${
        saliendo ? "opacity-0" : "opacity-100"
      }`}
    >
      <Image
        src="/icons/icon-512.png"
        alt=""
        width={120}
        height={120}
        priority
        className="rounded-full animate-pulse"
      />
      <p className="mt-6 text-lg font-black tracking-widest text-white">BRENN&apos;S BEAUTY</p>
      <p className="mt-1 text-xs uppercase tracking-[0.3em] text-pink-300">Academia · Distribuidora · Salón</p>
      <div className="mt-8 h-1 w-40 overflow-hidden rounded-full bg-pink-950">
        <div className="h-full w-1/2 animate-[cargando_1.2s_ease-in-out_infinite] rounded-full bg-pink-500" />
      </div>
      <style>{`@keyframes cargando { 0% { transform: translateX(-100%) } 100% { transform: translateX(200%) } }`}</style>
    </div>
  )
}
