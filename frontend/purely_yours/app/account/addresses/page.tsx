"use client"

import { MobileLayout } from "@/components/mobile-layout"
import { AddressesPage } from "@/components/addresses-page"
import { AuthProvider } from "@/hooks/use-auth"

export default function Orders() {
  return (
    <AuthProvider>
      
        <AddressesPage />
    
    </AuthProvider>
  )
}
