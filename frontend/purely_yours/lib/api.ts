const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// Type definitions for API responses
export interface Review {
  review_id: string
  verified_buyer: boolean
  product_title: string
  rating: number
  author: string
  timestamp: string
  title: string
  body: string
  source: string
}

export interface ReviewSummary {
  average_rating: number
  total_reviews: number
  rating_distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  verified_buyers: number
  verified_buyer_percentage: number
}

export interface PaginatedResponse<T> {
  results: T[]
  count: number
  next: string | null
  previous: string | null
}

// API client with authentication and error handling
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("authToken")
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("authToken", token)
      } else {
        localStorage.removeItem("authToken")
      }
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken")
      localStorage.removeItem("userMode")
      localStorage.removeItem("userInfo")
    }
  }

  async request(endpoint: string, options: RequestInit = {}) {
    if (!endpoint) {
      throw new Error("API endpoint is required")
    }

    const url = `${this.baseURL}${endpoint}`

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)

      // Handle different response types
      const contentType = response.headers.get("content-type")
      let data

      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json()
        } catch (jsonError) {
          console.error("Failed to parse JSON response:", jsonError)
          data = null
        }
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken()
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login"
          }
          throw new Error("Authentication required")
        }

        const errorMessage = data?.message || data?.error || data || `HTTP error! status: ${response.status}`
        console.error("API error:", errorMessage)
        throw new Error(errorMessage)
      }

      return data || {}
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Auth endpoints
  async register(userData: {
    first_name: string
    last_name: string
    email: string
    password: string
    mobile?: string
  }) {
    if (!userData?.email || !userData?.password || !userData?.first_name || !userData?.last_name) {
      throw new Error("Required fields are missing")
    }

    return this.request("/auth/register/", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: {
    email: string
    password: string
  }) {
    if (!credentials?.email || !credentials?.password) {
      throw new Error("Email and password are required")
    }

    return this.request("/auth/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async sendOTP(data: {
    mobile: string
    country_code: string
  }) {
    if (!data?.mobile || !data?.country_code) {
      throw new Error("Mobile number and country code are required")
    }

    return this.request("/auth/send-otp/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async verifyOTP(data: {
    mobile: string
    country_code: string
    otp: string
  }) {
    if (!data?.mobile || !data?.country_code || !data?.otp) {
      throw new Error("Mobile number, country code, and OTP are required")
    }

    return this.request("/auth/verify-otp/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getProfile() {
    return this.request("/auth/profile/")
  }

  async updateProfile(data: any) {
    if (!data || typeof data !== "object") {
      throw new Error("Profile data is required")
    }

    return this.request("/auth/profile/", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async refreshToken() {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null
    if (!refreshToken) throw new Error("No refresh token available")

    return this.request("/auth/token/refresh/", {
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
    })
  }

  // Address endpoints
  async getAddresses() {
    try {
      const response = await this.request("/auth/addresses/")
      return Array.isArray(response) ? response : response?.results || []
    } catch (error) {
      console.error("Failed to fetch addresses:", error)
      return []
    }
  }

  async createAddress(data: {
    type: string
    name: string
    mobile: string
    address_line_1: string
    address_line_2?: string
    city: string
    state: string
    pincode: string
    country: string
    is_default?: boolean
  }) {
    if (
      !data?.name ||
      !data?.mobile ||
      !data?.address_line_1 ||
      !data?.city ||
      !data?.state ||
      !data?.pincode
    ) {
      throw new Error("Required address fields are missing")
    }

    return this.request("/auth/addresses/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateAddress(addressId: number, data: any) {
    if (!addressId || !data) {
      throw new Error("Address ID and data are required")
    }

    return this.request(`/auth/addresses/${addressId}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteAddress(addressId: number) {
    if (!addressId) {
      throw new Error("Address ID is required")
    }

    return this.request(`/auth/addresses/${addressId}/`, {
      method: "DELETE",
    })
  }

  // Product endpoints - Updated to match Django URLs
  async getCollections() {
    try {
      const response = await this.request("/products/collections/")
      return Array.isArray(response) ? response : response?.results || []
    } catch (error) {
      console.error("Failed to fetch collections from /products/collections/:", error)
      
      // Try alternative endpoints
      try {
        const fallbackResponse = await this.request("/collections/")
        return Array.isArray(fallbackResponse) ? fallbackResponse : fallbackResponse?.results || []
      } catch (fallbackError) {
        console.error("Failed to fetch collections from fallback endpoint:", fallbackError)
        
        // Try categories endpoint as last resort
        try {
          const categoryResponse = await this.request("/categories/")
          return Array.isArray(categoryResponse) ? categoryResponse : categoryResponse?.results || []
        } catch (categoryError) {
          console.error("Failed to fetch categories:", categoryError)
          return []
        }
      }
    }
  }

  async getProducts(params?: {
    collection?: string
    tag?: string
    search?: string
    ordering?: string
    page?: number
    min_price?: number
    max_price?: number
    in_stock?: boolean
    featured?: boolean
  }) {
    try {
      const searchParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, value.toString())
          }
        })
      }

      const queryString = searchParams.toString()
      const response = await this.request(`/products/${queryString ? `?${queryString}` : ""}`)

      return {
        results: Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : [],
        count: response?.count || 0,
        next: response?.next || null,
        previous: response?.previous || null,
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
      return { results: [], count: 0, next: null, previous: null }
    }
  }

  async getProduct(slug: string) {
    if (!slug) {
      throw new Error("Product slug is required")
    }

    try {
      // Properly encode the product slug for URL
      const encodedSlug = encodeURIComponent(slug)
      const response = await this.request(`/products/${encodedSlug}/`)
      return response || null
    } catch (error) {
      console.error("Failed to fetch product:", error)
      return null
    }
  }

  async getCollectionProducts(collectionSlug: string, params?: any) {
    if (!collectionSlug) {
      throw new Error("Collection slug is required")
    }

    try {
      const searchParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, value.toString())
          }
        })
      }

      // Try the collection-specific endpoint first
      const queryString = searchParams.toString()
      
      try {
        // Properly encode the collection slug for URL
        const encodedSlug = encodeURIComponent(collectionSlug)
        const response = await this.request(
          `/products/collections/${encodedSlug}/${queryString ? `?${queryString}` : ""}`,
        )
        
        return {
          results: Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : [],
          count: response?.count || 0,
          next: response?.next || null,
          previous: response?.previous || null,
        }
      } catch (collectionError: any) {
        // If collection endpoint fails, try filtering all products by collection
        console.warn(`Collection endpoint failed for ${collectionSlug}, trying fallback:`, collectionError.message)
        
        const fallbackParams = { ...params, collection: collectionSlug }
        const fallbackSearchParams = new URLSearchParams()
        Object.entries(fallbackParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            fallbackSearchParams.append(key, value.toString())
          }
        })
        
        const fallbackResponse = await this.request(`/products/?${fallbackSearchParams.toString()}`)
        return {
          results: Array.isArray(fallbackResponse?.results) ? fallbackResponse.results : Array.isArray(fallbackResponse) ? fallbackResponse : [],
          count: fallbackResponse?.count || 0,
          next: fallbackResponse?.next || null,
          previous: fallbackResponse?.previous || null,
        }
      }
    } catch (error) {
      console.error("Failed to fetch collection products:", error)
      return { results: [], count: 0, next: null, previous: null }
    }
  }

  async getFeaturedProducts() {
    try {
      const response = await this.request("/products/tags/top-sellers/")
      return Array.isArray(response) ? response : response?.results || []
    } catch (error) {
      console.error("Failed to fetch featured products:", error)
      return []
    }
  }

  async getBestsellers() {
    try {
      const response = await this.request("/products/collections/bestsellers/")
      return Array.isArray(response) ? response : response?.results || []
    } catch (error) {
      console.error("Failed to fetch bestsellers:", error)
      return []
    }
  }
  async getValueCombos() {
    try {
      const response = await this.request("/products/collections/value-combos/")
      return Array.isArray(response) ? response : response?.results || []
    } catch (error) {
      console.error("Failed to fetch value combos:", error)
      return []
    }
  }

  // Tag endpoints
  async getTags() {
    try {
      const response = await this.request("/products/tags/")
      return Array.isArray(response) ? response : response?.results || []
    } catch (error) {
      console.error("Failed to fetch tags:", error)
      return []
    }
  }

  async getTagProducts(tagSlug: string, params?: {
    search?: string
    ordering?: string
    page?: number
    min_price?: number
    max_price?: number
    in_stock?: boolean
  }) {
    if (!tagSlug) {
      throw new Error("Tag slug is required")
    }

    try {
      const searchParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, value.toString())
          }
        })
      }

      const queryString = searchParams.toString()
      const encodedSlug = encodeURIComponent(tagSlug)
      const response = await this.request(
        `/products/tags/${encodedSlug}/${queryString ? `?${queryString}` : ""}`,
      )

      return {
        results: Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : [],
        count: response?.count || 0,
        next: response?.next || null,
        previous: response?.previous || null,
      }
    } catch (error) {
      console.error("Failed to fetch tag products:", error)
      return { results: [], count: 0, next: null, previous: null }
    }
  }

  // Helper method to get products by multiple tags
  async getProductsByTags(tagSlugs: string[], params?: any) {
    if (!tagSlugs || tagSlugs.length === 0) {
      return { results: [], count: 0, next: null, previous: null }
    }

    try {
      const searchParams = new URLSearchParams()
      
      // Add each tag as a separate parameter
      tagSlugs.forEach(tag => {
        if (tag) {
          searchParams.append('tag', tag)
        }
      })

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, value.toString())
          }
        })
      }

      const response = await this.request(`/products/?${searchParams.toString()}`)
      return {
        results: Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : [],
        count: response?.count || 0,
        next: response?.next || null,
        previous: response?.previous || null,
      }
    } catch (error) {
      console.error("Failed to fetch products by tags:", error)
      return { results: [], count: 0, next: null, previous: null }
    }
  }

  // Get tag suggestions based on query
  async getTagSuggestions(query: string) {
    if (!query?.trim()) {
      return []
    }

    try {
      const response = await this.request(`/products/tags/?search=${encodeURIComponent(query.trim())}`)
      return Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : []
    } catch (error) {
      console.error("Failed to fetch tag suggestions:", error)
      return []
    }
  }

  async searchProducts(
    query: string,
    params?: {
      collection?: string
      tag?: string
      min_price?: number
      max_price?: number
      ordering?: string
      page?: number
    },
  ) {
    if (!query?.trim()) {
      return { results: [], count: 0, next: null, previous: null }
    }

    try {
      const searchParams = new URLSearchParams({ q: query.trim() })
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, value.toString())
          }
        })
      }

      const response = await this.request(`/products/search/?${searchParams.toString()}`)
      return {
        results: Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : [],
        count: response?.count || 0,
        next: response?.next || null,
        previous: response?.previous || null,
      }
    } catch (error) {
      console.error("Search failed:", error)
      return { results: [], count: 0, next: null, previous: null }
    }
  }

  // Cart endpoints
  async getCart() {
    try {
      const response = await this.request("/cart/")
      return {
        id: response?.id || 0,
        items: Array.isArray(response?.items) ? response.items : [],
        total_items: response?.total_items || 0,
        total_amount: response?.total_amount || 0,
        discount_amount: response?.discount_amount || 0,
        final_amount: response?.final_amount || response?.total_amount || 0,
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error)
      return {
        id: 0,
        items: [],
        total_items: 0,
        total_amount: 0,
        discount_amount: 0,
        final_amount: 0,
      }
    }
  }

  async addToCart(data: {
    product_id: number
    variant_id?: number
    quantity: number
  }) {
    if (!data?.product_id || !data?.quantity || data.quantity <= 0) {
      throw new Error("Product ID and valid quantity are required")
    }

    return this.request("/cart/add/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateCartItem(itemId: number, quantity: number) {
    if (!itemId || quantity < 0) {
      throw new Error("Valid item ID and quantity are required")
    }

    return this.request(`/cart/update/${itemId}/`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    })
  }

  async removeFromCart(itemId: number) {
    if (!itemId) {
      throw new Error("Item ID is required")
    }

    return this.request(`/cart/remove/${itemId}/`, {
      method: "DELETE",
    })
  }

  async clearCart() {
    return this.request("/cart/clear/", {
      method: "DELETE",
    })
  }

  // Wishlist endpoints
  async getWishlist() {
    try {
      const response = await this.request("/wishlist/")
      return {
        id: response?.id || 0,
        items: Array.isArray(response?.items) ? response.items : Array.isArray(response) ? response : [],
        total_items: response?.total_items || 0,
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error)
      return { id: 0, items: [], total_items: 0 }
    }
  }

  async addToWishlist(productId: number) {
    if (!productId) {
      throw new Error("Product ID is required")
    }

    const response = await this.request("/wishlist/add/", {
      method: "POST",
      body: JSON.stringify({ product_id: productId }),
    })
    
    // Ensure we return a consistent response format
    if (response && !response.wishlist) {
      // If the response doesn't include updated wishlist, fetch it
      const updatedWishlist = await this.getWishlist()
      return {
        success: true,
        message: "Item added to wishlist successfully",
        wishlist: updatedWishlist,
        ...response
      }
    }

    return response
  }

  async removeFromWishlist(itemId: number) {
    if (!itemId) {
      throw new Error("Item ID is required")
    }

    const response = await this.request(`/wishlist/remove/${itemId}/`, {
      method: "DELETE",
    })
    
    // Ensure we return a consistent response format
    if (response && !response.wishlist) {
      // If the response doesn't include updated wishlist, fetch it
      const updatedWishlist = await this.getWishlist()
      return {
        success: true,
        message: "Item removed from wishlist successfully",
        wishlist: updatedWishlist,
        ...response
      }
    }

    return response
  }

  async toggleWishlist(productId: number) {
    if (!productId) {
      throw new Error("Product ID is required")
    }

    // Since /wishlist/toggle/ endpoint doesn't exist, we'll implement toggle logic
    // by checking current wishlist and then adding/removing accordingly
    try {
      // First get current wishlist to check if product exists
      const wishlist = await this.getWishlist()
      const existingItem = wishlist.items.find((item: any) => 
        Number(item.product.id) === Number(productId)
      )

      let response
      if (existingItem) {
        // Product exists, remove it
        response = await this.removeFromWishlist(existingItem.id)
        // Add the toggle-specific response format
        response = {
          ...response,
          added: false,
          message: "Product removed from wishlist"
        }
      } else {
        // Product doesn't exist, add it
        response = await this.addToWishlist(productId)
        // Add the toggle-specific response format
        response = {
          ...response,
          added: true,
          message: "Product added to wishlist"
        }
      }

      return response
    } catch (error) {
      throw error
    }
  }

  async clearWishlist(){
    const response = await this.request(`/wishlist/clear/`, {
      method: "DELETE",
    })
    
    // Ensure we return a consistent response format
    if (response && !response.wishlist) {
      // If the response doesn't include updated wishlist, fetch it
      const updatedWishlist = await this.getWishlist()
      return {
        success: true,
        message: "Items clear from wishlist successfully",
        wishlist: updatedWishlist,
        ...response
      }
    }
    return response

  }

  // Order endpoints
  async getOrders() {
    try {
      const response = await this.request("/orders/")
      return {
        results: Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : [],
        count: response?.count || 0,
        next: response?.next || null,
        previous: response?.previous || null,
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      return { results: [], count: 0, next: null, previous: null }
    }
  }

  async getOrder(orderId: String) {
    if (!orderId) {
      throw new Error("Order ID is required")
    }

    try {
      const response = await this.request(`/orders/${orderId}/`)
      return response || null
    } catch (error) {
      console.error("Failed to fetch order:", error)
      return null
    }
  }

  async createOrder(data: {
    address_id?: number
    shipping_address?: any
    payment_method: string
    notes?: string
    items?: Array<{
      product_id: number
      variant_id?: number | null
      quantity: number
      price: number
    }>
  }) {
    if (!data?.payment_method) {
      throw new Error("Payment method is required")
    }

    if (!data.address_id && !data.shipping_address) {
      throw new Error("Either address ID or shipping address is required")
    }

    return this.request("/orders/create/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async cancelOrder(orderId: number) {
    if (!orderId) {
      throw new Error("Order ID is required")
    }

    return this.request(`/orders/${orderId}/cancel/`, {
      method: "POST",
    })
  }

  async trackOrder(orderId: number) {
    if (!orderId) {
      throw new Error("Order ID is required")
    }

    return this.request(`/orders/${orderId}/track/`)
  }

  // Payment endpoints
  async createPaymentSession(data: {
    order_id: number
    return_url?: string
    notify_url?: string
  }) {
    if (!data?.order_id) {
      throw new Error("Order ID is required")
    }

    return this.request("/payments/create-session/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async processCardPayment(data: {
    payment_session_id: string
    card_data: {
      card_number: string
      card_expiry_mm: string
      card_expiry_yy: string
      card_cvv: string
      card_holder_name: string
    }
  }) {
    if (!data?.payment_session_id || !data?.card_data) {
      throw new Error("Payment session ID and card data are required")
    }

    return this.request("/payments/process-card-payment/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async verifyPaymentOTP(data: {
    otp_url: string
    otp: string
    payment_session_id: string
  }) {
    if (!data?.otp_url || !data?.otp || !data?.payment_session_id) {
      throw new Error("OTP URL, OTP, and payment session ID are required")
    }

    return this.request("/payments/verify-otp/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getPaymentStatus(cashfreeOrderId: string) {
    if (!cashfreeOrderId) {
      throw new Error("Cashfree Order ID is required")
    }

    return this.request(`/payments/status/${cashfreeOrderId}/`)
  }

  // Consultation endpoints
  async getDoctors() {
    try {
      const response = await this.request("/consultations/doctors/")
      return Array.isArray(response) ? response : response?.results || []
    } catch (error) {
      console.error("Failed to fetch doctors:", error)
      return []
    }
  }

  async getDoctor(doctorId: number) {
    if (!doctorId) {
      throw new Error("Doctor ID is required")
    }

    try {
      const response = await this.request(`/consultations/doctors/${doctorId}/`)
      return response || null
    } catch (error) {
      console.error("Failed to fetch doctor:", error)
      return null
    }
  }

  async bookConsultation(data: {
    doctor_id: number
    consultation_type: string
    preferred_date: string
    preferred_time: string
    health_concern: string
    notes?: string
  }) {
    if (
      !data?.doctor_id ||
      !data?.consultation_type ||
      !data?.preferred_date ||
      !data?.preferred_time ||
      !data?.health_concern
    ) {
      throw new Error("Required consultation fields are missing")
    }

    return this.request("/consultations/book/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getConsultations() {
    try {
      const response = await this.request("/consultations/")
      return {
        results: Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : [],
        count: response?.count || 0,
        next: response?.next || null,
        previous: response?.previous || null,
      }
    } catch (error) {
      console.error("Failed to fetch consultations:", error)
      return { results: [], count: 0, next: null, previous: null }
    }
  }

  async getConsultation(consultationId: number) {
    if (!consultationId) {
      throw new Error("Consultation ID is required")
    }

    try {
      const response = await this.request(`/consultations/${consultationId}/`)
      return response || null
    } catch (error) {
      console.error("Failed to fetch consultation:", error)
      return null
    }
  }

  async cancelConsultation(consultationId: number) {
    if (!consultationId) {
      throw new Error("Consultation ID is required")
    }

    return this.request(`/consultations/${consultationId}/cancel/`, {
      method: "POST",
    })
  }

  async rescheduleConsultation(
    consultationId: number,
    data: {
      preferred_date: string
      preferred_time: string
    },
  ) {
    if (!consultationId || !data?.preferred_date || !data?.preferred_time) {
      throw new Error("Consultation ID, date, and time are required")
    }

    return this.request(`/consultations/${consultationId}/reschedule/`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Review endpoints - Updated to match products URLs
  async getProductReviews(productId: number, params?: {
    page?: number
    page_size?: number
    ordering?: string
  }) {
    if (!productId) {
      return { results: [], count: 0, next: null, previous: null }
    }

    try {
      const searchParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, value.toString())
          }
        })
      }

      const queryString = searchParams.toString()
      const response = await this.request(
        `/reviews/product/${productId}/${queryString ? `?${queryString}` : ""}`
      )
      
      return {
        results: Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : [],
        count: response?.count || 0,
        next: response?.next || null,
        previous: response?.previous || null,
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
      return { results: [], count: 0, next: null, previous: null }
    }
  }

  async getProductReviewsSummary(productId: number) {
    if (!productId) {
      throw new Error("Product ID is required")
    }

    try {
      const response = await this.request(`/reviews/product/${productId}/summary/`)
      
      // Handle the actual API response structure
      if (response?.success && response?.reviews_summary) {
        const summary = response.reviews_summary
        return {
          average_rating: summary.average_rating || 0,
          total_reviews: summary.total_reviews || 0,
          rating_distribution: {
            1: summary.rating_distribution?.["1_star"] || 0,
            2: summary.rating_distribution?.["2_star"] || 0,
            3: summary.rating_distribution?.["3_star"] || 0,
            4: summary.rating_distribution?.["4_star"] || 0,
            5: summary.rating_distribution?.["5_star"] || 0
          },
          verified_buyers: summary.verified_buyers || 0,
          verified_buyer_percentage: summary.verified_buyer_percentage || 0
        }
      }
      
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        },
        verified_buyers: 0,
        verified_buyer_percentage: 0
      }
    } catch (error) {
      console.error("Failed to fetch review summary:", error)
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        },
        verified_buyers: 0,
        verified_buyer_percentage: 0
      }
    }
  }

  async createReview(data: {
    product_id: number
    rating: number
    title: string
    comment: string
  }) {
    if (!data?.product_id || !data?.rating || !data?.title || !data?.comment) {
      throw new Error("All review fields are required")
    }

    if (data.rating < 1 || data.rating > 5) {
      throw new Error("Rating must be between 1 and 5")
    }

    return this.request("/reviews/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateReview(
    reviewId: number,
    data: {
      rating: number
      title: string
      comment: string
    },
  ) {
    if (!reviewId || !data?.rating || !data?.title || !data?.comment) {
      throw new Error("Review ID and all fields are required")
    }

    if (data.rating < 1 || data.rating > 5) {
      throw new Error("Rating must be between 1 and 5")
    }

    return this.request(`/reviews/${reviewId}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteReview(reviewId: number) {
    if (!reviewId) {
      throw new Error("Review ID is required")
    }

    return this.request(`/reviews/${reviewId}/`, {
      method: "DELETE",
    })
  }

  async getReview(reviewId: string) {
    if (!reviewId) {
      throw new Error("Review ID is required")
    }

    try {
      const response = await this.request(`/reviews/${reviewId}/`)
      return response || null
    } catch (error) {
      console.error("Failed to fetch review:", error)
      return null
    }
  }

  async getUserReviews(params?: {
    page?: number
    page_size?: number
    ordering?: string
  }) {
    try {
      const searchParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, value.toString())
          }
        })
      }

      const queryString = searchParams.toString()
      const response = await this.request(`/reviews/user/${queryString ? `?${queryString}` : ""}`)
      
      return {
        results: Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : [],
        count: response?.count || 0,
        next: response?.next || null,
        previous: response?.previous || null,
      }
    } catch (error) {
      console.error("Failed to fetch user reviews:", error)
      return { results: [], count: 0, next: null, previous: null }
    }
  }

  async markReviewHelpful(reviewId: string, helpful: boolean = true) {
    if (!reviewId) {
      throw new Error("Review ID is required")
    }

    try {
      return this.request(`/reviews/${reviewId}/helpful/`, {
        method: "POST",
        body: JSON.stringify({ helpful }),
      })
    } catch (error) {
      console.error("Failed to mark review as helpful:", error)
      throw error
    }
  }

  async reportReview(reviewId: string, reason: string) {
    if (!reviewId || !reason) {
      throw new Error("Review ID and reason are required")
    }

    try {
      return this.request(`/reviews/${reviewId}/report/`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      })
    } catch (error) {
      console.error("Failed to report review:", error)
      throw error
    }
  }
}



export const apiClient = new ApiClient(API_BASE_URL)
export default apiClient