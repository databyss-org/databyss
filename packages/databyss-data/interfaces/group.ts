export interface GroupSession {
  userId: string
  dbKey: string
  lastLoginAt: number
  clientInfo?: string
}

export interface Group {
  _id: string
  name: string
  sessions: GroupSession[]
  defaultPageId: string
}
