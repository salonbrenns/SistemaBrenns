'use client'

import { useSiteConfig } from '@/hooks/useSiteConfig'

export default function WhatsAppFAB() {
  const config = useSiteConfig()
  const url = config.red_whatsapp || 'https://wa.me/527717482746'

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contáctanos por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
      style={{ backgroundColor: '#25D366' }}
    >
      {/* WhatsApp SVG official icon */}
      <svg viewBox="0 0 32 32" width="30" height="30" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.003 2.667C8.637 2.667 2.667 8.637 2.667 16c0 2.341.633 4.635 1.835 6.64L2.667 29.333l6.893-1.807A13.267 13.267 0 0 0 16.003 29.333C23.363 29.333 29.333 23.363 29.333 16S23.363 2.667 16.003 2.667zm0 24.267a11.01 11.01 0 0 1-5.614-1.539l-.403-.24-4.089 1.072 1.09-3.98-.263-.41A10.987 10.987 0 0 1 5.003 16C5.003 9.924 9.924 5.001 16.003 5.001 22.076 5 26.997 9.924 26.997 16c0 6.076-4.921 10.934-10.994 10.934zm6.012-8.197c-.33-.165-1.953-.963-2.257-1.073-.303-.11-.524-.165-.744.165-.22.33-.853 1.073-1.046 1.293-.192.22-.386.247-.716.082-.33-.165-1.393-.514-2.654-1.637-.98-.875-1.642-1.955-1.835-2.285-.192-.33-.02-.508.145-.672.148-.148.33-.385.495-.578.165-.192.22-.33.33-.55.11-.22.055-.413-.027-.578-.082-.165-.745-1.793-1.02-2.454-.268-.643-.54-.556-.744-.566l-.634-.011c-.22 0-.578.082-.882.413-.303.33-1.158 1.132-1.158 2.76s1.185 3.203 1.35 3.423c.165.22 2.333 3.562 5.653 4.994.79.341 1.407.545 1.888.698.793.252 1.515.216 2.086.131.636-.095 1.953-.799 2.228-1.57.275-.771.275-1.432.193-1.57-.083-.138-.303-.22-.634-.385z"/>
      </svg>

      {/* Pulse ring — 3 pulsos al cargar, luego se detiene */}
      <span
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          backgroundColor: '#25D366',
          animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) 3',
        }}
      />
    </a>
  )
}
