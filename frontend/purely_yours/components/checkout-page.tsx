"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CreditCard, Truck, MapPin, Plus, Edit2, Trash2 } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

declare global {
  interface Window {
    Cashfree: any
  }
}

interface Address {
  id: number
  type: string
  full_name: string
  mobile: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

interface PaymentSession {
  payment_session_id: string
  cashfree_order_id: string
  order_amount: number
  order_currency: string
  return_url: string
  cashfree_mode: string
}

export function CheckoutPage() {
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("online")
  const [orderNotes, setOrderNotes] = useState("")
  const [error, setError] = useState("")
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null)
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  const [addressForm, setAddressForm] = useState({
    type: "home",
    full_name: "",
    mobile: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    is_default: false,
  })

  // Load Cashfree SDK
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js"
    script.async = true
    script.onload = () => setCashfreeLoaded(true)
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchAddresses()
    }
  }, [user])

  const fetchAddresses = async () => {
    try {
      const data = await apiClient.getAddresses()
      setAddresses(data)
      const defaultAddress = data.find((addr: Address) => addr.is_default)
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id)
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error)
    }
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (editingAddress) {
        await apiClient.updateAddress(editingAddress.id, addressForm)
      } else {
        await apiClient.createAddress(addressForm)
      }

      await fetchAddresses()
      setShowAddressForm(false)
      setEditingAddress(null)
      setAddressForm({
        type: "home",
        full_name: "",
        mobile: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India",
        is_default: false,
      })
    } catch (error: any) {
      setError(error.message || "Failed to save address")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAddress = async (addressId: number) => {
    if (confirm("Are you sure you want to delete this address?")) {
      try {
        await apiClient.deleteAddress(addressId)
        await fetchAddresses()
        if (selectedAddress === addressId) {
          setSelectedAddress(null)
        }
      } catch (error: any) {
        setError(error.message || "Failed to delete address")
      }
    }
  }

  const editAddress = (address: Address) => {
    setEditingAddress(address)
    setAddressForm({
      type: address.type,
      full_name: address.full_name,
      mobile: address.mobile,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || "",
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default,
    })
    setShowAddressForm(true)
  }

  const createOrder = async () => {
    if (!selectedAddress) {
      setError("Please select a delivery address")
      return null
    }

    try {
      const response = await apiClient.createOrder({
        address_id: selectedAddress,
        payment_method: paymentMethod,
        notes: orderNotes,
      })

      if (response.success) {
        return response.order
      } else {
        throw new Error(response.message || "Failed to create order")
      }
    } catch (error: any) {
      throw new Error(error.message || "Failed to create order")
    }
  }

  const createPaymentSession = async (orderId: number) => {
    try {
      const response = await apiClient.request("/payments/create-session/", {
        method: "POST",
        body: JSON.stringify({
          order_id: orderId,
          return_url: `${window.location.origin}/payment/success`,
          notify_url: `${process.env.NEXT_PUBLIC_API_URL}/payments/webhook/`,
        }),
      })

      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || "Failed to create payment session")
      }
    } catch (error: any) {
      throw new Error(error.message || "Failed to create payment session")
    }
  }

  const handleCashfreePayment = async (session: PaymentSession) => {
    if (!cashfreeLoaded || !window.Cashfree) {
      throw new Error("Payment gateway not loaded. Please refresh and try again.")
    }

    const cashfree = window.Cashfree({ mode: session.cashfree_mode })

    return new Promise((resolve, reject) => {
      cashfree
        .checkout({
          paymentSessionId: session.payment_session_id,
          returnUrl: session.return_url,
          redirectTarget: "_self",
        })
        .then((result: any) => {
          if (result.error) {
            reject(new Error(result.error.message || "Payment failed"))
          } else {
            resolve(result)
          }
        })
        .catch((error: any) => {
          reject(new Error(error.message || "Payment processing failed"))
        })
    })
  }

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty")
      return
    }

    if (!selectedAddress) {
      setError("Please select a delivery address")
      return
    }

    setLoading(true)
    setProcessingPayment(true)
    setError("")

    try {
      // Create order first
      const order = await createOrder()
      if (!order) {
        throw new Error("Failed to create order")
      }

      if (paymentMethod === "online") {
        // Create payment session
        const session = await createPaymentSession(order.id)
        setPaymentSession(session)

        // Process payment with Cashfree
        await handleCashfreePayment(session)

        // Clear cart after successful payment
        clearCart()

        // Redirect to success page
        router.push(`/payment/success?order_id=${order.id}`)
      } else {
        // For COD, just redirect to success page
        clearCart()
        router.push(`/payment/success?order_id=${order.id}`)
      }
    } catch (error: any) {
      setError(error.message || "Failed to place order")
    } finally {
      setLoading(false)
      setProcessingPayment(false)
    }
  }

  const subtotal = cart?.items?.reduce((sum, item) => {
    // Use variant price if available, otherwise fallback to product price
    const price = item.variant?.price ?? item.product.price
    return sum + price * item.quantity
  }, 0) ?? 0
  const shippingCost = subtotal >= 500 ? 0 : 50
  const taxAmount = subtotal * 0.18
  const total = subtotal + shippingCost + taxAmount

  if (!user) {
    return (
      <div className="p-4">
        <Alert>
          <AlertDescription>Please log in to continue with checkout.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Address
                  </CardTitle>
                  <Dialog open={showAddressForm} onOpenChange={setShowAddressForm}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddressSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="type">Address Type</Label>
                          <Select
                            value={addressForm.type}
                            onValueChange={(value) => setAddressForm({ ...addressForm, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="home">Home</SelectItem>
                              <SelectItem value="work">Work</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input
                            id="full_name"
                            value={addressForm.full_name}
                            onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="mobile">Mobile Number</Label>
                          <Input
                            id="mobile"
                            value={addressForm.mobile}
                            onChange={(e) => setAddressForm({ ...addressForm, mobile: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="address_line_1">Address Line 1</Label>
                          <Input
                            id="address_line_1"
                            value={addressForm.address_line_1}
                            onChange={(e) => setAddressForm({ ...addressForm, address_line_1: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
                          <Input
                            id="address_line_2"
                            value={addressForm.address_line_2}
                            onChange={(e) => setAddressForm({ ...addressForm, address_line_2: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="postal_code">Postal Code</Label>
                          <Input
                            id="postal_code"
                            value={addressForm.postal_code}
                            onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? "Saving..." : editingAddress ? "Update Address" : "Add Address"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <p className="text-gray-500">No addresses found. Please add a delivery address.</p>
                ) : (
                  <RadioGroup
                    value={selectedAddress?.toString()}
                    onValueChange={(value) => setSelectedAddress(Number.parseInt(value))}
                  >
                    {addresses.map((address) => (
                      <div key={address.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <RadioGroupItem value={address.id.toString()} id={`address-${address.id}`} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {address.type}
                            </Badge>
                            {address.is_default && (
                              <Badge variant="default" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium">{address.full_name}</p>
                          <p className="text-sm text-gray-600">
                            {address.address_line_1}
                            {address.address_line_2 && `, ${address.address_line_2}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                          <p className="text-sm text-gray-600">{address.mobile}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => editAddress(address)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteAddress(address.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online">Online Payment (Cards, UPI, Net Banking)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod">Cash on Delivery</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any special instructions for your order..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cart && cart.items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.variant?.id || "no-variant"}`}
                      className="flex justify-between text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        {item.variant && <p className="text-gray-500">{item.variant.name}</p>}
                        <p className="text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{((item.variant?.price ?? item.product.price) * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? "Free" : `₹${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (18% GST)</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {shippingCost === 0 && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <Truck className="h-4 w-4" />
                    <span>Free shipping on orders above ₹500</span>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={handlePlaceOrder}
                  disabled={loading || processingPayment || !cart || cart.items.length === 0 || !selectedAddress}
                >
                  {processingPayment
                    ? "Processing Payment..."
                    : loading
                      ? "Placing Order..."
                      : `Place Order - ₹${total.toFixed(2)}`}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By placing your order, you agree to our Terms & Conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
