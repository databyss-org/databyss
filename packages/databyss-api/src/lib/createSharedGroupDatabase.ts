import { Groups } from '@databyss-org/data/couchdb'
import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import {
  CredentialResponse,
  createGroupId,
  createGroupDatabase,
  setSecurity,
} from './createUserDatabase'

export const verifyDatabaseCredentials = async ({
  dbKey,
  cloudantDb,
}: {
  dbKey: string
  cloudantDb: any
}) =>
  new Promise((resolve, reject) => {
    cloudantDb.get_security((err, result) => {
      if (err) {
        reject(err)
      }

      if (result?.cloudant) {
        const creds = result.cloudant[dbKey]
        if (creds?.includes('_writer')) {
          // see if user has _writer permissions
          resolve(true)
        }
      }
      resolve(false)
    })
  })

export const verifyUserOwnsDatabase = async ({
  userId,
  dbName,
}: {
  userId: string
  dbName: string
}) => {
  // look up db in our groups DB
  const groupResponse = await Groups.find({ selector: { _id: dbName } })

  if (groupResponse.docs.length) {
    const _group = groupResponse.docs[0]
    // verify the user owns this group
    if (_group.belongsToUserId === userId) {
      return true
    }
  }
  return false
}

export const getDB = async ({ dbName }: { dbName: string }) => {
  try {
    const _db = await cloudant.db.use(dbName)
    return _db
  } catch (err) {
    return false
  }
}

export const deleteSharedGroupDatabase = async ({ groupId }) => {
  try {
    await cloudant.db.destroy(groupId)
  } catch (err) {
    console.error(err)
  }
}

const createSharedGroupDatabase = async ({
  groupId,
  userId,
}: {
  groupId: string
  userId: string
}): Promise<CredentialResponse> => {
  await createGroupId({ groupId, userId })
  await createGroupDatabase(groupId)
  const credentials = await setSecurity({ groupId, isPublic: true })
  return credentials
}

export const removeIdsFromSharedDb = async ({
  ids,
  groupId,
}: {
  ids: string[]
  groupId: string
}) => {
  const _db = await getDB({ dbName: `g_${groupId}` })
  if (_db) {
    // get all documents with current revisions
    const docList = await _db.fetch({ keys: ids })
    // compose list to bulk upsert
    const _upsertData = docList.rows.map((r) => ({
      _rev: r.doc._rev,
      _id: r.doc._id,
      doctype: r.doc.doctype,
      _deleted: true,
    }))
    // bulk upsert
    await _db.bulk({ docs: _upsertData })
  }
}

export default createSharedGroupDatabase
