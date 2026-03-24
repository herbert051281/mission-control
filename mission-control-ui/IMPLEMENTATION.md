# Implementation Guide

## Project Setup

### 1. Initialize Project
```bash
npm create vite@latest mission-control -- --template react-ts
cd mission-control
npm install
```

### 2. Install Dependencies
```bash
npm install \
  zustand \
  react-query \
  date-fns \
  clsx \
  axios \
  ws \
  react-router-dom

npm install -D \
  @types/node \
  typescript \
  postcss \
  autoprefixer \
  @tailwindcss/forms
```

### 3. Project Structure
```
mission-control/
├── src/
│   ├── index.css                    # Global styles & tokens
│   ├── main.tsx
│   ├── App.tsx
│   │
│   ├── layouts/
│   │   └── MissionControl.tsx
│   │
│   ├── components/
│   │   ├── TopCommandBar.tsx
│   │   ├── LeftNavigationRail.tsx
│   │   ├── MissionPipelineBoard.tsx
│   │   ├── MissionCard.tsx
│   │   ├── AgentStatusGrid.tsx
│   │   ├── AgentCard.tsx
│   │   ├── LiveActivityFeed.tsx
│   │   ├── ApprovalsPanel.tsx
│   │   ├── SystemHealthSummary.tsx
│   │   ├── CommandSearchInput.tsx
│   │   ├── StatusBadges.tsx
│   │   └── common/
│   │       ├── Skeleton.tsx
│   │       ├── Modal.tsx
│   │       ├── ContextMenu.tsx
│   │       └── Tooltip.tsx
│   │
│   ├── stores/
│   │   ├── useStore.ts
│   │   ├── useWebSocket.ts
│   │   └── slices/
│   │       ├── uiSlice.ts
│   │       ├── missionSlice.ts
│   │       ├── agentSlice.ts
│   │       └── approvalSlice.ts
│   │
│   ├── hooks/
│   │   ├── useQuery.ts
│   │   ├── useMissions.ts
│   │   ├── useAgents.ts
│   │   ├── useApprovals.ts
│   │   └── useKeyboard.ts
│   │
│   ├── api/
│   │   ├── client.ts
│   │   ├── missions.ts
│   │   ├── agents.ts
│   │   ├── approvals.ts
│   │   ├── activity.ts
│   │   ├── health.ts
│   │   ├── skills.ts
│   │   └── types.ts
│   │
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── layout.module.css
│   │   └── components.module.css
│   │
│   ├── utils/
│   │   ├── format.ts
│   │   ├── debounce.ts
│   │   └── colors.ts
│   │
│   └── views/
│       ├── CommandCenterView.tsx
│       ├── MissionsView.tsx
│       ├── AgentsView.tsx
│       ├── ActivityView.tsx
│       ├── ApprovalsView.tsx
│       ├── SkillsView.tsx
│       └── SettingsView.tsx
│
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Core Implementation Files

### src/stores/useStore.ts
```typescript
import create from 'zustand';
import { devtools } from 'zustand/middleware';

