import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const socket: Socket = io(config.public.WS_URL, {
    transports: ['websocket'],
    autoConnect: false,
    withCredentials: false,
  })

  socket.on('connect', () => {
    console.log('🟢 WS connected:', socket.id)
  })

  socket.on('disconnect', () => {
    console.log('🔴 WS disconnected')
  })

  return {
    provide: {
      socket,
    },
  }
})
 