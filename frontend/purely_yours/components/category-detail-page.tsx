"use client"

import { useState, useEffect } from "react"
import { Filter, Grid, List } from "lucide-react"
import { ProductCard } from "./product-card"
import { useProducts, Product, Category } from "@/hooks/use-products"
import { useCart } from "@/hooks/use-cart"
import Link from "next/link"

interface CategoryDetailPageProps {
  categorySlug: string
}

export function CategoryDetailPage({ categorySlug }: CategoryDetailPageProps) {
  const { 
    products, 
    categories, 
    isLoading, 
    error, 
    hasMore, 
    fetchCategoryProducts, 
    fetchCategories, 
    loadMore 
  } = useProducts()
  
  const { addToCart, isLoading: cartLoading } = useCart()
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("popularity")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: [0, 5000],
    rating: 0,
    availability: "all",
  })
  
  const [category, setCategory] = useState<Category | null>(null)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  // Handle add to cart
  const handleAddToCart = async (productId: number, event: React.MouseEvent) => {
    event.preventDefault() // Prevent navigation to product page
    event.stopPropagation() // Stop event bubbling
    
    try {
      await addToCart(productId, undefined, 1)
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  // Handle buy now
  const handleBuyNow = async (productId: number, event: React.MouseEvent) => {
    event.preventDefault() // Prevent navigation to product page
    event.stopPropagation() // Stop event bubbling
    
    try {
      await addToCart(productId, undefined, 1)
      // Redirect to checkout
      window.location.href = '/checkout'
    } catch (error) {
      console.error('Error during buy now:', error)
    }
  }

  // Build filter parameters for API
  const buildFilterParams = () => {
    const params: any = {}
    
    // Price range
    if (selectedFilters.priceRange[0] > 0) {
      params.min_price = selectedFilters.priceRange[0]
    }
    if (selectedFilters.priceRange[1] < 5000) {
      params.max_price = selectedFilters.priceRange[1]
    }
    
    // Stock availability
    if (selectedFilters.availability === "inStock") {
      params.in_stock = true
    }
    
    // Sorting
    if (sortBy === "price-low") {
      params.ordering = "price"
    } else if (sortBy === "price-high") {
      params.ordering = "-price"
    } else if (sortBy === "rating") {
      params.ordering = "-average_rating"
    } else if (sortBy === "newest") {
      params.ordering = "-created_at"
    }
    
    return params
  }

  useEffect(() => {
    // Fetch categories first to get category info
    fetchCategories()
    
    // Fetch products for this category with current filters
    const filterParams = buildFilterParams()
    fetchCategoryProducts(categorySlug, filterParams)
  }, [categorySlug, sortBy, selectedFilters, fetchCategories, fetchCategoryProducts])

  useEffect(() => {
    // Find the current category from the categories list
    const currentCategory = categories.find(cat => cat.slug === categorySlug)
    setCategory(currentCategory || null)
  }, [categories, categorySlug])

  useEffect(() => {
    // Apply client-side rating filter since it might not be in API
    let filtered = [...products]
    
    if (selectedFilters.rating > 0) {
      filtered = filtered.filter(product => (product.average_rating || 0) >= selectedFilters.rating)
    }
    
    setFilteredProducts(filtered)
  }, [products, selectedFilters.rating])
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
      rating: 0,
      availability: "all",
    })
  }

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadMore()
    }
  }

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy)
    // This will trigger the useEffect to refetch products with new sorting
  }

  // Loading state
  if (isLoading && filteredProducts.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-white">
          <div className="w-full h-32 sm:h-48 md:h-64 lg:h-80 xl:h-96 bg-gray-200 animate-pulse"></div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 md:gap-8 lg:gap-6 xl:gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex-shrink-0">
                <div className="border border-gray-200 rounded-lg p-3 bg-white h-80 animate-pulse">
                  <div className="w-full h-40 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && filteredProducts.length === 0) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => fetchCategoryProducts(categorySlug)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Category Header - Full Width */}
      <div className="bg-white">
        <div className="relative">
          <img
            src={category?.image || "/placeholder.svg"}
            alt={category?.name || "Category"}
            className="w-full h-32 sm:h-48 md:h-64 lg:h-80 xl:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <div className="p-4 sm:p-6 lg:p-8 xl:p-12 text-white w-full">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2">
                {category?.name || "Category"}
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl opacity-90 mb-2">
                {category?.description || "Explore our wellness products"}
              </p>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-80">
                {category?.product_count || products.length} products available
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
              onChange={(e) => handleSortChange(e.target.value)}
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
          {(selectedFilters.priceRange[0] > 0 || selectedFilters.priceRange[1] < 5000) && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Price: ₹{selectedFilters.priceRange[0]} - ₹{selectedFilters.priceRange[1]}
              <button onClick={() => handleFilterChange("priceRange", [0, 5000])}>×</button>
            </span>
          )}
        </div>
      </div>

      {/* Products Grid/List - Full Width */}
      <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">
            Showing {filteredProducts.length} of {category?.product_count || filteredProducts.length} products
          </h2>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found in this category</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 md:gap-8 lg:gap-6 xl:gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex-shrink-0">
                <ProductCard 
                  id={product.id.toString()}
                  productId={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={parseFloat(product.price)}
                  originalPrice={parseFloat(product.original_price)}
                  discount={product.discount_percentage > 0 ? product.discount_percentage : undefined}
                  image={product.primary_image || product.images?.[0]?.image || "/placeholder.svg"}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border flex gap-4">
                <img
                  src={product.primary_image || product.images?.[0]?.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-contain rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-sm sm:text-base lg:text-lg mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm ml-1">{product.average_rating?.toFixed(1) || 0}</span>
                    </div>
                    <span className="text-sm text-gray-500">({product.review_count || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg sm:text-xl lg:text-2xl font-semibold text-green-600">
                      ₹{parseFloat(product.price).toFixed(2)}
                    </span>
                    {parseFloat(product.original_price) > parseFloat(product.price) && (
                      <>
                        <span className="text-sm sm:text-base text-gray-500 line-through">
                          ₹{parseFloat(product.original_price).toFixed(2)}
                        </span>
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                          {product.discount_percentage}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${product.stock_quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                      {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                    <button
                      disabled={product.stock_quantity === 0}
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {product.stock_quantity > 0 ? "Add to Cart" : "Notify Me"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="p-4 sm:p-6 lg:p-8 xl:p-12 text-center">
          <button 
            onClick={handleLoadMore}
            disabled={isLoading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Loading..." : "Load More Products"}
          </button>
        </div>
      )}

      {/* Show loading indicator while fetching */}
      {isLoading && filteredProducts.length > 0 && (
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Loading more products...</p>
        </div>
      )}

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
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600">Min Price</label>
                      <input
                        type="range"
                        min="0"
                        max="4999"
                        step="50"
                        value={selectedFilters.priceRange[0]}
                        onChange={(e) =>
                          handleFilterChange("priceRange", [Number(e.target.value), selectedFilters.priceRange[1]])
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Max Price</label>
                      <input
                        type="range"
                        min="1"
                        max="5000"
                        step="50"
                        value={selectedFilters.priceRange[1]}
                        onChange={(e) =>
                          handleFilterChange("priceRange", [selectedFilters.priceRange[0], Number(e.target.value)])
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
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
                onClick={() => {
                  setShowFilters(false)
                  // Filters will be applied automatically through useEffect
                }}
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
