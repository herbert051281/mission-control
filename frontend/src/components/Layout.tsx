import React from 'react'
import { useStore } from '../store'
import TopCommandBar from './TopCommandBar'
import LeftNav from './LeftNav'
import MainContent from './MainContent'
import ApprovalsPanel from './ApprovalsPanel'
import ActivityFeed from './ActivityFeed'

export default function Layout() {
  const { sidebarOpen } = useStore()

  return (
    <div className="flex h-screen bg-dark-bg text-text-primary">
      {/* Left Navigation */}
      <LeftNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Command Bar */}
        <TopCommandBar />

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-auto">
          {/* Main Panel (2 cols) */}
          <div className="col-span-2">
            <MainContent />
          </div>

          {/* Right Sidebar (1 col) */}
          <div className="flex flex-col gap-4 overflow-auto">
            <ApprovalsPanel />
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  )
}
