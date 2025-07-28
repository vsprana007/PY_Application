"use client"

import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react"
import { useState } from "react"
import { MessageModal } from "@/components/ui/message-modal"

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'info' | 'warning' | 'confirm',
    title: '',
    message: '',
    onConfirm: undefined as (() => void) | undefined,
    showCancel: false,
    confirmText: 'OK',
    cancelText: 'Cancel'
  })

  const showModal = (
    type: 'success' | 'error' | 'info' | 'warning' | 'confirm',
    title: string,
    message: string,
    onConfirm?: () => void,
    confirmText = 'OK',
    cancelText = 'Cancel'
  ) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      showCancel: type === 'confirm',
      confirmText,
      cancelText
    })
  }

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      showModal('error', 'Validation Error', 'Please fill in all fields before submitting.')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' })
      
      showModal('success', 'Message Sent!', 'Thank you for contacting us. We will get back to you within 24 hours.')
    } catch (error) {
      showModal('error', 'Send Failed', 'Failed to send your message. Please try again or contact us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="your.email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="What is this about?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              rows={4}
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Tell us how we can help you..."
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      {/* Message Modal */}
      <MessageModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        showCancel={modal.showCancel}
      />
    </div>
  )
}
