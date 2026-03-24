/**
 * Iris WebSocket Events
 * 9 core event types for real-time frontend updates
 * All events include timestamps and metadata without sensitive data
 */

import { broadcast } from './index';
import {
  Mission,
  Agent,
  ActivityLog,
  Approval,
  Skill,
  SystemHealth,
} from '../types';

/**
 * Event interface for type safety
 */
export interface WebSocketEvent {
  type: string;
  timestamp: Date;
  data: unknown;
}

/**
 * EVENT 1: Mission Status Updated
 * Emitted when a mission moves to a new pipeline stage
 * Example: intake → routed → in_progress
 */
export const emitMissionStatusUpdated = (mission: Mission): void => {
  broadcast('mission:status:updated', {
    mission_id: mission.id,
    status: mission.status,
    timestamp: new Date(),
  });
};

/**
 * EVENT 2: Agent Status Changed
 * Emitted when an agent's status changes
 * Example: idle → running → waiting → completed
 */
export const emitAgentStatusChanged = (agent: Agent): void => {
  broadcast('agent:status:changed', {
    agent_id: agent.id,
    status: agent.status,
    name: agent.name,
    timestamp: new Date(),
  });
};

/**
 * EVENT 3: Activity Created
 * Emitted when a new activity is logged by an agent
 * Used to track agent actions in real-time
 */
export const emitActivityCreated = (activity: ActivityLog): void => {
  broadcast('activity:created', {
    activity_id: activity.id,
    agent: activity.agent,
    action: activity.action,
    target: activity.target,
    timestamp: activity.timestamp,
  });
};

/**
 * EVENT 4: Approval Pending
 * Emitted when a new approval request is created and waiting for review
 * Critical for triggering approval notifications in the UI
 */
export const emitApprovalPending = (approval: Approval): void => {
  broadcast('approval:pending', {
    approval_id: approval.id,
    mission_id: approval.mission_id,
    type: approval.type,
    requested_by: approval.requested_by,
    timestamp: approval.requested_at,
  });
};

/**
 * EVENT 5: Approval Resolved
 * Emitted when an approval is approved or denied
 * Updates mission status based on approval outcome
 */
export const emitApprovalResolved = (approval: Approval): void => {
  broadcast('approval:resolved', {
    approval_id: approval.id,
    mission_id: approval.mission_id,
    status: approval.status,
    resolver: approval.resolver,
    timestamp: approval.resolved_at,
  });
};

/**
 * EVENT 6: System Health Updated
 * Emitted when system health metrics change
 * Includes agent availability, queue depth, and active mission count
 */
export const emitHealthUpdated = (health: SystemHealth): void => {
  broadcast('health:updated', {
    agent_availability: health.agent_availability,
    queue_depth: health.queue_depth,
    active_missions_count: health.active_missions_count,
    timestamp: new Date(),
  });
};

/**
 * EVENT 7: Skill Deployed
 * Emitted when a skill is deployed to a new environment state
 * Example: development → staging → production
 */
export const emitSkillDeployed = (skill: Skill): void => {
  broadcast('skill:deployed', {
    skill_id: skill.id,
    name: skill.name,
    version: skill.version,
    deployment_state: skill.deployment_state,
    timestamp: skill.updated_at,
  });
};

/**
 * EVENT 8: Mission Assigned
 * Emitted when one or more agents are assigned to a mission
 * Updates UI to reflect agent availability and mission assignment
 */
export const emitMissionAssigned = (mission_id: string, agent_ids: string[]): void => {
  broadcast('mission:assigned', {
    mission_id,
    assigned_agents: agent_ids,
    timestamp: new Date(),
  });
};

/**
 * EVENT 9: Mission Completed
 * Emitted when a mission reaches the completed state
 * Final event in mission lifecycle, triggers UI cleanup and summary display
 */
export const emitMissionCompleted = (mission_id: string): void => {
  broadcast('mission:completed', {
    mission_id,
    timestamp: new Date(),
  });
};