export const useStore = create(
  devtools((set, get) => ({
    // UI State
    ui: {
      activeView: 'command_center',
      sidebarCollapsed: false,
      approvalsVisible: true,
      activityVisible: true,
      selectedMission: undefined,
      selectedAgent: undefined,
      filters: {},
    },

    // Data State
    missions: [],
    agents: [],
    approvals: [],
    activities: [],
    systemHealth: null,
    skills: [],

    // Connection State
    wsConnected: false,
    lastUpdate: new Date().toISOString(),

    // Actions
    setActiveView: (view: string) =>
      set((state) => ({
        ui: { ...state.ui, activeView: view },
      })),

    toggleSidebar: () =>
      set((state) => ({
        ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed },
      })),

    selectMission: (id: string | undefined) =>
      set((state) => ({
        ui: { ...state.ui, selectedMission: id },
      })),

    selectAgent: (id: string | undefined) =>
      set((state) => ({
        ui: { ...state.ui, selectedAgent: id },
      })),

    updateMission: (mission) =>
      set((state) => ({
        missions: state.missions.map((m) => (m.id === mission.id ? mission : m)),
      })),

    updateAgent: (agent) =>
      set((state) => ({
        agents: state.agents.map((a) => (a.id === agent.id ? agent : a)),
      })),

    addApproval: (approval) =>
      set((state) => ({
        approvals: [approval, ...state.approvals],
      })),

    approveAction: async (approvalId: string) => {
      // Call API
      await fetch(`/api/approvals/${approvalId}/approve`, { method: 'POST' });
      // Update local state
      set((state) => ({
        approvals: state.approvals.map((a) =>
          a.id === approvalId ? { ...a, status: 'approved' } : a
        ),
      }));
    },

    denyAction: async (approvalId: string, reason?: string) => {
      await fetch(`/api/approvals/${approvalId}/deny`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      set((state) => ({
        approvals: state.approvals.map((a) =>
          a.id === approvalId ? { ...a, status: 'denied' } : a
        ),
      }));
    },

    setWSConnected: (connected: boolean) =>
      set({ wsConnected: connected }),

    updateSystemHealth: (health) =>
      set({ systemHealth: health, lastUpdate: new Date().toISOString() }),
  }))
);
```

### src/hooks/useKeyboard.ts
```typescript
import { useEffect } from 'react';
import { useStore } from '../stores/useStore';

const SHORTCUTS = {
  'ctrl+k': () => {
    // Focus command search
    document.querySelector('input.command-search__input')?.focus();
  },
  'ctrl+a': () => {
    const store = useStore.getState();
    store.ui.approvalsVisible = !store.ui.approvalsVisible;
  },
  'ctrl+l': () => {
    const store = useStore.getState();
    store.ui.activityVisible = !store.ui.activityVisible;
  },
  'ctrl+1': () => useStore.getState().setActiveView('command_center'),
  'ctrl+2': () => useStore.getState().setActiveView('missions'),
  'ctrl+3': () => useStore.getState().setActiveView('agents'),
  'ctrl+4': () => useStore.getState().setActiveView('activity'),
  'ctrl+5': () => useStore.getState().setActiveView('approvals'),
  'ctrl+6': () => useStore.getState().setActiveView('skills'),
  'ctrl+7': () => useStore.getState().setActiveView('settings'),
};

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      
      const shortcut = isMeta
        ? `ctrl+${key}`
        : e.shiftKey
          ? `shift+${key}`
          : key;

      const handler = SHORTCUTS[shortcut as keyof typeof SHORTCUTS];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

### src/api/client.ts
```typescript
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### src/api/missions.ts
```typescript
import { apiClient } from './client';
import { Mission, FilterState } from './types';

