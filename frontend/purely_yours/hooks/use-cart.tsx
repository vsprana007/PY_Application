"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { apiClient } from "@/lib/api"
import { useAuth } from "./use-auth"
import { useToast } from "./use-toast"
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants"
import { safeGet, safeNumber, safeArray, getErrorMessage } from "@/lib/utils"

interface CartItem {
  id: number
  product: {
    id: number
    name: string
    slug: string
    price: number
    original_price: number
    primary_image?: string
    stock_quantity: number
  }
  variant?: {
    id: number
    name: string
    price: number
  }
  quantity: number
  total_price: number
}

interface Cart {
  id: number
  items: CartItem[]
  total_items: number
  total_amount: number
  discount_amount: number
  final_amount: number
}

interface CartContextType {
  cart: Cart | null
  isLoading: boolean
  addToCart: (productId: number, variantId?: number, quantity?: number) => Promise<any>
  updateCartItem: (itemId: number, quantity: number) => Promise<any>
  removeFromCart: (itemId: number) => Promise<any>
  clearCart: () => Promise<any>
  refreshCart: () => Promise<void>
  getCartItemCount: () => number
  isInCart: (productId: number, variantId?: number) => boolean
  getCartItem: (productId: number, variantId?: number) => CartItem | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart()
    } else {
      setCart(null)
    }
  }, [isAuthenticated])

  const refreshCart = async () => {
    if (!isAuthenticated) return

    try {
      setIsLoading(true)
      const response = await apiClient.getCart()

      if (response) {
        const cartData: Cart = {
          id: safeNumber(safeGet(response, "id"), 0),
          items: safeArray(safeGet(response, "items"), []).map((item: any) => ({
            id: safeNumber(safeGet(item, "id"), 0),
            product: {
              id: safeNumber(safeGet(item, "product.id"), 0),
              name: safeGet(item, "product.name", "") ?? "",
              slug: safeGet(item, "product.slug", "") ?? "",
              price: safeNumber(safeGet(item, "product.price"), 0),
              original_price: safeNumber(safeGet(item, "product.original_price"), 0),
              primary_image: safeGet(item, "product.primary_image"),
              stock_quantity: safeNumber(safeGet(item, "product.stock_quantity"), 0),
            },
            variant: safeGet(item, "variant")
              ? {
                  id: safeNumber(safeGet(item, "variant.id"), 0),
                  name: safeGet(item, "variant.name", "") ?? "",
                  price: safeNumber(safeGet(item, "variant.price"), 0),
                }
              : undefined,
            quantity: safeNumber(safeGet(item, "quantity"), 1),
            total_price: safeNumber(safeGet(item, "total_price"), 0),
          })),
          total_items: safeNumber(safeGet(response, "total_items"), 0),
          total_amount: safeNumber(safeGet(response, "total_amount"), 0),
          discount_amount: safeNumber(safeGet(response, "discount_amount"), 0),
          final_amount: safeNumber(safeGet(response, "final_amount"), 0),
        }
        setCart(cartData)
      }
    } catch (error: any) {
      console.error("Failed to fetch cart:", error)
      if (getErrorMessage(error) !== "Authentication required") {
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

  const addToCart = async (productId: number, variantId?: number, quantity = 1) => {
    if (!isAuthenticated) {
      toast({
        title: "Error",
        description: ERROR_MESSAGES.UNAUTHORIZED,
        variant: "destructive",
      })
      return { success: false, message: ERROR_MESSAGES.UNAUTHORIZED }
    }

    if (!productId || productId <= 0 || quantity <= 0) {
      const errorMsg = "Invalid product or quantity"
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
      return { success: false, message: errorMsg }
    }

    try {
      setIsLoading(true)
      const response = await apiClient.addToCart({
        product_id: productId,
        variant_id: variantId,
        quantity,
      })

      if (safeGet(response, "success")) {
        const cartData = safeGet(response, "cart")
        if (cartData) {
          setCart({
            id: safeNumber(safeGet(cartData, "id"), 0),
            items: safeArray(safeGet(cartData, "items"), []),
            total_items: safeNumber(safeGet(cartData, "total_items"), 0),
            total_amount: safeNumber(safeGet(cartData, "total_amount"), 0),
            discount_amount: safeNumber(safeGet(cartData, "discount_amount"), 0),
            final_amount: safeNumber(safeGet(cartData, "final_amount"), 0),
          })
        }
        toast({
          title: "Success",
          description: SUCCESS_MESSAGES.PRODUCT_ADDED_TO_CART,
        })
      } else {
        const errorMsg = safeGet(response, "message") || ERROR_MESSAGES.VALIDATION_ERROR
        toast({
          title: "Error",
          description: String(errorMsg),
          variant: "destructive",
        })
      }

      return response
    } catch (error: any) {
      const errorMessage = getErrorMessage(error) || ERROR_MESSAGES.NETWORK_ERROR
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const updateCartItem = async (itemId: number, quantity: number) => {
    if (!itemId || itemId <= 0 || quantity < 0) {
      const errorMsg = "Invalid item or quantity"
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
      return { success: false, message: errorMsg }
    }

    try {
      setIsLoading(true)
      const response = await apiClient.updateCartItem(itemId, quantity)

      if (safeGet(response, "success")) {
        const cartData = safeGet(response, "cart")
        if (cartData) {
          setCart({
            id: safeNumber(safeGet(cartData, "id"), 0),
            items: safeArray(safeGet(cartData, "items"), []),
            total_items: safeNumber(safeGet(cartData, "total_items"), 0),
            total_amount: safeNumber(safeGet(cartData, "total_amount"), 0),
            discount_amount: safeNumber(safeGet(cartData, "discount_amount"), 0),
            final_amount: safeNumber(safeGet(cartData, "final_amount"), 0),
          })
        }
        toast({
          title: "Success",
          description: "Cart updated successfully.",
        })
      } else {
        const errorMsg = safeGet(response, "message") || ERROR_MESSAGES.VALIDATION_ERROR
        toast({
          title: "Error",
          description: String(errorMsg),
          variant: "destructive",
        })
      }

      return response
    } catch (error: any) {
      const errorMessage = getErrorMessage(error) || ERROR_MESSAGES.NETWORK_ERROR
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromCart = async (itemId: number) => {
    if (!itemId || itemId <= 0) {
      const errorMsg = "Invalid item ID"
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
      return { success: false, message: errorMsg }
    }

    try {
      setIsLoading(true)
      const response = await apiClient.removeFromCart(itemId)

      if (safeGet(response, "success")) {
        const cartData = safeGet(response, "cart")
        if (cartData) {
          setCart({
            id: safeNumber(safeGet(cartData, "id"), 0),
            items: safeArray(safeGet(cartData, "items"), []),
            total_items: safeNumber(safeGet(cartData, "total_items"), 0),
            total_amount: safeNumber(safeGet(cartData, "total_amount"), 0),
            discount_amount: safeNumber(safeGet(cartData, "discount_amount"), 0),
            final_amount: safeNumber(safeGet(cartData, "final_amount"), 0),
          })
        }
        toast({
          title: "Success",
          description: SUCCESS_MESSAGES.PRODUCT_REMOVED_FROM_CART,
        })
      } else {
        const errorMsg = safeGet(response, "message") || ERROR_MESSAGES.VALIDATION_ERROR
        toast({
          title: "Error",
          description: String(errorMsg),
          variant: "destructive",
        })
      }

      return response
    } catch (error: any) {
      const errorMessage = getErrorMessage(error) || ERROR_MESSAGES.NETWORK_ERROR
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const clearCart = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.clearCart()

      if (safeGet(response, "success")) {
        setCart({
          id: 0,
          items: [],
          total_items: 0,
          total_amount: 0,
          discount_amount: 0,
          final_amount: 0,
        })
        toast({
          title: "Success",
          description: "Cart cleared successfully.",
        })
      } else {
        const errorMsg = safeGet(response, "message") || ERROR_MESSAGES.VALIDATION_ERROR
        toast({
          title: "Error",
          description: String(errorMsg),
          variant: "destructive",
        })
      }

      return response
    } catch (error: any) {
      const errorMessage = getErrorMessage(error) || ERROR_MESSAGES.NETWORK_ERROR
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const getCartItemCount = () => {
    return cart?.total_items || 0
  }

  const isInCart = (productId: number, variantId?: number) => {
    if (!cart || !productId) return false
    return cart.items.some(
      (item) => item.product.id === productId && (variantId ? item.variant?.id === variantId : !item.variant),
    )
  }

  const getCartItem = (productId: number, variantId?: number) => {
    if (!cart || !productId) return null
    return (
      cart.items.find(
        (item) => item.product.id === productId && (variantId ? item.variant?.id === variantId : !item.variant),
      ) || null
    )
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart,
        getCartItemCount,
        isInCart,
        getCartItem,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
