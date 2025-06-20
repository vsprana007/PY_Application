"use client"

import type React from "react"
import { useState } from "react"
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

  return (
    <div className="relative min-h-screen bg-gray-50 w-full">
      {/* Navigation Bar - Full Width */}
      <nav className="sticky top-0 z-10 bg-white shadow-sm px-4 py-2 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <button className="p-1" aria-label="Go back" onClick={() => router.back()}>
                <ArrowLeft />
              </button>
            ) : (
              <button className="p-1" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
                <Menu />
              </button>
            )}
            <Link href="/">
              <img alt="Purely Yours Logo" className="h-7" src="/placeholder.svg?height=30&width=120" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/search">
              <button aria-label="Search">
                <Search size={20} />
              </button>
            </Link>
            <Link href="/cart">
              <button aria-label="Cart">
                <ShoppingCart size={20} />
              </button>
            </Link>
            <Link href="/account">
              <button aria-label="Profile">
                <User size={20} />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Sidebar Menu - Responsive Width */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-80 sm:w-96 bg-white z-30 transform transition-transform duration-300 ease-in-out overflow-y-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-4">
          <button className="absolute top-4 right-4" aria-label="Close menu" onClick={() => setSidebarOpen(false)}>
            <X />
          </button>
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between py-2">
              <div>
                <p>Hi</p>
                <h2 className="text-xl font-bold">Welcome!</h2>
              </div>
            </div>
            <ul className="space-y-5">
              <li className="flex items-center justify-between">
                <Link href="/categories" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                  <Grid size={20} />
                  <span>Categories</span>
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