export const missionAPI = {
  list: async (filters?: FilterState) => {
    const { data } = await apiClient.get<Mission[]>('/missions', { params: filters });
    return data;
  },

  detail: async (id: string) => {
    const { data } = await apiClient.get<Mission>(`/missions/${id}`);
    return data;
  },

  create: async (mission: Omit<Mission, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data } = await apiClient.post<Mission>('/missions', mission);
    return data;
  },

  update: async (id: string, updates: Partial<Mission>) => {
    const { data } = await apiClient.patch<Mission>(`/missions/${id}`, updates);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/missions/${id}`);
  },
};
```

---

## Keyboard Command Cheat Sheet

Create `src/components/CommandPalette.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { useStore } from '../stores/useStore';

const COMMANDS = [
  { keys: 'Ctrl+K', action: 'Open search' },
  { keys: 'Ctrl+1', action: 'Go to Command Center' },
  { keys: 'Ctrl+2', action: 'Go to Missions' },
  { keys: 'Ctrl+3', action: 'Go to Agents' },
  { keys: 'Ctrl+4', action: 'Go to Activity' },
  { keys: 'Ctrl+5', action: 'Go to Approvals' },
  { keys: 'Ctrl+6', action: 'Go to Skills' },
  { keys: 'Ctrl+7', action: 'Go to Settings' },
  { keys: 'Ctrl+A', action: 'Toggle Approvals Panel' },
  { keys: 'Ctrl+L', action: 'Toggle Activity Feed' },
  { keys: 'Enter', action: 'Approve selected (in Approvals)' },
  { keys: 'Shift+Enter', action: 'Deny selected (in Approvals)' },
  { keys: 'Esc', action: 'Close modal / Deselect' },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '?') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={() => setIsOpen(false)}>
      <div className="modal__content" onClick={(e) => e.stopPropagation()}>
        <h2>Keyboard Shortcuts</h2>
        <table>
          <tbody>
            {COMMANDS.map(({ keys, action }) => (
              <tr key={keys}>
                <td><kbd>{keys}</kbd></td>
                <td>{action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## WebSocket Integration

### src/hooks/useWebSocket.ts
```typescript
import { useEffect } from 'react';
import { useStore } from '../stores/useStore';
import { useQueryClient } from 'react-query';

export function useWebSocket() {
  const store = useStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const wsURL = process.env.REACT_APP_WS_URL || 'ws://localhost:3001/ws/mission-control';
    const ws = new WebSocket(wsURL);

    ws.onopen = () => {
      console.log('WebSocket connected');
      store.setWSConnected(true);
    };

    ws.onmessage = (event) => {
      const wsEvent = JSON.parse(event.data);

      switch (wsEvent.type) {
        case 'mission.updated':
          store.updateMission(wsEvent.payload);
          queryClient.invalidateQueries(['missions']);
          break;

        case 'mission.completed':
          queryClient.invalidateQueries(['missions']);
          break;

        case 'agent.status_changed':
          store.updateAgent(wsEvent.payload);
          queryClient.invalidateQueries(['agents']);
          break;

        case 'approval.pending':
          store.addApproval(wsEvent.payload);
          break;

        case 'activity.logged':
          queryClient.invalidateQueries(['activity']);
          break;

        case 'health.updated':
          store.updateSystemHealth(wsEvent.payload);
          break;

        case 'skill.deployed':
          queryClient.invalidateQueries(['skills']);
          break;
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      store.setWSConnected(false);
      // Reconnect after 3 seconds
      setTimeout(() => {
        // Trigger reconnection
      }, 3000);
    };

    return () => ws.close();
  }, [store, queryClient]);
}
```

---

## Build & Deployment

### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
      },
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: true,
  },
});
```

### Production Checklist
- [ ] Environment variables configured (.env.production)
- [ ] WebSocket SSL enabled (wss://)
- [ ] API authentication tokens in secure storage
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance testing (Lighthouse)
- [ ] Security headers (CSP, X-Frame-Options)
- [ ] Error boundary component implemented
- [ ] Offline fallback UI
- [ ] Analytics/monitoring integrated
- [ ] Dark mode thoroughly tested

---

## Performance Optimization

### 1. Code Splitting
```typescript
const CommandCenterView = lazy(() => import('../views/CommandCenterView'));
const MissionsView = lazy(() => import('../views/MissionsView'));
// ...
```

### 2. Query Caching Strategy
```typescript
const queryConfig = {
  missions: {
    staleTime: 5000,      // 5 seconds
    cacheTime: 10 * 60 * 1000,  // 10 minutes
    refetchInterval: 3000,  // 3 seconds
  },
  agents: {
    staleTime: 2000,
    cacheTime: 5 * 60 * 1000,
    refetchInterval: 2000,
  },
  health: {
    staleTime: 5000,
    refetchInterval: 5000,
  },
};
```

### 3. Virtual Scrolling (for large activity feeds)
```bash
npm install react-window react-virtual
```

---

## Testing Strategy

### Unit Tests
```bash
npm install -D vitest @testing-library/react @testing-library/user-event
```

### E2E Tests (Cypress/Playwright)
```bash
npm install -D cypress @testing-library/cypress
# or
npm install -D @playwright/test
```

---

## Deployment Targets

### Docker
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist"]
```

### Vercel / Netlify
- No additional configuration needed
- Automatic deployments from git
- Environment variables via dashboard

### Self-Hosted
- Build: `npm run build`
- Output: `dist/` directory
- Serve with nginx/Apache
- Enable gzip compression
- Set cache headers appropriately
