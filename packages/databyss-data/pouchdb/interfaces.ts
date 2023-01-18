import { PageHeader } from '@databyss-org/services/interfaces/Page'
import { BlockReference } from '@databyss-org/services/interfaces/Block'
import {
  Block,
  BlockRelation,
  DocumentDict,
  Page,
} from '@databyss-org/services/interfaces'
import { Role } from '../interfaces/sysUser'

export interface DocumentCacheDict {
  pages: DocumentDict<Page> | null | undefined
  blocks: DocumentDict<Block> | null | undefined
  blockRelations?: DocumentDict<BlockRelation> | null
}

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
  Dialog = 'DIALOG',
  Sticky = 'STICKY',
  ForceUpdate = 'FORCE_UPDATE',
  RunMigration = 'RUN_MIGRATION',
}

export interface Notification {
  id: string
  messageHtml: string
  type: NotificationType
  createdAt: number
  targetVersion?: string
  href?: string
  viewedAt?: number
  migrationId?: string
}

export interface UserPreference {
  _id: string
  userId: string
  email?: string
  belongsToGroup: string
  groups?: Array<UserGroup>
  createdAt: number
  notifications?: Notification[]
  preferredCitationStyle?: string
}
