"use client"
import { ArrowRight, User, UserPlus, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function WelcomePage() {
  const router = useRouter()

  const handleContinueAsGuest = () => {
    // Set guest mode in localStorage
    localStorage.setItem("userMode", "guest")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex flex-col">
      {/* Header with Logo */}
      <div className="text-center pt-12 pb-8">
        <img src="/placeholder.svg?height=100&width=250" alt="Purely Yours Logo" className="mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Purely Yours</h1>
        <p className="text-gray-600 text-lg">Your journey to natural wellness starts here</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 max-w-md mx-auto w-full">
        <div className="space-y-4">
          {/* Login Option */}
          <Link href="/auth/login">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Log In</h3>
                  <p className="text-gray-600 text-sm">Already have an account? Sign in to continue</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </Link>

          {/* Register Option */}
          <Link href="/auth/register">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Create Account</h3>
                  <p className="text-gray-600 text-sm">New to Purely Yours? Join our wellness community</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </Link>

          {/* Continue as Guest Option */}
          <button
            onClick={handleContinueAsGuest}
            className="w-full bg-gray-100 rounded-xl p-6 hover:bg-gray-200 transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-gray-900">Continue as Guest</h3>
                <p className="text-gray-600 text-sm">Browse and shop without creating an account</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 space-y-4">
          <h3 className="text-center text-lg font-semibold text-gray-900">Why join Purely Yours?</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Personalized wellness recommendations</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Exclusive member discounts and offers</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Track your orders and wellness journey</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Access to expert consultations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 px-6">
        <p className="text-xs text-gray-500">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-green-600 underline">
            Terms & Conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-green-600 underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
