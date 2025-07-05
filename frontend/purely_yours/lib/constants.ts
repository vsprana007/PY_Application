// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
}

// Product Constants
export const PRODUCT_CONSTANTS = {
  ITEMS_PER_PAGE: 12,
  MAX_CART_QUANTITY: 10,
  MIN_SEARCH_QUERY_LENGTH: 2,
  PRICE_RANGES: [
    { label: "Under ₹500", min: 0, max: 500 },
    { label: "₹500 - ₹1000", min: 500, max: 1000 },
    { label: "₹1000 - ₹2000", min: 1000, max: 2000 },
    { label: "₹2000 - ₹5000", min: 2000, max: 5000 },
    { label: "Above ₹5000", min: 5000, max: null },
  ],
  SORT_OPTIONS: [
    { label: "Popularity", value: "-popularity" },
    { label: "Price: Low to High", value: "price" },
    { label: "Price: High to Low", value: "-price" },
    { label: "Newest First", value: "-created_at" },
    { label: "Customer Rating", value: "-average_rating" },
    { label: "Name: A to Z", value: "name" },
    { label: "Name: Z to A", value: "-name" },
  ],
}

// Order Constants
export const ORDER_CONSTANTS = {
  STATUS: {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    RETURNED: "returned",
  },
  PAYMENT_METHODS: {
    COD: "cod",
    ONLINE: "online",
    WALLET: "wallet",
  },
}

// Order Status Labels
export const ORDER_STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed", 
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
}

// Order Status Colors
export const ORDER_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  returned: "bg-orange-100 text-orange-800",
}

// Consultation Constants
export const CONSULTATION_CONSTANTS = {
  TYPES: {
    VIDEO: "video",
    AUDIO: "audio",
    CHAT: "chat",
  },
  STATUS: {
    SCHEDULED: "scheduled",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    RESCHEDULED: "rescheduled",
  },
  DURATION: {
    VIDEO: 30,
    AUDIO: 20,
    CHAT: 15,
  },
}

// UI Constants
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  SKELETON_ITEMS: 8,
  MAX_MOBILE_WIDTH: 768,
}

// Validation Constants
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MOBILE_REGEX: /^[6-9]\d{9}$/,
  PASSWORD_MIN_LENGTH: 8,
  OTP_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "Please login to continue.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Something went wrong. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  CART_EMPTY: "Your cart is empty.",
  WISHLIST_EMPTY: "Your wishlist is empty.",
  PRODUCT_OUT_OF_STOCK: "This product is currently out of stock.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  EMAIL_ALREADY_EXISTS: "An account with this email already exists.",
  MOBILE_ALREADY_EXISTS: "An account with this mobile number already exists.",
}

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Welcome back!",
  REGISTER_SUCCESS: "Account created successfully!",
  LOGOUT_SUCCESS: "Logged out successfully.",
  PROFILE_UPDATED: "Profile updated successfully.",
  PRODUCT_ADDED_TO_CART: "Product added to cart.",
  PRODUCT_REMOVED_FROM_CART: "Product removed from cart.",
  PRODUCT_ADDED_TO_WISHLIST: "Product added to wishlist.",
  PRODUCT_REMOVED_FROM_WISHLIST: "Product removed from wishlist.",
  ORDER_PLACED: "Order placed successfully!",
  ORDER_CANCELLED: "Order cancelled successfully.",
  CONSULTATION_BOOKED: "Consultation booked successfully!",
  CONSULTATION_CANCELLED: "Consultation cancelled successfully.",
  REVIEW_SUBMITTED: "Review submitted successfully.",
  ADDRESS_ADDED: "Address added successfully.",
  ADDRESS_UPDATED: "Address updated successfully.",
  ADDRESS_DELETED: "Address deleted successfully.",
}

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  REFRESH_TOKEN: "refreshToken",
  USER_MODE: "userMode",
  USER_INFO: "userInfo",
  CART_ITEMS: "cartItems",
  RECENT_SEARCHES: "recentSearches",
  VIEWED_PRODUCTS: "viewedProducts",
}

// Demo Data
export const DEMO_CREDENTIALS = {
  EMAIL: "demo@purelyours.com",
  PASSWORD: "demo123456",
}
