"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Package,
  MapPin,
  Calendar,
  HelpCircle,
  Star,
  Settings,
  ChevronRight,
  Edit,
  LogOut,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export function AccountPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
  })

  useEffect(() => {
    if (user) {
      setEditForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        mobile: user.mobile || "",
      })
    }
  }, [user])

  // If user is not authenticated, show sign-in prompt
  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Sign in to your account</h2>
          <p className="text-gray-600 mb-6">Access your orders, wishlist, and personalized recommendations</p>
          <div className="space-y-3 max-w-sm mx-auto">
            <Link href="/auth/login">
              <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium">Sign In</button>
            </Link>
            <Link href="/auth/register">
              <button className="w-full border border-green-600 text-green-600 py-3 rounded-lg font-medium">
                Create Account
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    try {
      // Update profile via API
      await refreshUser()
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
    }
  }

  const handleCancel = () => {
    if (user) {
      setEditForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        mobile: user.mobile || "",
      })
    }
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="p-4 space-y-4">
      {/* Profile Section */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="text-green-600" size={24} />
            </div>
            <div>
            
              <h2 className="font-semibold">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-sm text-gray-600">{user?.email}</p>
              {user?.mobile && <p className="text-sm text-gray-600">{user.mobile}</p>}
            </div>
          </div>
          <button onClick={() => setIsEditing(true)} className="p-2 text-green-600">
            <Edit size={20} />
          </button>
        </div>

        {isEditing && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                value={editForm.first_name}
                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                value={editForm.last_name}
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email ID</label>
              <input
                type="email"
                value={editForm.email}
                className="w-full p-2 border rounded-lg bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile Number</label>
              <input
                type="tel"
                value={editForm.mobile}
                onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleCancel} className="flex-1 py-2 border border-gray-300 rounded-lg">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 py-2 bg-green-600 text-white rounded-lg">
                Update
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="space-y-3">
          <Link href="/account/orders" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <Package className="text-green-600" size={20} />
              <span>Orders</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Your Information */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold mb-3">Your Information</h3>
        <div className="space-y-3">
          <Link href="/account/addresses" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <MapPin className="text-green-600" size={20} />
              <span>Address Book</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
          <Link href="/consultation" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <Calendar className="text-green-600" size={20} />
              <span>Your Consultations</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Other Information */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold mb-3">Other Information</h3>
        <div className="space-y-3">
          <Link href="/contact" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <HelpCircle className="text-green-600" size={20} />
              <span>Help & Support</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
          <Link href="/account/rate-app" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <Star className="text-green-600" size={20} />
              <span>Rate App</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
          <Link href="/account/settings" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <Settings className="text-green-600" size={20} />
              <span>Settings</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Logout & Delete Account */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
          <button className="w-full flex items-center justify-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded">
            <Trash2 size={20} />
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  )
}
