"use client"

import { useState } from "react"
import { Filter, Grid, List } from "lucide-react"
import { ProductCard } from "./product-card"

interface CategoryDetailPageProps {
  categorySlug: string
}

export function CategoryDetailPage({ categorySlug }: CategoryDetailPageProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("popularity")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: [0, 5000],
    brand: "",
    rating: 0,
    availability: "all",
  })

  // Category data mapping
  const categoryData = {
    "male-wellness": {
      name: "Male Wellness",
      description: "Products specifically designed for men's health and wellness needs",
      image: "/placeholder.svg?height=200&width=400",
      totalProducts: 24,
    },
    "female-wellness": {
      name: "Female Wellness",
      description: "Comprehensive wellness solutions for women's health",
      image: "/placeholder.svg?height=200&width=400",
      totalProducts: 32,
    },
    "hair-scalp": {
      name: "Hair & Scalp",
      description: "Natural hair care and scalp health products",
      image: "/placeholder.svg?height=200&width=400",
      totalProducts: 18,
    },
    "joint-mobility": {
      name: "Joint & Mobility",
      description: "Support for joint health and improved mobility",
      image: "/placeholder.svg?height=200&width=400",
      totalProducts: 15,
    },
    "gut-digestive": {
      name: "Gut & Digestive",
      description: "Digestive health and gut wellness products",
      image: "/placeholder.svg?height=200&width=400",
      totalProducts: 21,
    },
    "skin-beauty": {
      name: "Skin & Beauty",
      description: "Natural skincare and beauty enhancement products",
      image: "/placeholder.svg?height=200&width=400",
      totalProducts: 28,
    },
    "immunity-detox": {
      name: "Immunity & Detox",
      description: "Boost immunity and natural detoxification",
      image: "/placeholder.svg?height=200&width=400",
      totalProducts: 19,
    },
    "weight-metabolism": {
      name: "Weight & Metabolism",
      description: "Healthy weight management and metabolism support",
      image: "/placeholder.svg?height=200&width=400",
      totalProducts: 16,
    },
    "mind-mood": {
      name: "Mind & Mood",
      description: "Mental wellness and mood enhancement products",
      image: "/placeholder.svg?height=200&width=400",
      totalProducts: 12,
    },
    "sugar-management": {
      name: "Sugar Management",
      description: "Natural blood sugar management solutions",
      image: "/placeholder.svg?height=200&width=400",
      totalProducts: 8,
    },
  }

  const category = categoryData[categorySlug as keyof typeof categoryData] || {
    name: "Category",
    description: "Explore our wellness products",
    image: "/placeholder.svg?height=200&width=400",
    totalProducts: 0,
  }

  // Mock products data - in real app, this would be filtered by category
  const products = [
    {
      id: "1",
      name: "Premium Wellness Formula",
      price: 925,
      originalPrice: 995,
      discount: 7,
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.5,
      reviews: 128,
      brand: "Purely Yours",
      inStock: true,
    },
    {
      id: "2",
      name: "Natural Health Supplement",
      price: 1493,
      originalPrice: 1990,
      discount: 25,
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.7,
      reviews: 89,
      brand: "Purely Yours",
      inStock: true,
    },
    {
      id: "3",
      name: "Organic Wellness Capsules",
      price: 789,
      originalPrice: 895,
      discount: 12,
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.6,
      reviews: 156,
      brand: "Purely Yours",
      inStock: true,
    },
    {
      id: "4",
      name: "Herbal Health Booster",
      price: 536,
      originalPrice: 595,
      discount: 10,
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.4,
      reviews: 203,
      brand: "Purely Yours",
      inStock: false,
    },
    {
      id: "5",
      name: "Natural Wellness Tea",
      price: 489,
      originalPrice: 595,
      discount: 18,
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.3,
      reviews: 94,
      brand: "Purely Yours",
      inStock: true,
    },
    {
      id: "6",
      name: "Advanced Health Formula",
      price: 1299,
      originalPrice: 1599,
      discount: 19,
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.8,
      reviews: 67,
      brand: "Purely Yours",
      inStock: true,
    },
  ]

  const brands = ["Purely Yours", "Nature's Best", "Herbal Plus", "Organic Care"]
  const sortOptions = [
    { value: "popularity", label: "Popularity" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Customer Rating" },
    { value: "newest", label: "Newest First" },
  ]

  const handleFilterChange = (filterType: string, value: any) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const clearFilters = () => {
    setSelectedFilters({
      priceRange: [0, 5000],
      brand: "",
      rating: 0,
      availability: "all",
    })
  }

  return (
    <div className="w-full">
      {/* Category Header - Full Width */}
      <div className="bg-white">
        <div className="relative">
          <img
            src={category.image || "/placeholder.svg"}
            alt={category.name}
            className="w-full h-32 sm:h-48 md:h-64 lg:h-80 xl:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <div className="p-4 sm:p-6 lg:p-8 xl:p-12 text-white w-full">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2">
                {category.name}
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl opacity-90 mb-2">
                {category.description}
              </p>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-80">
                {category.totalProducts} products available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sort Bar - Full Width */}
      <div className="bg-white border-b p-4 sm:p-6 lg:p-8 xl:p-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Filter size={16} />
              <span className="text-sm sm:text-base">Filters</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-green-100 text-green-600" : "text-gray-600"}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-green-100 text-green-600" : "text-gray-600"}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 hidden md:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2">
          {selectedFilters.brand && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Brand: {selectedFilters.brand}
              <button onClick={() => handleFilterChange("brand", "")}>×</button>
            </span>
          )}
          {selectedFilters.rating > 0 && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {selectedFilters.rating}+ Stars
              <button onClick={() => handleFilterChange("rating", 0)}>×</button>
            </span>
          )}
          {selectedFilters.availability !== "all" && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {selectedFilters.availability === "inStock" ? "In Stock" : "Out of Stock"}
              <button onClick={() => handleFilterChange("availability", "all")}>×</button>
            </span>
          )}
        </div>
      </div>

      {/* Products Grid/List - Full Width */}
      <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">
            Showing {products.length} of {category.totalProducts} products
          </h2>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border flex gap-4">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-contain rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-sm sm:text-base lg:text-lg mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm ml-1">{product.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg sm:text-xl lg:text-2xl font-semibold text-green-600">
                      ₹{product.price}
                    </span>
                    {product.originalPrice > product.price && (
                      <>
                        <span className="text-sm sm:text-base text-gray-500 line-through">
                          ₹{product.originalPrice}
                        </span>
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                          {product.discount}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${product.inStock ? "text-green-600" : "text-red-600"}`}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                    <button
                      disabled={!product.inStock}
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {product.inStock ? "Add to Cart" : "Notify Me"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load More Button */}
      <div className="p-4 sm:p-6 lg:p-8 xl:p-12 text-center">
        <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
          Load More Products
        </button>
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center md:justify-center">
          <div className="bg-white w-full md:w-96 lg:w-[500px] md:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Price Range */}
              <div>
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>₹{selectedFilters.priceRange[0]}</span>
                    <span>₹{selectedFilters.priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    value={selectedFilters.priceRange[1]}
                    onChange={(e) =>
                      handleFilterChange("priceRange", [selectedFilters.priceRange[0], Number(e.target.value)])
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Brand */}
              <div>
                <h4 className="font-medium mb-3">Brand</h4>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <label key={brand} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="brand"
                        value={brand}
                        checked={selectedFilters.brand === brand}
                        onChange={(e) => handleFilterChange("brand", e.target.value)}
                        className="text-green-600"
                      />
                      <span className="text-sm">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="font-medium mb-3">Customer Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={selectedFilters.rating === rating}
                        onChange={(e) => handleFilterChange("rating", Number(e.target.value))}
                        className="text-green-600"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{rating}</span>
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-500">& above</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <h4 className="font-medium mb-3">Availability</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="availability"
                      value="all"
                      checked={selectedFilters.availability === "all"}
                      onChange={(e) => handleFilterChange("availability", e.target.value)}
                      className="text-green-600"
                    />
                    <span className="text-sm">All Products</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="availability"
                      value="inStock"
                      checked={selectedFilters.availability === "inStock"}
                      onChange={(e) => handleFilterChange("availability", e.target.value)}
                      className="text-green-600"
                    />
                    <span className="text-sm">In Stock Only</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex gap-3">
              <button onClick={clearFilters} className="flex-1 py-3 border border-gray-300 rounded-lg font-medium">
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
