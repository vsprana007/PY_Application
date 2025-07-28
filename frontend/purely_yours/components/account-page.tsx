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
import { MessageModal } from "@/components/ui/message-modal"

export function AccountPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, refreshUser, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    date_of_birth: "",
    gender: "",
  })

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

  useEffect(() => {
    if (user) {
      setEditForm({
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        date_of_birth: (user as any).date_of_birth || "",
        gender: (user as any).gender || "",
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
      setIsSaving(true)
      
      // Validate form data
      if (!editForm.username.trim() || !editForm.first_name.trim() || !editForm.last_name.trim()) {
        showModal('error', 'Validation Error', 'Username, first name and last name are required.')
        return
      }

      // Prepare update data (exclude email as it's not editable)
      const updateData = {
        username: editForm.username.trim(),
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        mobile: editForm.mobile.trim(),
        date_of_birth: editForm.date_of_birth || undefined,
        gender: editForm.gender || undefined,
      }

      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if ((updateData as any)[key] === undefined || (updateData as any)[key] === '') {
          delete (updateData as any)[key]
        }
      })

      const response = await updateProfile(updateData)
      
      if (response?.success !== false) {
        await refreshUser()
        setIsEditing(false)
        showModal('success', 'Profile Updated', 'Your profile has been updated successfully.')
      } else {
        showModal('error', 'Update Failed', response?.message || 'Failed to update your profile. Please try again.')
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      showModal('error', 'Update Failed', 'Failed to update your profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setEditForm({
        username: (user as any).username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        date_of_birth: (user as any).date_of_birth || "",
        gender: (user as any).gender || "",
      })
    }
    setIsEditing(false)
  }

  const handleLogout = () => {
    showModal(
      'confirm',
      'Logout Confirmation',
      'Are you sure you want to logout? You will need to sign in again to access your account.',
      () => {
        logout()
        router.push("/")
        showModal('info', 'Logged Out', 'You have been successfully logged out.')
      },
      'Logout',
      'Cancel'
    )
  }

  const handleDeleteAccount = () => {
    showModal(
      'confirm',
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.',
      () => {
        // TODO: Implement account deletion API call
        showModal('info', 'Feature Coming Soon', 'Account deletion feature will be available soon. Please contact support for assistance.')
      },
      'Delete Account',
      'Cancel'
    )
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
              {(user as any)?.username && <p className="text-sm text-gray-600">@{(user as any).username}</p>}
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
            {/* <div>
              <label className="block text-sm font-medium mb-1">Username *</label>
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your username"
                required
              />
            </div> */}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input
                  type="text"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input
                  type="text"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email ID</label>
              <input
                type="email"
                value={editForm.email}
                className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500"
                disabled
                placeholder="Email cannot be changed"
              />
              <p className="text-xs text-gray-500 mt-1">Email address cannot be modified</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Mobile Number</label>
              <input
                type="tel"
                value={editForm.mobile}
                onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your mobile number"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={editForm.date_of_birth}
                  onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button 
                onClick={handleCancel} 
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving}
              >
                {isSaving ? "Updating..." : "Update Profile"}
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
          <button 
            onClick={handleDeleteAccount}
            className="w-full flex items-center justify-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={20} />
            <span>Delete Account</span>
          </button>
        </div>
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
