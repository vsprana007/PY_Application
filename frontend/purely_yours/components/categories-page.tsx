"use client"

import { ChevronRight } from "lucide-react"
import { ProductCard } from "./product-card"
import Link from "next/link"
import { useProducts } from "@/hooks/use-products"
import { useEffect, useState } from "react"
import { Product } from "@/hooks/use-products"

export function CategoriesPage() {
  const { categories, categoriesLoading, error, fetchCategories, getFeaturedProducts } = useProducts()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [featuredError, setFeaturedError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch categories on component mount
    fetchCategories()
    
    // Fetch featured products
    const loadFeaturedProducts = async () => {
      try {
        setFeaturedLoading(true)
        setFeaturedError(null)
        const products = await getFeaturedProducts()
        setFeaturedProducts(products || [])
      } catch (error) {
        console.error('Error loading featured products:', error)
        setFeaturedError('Failed to load featured products')
      } finally {
        setFeaturedLoading(false)
      }
    }
    
    loadFeaturedProducts()
  }, [fetchCategories, getFeaturedProducts])

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-12 space-y-8 w-full">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">Shop by Categories</h1>
        <p className="text-gray-600 text-lg">Discover our curated collection of wellness products</p>
      </div>

      {/* Categories Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-4 sm:gap-6 lg:gap-8">
        {categoriesLoading ? (
          // Loading skeleton
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 h-full animate-pulse">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-3 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => fetchCategories()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No categories available</p>
          </div>
        ) : (
          categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <div className="group bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-lg hover:border-green-200 border border-gray-100 transition-all duration-300 h-full">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-3 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <img
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 lg:w-18 lg:h-18 object-contain group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <h3 className="font-semibold text-center mb-1 text-sm sm:text-base lg:text-lg text-gray-800 group-hover:text-green-700 transition-colors">{category.name}</h3>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-500 text-center">{category.product_count} products</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Featured Products - Responsive Grid */}
      <div className="bg-gray-50 rounded-2xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-1">Featured Products</h2>
            <p className="text-gray-600">Handpicked wellness essentials for you</p>
          </div>
          <Link href="/search">
            <button className="flex items-center text-sm sm:text-base lg:text-lg text-green-600 hover:text-green-700 font-medium transition-colors group">
              View all 
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-4 sm:gap-6 lg:gap-8">
          {featuredLoading ? (
            // Loading skeleton for featured products
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-2 md:p-3 bg-white h-80 w-56 animate-pulse">
                <div className="w-full h-40 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-full mt-auto"></div>
              </div>
            ))
          ) : featuredError ? (
            <div className="col-span-full text-center py-12">
              <p className="text-red-600 mb-4">{featuredError}</p>
              <button 
                onClick={() => {
                  const loadFeaturedProducts = async () => {
                    try {
                      setFeaturedLoading(true)
                      setFeaturedError(null)
                      const products = await getFeaturedProducts()
                      setFeaturedProducts(products || [])
                    } catch (error) {
                      console.error('Error loading featured products:', error)
                      setFeaturedError('Failed to load featured products')
                    } finally {
                      setFeaturedLoading(false)
                    }
                  }
                  loadFeaturedProducts()
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No featured products available</p>
            </div>
          ) : (
            featuredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                id={product.id.toString()}
                slug={product.slug}
                productId={product.id}
                name={product.name}
                price={parseFloat(product.price)}
                originalPrice={parseFloat(product.original_price)}
                discount={product.discount_percentage > 0 ? product.discount_percentage : undefined}
                image={product.primary_image || product.images?.[0]?.image || "/placeholder.svg"}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
