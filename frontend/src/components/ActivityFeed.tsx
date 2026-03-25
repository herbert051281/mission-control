import React, { useEffect } from 'react'
import { useStore } from '../store'
import ActivityEntry from './ActivityEntry'

export default function ActivityFeed() {
  const { activities, setActivities } = useStore()

  // Auto-scroll to top when new activity arrives
  useEffect(() => {
    const container = document.getElementById('activity-feed-container')
    if (container) {
      container.scrollTop = 0
    }
  }, [activities.length])

  return (
    <div className="bg-dark-panel border border-dark-border rounded-lg flex flex-col h-96">
      {/* Header */}
      <div className="border-b border-dark-border px-4 py-3 font-semibold text-text-primary">
        Activity Feed
        <span className="text-xs text-text-muted ml-2">({activities.length})</span>
      </div>

      {/* Activity Log */}
      <div id="activity-feed-container" className="flex-1 overflow-y-auto space-y-1 p-3">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityEntry key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="text-text-muted text-sm text-center py-8">
            No activities yet
          </div>
        )}
      </div>

      {/* Footer: Load more (optional) */}
      <div className="border-t border-dark-border px-4 py-2 text-xs text-text-muted text-center">
        Showing latest {Math.min(activities.length, 100)} activities
      </div>
    </div>
  )
}
