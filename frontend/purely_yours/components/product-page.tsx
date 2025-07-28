"use client"

import { useState, useEffect, use } from "react"
import { ArrowLeft, Heart, Minus, Plus, Star, Truck, Shield, RotateCcw, Share2, X, ChevronDown, FileText, Award, CheckCircle, Calendar, ThumbsUp, ShoppingCart, ChevronLeft, ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useProduct } from "@/hooks/use-products"
import type { ProductVariant } from "@/hooks/use-products"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { useWishlist } from "@/hooks/use-wishlist"
import { useReviews } from "@/hooks/use-reviews"
import { useBuyNow } from "@/hooks/use-buy-now"
import { formatCurrency, safeNumber, safeString, safeArray, safeGet, truncateText } from "@/lib/utils"
import { apiClient } from "@/lib/api"
import { ProductCard } from "./product-card"

interface ProductPageProps {
  productId: string
}

export function ProductPage({ productId }: ProductPageProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState("key_benefits")
  const { toggleWishlist, isInWishlist, isLoading: wishlistLoading } = useWishlist()
  const [showImageModal, setShowImageModal] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [mySelectedVariant, setMySelectedVariant] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [currentReviewPage, setCurrentReviewPage] = useState(0)
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchEndX, setTouchEndX] = useState(0)
  const [tabTouchStartX, setTabTouchStartX] = useState(0)
  const [tabTouchEndX, setTabTouchEndX] = useState(0)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsSummary, setReviewsSummary] = useState<any>({
    average_rating: 0,
    total_reviews: 0,
    rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    verified_buyers: 0,
    verified_buyer_percentage: 0
  })
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false)
  const [loadingRelated, setLoadingRelated] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [reviewsPage, setReviewsPage] = useState(1)
  const [hasMoreReviews, setHasMoreReviews] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageModal, setMessageModal] = useState({
    type: 'success' as 'success' | 'error' | 'info',
    title: '',
    message: ''
  })
  const { addToCart, isLoading: cartLoading, getCartItemCount } = useCart()
  const { isAuthenticated } = useAuth()
  const { buyNow, isLoading: buyNowLoading } = useBuyNow()
  
  // Track scroll position for review indicators
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const container = e.target as HTMLElement
      const containerWidth = container.offsetWidth
      const scrollLeft = container.scrollLeft
      const currentPage = Math.round(scrollLeft / containerWidth)
      setCurrentReviewPage(currentPage)
    }

    let timeoutId: NodeJS.Timeout
    const handleScrollDebounced = (e: Event) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => handleScroll(e), 50)
    }

    const reviewsContainer = document.querySelector('.reviews-scroll-container')
    if (reviewsContainer) {
      reviewsContainer.addEventListener('scroll', handleScrollDebounced, { passive: true })
      return () => {
        reviewsContainer.removeEventListener('scroll', handleScrollDebounced)
        clearTimeout(timeoutId)
      }
    }
  }, [reviews])

  // Touch event handlers for better swipe control
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return
    
    const distance = touchStartX - touchEndX
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    
    const reviewsContainer = document.querySelector('.reviews-scroll-container') as HTMLElement
    if (reviewsContainer) {
      const containerWidth = reviewsContainer.offsetWidth
      const maxPages = Math.ceil((showAllReviews ? reviews : reviews.slice(0, 9)).length / 3)
      
      if (isLeftSwipe && currentReviewPage < maxPages - 1) {
        const nextPage = currentReviewPage + 1
        reviewsContainer.scrollTo({
          left: nextPage * containerWidth,
          behavior: 'smooth'
        })
      } else if (isRightSwipe && currentReviewPage > 0) {
        const prevPage = currentReviewPage - 1
        reviewsContainer.scrollTo({
          left: prevPage * containerWidth,
          behavior: 'smooth'
        })
      }
    }
  }
  
  // Tab navigation functions
  const goToPreviousTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id)
    }
  }

  const goToNextTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id)
    }
  }

  // Tab content touch event handlers
  const handleTabTouchStart = (e: React.TouchEvent) => {
    setTabTouchStartX(e.touches[0].clientX)
  }

  const handleTabTouchMove = (e: React.TouchEvent) => {
    setTabTouchEndX(e.touches[0].clientX)
  }

  const handleTabTouchEnd = () => {
    if (!tabTouchStartX || !tabTouchEndX) return
    
    const distance = tabTouchStartX - tabTouchEndX
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    
    if (isLeftSwipe) {
      goToNextTab()
    } else if (isRightSwipe) {
      goToPreviousTab()
    }
  }
  
  // Image navigation functions
  const goToPreviousImage = () => {
    const totalImages = product?.images?.length || 0
    if (totalImages > 0) {
      setSelectedImage((prev) => (prev === 0 ? totalImages - 1 : prev - 1))
    }
  }

  const goToNextImage = () => {
    const totalImages = product?.images?.length || 0
    if (totalImages > 0) {
      setSelectedImage((prev) => (prev === totalImages - 1 ? 0 : prev + 1))
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (showImageModal) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          goToPreviousImage()
        } else if (event.key === 'ArrowRight') {
          event.preventDefault()
          goToNextImage()
        } else if (event.key === 'Escape') {
          event.preventDefault()
          setShowImageModal(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showImageModal])
  
  // Use backend
  const { product, isLoading, error } = useProduct(productId)

  // Initialize selected variant when product loads
  useEffect(() => {
    if (product?.variants && product.variants.length > 0 && !selectedVariant) {
      setSelectedVariant(product.variants[0])
    }
  }, [product, selectedVariant])

  // Reset reviews state when product changes
  useEffect(() => {
    if (product?.id) {
      setShowAllReviews(false)
      setReviewsPage(1)
      setHasMoreReviews(false)
    }
  }, [product?.id])

  // Fetch reviews when product loads
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.id) return
      
      // Only show loading spinner on initial load, not on "Load More"
      if (reviewsPage === 1) {
        setLoadingReviews(true)
      } else {
        setLoadingMoreReviews(true)
      }
      
      try {
        const [reviewsData, summaryData] = await Promise.all([
          apiClient.getProductReviews(product.id, { page: reviewsPage, page_size: 10 }),
          apiClient.getProductReviewsSummary(product.id)
        ])
        
        if (reviewsPage === 1) {
          setReviews(reviewsData.results || [])
        } else {
          setReviews(prev => [...prev, ...(reviewsData.results || [])])
        }
        
        setReviewsSummary(summaryData)
        setHasMoreReviews(!!reviewsData.next)
      } catch (error) {
        console.error("Failed to fetch reviews:", error)
        if (reviewsPage === 1) {
          setReviews([])
          setReviewsSummary({
            average_rating: 0,
            total_reviews: 0,
            rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            verified_buyers: 0,
            verified_buyer_percentage: 0
          })
        }
      } finally {
        setLoadingReviews(false)
        setLoadingMoreReviews(false)
      }
    }

    fetchReviews()
  }, [product?.id, reviewsPage])

  // Fetch related products based on tags
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?.tags || product.tags.length === 0) return
      
      setLoadingRelated(true)
      try {
        // Get the first tag slug to find related products
        const primaryTag = product.tags[0]?.slug
        if (primaryTag) {
          const relatedData = await apiClient.getTagProducts(primaryTag, { page: 1 })
          // Filter out the current product and limit to 4 items
          const filtered = relatedData.results
            .filter((p: any) => p.id !== product.id)
            .slice(0, 4)
          setRelatedProducts(filtered)
        }
      } catch (error) {
        console.error("Failed to fetch related products:", error)
        // Fallback: fetch some featured products
        try {
          const featuredProducts = await apiClient.getFeaturedProducts()
          setRelatedProducts(featuredProducts.slice(0, 4))
        } catch (fallbackError) {
          console.error("Failed to fetch featured products as fallback:", fallbackError)
          setRelatedProducts([])
        }
      } finally {
        setLoadingRelated(false)
      }
    }

    fetchRelatedProducts()
  }, [product?.id, product?.tags])


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

  const handleBuyNow = async () => {
    if (!product?.id) return
    await buyNow(product, selectedVariant, quantity)
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name || "Product",
        text: product?.description || "Check out this product",
        url: window.location.href,
      })
    }
  }

  const handleViewAllReviews = () => {
    setShowAllReviews(true)
  }

  const handleLoadMoreReviews = () => {
    if (hasMoreReviews && !loadingReviews && !loadingMoreReviews) {
      setLoadingMoreReviews(true)
      setReviewsPage(prev => prev + 1)
    }
  }

  const handleCollapseReviews = () => {
    setShowAllReviews(false)
    setReviewsPage(1)
    // Reset reviews to first page
    if (product?.id) {
      apiClient.getProductReviews(product.id, { page: 1, page_size: 10 })
        .then(reviewsData => {
          setReviews(reviewsData.results || [])
          setHasMoreReviews(!!reviewsData.next)
        })
        .catch(error => console.error("Failed to reset reviews:", error))
    }
  }

  // Review creation functions
  const handleReviewSubmit = async () => {
    if (!isAuthenticated) {
      showMessage('error', 'Authentication Required', 'Please login to submit a review')
      return
    }

    if (!product?.id || !reviewForm.title.trim() || !reviewForm.comment.trim()) {
      showMessage('error', 'Missing Information', 'Please fill in all required fields')
      return
    }

    setSubmittingReview(true)
    try {
      // Get token from localStorage - check multiple possible keys
      const token = localStorage.getItem('authToken') || 
                   localStorage.getItem('token') || 
                   localStorage.getItem('access_token')
      
      if (!token) {
        showMessage('error', 'Authentication Required', 'Please login to submit a review')
        setSubmittingReview(false)
        return
      }

      // Use the specific endpoint as mentioned in the user's request
      const response = await fetch(`http://localhost:8000/api/reviews/product/${product.id}/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment
        })
      })

      if (response.ok) {
        const newReview = await response.json()
        
        // Add new review to the beginning of the reviews array
        setReviews(prev => [newReview, ...prev])
        
        // Update reviews summary
        setReviewsSummary((prev: any) => ({
          ...prev,
          total_reviews: prev.total_reviews + 1,
          average_rating: ((prev.average_rating * prev.total_reviews) + reviewForm.rating) / (prev.total_reviews + 1),
          rating_distribution: {
            ...prev.rating_distribution,
            [reviewForm.rating]: (prev.rating_distribution[reviewForm.rating] || 0) + 1
          }
        }))
        
        // Reset form and close modal
        setReviewForm({
          rating: 5,
          title: '',
          comment: ''
        })
        setShowReviewModal(false)
        showMessage('success', 'Review Submitted!', 'Thank you for sharing your experience with this product.')
        
        // Refresh reviews to get latest data from server
        try {
          const [reviewsData, summaryData] = await Promise.all([
            apiClient.getProductReviews(product.id, { page: 1, page_size: 10 }),
            apiClient.getProductReviewsSummary(product.id)
          ])
          
          setReviews(reviewsData.results || [])
          setReviewsSummary(summaryData)
          setHasMoreReviews(!!reviewsData.next)
          setReviewsPage(1)
        } catch (refreshError) {
          console.error('Failed to refresh reviews:', refreshError)
          // Keep the optimistic update if refresh fails
        }
        
      } else {
        const errorData = await response.json()
        console.error('Review submission failed:', errorData)
        
        if (response.status === 401) {
          showMessage('error', 'Session Expired', 'Your session has expired. Please login again.')
          // Clear invalid tokens
          localStorage.removeItem('authToken')
          localStorage.removeItem('token')
          localStorage.removeItem('access_token')
        } else {
          showMessage('error', 'Submission Failed', errorData.detail || errorData.message || 'Failed to submit review. Please try again.')
        }
      }
      
    } catch (error: any) {
      console.error('Error submitting review:', error)
      showMessage('error', 'Network Error', 'Failed to submit review. Please check your connection and try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleReviewFormChange = (field: string, value: any) => {
    setReviewForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Helper function to show message modal
  const showMessage = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setMessageModal({ type, title, message })
    setShowMessageModal(true)
  }

  const tabs = [
    { id: "key_benefits", label: "Key Benefits" },
    { id: "who_should_take", label: "Who Should Take It?" },
    { id: "how_to_consume", label: "How to Consume" },
    { id: "how_it_helps", label: "How Does It Help?" },
    { id: "key_ingredients", label: "Key Ingredients" },
  ]

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10">
          <button onClick={() => router.back()} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-md animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10">
          <button onClick={() => router.back()} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold flex-1">Product Not Found</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                <X size={48} className="text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => router.push("/")}
              className="bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10">
          <button onClick={() => router.back()} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold flex-1">Product Not Found</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push("/")}
              className="bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom CSS for enhanced scroll snapping */}
      <style jsx>{`
        .reviews-scroll-container {
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        
        .reviews-scroll-container > div {
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
        
        .reviews-scroll-container::-webkit-scrollbar {
          display: none;
        }
        
        .reviews-scroll-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Tab navigation scroll snapping */
        .snap-x {
          scroll-snap-type: x proximity;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        
        .snap-start {
          scroll-snap-align: start;
        }
        
        .snap-proximity {
          scroll-snap-type: x proximity;
        }
        
        /* Hide scrollbar for tab navigation */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Tab content swipe hint */
        .tab-content-swipe {
          position: relative;
          touch-action: pan-x;
        }
        
        .tab-content-swipe::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .tab-content-swipe:active::before {
          opacity: 0.1;
          background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.1), transparent);
        }
      `}</style>
      
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10">
        <button onClick={() => router.back()} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold flex-1 truncate">{truncateText(product?.name, 40)}</h1>
        <button 
          onClick={() => router.push("/cart")} 
          className="relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 active:scale-95 group"
        >
          <ShoppingCart 
            size={24} 
            className="text-gray-700 group-hover:text-green-600 transition-colors duration-200" 
          />
          {getCartItemCount() > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 border-2 border-white shadow-sm animate-pulse">
              {getCartItemCount() > 99 ? '99+' : getCartItemCount()}
            </span>
          )}
        </button>
      </div>
      {/* Container with reduced spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative group">
              <div className="aspect-square bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <img
                  src={product?.images?.[selectedImage]?.image || "/placeholder.svg"}
                  alt={product?.name || "Product Image"}
                  className="w-full h-full object-contain cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
                  onClick={() => setShowImageModal(true)}
                />

                {/* Image Navigation Buttons */}
                {product?.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={goToPreviousImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 hover:bg-white"
                    >
                      <ChevronLeft size={20} className="text-gray-700" />
                    </button>
                    <button
                      onClick={goToNextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 hover:bg-white"
                    >
                      <ChevronRight size={20} className="text-gray-700" />
                    </button>
                  </>
                )}

                {/* Image Counter - Dots */}
                {product?.images && product.images.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {product.images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          selectedImage === index ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-md shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                  >
                    <Heart
                      size={24}
                      className={`${product?.id !== undefined && isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400"} transition-colors`}
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-md shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Share2 size={18} className="text-gray-600" />
                  </button>
                </div>

                {/* Discount Badge */}
                {selectedVariant && selectedVariant.discount_percentage > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
                    {selectedVariant.discount_percentage}% OFF
                  </div>
                )}

                {/* Stock Warning */}
                {selectedVariant && selectedVariant.stock_quantity < 10 && (
                  <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-md text-sm font-medium">
                    Only {selectedVariant.stock_quantity} left!
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {product?.images?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage === index ? "border-green-500 shadow-md" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={image?.image  || "/placeholder.svg"}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-contain bg-white"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{product?.name}</h1>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                  SKU: {selectedVariant?.sku}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.floor(reviewsSummary?.average_rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900">{reviewsSummary?.average_rating?.toFixed(1) ?? 0}</span>
                </div>
                <span className="text-gray-600">({reviewsSummary?.total_reviews || 0} reviews)</span>
                <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-md">✓ Verified</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-green-600">₹{selectedVariant?.price}</span>
                {selectedVariant?.original_price !== undefined &&
                  selectedVariant?.price !== undefined &&
                  selectedVariant.original_price > selectedVariant.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">₹{selectedVariant.original_price}</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md font-semibold text-sm">
                      Save ₹{Number(selectedVariant.original_price ?? 0) - Number(selectedVariant.price ?? 0)}
                    </span>
                  </>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {((product?.tags ?? [])).map((tag) => (
                  <span
                    key={tag.id}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm font-medium"
                  >
                    {tag.name}
                  </span>
                ))}
                
              </div>
            </div>

            {/* Variant Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Choose Size:</h3>
              <div className="grid grid-cols-1 gap-2">
                {(product?.variants ?? []).map((variant, index) => (
                  <button
                    key={variant.id}
                    className={`p-3 rounded-md border-2 text-left transition-all duration-200 ${
                      selectedVariant?.id === variant.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedVariant(variant)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">{variant.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-bold text-green-600">₹{variant.price}</span>
                          {variant.original_price > variant.price && (
                            <>
                              <span className="text-sm text-gray-500 line-through">₹{variant.original_price}</span>
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                                {variant.discount_percentage}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {variant.name.includes("Best Value") && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-xs font-medium">
                          Best Value
                        </span>
                      )}
                    </div>
                  </button>
                ))}

              </div>
            </div>

            {/* Stock Alert */}
            {selectedVariant && selectedVariant.stock_quantity < 10 && (
              <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                <p className="text-orange-800 font-semibold flex items-center gap-2">
                  ⚠️ Hurry! Only {selectedVariant.stock_quantity} items left in stock
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Quantity:</span>
                <div className="flex items-center bg-white border border-gray-200 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 border-x border-gray-200 min-w-[60px] text-center font-semibold">
                    {quantity}
                  </span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-50 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-100 rounded-md">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center mx-auto">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Free Delivery</p>
                  <p className="text-xs text-gray-600">Above ₹500</p>
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center mx-auto">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Secure Payment</p>
                  <p className="text-xs text-gray-600">100% Safe</p>
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center mx-auto">
                  <RotateCcw className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Easy Returns</p>
                  <p className="text-xs text-gray-600">7 Days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description Section */}
        <div className="mb-10">
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Product Description</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">{product?.description}</p>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden mb-10">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {/* Mobile Swipe Indicator */}
            <div className="sm:hidden text-center py-1">
              <div className="inline-flex items-center gap-1 text-xs text-gray-400">
                <span>Swipe content below to switch tabs</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div 
            className="p-6 tab-content-swipe"
            onTouchStart={handleTabTouchStart}
            onTouchMove={handleTabTouchMove}
            onTouchEnd={handleTabTouchEnd}
          >
            {activeTab === "key_benefits" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Benefits</h3>
                <div className="space-y-3 mb-6">
                  {(product?.key_benefits ?? []).map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-md">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Disclaimer</h4>
                  <p className="text-yellow-800 text-sm">{product?.disclaimer}</p>
                </div>
              </div>
            )}

            {activeTab === "key_ingredients" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Ingredients</h3>
                <div className="space-y-4">
                  {(product?.key_ingredients ?? []).map((ingredient, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{ingredient.name}</h4>
                      <p className="text-gray-600 text-sm">{ingredient.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "how_to_consume" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Consume</h3>
                <div className="space-y-3">
                  {(product?.how_to_consume ?? []).map((instruction, index) => (
                    <div key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-md flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </span>
                      <span className="text-gray-600 text-sm pt-0.5">{instruction}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "who_should_take" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Who Should Take It?</h3>
                <div className="space-y-2">
                  {(product?.who_should_take ?? []).map((person, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                      <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                      <span className="text-gray-700 text-sm">{person}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "how_it_helps" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">How Does It Help?</h3>
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-md p-6">
                  <p className="text-gray-700 leading-relaxed">{product?.how_it_helps}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analytical Report Section */}
        {product?.analytical_report && (
          <div className="mb-10">
            <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-600 text-white p-4">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-bold">Analytical Report</h2>
                    <p className="text-blue-100 text-sm">Third-party lab tested for purity and potency</p>
                  </div>
                </div>
              </div>

              <div className="">
                <div className="flex justify-center">
                  <div className="w-full ">
                    <div className="relative group cursor-pointer" onClick={() => setShowReportModal(true)}>
                      <img
                        src={product?.analytical_report || "/placeholder.svg"}
                        alt="Analytical Report Certificate"
                        className="w-full h-auto  shadow-lg border border-gray-200 transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Zoom indicator */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-md flex items-center justify-center">
                        <div className="bg-white bg-opacity-90 px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-sm font-medium text-gray-700">Click to zoom</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-3">
                      Official analytical report certificate from certified laboratory
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Reviews Section */}
        <div className="mb-10">
          <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <h2 className="text-xl font-bold text-gray-900">Customer Reviews ({reviewsSummary?.total_reviews || 0})</h2>
                </div>
                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors text-sm w-full sm:w-auto"
                >
                  Write a Review
                </button>
              </div>

              {/* Review Summary */}
              {reviewsSummary?.total_reviews > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-gray-900">{reviewsSummary.average_rating?.toFixed(1)}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.floor(reviewsSummary.average_rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Based on {reviewsSummary.total_reviews} reviews
                    </div>
                  </div>
                  
                  {/* Rating Distribution */}
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-8">{rating}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ 
                              width: `${reviewsSummary.total_reviews > 0 ? (reviewsSummary.rating_distribution[rating] / reviewsSummary.total_reviews) * 100 : 0}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">{reviewsSummary.rating_distribution[rating]}</span>
                      </div>
                    ))}
                  </div>
                  
                  {reviewsSummary.verified_buyer_percentage > 0 && (
                    <div className="mt-3 text-sm text-green-600">
                      {reviewsSummary.verified_buyer_percentage.toFixed(1)}% of reviews are from verified buyers
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile: Horizontal Scroll, Desktop: Grid */}
            <div className="p-4 sm:p-6">
              {loadingReviews ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                <>
                  {/* Mobile Layout */}
                  <div className="block sm:hidden">
                    <div 
                      className="reviews-scroll-container flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory" 
                      style={{ scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      {/* Create groups of 3 reviews */}
                      {Array.from({ length: Math.ceil((showAllReviews ? reviews : reviews.slice(0, 9)).length / 3) }, (_, groupIndex) => (
                        <div
                          key={groupIndex}
                          className="flex-shrink-0 w-full space-y-3 snap-start"
                          style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
                        >
                          {(showAllReviews ? reviews : reviews.slice(0, 9))
                            .slice(groupIndex * 3, (groupIndex + 1) * 3)
                            .map((review) => (
                              <div
                                key={review.review_id}
                                className="border border-gray-200 rounded-md p-3 bg-gray-50"
                              >
                                {/* Header */}
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center flex-shrink-0">
                                    <span className="text-green-700 font-semibold text-xs">{review.author?.charAt(0) || 'U'}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-gray-900 text-sm truncate">{review.author}</span>
                                      {review.verified_buyer && (
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium flex-shrink-0">
                                          ✓
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                            key={star}
                                            className={`w-3 h-3 ${
                                              star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {new Date(review.timestamp).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Title */}
                                {review.title && (
                                  <h4 className="font-medium text-gray-900 text-sm mb-2">{review.title}</h4>
                                )}

                                {/* Comment */}
                                <p className="text-gray-600 text-sm leading-relaxed mb-2 line-clamp-2">{review.body}</p>

                                {/* Source */}
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-400 capitalize">via {review.source}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                    
                    {/* Improved Scroll Indicators */}
                    {Math.ceil((showAllReviews ? reviews : reviews.slice(0, 9)).length / 3) > 1 && (
                      <div className="flex flex-col items-center mt-3 mb-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <ChevronLeft size={12} className="text-gray-400" />
                            <span>Swipe</span>
                            <ChevronRight size={12} className="text-gray-400" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons for Mobile */}
                    <div className="flex justify-center mt-2 space-x-2">
                      {!showAllReviews && reviews.length > 9 && (
                        <button 
                          onClick={handleViewAllReviews}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors text-sm"
                        >
                          View All Reviews
                        </button>
                      )}
                      
                      {showAllReviews && (
                        <>
                          <button 
                            onClick={handleCollapseReviews}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors text-sm"
                          >
                            Show Less
                          </button>
                          
                          {hasMoreReviews && (
                            <button 
                              onClick={handleLoadMoreReviews}
                              disabled={loadingMoreReviews}
                              className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
                            >
                              {loadingMoreReviews && (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              )}
                              {loadingMoreReviews ? "Loading..." : "Load More"}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    
                    {/* Loading indicator for additional reviews */}
                    {loadingMoreReviews && (
                      <div className="flex justify-center mt-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                          <span className="text-xs">Loading more reviews...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:block">
                    <div className="space-y-4">
                      {(showAllReviews ? reviews : reviews.slice(0, 5)).map((review) => (
                        <div key={review.review_id} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                          {/* Header */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center flex-shrink-0">
                              <span className="text-green-700 font-semibold text-sm">{review.author?.charAt(0) || 'U'}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{review.author}</span>
                                {review.verified_buyer && (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                    ✓ Verified Buyer
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
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
                                <span className="text-sm text-gray-500">
                                  {new Date(review.timestamp).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-gray-400 capitalize">via {review.source}</span>
                              </div>
                            </div>
                          </div>

                          {/* Title */}
                          {review.title && (
                            <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                          )}

                          {/* Comment */}
                          <p className="text-gray-600 leading-relaxed">{review.body}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Action Buttons for Desktop */}
                    <div className="flex justify-center mt-6 space-x-4">
                      {!showAllReviews && reviews.length > 5 && (
                        <button 
                          onClick={handleViewAllReviews}
                          className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors"
                        >
                          View All Reviews
                        </button>
                      )}
                      
                      {showAllReviews && (
                        <>
                          <button 
                            onClick={handleCollapseReviews}
                            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors"
                          >
                            Show Less
                          </button>
                          
                          {hasMoreReviews && (
                            <button 
                              onClick={handleLoadMoreReviews}
                              disabled={loadingMoreReviews}
                              className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                              {loadingMoreReviews && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              )}
                              {loadingMoreReviews ? "Loading..." : "Load More"}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    
                    {/* Loading indicator for additional reviews */}
                    {loadingMoreReviews && (
                      <div className="flex justify-center mt-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          <span className="text-sm">Loading more reviews...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="mb-10">
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {((product?.faqs ?? [])).map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="font-semibold text-gray-900 pr-4 text-sm">{faq.question}</h4>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                        expandedFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedFaq === index && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <p className="text-gray-600 text-sm leading-relaxed pt-3">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12 mb-20">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Related Products</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((product) => (
      
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
            ))}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full group">
            {/* Close Button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-md p-2 z-10 hover:bg-opacity-70 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Navigation Buttons */}
            {product?.images && product.images.length > 1 && (
              <>
                <button
                  onClick={goToPreviousImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-3 z-10 hover:bg-opacity-70 transition-all duration-200"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={goToNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-3 z-10 hover:bg-opacity-70 transition-all duration-200"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Main Image */}
            <img
              src={product?.images?.[selectedImage]?.image || "/placeholder.svg"}
              alt={product?.name || "Product Image"}
              className="max-w-full max-h-full object-contain rounded-md"
            />

            {/* Image Counter */}
            {product?.images && product.images.length > 1 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-2 rounded-md z-10">
                <span className="text-sm font-medium">
                  {selectedImage + 1} of {product.images.length}
                </span>
              </div>
            )}

            {/* Thumbnail Navigation */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {product?.images?.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    selectedImage === index ? "bg-white" : "bg-white bg-opacity-50 hover:bg-opacity-75"
                  }`}
                />
              ))}
            </div>

            {/* Keyboard hint */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white text-xs opacity-75">
              Use arrow keys to navigate • Press ESC to close
            </div>
          </div>
        </div>
      )}

      {/* Analytical Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-6xl max-h-full flex items-center justify-center">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-md p-2 z-10 hover:bg-opacity-70 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={product?.analytical_report || "/placeholder.svg"}
                alt="Analytical Report Certificate - Full Size"
                className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
              />

              {/* Info overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-md">
                <p className="text-sm text-center">Official Analytical Report Certificate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Action Bar for All Devices */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-lg">
        <div className="flex gap-2 max-w-md mx-auto">
          <button
            onClick={handleAddToCart}
            disabled={cartLoading}
            className="flex-1 bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cartLoading ? "Adding..." : "Add to Cart"}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={cartLoading || buyNowLoading}
            className="flex-1 bg-orange-500 text-white py-3 rounded-md font-semibold hover:bg-orange-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {buyNowLoading ? "Processing..." : "Buy Now"}
          </button>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Rating Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleReviewFormChange('rating', star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewForm.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => handleReviewFormChange('title', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Give your review a title..."
                />
              </div>

              {/* Comment Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => handleReviewFormChange('comment', e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Share your experience with this product..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewSubmit}
                  disabled={submittingReview || !reviewForm.title.trim() || !reviewForm.comment.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  messageModal.type === 'success' ? 'bg-green-100' : 
                  messageModal.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {messageModal.type === 'success' && (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {messageModal.type === 'error' && (
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {messageModal.type === 'info' && (
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${
                    messageModal.type === 'success' ? 'text-green-800' : 
                    messageModal.type === 'error' ? 'text-red-800' : 'text-blue-800'
                  }`}>
                    {messageModal.title}
                  </h3>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {messageModal.message}
              </p>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    messageModal.type === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' : 
                    messageModal.type === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' : 
                    'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}