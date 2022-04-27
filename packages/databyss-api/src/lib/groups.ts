import { cloudant } from '@databyss-org/data/couchdb'
import { SysUser } from '@databyss-org/data/interfaces'
import {
  addCredentialsToGroupId,
  CredentialResponse,
  setSecurity,
} from './createUserDatabase'

export async function getAllGroupsForUser(userId: string) {
  const res = await cloudant.models.Groups.find({
    selector: { belongsToUserId: userId },
  })
  return res.docs
}

export async function getAllCredentialsForUser(user: SysUser) {
  if (!user.defaultGroupId) {
    throw new Error('[getAllCredentialsForUser] user is missing defaultGroupId')
  }
  const _defaultCredentials = await addCredentialsToGroupId({
    groupId: user.defaultGroupId,
    userId: user._id,
  })
  const _managedCredentials: CredentialResponse[] = []
  const _managedGroups = await getAllGroupsForUser(user._id)
  for (const _group of _managedGroups) {
    if (!_group._id.startsWith('g_')) {
      continue
    }
    _managedCredentials.push(
      await setSecurity({
        groupId: _group._id,
      })
    )
  }

  return [_defaultCredentials, ..._managedCredentials]
}
