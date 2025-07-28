"use client"


import { WishlistPage } from "@/components/wishlist-page"
import { AuthProvider } from "@/hooks/use-auth"

export default function Wishlist() {
  return (
    <AuthProvider>
 
        <WishlistPage />
      
    </AuthProvider>
  )
}
