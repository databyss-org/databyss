import { PageHeader } from '@databyss-org/services/interfaces/Page'
import { BlockReference } from '@databyss-org/services/interfaces/Block'

export type { JsonSchema } from './jsonschema'
// export type { CouchDB } from './database'
export type { DesignDoc } from './designdoc'

export interface PageDoc extends PageHeader {
  blocks: BlockReference[]
  selection: string
}

export interface Login {
  _id: string
  email: string
  code: string
  createdAt: number
}

export enum DocumentType {
  Page = 'PAGE',
  Block = 'BLOCK',
  Selection = 'SELECTION',
  UserPreferences = 'USER_PREFERENCES',
}

export enum Role {
  Admin = 'ADMIN',
  ReadOnly = 'READ_ONLY',
  Editor = 'EDITOR',
  GroupAdmin = 'GROUP_ADMIN',
}

export interface GroupSession {
  userId: string
  dbKey: string
  lastLoginAt: number
  clientInfo?: string
  role: Role
}

export interface UserGroup {
  role: Role
  groupId: string
}

export interface User {
  _id: string
  email: string
  name?: string
  googleId?: string
  defaultGroupId?: string
}

export interface Group {
  _id: string
  name: string
  sessions: GroupSession[]
  defaultPageId: string
}

export interface UserSession {
  token?: string
  userId: string
  email?: string
  googleId?: string
  defaultGroupId: string
  groups: Array<UserGroup>
}

export interface UserPreference {
  _id: string
  userId: string
  email?: string
  defaultGroupId?: string
  groups?: Array<UserGroup>
  createdAt: number
}

// EXTENDS documentscope to include upsert
declare module 'nano' {
  interface DocumentScope<D> {
    upsert: (docname: string, callback: (oldDocument: D) => D) => D
  }
}
