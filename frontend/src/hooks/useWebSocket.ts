import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface UseWebSocketOptions {
  url?: string
  autoConnect?: boolean
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { url = 'http://localhost:3000', autoConnect = true } = options
  const socketRef = useRef<Socket | null>(null)
  const listenersRef = useRef<Map<string, Function[]>>(new Map())

  useEffect(() => {
    if (!autoConnect) return

    socketRef.current = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [url, autoConnect])

  const emit = useCallback((event: string, data: any) => {
    socketRef.current?.emit(event, data)
  }, [])

  const on = useCallback((event: string, callback: Function) => {
    if (!socketRef.current) return

    socketRef.current.on(event, callback)

    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, [])
    }
    listenersRef.current.get(event)?.push(callback)
  }, [])

  const off = useCallback((event: string, callback?: Function) => {
    if (!socketRef.current) return

    if (callback) {
      socketRef.current.off(event, callback as any)
    } else {
      socketRef.current.off(event)
      listenersRef.current.delete(event)
    }
  }, [])

  return {
    socket: socketRef.current,
    emit,
    on,
    off,
    connected: socketRef.current?.connected ?? false,
  }
}
