"use client"

import { MobileLayout } from "@/components/mobile-layout"
import { SearchPage } from "@/components/search-page"
import { AuthProvider } from "@/hooks/use-auth"

export default function Search() {
  return (
    <AuthProvider>
      <MobileLayout>
        <SearchPage />
      </MobileLayout>
    </AuthProvider>
  )
}
