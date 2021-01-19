import { Role } from './user'

export interface GroupSession {
  userId: string
  dbKey: string
  lastLoginAt: number
  clientInfo?: string
  role: Role
}

export interface Group {
  _id: string
  name: string
  sessions: GroupSession[]
  defaultPageId: string
}
