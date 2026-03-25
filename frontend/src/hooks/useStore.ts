import { useCallback } from 'react'
import { useStore as useZustandStore } from '../store'

// Re-export Zustand store for convenience
export const useStore = useZustandStore
