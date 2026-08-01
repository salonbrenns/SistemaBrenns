'use client'

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/ui/ThemeProvider"
import { SiteConfigProvider } from "@/hooks/useSiteConfig"
import IdleGuard from "@/components/ui/IdleGuard"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <SiteConfigProvider>
          <IdleGuard />
          {children}
        </SiteConfigProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
