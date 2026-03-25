import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { apiClient } from '../api/client'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
      })

      const { token, agent_id, agent_name } = response.data
      setAuth(token, agent_id, agent_name)
      navigate('/')
    } catch (err) {
      setError('Invalid credentials')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="bg-dark-panel border border-dark-border rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-accent-cyan mb-2">Mission Control</h1>
        <p className="text-text-muted mb-6">Agent Command & Control System</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 bg-dark-secondary border border-dark-border rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-cyan"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-dark-secondary border border-dark-border rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-cyan"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-600 bg-opacity-20 border border-red-600 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-accent-cyan text-dark-bg rounded font-semibold hover:bg-cyan-400 disabled:opacity-50 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-xs text-text-muted mt-4 text-center">
          Demo: username=admin, password=admin
        </p>
      </div>
    </div>
  )
}
