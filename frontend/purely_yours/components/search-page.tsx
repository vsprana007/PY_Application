"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Filter, X, ArrowLeft } from "lucide-react"
import { ProductCard } from "./product-card"
import { useProducts } from "@/hooks/use-products"
import { useRouter } from "next/navigation"

interface SearchResult {
  id: number
  name: string
  slug: string
  price: string
  original_price: string
  discount_percentage: number
  primary_image: string
  collections: Array<{
    id: number
    name: string
    slug: string
    description: string
    image: string | null
    product_count: number
    show_on_homepage: boolean
  }>
  tags: Array<{
    id: number
    name: string
    slug: string
  }>
  average_rating: number
  review_count: number
  stock_quantity: number
}

interface SearchResponse {
  results: SearchResult[]
  count: number
  query: string
}

export function SearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const { categories } = useProducts()

  // Debounced search function
  const performSearch = useCallback(async (query: string, category?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (query.trim()) {
        params.append('q', query.trim())
      }
      if (category) {
        params.append('collection', category)
      }
      
      const response = await fetch(`http://localhost:8000/api/products/search/?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const data: SearchResponse = await response.json()
      setSearchResults(data.results || [])
      setTotalCount(data.count || 0)
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to search products')
      setSearchResults([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery, selectedCategory)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedCategory, performSearch])

  // Initial load
  useEffect(() => {
    performSearch('', selectedCategory)
  }, [])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const clearFilters = () => {
    setSelectedCategory("")
    setPriceRange([0, 5000])
  }

  // Filter results by price range on client side
  const filteredResults = searchResults.filter(product => {
    const price = parseFloat(product.price)
    return price >= priceRange[0] && price <= priceRange[1]
  })

  // Remove duplicates based on product id
  const uniqueResults = filteredResults.filter((product, index, self) => 
    index === self.findIndex(p => p.id === product.id)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
        <div className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10">
            <button onClick={() => router.back()} className="mr-4">
                <ArrowLeft size={24} />
            </button>
            <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-colors flex items-center gap-2"
            >
              <Filter size={20} className="text-gray-600" />
              <span className="hidden sm:inline text-gray-700">Filter</span>
            </button>
          </div>
        </div>
      <div className="flex flex-col">
        {/* Results */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              {searchQuery ? `Results for "${searchQuery}"` : "All Products"} ({uniqueResults.length})
            </h2>
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span className="text-sm">Searching...</span>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
              <button 
                onClick={() => performSearch(searchQuery, selectedCategory)}
                className="mt-2 text-red-600 hover:text-red-700 underline"
              >
                Try again
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8 lg:gap-6 xl:gap-8">
            {uniqueResults.map((product) => (
              <div key={product.id} className="flex-shrink-0">
                <ProductCard 
                  id={product.id.toString()}
                  productId={product.id}
                  name={product.name}
                  price={parseFloat(product.price)}
                  originalPrice={parseFloat(product.original_price)}
                  discount={product.discount_percentage > 0 ? product.discount_percentage : undefined}
                  image={product.primary_image || "/placeholder.svg"}
                  slug={product.slug}
                />
              </div>
            ))}
          </div>

          {/* Empty State */}
          {!isLoading && uniqueResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Search size={64} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-500 text-center">
                {searchQuery 
                  ? `No results for "${searchQuery}". Try different keywords or check the spelling.`
                  : "No products available at the moment."
                }
              </p>
            </div>
          )}
        </div>

        {/* Filter Modal */}
        {showFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div className="bg-white w-full max-h-[80vh] rounded-t-xl overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 space-y-6">
                {/* Categories */}
                <div>
                  <h4 className="font-medium mb-3">Categories</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="category"
                          value={category.slug}
                          checked={selectedCategory === category.slug}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="text-green-600"
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 border-t flex gap-3">
                <button
                  onClick={() => {
                    setSelectedCategory("")
                    setPriceRange([0, 5000])
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-lg"
                >
                  Clear All
                </button>
                <button onClick={() => setShowFilters(false)} className="flex-1 py-3 bg-green-600 text-white rounded-lg">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
