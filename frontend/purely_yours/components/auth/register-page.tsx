"use client"

import { useState } from "react"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Basic Info, 2: Mobile Verification, 3: OTP Verification
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    mobile: "",
    countryCode: "+91",
    otp: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleContinue = async () => {
    setError("")
    setLoading(true)

    try {
      if (step === 1) {
        // Validate basic info
        if (!formData.fullName || !formData.email || !formData.password) {
          setError("Please fill in all required fields")
          return
        }

        // Register user
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
          }),
        })

        const data = await response.json()
        if (!data.success) {
          setError(data.error || "Registration failed")
          return
        }

        setStep(2)
      } else if (step === 2) {
        // Send OTP
        if (!formData.mobile) {
          setError("Please enter your mobile number")
          return
        }

        const response = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mobile: formData.mobile,
            countryCode: formData.countryCode,
          }),
        })

        const data = await response.json()
        if (!data.success) {
          setError(data.error || "Failed to send OTP")
          return
        }

        setStep(3)
      } else if (step === 3) {
        // Verify OTP
        if (!formData.otp || formData.otp.length !== 6) {
          setError("Please enter a valid 6-digit OTP")
          return
        }

        const response = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mobile: formData.mobile,
            countryCode: formData.countryCode,
            otp: formData.otp,
          }),
        })

        const data = await response.json()
        if (!data.success) {
          setError(data.error || "Invalid OTP")
          return
        }

        // Set authenticated user
        localStorage.setItem("userMode", "authenticated")
        localStorage.setItem("authToken", data.token)
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            name: formData.fullName,
            email: formData.email,
            mobile: `${formData.countryCode}${formData.mobile}`,
          }),
        )

        // Redirect to home
        router.push("/")
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: formData.mobile,
          countryCode: formData.countryCode,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setError("") // Clear any previous errors
        // You might want to show a success message here
      } else {
        setError(data.error || "Failed to resend OTP")
      }
    } catch (error) {
      setError("Failed to resend OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
      {/* Header with Logo */}
      <div className="text-center pt-8 pb-6">
        <img src="/placeholder.svg?height=80&width=200" alt="Purely Yours Logo" className="mx-auto mb-4" />
      </div>

      <div className="flex-1 px-6">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Create Account</h1>
              <p className="text-gray-600">Join our wellness community for a personalized experience</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 pr-12"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
              </div>
              <button
                onClick={handleContinue}
                disabled={loading || !formData.fullName || !formData.email || !formData.password}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "Creating Account..." : "Continue"} <ArrowRight size={20} />
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-green-600 font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Mobile Number Verification */}
        {step === 2 && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Verify Mobile Number</h1>
              <p className="text-gray-600">We'll send you an OTP to verify your mobile number</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mobile Number</label>
                <div className="flex gap-2">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    className="p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                  </select>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="flex-1 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>
              <button
                onClick={handleContinue}
                disabled={loading || !formData.mobile}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "Sending OTP..." : "Send OTP"} <ArrowRight size={20} />
              </button>
              <button
                onClick={() => {
                  // Set guest mode and continue
                  localStorage.setItem("userMode", "guest")
                  router.push("/")
                }}
                className="w-full text-green-600 py-2 text-center underline"
              >
                Skip for now (Continue as Guest)
              </button>
            </div>
          </div>
        )}

        {/* Step 3: OTP Verification */}
        {step === 3 && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Enter OTP</h1>
              <p className="text-gray-600">
                We've sent a 6-digit code to {formData.countryCode} {formData.mobile}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Enter OTP</label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                  className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?{" "}
                  <button
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-green-600 underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </p>
              </div>
              <button
                onClick={handleContinue}
                disabled={loading || formData.otp.length !== 6}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify & Complete Registration"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-sm text-gray-500">
        By continuing, you agree to our Terms & Conditions and Privacy Policy
      </div>
    </div>
  )
}
