
"use client"
import React from "react"

import { Heart, ShoppingCart, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import { formatCurrency } from "@/lib/utils"
import { MessageModal } from "@/components/ui/message-modal"


export function WishlistPage() {
  const { isAuthenticated } = useAuth()
  const { addToCart, isLoading: cartLoading } = useCart()
  const { wishlist, removeFromWishlist, isLoading, clearWishlist } = useWishlist()

  // Modal state
  const [modal, setModal] = React.useState<{
    isOpen: boolean
    type: 'success' | 'error' | 'info' | 'warning' | 'confirm'
    title: string
    message: string
    onConfirm?: () => void
    confirmText?: string
    cancelText?: string
    showCancel?: boolean
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: undefined,
    confirmText: undefined,
    cancelText: undefined,
    showCancel: false,
  })

  const openModal = (options: Partial<typeof modal>) => {
    setModal({ ...modal, ...options, isOpen: true })
  }
  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }))
  }

  const handleAddToCart = async (product: any) => {
    try {
      await addToCart(product.id)
      openModal({
        type: 'success',
        title: 'Success',
        message: 'Added to cart successfully!',
      })
    } catch (error) {
      console.error("Failed to add to cart:", error)
      openModal({
        type: 'error',
        title: 'Error',
        message: 'Failed to add to cart',
      })
    }
  }

  const handleRemoveFromWishlist = async (itemId: number) => {
    try {
      await removeFromWishlist(itemId)
      openModal({
        type: 'success',
        title: 'Success',
        message: 'Removed from wishlist',
      })
    } catch (error) {
      console.error("Failed to remove from wishlist:", error)
      openModal({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove from wishlist',
      })
    }
  }

  const handleClearWishlist = async () => {
    openModal({
      type: 'confirm',
      title: 'Clear Wishlist',
      message: 'Are you sure you want to clear your wishlist?',
      confirmText: 'Yes, Clear',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: async () => {
        try {
          await clearWishlist()
          openModal({
            type: 'success',
            title: 'Success',
            message: 'Wishlist cleared',
          })
        } catch (error) {
          console.error("Failed to clear wishlist:", error)
          openModal({
            type: 'error',
            title: 'Error',
            message: 'Failed to clear wishlist',
          })
        }
      },
    })
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
    <>
      <MessageModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        showCancel={modal.showCancel}
      />
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {wishlist.map((item: any) => (
              <div key={item.id} className="group bg-white rounded-xl p-3 md:p-4 shadow-sm hover:shadow-lg relative overflow-hidden transition-all duration-300 border border-gray-100 hover:border-green-200 flex flex-col h-full">
                {/* Remove button */}
                <button
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  className="absolute top-3 right-3 p-1.5 bg-white rounded-full shadow-md z-10 hover:bg-red-50 transition-colors group-hover:scale-110"
                  disabled={isLoading}
                >
                  <Heart size={16} className="fill-red-500 text-red-500" />
                </button>

                {/* Discount badge */}
                {item.product.discount_percentage > 0 && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold px-2 py-1 rounded-lg shadow-md z-10">
                    {item.product.discount_percentage}% OFF
                  </div>
                )}

                <Link href={`/product/${item.product.slug}`} className="flex flex-col flex-1">
                  {/* Product image */}
                  <div className="relative overflow-hidden rounded-lg bg-gray-50 mb-3 aspect-square">
                    <img
                      src={item.product.primary_image || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product name */}
                  <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 group-hover:text-green-700 transition-colors flex-1">
                    {item.product.name}
                  </h3>

                  {/* Price section */}
                  <div className="flex items-end justify-between mb-3 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(item.product.price)}
                      </span>
                      {item.product.original_price > item.product.price && (
                        <span className="text-xs text-gray-500 line-through">
                          {formatCurrency(item.product.original_price)}
                        </span>
                      )}
                    </div>
                    {item.product.discount_percentage > 0 && (
                      <div className="text-xs text-green-600 font-medium text-right">
                        Save {formatCurrency(item.product.original_price - item.product.price)}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Add to cart button */}
                {item.product.stock_quantity > 0 ? (
                  <button
                    onClick={() => handleAddToCart(item.product)}
                    disabled={cartLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 hover:from-green-700 hover:to-green-800 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 mt-auto"
                  >
                    <ShoppingCart size={14} />
                    {cartLoading ? "Adding..." : "Add to Cart"}
                  </button>
                ) : (
                  <button className="w-full bg-gray-300 text-gray-600 text-sm font-medium py-2.5 rounded-lg mt-auto" disabled>
                    Out of Stock
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
