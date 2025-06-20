import Link from "next/link"

interface ProductCardProps {
  id: string
  name: string
  price: number
  originalPrice: number
  discount?: number
  image: string
}

export function ProductCard({ id, name, price, originalPrice, discount, image }: ProductCardProps) {
  return (
    <Link href={`/product/${id}`}>
      <div className="border border-gray-200 rounded-lg p-2 md:p-3 bg-white relative flex flex-col hover:shadow-md transition-shadow h-full">
        <div className="flex flex-col flex-1">
          {discount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
              {discount}% OFF
            </div>
          )}
          <img
            alt={name}
            className="w-full h-32 md:h-40 lg:h-48 object-contain mb-2"
            src={image || "/placeholder.svg"}
          />
          <h3 className="text-sm md:text-base font-medium mt-2 line-clamp-2 flex-1">{name}</h3>
          <div className="flex items-center mt-2">
            <span className="text-sm md:text-base font-semibold">₹{price.toFixed(2)}</span>
            <span className="text-xs md:text-sm text-gray-500 line-through ml-1">₹{originalPrice.toFixed(2)}</span>
          </div>
        </div>
        <button className="w-full bg-green-600 text-white text-xs md:text-sm py-1.5 md:py-2 rounded mt-2">
          BUY NOW
        </button>
      </div>
    </Link>
  )
}
