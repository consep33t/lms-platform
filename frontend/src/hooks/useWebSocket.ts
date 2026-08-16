import { useState, useEffect, useRef, useCallback } from 'react'

interface UseWebSocketOptions {
  url: string
  onMessage?: (event: MessageEvent) => void
  reconnectAttempts?: number
  reconnectInterval?: number
}

export function useWebSocket({
  url,
  onMessage,
  reconnectAttempts = 5,
  reconnectInterval = 3000
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectCountRef = useRef(0)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef = useRef(true)
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  const connect = useCallback(() => {
    if (!isMountedRef.current) return

    try {
      const ws = new WebSocket(url)

      ws.onopen = () => {
        if (!isMountedRef.current) return
        setIsConnected(true)
        reconnectCountRef.current = 0
      }

      ws.onclose = () => {
        if (!isMountedRef.current) return
        setIsConnected(false)
        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              reconnectCountRef.current += 1
              connect()
            }
          }, reconnectInterval)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error)
      }

      ws.onmessage = (event) => {
        if (isMountedRef.current && onMessageRef.current) {
          onMessageRef.current(event)
        }
      }

      wsRef.current = ws
    } catch (error) {
      console.error('WebSocket connection failed:', error)
    }
  }, [url, reconnectAttempts, reconnectInterval])

  useEffect(() => {
    isMountedRef.current = true
    connect()

    return () => {
      isMountedRef.current = false
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])

  const sendMessage = useCallback((data: string | ArrayBuffer | Blob | ArrayBufferView) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(data)
    }
  }, [])

  return { isConnected, sendMessage }
}
