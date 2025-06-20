interface ValueComboCardProps {
  name: string
  price: number
  originalPrice: number
  discount: number
}

export function ValueComboCard({ name, price, originalPrice, discount }: ValueComboCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-2 md:p-3 bg-white relative flex flex-col hover:shadow-md transition-shadow h-full">
      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">{discount}% OFF</div>
      <img alt={name} className="w-full h-36 object-contain" src="/placeholder.svg?height=150&width=150" />
      <h3 className="text-sm font-medium mt-2">{name}</h3>
      <div className="flex items-center mt-1">
        <span className="text-sm font-semibold">₹{price}</span>
        <span className="text-xs text-gray-500 line-through ml-1">₹{originalPrice}</span>
      </div>
      <button className="w-full bg-green-600 text-white text-xs py-1.5 rounded mt-2">BUY NOW</button>
    </div>
  )
}
