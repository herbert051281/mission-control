import { useEffect, useState, useCallback } from 'react'

interface UseAsyncState<T> {
  data: T | null
  error: Error | null
  loading: boolean
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    loading: immediate,
  })

  const execute = useCallback(async () => {
    setState({ data: null, error: null, loading: true })
    try {
      const response = await asyncFunction()
      setState({ data: response, error: null, loading: false })
    } catch (error) {
      setState({ data: null, error: error as Error, loading: false })
    }
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { ...state, execute }
}
