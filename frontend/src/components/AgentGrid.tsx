import React from 'react'
import { useStore } from '../store'
import AgentCard from './AgentCard'

export default function AgentGrid() {
  const { agents } = useStore()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  )
}
