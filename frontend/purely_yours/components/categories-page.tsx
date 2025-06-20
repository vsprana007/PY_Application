import { ChevronRight } from "lucide-react"
import { ProductCard } from "./product-card"
import Link from "next/link"

export function CategoriesPage() {
  const categories = [
    { name: "Male Wellness", count: 24, image: "/placeholder.svg?height=100&width=100", slug: "male-wellness" },
    { name: "Female Wellness", count: 32, image: "/placeholder.svg?height=100&width=100", slug: "female-wellness" },
    { name: "Hair & Scalp", count: 18, image: "/placeholder.svg?height=100&width=100", slug: "hair-scalp" },
    { name: "Joint & Mobility", count: 15, image: "/placeholder.svg?height=100&width=100", slug: "joint-mobility" },
    { name: "Gut & Digestive", count: 21, image: "/placeholder.svg?height=100&width=100", slug: "gut-digestive" },
    { name: "Skin & Beauty", count: 28, image: "/placeholder.svg?height=100&width=100", slug: "skin-beauty" },
    { name: "Immunity & Detox", count: 19, image: "/placeholder.svg?height=100&width=100", slug: "immunity-detox" },
    {
      name: "Weight & Metabolism",
      count: 16,
      image: "/placeholder.svg?height=100&width=100",
      slug: "weight-metabolism",
    },
    { name: "Mind & Mood", count: 12, image: "/placeholder.svg?height=100&width=100", slug: "mind-mood" },
    { name: "Sugar Management", count: 8, image: "/placeholder.svg?height=100&width=100", slug: "sugar-management" },
  ]

  const featuredProducts = [
    {
      id: "1",
      name: "Gluco Defence",
      price: 925,
      originalPrice: 995,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "2",
      name: "Joint Care Formula",
      price: 1493,
      originalPrice: 1990,
      discount: 25,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "3",
      name: "Women's Wellness",
      price: 789,
      originalPrice: 895,
      discount: 12,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "4",
      name: "Organic Immunity Boost",
      price: 536,
      originalPrice: 595,
      discount: 10,
      image: "/placeholder.svg?height=200&width=200",
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-12 space-y-6 w-full">
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold">Shop by Categories</h1>

      {/* Categories Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-4 sm:gap-6 lg:gap-8">
        {categories.map((category) => (
          <Link key={category.name} href={`/categories/${category.slug}`}>
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow h-full">
              <img
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-3 object-contain"
              />
              <h3 className="font-medium text-center mb-1 text-sm sm:text-base lg:text-lg">{category.name}</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 text-center">{category.count} products</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Featured Products - Responsive Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold">Featured Products</h2>
          <Link href="/search">
            <button className="flex items-center text-sm sm:text-base lg:text-lg text-green-600">
              View all <ChevronRight size={16} />
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-4 sm:gap-6 lg:gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </div>
  )
}
