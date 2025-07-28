"use client"

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

interface MessageModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  type: 'success' | 'error' | 'info' | 'warning' | 'confirm'
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
}

export function MessageModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = false
}: MessageModalProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-600" />
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-600" />
      case 'warning':
      case 'confirm':
        return <AlertTriangle className="w-8 h-8 text-orange-600" />
      case 'info':
      default:
        return <Info className="w-8 h-8 text-blue-600" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100'
      case 'error':
        return 'bg-red-100'
      case 'warning':
      case 'confirm':
        return 'bg-orange-100'
      case 'info':
      default:
        return 'bg-blue-100'
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700'
      case 'error':
        return 'bg-red-600 hover:bg-red-700'
      case 'warning':
      case 'confirm':
        return 'bg-orange-600 hover:bg-orange-700'
      case 'info':
      default:
        return 'bg-blue-600 hover:bg-blue-700'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className={`w-16 h-16 ${getBackgroundColor()} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {getIcon()}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        <div className={`flex gap-3 ${showCancel || type === 'confirm' ? 'flex-row' : 'justify-center'}`}>
          {(showCancel || type === 'confirm') && (
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`${showCancel || type === 'confirm' ? 'flex-1' : 'px-8'} ${getButtonColor()} text-white py-3 rounded-lg font-medium transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
