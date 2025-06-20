"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { apiClient } from "@/lib/api"
import { useAuth } from "./use-auth"
import { useToast } from "./use-toast"
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants"

interface WishlistItem {
  id: number
  product: {
    id: number
    name: string
    slug: string
    price: number
    original_price: number
    primary_image?: string
    stock_quantity: number
    average_rating?: number
    review_count?: number
  }
  added_at: string
}

interface Wishlist {
  id: number
  items: WishlistItem[]
  total_items: number
}

interface WishlistContextType {
  wishlist: WishlistItem[]
  isLoading: boolean
  addToWishlist: (productId: number) => Promise<any>
  removeFromWishlist: (itemId: number) => Promise<any>
  toggleWishlist: (productId: number) => Promise<any>
  refreshWishlist: () => Promise<void>
  isInWishlist: (productId: number) => boolean
  getWishlistItem: (productId: number) => WishlistItem | null
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated) {
      refreshWishlist()
    } else {
      setWishlist(null)
    }
  }, [isAuthenticated])

  const refreshWishlist = async () => {
    if (!isAuthenticated) return

    try {
      setIsLoading(true)
      const response = await apiClient.getWishlist()
      setWishlist(response)
    } catch (error: any) {
      console.error("Failed to fetch wishlist:", error)
      if (error.message !== "Authentication required") {
        toast({
          title: "Error",
          description: ERROR_MESSAGES.NETWORK_ERROR,
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const addToWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Error",
        description: ERROR_MESSAGES.UNAUTHORIZED,
        variant: "destructive",
      })
      return { success: false, message: ERROR_MESSAGES.UNAUTHORIZED }
    }

    try {
      setIsLoading(true)
      const response = await apiClient.addToWishlist(productId)

      if (response.success) {
        setWishlist(response.wishlist)
        toast({
          title: "Success",
          description: SUCCESS_MESSAGES.PRODUCT_ADDED_TO_WISHLIST,
        })
      } else {
        toast({
          title: "Error",
          description: response.message || ERROR_MESSAGES.VALIDATION_ERROR,
          variant: "destructive",
        })
      }

      return response
    } catch (error: any) {
      const errorMessage = error.message || ERROR_MESSAGES.NETWORK_ERROR
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = async (itemId: number) => {
    try {
      setIsLoading(true)
      const response = await apiClient.removeFromWishlist(itemId)

      if (response.success) {
        setWishlist(response.wishlist)
        toast({
          title: "Success",
          description: SUCCESS_MESSAGES.PRODUCT_REMOVED_FROM_WISHLIST,
        })
      } else {
        toast({
          title: "Error",
          description: response.message || ERROR_MESSAGES.VALIDATION_ERROR,
          variant: "destructive",
        })
      }

      return response
    } catch (error: any) {
      const errorMessage = error.message || ERROR_MESSAGES.NETWORK_ERROR
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const toggleWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Error",
        description: ERROR_MESSAGES.UNAUTHORIZED,
        variant: "destructive",
      })
      return { success: false, message: ERROR_MESSAGES.UNAUTHORIZED }
    }

    try {
      setIsLoading(true)
      const response = await apiClient.toggleWishlist(productId)

      if (response.success) {
        setWishlist(response.wishlist)
        const message = response.added
          ? SUCCESS_MESSAGES.PRODUCT_ADDED_TO_WISHLIST
          : SUCCESS_MESSAGES.PRODUCT_REMOVED_FROM_WISHLIST

        toast({
          title: "Success",
          description: message,
        })
      } else {
        toast({
          title: "Error",
          description: response.message || ERROR_MESSAGES.VALIDATION_ERROR,
          variant: "destructive",
        })
      }

      return response
    } catch (error: any) {
      const errorMessage = error.message || ERROR_MESSAGES.NETWORK_ERROR
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const isInWishlist = (productId: number) => {
    if (!wishlist) return false
    return wishlist.items.some((item) => item.product.id === productId)
  }

  const getWishlistItem = (productId: number) => {
    if (!wishlist) return null
    return wishlist.items.find((item) => item.product.id === productId) || null
  }

  const clearWishlist = () => {
    setWishlist(null)
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist: wishlist?.items ?? [],
        isLoading,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        refreshWishlist,
        isInWishlist,
        getWishlistItem,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
