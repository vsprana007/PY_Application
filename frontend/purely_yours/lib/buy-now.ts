// NOTE: This file is deprecated. Use the useBuyNow hook instead.
// The functions below are kept for backward compatibility but may be removed in future versions.

export interface BuyNowItem {
  product: {
    id: number
    name: string
    price: number
    [key: string]: any
  }
  variant?: {
    id: number
    name: string
    price: number
    [key: string]: any
  } | null
  quantity: number
}

// @deprecated Use useBuyNow hook instead
export const buyNowDirect = (product: any, variant: any, quantity: number) => {
  const buyNowItem: BuyNowItem = {
    product: product,
    variant: variant,
    quantity: quantity
  }
  
  // Store in localStorage
  localStorage.setItem('buyNowItem', JSON.stringify(buyNowItem))
  
  // Return the checkout URL
  return '/checkout'
}

// @deprecated Use useBuyNow hook instead
export const getBuyNowItem = (): BuyNowItem | null => {
  try {
    const buyNowData = localStorage.getItem('buyNowItem')
    if (buyNowData) {
      return JSON.parse(buyNowData)
    }
  } catch (error) {
    console.error('Failed to parse buy now item:', error)
    localStorage.removeItem('buyNowItem')
  }
  return null
}

// @deprecated Use useBuyNow hook instead
export const clearBuyNowItem = () => {
  localStorage.removeItem('buyNowItem')
}
