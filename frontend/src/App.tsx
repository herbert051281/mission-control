import React from 'react'
import { useHealthCheck } from './services/healthService'
import { useWebSocketEvents } from './hooks/useWebSocketEvents'
import Router from './router'
import './styles/index.css'

function App() {
  useHealthCheck(30000) // Check every 30 seconds
  useWebSocketEvents()

  return <Router />
}

export default App
