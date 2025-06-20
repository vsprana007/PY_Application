"use client"

import { MobileLayout } from "@/components/mobile-layout"
import { CheckoutPage } from "@/components/checkout-page"
import { AuthProvider } from "@/hooks/use-auth"

export default function Checkout() {
  return (
    <AuthProvider>
      <MobileLayout>
        <CheckoutPage />
      </MobileLayout>
    </AuthProvider>
  )
}
