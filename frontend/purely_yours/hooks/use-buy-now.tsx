"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export interface BuyNowItem {
  product: {
    id: number
    name: string
    price: number
    [key: string]: any
  }
  variant?: {
    id: number
    name: string
    price: number
    [key: string]: any
  } | null
  quantity: number
}

interface UseBuyNowReturn {
  isLoading: boolean
  buyNow: (product: any, variant: any, quantity: number) => Promise<void>
  getBuyNowItem: () => BuyNowItem | null
  clearBuyNowItem: () => void
  calculateTotal: (item: BuyNowItem) => number
}

export function useBuyNow(): UseBuyNowReturn {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  const buyNow = useCallback(async (product: any, variant: any, quantity: number) => {
    if (!isAuthenticated) {
      localStorage.setItem("redirectAfterAuth", window.location.pathname)
      router.push("/auth/login")
      return
    }

    if (!product?.id) {
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive",
      })
      return
    }

    if (quantity <= 0) {
      toast({
        title: "Error",
        description: "Please select a valid quantity",
        variant: "destructive",
      })
      return
    }

    // Check stock availability if variant is selected
    if (variant && variant.stock_quantity !== undefined && variant.stock_quantity < quantity) {
      toast({
        title: "Error",
        description: `Only ${variant.stock_quantity} items available in stock`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      const buyNowItem: BuyNowItem = {
        product: {
          id: product.id,
          name: product.name,
          price: variant?.price || product.price,
          ...product
        },
        variant: variant ? {
          id: variant.id,
          name: variant.name,
          price: variant.price,
          ...variant
        } : null,
        quantity: quantity
      }
      
      // Store in localStorage
      localStorage.setItem('buyNowItem', JSON.stringify(buyNowItem))
      
      // Show success message
      toast({
        title: "Success",
        description: "Proceeding to checkout...",
      })
      
      // Navigate to checkout
      router.push('/checkout')
      
    } catch (error) {
      console.error("Buy now error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, router, toast])

  const getBuyNowItem = useCallback((): BuyNowItem | null => {
    try {
      const buyNowData = localStorage.getItem('buyNowItem')
      if (buyNowData) {
        return JSON.parse(buyNowData)
      }
    } catch (error) {
      console.error('Failed to parse buy now item:', error)
      localStorage.removeItem('buyNowItem')
    }
    return null
  }, [])

  const clearBuyNowItem = useCallback(() => {
    localStorage.removeItem('buyNowItem')
  }, [])

  const calculateTotal = useCallback((item: BuyNowItem): number => {
    const price = item.variant?.price || item.product.price
    return price * item.quantity
  }, [])

  return {
    isLoading,
    buyNow,
    getBuyNowItem,
    clearBuyNowItem,
    calculateTotal
  }
}
