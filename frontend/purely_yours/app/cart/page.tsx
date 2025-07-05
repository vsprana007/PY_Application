"use client"

import { MobileLayout } from "@/components/mobile-layout"
import { CartPage } from "@/components/cart-page"
import { AuthProvider } from "@/hooks/use-auth"

export default function Cart() {
  return (
    <AuthProvider>
    
        <CartPage />
   
    </AuthProvider>
  )
}
