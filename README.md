# Salón Brenn's — Sistema Integral Multiplataforma (PWA)

Aplicación web progresiva para **Salón Brenn's (Brenn's Beauty)**: salón de uñas, academia de belleza y distribuidora de productos profesionales. Permite agendar citas, inscribirse a cursos, comprar productos y administrar el negocio, y puede instalarse en el celular o la computadora y consultarse sin conexión.

**Aplicación publicada:** https://brenns-sistema.vercel.app

| | |
|---|---|
| Caso de estudio | Salón Brenn's, Huejutla de Reyes, Hidalgo |
| Materia | Aplicaciones Web Progresivas · UTHH · 10° B |
| Metodología | Scrumban, una rama por integrante y Pull Requests a `main` |
| Despliegue | Vercel (cada push a `main` publica en producción) |

---

## Requisitos de la PWA y dónde están en el código

| Requisito | Qué hace | Archivos |
|---|---|---|
| **Pantalla Home** | Manifiesto con nombre, iconos, `start_url`, `display: standalone` y accesos directos (Catálogo, Preguntas frecuentes). La app se instala y abre en su propia ventana | `public/manifest.json`, `public/icons/`, `src/app/layout.tsx` (enlace del manifiesto en el `<head>`) |
| **Pantalla Splash** | Splash propio con logotipo y barra de carga (una vez por sesión) y splash automático de Android con `background_color` e iconos del manifiesto | `src/components/pwa/SplashScreen.tsx`, `public/manifest.json` |
| **Vistas del lado del servidor (SSR / ISR)** | El Inicio se genera en el servidor en cada visita con datos de PostgreSQL; los detalles de producto, servicio y curso se generan al compilar y se revalidan cada hora | `src/app/(public)/page.tsx` (`revalidate = 0`), `src/app/(public)/producto/[id]/page.tsx` (`revalidate = 3600`) |
| **Vistas del lado del cliente (CSR)** | Preguntas frecuentes, Nosotros, Catálogo, Cursos y Servicios usan `"use client"` y piden sus datos a la API desde el navegador | `src/app/(public)/faq/page.tsx`, `src/app/(public)/catalogo/page.tsx`, `src/app/api/faq/route.ts` |
| **Datos locales** | `localStorage` (tema, foto de perfil, citas ya notificadas), `sessionStorage` (splash y precarga) y Cache Storage (service worker) | `src/components/ui/ThemeProvider.tsx`, `src/components/pwa/SplashScreen.tsx`, `src/components/pwa/RegistrarSW.tsx` |
| **Datos remotos** | PostgreSQL en Neon con Prisma (citas, carrito, favoritos, catálogo…) e imágenes en Cloudinary | `prisma/schema.prisma`, `src/app/api/`, `src/hooks/useCarrito.ts` |
| **Datos offline** | Service worker generado con next-pwa (Workbox): precache del shell, caché de páginas y APIs públicas, página de respaldo y sincronización automática al recuperar la conexión | `next.config.ts`, `src/components/pwa/RegistrarSW.tsx`, `src/components/pwa/AvisoConexion.tsx`, `public/offline.html` |
| **Notificaciones** | Notificaciones del sistema (Notifications API) mostradas por el service worker: recordatorio de citas en las próximas 24 h, notificación de prueba y aviso al sincronizar el contenido. Al tocarlas se abre la página correspondiente | `src/components/pwa/notificaciones.ts`, `src/components/pwa/ActivarNotificaciones.tsx` (en Mi perfil), `worker/index.js` |
| **Elementos físicos del dispositivo** | **GPS**: distancia al salón y ruta en Google Maps (página Nosotros). **Micrófono**: búsqueda de productos por voz (Catálogo) | `src/components/pwa/ComoLlegar.tsx`, `src/components/pwa/BusquedaPorVoz.tsx` |

Páginas disponibles sin conexión: `/`, `/nosotros`, `/politicas`, `/aviso-privacidad`, `/terminos`, `/faq`, `/catalogo`, `/cursos`, `/servicios` y los detalles de producto, servicio y curso ya visitados. Las secciones privadas (citas, carrito, pagos, perfil, administración) necesitan internet y, sin conexión, muestran `offline.html`.

---

## Tecnologías

| Capa | Herramientas |
|---|---|
| Frontend y API | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| PWA | next-pwa 5.6 (Workbox), Web App Manifest, Service Worker, Cache Storage, Notifications, Geolocation y Web Speech API |
| Datos | PostgreSQL (Neon), Prisma ORM, Cloudinary |
| Autenticación y correo | NextAuth v5 (credenciales y Google), Nodemailer con Gmail |
| Analítica | Microservicio FastAPI en Render (`ml-service/`) con recomendador de productos |
| Calidad | Jest + Testing Library, ESLint |
| Despliegue | Vercel (HTTPS, vistas previas por rama, cron jobs en `vercel.json`) |

---

## Ejecutar el proyecto

```bash
npm install                # también ejecuta prisma generate
cp .env.example .env       # y llenar las variables (base de datos, NextAuth, Cloudinary, Gmail…)
npm run dev                # desarrollo (el service worker está desactivado)
```

Para probar la PWA hay que usar la versión de producción, porque next-pwa solo genera el service worker al compilar:

```bash
npm run build
npm start                  # http://localhost:3000
```

Pruebas y análisis estático:

```bash
npm test                   # Jest
npm run lint               # ESLint
```

---

## Cómo probar la PWA en Chrome DevTools

1. **Application → Manifest**: nombre, iconos y accesos directos.
2. **Application → Service workers**: `sw.js` activo. En consola aparece `[PWA] Service worker registrado` y `[PWA] Páginas y datos guardados para usar sin conexión: 18/18`.
3. **Application → Cache storage**: `workbox-precache-v2`, `start-url`, `paginas-publicas`, `api-publica` e imágenes.
4. **Network → Offline** y abrir `/faq`, `/nosotros` o `/politicas`: cargan con estado 200 servidas por el service worker; `/carrito` muestra `offline.html`. Al volver a **No throttling** se sincroniza el contenido y aparece "Conexión restablecida".
5. **Application → Storage → Clear site data** borra el service worker y las cachés; al recargar con internet se vuelven a crear.
6. **Mi perfil → Notificaciones → Activar notificaciones**: llega una notificación de confirmación; con una cita en las próximas 24 h llega su recordatorio.
7. **Sensors**: simular una ubicación y usar "Usar mi ubicación" en Nosotros. En el Catálogo, el ícono de micrófono busca por voz.
8. **Instalar**: ícono de instalación en la barra de direcciones (en Android: menú → Instalar app).
