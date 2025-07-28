"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Package, Truck, Home, Receipt } from "lucide-react"
import { apiClient } from "@/lib/api"


interface Order {
  id: string
  order_number: string
  status: string
  payment_status: string
  payment_method: string
  subtotal: string
  shipping_cost: string
  tax_amount: string
  discount_amount: string
  total_amount: string
  created_at: string
  items: Array<{
    id: number
    product: {
      id: number
      name: string
      slug: string
      price: string
      original_price: string
      discount_percentage: number
      primary_image: string
      stock_quantity: number
    }
    variant?: {
      id: number
      name: string
      sku: string
      price: string
      original_price: string
      discount_percentage: number
      stock_quantity: number
      is_active: boolean
    }
    quantity: number
    price: string
    total: string
  }>
  shipping_name: string
  shipping_mobile: string
  shipping_address_line_1: string
  shipping_address_line_2?: string
  shipping_city: string
  shipping_state: string
  shipping_pincode: string
  tracking_number: string
  estimated_delivery: string | null
  notes: string
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
    
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Loading order details...</p>
          </div>
        </div>
  
    )
  }

  if (error || !order) {
    return (
    
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
   
    )
  }

  return (
    
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Header */}
          <Card className={`border-2 ${order.payment_status === 'paid' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
            <CardContent className="p-6 text-center">
              <CheckCircle className={`h-16 w-16 mx-auto mb-4 ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`} />
              <h1 className={`text-2xl font-bold mb-2 ${order.payment_status === 'paid' ? 'text-green-800' : 'text-yellow-800'}`}>
                {order.payment_status === 'paid' ? 'Order Placed Successfully!' : 'Order Received!'}
              </h1>
              <p className={order.payment_status === 'paid' ? 'text-green-700' : 'text-yellow-700'}>
                {order.payment_status === 'paid' 
                  ? "Thank you for your order. We'll send you a confirmation email shortly."
                  : "Your order has been received. Payment confirmation is pending."
                }
              </p>
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
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Order Number</span>
                    <span className="font-mono text-sm font-medium">{order.order_number}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Order Date</span>
                    <span className="text-sm font-medium">{new Date(order.created_at).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Order Status</span>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Payment Status</span>
                    <Badge className={getPaymentStatusColor(order.payment_status)}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium text-gray-700">Payment Method</span>
                <span className="capitalize font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {order.payment_method.replace("_", " ")}
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{parseFloat(order.subtotal).toFixed(2)}</span>
                </div>

                {parseFloat(order.tax_amount) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tax (GST)</span>
                    <span className="font-medium">₹{parseFloat(order.tax_amount).toFixed(2)}</span>
                  </div>
                )}

                {parseFloat(order.shipping_cost) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Shipping Charges</span>
                    <span className="font-medium">₹{parseFloat(order.shipping_cost).toFixed(2)}</span>
                  </div>
                )}

                {parseFloat(order.discount_amount) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-medium">Discount Applied</span>
                    <span className="text-green-600 font-medium">-₹{parseFloat(order.discount_amount).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Total Amount */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center bg-green-50 p-4 rounded-lg">
                  <span className="text-xl font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-green-600">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
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
              {order.items && order.items.length > 0 ? (
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0">
                        <img
                          src={item.product.primary_image || "/placeholder.svg?height=80&width=80"}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-md border border-gray-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1 truncate">
                          {item.product.name}
                        </h4>
                        {item.variant && (
                          <p className="text-xs text-gray-600 mb-2 bg-gray-200 inline-block px-2 py-1 rounded-full">
                            {item.variant.name}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded-full">
                            Qty: {item.quantity}
                          </span>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              ₹{parseFloat(item.total).toFixed(2)}
                            </p>
                            {item.variant && parseFloat(item.variant.original_price) > parseFloat(item.variant.price) && (
                              <p className="text-xs text-gray-500 line-through">
                                ₹{parseFloat(item.variant.original_price).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Order Summary Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                      <span>Total Items:</span>
                      <span className="font-medium">{order.items.reduce((total, item) => total + item.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Items Total:</span>
                      <span className="text-lg font-bold text-green-600">
                        ₹{order.items.reduce((total, item) => total + parseFloat(item.total), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                  <p className="text-sm">This order doesn't have any items associated with it.</p>
                </div>
              )}
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
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">{order.shipping_name}</p>
                    <p className="text-gray-700 font-medium">{order.shipping_mobile}</p>
                  </div>
                </div>
                
                <div className="ml-5 space-y-1">
                  <p className="text-gray-800 font-medium">{order.shipping_address_line_1}</p>
                  {order.shipping_address_line_2 && (
                    <p className="text-gray-700">{order.shipping_address_line_2}</p>
                  )}
                  <p className="text-gray-700">
                    <span className="font-medium">{order.shipping_city}</span>, {order.shipping_state} - <span className="font-mono">{order.shipping_pincode}</span>
                  </p>
                </div>
                
                {/* Tracking Information */}
                {order.tracking_number && (
                  <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <p className="font-semibold text-blue-800">Tracking Information</p>
                    </div>
                    <p className="text-blue-700 font-mono text-sm bg-white px-3 py-2 rounded border">
                      {order.tracking_number}
                    </p>
                  </div>
                )}
                
                {/* Estimated Delivery */}
                {order.estimated_delivery && (
                  <div className="mt-3 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-4 w-4 text-green-600" />
                      <p className="font-semibold text-green-800">Estimated Delivery</p>
                    </div>
                    <p className="text-green-700 font-medium">
                      {new Date(order.estimated_delivery).toLocaleDateString("en-IN", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <Button 
              className="w-full py-3 text-base font-semibold bg-green-600 hover:bg-green-700 transition-colors"
              onClick={() => router.push(`/account/orders`)}
            >
              <Receipt className="h-5 w-5 mr-2" />
              View All Orders
            </Button>
            
            
            <Button 
              variant="outline" 
              className="w-full py-3 text-base font-semibold border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => router.push("/")}
            >
              <Home className="h-5 w-5 mr-2" />
              Continue Shopping
            </Button>
          </div>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-800 mb-1">Order Confirmation</p>
                    <p className="text-green-700 text-sm">You'll receive an email confirmation with order details shortly</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-800 mb-1">Order Processing</p>
                    <p className="text-blue-700 text-sm">We'll carefully prepare and package your order for shipping</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-3 bg-purple-50 border-l-4 border-purple-400 rounded-r-lg">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-purple-800 mb-1">Shipping & Tracking</p>
                    <p className="text-purple-700 text-sm">You'll receive tracking details once your order is shipped</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-3 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-orange-800 mb-1">Safe Delivery</p>
                    <p className="text-orange-700 text-sm">Your order will be safely delivered to your specified address</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

  )
}
