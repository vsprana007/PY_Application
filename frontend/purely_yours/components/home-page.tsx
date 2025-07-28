"use client"

import { useState , useEffect} from "react"
import { ChevronRight } from "lucide-react"
import { ProductCard } from "./product-card"
import { TestimonialCard } from "./testimonial-card"
import { CategoryButton } from "./category-button"
import { ValueComboCard } from "./value-combo-card"
import { useProducts } from "@/hooks/use-products"
import Link from "next/link"
import type { Product, Category } from "@/hooks/use-products"

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("") // Default category
  const { categories, products, isLoading, error, fetchCategoryProducts, getFeaturedProducts, getBestsellers, getValueCombos } = useProducts()
  const [bestsellers, setBestsellers] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [valueCombos, setValueCombos] = useState<Product[]>([])
  const [loadingBestsellers, setLoadingBestsellers] = useState(true)
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [loadingValueCombos, setLoadingValueCombos] = useState(true)

  // Set first category as default when categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].slug)
    }
  }, [categories, selectedCategory])

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryProducts(selectedCategory)
    }
  }, [selectedCategory, fetchCategoryProducts])

  useEffect(() => {
    async function fetchBestsellers() {
      try {
        setLoadingBestsellers(true)
        const products = await getBestsellers()
        setBestsellers(products)
      } catch (error) {
        console.error("Failed to fetch bestsellers:", error)
      } finally {
        setLoadingBestsellers(false)
      }
    }
    fetchBestsellers()
  }, [getBestsellers])

  useEffect(() => {
    async function fetchFeatured() {
      try {
        setLoadingFeatured(true)
        const products = await getFeaturedProducts()
        setFeaturedProducts(products)
      } catch (error) {
        console.error("Failed to fetch featured products:", error)
      } finally {
        setLoadingFeatured(false)
      }
    }
    fetchFeatured()
  }, [getFeaturedProducts])

  useEffect(() => {
    async function fetchValueCombos() {
      try {
        setLoadingValueCombos(true)
        const products = await getValueCombos()
        setValueCombos(products)
      } catch (error) {
        console.error("Failed to fetch value combos:", error)
      } finally {
        setLoadingValueCombos(false)
      }
    }
    fetchValueCombos()
  }, [getValueCombos])

  // Show error message if there's an error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  


 
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Welcome Banner - Full Width with Responsive Padding */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 sm:p-6 lg:p-8 mx-4 sm:mx-6 lg:mx-8 xl:mx-12 rounded-lg">
        <div className="flex items-center">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold">
              Welcome to Purely Yours!
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">
              Discover natural wellness products for a healthier you
            </p>
            <Link href="/categories">
              <button className="mt-3 bg-green-600 text-white px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2 lg:py-3 rounded-full text-sm sm:text-base lg:text-lg">
                Shop Now
              </button>
            </Link>
          </div>
          <div className="w-1/3 md:w-1/4 lg:w-1/5">
            <img alt="Wellness" className="w-full" src="/placeholder.svg?height=100&width=100" />
          </div>
        </div>
      </div>

      {/* Categories - Full Width */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold mb-3">SELECT CATEGORY</h2>
        <div className="flex overflow-x-auto pb-2 gap-2 sm:gap-3 lg:gap-4 hide-scrollbar">
          {isLoading || categories.length === 0 ? (
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-full h-10 w-32 animate-pulse flex-shrink-0" />
              ))}
            </div>
          ) : (
            categories.map((category) => (
              <CategoryButton
                key={category.id}
                active={selectedCategory === category.slug}
                onClick={() => setSelectedCategory(category.slug)}
              >
                {category.name}
              </CategoryButton>
            ))
          )}
        </div>

        {/* Dynamic Category Products - Responsive Grid */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold">
              {selectedCategory && categories.find(cat => cat.slug === selectedCategory)?.name || "Products"}
            </h2>
            {selectedCategory && (
              <Link href={`/categories/${selectedCategory}`}>
                <button className="flex items-center text-sm sm:text-base lg:text-lg text-green-600 hover:text-green-700 transition-colors">
                  View all <ChevronRight size={16} />
                </button>
              </Link>
            )}
          </div>
          {isLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-64 w-56 flex-shrink-0 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>{selectedCategory ? "No products found in this category." : "Select a category to view products."}</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {products.map((product: Product) => (
                <div key={product.id} className="flex-shrink-0">
                  <ProductCard
                    id={product.id}
                    slug={product.slug}
                    productId={product.id}
                    name={product.name}
                    price={Number(product.price)}
                    originalPrice={Number(product.original_price)}
                    discount={product.discount_percentage}
                    image={product?.primary_image || "/placeholder.svg?height=200&width=200"}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Consultation Banner - Full Width */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 sm:p-6 lg:p-8 mx-4 sm:mx-6 lg:mx-8 xl:mx-12 rounded-lg">
        <div className="flex items-center">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold">
              Need Expert Advice?
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">Talk to our wellness consultants</p>
            <Link href="/consultation">
              <button className="mt-3 bg-green-600 text-white px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2 lg:py-3 rounded-full text-sm sm:text-base lg:text-lg">
                Book Consultation
              </button>
            </Link>
          </div>
          <div className="w-1/3 md:w-1/4 lg:w-1/5">
            <img alt="Doctor" className="w-full" src="/placeholder.svg?height=100&width=100" />
          </div>
        </div>
      </div>

      {/* Testimonials - Responsive Grid */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12 mt-2">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold">
            Real people, real stories
          </h2>
          <button className="flex items-center text-sm sm:text-base lg:text-lg text-green-600">
            View all <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          <TestimonialCard name="Rahul S." rating={5} review="Amazing natural products, highly recommended!" />
          <TestimonialCard
            name="Priya M."
            rating={5}
            review="The herbal supplements have improved my overall health significantly."
          />
          <TestimonialCard name="Amit K." rating={5} review="Excellent quality and fast delivery. Will order again!" />
        </div>
      </div>

      {/* Bestsellers */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12 mt-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold">Bestsellers</h2>
          <Link href="/categories">
            <button className="flex items-center text-sm sm:text-base lg:text-lg text-green-600 hover:text-green-700 transition-colors">
              View all <ChevronRight size={16} />
            </button>
          </Link>
        </div>

        {loadingBestsellers ? (
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64 w-56 flex-shrink-0 animate-pulse" />
            ))}
          </div>
        ) : bestsellers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No bestsellers available at the moment.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {bestsellers.map((product: Product) => (
              <div key={product.id} className="flex-shrink-0">
                <ProductCard
                  id={product.id}
                  productId={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={Number(product.price)}
                  originalPrice={Number(product.original_price)}
                  discount={product.discount_percentage}
                  image={product?.primary_image || "/placeholder.svg?height=200&width=200"}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Featured Products */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12 mt-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold">Featured Products</h2>
          <Link href="/search">
            <button className="flex items-center text-sm sm:text-base lg:text-lg text-green-600 hover:text-green-700 transition-colors">
              View all <ChevronRight size={16} />
            </button>
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64 w-56 flex-shrink-0 animate-pulse" />
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No featured products available at the moment.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {featuredProducts.map((product: Product) => (
              <div key={product.id} className="flex-shrink-0">
                <ProductCard
                  id={product.id}
                  productId={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={Number(product.price)}
                  originalPrice={Number(product.original_price)}
                  discount={product.discount_percentage}
                  image={product?.primary_image || "/placeholder.svg?height=200&width=200"}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Why Purely Yours - Responsive Layout */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12 mt-4">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold mb-4">Why Purely Yours?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                01
              </div>
              <div className="w-0.5 h-16 bg-green-100 mt-1 hidden md:block"></div>
            </div>
            <div className="flex-1">
              <div className="flex gap-3">
                <div>
                  <h3 className="font-medium text-sm sm:text-base lg:text-lg">SOURCED FROM NATURE</h3>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">
                    All products are made from natural ingredients sourced from trusted farmers.
                  </p>
                </div>
                <img
                  alt="SOURCED FROM NATURE"
                  className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain"
                  src="/placeholder.svg?height=60&width=60"
                />
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                02
              </div>
              <div className="w-0.5 h-16 bg-green-100 mt-1 hidden md:block"></div>
            </div>
            <div className="flex-1">
              <div className="flex gap-3">
                <div>
                  <h3 className="font-medium text-sm sm:text-base lg:text-lg">THE BEST INGREDIENTS</h3>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">
                    We use only the highest quality ingredients with proven efficacy.
                  </p>
                </div>
                <img
                  alt="THE BEST INGREDIENTS"
                  className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain"
                  src="/placeholder.svg?height=60&width=60"
                />
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                03
              </div>
            </div>
            <div className="flex-1">
              <div className="flex gap-3">
                <div>
                  <h3 className="font-medium text-sm sm:text-base lg:text-lg">BACKED BY SCIENCE & TRADITION</h3>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">
                    Our formulations combine ancient wisdom with modern scientific research.
                  </p>
                </div>
                <img
                  alt="BACKED BY SCIENCE & TRADITION"
                  className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain"
                  src="/placeholder.svg?height=60&width=60"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Combos - Responsive Grid */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12 mt-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold">Value Combos</h2>
          <Link href="/categories/value-combos">
            <button className="flex items-center text-sm sm:text-base lg:text-lg text-green-600 hover:text-green-700 transition-colors">
              View all <ChevronRight size={16} />
            </button>
          </Link>
        </div>
        
        {loadingValueCombos ? (
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64 w-56 flex-shrink-0 animate-pulse" />
            ))}
          </div>
        ) : valueCombos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No value combos available at the moment.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {valueCombos.map((product: Product) => (
              <div key={product.id} className="flex-shrink-0">
                <Link href={`/product/${product.slug}`}>
                  <ValueComboCard 
                    id={product.id}
                    name={product.name} 
                    price={Number(product.price)} 
                    originalPrice={Number(product.original_price)} 
                    discount={product.discount_percentage}
                    image={product?.primary_image || "/placeholder.svg?height=200&width=200"}
                  />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Learn More Banner - Full Width */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12 mt-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 sm:p-6 lg:p-8 rounded-lg flex items-center">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold">
              Learn more about Natural Wellness
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mt-1">
              Discover how our products can enhance your health journey
            </p>
            <Link href="/about">
              <button className="mt-3 bg-green-600 text-white px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2 lg:py-3 rounded-full text-sm sm:text-base lg:text-lg">
                Learn More
              </button>
            </Link>
          </div>
          <div className="w-1/3 md:w-1/4 lg:w-1/5">
            <img alt="Natural Wellness" className="w-full" src="/placeholder.svg?height=100&width=100" />
          </div>
        </div>
      </div>
    </div>
  )
}
