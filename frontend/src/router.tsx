import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store'
import Layout from './components/Layout'
import {
  CommandCenter,
  Missions,
  Agents,
  Activity,
  Approvals,
  Skills,
  Settings,
} from './pages'
import LoginPage from './pages/Login'

/**
 * Protected Route Wrapper
 * Redirects to login if user is not authenticated
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useStore()

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

/**
 * Main Router Component
 * Handles authentication routing, nested routes, and redirects
 */
export default function Router() {
  const { isAuthenticated } = useStore()

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route - redirect to home if already authenticated */}
        <Route
          path="/login"
          element={
            isAuthenticated() ? <Navigate to="/" replace /> : <LoginPage />
          }
        />

        {/* Protected Routes - all wrapped in ProtectedRoute */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<CommandCenter />} />

          {/* Main sections */}
          <Route path="missions" element={<Missions />} />
          <Route path="agents" element={<Agents />} />
          <Route path="activity" element={<Activity />} />

          {/* Management sections */}
          <Route path="approvals" element={<Approvals />} />
          <Route path="skills" element={<Skills />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all: redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
