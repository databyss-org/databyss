// import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import {
  CredentialResponse,
  createGroupId,
  createGroupDatabase,
  setSecurity,
} from './createUserDatabase'

const createSharedGroupDatabase = async (
  groupId: string
  // userId: string
): Promise<CredentialResponse> => {
  await createGroupId(groupId)
  await createGroupDatabase(groupId)
  const credentials = await setSecurity({ groupId, isPublic: true })
  return credentials
}

export default createSharedGroupDatabase
