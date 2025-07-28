"use client"

import type React from "react"
import { useState } from "react"
import { useCart } from "@/hooks/use-cart"
import {
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
  Grid,
  FileText,
  Truck,
  PlusSquare,
  Star,
  Info,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Home,
  Heart,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const showBackButton = pathname !== "/"
  const isProductPage = pathname.startsWith("/product/")
  const { addToCart, isLoading: cartLoading, getCartItemCount } = useCart()

  return (
    <div className="relative min-h-screen bg-gray-50 w-full">
      {/* Navigation Bar - Full Width */}
      <nav className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-100 px-4 py-3 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
                aria-label="Go back" 
                onClick={() => router.back()}
              >
                <ArrowLeft size={20} className="text-gray-700" />
              </button>
            ) : (
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
                aria-label="Open menu" 
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} className="text-gray-700" />
              </button>
            )}
            <Link href="/" className="flex-shrink-0">
              <img alt="Purely Yours Logo" className="h-8" src="/placeholder.svg?height=32&width=128" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/search">
              <button 
                aria-label="Search" 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search size={20} className="text-gray-700" />
              </button>
            </Link>
            <Link href="/cart">
              <button 
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 active:scale-95 group"
              >
                <ShoppingCart 
                  size={24} 
                  className="text-gray-700 group-hover:text-green-600 transition-colors duration-200" 
                />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 border-2 border-white shadow-sm animate-pulse">
                    {getCartItemCount() > 99 ? '99+' : getCartItemCount()}
                  </span>
                )}
              </button>
            </Link>
            {/* <Link href="/account">
              <button 
                aria-label="Profile" 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User size={20} className="text-gray-700" />
              </button>
            </Link> */}
          </div>
        </div>
      </nav>

      {/* Sidebar Menu - Responsive Width */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-80 sm:w-96 bg-white z-30 transform transition-transform duration-300 ease-in-out overflow-y-auto shadow-2xl border-r border-gray-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6">
          <button 
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors" 
            aria-label="Close menu" 
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} className="text-gray-700" />
          </button>
          <div className="mt-12 space-y-8">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
              <div>
                <p className="text-gray-600 text-sm">Hi there!</p>
                <h2 className="text-xl font-bold text-gray-800">Welcome!</h2>
              </div>
            </div>
            <ul className="space-y-1">
              <li>
                <Link 
                  href="/categories" 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors group" 
                  onClick={() => setSidebarOpen(false)}
                >
                  <Grid size={20} className="text-gray-600 group-hover:text-green-600" />
                  <span className="font-medium text-gray-700 group-hover:text-green-700">Categories</span>
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Link href="/about" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                  <FileText size={20} />
                  <span>About Us</span>
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Link href="/account" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                  <Truck size={20} />
                  <span>Track Order</span>
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Link href="/consultation" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                  <PlusSquare size={20} />
                  <span>Consult a Doctor</span>
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Link href="/about" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                  <Star size={20} />
                  <span>Rate Us</span>
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Link href="/about" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                  <Info size={20} />
                  <span>About Us</span>
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Link href="/contact" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                  <Phone size={20} />
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
            <div className="pt-6 mt-6 border-t">
              <p className="text-sm mb-3">Follow us:</p>
              <div className="flex items-center gap-6">
                <a href="#" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
                <a href="#" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
                <a href="#" aria-label="Twitter">
                  <Twitter size={20} />
                </a>
                <a href="#" aria-label="YouTube">
                  <Youtube size={20} />
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-6">V.2.4.4 (build: 101)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content - Full Width */}
      <main className={cn("w-full min-h-screen", !isProductPage && "pb-16")}>
        <div className="w-full">{children}</div>
      </main>

      {/* Footer Navigation - Hidden on Product Pages */}
      {!isProductPage && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t w-full">
          <div className="flex justify-around py-2 w-full">
            <Link href="/" className={cn("flex flex-col items-center p-2", pathname === "/" && "text-green-600")}>
              <Home size={20} />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link
              href="/categories"
              className={cn("flex flex-col items-center p-2", pathname === "/categories" && "text-green-600")}
            >
              <ShoppingCart size={20} />
              <span className="text-xs mt-1">Shop</span>
            </Link>
            <Link
              href="/wishlist"
              className={cn("flex flex-col items-center p-2", pathname === "/wishlist" && "text-green-600")}
            >
              <Heart size={20} />
              <span className="text-xs mt-1">Wishlist</span>
            </Link>
            <Link
              href="/account"
              className={cn("flex flex-col items-center p-2", pathname === "/account" && "text-green-600")}
            >
              <User size={20} />
              <span className="text-xs mt-1">Account</span>
            </Link>
          </div>
        </footer>
      )}
    </div>
  )
}
