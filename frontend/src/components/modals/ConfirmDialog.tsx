import React from 'react'
import Modal from './Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel}>
      <p className="text-text-primary mb-4">{message}</p>

      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-dark-border rounded text-text-primary hover:bg-dark-secondary transition"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 rounded font-semibold text-white transition ${
            isDangerous
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-accent-cyan hover:bg-cyan-400 text-dark-bg'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}
