"use client"

import { RegisterPage } from "@/components/auth/register-page"
import { AuthProvider } from "@/hooks/use-auth"

export default function Register() {
  return (
    <AuthProvider>
      <RegisterPage />
    </AuthProvider>
  )
}
