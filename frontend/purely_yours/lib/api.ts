const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.229.169:8000/api"

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
      headers["authorization"] = `Bearer ${this.token}`
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
    full_name: string
    mobile: string
    address_line_1: string
    address_line_2?: string
    city: string
    state: string
    postal_code: string
    country: string
    is_default?: boolean
  }) {
    if (
      !data?.full_name ||
      !data?.mobile ||
      !data?.address_line_1 ||
      !data?.city ||
      !data?.state ||
      !data?.postal_code
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

  // Product endpoints
  async getCategories() {
    try {
      const response = await this.request("/products/categories/")
      return Array.isArray(response) ? response : response?.results || []
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      return []
    }
  }

  async getProducts(params?: {
    category?: string
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
      const response = await this.request(`/products/${slug}/`)
      return response || null
    } catch (error) {
      console.error("Failed to fetch product:", error)
      return null
    }
  }

  async getCategoryProducts(categorySlug: string, params?: any) {
    if (!categorySlug) {
      throw new Error("Category slug is required")
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
        `/products/categories/${categorySlug}/${queryString ? `?${queryString}` : ""}`,
      )

      return {
        results: Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : [],
        count: response?.count || 0,
        next: response?.next || null,
        previous: response?.previous || null,
      }
    } catch (error) {
      console.error("Failed to fetch category products:", error)
      return { results: [], count: 0, next: null, previous: null }
    }
  }

  async getFeaturedProducts() {
    try {
      const response = await this.request("/products/featured/")
      return Array.isArray(response) ? response : response?.results || []
    } catch (error) {
      console.error("Failed to fetch featured products:", error)
      return []
    }
  }

  async getBestsellers() {
    try {
      const response = await this.request("/products/bestsellers/")
      return Array.isArray(response) ? response : response?.results || []
    } catch (error) {
      console.error("Failed to fetch bestsellers:", error)
      return []
    }
  }

  async searchProducts(
    query: string,
    params?: {
      category?: string
      min_price?: number
      max_price?: number
      ordering?: string
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

    return this.request("/wishlist/add/", {
      method: "POST",
      body: JSON.stringify({ product_id: productId }),
    })
  }

  async removeFromWishlist(itemId: number) {
    if (!itemId) {
      throw new Error("Item ID is required")
    }

    return this.request(`/wishlist/items/${itemId}/`, {
      method: "DELETE",
    })
  }

  async toggleWishlist(productId: number) {
    if (!productId) {
      throw new Error("Product ID is required")
    }

    return this.request("/wishlist/toggle/", {
      method: "POST",
      body: JSON.stringify({ product_id: productId }),
    })
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

  // Review endpoints
  async getProductReviews(productId: number) {
    if (!productId) {
      return { results: [], count: 0, next: null, previous: null }
    }

    try {
      const response = await this.request(`/reviews/product/${productId}/`)
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

    return this.request("/reviews/create/", {
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
}

export const apiClient = new ApiClient(API_BASE_URL)
export default apiClient
