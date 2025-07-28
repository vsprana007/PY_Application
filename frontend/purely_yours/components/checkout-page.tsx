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
import { MessageModal } from "@/components/ui/message-modal"
import { ArrowLeft, CreditCard, Truck, MapPin, Plus, Edit2, Trash2 } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { useBuyNow, type BuyNowItem } from "@/hooks/use-buy-now"
import { apiClient } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  const { getBuyNowItem, clearBuyNowItem } = useBuyNow()
  const [loading, setLoading] = useState(false)
  const [buyNowItem, setBuyNowItem] = useState<BuyNowItem | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("online")
  const [orderNotes, setOrderNotes] = useState("")
  // Error and info modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'info' | 'warning' | 'confirm',
    title: '',
    message: '',
    onConfirm: undefined as (() => void) | undefined,
    showCancel: false,
    confirmText: 'OK',
    cancelText: 'Cancel',
  })
  const openModal = (options: Partial<typeof modal>) => setModal({ ...modal, ...options, isOpen: true })
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }))
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)

  const [addressForm, setAddressForm] = useState({
    type: "home",
    name: "",
    mobile: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    is_default: false,
  })

  const [showCardForm, setShowCardForm] = useState(false)
  const [showOtpForm, setShowOtpForm] = useState(false)
  const [otpData, setOtpData] = useState<any>(null)
  const [cardForm, setCardForm] = useState({
    card_number: "",
    card_expiry_mm: "",
    card_expiry_yy: "",
    card_cvv: "",
    card_holder_name: "",
  })
  const [otp, setOtp] = useState("")
  const [otpVerified, setOtpVerified] = useState(false)

  useEffect(() => {
    if (user) {
      fetchAddresses()
    }
  }, [user])

  // Check for buy now item from localStorage
  useEffect(() => {
    const buyNowData = getBuyNowItem()
    if (buyNowData) {
      setBuyNowItem(buyNowData)
      // Clear the localStorage after setting state
      clearBuyNowItem()
    }
  }, [getBuyNowItem, clearBuyNowItem])

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
    // clear modal error
    closeModal()

    try {
      if (editingAddress) {
        await apiClient.updateAddress(editingAddress.id, addressForm)
        openModal({ type: 'success', title: 'Address Updated', message: 'Address updated successfully.' })
      } else {
        await apiClient.createAddress(addressForm)
        openModal({ type: 'success', title: 'Address Added', message: 'Address added successfully.' })
      }
      await fetchAddresses()
      setShowAddressForm(false)
      setEditingAddress(null)
      setAddressForm({
        type: "home",
        name: "",
        mobile: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        is_default: false,
      })
    } catch (error: any) {
      openModal({ type: 'error', title: 'Error', message: error.message || 'Failed to save address' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAddress = async (addressId: number) => {
    openModal({
      type: 'confirm',
      title: 'Delete Address',
      message: 'Are you sure you want to delete this address?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: async () => {
        try {
          await apiClient.deleteAddress(addressId)
          openModal({ type: 'success', title: 'Deleted', message: 'Address deleted successfully.' })
          await fetchAddresses()
          if (selectedAddress === addressId) {
            setSelectedAddress(null)
          }
        } catch (error: any) {
          openModal({ type: 'error', title: 'Error', message: error.message || 'Failed to delete address' })
        }
      },
    })
  }

  const editAddress = (address: Address) => {
    setEditingAddress(address)
    setAddressForm({
      type: address.type,
      name: address.full_name,
      mobile: address.mobile,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || "",
      city: address.city,
      state: address.state,
      pincode: address.postal_code,
      country: address.country,
      is_default: address.is_default,
    })
    setShowAddressForm(true)
  }

  const createOrder = async () => {
    if (!selectedAddress) {
      openModal({ type: 'error', title: 'Error', message: 'Please select a delivery address' })
      return null
    }

    // Check if we have buy now item or cart items
    const hasCartItems = cart && cart.items.length > 0
    const hasBuyNowItem = buyNowItem

    if (!hasCartItems && !hasBuyNowItem) {
      openModal({ type: 'error', title: 'Error', message: 'No items to checkout' })
      return null
    }

    try {
      let orderItems: Array<{
        product_id: number;
        variant_id: number | null;
        quantity: number;
        price: number;
      }> = []

      if (hasBuyNowItem) {
        // Use buy now item
        orderItems = [{
          product_id: buyNowItem.product.id,
          variant_id: buyNowItem.variant?.id || null,
          quantity: buyNowItem.quantity,
          price: buyNowItem.variant?.price ?? buyNowItem.product.price,
        }]
      } else if (hasCartItems) {
        // Use cart items
        orderItems = cart!.items.map((item) => ({
          product_id: item.product.id,
          variant_id: item.variant?.id || null,
          quantity: item.quantity,
          price: item.variant?.price ?? item.product.price,
        }))
      }

      const response = await apiClient.createOrder({
        address_id: selectedAddress,
        payment_method: paymentMethod,
        notes: orderNotes,
        items: orderItems,
      })

      if (response.success) {
        return response.order
      } else {
        throw new Error(response.message || "Failed to create order")
      }
    } catch (error: any) {
      openModal({ type: 'error', title: 'Error', message: error.message || 'Failed to create order' })
      return null
    }
  }

  const handleCardPayment = async () => {
    if (!paymentSession) {
      openModal({ type: 'error', title: 'Error', message: 'Payment session not found' })
      return
    }

    // Validate card form data
    if (
      !cardForm.card_number ||
      !cardForm.card_holder_name ||
      !cardForm.card_expiry_mm ||
      !cardForm.card_expiry_yy ||
      !cardForm.card_cvv
    ) {
      openModal({ type: 'error', title: 'Error', message: 'Please fill in all card details.' })
      return
    }

    // Validate card number (basic check)
    const cardNumber = cardForm.card_number.replace(/\s/g, "")
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      openModal({ type: 'error', title: 'Error', message: 'Please enter a valid card number.' })
      return
    }

    // Validate expiry month
    const month = Number.parseInt(cardForm.card_expiry_mm)
    if (month < 1 || month > 12) {
      openModal({ type: 'error', title: 'Error', message: 'Please enter a valid expiry month (01-12).' })
      return
    }

    // Validate CVV
    if (cardForm.card_cvv.length < 3 || cardForm.card_cvv.length > 4) {
      openModal({ type: 'error', title: 'Error', message: 'Please enter a valid CVV.' })
      return
    }

    setLoading(true)
    closeModal()

    try {
      const response = await apiClient.processCardPayment({
        payment_session_id: paymentSession.payment_session_id,
        card_data: cardForm,
      })

      if (response.success) {
        if (response.requires_otp) {
          // OTP required
          setOtpData({
            otp_url: response.otp_url,
            payment_session_id: paymentSession.payment_session_id,
          })
          setShowOtpForm(true)
          setShowCardForm(false)
        } else if (response.payment_status === "SUCCESS") {
          // Payment successful
          if (!buyNowItem) {
            clearCart()
          }
          // Clear buy now item state (if it exists)
          setBuyNowItem(null)
          // Add delay before redirect
          setTimeout(() => {
            router.push(`/payment/success?order_id=${response.order_id}`)
          }, 1000)
        } else {
          openModal({ type: 'error', title: 'Error', message: response.message || 'Payment processing failed' })
        }
      } else {
        openModal({ type: 'error', title: 'Error', message: response.message || 'Payment processing failed' })
      }
    } catch (error: any) {
      console.error("Payment processing error:", error)
      openModal({ type: 'error', title: 'Error', message: error.message || 'Payment processing failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async () => {
    if (!otp || !otpData) {
      openModal({ type: 'error', title: 'Error', message: 'Please enter OTP' })
      return
    }

    setLoading(true)
    closeModal()

    try {
      const response = await apiClient.verifyPaymentOTP({
        otp_url: otpData.otp_url,
        otp: otp,
        payment_session_id: otpData.payment_session_id,
      })

      if (response.success && response.payment_status === "SUCCESS") {
        // Show success message before redirect
        closeModal()
        setOtpVerified(true)
        
        // Only clear cart if it's not a buy now item
        if (!buyNowItem) {
          clearCart()
        }
        // Clear buy now item state (if it exists)
        setBuyNowItem(null)
        
        // Add delay to show success state before redirect
        setTimeout(() => {
          setLoading(false)
          router.push(`/payment/success?order_id=${response.order_id}`)
        }, 1500)
      } else {
        openModal({ type: 'error', title: 'Error', message: response.message || 'OTP verification failed' })
      }
    } catch (error: any) {
      console.error("OTP verification error:", error)
      openModal({ type: 'error', title: 'Error', message: error.message || 'OTP verification failed. Please try again.' })
      setLoading(false)
    }
    // Don't set loading false here if success - let the timeout handle it
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const handleCardInputChange = (field: string, value: string) => {
    if (field === "card_number") {
      value = formatCardNumber(value)
    } else if (field === "card_expiry_mm") {
      value = value.replace(/[^0-9]/g, "").slice(0, 2)
      // Validate month (01-12)
      if (value.length === 2) {
        const month = Number.parseInt(value)
        if (month < 1 || month > 12) {
          return // Don't update if invalid month
        }
      }
    } else if (field === "card_expiry_yy") {
      value = value.replace(/[^0-9]/g, "").slice(0, 2)
    } else if (field === "card_cvv") {
      value = value.replace(/[^0-9]/g, "").slice(0, 4)
    }

    setCardForm((prev) => ({ ...prev, [field]: value }))
  }

  const handlePlaceOrder = async () => {
    if (!buyNowItem && (!cart || cart.items.length === 0)) {
      openModal({ type: 'error', title: 'Error', message: 'No items to checkout' })
      return
    }

    if (!selectedAddress) {
      openModal({ type: 'error', title: 'Error', message: 'Please select a delivery address' })
      return
    }

    setLoading(true)
    setProcessingPayment(true)
    closeModal()

    try {
      // Create order first
      const order = await createOrder()
      if (!order) {
        throw new Error("Failed to create order")
      }
      console.log("Order created:", order)

      if (paymentMethod === "online") {
        // Create payment session
        const sessionResponse = await apiClient.createPaymentSession({
          order_id: order.id,
          return_url: `${window.location.origin}/payment/success`,
          notify_url: `${process.env.NEXT_PUBLIC_API_URL}/payments/webhook/`,
        })

        if (sessionResponse.success) {
          console.log("Payment session created:", sessionResponse.data)
          setPaymentSession(sessionResponse.data)
          setShowCardForm(true)
        } else {
          throw new Error(sessionResponse.message || "Failed to create payment session")
        }
      } else {
        // For COD, just redirect to success page
        if (!buyNowItem) {
          clearCart()
        }
        // Clear buy now item state (if it exists)
        setBuyNowItem(null)
        router.push(`/payment/success?order_id=${order.id}`)
      }
    } catch (error: any) {
      setError(error.message || "Failed to place order")
    } finally {
      setLoading(false)
      setProcessingPayment(false)
    }
  }

  // Calculate totals based on buy now item or cart items
  const subtotal = buyNowItem 
    ? (buyNowItem.variant?.price ?? buyNowItem.product.price) * buyNowItem.quantity
    : cart?.items?.reduce((sum, item) => {
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
        <MessageModal
          isOpen={true}
          onClose={() => router.push("/auth/login")}
          type="info"
          title="Login Required"
          message="Please log in to continue with checkout."
        />
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

        <MessageModal
          isOpen={modal.isOpen}
          onClose={closeModal}
          onConfirm={modal.onConfirm}
          type={modal.type}
          title={modal.title}
          message={modal.message}
          confirmText={modal.confirmText}
          cancelText={modal.cancelText}
          showCancel={modal.showCancel}
        />

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
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={addressForm.name}
                            onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
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
                          <Label htmlFor="pincode">Postal Code</Label>
                          <Input
                            id="pincode"
                            value={addressForm.pincode}
                            onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
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
                {/* Order Items */}
                <div className="space-y-3">
                  {buyNowItem ? (
                    // Show buy now item
                    <div className="flex justify-between text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{buyNowItem.product.name}</p>
                        {buyNowItem.variant && <p className="text-gray-500">{buyNowItem.variant.name}</p>}
                        <p className="text-gray-500">Qty: {buyNowItem.quantity}</p>
                      </div>
                      <p className="font-medium">
                        ₹{((buyNowItem.variant?.price ?? buyNowItem.product.price) * buyNowItem.quantity).toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    // Show cart items
                    cart &&
                    cart.items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.variant?.id || "no-variant"}`}
                        className="flex justify-between text-sm"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          {item.variant && <p className="text-gray-500">{item.variant.name}</p>}
                          <p className="text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">
                          ₹{((item.variant?.price ?? item.product.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))
                  )}
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
                  disabled={loading || processingPayment || (!buyNowItem && (!cart || cart.items.length === 0)) || !selectedAddress}
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

        {/* Custom Card Payment Form */}
        {showCardForm && paymentSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Enter Card Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="card_number">Card Number</Label>
                  <Input
                    id="card_number"
                    placeholder="1234 5678 9012 3456"
                    value={cardForm.card_number}
                    onChange={(e) => handleCardInputChange("card_number", e.target.value)}
                    maxLength={19}
                  />
                </div>

                <div>
                  <Label htmlFor="card_holder_name">Cardholder Name</Label>
                  <Input
                    id="card_holder_name"
                    placeholder="John Doe"
                    value={cardForm.card_holder_name}
                    onChange={(e) => handleCardInputChange("card_holder_name", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="card_expiry_mm">Month</Label>
                    <Input
                      id="card_expiry_mm"
                      placeholder="MM"
                      value={cardForm.card_expiry_mm}
                      onChange={(e) => handleCardInputChange("card_expiry_mm", e.target.value)}
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="card_expiry_yy">Year</Label>
                    <Input
                      id="card_expiry_yy"
                      placeholder="YY"
                      value={cardForm.card_expiry_yy}
                      onChange={(e) => handleCardInputChange("card_expiry_yy", e.target.value)}
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="card_cvv">CVV</Label>
                    <Input
                      id="card_cvv"
                      placeholder="123"
                      value={cardForm.card_cvv}
                      onChange={(e) => handleCardInputChange("card_cvv", e.target.value)}
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setShowCardForm(false)
                      setPaymentSession(null)
                      setError("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleCardPayment}
                    disabled={
                      loading ||
                      !cardForm.card_number ||
                      !cardForm.card_holder_name ||
                      !cardForm.card_expiry_mm ||
                      !cardForm.card_expiry_yy ||
                      !cardForm.card_cvv
                    }
                  >
                    {loading ? "Processing..." : "Pay Now"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* OTP Verification Form */}
        {showOtpForm && otpData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Enter OTP</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                {otpVerified && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                      ✅ Payment verified successfully! Redirecting to success page...
                    </AlertDescription>
                  </Alert>
                )}

                <p className="text-sm text-gray-600">Please enter the OTP sent to your registered mobile number</p>

                <div>
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    maxLength={6}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setShowOtpForm(false)
                      setShowCardForm(true)
                      setOtp("")
                      setOtpData(null)
                      setError("")
                      setOtpVerified(false)
                    }}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button className="flex-1" onClick={handleOtpSubmit} disabled={loading || otp.length !== 6}>
                    {loading ? (otpVerified ? "Payment Successful! Redirecting..." : "Verifying...") : "Verify OTP"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
// Error state for card/OTP forms
const [error, setError] = useState<string>("")

