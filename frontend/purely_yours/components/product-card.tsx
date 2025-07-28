"use client"

import Link from "next/link"
import { useBuyNow } from "@/hooks/use-buy-now"

interface ProductCardProps {
  id: string | number // Can be either slug or numeric id
  productId?: number // Numeric ID for buy now functionality
  name: string
  price: number
  originalPrice: number
  discount?: number
  image: string
  slug: string
}

export function ProductCard({ id, productId, name, price, originalPrice, discount, image, slug }: ProductCardProps) {
  const { buyNow, isLoading } = useBuyNow()

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent Link navigation
    e.stopPropagation() // Stop event bubbling
    
    // Use productId if provided, otherwise try to parse id
    const numericId = productId || (typeof id === 'string' ? parseInt(id) || 0 : id)
    
    // Create a product object from the props
    const product = {
      id: numericId,
      name,
      price,
      originalPrice,
      image,
      slug,
    }
    
    // Call buyNow with default quantity of 1 and no variant
    await buyNow(product, null, 1)
  }

  return (
    <Link href={`/product/${slug}`}>
      <div className="border border-gray-200 rounded-lg p-2 md:p-3 bg-white relative flex flex-col hover:shadow-md transition-shadow h-80 w-full">
        <div className="flex flex-col flex-1">
          {discount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
              {discount}% OFF
            </div>
          )}
          <img
            alt={name}
            className="w-full h-40 object-contain mb-2"
            src={image || "/placeholder.svg"}
          />
          <div className="flex flex-col justify-between flex-1">
            <h3 className="text-sm font-medium mt-2 line-clamp-2 min-h-[2.5rem]">{name}</h3>
            <div className="flex items-center mt-2">
              <span className="text-sm font-semibold">₹{price.toFixed(2)}</span>
              <span className="text-xs text-gray-500 line-through ml-1">₹{originalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleBuyNow}
          disabled={isLoading}
          className="w-full bg-green-600 text-white text-xs py-1.5 rounded mt-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "BUY NOW"}
        </button>
      </div>
    </Link>
  )
}
