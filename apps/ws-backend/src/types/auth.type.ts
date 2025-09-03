import { WebSocket } from 'ws';

export interface AuthedSocket extends WebSocket {
  user?: {
    id: string 
    roomId: string
    username: string 
    createdAt: Date 
    updatedAt: Date
    lastLoginAt: Date | null
  } 
}