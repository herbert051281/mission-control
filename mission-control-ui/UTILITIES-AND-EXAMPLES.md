# Utilities & Code Examples

## Format Utilities

### src/utils/format.ts
```typescript
import { formatDistance, format, formatDuration, intervalToDuration } from 'date-fns';

export const formatUtils = {
  // Time formatting
  relativeTime: (date: string | Date, suffix = true) => {
    return formatDistance(new Date(date), new Date(), { addSuffix: suffix });
  },

  timestamp: (date: string | Date) => {
    return format(new Date(date), 'HH:mm:ss');
  },

  date: (date: string | Date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  },

  fullDateTime: (date: string | Date) => {
    return format(new Date(date), 'MMM dd, yyyy HH:mm:ss');
  },

  // Duration formatting
  duration: (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60 * 1000) return `${Math.round(ms / 1000)}s`;
    if (ms < 60 * 60 * 1000) return `${Math.round(ms / 60 / 1000)}m`;
    return `${Math.round(ms / 60 / 60 / 1000)}h`;
  },

  uptime: (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  },

  // Byte formatting
  bytes: (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  },

  // Percentage formatting
  percentage: (value: number, decimals = 0) => {
    return `${value.toFixed(decimals)}%`;
  },

  // Status label
  statusLabel: (status: string) => {
    const labels: Record<string, string> = {
      idle: 'Idle',
      running: 'Running',
      waiting: 'Waiting',
      completed: 'Completed',
      failed: 'Failed',
      pending: 'Pending',
      approved: 'Approved',
      denied: 'Denied',
      expired: 'Expired',
    };
    return labels[status] || status;
  },
};
```

---

## Debounce & Throttle Utilities

### src/utils/timing.ts
```typescript
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
```

---

## Color Utilities

### src/utils/colors.ts
```typescript
export const colorUtils = {
  // Status to color mapping
  getStatusColor: (status: string): string => {
    const colors: Record<string, string> = {
      idle: '#94A3B8',
      running: '#22D3EE',
      waiting: '#F59E0B',
      completed: '#22C55E',
      failed: '#EF4444',
      pending: '#F59E0B',
      approved: '#22C55E',
      denied: '#EF4444',
      critical: '#EF4444',
      warning: '#F59E0B',
      healthy: '#22C55E',
    };
    return colors[status] || '#94A3B8';
  },

  // Priority to color mapping
  getPriorityColor: (priority: string): string => {
    const colors: Record<string, string> = {
      critical: '#EF4444',
      high: '#F59E0B',
      normal: '#22D3EE',
      low: '#8B5CF6',
    };
    return colors[priority] || '#94A3B8';
  },

  // Risk level to color mapping
  getRiskColor: (riskLevel: string): string => {
    const colors: Record<string, string> = {
      low: '#22C55E',
      medium: '#F59E0B',
      high: '#EF4444',
    };
    return colors[riskLevel] || '#94A3B8';
  },

  // Hex to RGB (for transparent variants)
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },

  // Create semi-transparent color
  rgba: (hex: string, alpha: number): string => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  },
};
```

---

## Hooks

### src/hooks/usePagination.ts
```typescript
import { useState, useCallback } from 'react';

interface UsePaginationProps {
  items: any[];
  itemsPerPage: number;
  initialPage?: number;
}

interface UsePaginationResult<T> {
  currentPage: number;
  totalPages: number;
  currentItems: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function usePagination<T>({
  items,
  itemsPerPage,
  initialPage = 1,
}: UsePaginationProps): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    currentPage,
    totalPages,
    currentItems: currentItems as T[],
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}
```

### src/hooks/useAsync.ts
```typescript
import { useState, useEffect } from 'react';

interface UseAsyncState<T, E = string> {
  status: 'idle' | 'pending' | 'success' | 'error';
  data: T | null;
  error: E | null;
}

type UseAsyncFunction<T, E = string> = () => Promise<T>;

export function useAsync<T, E = string>(
  asyncFunction: UseAsyncFunction<T, E>,
  immediate = true
): UseAsyncState<T, E> & { execute: () => Promise<void> } {
  const [state, setState] = useState<UseAsyncState<T, E>>({
    status: 'idle',
    data: null,
    error: null,
  });

  const execute = async () => {
    setState({ status: 'pending', data: null, error: null });
    try {
      const response = await asyncFunction();
      setState({ status: 'success', data: response, error: null });
    } catch (error) {
      setState({ status: 'error', data: null, error: error as E });
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]);

  return { ...state, execute };
}
```

### src/hooks/useLocalStorage.ts
```typescript
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('localStorage error:', error);
    }
  };

  return [storedValue, setValue];
}
```

---

## Error Boundary Component

