import React from 'react'
import { ActivityFeed } from '../components'

export default function Activity() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text-primary">Activity Log</h1>
      <div className="bg-dark-panel border border-dark-border rounded-lg p-4">
        <ActivityFeed />
      </div>
    </div>
  )
}
