"use client"

import { MobileLayout } from "@/components/mobile-layout"
import { ConsultationPage } from "@/components/consultation-page"
import { AuthProvider } from "@/hooks/use-auth"

export default function Consultation() {
  return (
    <AuthProvider>
      <MobileLayout>
        <ConsultationPage />
      </MobileLayout>
    </AuthProvider>
  )
}
