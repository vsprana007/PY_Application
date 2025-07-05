"use client"

import { MobileLayout } from "@/components/mobile-layout"
import { OrdersPage } from "@/components/orders-page"
import { AuthProvider } from "@/hooks/use-auth"

export default function Orders() {
  return (
    <AuthProvider>
      
        <OrdersPage />
    
    </AuthProvider>
  )
}
