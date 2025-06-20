"use client"

import { X, Lock, User, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AuthRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string
  redirectPath?: string
}

export function AuthRequiredModal({ isOpen, onClose, message, redirectPath }: AuthRequiredModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleLogin = () => {
    // Store the redirect path so we can come back after login
    if (redirectPath) {
      localStorage.setItem("redirectAfterAuth", redirectPath)
    }
    router.push("/auth/login")
  }

  const handleRegister = () => {
    // Store the redirect path so we can come back after registration
    if (redirectPath) {
      localStorage.setItem("redirectAfterAuth", redirectPath)
    }
    router.push("/auth/register")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">{message || "Please sign in or create an account to continue"}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
          >
            <User size={20} />
            Sign In
          </button>

          <button
            onClick={handleRegister}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <UserPlus size={20} />
            Create Account
          </button>

          <button
            onClick={onClose}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="mt-6 text-center">
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
    </div>
  )
}
