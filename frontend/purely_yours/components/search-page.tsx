"use client"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { ProductCard } from "./product-card"

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [priceRange, setPriceRange] = useState([0, 5000])

  const categories = [
    "Male Wellness",
    "Female Wellness",
    "Hair & Scalp",
    "Joint & Mobility",
    "Gut & Digestive",
    "Skin & Beauty",
    "Immunity & Detox",
    "Weight & Metabolism",
    "Mind & Mood",
    "Sugar Management",
  ]

  const searchResults = [
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
    <div className="flex flex-col h-screen">
      {/* Search Bar */}
      <div className="p-4 bg-white shadow-sm">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="p-3 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter size={20} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {searchQuery ? `Results for "${searchQuery}"` : "All Products"} ({searchResults.length})
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {searchResults.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
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
                    <label key={category} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="text-green-600"
                      />
                      <span className="text-sm">{category}</span>
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
  )
}
