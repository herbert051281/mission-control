# API Reference

Mission Control provides a complete REST API and WebSocket interface for mission orchestration, agent management, and approval workflows.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API requests (except `/auth/login`) require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer {token}
```

### Login

Authenticate and receive a JWT token for subsequent requests.

```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "agent_id": "agent-1",
  "agent_name": "Command Center",
  "expires_at": "2026-03-26T21:55:00Z"
}
```

## Missions

### List All Missions

```http
GET /missions
Authorization: Bearer {token}

Response (200):
[
  {
    "id": "mission-1",
    "title": "Analyze production logs",
    "description": "Review error patterns in Q1 logs",
    "status": "in_progress",
    "priority": "high",
    "category": "analytics",
    "assigned_to": "agent-2",
    "created_at": "2026-03-25T08:30:00Z",
    "updated_at": "2026-03-25T09:15:00Z",
    "completed_at": null
  }
]
```

### Get Mission Details

```http
GET /missions/{id}
Authorization: Bearer {token}

Response (200):
{
  "id": "mission-1",
  "title": "Analyze production logs",
  "description": "Review error patterns in Q1 logs",
  "status": "in_progress",
  "priority": "high",
  "category": "analytics",
  "assigned_to": "agent-2",
  "created_at": "2026-03-25T08:30:00Z",
  "updated_at": "2026-03-25T09:15:00Z",
  "completed_at": null,
  "activity_log": [
    {
      "timestamp": "2026-03-25T09:15:00Z",
      "action": "status_updated",
      "actor": "agent-2",
      "details": "Moved from todo to in_progress"
    }
  ]
}
```

### Create Mission

```http
POST /missions
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Deploy v2.0 release",
  "description": "Deploy latest build to production",
  "category": "deployment",
  "priority": "high",
  "assigned_to": "agent-3"
}

Response (201):
{
  "id": "mission-87",
  "title": "Deploy v2.0 release",
  "description": "Deploy latest build to production",
  "status": "todo",
  "priority": "high",
  "category": "deployment",
  "assigned_to": "agent-3",
  "created_at": "2026-03-25T12:00:00Z",
  "updated_at": "2026-03-25T12:00:00Z",
  "completed_at": null
}
```

### Update Mission

```http
PATCH /missions/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in_progress",
  "priority": "medium"
}

Response (200):
{
  "id": "mission-87",
  "title": "Deploy v2.0 release",
  "status": "in_progress",
  "priority": "medium",
  ...
}
```

### Mission Statuses

- `todo` — Not started
- `in_progress` — Currently being worked on
- `in_review` — Awaiting approval/review
- `approved` — Approved, ready for next stage
- `completed` — Successfully finished
- `failed` — Encountered error/failure

## Agents

### List All Agents

```http
GET /agents
Authorization: Bearer {token}

Response (200):
[
  {
    "id": "agent-1",
    "name": "Command Center",
    "type": "controller",
    "status": "online",
    "last_seen": "2026-03-25T21:55:00Z",
    "capabilities": ["mission_management", "health_monitoring"],
    "active_missions": 0,
    "completed_missions": 45
  },
  {
    "id": "agent-2",
    "name": "DataBot",
    "type": "worker",
    "status": "online",
    "last_seen": "2026-03-25T21:54:00Z",
    "capabilities": ["analysis", "reporting"],
    "active_missions": 3,
    "completed_missions": 127
  }
]
```

### Get Agent Details

```http
GET /agents/{id}
Authorization: Bearer {token}

Response (200):
{
  "id": "agent-2",
  "name": "DataBot",
  "type": "worker",
  "status": "online",
  "last_seen": "2026-03-25T21:54:00Z",
  "capabilities": ["analysis", "reporting"],
  "active_missions": 3,
  "completed_missions": 127,
  "current_missions": [
    { "id": "mission-5", "title": "Daily analytics", "progress": 65 },
    { "id": "mission-12", "title": "Report generation", "progress": 30 },
    { "id": "mission-19", "title": "Data validation", "progress": 100 }
  ]
}
```

## Approvals

### List Pending Approvals

```http
GET /approvals
Authorization: Bearer {token}

