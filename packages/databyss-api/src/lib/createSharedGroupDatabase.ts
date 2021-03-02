// import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import {
  createGroupId,
  createGroupDatabase,
  setSecurity,
} from './createUserDatabase'

const createSharedGroupDatabase = async (
  groupId: string
  // userId: string
) => {
  await createGroupId(groupId)
  await createGroupDatabase(groupId)
  await setSecurity({ groupId, isPublic: true })
}

export default createSharedGroupDatabase
