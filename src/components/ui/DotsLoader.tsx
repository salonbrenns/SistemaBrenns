export default function DotsLoader({ texto = "Cargando..." }: { texto?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20">
      <div className="flex items-end gap-2.5 h-12">
        <span className="w-3.5 h-3.5 rounded-full bg-pink-400   animate-[boing_1.1s_cubic-bezier(.36,.07,.19,.97)_infinite] [animation-delay:0ms]" />
        <span className="w-4.5 h-4.5 rounded-full bg-pink-600   animate-[boing_1.1s_cubic-bezier(.36,.07,.19,.97)_infinite] [animation-delay:220ms]" style={{ width: 18, height: 18 }} />
        <span className="w-3   h-3   rounded-full bg-rose-700   animate-[boing_1.1s_cubic-bezier(.36,.07,.19,.97)_infinite] [animation-delay:440ms]" style={{ width: 12, height: 12 }} />
        <span className="w-4   h-4   rounded-full bg-pink-600   animate-[boing_1.1s_cubic-bezier(.36,.07,.19,.97)_infinite] [animation-delay:110ms]" style={{ width: 16, height: 16 }} />
        <span className="w-3.5 h-3.5 rounded-full bg-pink-400   animate-[boing_1.1s_cubic-bezier(.36,.07,.19,.97)_infinite] [animation-delay:330ms]" />
      </div>
      {texto && <p className="text-sm text-pink-500 font-medium">{texto}</p>}
    </div>
  )
}
