"use client"

import { LoginPage } from "@/components/auth/login-page"
import { AuthProvider } from "@/hooks/use-auth"

export default function Login() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  )
}