Response (200):
[
  {
    "id": "approval-42",
    "mission_id": "mission-15",
    "action": "deploy_to_production",
    "status": "pending",
    "requester": "agent-2",
    "created_at": "2026-03-25T20:30:00Z",
    "expires_at": "2026-03-25T22:30:00Z",
    "description": "Deploy v2.0.1 hotfix to production"
  }
]
```

### Approve Request

```http
POST /approvals/{id}/approve
Authorization: Bearer {token}
Content-Type: application/json

{
  "notes": "Reviewed logs, ready to proceed"
}

Response (200):
{
  "id": "approval-42",
  "status": "approved",
  "approved_by": "agent-1",
  "approved_at": "2026-03-25T21:00:00Z",
  "notes": "Reviewed logs, ready to proceed"
}
```

### Deny Request

```http
POST /approvals/{id}/deny
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Waiting for QA sign-off"
}

Response (200):
{
  "id": "approval-42",
  "status": "denied",
  "denied_by": "agent-1",
  "denied_at": "2026-03-25T21:00:00Z",
  "reason": "Waiting for QA sign-off"
}
```

## Activities

### List Recent Activities

```http
GET /activities?limit=50&offset=0
Authorization: Bearer {token}

Response (200):
[
  {
    "id": "activity-523",
    "type": "mission_created",
    "actor": "agent-1",
    "target": "mission-87",
    "description": "Created mission: Deploy v2.0 release",
    "timestamp": "2026-03-25T12:00:00Z"
  },
  {
    "id": "activity-522",
    "type": "agent_status_changed",
    "actor": "system",
    "target": "agent-2",
    "description": "Agent status changed to online",
    "timestamp": "2026-03-25T11:45:00Z"
  }
]
```

## Health & Status

### System Health Check

```http
GET /health
Authorization: Bearer {token}

Response (200):
{
  "status": "healthy",
  "timestamp": "2026-03-25T21:55:00Z",
  "backend": {
    "status": "healthy",
    "uptime_seconds": 86400
  },
  "database": {
    "status": "healthy",
    "connection_time_ms": 5
  },
  "agents_online": 7,
  "missions_active": 12,
  "approvals_pending": 2
}
```

## WebSocket API

Connect to the WebSocket server for real-time updates on missions, agents, and approvals.

### Connection

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connect', () => {
  console.log('Connected to Mission Control');
});
```

### Events (Receive)

#### mission:created
```javascript
socket.on('mission:created', (data) => {
  console.log('New mission:', data);
  // {
  //   "id": "mission-87",
  //   "title": "Deploy v2.0 release",
  //   "status": "todo",
  //   ...
  // }
});
```

#### mission:updated
```javascript
socket.on('mission:updated', (data) => {
  console.log('Mission updated:', data);
});
```

#### mission:completed
```javascript
socket.on('mission:completed', (data) => {
  console.log('Mission completed:', data);
});
```

#### agent:status_changed
```javascript
socket.on('agent:status_changed', (data) => {
  console.log('Agent status changed:', data);
  // { "id": "agent-2", "status": "online", "timestamp": "..." }
});
```

#### approval:created
```javascript
socket.on('approval:created', (data) => {
  console.log('New approval request:', data);
});
```

#### approval:resolved
```javascript
socket.on('approval:resolved', (data) => {
  console.log('Approval resolved:', data);
});
```

#### activity:logged
```javascript
socket.on('activity:logged', (data) => {
  console.log('Activity logged:', data);
});
```

#### health:updated
```javascript
socket.on('health:updated', (data) => {
  console.log('Health status updated:', data);
});
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid mission status",
  "details": "Status must be one of: todo, in_progress, in_review, approved, completed, failed"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "details": "Missing or invalid authentication token"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "details": "Mission with id 'mission-999' does not exist"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "An unexpected error occurred. Contact support if problem persists."
}
```

## Rate Limiting

- **Authenticated requests**: 1000 per hour per agent
- **WebSocket events**: 100 per minute per connection
- **File uploads**: 50MB maximum per request

Rate limit information is returned in response headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1703275200
```

## Pagination

List endpoints support pagination via query parameters:

```
GET /missions?limit=20&offset=0
GET /activities?limit=50&offset=50
```

- `limit` — Number of items per page (default: 20, max: 100)
- `offset` — Number of items to skip (default: 0)

Response includes metadata:
```json
{
  "data": [...],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 87
  }
}
```

## Changelog

### v1.0.0 (2026-03-25)
- Initial API release
- REST endpoints for missions, agents, approvals
- WebSocket real-time event streaming
- JWT authentication
- Health monitoring endpoints
