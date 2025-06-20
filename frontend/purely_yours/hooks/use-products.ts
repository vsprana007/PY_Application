"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api"
import { PRODUCT_CONSTANTS, ERROR_MESSAGES } from "@/lib/constants"
import { useToast } from "./use-toast"
import { safeGet, safeNumber, safeString, safeArray, getErrorMessage } from "@/lib/utils"

export interface ProductTag {
  id: number
  name: string
  slug: string
}

export interface ProductImage {
  id: number
  image: string
  alt_text: string
  is_primary: boolean
  order: number
}

export interface ProductVariant {
  id: number
  name: string
  sku: string
  price: string
  original_price: string
  discount_percentage: number
  stock_quantity: number
  is_active: boolean
}

export interface ProductFaq {
  id: number
  question: string
  answer: string
  order: number
}

export interface ProductKeyIngredient {
  name: string
  description: string
}

export interface ProductCategory {
  id: number
  name: string
  slug: string
  description: string
  image: string | null
  product_count: number
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  category: ProductCategory
  sku?: string
  price: string
  original_price: string
  discount_percentage: number
  stock_quantity: number
  key_benefits?: string[]
  key_ingredients?: ProductKeyIngredient[]
  how_to_consume?: string[]
  who_should_take?: string[]
  how_it_helps?: string
  disclaimer?: string
  analytical_report?: string
  images?: ProductImage[]
  variants?: ProductVariant[]
  tags?: ProductTag[]
  faqs?: ProductFaq[]
  average_rating?: number
  review_count?: number
  created_at?: string
  primary_image?: string | null // Optional, for list views
}

interface ProductFilters {
  category?: string
  search?: string
  min_price?: number
  max_price?: number
  ordering?: string
  in_stock?: boolean
  featured?: boolean
  page?: number
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  image: string | null
  product_count: number
  parent?: number | null
  children?: Category[]
}

interface ProductsResponse {
  results: Product[]
  count: number
  next: string | null
  previous: string | null
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()

  const normalizeProduct = (product: any): Product => {
    return {
      id: safeNumber(safeGet(product, "id"), 0),
      name: safeString(safeGet(product, "name")),
      slug: safeString(safeGet(product, "slug")),
      description: safeString(safeGet(product, "description")),
      category: normalizeCategory(safeGet(product, "category")),
      sku: safeString(safeGet(product, "sku")),
      price: safeString(safeGet(product, "price")),
      original_price: safeString(safeGet(product, "original_price")),
      discount_percentage: safeNumber(safeGet(product, "discount_percentage"), 0),
      stock_quantity: safeNumber(safeGet(product, "stock_quantity"), 0),
      key_benefits: safeArray(safeGet(product, "key_benefits"), []),
      key_ingredients: safeArray(safeGet(product, "key_ingredients"), []),
      how_to_consume: safeArray(safeGet(product, "how_to_consume"), []),
      who_should_take: safeArray(safeGet(product, "who_should_take"), []),
      how_it_helps: safeString(safeGet(product, "how_it_helps")),
      disclaimer: safeString(safeGet(product, "disclaimer")),
      analytical_report: safeString(safeGet(product, "analytical_report")),
      images: safeArray(safeGet(product, "images"), []).map((img: any) => ({
        id: safeNumber(safeGet(img, "id"), 0),
        image: safeString(safeGet(img, "image")),
        alt_text: safeString(safeGet(img, "alt_text")),
        is_primary: !!safeGet(img, "is_primary"),
        order: safeNumber(safeGet(img, "order"), 0),
      })),
      variants: safeArray(safeGet(product, "variants"), []).map((variant: any) => ({
        id: safeNumber(safeGet(variant, "id"), 0),
        name: safeString(safeGet(variant, "name")),
        sku: safeString(safeGet(variant, "sku")),
        price: safeString(safeGet(variant, "price")),
        original_price: safeString(safeGet(variant, "original_price")),
        discount_percentage: safeNumber(safeGet(variant, "discount_percentage"), 0),
        stock_quantity: safeNumber(safeGet(variant, "stock_quantity"), 0),
        is_active: !!safeGet(variant, "is_active"),
      })),
      tags: safeArray(safeGet(product, "tags"), []).map((tag: any) => ({
        id: safeNumber(safeGet(tag, "id"), 0),
        name: safeString(safeGet(tag, "name")),
        slug: safeString(safeGet(tag, "slug")),
      })),
      faqs: safeArray(safeGet(product, "faqs"), []).map((faq: any) => ({
        id: safeNumber(safeGet(faq, "id"), 0),
        question: safeString(safeGet(faq, "question")),
        answer: safeString(safeGet(faq, "answer")),
        order: safeNumber(safeGet(faq, "order"), 0),
      })),
      average_rating: safeNumber(safeGet(product, "average_rating"), 0),
      review_count: safeNumber(safeGet(product, "review_count"), 0),
      created_at: safeString(safeGet(product, "created_at")),
      primary_image: safeString(safeGet(product, "primary_image")),
    }
  }

