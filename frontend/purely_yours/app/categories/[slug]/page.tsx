"use client"

import { MobileLayout } from "@/components/mobile-layout"
import { CategoryDetailPage } from "@/components/category-detail-page"
import { AuthProvider } from "@/hooks/use-auth"

export default function CategoryDetail({ params }: { params: { slug: string } }) {
  return (
    <AuthProvider>
      <MobileLayout>
        <CategoryDetailPage categorySlug={params.slug} />
      </MobileLayout>
    </AuthProvider>
  )
}