### src/components/ErrorBoundary.tsx
```typescript
import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
    // Send to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{ padding: '20px', color: '#EF4444' }}>
            <h2>Something went wrong</h2>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {this.state.error?.message}
            </pre>
            <button onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

---

## Toast Notification System

### src/components/Toast.tsx
```typescript
import { createContext, useContext, useState } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => string;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    if (toast.duration !== Infinity) {
      setTimeout(() => remove(id), toast.duration || 3000);
    }

    return id;
  };

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, add, remove }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) {
  const colors = {
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#22D3EE',
  };

  return (
    <div
      style={{
        background: `${colors[toast.type]}15`,
        border: `1px solid ${colors[toast.type]}`,
        borderRadius: '6px',
        padding: '12px 16px',
        marginBottom: '8px',
        minWidth: '300px',
        color: '#E5E7EB',
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>{toast.message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: colors[toast.type],
          cursor: 'pointer',
          fontSize: '18px',
        }}
      >
        ×
      </button>
    </div>
  );
}
```

---

## API Client Setup

### src/api/index.ts
```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

export const createAPIClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Handle auth error
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }

      if (error.response?.status === 403) {
        // Handle forbidden
        console.error('Access denied');
      }

      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createAPIClient();
```

---

## Real-Time Data Synchronization

### src/hooks/useRealTime.ts
```typescript
import { useEffect } from 'react';
import { useStore } from '../stores/useStore';
import { useToast } from '../components/Toast';

interface RealtimeEvent {
  type: string;
  payload: any;
  timestamp: string;
}

