"use client"

import { useState, useEffect, use } from "react"
import { ArrowLeft, Heart, Minus, Plus, Star, Truck, Shield, RotateCcw, Share2, X, ChevronDown, FileText, Award, CheckCircle, Calendar, ThumbsUp, ShoppingCart,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useProduct } from "@/hooks/use-products"
import type { ProductVariant } from "@/hooks/use-products"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { useWishlist } from "@/hooks/use-wishlist"
import { formatCurrency, safeNumber, safeString, safeArray, safeGet, truncateText } from "@/lib/utils"

interface ProductPageProps {
  productId: string
}

export function ProductPage({ productId }: ProductPageProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState("key_benefits")
  const { toggleWishlist, isInWishlist, isLoading: wishlistLoading } = useWishlist()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [mySelectedVariant, setMySelectedVariant] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const { addToCart, isLoading: cartLoading, getCartItemCount } = useCart()
  const { isAuthenticated } = useAuth()
  
  


  //use backend
  const { product, isLoading, error } = useProduct(productId)

  // Mock myProduct data with variants
  const myProduct = {
    id: productId,
    name: "Purely Yours Shilajit - Premium Himalayan Extract",
    variants: [
      {
        id: 1,
        name: "30 Capsules",
        price: 925,
        originalPrice: 995,
        discount: 7,
        stockCount: 25,
        sku: "PY-SH-30-001",
      },
      {
        id: 2,
        name: "60 Capsules",
        price: 1650,
        originalPrice: 1890,
        discount: 13,
        stockCount: 18,
        sku: "PY-SH-60-001",
      },
      {
        id: 3,
        name: "90 Capsules (Best Value)",
        price: 2299,
        originalPrice: 2785,
        discount: 17,
        stockCount: 12,
        sku: "PY-SH-90-001",
      },
    ],
    rating: 4.5,
    reviews: 128,
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    analyticalReport: "/images/analytical-report.webp",
    description:
      "Purely Yours Shilajit is a premium supplement formulated with pure Himalayan Shilajit Extract containing 80%+ Fulvic Acid, combined with KSM-66 Ashwagandha and Safed Musli. This powerful blend harnesses the ancient wisdom of Ayurveda to support energy, strength, and vitality. Our carefully sourced key_ingredients work synergistically to enhance your overall well-being and active lifestyle.",
    keyBenefits: [
      "Supports an active lifestyle & vitality",
      "Assists in maintaining natural energy levels",
      "Helps with muscle strength & post-workout recovery",
      "Aids overall wellness",
      "Ideal as a workout companion",
    ],
    disclaimer:
      "Individual results may vary depending on diet, exercise, and lifestyle. This myProduct is not intended to diagnose, treat, cure, or prevent any disease.",
    who_should_take: [
      "Men looking to naturally support endurance",
      "Anyone seeking a balanced way to help boost stamina",
      "Individuals aiming to enhance daily performance",
    ],
    how_to_consume: [
      "Take 1 capsule twice a day (after breakfast and dinner) with warm milk or warm water.",
      "For personalized guidance, especially if you have a medical condition, consult your healthcare professional.",
    ],
    how_it_helps:
      "Purely Yours Shilajit is formulated using pure Himalayan Shilajit Extract (80%+ Fulvic Acid), KSM-66 Ashwagandha, and Safed Musli. In Ayurveda, these herbs are revered for their synergy in supporting energy, strength, and vitality. Notably, KSM-66 Ashwagandha is a high-concentration, full-spectrum extract studied for its potential to bolster endurance and strength—making this blend an excellent choice for those seeking an active and energetic lifestyle.",
    keyIngredients: [
      {
        name: "Pure Shilajit",
        description: "Fuels drive and keeps you going strong",
      },
      {
        name: "KSM 66- Ashwagandha",
        description: "Helps stay cool, calm, and ready to take on the day",
      },
      {
        name: "Safed Musli",
        description: "Keeps spirits high and muscles mighty",
      },
    ],
    inStock: true,
    category: "Energy & Vitality",
    tags: ["Natural", "Ayurvedic", "Energy Booster", "Himalayan"],
    faqs: [
      {
        question: "What makes this Shilajit different from others?",
        answer:
          "Our Shilajit contains 80%+ Fulvic Acid, sourced directly from the Himalayas, and is combined with clinically studied KSM-66 Ashwagandha and Safed Musli for enhanced key_benefits. Each batch is third-party tested for purity and potency.",
      },
      {
        question: "How long does it take to see results?",
        answer:
          "Most users notice increased energy levels within 2-3 weeks of consistent use. For optimal key_benefits including strength and vitality improvements, we recommend using for 2-3 months consistently.",
      },
      {
        question: "Can women take this supplement?",
        answer:
          "While this formula is primarily designed for men's health needs, women can also benefit from Shilajit's energy-supporting properties. However, we recommend consulting with a healthcare provider before use.",
      },
      {
        question: "Are there any side effects?",
        answer:
          "Our myProduct is made from natural key_ingredients and is generally well-tolerated. Some people may experience mild digestive discomfort initially. If you experience any adverse effects, discontinue use and consult your doctor.",
      },
      {
        question: "Can I take this with other supplements?",
        answer:
          "Generally, yes. However, if you're taking other supplements or medications, especially for blood pressure or diabetes, consult your healthcare provider before combining products.",
      },
      {
        question: "What is KSM-66 Ashwagandha?",
        answer:
          "KSM-66 is a high-concentration, full-spectrum Ashwagandha extract that has been clinically studied for its key_benefits on strength, endurance, and stress management. It's considered the gold standard of Ashwagandha extracts.",
      },
      {
        question: "How should I store the myProduct?",
        answer:
          "Store in a cool, dry place away from direct sunlight and moisture. Keep the bottle tightly closed and out of reach of children. Do not refrigerate.",
      },
      {
        question: "Is this myProduct vegetarian/vegan?",
        answer:
          "Yes, our myProduct is 100% vegetarian. The capsules are made from vegetarian cellulose, and all key_ingredients are plant-based.",
      },
    ],
  }

  const reviews = [
    {
      id: "1",
      user: "Arjun Sharma",
      rating: 5,
      comment:
        "Amazing myProduct! I've been using it for 6 weeks and my energy levels have significantly improved. No more afternoon crashes and my workout performance has enhanced noticeably.",
      date: "2024-01-10",
      verified: true,
      helpful: 18,
      avatar: "AS",
    },
    {
      id: "2",
      user: "Vikram Singh",
      rating: 5,
      comment:
        "Best Shilajit supplement I've tried. The combination with Ashwagandha makes a real difference. Feeling more energetic and focused throughout the day.",
      date: "2024-01-08",
      verified: true,
      helpful: 12,
      avatar: "VS",
    },
    {
      id: "3",
      user: "Rohit Kumar",
      rating: 4,
      comment:
        "Good quality myProduct. Takes about 3 weeks to show full effects but worth the wait. My stamina has improved and I feel more confident.",
      date: "2024-01-05",
      verified: true,
      helpful: 9,
      avatar: "RK",
    },
    {
      id: "4",
      user: "Manish Patel",
      rating: 5,
      comment:
        "Excellent results! My gym performance has improved significantly. The 90-capsule pack is great value for money. Highly recommended for active men.",
      date: "2024-01-03",
      verified: true,
      helpful: 15,
      avatar: "MP",
    },
  ]

  const relatedProducts = [
    {
      id: "2",
      name: "Testosterone Booster Natural",
      price: 799,
      originalPrice: 999,
      discount: 20,
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.3,
    },
    {
      id: "3",
      name: "Ashwagandha KSM-66",
      price: 649,
      originalPrice: 799,
      discount: 19,
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.4,
    },
    {
      id: "4",
      name: "Energy & Stamina Combo",
      price: 1499,
      originalPrice: 1899,
      discount: 21,
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.6,
    },
  ]

  const myCurrentVariant = myProduct.variants[mySelectedVariant]
  // const selectedVariant = product?.variants?.[selectedVariant] ?? 0

  // ...existing code...
  useEffect(() => {
    if (!selectedVariant && product?.variants?.length) {
      setSelectedVariant(product.variants[0])
    }
  }, [product])
  // ...existing code...

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

  const handleBuyNow = () => {
    router.push("/checkout")
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
        title: myProduct.name,
        text: myProduct.description,
        url: window.location.href,
      })
    }
  }

  const tabs = [
    { id: "key_benefits", label: "Key Benefits" },
    { id: "who_should_take", label: "Who Should Take It?" },
    { id: "how_to_consume", label: "How to Consume" },
    { id: "how_it_helps", label: "How Does It Help?" },
    { id: "key_ingredients", label: "Key Ingredients" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10">
        <button onClick={() => router.back()} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold flex-1 truncate">{truncateText(product?.name, 40)}</h1>
        <button onClick={() => router.push("/cart")} className="relative">
          <ShoppingCart size={24} />
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-semibold rounded-full px-1.5 py-0.5">
            {getCartItemCount()}
          </span>
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
                  className="w-full h-full object-contain p-6 cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
                  onClick={() => setShowImageModal(true)}
                />

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={handleWishlistToggle}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-md shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Heart
                      size={24}
                      className={`${product?.id !== undefined && isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"} transition-colors`}
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
                    className="w-full h-full object-contain p-1 bg-white"
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
                          star <= Math.floor(product?.average_rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900">{product?.average_rating ?? 0}</span>
                </div>
                <span className="text-gray-600">({product?.review_count} reviews)</span>
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
            {myCurrentVariant.stockCount < 10 && (
              <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                <p className="text-orange-800 font-semibold flex items-center gap-2">
                  ⚠️ Hurry! Only {myCurrentVariant.stockCount} items left in stock
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
          </div>

          {/* Tab Content */}
          <div className="p-6">
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

            <div className="p-6">
              <div className="flex justify-center">
                <div className="w-full max-w-4xl">
                  <div className="relative group cursor-pointer" onClick={() => setShowReportModal(true)}>
                    <img
                      src={product?.analytical_report || "/placeholder.svg"}
                      alt="Analytical Report Certificate"
                      className="w-full h-auto rounded-md shadow-lg border border-gray-200 transition-transform duration-300 group-hover:scale-105"
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

        {/* Customer Reviews Section */}
        <div className="mb-10">
          <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <h2 className="text-xl font-bold text-gray-900">Customer Reviews ({reviews.length})</h2>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors text-sm w-full sm:w-auto">
                  Write a Review
                </button>
              </div>
            </div>

            {/* Mobile: Horizontal Scroll, Desktop: Grid */}
            <div className="p-4 sm:p-6">
              {/* Mobile Layout */}
              <div className="block sm:hidden">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex-shrink-0 w-80 border border-gray-200 rounded-md p-4 bg-gray-50"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <span className="text-green-700 font-semibold text-sm">{review.avatar}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 text-sm truncate">{review.user}</span>
                            {review.verified && (
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
                            <span className="text-xs text-gray-500">{review.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Comment */}
                      <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-4">{review.comment}</p>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{review.helpful}</span>
                        </button>
                        <span className="text-xs text-gray-400">Helpful</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Scroll indicator */}
                <div className="flex justify-center mt-2">
                  <span className="text-xs text-gray-400">← Swipe to see more reviews →</span>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:block">
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border border-gray-200 rounded-md p-4 hover:shadow-sm transition-shadow bg-gray-50"
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <span className="text-green-700 font-semibold text-sm">{review.avatar}</span>
                        </div>

                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{review.user}</span>
                              {review.verified && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                  Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>{review.date}</span>
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-2">
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
                            <span className="text-sm font-medium text-gray-700">{review.rating}/5</span>
                          </div>

                          {/* Comment */}
                          <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>

                          {/* Actions */}
                          <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors">
                              <ThumbsUp className="w-3 h-3" />
                              <span>Helpful ({review.helpful})</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Related Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <Link key={relatedProduct.id} href={`/myProduct/${relatedProduct.id}`}>
                <div className="bg-white border border-gray-200 rounded-md p-3 hover:shadow-md transition-all duration-200">
                  <img
                    src={relatedProduct.image || "/placeholder.svg"}
                    alt={relatedProduct.name}
                    className="w-full h-32 lg:h-36 object-contain mb-2"
                  />
                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm">{relatedProduct.name}</h4>
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">{relatedProduct.rating}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-600 text-sm">₹{relatedProduct.price}</span>
                    <span className="text-xs text-gray-500 line-through">₹{relatedProduct.originalPrice}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-md p-2 z-10 hover:bg-opacity-70 transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={product?.images?.[selectedImage]?.image || "/placeholder.svg"}
              alt={product?.name || "Product Image"}
              className="max-w-full max-h-full object-contain rounded-md"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {product?.images?.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    selectedImage === index ? "bg-white" : "bg-white bg-opacity-50"
                  }`}
                />
              ))}
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
            className="flex-1 bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition-colors text-sm"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-orange-500 text-white py-3 rounded-md font-semibold hover:bg-orange-600 transition-colors text-sm"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  )
}