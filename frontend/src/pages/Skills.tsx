import { useStore } from '../store'

export default function Skills() {
  const { skills, getSkillsByCategory } = useStore()

  const categories = Array.from(new Set(skills.map((s) => s.category)))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Skills</h1>
        <p className="text-text-muted">Manage agent capabilities and integrations</p>
      </div>

      {/* Overall Stats */}
      <div className="bg-dark-panel border border-dark-border rounded-lg p-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-text-muted">Total Skills</p>
            <p className="text-3xl font-bold text-accent-cyan">{skills.length}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Categories</p>
            <p className="text-3xl font-bold text-cyan-400">{categories.length}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Active</p>
            <p className="text-3xl font-bold text-green-400">
              {skills.filter((s) => s.enabled).length}
            </p>
          </div>
        </div>
      </div>

      {/* Skills by Category */}
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category} className="bg-dark-panel border border-dark-border rounded-lg p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getSkillsByCategory(category).map((skill) => (
                <div key={skill.id} className="bg-dark-secondary rounded p-4 border border-dark-border">
                  <h3 className="font-semibold text-text-primary mb-1">{skill.name}</h3>
                  <p className="text-xs text-text-muted mb-3">{skill.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-muted">Executions: {skill.executionCount}</span>
                      <span
                        className={`px-2 py-1 rounded ${
                          skill.enabled
                            ? 'bg-green-600 bg-opacity-20 text-green-400'
                            : 'bg-gray-600 bg-opacity-20 text-gray-400'
                        }`}
                      >
                        {skill.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted">
                      Success Rate: {(skill.successRate * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
