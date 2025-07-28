"use client"


import { SearchPage } from "@/components/search-page"
import { AuthProvider } from "@/hooks/use-auth"

export default function Search() {
  return (
    <AuthProvider>
  
        <SearchPage />
   
    </AuthProvider>
  )
}
