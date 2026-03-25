import { useStore } from '../store'
import { ApprovalsPanel } from '../components'

export default function Approvals() {
  const { getPendingApprovals } = useStore()
  const pendingApprovals = getPendingApprovals()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Approvals</h1>
        <p className="text-text-muted">Manage pending requests and approvals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApprovalsPanel />
        
        {/* Summary Stats */}
        <div className="bg-dark-panel border border-dark-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">Status</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-text-muted">Pending Approvals</p>
              <p className="text-4xl font-bold text-accent-cyan">{pendingApprovals.length}</p>
            </div>
            <div className="bg-dark-secondary rounded p-4">
              <p className="text-sm text-text-muted mb-2">Recent Activity</p>
              <p className="text-text-primary">Check the approvals panel to review and action requests</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
