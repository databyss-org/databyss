import { PageHeader } from '@databyss-org/services/interfaces/Page'
import { BlockReference } from '@databyss-org/services/interfaces/Block'
import { Role } from '../interfaces/user'

export interface PageDoc extends PageHeader {
  blocks: BlockReference[]
  selection: string
}

export enum DocumentType {
  Page = 'PAGE',
  Block = 'BLOCK',
  Selection = 'SELECTION',
  BlockRelation = 'BLOCK_RELATION',
  UserPreferences = 'USER_PREFERENCES',
  Group = 'GROUP',
}

export interface UserGroup {
  groupId: string
  defaultPageId: string
  role: Role
}

export interface UserSession {
  token?: string
  userId: string
  email?: string
  googleId?: string
  defaultGroupId: string
  groups: Array<UserGroup>
}

export enum NotificationType {
  Dialog = 'DIALIOG',
}

export interface Notification {
  id: string
  messageHtml: string
  type: NotificationType
  href?: string
  createdAt: number
  viewedAt: number
}

export interface UserPreference {
  _id: string
  userId: string
  email?: string
  belongsToGroup: string
  groups?: Array<UserGroup>
  createdAt: number
  notifications: Notification[]
}
