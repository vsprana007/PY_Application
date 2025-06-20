import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react"

export function ContactPage() {
  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Contact Us</h1>
        <p className="text-gray-600">We're here to help you with any questions</p>
      </div>

      {/* Contact Methods */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Phone className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold">Phone Support</h3>
              <p className="text-gray-600">+91 1800-123-4567</p>
              <p className="text-sm text-gray-500">Mon-Sat, 9 AM - 7 PM</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold">Email Support</h3>
              <p className="text-gray-600">support@purelyyours.com</p>
              <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MessageCircle className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold">WhatsApp Support</h3>
              <p className="text-gray-600">+91 9876543210</p>
              <p className="text-sm text-gray-500">Quick responses via WhatsApp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Timings */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Clock className="text-green-600" size={20} />
          <h3 className="font-semibold">Customer Support Timings</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Monday - Friday</span>
            <span>9:00 AM - 7:00 PM</span>
          </div>
          <div className="flex justify-between">
            <span>Saturday</span>
            <span>10:00 AM - 6:00 PM</span>
          </div>
          <div className="flex justify-between">
            <span>Sunday</span>
            <span>Closed</span>
          </div>
        </div>
      </div>

      {/* Office Address */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <MapPin className="text-green-600" size={20} />
          <h3 className="font-semibold">Office Address</h3>
        </div>
        <p className="text-gray-600">
          Purely Yours Wellness Pvt. Ltd.
          <br />
          123 Wellness Street, Health City
          <br />
          Mumbai, Maharashtra 400001
          <br />
          India
        </p>
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold mb-4">Send us a Message</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              rows={4}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            ></textarea>
          </div>
          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-medium">
            Send Message
          </button>
        </form>
      </div>
    </div>
  )
}
