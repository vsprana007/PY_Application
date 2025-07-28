"use client"


import { CheckoutPage } from "@/components/checkout-page"
import { AuthProvider } from "@/hooks/use-auth"

export default function Checkout() {
  return (
    <AuthProvider>
     
        <CheckoutPage />
     
    </AuthProvider>
  )
}
