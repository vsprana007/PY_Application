"use client"

import { useState, useCallback } from "react"
import { apiClient } from "@/lib/api"
import { useAuth } from "./use-auth"
import { useToast } from "./use-toast"
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants"

interface Review {
  id: number
  user: {
    id: number
    first_name: string
    last_name: string
  }
  product: {
    id: number
    name: string
    slug: string
  }
  rating: number
  title: string
  comment: string
  is_verified_purchase: boolean
  helpful_count: number
  created_at: string
  updated_at: string
}

interface CreateReviewData {
  product_id: number
  rating: number
  title: string
  comment: string
}

export function useReviews(productId?: number) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  const fetchProductReviews = useCallback(async (id: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getProductReviews(id)
      setReviews(response.results || response)
    } catch (err: any) {
      const errorMessage = err.message || ERROR_MESSAGES.NETWORK_ERROR
      setError(errorMessage)
      console.error("Error fetching reviews:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createReview = async (reviewData: CreateReviewData) => {
    if (!isAuthenticated) {
      toast({
        title: "Error",
        description: ERROR_MESSAGES.UNAUTHORIZED,
        variant: "destructive",
      })
      return { success: false, message: ERROR_MESSAGES.UNAUTHORIZED }
    }

    try {
      setIsLoading(true)
      const response = await apiClient.createReview(reviewData)

      if (response.success) {
        toast({
          title: "Success",
          description: SUCCESS_MESSAGES.REVIEW_SUBMITTED,
        })
        // Refresh reviews for the product
        if (reviewData.product_id) {
          await fetchProductReviews(reviewData.product_id)
        }
      } else {
        toast({
          title: "Error",
          description: response.message || ERROR_MESSAGES.VALIDATION_ERROR,
          variant: "destructive",
        })
      }

      return response
    } catch (error: any) {
      const errorMessage = error.message || ERROR_MESSAGES.NETWORK_ERROR
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateReview = async (reviewId: number, reviewData: Omit<CreateReviewData, "product_id">) => {
    try {
      setIsLoading(true)
      const response = await apiClient.updateReview(reviewId, reviewData)

      if (response.success) {
        toast({
          title: "Success",
          description: "Review updated successfully!",
        })
        // Refresh reviews if we have a product ID
        if (productId) {
          await fetchProductReviews(productId)
        }
      } else {
        toast({
          title: "Error",
          description: response.message || ERROR_MESSAGES.VALIDATION_ERROR,
          variant: "destructive",
        })
      }

      return response
    } catch (error: any) {
      const errorMessage = error.message || ERROR_MESSAGES.NETWORK_ERROR
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deleteReview = async (reviewId: number) => {
    try {
      setIsLoading(true)
      const response = await apiClient.deleteReview(reviewId)

      if (response.success) {
        toast({
          title: "Success",
          description: "Review deleted successfully!",
        })
        // Refresh reviews if we have a product ID
        if (productId) {
          await fetchProductReviews(productId)
        }
      } else {
        toast({
          title: "Error",
          description: response.message || ERROR_MESSAGES.VALIDATION_ERROR,
          variant: "destructive",
        })
      }

      return response
    } catch (error: any) {
      const errorMessage = error.message || ERROR_MESSAGES.NETWORK_ERROR
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const total = reviews.reduce((sum, review) => sum + review.rating, 0)
    return total / reviews.length
  }

  const getRatingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  return {
    reviews,
    isLoading,
    error,
    fetchProductReviews,
    createReview,
    updateReview,
    deleteReview,
    getAverageRating,
    getRatingDistribution,
  }
}
