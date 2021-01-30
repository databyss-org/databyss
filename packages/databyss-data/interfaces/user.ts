export enum Role {
  Admin = 'ADMIN',
  ReadOnly = 'READ_ONLY',
  Editor = 'EDITOR',
  GroupAdmin = 'GROUP_ADMIN',
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
