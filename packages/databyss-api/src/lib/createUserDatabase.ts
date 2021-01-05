import { cloudant } from '@databyss-org/services/lib/cloudant'
import ObjectId from 'bson-objectid'
import { Users, Groups } from '@databyss-org/data/serverdbs/index'
import { User, Role } from '@databyss-org/data/interfaces'
import { updateClientDesignDoc } from './couchdb'
import { DesignDoc } from '../../../databyss-data/interfaces/designdoc'

interface CredentialResponse {
  dbKey: string
  dbPassword: string
  groupId: string
}

// TODO: CREATE OUR OWN IDS

export const createGroupId = async () => {
  // TODO: fix this so its not 'any'
  const Groups: any = cloudant.db.use('groups')
  const group = await Groups.insert({ name: 'untitled' })
  return group.id
}

const createGroupDatabase = async (id: string) => {
  // database are not allowed to start with a number
  try {
    await cloudant.db.get(`g_${id}`)
  } catch (err) {
    await cloudant.db.create(`g_${id}`)
  }

  // await cloudant.db.get(`g_${id}`)

  // _db = await cloudant.db.use<DesignDoc>(`g_${id}`)
  // console.log('DATABASE CREATED')
  // await updateClientDesignDoc(_db)
  // setTimeout(async () => {
  //   console.log('TESTING DOC')
  //   await _db.upsert('test', () => ({
  //     _id: 'test',
  //     old: true,
  //   }))
  //   console.log('AFTER TESTING')
  //   await _db.upsert('test', () => ({
  //     _id: 'test',
  //     old: false,
  //   }))
  //   console.log('AFTER update')
  //   await Groups.upsert('test', () => ({
  //     id: 'test',
  //     dummy: true,
  //   }))
  //   await _db.insert({
  //     _id: 'newTest',
  //     name: `test`,
  //   })

  //   console.log('AFTER INSERT')
  // }, 10000)
}

const setSecurity = (groupId: string): Promise<CredentialResponse> =>
  new Promise((resolve, reject) => {
    const _credentials = {
      dbKey: '',
      dbPassword: '',
      groupId: '',
    }
    cloudant.generate_api_key(async (err, api) => {
      if (err) {
        reject(err)
      }

      const security: { [key: string]: string[] } = {}
      // define permissions
      security[api.key] = ['_reader', '_writer', '_replicator']

      // TODO: fix this so its not 'any'
      const groupDb: any = cloudant.db.use(`g_${groupId}`)

      await groupDb.set_security(security, (err: any) => {
        if (err) {
          reject(err)
        }
        _credentials.dbKey = api.key
        _credentials.dbPassword = api.password
        _credentials.groupId = groupId
        resolve(_credentials)
      })
    })
  })

const addSessionToGroup = async (
  userId: string,
  credentials: CredentialResponse
) => {
  await Groups.upsert(credentials.groupId, (oldDoc: any) => {
    const _sessions = oldDoc.sessions || []
    _sessions.push({
      userId,
      clientInfo: 'get client info',
      dbKey: credentials.dbKey,
      lastLoginAt: Date.now(),
    })
    return { ...oldDoc, sessions: _sessions }
  })
}

/*
generates credentials for given groupID with given user
*/

export const addCredentialsToGroupId = async ({
  groupId,
  userId,
}: {
  groupId: string
  userId: string
}) => {
  const response = await setSecurity(groupId)
  // add the user session to groups
  await addSessionToGroup(userId, response)

  return response
}

export const createUserDatabaseCredentials = async (
  user: User
): Promise<CredentialResponse> => {
  const _groupId = await createGroupId()

  // creates a database if not yet defined
  await createGroupDatabase(_groupId)

  const response = await addCredentialsToGroupId({
    groupId: _groupId,
    userId: user._id,
  })
  // const response = await setSecurity(_groupId)

  // // add the user session to groups
  // await addSessionToGroup(user._id, response)

  return response
}

export const addCredentialsToUser = async (
  userId: string,
  credentials: CredentialResponse
): Promise<User> => {
  const _res = await Users.upsert(userId, (oldDoc: User) => {
    const _groups = oldDoc.groups || []

    _groups.push({ groupId: credentials.groupId, role: Role.GroupAdmin })

    const _defaultPageId = new ObjectId().toHexString()

    // check if group has default page id, if not, create id
    Groups.upsert(credentials.groupId, (oldDoc) =>
      oldDoc.defaultPageId
        ? oldDoc
        : { ...oldDoc, defaultPageId: _defaultPageId }
    )
    return {
      ...oldDoc,
      groups: _groups,
      defaultGroupId: credentials.groupId,
      defaultPageId: _defaultPageId,
    }
  })
  // TODO: determine where the default page id comes from
  return _res
}
