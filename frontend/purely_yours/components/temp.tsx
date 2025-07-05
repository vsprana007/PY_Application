"use client"

import { useState, useEffect } from "react"
import {
  Heart,
  ShoppingCart,
  Star,
  ChevronDown,
  ChevronUp,
  FileText,
  ArrowLeft,
  ThumbsUp,
  Calendar,
} from "lucide-react"
import { useProduct } from "@/hooks/use-products"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import { useReviews } from "@/hooks/use-reviews"
import { useAuth } from "@/hooks/use-auth"
import { formatCurrency, safeNumber, safeString, safeArray, safeGet, truncateText } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ProductPageProps {
  productId: string
}

export function ProductPage({ productId }: ProductPageProps) {
  const router = useRouter()
  const { product, isLoading, error } = useProduct(productId)
  const { addToCart, isLoading: cartLoading } = useCart()
  const { toggleWishlist, isInWishlist, isLoading: wishlistLoading } = useWishlist()
  const { fetchProductReviews, reviews, isLoading: reviewsLoading } = useReviews()
  const { isAuthenticated } = useAuth()

  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    if (product?.id) {
      fetchProductReviews(product.id)
      const variants = safeArray(product.variants, [])
      if (variants.length > 0) {
        setSelectedVariant(variants[0])
      }
    }
  }, [product])

  useEffect(() => {
    if (product?.id) {
      fetchProductReviews(product.id)
    }
  }, [product?.id, fetchProductReviews])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      localStorage.setItem("redirectAfterAuth", window.location.pathname)
      router.push("/auth/login")
      return
    }

    if (!product?.id) return

    try {
      await addToCart(product.id, selectedVariant?.id, quantity)
    } catch (error) {
      console.error("Failed to add to cart:", error)
    }
  }

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      localStorage.setItem("redirectAfterAuth", window.location.pathname)
      router.push("/auth/login")
      return
    }

    if (!product?.id) return

    try {
      await toggleWishlist(product.id)
    } catch (error) {
      console.error("Failed to toggle wishlist:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Product not found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link href="/categories">
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg">Browse Products</button>
          </Link>
        </div>
      </div>
    )
  }

  const currentPrice = safeNumber(selectedVariant?.price || product.price, 0)
  const originalPrice = safeNumber(selectedVariant?.original_price || product.original_price, 0)
  const discountPercentage = safeNumber(selectedVariant?.discount_percentage || product.discount_percentage, 0)
  const inStock = safeNumber(selectedVariant?.stock_quantity || product.stock_quantity, 0) > 0
  const productImages: Array<{ image: string }> = safeArray(product.images, [])
  const productVariants = safeArray(product.variants, [])
  const productName = safeString(product.name, "Product")
  const productDescription = safeString(product.description)
  const averageRating = safeNumber(product.average_rating, 0)
  const reviewCount = safeNumber(product.review_count, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10">
        <button onClick={() => router.back()} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold flex-1 truncate">{truncateText(productName, 40)}</h1>
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading || !product.id}
          className="p-2 disabled:opacity-50"
        >
          <Heart
            size={24}
            className={`${isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"} transition-colors`}
          />
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Product Images */}
        <div className="bg-white p-4">
          <div className="aspect-square bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
            <img
              src={
                productImages[selectedImageIndex]?.image ||
                product.primary_image ||
                "/placeholder.svg?height=400&width=400" ||
                "/placeholder.svg" ||
                "/placeholder.svg"
              }
              alt={productName}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=400&width=400"
              }}
            />
            {discountPercentage > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                {discountPercentage}% OFF
              </div>
            )}
          </div>

          {productImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {productImages.map((image: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                    selectedImageIndex === index ? "border-green-600" : "border-gray-200"
                  }`}
                >
                  <img
                    src={safeString(image?.image, "/placeholder.svg") || "/placeholder.svg"}
                    alt={`${productName} ${index + 1}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg"
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="bg-white p-4 mt-2">
          <h1 className="text-xl font-bold mb-2">{productName}</h1>

          {/* Rating */}
          {averageRating > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 text-sm font-medium">{averageRating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-green-600">{formatCurrency(currentPrice)}</span>
            {originalPrice > currentPrice && (
              <>
                <span className="text-lg text-gray-500 line-through">{formatCurrency(originalPrice)}</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                  {discountPercentage}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-4">
            <span className={`text-sm font-medium ${inStock ? "text-green-600" : "text-red-600"}`}>
              {inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          {/* Variants */}
          {productVariants.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Select Variant:</h3>
              <div className="flex gap-2 flex-wrap">
                {productVariants.map((variant: any) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-3 py-2 border rounded-lg text-sm ${
                      selectedVariant?.id === variant.id
                        ? "border-green-600 bg-green-50 text-green-600"
                        : "border-gray-300"
                    }`}
                  >
                    {safeString(variant.name, "Variant")}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Quantity:</h3>
            <div className="flex items-center border rounded-lg w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-4 py-2 border-x">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-gray-100">
                +
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white p-4 mt-2">
          <button
            onClick={handleAddToCart}
            disabled={cartLoading || !inStock || !product.id}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
          >
            <ShoppingCart size={20} />
            {cartLoading ? "Adding..." : inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>

        {/* Product Details Sections */}
        <div className="space-y-2 mt-2">
          {/* Description */}
          {productDescription && (
            <div className="bg-white">
              <button
                onClick={() => setExpandedSection(expandedSection === "description" ? null : "description")}
                className="w-full p-4 text-left flex items-center justify-between"
              >
                <span className="font-medium">Description</span>
                {expandedSection === "description" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSection === "description" && (
                <div className="px-4 pb-4">
                  <p className="text-gray-600">{productDescription}</p>
                </div>
              )}
            </div>
          )}

          {/* Key Benefits */}
          {safeString(safeGet(product, "key_benefits")) && (
            <div className="bg-white">
              <button
                onClick={() => setExpandedSection(expandedSection === "benefits" ? null : "benefits")}
                className="w-full p-4 text-left flex items-center justify-between"
              >
                <span className="font-medium">Key Benefits</span>
                {expandedSection === "benefits" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSection === "benefits" && (
                <div className="px-4 pb-4">
                  <p className="text-gray-600">{safeString(safeGet(product, "key_benefits"))}</p>
                </div>
              )}
            </div>
          )}

          {/* Key Ingredients */}
          {safeString(safeGet(product, "key_ingredients")) && (
            <div className="bg-white">
              <button
                onClick={() => setExpandedSection(expandedSection === "ingredients" ? null : "ingredients")}
                className="w-full p-4 text-left flex items-center justify-between"
              >
                <span className="font-medium">Key Ingredients</span>
                {expandedSection === "ingredients" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSection === "ingredients" && (
                <div className="px-4 pb-4">
                  <p className="text-gray-600">{safeString(safeGet(product, "key_ingredients"))}</p>
                </div>
              )}
            </div>
          )}

          {/* How to Consume */}
          {safeString(safeGet(product, "how_to_consume")) && (
            <div className="bg-white">
              <button
                onClick={() => setExpandedSection(expandedSection === "consume" ? null : "consume")}
                className="w-full p-4 text-left flex items-center justify-between"
              >
                <span className="font-medium">How to Consume</span>
                {expandedSection === "consume" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSection === "consume" && (
                <div className="px-4 pb-4">
                  <p className="text-gray-600">{safeString(safeGet(product, "how_to_consume"))}</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews */}
          <div className="bg-white">
            <button
              onClick={() => setExpandedSection(expandedSection === "reviews" ? null : "reviews")}
              className="w-full p-4 text-left flex items-center justify-between"
            >
              <span className="font-medium">Reviews ({reviewCount})</span>
              {expandedSection === "reviews" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSection === "reviews" && (
              <div className="px-4 pb-4">
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Customer Reviews ({reviewsLoading ? "..." : reviews.length})
                    </h2>
                  </div>
                </div>

                {reviewsLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading reviews...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border border-gray-200 rounded-md p-4 hover:shadow-sm transition-shadow bg-gray-50"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center flex-shrink-0">
                            <span className="text-green-700 font-semibold text-sm">
                              {review.user.first_name.charAt(0)}
                              {review.user.last_name.charAt(0)}
                            </span>
                          </div>

                          <div className="flex-1">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                  {review.user.first_name} {review.user.last_name}
                                </span>
                                {review.is_verified_purchase && (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                    Verified Purchase
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(review.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* Rating and Title */}
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium text-gray-700">{review.rating}/5</span>
                            </div>

                            <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>

                            {/* Comment */}
                            <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>

                            {/* Actions */}
                            <div className="flex items-center gap-4">
                              <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors">
                                <ThumbsUp className="w-3 h-3" />
                                <span>Helpful ({review.helpful_count})</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Analytical Report */}
          {safeString(safeGet(product, "analytical_report")) && (
            <div className="bg-white">
              <button
                onClick={() => setExpandedSection(expandedSection === "report" ? null : "report")}
                className="w-full p-4 text-left flex items-center justify-between"
              >
                <span className="font-medium flex items-center gap-2">
                  <FileText size={20} />
                  Analytical Report
                </span>
                {expandedSection === "report" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSection === "report" && (
                <div className="px-4 pb-4">
                  <img
                    src={safeString(safeGet(product, "analytical_report"), "/placeholder.svg") || "/placeholder.svg"}
                    alt="Analytical Report"
                    className="w-full max-w-md mx-auto rounded-lg border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg"
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* FAQs */}
          {safeArray(safeGet(product, "faqs"), []).length > 0 && (
            <div className="bg-white">
              <button
                onClick={() => setExpandedSection(expandedSection === "faqs" ? null : "faqs")}
                className="w-full p-4 text-left flex items-center justify-between"
              >
                <span className="font-medium">Frequently Asked Questions</span>
                {expandedSection === "faqs" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSection === "faqs" && (
                <div className="px-4 pb-4 space-y-4">
                  {safeArray(safeGet(product, "faqs"), []).map((faq: any) => (
                    <div key={safeGet(faq, "id", Math.random())}>
                      <h4 className="font-medium mb-1">{safeString(safeGet(faq, "question"), "Question")}</h4>
                      <p className="text-gray-600 text-sm">{safeString(safeGet(faq, "answer"), "Answer")}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
