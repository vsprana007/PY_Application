"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface CategoryButtonProps {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
}

export function CategoryButton({ children, active = false, onClick }: CategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "whitespace-nowrap px-4 py-1.5 rounded-full text-sm transition-all duration-200 hover:scale-105",
        active
          ? "bg-green-600 text-white shadow-md"
          : "border border-gray-300 text-gray-700 hover:border-green-300 hover:text-green-600",
      )}
    >
      {children}
    </button>
  )
}
