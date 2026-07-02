# Estructura del Proyecto

## 📱 Frontend (`src/app/(frontend)/`)

Todas las páginas y componentes de UI del usuario final.

```
src/app/(frontend)/
├── layout.tsx           - Layout principal
├── page.tsx             - Página de inicio
├── carrito/
├── catalogo/
├── checkout/
├── curso/
├── productos/
├── servicios/
└── ...
```

## 🔧 Backend (`src/app/api/`)

API Routes de Next.js para lógica del servidor.

```
src/app/api/
├── auth/                - Autenticación
├── productos/           - Gestión de productos
├── cursos/              - Gestión de cursos
├── servicios/           - Gestión de servicios
└── ...
```

## 📦 Lógica del Servidor (`src/server/`)

Código reutilizable para los endpoints API.

```
src/server/
├── controllers/         - Controladores de rutas
├── services/            - Servicios de negocio
├── middleware/          - Middlewares personalizados
└── utils/               - Funciones utilitarias
```

## 🎨 Componentes (`src/components/`)

Componentes React reutilizables en el frontend.

## ✨ Tipos Compartidos (`src/types/`)

Tipos TypeScript compartidos entre frontend y backend.

## 📚 Librerías (`src/lib/`)

Funciones utilitarias y validaciones del frontend.
