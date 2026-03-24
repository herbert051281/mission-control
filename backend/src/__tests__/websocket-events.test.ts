import {
  emitMissionStatusUpdated,
  emitAgentStatusChanged,
  emitActivityCreated,
  emitApprovalPending,
  emitApprovalResolved,
  emitHealthUpdated,
  emitSkillDeployed,
  emitMissionAssigned,
  emitMissionCompleted,
} from '../websocket/events';
import * as websocket from '../websocket';
import {
  Mission,
  Agent,
  ActivityLog,
  Approval,
  Skill,
  SystemHealth,
  MissionStatus,
  MissionPriority,
  AgentStatus,
  ActivityStatus,
  ApprovalType,
  ApprovalStatus,
  DeploymentState,
} from '../types';

describe('WebSocket Events', () => {
  let broadcastSpy: jest.SpyInstance;

  beforeEach(() => {
    broadcastSpy = jest.spyOn(websocket, 'broadcast').mockImplementation(() => {});
  });

  afterEach(() => {
    broadcastSpy.mockRestore();
  });

  describe('emitMissionStatusUpdated', () => {
    it('broadcasts mission:status:updated with correct payload', () => {
      const mission: Mission = {
        id: 'mission-123',
        title: 'Test Mission',
        category: 'testing',
        created_at: new Date(),
        status: MissionStatus.IN_PROGRESS,
        assigned_agents: ['agent-1'],
        approval_required: false,
        priority: MissionPriority.HIGH,
        summary: 'Test summary',
        details: {},
      };

      emitMissionStatusUpdated(mission);

      expect(broadcastSpy).toHaveBeenCalledWith('mission:status:updated', {
        mission_id: 'mission-123',
        status: MissionStatus.IN_PROGRESS,
        timestamp: expect.any(Date),
      });
    });

    it('includes timestamp for mission status update', () => {
      const mission: Mission = {
        id: 'mission-456',
        title: 'Another Mission',
        category: 'testing',
        created_at: new Date(),
        status: MissionStatus.COMPLETED,
        assigned_agents: [],
        approval_required: false,
        priority: MissionPriority.LOW,
        summary: 'Another summary',
        details: {},
      };

      const timeBefore = new Date();
      emitMissionStatusUpdated(mission);
      const timeAfter = new Date();

      const callArgs = broadcastSpy.mock.calls[0][1] as any;
      expect(callArgs.timestamp).toBeInstanceOf(Date);
      expect(callArgs.timestamp.getTime()).toBeGreaterThanOrEqual(timeBefore.getTime());
      expect(callArgs.timestamp.getTime()).toBeLessThanOrEqual(timeAfter.getTime());
    });
  });

  describe('emitAgentStatusChanged', () => {
    it('broadcasts agent:status:changed with correct payload', () => {
      const agent: Agent = {
        id: 'agent-123',
        name: 'TestAgent',
        role: 'analyst',
        model: 'gpt-4',
        status: AgentStatus.RUNNING,
        last_updated: new Date(),
      };

      emitAgentStatusChanged(agent);

      expect(broadcastSpy).toHaveBeenCalledWith('agent:status:changed', {
        agent_id: 'agent-123',
        status: AgentStatus.RUNNING,
        name: 'TestAgent',
        timestamp: expect.any(Date),
      });
    });

    it('handles all valid agent statuses', () => {
      const agent: Agent = {
        id: 'agent-456',
        name: 'AnotherAgent',
        role: 'runner',
        model: 'gpt-3.5',
        status: AgentStatus.IDLE,
        last_updated: new Date(),
      };

      emitAgentStatusChanged(agent);

      const callArgs = broadcastSpy.mock.calls[0][1] as any;
      expect(callArgs.status).toBe(AgentStatus.IDLE);
    });
  });

  describe('emitActivityCreated', () => {
    it('broadcasts activity:created with correct payload', () => {
      const activity: ActivityLog = {
        id: 'activity-123',
        timestamp: new Date(),
        agent: 'agent-1',
        action: 'execute_skill',
        target: 'mission-1',
        status: ActivityStatus.IN_PROGRESS,
        details: { skill_name: 'analyze_data' },
      };

      emitActivityCreated(activity);

      expect(broadcastSpy).toHaveBeenCalledWith('activity:created', {
        activity_id: 'activity-123',
        agent: 'agent-1',
        action: 'execute_skill',
        target: 'mission-1',
        timestamp: activity.timestamp,
      });
    });

    it('preserves original activity timestamp', () => {
      const activityTime = new Date('2026-03-25T10:30:00Z');
      const activity: ActivityLog = {
        id: 'activity-456',
        timestamp: activityTime,
        agent: 'agent-2',
        action: 'log_result',
        target: 'mission-2',
        status: ActivityStatus.COMPLETED,
        details: {},
      };

      emitActivityCreated(activity);

      const callArgs = broadcastSpy.mock.calls[0][1] as any;
      expect(callArgs.timestamp).toBe(activityTime);
    });
  });

  describe('emitApprovalPending', () => {
    it('broadcasts approval:pending with correct payload', () => {
      const approval: Approval = {
        id: 'approval-123',
        mission_id: 'mission-1',
        type: ApprovalType.PRODUCTION,
        requested_by: 'agent-1',
        status: ApprovalStatus.PENDING,
        requested_at: new Date(),
      };

      emitApprovalPending(approval);

      expect(broadcastSpy).toHaveBeenCalledWith('approval:pending', {
        approval_id: 'approval-123',
        mission_id: 'mission-1',
        type: ApprovalType.PRODUCTION,
        requested_by: 'agent-1',
        timestamp: approval.requested_at,
      });
    });

    it('handles all approval types', () => {
      const approvalTypes = [
        ApprovalType.PRODUCTION,
        ApprovalType.DESTRUCTIVE,
        ApprovalType.EXTERNAL,
        ApprovalType.INTEGRATION,
        ApprovalType.SKILL,
      ];

      approvalTypes.forEach((approvalType) => {
        broadcastSpy.mockClear();
        const approval: Approval = {
          id: `approval-${approvalType}`,
          mission_id: 'mission-1',
          type: approvalType,
          requested_by: 'agent-1',
          status: ApprovalStatus.PENDING,
          requested_at: new Date(),
        };

        emitApprovalPending(approval);

        const callArgs = broadcastSpy.mock.calls[0][1] as any;
        expect(callArgs.type).toBe(approvalType);
      });
    });
  });

  describe('emitApprovalResolved', () => {
    it('broadcasts approval:resolved with correct payload when approved', () => {
      const approval: Approval = {
        id: 'approval-123',
        mission_id: 'mission-1',
        type: ApprovalType.DESTRUCTIVE,
        requested_by: 'agent-1',
        status: ApprovalStatus.APPROVED,
        requested_at: new Date(),
        resolved_at: new Date(),
        resolver: 'user-admin',
      };

      emitApprovalResolved(approval);

      expect(broadcastSpy).toHaveBeenCalledWith('approval:resolved', {
        approval_id: 'approval-123',
        mission_id: 'mission-1',
        status: ApprovalStatus.APPROVED,
        resolver: 'user-admin',
        timestamp: approval.resolved_at,
      });
    });

    it('broadcasts approval:resolved with denied status', () => {
      const resolvedTime = new Date();
      const approval: Approval = {
        id: 'approval-456',
        mission_id: 'mission-2',
        type: ApprovalType.EXTERNAL,
        requested_by: 'agent-2',
        status: ApprovalStatus.DENIED,
        requested_at: new Date(),
        resolved_at: resolvedTime,
        resolver: 'user-reviewer',
      };

      emitApprovalResolved(approval);

      const callArgs = broadcastSpy.mock.calls[0][1] as any;
      expect(callArgs.status).toBe(ApprovalStatus.DENIED);
      expect(callArgs.timestamp).toBe(resolvedTime);
    });
  });

  describe('emitHealthUpdated', () => {
    it('broadcasts health:updated with correct payload', () => {
      const health: SystemHealth = {
        agent_availability: {
          agent_1: true,
          agent_2: false,
        },
        queue_depth: 5,
        last_heartbeat: new Date(),
        active_missions_count: 3,
      };

      emitHealthUpdated(health);

      expect(broadcastSpy).toHaveBeenCalledWith('health:updated', {
        agent_availability: health.agent_availability,
        queue_depth: 5,
        active_missions_count: 3,
        timestamp: expect.any(Date),
      });
    });

    it('includes current timestamp for health updates', () => {
      const health: SystemHealth = {
        agent_availability: { agent_1: true },
        queue_depth: 0,
        last_heartbeat: new Date(),
        active_missions_count: 0,
      };

      const timeBefore = new Date();
      emitHealthUpdated(health);
      const timeAfter = new Date();

      const callArgs = broadcastSpy.mock.calls[0][1] as any;
      expect(callArgs.timestamp).toBeInstanceOf(Date);
      expect(callArgs.timestamp.getTime()).toBeGreaterThanOrEqual(timeBefore.getTime());
      expect(callArgs.timestamp.getTime()).toBeLessThanOrEqual(timeAfter.getTime());
    });
  });

  describe('emitSkillDeployed', () => {
    it('broadcasts skill:deployed with correct payload', () => {
      const skill: Skill = {
        id: 'skill-123',
        name: 'data_analyzer',
        version: '1.2.3',
        owner: 'agent-1',
        deployment_state: DeploymentState.PRODUCTION,
        updated_at: new Date(),
      };

      emitSkillDeployed(skill);

      expect(broadcastSpy).toHaveBeenCalledWith('skill:deployed', {
        skill_id: 'skill-123',
        name: 'data_analyzer',
        version: '1.2.3',
        deployment_state: DeploymentState.PRODUCTION,
        timestamp: skill.updated_at,
      });
    });

    it('handles all deployment states', () => {
      const deploymentStates = [
        DeploymentState.DEVELOPMENT,
        DeploymentState.STAGING,
        DeploymentState.PRODUCTION,
      ];

      deploymentStates.forEach((state) => {
        broadcastSpy.mockClear();
        const skill: Skill = {
          id: `skill-${state}`,
          name: `skill_${state}`,
          version: '1.0.0',
          owner: 'agent-1',
          deployment_state: state,
          updated_at: new Date(),
        };

        emitSkillDeployed(skill);

        const callArgs = broadcastSpy.mock.calls[0][1] as any;
        expect(callArgs.deployment_state).toBe(state);
      });
    });
  });

  describe('emitMissionAssigned', () => {
    it('broadcasts mission:assigned with correct payload', () => {
      const missionId = 'mission-123';
      const agentIds = ['agent-1', 'agent-2', 'agent-3'];

      emitMissionAssigned(missionId, agentIds);

      expect(broadcastSpy).toHaveBeenCalledWith('mission:assigned', {
        mission_id: 'mission-123',
        assigned_agents: ['agent-1', 'agent-2', 'agent-3'],
        timestamp: expect.any(Date),
      });
    });

    it('handles empty agent list', () => {
      emitMissionAssigned('mission-456', []);

      const callArgs = broadcastSpy.mock.calls[0][1] as any;
      expect(callArgs.assigned_agents).toEqual([]);
    });

    it('includes current timestamp for mission assignment', () => {
      const timeBefore = new Date();
      emitMissionAssigned('mission-789', ['agent-1']);
      const timeAfter = new Date();

      const callArgs = broadcastSpy.mock.calls[0][1] as any;
      expect(callArgs.timestamp.getTime()).toBeGreaterThanOrEqual(timeBefore.getTime());
      expect(callArgs.timestamp.getTime()).toBeLessThanOrEqual(timeAfter.getTime());
    });
  });

  describe('emitMissionCompleted', () => {
    it('broadcasts mission:completed with correct payload', () => {
      const missionId = 'mission-123';

      emitMissionCompleted(missionId);

      expect(broadcastSpy).toHaveBeenCalledWith('mission:completed', {
        mission_id: 'mission-123',
        timestamp: expect.any(Date),
      });
    });

    it('includes current timestamp for mission completion', () => {
      const timeBefore = new Date();
      emitMissionCompleted('mission-456');
      const timeAfter = new Date();

      const callArgs = broadcastSpy.mock.calls[0][1] as any;
      expect(callArgs.timestamp).toBeInstanceOf(Date);
      expect(callArgs.timestamp.getTime()).toBeGreaterThanOrEqual(timeBefore.getTime());
      expect(callArgs.timestamp.getTime()).toBeLessThanOrEqual(timeAfter.getTime());
    });
  });

  describe('Event signature validation', () => {
    it('all 9 event types are properly formatted', () => {
      const eventTypes = [
        'mission:status:updated',
        'agent:status:changed',
        'activity:created',
        'approval:pending',
        'approval:resolved',
        'health:updated',
        'skill:deployed',
        'mission:assigned',
        'mission:completed',
      ];

      const health: SystemHealth = {
        agent_availability: {},
        queue_depth: 0,
        last_heartbeat: new Date(),
        active_missions_count: 0,
      };

      // Create test data for each event
      const mission: Mission = {
        id: 'test-1',
        title: 'Test',
        category: 'test',
        created_at: new Date(),
        status: MissionStatus.INTAKE,
        assigned_agents: [],
        approval_required: false,
        priority: MissionPriority.LOW,
        summary: 'Test',
        details: {},
      };

      const agent: Agent = {
        id: 'test-1',
        name: 'Test',
        role: 'test',
        model: 'test',
        status: AgentStatus.IDLE,
        last_updated: new Date(),
      };

      const activity: ActivityLog = {
        id: 'test-1',
        timestamp: new Date(),
        agent: 'test',
        action: 'test',
        target: 'test',
        status: ActivityStatus.INITIATED,
        details: {},
      };

      const approval: Approval = {
        id: 'test-1',
        mission_id: 'test-1',
        type: ApprovalType.PRODUCTION,
        requested_by: 'test',
        status: ApprovalStatus.PENDING,
        requested_at: new Date(),
      };

      const skill: Skill = {
        id: 'test-1',
        name: 'test',
        version: '1.0.0',
        owner: 'test',
        deployment_state: DeploymentState.DEVELOPMENT,
        updated_at: new Date(),
      };

      // Emit all events
      emitMissionStatusUpdated(mission);
      emitAgentStatusChanged(agent);
      emitActivityCreated(activity);
      emitApprovalPending(approval);
      emitApprovalResolved(approval);
      emitHealthUpdated(health);
      emitSkillDeployed(skill);
      emitMissionAssigned('test-1', ['test-1']);
      emitMissionCompleted('test-1');

      // Verify all 9 events were broadcast
      expect(broadcastSpy).toHaveBeenCalledTimes(9);

      // Verify event type names
      const broadcastedEventTypes = broadcastSpy.mock.calls.map((call) => call[0]);
      expect(broadcastedEventTypes).toEqual(expect.arrayContaining(eventTypes));
      expect(broadcastedEventTypes).toHaveLength(9);
    });
  });

  describe('No sensitive data in events', () => {
    it('mission status update does not include sensitive details', () => {
      const mission: Mission = {
        id: 'mission-123',
        title: 'Secret Mission',
        category: 'classified',
        created_at: new Date(),
        status: MissionStatus.IN_PROGRESS,
        assigned_agents: ['agent-1'],
        approval_required: true,
        priority: MissionPriority.CRITICAL,
        summary: 'Top secret summary',
        details: { api_key: 'super-secret-key', password: 'hidden' },
      };

      emitMissionStatusUpdated(mission);

      const callArgs = broadcastSpy.mock.calls[0][1] as any;
      expect(callArgs).not.toHaveProperty('details');
      expect(callArgs).not.toHaveProperty('title');
      expect(callArgs).not.toHaveProperty('api_key');
    });

    it('approval event does not expose sensitive resolver information', () => {
      const approval: Approval = {
        id: 'approval-123',
        mission_id: 'mission-1',
        type: ApprovalType.PRODUCTION,
        requested_by: 'agent-1',
        status: ApprovalStatus.APPROVED,
        requested_at: new Date(),
        resolved_at: new Date(),
        resolver: 'user-admin',
      };

      emitApprovalResolved(approval);

      const callArgs = broadcastSpy.mock.calls[0][1] as any;
      // Only ID, mission_id, status, resolver, and timestamp should be present
      expect(Object.keys(callArgs).sort()).toEqual(
        ['approval_id', 'mission_id', 'status', 'resolver', 'timestamp'].sort()
      );
    });
  });
});
