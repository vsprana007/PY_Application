"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api"
import { useAuth } from "./use-auth"
import { useToast } from "./use-toast"
import { ORDER_CONSTANTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants"

interface OrderItem {
  id: number
  product: {
    id: number
    name: string
    slug: string
    primary_image?: string
  }
  variant?: {
    id: number
    name: string
  }
  quantity: number
  price: number
  total_price: number
}

interface Order {
  id: number
  order_number: string
  status: string
  payment_method: string
  payment_status: string
  items: OrderItem[]
  total_amount: number
  discount_amount: number
  shipping_amount: number
  final_amount: number
  shipping_address: {
    full_name: string
    mobile: string
    address_line_1: string
    address_line_2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  tracking_number?: string
  estimated_delivery?: string
  notes?: string
  created_at: string
  updated_at: string
}

interface CreateOrderData {
  address_id: number
  payment_method: string
  notes?: string
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getOrders()
      setOrders(response.results || response)
    } catch (err: any) {
      const errorMessage = err.message || ERROR_MESSAGES.NETWORK_ERROR
      setError(errorMessage)
      console.error("Error fetching orders:", err)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const createOrder = async (orderData: CreateOrderData) => {
    try {
      setIsLoading(true)
      const response = await apiClient.createOrder(orderData)

      if (response.success) {
        toast({
          title: "Success",
          description: SUCCESS_MESSAGES.ORDER_PLACED,
        })
        await fetchOrders() // Refresh orders list
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

  const cancelOrder = async (orderId: number) => {
    try {
      setIsLoading(true)
      const response = await apiClient.cancelOrder(orderId)

      if (response.success) {
        toast({
          title: "Success",
          description: SUCCESS_MESSAGES.ORDER_CANCELLED,
        })
        await fetchOrders() // Refresh orders list
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

  const trackOrder = async (orderId: number) => {
    try {
      const response = await apiClient.trackOrder(orderId)
      return response
    } catch (error: any) {
      const errorMessage = error.message || ERROR_MESSAGES.NETWORK_ERROR
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case ORDER_CONSTANTS.STATUS.PENDING:
        return "text-yellow-600"
      case ORDER_CONSTANTS.STATUS.CONFIRMED:
        return "text-blue-600"
      case ORDER_CONSTANTS.STATUS.PROCESSING:
        return "text-purple-600"
      case ORDER_CONSTANTS.STATUS.SHIPPED:
        return "text-indigo-600"
      case ORDER_CONSTANTS.STATUS.DELIVERED:
        return "text-green-600"
      case ORDER_CONSTANTS.STATUS.CANCELLED:
        return "text-red-600"
      case ORDER_CONSTANTS.STATUS.RETURNED:
        return "text-orange-600"
      default:
        return "text-gray-600"
    }
  }

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case ORDER_CONSTANTS.STATUS.PENDING:
        return "Pending"
      case ORDER_CONSTANTS.STATUS.CONFIRMED:
        return "Confirmed"
      case ORDER_CONSTANTS.STATUS.PROCESSING:
        return "Processing"
      case ORDER_CONSTANTS.STATUS.SHIPPED:
        return "Shipped"
      case ORDER_CONSTANTS.STATUS.DELIVERED:
        return "Delivered"
      case ORDER_CONSTANTS.STATUS.CANCELLED:
        return "Cancelled"
      case ORDER_CONSTANTS.STATUS.RETURNED:
        return "Returned"
      default:
        return status
    }
  }

  const canCancelOrder = (order: Order) => {
    return [ORDER_CONSTANTS.STATUS.PENDING, ORDER_CONSTANTS.STATUS.CONFIRMED].includes(order.status)
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
    } else {
      setOrders([])
    }
  }, [isAuthenticated, fetchOrders])

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    createOrder,
    cancelOrder,
    trackOrder,
    getOrderStatusColor,
    getOrderStatusLabel,
    canCancelOrder,
  }
}

export function useOrder(orderId: number) {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchOrder = useCallback(async () => {
    if (!orderId) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getOrder(orderId.toString())
      setOrder(response)
    } catch (err: any) {
      const errorMessage = err.message || ERROR_MESSAGES.NOT_FOUND
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [orderId, toast])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  return {
    order,
    isLoading,
    error,
    refetch: fetchOrder,
  }
}
