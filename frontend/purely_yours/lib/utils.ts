"use client"

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { VALIDATION } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Safe number conversion
export function safeNumber(value: any, defaultValue = 0): number {
  if (value === null || value === undefined || value === "") return defaultValue
  const num = Number(value)
  return isNaN(num) ? defaultValue : num
}

// Safe string conversion
export function safeString(value: any, defaultValue = ""): string {
  if (value === null || value === undefined) return defaultValue
  return String(value)
}

// Safe array conversion
export function safeArray<T>(value: any, defaultValue: T[] = []): T[] {
  if (!Array.isArray(value)) return defaultValue
  return value
}

// Safe object access
export function safeGet<T>(obj: any, path: string, defaultValue?: T): T | undefined {
  if (!obj || typeof obj !== "object") return defaultValue

  const keys = path.split(".")
  let result = obj

  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== "object") {
      return defaultValue
    }
    result = result[key]
  }

  return result !== undefined ? result : defaultValue
}

// Format currency with null safety
export function formatCurrency(amount: any, currency = "INR"): string {
  const safeAmount = safeNumber(amount, 0)

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(safeAmount)
  } catch (error) {
    console.error("Currency formatting error:", error)
    return `₹${safeAmount.toFixed(2)}`
  }
}

// Format date with null safety
export function formatDate(date: any, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return ""

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return ""

    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...options,
    }).format(dateObj)
  } catch (error) {
    console.error("Date formatting error:", error)
    return ""
  }
}

// Format relative time with null safety
export function formatRelativeTime(date: any): string {
  if (!date) return ""

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return ""

    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`

    return formatDate(dateObj)
  } catch (error) {
    console.error("Relative time formatting error:", error)
    return ""
  }
}

// Validation functions with null safety
export function validateEmail(email: any): boolean {
  const emailStr = safeString(email)
  if (!emailStr) return false
  return VALIDATION.EMAIL_REGEX.test(emailStr)
}

export function validateMobile(mobile: any): boolean {
  const mobileStr = safeString(mobile)
  if (!mobileStr) return false
  return VALIDATION.MOBILE_REGEX.test(mobileStr)
}

export function validatePassword(password: any): {
  isValid: boolean
  errors: string[]
} {
  const passwordStr = safeString(password)
  const errors: string[] = []

  if (!passwordStr) {
    errors.push("Password is required")
    return { isValid: false, errors }
  }

  if (passwordStr.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`)
  }

  if (!/[A-Z]/.test(passwordStr)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[a-z]/.test(passwordStr)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/\d/.test(passwordStr)) {
    errors.push("Password must contain at least one number")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Debounce function with null safety
export function debounce<T extends (...args: any[]) => any>(
  func: T | null | undefined,
  delay: number,
): (...args: Parameters<T>) => void {
  if (!func || typeof func !== "function") {
    return () => {}
  }

  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Custom hook for debounced values
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttle function with null safety
export function throttle<T extends (...args: any[]) => any>(
  func: T | null | undefined,
  delay: number,
): (...args: Parameters<T>) => void {
  if (!func || typeof func !== "function") {
    return () => {}
  }

  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

// Generate slug from string with null safety
export function generateSlug(text: any): string {
  const textStr = safeString(text)
  if (!textStr) return ""

  return textStr
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Truncate text with null safety
export function truncateText(text: any, maxLength: number): string {
  const textStr = safeString(text)
  if (!textStr) return ""
  if (textStr.length <= maxLength) return textStr
  return textStr.slice(0, maxLength).trim() + "..."
}

// Calculate discount percentage with null safety
export function calculateDiscountPercentage(originalPrice: any, salePrice: any): number {
  const original = safeNumber(originalPrice, 0)
  const sale = safeNumber(salePrice, 0)

  if (original <= 0 || sale >= original) return 0
  return Math.round(((original - sale) / original) * 100)
}

// Format file size with null safety
export function formatFileSize(bytes: any): string {
  const safeBytes = safeNumber(bytes, 0)
  if (safeBytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(safeBytes) / Math.log(k))

  return Number.parseFloat((safeBytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Generate random ID
export function generateId(length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Check if device is mobile with null safety
export function isMobile(): boolean {
  if (typeof window === "undefined") return false
  return window.innerWidth < 768
}

// Scroll to element with null safety
export function scrollToElement(elementId: string, offset = 0): void {
  if (!elementId || typeof document === "undefined") return

  const element = document.getElementById(elementId)
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
    window.scrollTo({
      top: elementPosition - offset,
      behavior: "smooth",
    })
  }
}

// Copy to clipboard with null safety
export async function copyToClipboard(text: any): Promise<boolean> {
  const textStr = safeString(text)
  if (!textStr) return false

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(textStr)
      return true
    }
    return false
  } catch (error) {
    console.error("Failed to copy to clipboard:", error)
    return false
  }
}

// Local storage helpers with null safety
export const storage = {
  get: (key: string) => {
    if (!key || typeof window === "undefined") return null
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      return null
    }
  },

  set: (key: string, value: any) => {
    if (!key || typeof window === "undefined") return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error("Error writing to localStorage:", error)
    }
  },

  remove: (key: string) => {
    if (!key || typeof window === "undefined") return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error("Error removing from localStorage:", error)
    }
  },

  clear: () => {
    if (typeof window === "undefined") return
    try {
      localStorage.clear()
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
  },
}

// Image optimization helpers with null safety
export function getOptimizedImageUrl(url: any, width?: number, height?: number): string {
  const urlStr = safeString(url)
  if (!urlStr) return "/placeholder.svg?height=400&width=400"

  // If it's already a placeholder, return as is
  if (urlStr.includes("placeholder.svg")) return urlStr

  try {
    // Add optimization parameters if provided
    const params = new URLSearchParams()
    if (width && width > 0) params.append("w", width.toString())
    if (height && height > 0) params.append("h", height.toString())

    const queryString = params.toString()
    return queryString ? `${urlStr}?${queryString}` : urlStr
  } catch (error) {
    console.error("Image URL optimization error:", error)
    return urlStr
  }
}

// Error handling helpers with null safety
export function getErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred"
  if (typeof error === "string") return error
  if (error?.message) return safeString(error.message)
  if (error?.error) return safeString(error.error)
  return "An unexpected error occurred"
}

// URL helpers with null safety
export function buildUrl(base: string, params: Record<string, any>): string {
  if (!base) return ""

  try {
    const url = new URL(base, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")

    if (params && typeof params === "object") {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, safeString(value))
        }
      })
    }

    return url.toString()
  } catch (error) {
    console.error("URL building error:", error)
    return base
  }
}

// Toast notification helper
export function showToast(message: string, type: "success" | "error" | "info" = "info") {
  if (!message) return

  // This would integrate with your toast system
  console.log(`[${type.toUpperCase()}] ${message}`)
}

// Safe JSON parse
export function safeJsonParse<T>(jsonString: any, defaultValue: T): T {
  if (!jsonString || typeof jsonString !== "string") return defaultValue

  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error("JSON parse error:", error)
    return defaultValue
  }
}

// Safe JSON stringify
export function safeJsonStringify(obj: any, defaultValue = "{}"): string {
  if (obj === null || obj === undefined) return defaultValue

  try {
    return JSON.stringify(obj)
  } catch (error) {
    console.error("JSON stringify error:", error)
    return defaultValue
  }
}

// React imports for useDebounce hook
import { useState, useEffect } from "react"
