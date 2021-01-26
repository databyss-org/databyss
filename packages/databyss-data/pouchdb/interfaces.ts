import { PageHeader } from '@databyss-org/services/interfaces/Page'
import { BasicBlock } from '@databyss-org/services/interfaces/Block'
import { Role } from '../interfaces/user'

export interface PageDoc extends PageHeader {
  blocks: BasicBlock[]
  selection: string
}

export enum DocumentType {
  Page = 'PAGE',
  Block = 'BLOCK',
  Selection = 'SELECTION',
  BlockRelation = 'BLOCK_RELATION',
  UserPreferences = 'USER_PREFERENCES',
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

export interface UserPreference {
  _id: string
  $type: DocumentType
  userId: string
  email?: string
  defaultGroupId?: string
  groups?: Array<UserGroup>
  createdAt: number
}
