"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthCheckerProps {
  children: React.ReactNode
}

export function AuthChecker({ children }: AuthCheckerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuthStatus = () => {
      // Skip auth check for auth-related pages
      const authPages = ["/welcome", "/auth/login", "/auth/register"]
      if (authPages.includes(pathname)) {
        setIsChecking(false)
        return
      }

      // Check if user has visited before
      const hasVisited = localStorage.getItem("hasVisited")
      const userMode = localStorage.getItem("userMode")

      if (!hasVisited) {
        // First time visitor - redirect to welcome page
        localStorage.setItem("hasVisited", "true")
        router.push("/welcome")
        return
      }

      // Check if user needs to be redirected after auth
      const redirectPath = localStorage.getItem("redirectAfterAuth")
      if (redirectPath && userMode === "authenticated") {
        localStorage.removeItem("redirectAfterAuth")
        router.push(redirectPath)
        return
      }

      setIsChecking(false)
    }

    checkAuthStatus()
  }, [pathname, router])

  // Show loading or nothing while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <img src="/placeholder.svg?height=80&width=200" alt="Purely Yours Logo" className="mx-auto mb-4" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
