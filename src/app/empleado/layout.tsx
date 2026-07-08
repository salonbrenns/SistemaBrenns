// src/app/empleado/layout.tsx
// El middleware ya protege /empleado/* — solo necesitamos el layout visual
import AdminLayoutClient from '@/components/dashboard/adminLayoutClient';

export default function EmpleadoLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
