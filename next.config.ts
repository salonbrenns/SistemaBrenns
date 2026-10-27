// next.config.ts
import type { NextConfig } from "next"
import withPWAInit from "next-pwa"

// Configuración de la PWA: las páginas que funcionan sin internet están en runtimeCaching
// (si agregas una, ponla en las dos listas paginasOffline)
const withPWA = withPWAInit({
  dest: "public",
  // El registro se hace en src/components/pwa/RegistrarSW.tsx (next-pwa no lo hace solo con app/)
  register: false,
  skipWaiting: true,
  // En desarrollo se apaga para que no se quede pegado el caché mientras programamos
  disable: process.env.NODE_ENV === "development",
  // Archivos internos de Next que no existen como URL y rompen el precache
  buildExcludes: [
    /app-build-manifest\.json$/,
    /middleware-manifest\.json$/,
    // Secciones que nunca se usan sin internet: no se descargan al instalar el SW
    /\/app\/(admin|empleado|\(cliente\)|api|certificado)\//,
  ],
  // De public/ solo se precargan iconos, manifest y offline.html;
  // las fotos se guardan cuando el usuario las ve (ver runtimeCaching)
  publicExcludes: [
    "!noprecache/**/*",
    "!{catalogo,cursos,equipoprueba,logo,marcas,servicios,uploads}/**/*",
    "!*.{png,jpg,jpeg,svg}",
    "!icons/icon-maskable-512.png",
  ],
  // Si una página no está en caché y no hay red, se muestra esta
  fallbacks: {
    document: "/offline.html",
  },
  runtimeCaching: [
    // 1) Navegación a las páginas públicas (HTML)
    {
      urlPattern: ({ url, request }) => {
        const paginasOffline = [
          "/", "/nosotros", "/politicas", "/aviso-privacidad",
          "/terminos", "/faq", "/catalogo", "/cursos", "/servicios",
        ]
        // también los detalles de producto, curso y servicio que ya se visitaron.
        // No se pide request.mode === "navigate" para que RegistrarSW pueda precargarlas con fetch
        return request.method === "GET" && request.headers.get("RSC") !== "1" && (paginasOffline.includes(url.pathname) || /^\/(producto|curso|servicio)\/\d+$/.test(url.pathname))
      },
      handler: "NetworkFirst",
      options: {
        cacheName: "paginas-publicas",
        networkTimeoutSeconds: 4,
        expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
    // 2) Peticiones RSC de esas mismas páginas (cuando navegas con <Link>)
    //    Van en otro caché para que no se mezclen con el HTML
    {
      urlPattern: ({ url, request }) => {
        const paginasOffline = [
          "/", "/nosotros", "/politicas", "/aviso-privacidad",
          "/terminos", "/faq", "/catalogo", "/cursos", "/servicios",
        ]
        return request.headers.get("RSC") === "1" && (paginasOffline.includes(url.pathname) || /^\/(producto|curso|servicio)\/\d+$/.test(url.pathname))
      },
      handler: "NetworkFirst",
      options: {
        cacheName: "paginas-rsc",
        networkTimeoutSeconds: 4,
        expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
    // 3) Datos públicos de solo lectura que usan esas páginas
    {
      urlPattern: ({ url, request }) => {
        const apisPublicas = [
          "/api/productos", "/api/faq", "/api/equipo",
          "/api/promociones", "/api/cursos", "/api/servicios",
          "/api/config-sitio", "/api/marcas", "/api/categorias",
        ]
        return request.method === "GET" && apisPublicas.includes(url.pathname)
      },
      handler: "NetworkFirst",
      options: {
        cacheName: "api-publica",
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
      },
    },
    // 4) Imágenes de Cloudinary (productos, cursos, equipo) con límite de cantidad
    {
      urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "imagenes-cloudinary",
        expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // 5) Imágenes optimizadas por next/image y las de /public
    {
      urlPattern: ({ url }) =>
        url.pathname.startsWith("/_next/image") ||
        /\.(png|jpg|jpeg|webp|svg|ico)$/i.test(url.pathname),
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "imagenes-locales",
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    // 6) JS, CSS y fuentes de Next
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-static",
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    // 7) El resto de páginas (admin, empleado, carrito, checkout, login...) siempre van a la red
    //    y no se guardan; si no hay internet se muestra offline.html
    {
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "NetworkOnly",
      options: {}, // next-pwa lo necesita aunque esté vacío
    },
    // Las demás peticiones (/api/auth, /api/carrito, etc.) no pasan por el caché
  ],
})

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false, // TypeScript sí debe fallar si hay errores reales
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
}

export default withPWA(nextConfig)
