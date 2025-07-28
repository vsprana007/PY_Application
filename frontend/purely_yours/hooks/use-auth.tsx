"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { apiClient } from "@/lib/api"
import { STORAGE_KEYS, ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"
import { safeGet, safeString, getErrorMessage } from "@/lib/utils"

interface User {
  id: number
  email: string
  username?: string
  first_name: string
  last_name: string
  mobile?: string
  is_mobile_verified: boolean
  date_joined: string
  profile_image?: string
  date_of_birth?: string
  gender?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<any>
  register: (userData: RegisterData) => Promise<any>
  logout: () => void
  refreshUser: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<any>
  sendOTP: (mobile: string, countryCode: string) => Promise<any>
  verifyOTP: (mobile: string, countryCode: string, otp: string) => Promise<any>
}

interface RegisterData {
  first_name: string
  last_name: string
  email: string
  password: string
  mobile?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const isAuthenticated = !!user

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) : null
      if (token) {
        apiClient.setToken(token)
        const response = await apiClient.getProfile()
        if (response && !response.error) {
          const userData = {
            id: Number(safeGet(response, "id", 0)) || 0,
            email: safeString(safeGet(response, "email")),
            username: safeString(safeGet(response, "username")),
            first_name: safeString(safeGet(response, "first_name")),
            last_name: safeString(safeGet(response, "last_name")),
            mobile: safeString(safeGet(response, "mobile")),
            is_mobile_verified: !!safeGet(response, "is_mobile_verified"),
            date_joined: safeString(safeGet(response, "date_joined")),
            profile_image: safeString(safeGet(response, "profile_image")),
            date_of_birth: safeString(safeGet(response, "date_of_birth")),
            gender: safeString(safeGet(response, "gender")),
          }
          setUser(userData)
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userData))
          }
        } else {
          clearAuthData()
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      clearAuthData()
    } finally {
      setIsLoading(false)
    }
  }

  const clearAuthData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER_MODE)
      localStorage.removeItem(STORAGE_KEYS.USER_INFO)
    }
    apiClient.clearToken()
  }

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      const errorMsg = "Email and password are required"
      toast({
        title: "Error",
        description: String(errorMsg),
        variant: "destructive",
      })
      return { success: false, message: errorMsg }
    }

    try {
      setIsLoading(true)
      const response = await apiClient.login({ email: email.trim(), password })

      if (safeGet(response, "success")) {
        const userData = safeGet(response, "user")
        const tokens = safeGet(response, "tokens") as { access?: string; refresh?: string }

        if (userData && tokens?.access) {
          const user = {
            id: Number(safeGet(response, "id", 0)) || 0,
            email: safeString(safeGet(userData, "email")),
            first_name: safeString(safeGet(userData, "first_name")),
            last_name: safeString(safeGet(userData, "last_name")),
            mobile: safeString(safeGet(userData, "mobile")),
            is_mobile_verified: !!safeGet(userData, "is_mobile_verified"),
            date_joined: safeString(safeGet(userData, "date_joined")),
            profile_image: safeString(safeGet(userData, "profile_image")),
          }

          apiClient.setToken(tokens.access)
          setUser(user)

          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, tokens.access)
            if (tokens.refresh) {
              localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh)
            }
            localStorage.setItem(STORAGE_KEYS.USER_MODE, "authenticated")
            localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user))
          }

          toast({
            title: "Success",
            description: SUCCESS_MESSAGES.LOGIN_SUCCESS,
          })
        }

        return response
      } else {
        const errorMsg = safeGet(response, "message") || ERROR_MESSAGES.INVALID_CREDENTIALS
        toast({
          title: "Error",
          description: String(errorMsg),
          variant: "destructive",
        })
        return response
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error) || ERROR_MESSAGES.NETWORK_ERROR
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    if (!userData?.email || !userData?.password || !userData?.first_name || !userData?.last_name) {
      const errorMsg = "All required fields must be filled"
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
      return { success: false, message: errorMsg }
    }

    try {
      setIsLoading(true)
      const response = await apiClient.register({
        ...userData,
        email: userData.email.trim(),
        first_name: userData.first_name.trim(),
        last_name: userData.last_name.trim(),
        mobile: userData.mobile?.trim(),
      })

      if (safeGet(response, "success")) {
        const user = safeGet(response, "user")
        const tokens = safeGet(response, "tokens") as { access?: string; refresh?: string }

        if (user && tokens?.access) {
          const userData = {
            id: Number(safeGet(response, "id", 0)) || 0,
            email: safeString(safeGet(user, "email")),
            first_name: safeString(safeGet(user, "first_name")),
            last_name: safeString(safeGet(user, "last_name")),
            mobile: safeString(safeGet(user, "mobile")),
            is_mobile_verified: !!safeGet(user, "is_mobile_verified"),
            date_joined: safeString(safeGet(user, "date_joined")),
            profile_image: safeString(safeGet(user, "profile_image")),
          }

          apiClient.setToken(tokens.access)
          setUser(userData)

          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, tokens.access)
            if (tokens.refresh) {
              localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh)
            }
            localStorage.setItem(STORAGE_KEYS.USER_MODE, "authenticated")
            localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userData))
          }

          toast({
            title: "Success",
            description: SUCCESS_MESSAGES.REGISTER_SUCCESS,
          })
        }

        return response
      } else {
        const errorMsg = safeGet(response, "message") || ERROR_MESSAGES.VALIDATION_ERROR
        toast({
          title: "Error",
          description:  String(errorMsg),
          variant: "destructive",
        })
        return response
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error) || ERROR_MESSAGES.NETWORK_ERROR
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    clearAuthData()
    setUser(null)
    toast({
      title: "Success",
      description: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
    })
  }

  const refreshUser = async () => {
    try {
      const response = await apiClient.getProfile()
      if (response && !response.error) {
        const userData = {
          id: Number(safeGet(response, "id", 0)) || 0,
          email: safeString(safeGet(response, "email")),
          first_name: safeString(safeGet(response, "first_name")),
          last_name: safeString(safeGet(response, "last_name")),
          mobile: safeString(safeGet(response, "mobile")),
          is_mobile_verified: !!safeGet(response, "is_mobile_verified"),
          date_joined: safeString(safeGet(response, "date_joined")),
          profile_image: safeString(safeGet(response, "profile_image")),
        }
        setUser(userData)
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userData))
        }
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!data || typeof data !== "object") {
      const errorMsg = "Profile data is required"
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
      return { success: false, message: errorMsg }
    }

    try {
      const response = await apiClient.updateProfile(data)
      if (safeGet(response, "success")) {
        const updatedUser = safeGet(response, "user")
        if (updatedUser) {
          const userData = {
            id: Number(safeGet(response, "id", 0)) || 0,
            email: safeString(safeGet(updatedUser, "email")),
            username: safeString(safeGet(updatedUser, "username")),
            first_name: safeString(safeGet(updatedUser, "first_name")),
            last_name: safeString(safeGet(updatedUser, "last_name")),
            mobile: safeString(safeGet(updatedUser, "mobile")),
            is_mobile_verified: !!safeGet(updatedUser, "is_mobile_verified"),
            date_joined: safeString(safeGet(updatedUser, "date_joined")),
            profile_image: safeString(safeGet(updatedUser, "profile_image")),
            date_of_birth: safeString(safeGet(updatedUser, "date_of_birth")),
            gender: safeString(safeGet(updatedUser, "gender")),
          }
          setUser(userData)
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userData))
          }
        }
        toast({
          title: "Success",
          description: SUCCESS_MESSAGES.PROFILE_UPDATED,
        })
        return response
      } else {
        const errorMsg = safeGet(response, "message") || ERROR_MESSAGES.VALIDATION_ERROR
        toast({
          title: "Error",
          description: String(errorMsg),
          variant: "destructive",
        })
        return response
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error) || ERROR_MESSAGES.NETWORK_ERROR
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return { success: false, message: errorMessage }
    }
  }

  const sendOTP = async (mobile: string, countryCode: string) => {
    if (!mobile?.trim() || !countryCode?.trim()) {
      const errorMsg = "Mobile number and country code are required"
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
      return { success: false, message: errorMsg }
    }

    try {
      const response = await apiClient.sendOTP({
        mobile: mobile.trim(),
        country_code: countryCode.trim(),
      })
      if (safeGet(response, "success")) {
        toast({
          title: "Success",
          description: "OTP sent successfully!",
        })
      } else {
        const errorMsg = safeGet(response, "message") || "Failed to send OTP"
        toast({
          title: "Error",
          description: String(errorMsg),
          variant: "destructive",
        })
      }
      return response
    } catch (error: any) {
      const errorMessage = getErrorMessage(error) || ERROR_MESSAGES.NETWORK_ERROR
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return { success: false, message: errorMessage }
    }
  }

  const verifyOTP = async (mobile: string, countryCode: string, otp: string) => {
    if (!mobile?.trim() || !countryCode?.trim() || !otp?.trim()) {
      const errorMsg = "Mobile number, country code, and OTP are required"
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
      return { success: false, message: errorMsg }
    }

    try {
      const response = await apiClient.verifyOTP({
        mobile: mobile.trim(),
        country_code: countryCode.trim(),
        otp: otp.trim(),
      })
      if (safeGet(response, "success")) {
        toast({
          title: "Success",
          description: "Mobile number verified successfully!",
        })
        await refreshUser()
      } else {
        const errorMsg = safeGet(response, "message") || "Invalid OTP"
        toast({
          title: "Error",
          description: String(errorMsg),
          variant: "destructive",
        })
      }
      return response
    } catch (error: any) {
      const errorMessage = getErrorMessage(error) || ERROR_MESSAGES.NETWORK_ERROR
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return { success: false, message: errorMessage }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        sendOTP,
        verifyOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
