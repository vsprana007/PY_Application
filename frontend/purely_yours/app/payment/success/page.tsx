"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Package, Truck, Home, Receipt } from "lucide-react"
import { apiClient } from "@/lib/api"
import { MobileLayout } from "@/components/mobile-layout"

interface Order {
  id: number
  order_number: string
  status: string
  payment_status: string
  payment_method: string
  total_amount: number
  created_at: string
  items: Array<{
    id: number
    product: {
      name: string
      image: string
    }
    variant?: {
      name: string
    }
    quantity: number
    price: number
    total: number
  }>
  shipping_name: string
  shipping_mobile: string
  shipping_address_line_1: string
  shipping_address_line_2?: string
  shipping_city: string
  shipping_state: string
  shipping_pincode: string
}

export default function PaymentSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    } else {
      setError("Order ID not found")
      setLoading(false)
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const response = await apiClient.getOrder(orderId!)
      if (response) {
        setOrder(response)
      } else {
        setError("Order not found")
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch order details")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  if (error || !order) {
    return (
      <MobileLayout>
        <div className="p-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <p className="text-red-800 mb-4">{error || "Order not found"}</p>
              <Button onClick={() => router.push("/")} variant="outline">
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Header */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-green-800 mb-2">Order Placed Successfully!</h1>
              <p className="text-green-700">Thank you for your order. We'll send you a confirmation email shortly.</p>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Order Number</span>
                <span className="font-mono text-sm">{order.order_number}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Order Status</span>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Payment Status</span>
                <Badge className={getPaymentStatusColor(order.payment_status)}>
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Payment Method</span>
                <span className="capitalize">{order.payment_method.replace("_", " ")}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount</span>
                <span className="font-bold text-lg">₹{order.total_amount}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Order Date</span>
                <span>{new Date(order.created_at).toLocaleDateString("en-IN")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                    <img
                      src={item.product.image || "/placeholder.svg?height=60&width=60"}
                      alt={item.product.name}
                      className="w-15 h-15 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      {item.variant && <p className="text-sm text-gray-600">{item.variant.name}</p>}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                        <span className="font-medium">₹{item.total}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{order.shipping_name}</p>
                <p className="text-gray-600">{order.shipping_address_line_1}</p>
                {order.shipping_address_line_2 && <p className="text-gray-600">{order.shipping_address_line_2}</p>}
                <p className="text-gray-600">
                  {order.shipping_city}, {order.shipping_state} {order.shipping_pincode}
                </p>
                <p className="text-gray-600">{order.shipping_mobile}</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full" onClick={() => router.push(`/account/orders`)}>
              View All Orders
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
              <Home className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </div>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Order Confirmation</p>
                    <p className="text-gray-600">You'll receive an email confirmation shortly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Processing</p>
                    <p className="text-gray-600">We'll prepare your order for shipping</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Shipping</p>
                    <p className="text-gray-600">You'll get tracking details once shipped</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Delivery</p>
                    <p className="text-gray-600">Your order will be delivered to your address</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  )
}
