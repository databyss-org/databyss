import { Role } from './sysUser'

export interface GroupSession {
  userId: string
  dbKey: string
  lastLoginAt: number
  clientInfo?: string
  role: Role
}

export interface SysGroup {
  _id: string
  name: string
  sessions: GroupSession[]
  defaultPageId?: string
  belongsToUserId: string
}
