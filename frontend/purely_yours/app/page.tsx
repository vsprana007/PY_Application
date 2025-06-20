"use client"

import { MobileLayout } from "@/components/mobile-layout"
import { HomePage } from "@/components/home-page"
import { AuthProvider } from "@/hooks/use-auth"

export default function Home() {
  return (
    <AuthProvider>
      <MobileLayout>
        <HomePage />
      </MobileLayout>
    </AuthProvider>
  )
}