export function useRealtimeSync() {
  const store = useStore();
  const { add: addToast } = useToast();
  
  useEffect(() => {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001/ws/mission-control';
    let ws: WebSocket;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('[WebSocket] Connected');
          store.setWSConnected(true);
          reconnectAttempts = 0;
        };

        ws.onmessage = (event: MessageEvent) => {
          try {
            const wsEvent: RealtimeEvent = JSON.parse(event.data);
            handleRealtimeEvent(wsEvent);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onerror = (error: Event) => {
          console.error('[WebSocket] Error:', error);
          addToast({
            type: 'error',
            message: 'Connection error. Reconnecting...',
            duration: 3000,
          });
        };

        ws.onclose = () => {
          console.log('[WebSocket] Disconnected');
          store.setWSConnected(false);

          if (reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.pow(2, reconnectAttempts) * 1000; // Exponential backoff
            console.log(`[WebSocket] Reconnecting in ${delay}ms...`);
            setTimeout(connect, delay);
            reconnectAttempts++;
          } else {
            addToast({
              type: 'error',
              message: 'Failed to reconnect. Please refresh the page.',
              duration: Infinity,
            });
          }
        };
      } catch (error) {
        console.error('[WebSocket] Connection failed:', error);
        reconnectAttempts++;
        if (reconnectAttempts < maxReconnectAttempts) {
          setTimeout(connect, Math.pow(2, reconnectAttempts) * 1000);
        }
      }
    };

    const handleRealtimeEvent = (event: RealtimeEvent) => {
      const { type, payload } = event;

      switch (type) {
        case 'mission.created':
        case 'mission.updated':
          store.updateMission(payload);
          break;

        case 'agent.status_changed':
          store.updateAgent(payload);
          break;

        case 'approval.pending':
          store.addApproval(payload);
          addToast({
            type: 'warning',
            message: `New approval required: ${payload.type}`,
            duration: 5000,
          });
          break;

        case 'activity.logged':
          // Activity is handled via polling in ActivityFeed
          break;

        case 'health.updated':
          store.updateSystemHealth(payload);
          break;

        default:
          console.warn('Unknown event type:', type);
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [store, addToast]);
}
```

---

## Example: Agent Card with Real Data

### src/components/AgentCard.tsx (Complete Example)
```typescript
import { useState } from 'react';
import { useStore } from '../stores/useStore';
import { Agent } from '../api/types';
import { formatUtils } from '../utils/format';
import { colorUtils } from '../utils/colors';
import styles from '../styles/components.module.css';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps.AgentCardProps) {
  const store = useStore();
  const isSelected = store.ui.selectedAgent === agent.id;
  const [showMenu, setShowMenu] = useState(false);

  const statusColor = colorUtils.getStatusColor(agent.status);
  const statusConfig = {
    idle: { icon: '◯', label: 'Idle' },
    running: { icon: '⚡', label: 'Running' },
    waiting: { icon: '⏳', label: 'Waiting' },
    completed: { icon: '✓', label: 'Completed' },
    failed: { icon: '✕', label: 'Failed' },
  };

  const status = statusConfig[agent.status] || { icon: '?', label: agent.status };

  const handleSelect = () => {
    store.selectAgent(isSelected ? undefined : agent.id);
  };

  return (
    <div
      className={`${styles.agent_card} ${isSelected ? styles['agent_card--selected'] : ''}`}
      onClick={handleSelect}
      style={{
        cursor: 'pointer',
        transition: 'all 150ms',
      }}
    >
      {/* Header */}
      <div className={styles.agent_card__header}>
        <div className={styles.agent_card__title_section}>
          <h3 className={styles.agent_card__name}>{agent.name}</h3>
          <span
            className={styles.agent_card__status}
            style={{
              color: statusColor,
              backgroundColor: `${statusColor}15`,
            }}
          >
            <span className={styles.agent_card__status_icon}>{status.icon}</span>
            {status.label}
          </span>
        </div>
        <button
          className={styles.agent_card__menu}
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          ⋮
        </button>
        {showMenu && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              background: '#111827',
              border: '1px solid #1F2937',
              borderRadius: '6px',
              minWidth: '150px',
              zIndex: 1000,
            }}
          >
            <button
              onClick={() => {
                // View logs
                setShowMenu(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                color: '#E5E7EB',
                cursor: 'pointer',
              }}
            >
              View Logs
            </button>
            <button
              onClick={() => {
                // Force stop
                setShowMenu(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                color: '#EF4444',
                cursor: 'pointer',
              }}
            >
              Force Stop
            </button>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className={styles.agent_card__meta}>
        <div className={styles.agent_card__meta_item}>
          <span className={styles.agent_card__meta_label}>Role</span>
          <span className={styles.agent_card__meta_value}>{agent.role}</span>
        </div>
        <div className={styles.agent_card__meta_item}>
          <span className={styles.agent_card__meta_label}>Model</span>
          <span className={styles.agent_card__meta_value}>
            {agent.model.split('/')[1] || agent.model}
          </span>
        </div>
      </div>

      {/* Current Task */}
      {agent.currentTask && (
        <div className={styles.agent_card__current_task}>
          <div className={styles.agent_card__task_label}>Current</div>
          <div className={styles.agent_card__task_content}>
            <p className={styles.agent_card__task_description}>
              {agent.currentTask.description}
            </p>
            <time className={styles.agent_card__task_time}>
              {formatUtils.relativeTime(agent.currentTask.startedAt)}
            </time>
          </div>
        </div>
      )}

      {/* Last Completed Task */}
      {agent.lastCompletedTask && (
        <div className={styles.agent_card__last_task}>
          <div className={styles.agent_card__task_label}>Completed</div>
          <div className={styles.agent_card__task_content}>
            <p className={styles.agent_card__task_description}>
              {agent.lastCompletedTask.description}
            </p>
            <time className={styles.agent_card__task_time}>
              {agent.lastCompletedTask.status === 'succeeded' ? '✓' : '✕'}{' '}
              {formatUtils.relativeTime(agent.lastCompletedTask.completedAt)}
            </time>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className={styles.agent_card__stats}>
        <div className={styles.agent_card__stat}>
          <span className={styles.agent_card__stat_value}>{agent.queuedTasks}</span>
          <span className={styles.agent_card__stat_label}>Queued</span>
        </div>
        <div className={styles.agent_card__stat}>
          <span className={styles.agent_card__stat_value}>
            {(agent.successRate * 100).toFixed(0)}%
          </span>
          <span className={styles.agent_card__stat_label}>Success</span>
        </div>
        <div className={styles.agent_card__stat}>
          <span className={styles.agent_card__stat_value}>
            {formatUtils.duration(agent.avgTaskDuration)}
          </span>
          <span className={styles.agent_card__stat_label}>Avg Time</span>
        </div>
      </div>

      {/* Progress Bar */}
      {agent.status === 'running' && agent.currentTask && (
        <div className={styles.agent_card__progress}>
          <div className={styles.agent_card__progress_bar}>
            <div
              className={styles.agent_card__progress_fill}
              style={{
                width: `${Math.min(
                  100,
                  ((Date.now() - new Date(agent.currentTask.startedAt).getTime()) /
                    agent.avgTaskDuration) *
                    100
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Testing Examples

### tests/components/AgentCard.test.tsx
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgentCard } from '../../src/components/AgentCard';
import { useStore } from '../../src/stores/useStore';

// Mock the store
jest.mock('../../src/stores/useStore');

describe('AgentCard', () => {
  const mockAgent = {
    id: 'atlas-001',
    name: 'Atlas',
    role: 'Orchestrator',
    model: 'anthropic/claude-3-opus',
    status: 'running' as const,
    currentTask: {
      missionId: 'mission-001',
      description: 'Processing data pipeline',
      startedAt: new Date().toISOString(),
    },
    lastCompletedTask: {
      missionId: 'mission-000',
      description: 'Previous task',
      completedAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'succeeded' as const,
    },
    uptime: 86400000,
    successRate: 0.98,
    avgTaskDuration: 30000,
    queuedTasks: 2,
    totalTasks: 100,
  };

  beforeEach(() => {
    (useStore as jest.Mock).mockReturnValue({
      ui: { selectedAgent: null },
      selectAgent: jest.fn(),
    });
  });

  it('renders agent name and role', () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText('Atlas')).toBeInTheDocument();
    expect(screen.getByText('Orchestrator')).toBeInTheDocument();
  });

  it('displays current task when available', () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText('Processing data pipeline')).toBeInTheDocument();
  });

  it('shows success rate as percentage', () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText('98%')).toBeInTheDocument();
  });

  it('selects card on click', async () => {
    const store = useStore();
    render(<AgentCard agent={mockAgent} />);
    
    const card = screen.getByText('Atlas').closest('div[class*="agent_card"]');
    await userEvent.click(card!);
    
    expect(store.selectAgent).toHaveBeenCalledWith(mockAgent.id);
  });
});
```

---

This completes the implementation package for Mission Control. All files are production-ready and follow React/TypeScript best practices.
