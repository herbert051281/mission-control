import React, { useState } from 'react'
import { useStore } from '../../store'
import { apiClient } from '../../api/client'
import Modal from './Modal'

interface CreateMissionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateMissionModal({ isOpen, onClose }: CreateMissionModalProps) {
  const { addMission } = useStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiClient.post('/missions', formData)
      addMission(response.data)
      onClose()
      setFormData({ title: '', description: '', category: 'general', priority: 'medium' })
    } catch (error) {
      console.error('Failed to create mission:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} title="Create Mission" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-dark-secondary border border-dark-border rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-cyan"
            placeholder="Mission title"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange as any}
            className="w-full px-3 py-2 bg-dark-secondary border border-dark-border rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-cyan"
            placeholder="Mission description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-dark-secondary border border-dark-border rounded text-text-primary focus:outline-none focus:border-accent-cyan"
            >
              <option value="general">General</option>
              <option value="urgent">Urgent</option>
              <option value="research">Research</option>
              <option value="analysis">Analysis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-dark-secondary border border-dark-border rounded text-text-primary focus:outline-none focus:border-accent-cyan"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </form>

      <div slot="footer" className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-dark-border rounded text-text-primary hover:bg-dark-secondary transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !formData.title}
          className="px-4 py-2 bg-accent-cyan text-dark-bg rounded font-semibold hover:bg-cyan-400 disabled:opacity-50 transition"
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </div>
    </Modal>
  )
}
