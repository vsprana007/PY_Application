"use client"

import { Heart, ShoppingCart, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import { formatCurrency, showToast } from "@/lib/utils"

export function WishlistPage() {
  const { isAuthenticated } = useAuth()
  const { addToCart, isLoading: cartLoading } = useCart()
  const { wishlist, removeFromWishlist, isLoading, clearWishlist } = useWishlist()

  const handleAddToCart = async (product: any) => {
    try {
      await addToCart(product.id)
      showToast("Added to cart successfully!", "success")
    } catch (error) {
      console.error("Failed to add to cart:", error)
      showToast("Failed to add to cart", "error")
    }
  }

  const handleRemoveFromWishlist = async (itemId: number) => {
    try {
      await removeFromWishlist(itemId)
      showToast("Removed from wishlist", "success")
    } catch (error) {
      console.error("Failed to remove from wishlist:", error)
      showToast("Failed to remove from wishlist", "error")
    }
  }

  const handleClearWishlist = async () => {
    if (window.confirm("Are you sure you want to clear your wishlist?")) {
      try {
        await clearWishlist()
        showToast("Wishlist cleared", "success")
      } catch (error) {
        console.error("Failed to clear wishlist:", error)
        showToast("Failed to clear wishlist", "error")
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
          <h1 className="text-lg font-semibold">Wishlist</h1>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <Heart size={64} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in to view your wishlist</h2>
          <p className="text-gray-600 text-center mb-6">Please sign in to access your wishlist</p>
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
          <h1 className="text-lg font-semibold">Wishlist</h1>
        </div>

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex items-center">
          <Link href="/" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-semibold">Wishlist</h1>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <Heart size={64} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 text-center mb-6">Save your favorite products here</p>
          <Link href="/categories">
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-semibold">Wishlist ({wishlist.length})</h1>
        </div>
        {wishlist.length > 0 && (
          <button onClick={handleClearWishlist} className="text-red-600 text-sm hover:text-red-700">
            Clear All
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {wishlist.map((item: any) => (
            <div key={item.id} className="bg-white rounded-lg p-3 shadow-sm relative">
              <button
                onClick={() => handleRemoveFromWishlist(item.id)}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md z-10 hover:bg-gray-50"
                disabled={isLoading}
              >
                <Heart size={16} className="fill-red-500 text-red-500" />
              </button>

              {item.product.discount_percentage > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
                  {item.product.discount_percentage}% OFF
                </div>
              )}

              <Link href={`/product/${item.product.slug}`}>
                <img
                  src={item.product.primary_image || "/placeholder.svg"}
                  alt={item.product.name}
                  className="w-full h-32 object-contain mb-2"
                />
                <h3 className="text-sm font-medium mb-2 line-clamp-2">{item.product.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-sm font-semibold text-green-600">{formatCurrency(item.product.price)}</span>
                  {item.product.original_price > item.product.price && (
                    <span className="text-xs text-gray-500 line-through">
                      {formatCurrency(item.product.original_price)}
                    </span>
                  )}
                </div>
              </Link>

              {item.product.stock_quantity > 0 ? (
                <button
                  onClick={() => handleAddToCart(item.product)}
                  disabled={cartLoading}
                  className="w-full bg-green-600 text-white text-xs py-2 rounded flex items-center justify-center gap-1 hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <ShoppingCart size={12} />
                  {cartLoading ? "Adding..." : "Add to Cart"}
                </button>
              ) : (
                <button className="w-full bg-gray-300 text-gray-600 text-xs py-2 rounded" disabled>
                  Out of Stock
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
