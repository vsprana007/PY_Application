"use client"

import { MobileLayout } from "@/components/mobile-layout"
import { WishlistPage } from "@/components/wishlist-page"
import { AuthProvider } from "@/hooks/use-auth"

export default function Wishlist() {
  return (
    <AuthProvider>
      <MobileLayout>
        <WishlistPage />
      </MobileLayout>
    </AuthProvider>
  )
}
