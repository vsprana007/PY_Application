"use client"

import { useState, useEffect } from "react"
import { Package, ArrowLeft, Eye, RotateCcw, X } from "lucide-react"
import Link from "next/link"
import { useOrders } from "@/hooks/use-orders"
import { useAuth } from "@/hooks/use-auth"
import { formatCurrency, formatDate, showToast } from "@/lib/utils"
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/constants"

export function OrdersPage() {
  const { orders, fetchOrders, cancelOrder, isLoading } = useOrders()
  const { isAuthenticated } = useAuth()
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
    }
  }, [isAuthenticated])

  const handleCancelOrder = async (orderId: number) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await cancelOrder(orderId)
        showToast("Order cancelled successfully", "success")
      } catch (error) {
        console.error("Failed to cancel order:", error)
        showToast("Failed to cancel order", "error")
      }
    }
  }

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm p-4 flex items-center">
          <Link href="/account" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-semibold">Orders</h1>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <Package size={64} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in to view orders</h2>
          <p className="text-gray-600 text-center mb-6">Please sign in to access your order history</p>
          <Link href="/auth/login">
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium">Sign In</button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm p-4 flex items-center">
          <Link href="/account" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-semibold">Orders</h1>
        </div>

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center">
        <Link href="/account" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-lg font-semibold">My Orders ({orders.length})</h1>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <Package size={64} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-gray-600 text-center mb-6">Start shopping to see your orders here</p>
          <Link href="/categories">
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium">Start Shopping</button>
          </Link>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium">Order #{order.order_number}</h3>
                  <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <img
                  src={order.items[0]?.product.primary_image || "/placeholder.svg"}
                  alt={order.items[0]?.product.name}
                  className="w-12 h-12 object-contain rounded border"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{order.items[0]?.product.name}</p>
                  {order.items.length > 1 && (
                    <p className="text-xs text-gray-600">+{order.items.length - 1} more items</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
                  <p className="text-xs text-gray-600">{order.total_items} items</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewOrder(order)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  <Eye size={16} />
                  View Details
                </button>

                {order.status === "pending" && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                )}

                {order.status === "delivered" && (
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-green-300 text-green-600 rounded text-sm hover:bg-green-50">
                    <RotateCcw size={16} />
                    Reorder
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[90vh] rounded-t-xl overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Order Details</h3>
              <button onClick={() => setShowOrderDetails(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Order Info */}
              <div>
                <h4 className="font-medium mb-2">Order Information</h4>
                <div className="bg-gray-50 p-3 rounded space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Order Number:</span>
                    <span className="text-sm font-medium">{selectedOrder.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Order Date:</span>
                    <span className="text-sm">{formatDate(selectedOrder.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        ORDER_STATUS_COLORS[selectedOrder.status as keyof typeof ORDER_STATUS_COLORS] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {ORDER_STATUS_LABELS[selectedOrder.status as keyof typeof ORDER_STATUS_LABELS] || selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-medium mb-2">Items ({selectedOrder.total_items})</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex gap-3 p-3 border rounded">
                      <img
                        src={item.product.primary_image || "/placeholder.svg"}
                        alt={item.product.name}
                        className="w-16 h-16 object-contain rounded"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{item.product.name}</h5>
                        {item.variant && <p className="text-xs text-gray-600">Variant: {item.variant.name}</p>}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                          <span className="font-medium">{formatCurrency(item.price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div>
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">{selectedOrder.shipping_address.full_name}</p>
                    <p className="text-sm">{selectedOrder.shipping_address.address_line_1}</p>
                    {selectedOrder.shipping_address.address_line_2 && (
                      <p className="text-sm">{selectedOrder.shipping_address.address_line_2}</p>
                    )}
                    <p className="text-sm">
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}{" "}
                      {selectedOrder.shipping_address.postal_code}
                    </p>
                    <p className="text-sm">{selectedOrder.shipping_address.phone}</p>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div>
                <h4 className="font-medium mb-2">Order Summary</h4>
                <div className="bg-gray-50 p-3 rounded space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal:</span>
                    <span className="text-sm">{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Shipping:</span>
                    <span className="text-sm">{formatCurrency(selectedOrder.shipping_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tax:</span>
                    <span className="text-sm">{formatCurrency(selectedOrder.tax_amount)}</span>
                  </div>
                  <div className="border-t pt-1 flex justify-between">
                    <span className="font-medium">Total:</span>
                    <span className="font-medium">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
