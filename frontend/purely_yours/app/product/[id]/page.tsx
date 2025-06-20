"use client"

import { MobileLayout } from "@/components/mobile-layout"
import { ProductPage } from "@/components/product-page"
import { AuthProvider } from "@/hooks/use-auth"
import React from "react"

export default function Product({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)

  return (
    <AuthProvider>
      <MobileLayout>
        <ProductPage productId={id} />
      </MobileLayout>
    </AuthProvider>
  )
}