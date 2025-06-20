"use client"

import { MobileLayout } from "@/components/mobile-layout"
import { CategoriesPage } from "@/components/categories-page"
import { AuthProvider } from "@/hooks/use-auth"

export default function Categories() {
  return (
    <AuthProvider>
      <MobileLayout>
        <CategoriesPage />
      </MobileLayout>
    </AuthProvider>
  )
}