  const normalizeCategory = (category: any): Category => {
    return {
      id: safeNumber(safeGet(category, "id"), 0),
      name: safeString(safeGet(category, "name")),
      slug: safeString(safeGet(category, "slug")),
      description: safeString(safeGet(category, "description")),
      image: safeString(safeGet(category, "image")),
      product_count: safeNumber(safeGet(category, "product_count"), 0),
      parent: safeNumber(safeGet(category, "parent")),
      children: safeArray(safeGet(category, "children"), []).map(normalizeCategory),
    }
  }

  const fetchProducts = useCallback(
    async (filters: ProductFilters = {}, append = false) => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await apiClient.getProducts(filters)

        if (response) {
          const normalizedProducts = safeArray(response.results, []).map(normalizeProduct)

          if (append) {
            setProducts((prev) => [...prev, ...normalizedProducts])
          } else {
            setProducts(normalizedProducts)
            setCurrentPage(1)
          }

          setHasMore(!!response.next)
        }
      } catch (err: any) {
        const errorMessage = getErrorMessage(err) || ERROR_MESSAGES.NETWORK_ERROR
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiClient.getCategories()
      const normalizedCategories = safeArray(response, []).map(normalizeCategory)
      setCategories(normalizedCategories)
    } catch (err: any) {
      console.error("Error fetching categories:", err)
    }
  }, [])

  const fetchCategoryProducts = useCallback(
    async (categorySlug: string, filters: Omit<ProductFilters, "category"> = {}) => {
      if (!categorySlug) return

      try {
        setIsLoading(true)
        setError(null)

        const response = await apiClient.getCategoryProducts(categorySlug, filters)

        if (response) {
          const normalizedProducts = safeArray(response.results, []).map(normalizeProduct)
          setProducts(normalizedProducts)
          setHasMore(!!response.next)
          setCurrentPage(1)
        }
      } catch (err: any) {
        const errorMessage = getErrorMessage(err) || ERROR_MESSAGES.NETWORK_ERROR
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const searchProducts = useCallback(
    async (query: string, filters: Omit<ProductFilters, "search"> = {}) => {
      if (!query || query.length < PRODUCT_CONSTANTS.MIN_SEARCH_QUERY_LENGTH) {
        setProducts([])
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const response = await apiClient.searchProducts(query, filters)

        if (response) {
          const normalizedProducts = safeArray(response.results, []).map(normalizeProduct)
          setProducts(normalizedProducts)
          setHasMore(!!response.next)
          setCurrentPage(1)
        }
      } catch (err: any) {
        const errorMessage = getErrorMessage(err) || ERROR_MESSAGES.NETWORK_ERROR
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const loadMore = useCallback(
    async (filters: ProductFilters = {}) => {
      if (!hasMore || isLoading) return

      const nextPage = currentPage + 1
      await fetchProducts({ ...filters, page: nextPage }, true)
      setCurrentPage(nextPage)
    },
    [hasMore, isLoading, currentPage, fetchProducts],
  )

  const getFeaturedProducts = useCallback(async () => {
    try {
      const response = await apiClient.getFeaturedProducts()
      return safeArray(response, []).map(normalizeProduct)
    } catch (err: any) {
      console.error("Error fetching featured products:", err)
      return []
    }
  }, [])

  const getBestsellers = useCallback(async () => {
    try {
      const response = await apiClient.getBestsellers()
      return safeArray(response, []).map(normalizeProduct)
    } catch (err: any) {
      console.error("Error fetching bestsellers:", err)
      return []
    }
  }, [])

  const getProduct = useCallback(async (slug: string) => {
    if (!slug) return null

    try {
      const response = await apiClient.getProduct(slug)
      return response ? normalizeProduct(response) : null
    } catch (err: any) {
      console.error("Error fetching product:", err)
      return null
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    products,
    categories,
    isLoading,
    error,
    hasMore,
    currentPage,
    fetchProducts,
    fetchCategories,
    fetchCategoryProducts,
    searchProducts,
    loadMore,
    getFeaturedProducts,
    getBestsellers,
    getProduct,
  }
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const normalizeProduct = (data: any): Product => ({
    id: safeNumber(safeGet(data, "id"), 0),
    name: safeString(safeGet(data, "name")),
    slug: safeString(safeGet(data, "slug")),
    description: safeString(safeGet(data, "description")),
    category: {
      id: safeNumber(safeGet(data, "category.id"), 0),
      name: safeString(safeGet(data, "category.name")),
      slug: safeString(safeGet(data, "category.slug")),
      description: safeString(safeGet(data, "category.description")),
      image: safeString(safeGet(data, "category.image")),
      product_count: safeNumber(safeGet(data, "category.product_count"), 0),
    },
    sku: safeString(safeGet(data, "sku")),
    price: safeString(safeGet(data, "price")),
    original_price: safeString(safeGet(data, "original_price")),
    discount_percentage: safeNumber(safeGet(data, "discount_percentage"), 0),
    stock_quantity: safeNumber(safeGet(data, "stock_quantity"), 0),
    key_benefits: safeArray(safeGet(data, "key_benefits"), []),
    key_ingredients: safeArray(safeGet(data, "key_ingredients"), []),
    how_to_consume: safeArray(safeGet(data, "how_to_consume"), []),
    who_should_take: safeArray(safeGet(data, "who_should_take"), []),
    how_it_helps: safeString(safeGet(data, "how_it_helps")),
    disclaimer: safeString(safeGet(data, "disclaimer")),
    analytical_report: safeString(safeGet(data, "analytical_report")),
    images: safeArray(safeGet(data, "images"), []).map((img: any) => ({
      id: safeNumber(safeGet(img, "id"), 0),
      image: safeString(safeGet(img, "image")),
      alt_text: safeString(safeGet(img, "alt_text")),
      is_primary: !!safeGet(img, "is_primary"),
      order: safeNumber(safeGet(img, "order"), 0),
    })),
    variants: safeArray(safeGet(data, "variants"), []).map((variant: any) => ({
      id: safeNumber(safeGet(variant, "id"), 0),
      name: safeString(safeGet(variant, "name")),
      sku: safeString(safeGet(variant, "sku")),
      price: safeString(safeGet(variant, "price")),
      original_price: safeString(safeGet(variant, "original_price")),
      discount_percentage: safeNumber(safeGet(variant, "discount_percentage"), 0),
      stock_quantity: safeNumber(safeGet(variant, "stock_quantity"), 0),
      is_active: !!safeGet(variant, "is_active"),
    })),
    tags: safeArray(safeGet(data, "tags"), []).map((tag: any) => ({
      id: safeNumber(safeGet(tag, "id"), 0),
      name: safeString(safeGet(tag, "name")),
      slug: safeString(safeGet(tag, "slug")),
    })),
    faqs: safeArray(safeGet(data, "faqs"), []).map((faq: any) => ({
      id: safeNumber(safeGet(faq, "id"), 0),
      question: safeString(safeGet(faq, "question")),
      answer: safeString(safeGet(faq, "answer")),
      order: safeNumber(safeGet(faq, "order"), 0),
    })),
    created_at: safeString(safeGet(data, "created_at")),
  })

  const fetchProduct = useCallback(async () => {
    if (!slug) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getProduct(slug)

      if (response) {
        setProduct(normalizeProduct(response))
      } else {
        setProduct(null)
        setError("Product not found")
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err) || ERROR_MESSAGES.NOT_FOUND
      setError(errorMessage)
      setProduct(null)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [slug, toast])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  return {
    product,
    isLoading,
    error,
    refetch: fetchProduct,
  }
}
