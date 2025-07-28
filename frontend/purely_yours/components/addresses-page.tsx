"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"
import { MessageModal } from "@/components/ui/message-modal"
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface Address {
  id: number
  name: string
  mobile: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  pincode: string
  country: string
  type: string
  is_default: boolean
  created_at?: string
}

export function AddressesPage() {
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'info' | 'warning' | 'confirm',
    title: '',
    message: '',
    onConfirm: undefined as (() => void) | undefined,
    showCancel: false,
    confirmText: 'OK',
    cancelText: 'Cancel',
  })
  const [formModal, setFormModal] = useState({
    isOpen: false,
    isEdit: false,
    address: null as Address | null,
  })
  const [form, setForm] = useState<Partial<Address>>({})
  const [formLoading, setFormLoading] = useState(false)

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
      cancelText,
    })
  }
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }))

  const fetchAddresses = async () => {
    setLoading(true)
    try {
      const res = await apiClient.getAddresses()
      setAddresses(Array.isArray(res) ? res : [])
    } catch (e) {
      showModal('error', 'Error', 'Failed to load addresses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  const openAddModal = () => {
    setForm({
      name: '',
      mobile: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
      type: 'home',
      is_default: false,
    })
    setFormModal({ isOpen: true, isEdit: false, address: null })
  }

  const openEditModal = (address: Address) => {
    setForm({ ...address })
    setFormModal({ isOpen: true, isEdit: true, address })
  }

  const closeFormModal = () => {
    setFormModal({ isOpen: false, isEdit: false, address: null })
    setForm({})
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement
    const { name, value, type } = target
    const checked = (type === 'checkbox') ? (target as HTMLInputElement).checked : undefined
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      // Validation
      if (!form.name || !form.mobile || !form.address_line_1 || !form.city || !form.state || !form.pincode || !form.country || !form.type) {
        showModal('error', 'Validation Error', 'Please fill all required fields.')
        return
      }
      const payload = {
        type: form.type || 'home',
        name: form.name || '',
        mobile: form.mobile || '',
        address_line_1: form.address_line_1 || '',
        address_line_2: form.address_line_2 || '',
        city: form.city || '',
        state: form.state || '',
        pincode: form.pincode || '',
        country: form.country || '',
        is_default: !!form.is_default,
      };
      if (formModal.isEdit && formModal.address) {
        await apiClient.updateAddress(formModal.address.id, payload)
        showModal('success', 'Address Updated', 'Address updated successfully.')
      } else {
        await apiClient.createAddress(payload)
        showModal('success', 'Address Added', 'Address added successfully.')
      }
      closeFormModal()
      fetchAddresses()
    } catch (e: any) {
      // Try to show backend validation errors in modal
      let errorMsg = 'Failed to save address.';
      if (e && typeof e === 'object') {
        // Try to extract error details from API error response
        const err = e;
        if (err && err.name && Array.isArray(err.name)) {
          errorMsg = `Full Name: ${err.name.join(', ')}`;
        }
        if (err && err.pincode && Array.isArray(err.pincode)) {
          errorMsg += `\nPostal Code: ${err.pincode.join(', ')}`;
        }
        // Show all other field errors if present
        Object.keys(err).forEach((key) => {
          if ((key !== 'name' && key !== 'pincode') && Array.isArray(err[key])) {
            errorMsg += `\n${key.charAt(0).toUpperCase() + key.slice(1)}: ${err[key].join(', ')}`;
          }
        });
      }
      showModal('error', 'Error', errorMsg)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = (address: Address) => {
    showModal(
      'confirm',
      'Delete Address',
      'Are you sure you want to delete this address?',
      async () => {
        try {
          await apiClient.deleteAddress(address.id)
          showModal('success', 'Deleted', 'Address deleted successfully.')
          fetchAddresses()
        } catch (e) {
          showModal('error', 'Error', 'Failed to delete address.')
        }
      },
      'Delete',
      'Cancel'
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10">
            <button onClick={() => router.back()} className="mr-4">
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-semibold flex-1 truncate">My Addresses</h1>
            <button
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={openAddModal}
                >
                <Plus size={18} /> Add Address
            </button>
        </div>
        <div className="max-w-2xl mx-auto p-4">
            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading addresses...</div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No addresses found.</div>
            ) : (
                <div className="space-y-4">
                {addresses.map((address) => (
                    <div key={address.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-white shadow-sm">
                    <div>
                        <div className="font-semibold">{address.name} {address.is_default && <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">Default</span>}</div>
                        <div className="text-sm text-gray-600">{address.mobile}</div>
                        <div className="text-sm text-gray-600">{address.address_line_1}{address.address_line_2 ? ", " + address.address_line_2 : ""}</div>
                        <div className="text-sm text-gray-600">{address.city}, {address.state} - {address.pincode}, {address.country}</div>
                        <div className="text-xs text-gray-400 mt-1">Type: {address.type}</div>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                        <button
                        className="p-2 rounded hover:bg-gray-100"
                        onClick={() => openEditModal(address)}
                        title="Edit"
                        >
                        <Edit size={18} />
                        </button>
                        <button
                        className="p-2 rounded hover:bg-gray-100 text-red-600"
                        onClick={() => handleDelete(address)}
                        title="Delete"
                        >
                        <Trash2 size={18} />
                        </button>
                    </div>
                    </div>
                ))}
                </div>
            )}

            {/* Add/Edit Address Modal */}
            {formModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] p-0 relative flex flex-col">
                    <div className="p-6 overflow-y-auto flex-1">
                    <h3 className="text-lg font-semibold mb-4">{formModal.isEdit ? 'Edit Address' : 'Add Address'}</h3>
                    <form onSubmit={handleFormSubmit} className="space-y-3">
                        <div>
                        <label className="block text-sm font-medium mb-1">Full Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name || ''}
                            onChange={handleFormChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-1">Mobile *</label>
                        <input
                            type="tel"
                            name="mobile"
                            value={form.mobile || ''}
                            onChange={handleFormChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
                        <input
                            type="text"
                            name="address_line_1"
                            value={form.address_line_1 || ''}
                            onChange={handleFormChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-1">Address Line 2</label>
                        <input
                            type="text"
                            name="address_line_2"
                            value={form.address_line_2 || ''}
                            onChange={handleFormChange}
                            className="w-full p-2 border rounded"
                        />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">City *</label>
                            <input
                            type="text"
                            name="city"
                            value={form.city || ''}
                            onChange={handleFormChange}
                            className="w-full p-2 border rounded"
                            required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">State *</label>
                            <input
                            type="text"
                            name="state"
                            value={form.state || ''}
                            onChange={handleFormChange}
                            className="w-full p-2 border rounded"
                            required
                            />
                        </div>
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-1">Postal Code *</label>
                        <input
                            type="text"
                            name="pincode"
                            value={form.pincode || ''}
                            onChange={handleFormChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-1">Country *</label>
                        <input
                            type="text"
                            name="country"
                            value={form.country || ''}
                            onChange={handleFormChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-1">Type *</label>
                        <select
                            name="type"
                            value={form.type || 'home'}
                            onChange={handleFormChange}
                            className="w-full p-2 border rounded"
                            required
                        >
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                        </select>
                        </div>
                        <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="is_default"
                            checked={!!form.is_default}
                            onChange={handleFormChange}
                            id="is_default"
                        />
                        <label htmlFor="is_default" className="text-sm">Set as default address</label>
                        </div>
                        <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            className="flex-1 py-2 border border-gray-300 rounded hover:bg-gray-50"
                            onClick={closeFormModal}
                            disabled={formLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={formLoading}
                        >
                            {formLoading ? (formModal.isEdit ? 'Updating...' : 'Adding...') : (formModal.isEdit ? 'Update Address' : 'Add Address')}
                        </button>
                        </div>
                    </form>
                    </div>
                </div>
                </div>
            )}

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
    </div>
  )
}