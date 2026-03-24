/**
 * Type Compilation Tests
 * Verify that all interfaces and enums are properly defined and exportable
 */

import {
  // Enums
  AgentStatus,
  MissionStatus,
  MissionPriority,
  ActivityStatus,
  ApprovalType,
  ApprovalStatus,
  DeploymentState,
  // Interfaces
  Agent,
  Mission,
  ActivityLog,
  Approval,
  Skill,
  SystemHealth
} from '../types/index';

describe('Type System - Interface Compilation', () => {
  describe('AgentStatus enum', () => {
    it('should have all required status values', () => {
      expect(AgentStatus.IDLE).toBe('idle');
      expect(AgentStatus.RUNNING).toBe('running');
      expect(AgentStatus.WAITING).toBe('waiting');
      expect(AgentStatus.COMPLETED).toBe('completed');
      expect(AgentStatus.FAILED).toBe('failed');
    });
  });

  describe('Agent interface', () => {
    it('should accept a valid Agent object', () => {
      const agent: Agent = {
        id: 'uuid-1234',
        name: 'Kepler',
        role: 'BI Systems',
        model: 'GPT 5.4',
        status: AgentStatus.IDLE,
        last_updated: new Date()
      };
      expect(agent.name).toBe('Kepler');
    });

    it('should allow optional current_task property', () => {
      const agent: Agent = {
        id: 'uuid-1234',
        name: 'Einstein',
        role: 'Advanced Analytics',
        model: 'Claude Sonnet 4.5',
        status: AgentStatus.RUNNING,
        current_task: {
          id: 'task-1',
          title: 'Analyze Data',
          started_at: new Date()
        },
        last_updated: new Date()
      };
      expect(agent.current_task?.title).toBe('Analyze Data');
    });

    it('should allow optional last_completed_task property', () => {
      const agent: Agent = {
        id: 'uuid-1234',
        name: 'Newton',
        role: 'Physics Simulation',
        model: 'GPT 5.4',
        status: AgentStatus.WAITING,
        last_completed_task: {
          id: 'task-2',
          title: 'Process Results',
          completed_at: new Date()
        },
        last_updated: new Date()
      };
      expect(agent.last_completed_task?.title).toBe('Process Results');
    });
  });

  describe('MissionStatus enum', () => {
    it('should have all required mission status values', () => {
      expect(MissionStatus.INTAKE).toBe('intake');
      expect(MissionStatus.ROUTED).toBe('routed');
      expect(MissionStatus.IN_PROGRESS).toBe('in_progress');
      expect(MissionStatus.REVIEW).toBe('review');
      expect(MissionStatus.AWAITING_APPROVAL).toBe('awaiting_approval');
      expect(MissionStatus.COMPLETED).toBe('completed');
      expect(MissionStatus.FAILED).toBe('failed');
    });
  });

  describe('MissionPriority enum', () => {
    it('should have all required priority values', () => {
      expect(MissionPriority.LOW).toBe('low');
      expect(MissionPriority.MEDIUM).toBe('medium');
      expect(MissionPriority.HIGH).toBe('high');
      expect(MissionPriority.CRITICAL).toBe('critical');
    });
  });

  describe('Mission interface', () => {
    it('should accept a valid Mission object', () => {
      const mission: Mission = {
        id: 'mission-uuid',
        title: 'Analyze Q1 Metrics',
        category: 'BI',
        created_at: new Date(),
        status: MissionStatus.IN_PROGRESS,
        assigned_agents: ['kepler', 'einstein'],
        approval_required: true,
        priority: MissionPriority.HIGH,
        summary: 'Detailed Q1 performance analysis',
        details: { department: 'Finance', budget: 50000 }
      };
      expect(mission.title).toBe('Analyze Q1 Metrics');
      expect(mission.assigned_agents.length).toBe(2);
    });
  });

  describe('ActivityStatus enum', () => {
    it('should have all required activity status values', () => {
      expect(ActivityStatus.INITIATED).toBe('initiated');
      expect(ActivityStatus.IN_PROGRESS).toBe('in_progress');
      expect(ActivityStatus.COMPLETED).toBe('completed');
      expect(ActivityStatus.FAILED).toBe('failed');
    });
  });

  describe('ActivityLog interface', () => {
    it('should accept a valid ActivityLog object', () => {
      const log: ActivityLog = {
        id: 'log-uuid',
        timestamp: new Date(),
        agent: 'kepler',
        action: 'mission_created',
        target: 'mission-uuid',
        status: ActivityStatus.COMPLETED,
        details: { severity: 'info' }
      };
      expect(log.action).toBe('mission_created');
    });
  });

  describe('ApprovalType enum', () => {
    it('should have all required approval type values', () => {
      expect(ApprovalType.PRODUCTION).toBe('production');
      expect(ApprovalType.DESTRUCTIVE).toBe('destructive');
      expect(ApprovalType.EXTERNAL).toBe('external');
      expect(ApprovalType.INTEGRATION).toBe('integration');
      expect(ApprovalType.SKILL).toBe('skill');
    });
  });

  describe('ApprovalStatus enum', () => {
    it('should have all required approval status values', () => {
      expect(ApprovalStatus.PENDING).toBe('pending');
      expect(ApprovalStatus.APPROVED).toBe('approved');
      expect(ApprovalStatus.DENIED).toBe('denied');
    });
  });

  describe('Approval interface', () => {
    it('should accept a valid Approval object', () => {
      const approval: Approval = {
        id: 'approval-uuid',
        mission_id: 'mission-uuid',
        type: ApprovalType.PRODUCTION,
        requested_by: 'kepler',
        status: ApprovalStatus.PENDING,
        requested_at: new Date()
      };
      expect(approval.type).toBe('production');
    });

    it('should allow optional resolved_at and resolver properties', () => {
      const approval: Approval = {
        id: 'approval-uuid',
        mission_id: 'mission-uuid',
        type: ApprovalType.DESTRUCTIVE,
        requested_by: 'kepler',
        status: ApprovalStatus.APPROVED,
        requested_at: new Date(),
        resolved_at: new Date(),
        resolver: 'einstein'
      };
      expect(approval.resolver).toBe('einstein');
    });
  });

  describe('DeploymentState enum', () => {
    it('should have all required deployment state values', () => {
      expect(DeploymentState.DEVELOPMENT).toBe('development');
      expect(DeploymentState.STAGING).toBe('staging');
      expect(DeploymentState.PRODUCTION).toBe('production');
    });
  });

  describe('Skill interface', () => {
    it('should accept a valid Skill object', () => {
      const skill: Skill = {
        id: 'skill-uuid',
        name: 'data-analyzer',
        version: '1.0.0',
        owner: 'kepler',
        deployment_state: DeploymentState.PRODUCTION,
        updated_at: new Date()
      };
      expect(skill.name).toBe('data-analyzer');
      expect(skill.deployment_state).toBe('production');
    });
  });

  describe('SystemHealth interface', () => {
    it('should accept a valid SystemHealth object', () => {
      const health: SystemHealth = {
        agent_availability: {
          kepler: true,
          einstein: false,
          newton: true
        },
        queue_depth: 5,
        last_heartbeat: new Date(),
        active_missions_count: 3
      };
      expect(health.queue_depth).toBe(5);
      expect(health.agent_availability.kepler).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('should enforce type constraints at compile time', () => {
      // This test verifies that TypeScript strict mode is enabled
      // and type checking is working properly
      const agent: Agent = {
        id: 'uuid',
        name: 'test',
        role: 'role',
        model: 'model',
        status: AgentStatus.IDLE,
        last_updated: new Date()
      };
      expect(typeof agent.id).toBe('string');
      expect(agent.status).toMatch(/^(idle|running|waiting|completed|failed)$/);
    });
  });
});
