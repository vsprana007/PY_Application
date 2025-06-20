import { Leaf, Award, Users, Heart } from "lucide-react"

export function AboutPage() {
  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <img src="/placeholder.svg?height=120&width=200" alt="Purely Yours Logo" className="mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">About Purely Yours</h1>
        <p className="text-gray-600">Your trusted partner in natural wellness</p>
      </div>

      {/* Mission */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Our Mission</h2>
        <p className="text-gray-600 leading-relaxed">
          At Purely Yours, we believe in the power of nature to heal and nurture. Our mission is to provide you with the
          finest natural wellness products that combine traditional wisdom with modern science, helping you achieve
          optimal health naturally.
        </p>
      </div>

      {/* Values */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Our Values</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <Leaf className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Natural</h3>
            <p className="text-sm text-gray-600">100% natural ingredients</p>
          </div>
          <div className="text-center">
            <Award className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Quality</h3>
            <p className="text-sm text-gray-600">Premium quality assured</p>
          </div>
          <div className="text-center">
            <Users className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Trust</h3>
            <p className="text-sm text-gray-600">Trusted by thousands</p>
          </div>
          <div className="text-center">
            <Heart className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Care</h3>
            <p className="text-sm text-gray-600">Made with love & care</p>
          </div>
        </div>
      </div>

      {/* Story */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Our Story</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Founded with a vision to make natural wellness accessible to everyone, Purely Yours started as a small
          initiative to bring the best of traditional remedies to modern households.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Today, we are proud to serve thousands of customers who trust us for their wellness journey. Every product we
          create is a testament to our commitment to quality, purity, and your well-being.
        </p>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Get in Touch</h2>
        <div className="space-y-2">
          <p className="text-gray-600">
            <span className="font-medium">Email:</span> hello@purelyyours.com
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Phone:</span> +91 1800-123-4567
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Address:</span> 123 Wellness Street, Health City, India
          </p>
        </div>
      </div>
    </div>
  )
}
