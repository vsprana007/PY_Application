interface TestimonialCardProps {
  name: string
  rating: number
  review: string
}

export function TestimonialCard({ name, rating, review }: TestimonialCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 md:p-4 bg-white h-full">
      <div className="flex items-center gap-3 mb-3">
        <img
          alt={name}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover"
          src="/placeholder.svg?height=80&width=80"
        />
        <div>
          <h3 className="font-medium text-sm md:text-base">{name}</h3>
          <div className="flex">
            {Array(rating)
              .fill(0)
              .map((_, i) => (
                <span key={i} className="text-yellow-400 text-sm md:text-base">
                  ★
                </span>
              ))}
          </div>
        </div>
      </div>
      <p className="text-sm md:text-base text-gray-600">{review}</p>
    </div>
  )
}
