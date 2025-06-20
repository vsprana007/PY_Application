"use client"

import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { formatCurrency, showToast } from "@/lib/utils"

export function CartPage() {
  const router = useRouter()
  const { cart, updateCartItem, removeFromCart, isLoading, clearCart } = useCart()
  const { isAuthenticated } = useAuth()

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    try {
      if (newQuantity === 0) {
        await removeFromCart(itemId)
        showToast("Item removed from cart", "success")
      } else {
        await updateCartItem(itemId, newQuantity)
      }
    } catch (error) {
      console.error("Failed to update cart:", error)
      showToast("Failed to update cart", "error")
    }
  }

  const removeItem = async (itemId: number) => {
    try {
      await removeFromCart(itemId)
      showToast("Item removed from cart", "success")
    } catch (error) {
      console.error("Failed to remove item:", error)
      showToast("Failed to remove item", "error")
    }
  }

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        await clearCart()
        showToast("Cart cleared", "success")
      } catch (error) {
        console.error("Failed to clear cart:", error)
        showToast("Failed to clear cart", "error")
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex items-center">
          <Link href="/" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-semibold">Shopping Cart</h1>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <ShoppingBag size={64} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in to view your cart</h2>
          <p className="text-gray-600 text-center mb-6">Please sign in to access your shopping cart</p>
          <Link href="/auth/login">
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex items-center">
          <Link href="/" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-semibold">Shopping Cart</h1>
        </div>

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex items-center">
          <Link href="/" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-semibold">Shopping Cart</h1>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <ShoppingBag size={64} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 text-center mb-6">Add some products to get started</p>
          <Link href="/categories">
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const shipping = cart.total_amount > 500 ? 0 : 50
  const total = cart.total_amount + shipping

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-semibold">Cart ({cart.total_items})</h1>
        </div>
        {cart.items.length > 0 && (
          <button onClick={handleClearCart} className="text-red-600 text-sm hover:text-red-700">
            Clear All
          </button>
        )}
      </div>

      <div className="flex flex-col min-h-screen">
        <div className="flex-1 pb-32">
          {/* Cart Items */}
          <div className="space-y-2 p-4">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex gap-4">
                  <Link href={`/product/${item.product.slug}`} className="flex-shrink-0">
                    <img
                      src={item.product.primary_image || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-20 h-20 object-contain rounded-lg border"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.product.slug}`}>
                      <h3 className="font-medium mb-1 line-clamp-2">{item.product.name}</h3>
                    </Link>
                    {item.variant && <p className="text-sm text-gray-600 mb-1">Variant: {item.variant.name}</p>}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(item.variant?.price || item.product.price)}
                      </span>
                      {item.product.original_price > (item.variant?.price || item.product.price) && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(item.product.original_price)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 rounded-l-lg disabled:opacity-50"
                          disabled={isLoading || item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-3 py-2 border-x min-w-[3rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 rounded-r-lg disabled:opacity-50"
                          disabled={isLoading}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded disabled:opacity-50"
                        disabled={isLoading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="bg-white mx-4 p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-3">Price Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal ({cart.total_items} items)</span>
                <span>{formatCurrency(cart.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-green-600" : ""}>
                  {shipping === 0 ? "Free" : formatCurrency(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <div className="text-sm text-gray-600">
                  Add {formatCurrency(500 - cart.total_amount)} more for free shipping
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Button - Fixed at bottom */}
        <div className="bg-white border-t p-4 shadow-lg">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => router.push("/checkout")}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium text-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Proceed to Checkout • {formatCurrency(total)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
