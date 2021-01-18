import { Users, Groups } from '@databyss-org/data/couchdb'
import { User, Role } from '@databyss-org/data/interfaces'
import { updateDesignDoc } from '@databyss-org/data/couchdb/util'
import { uid } from '@databyss-org/data/lib/uid'
import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import { DesignDoc } from '../../../databyss-data/interfaces/designdoc'

interface CredentialResponse {
  dbKey: string
  dbPassword: string
  groupId: string
}

export const createGroupId = async () => {
  // TODO: fix this so its not 'any'
  const Groups: any = cloudant.db.use('groups')
  const group = await Groups.insert({
    name: 'untitled',
    sessions: [],
    // TODO: cloudant does not allow uppercase for db names,
    // will this affect collisions?
    _id: uid().toLowerCase(),
  })
  return group.id
}

const createGroupDatabase = async (id: string) => {
  // database are not allowed to start with a number
  try {
    await cloudant.db.get(`g_${id}`)
  } catch (err) {
    if (err.message !== 'Database does not exist.') {
      throw err
    }
    await cloudant.db.create(`g_${id}`)

    // add design docs to sever
    const _db = await cloudant.db.use<DesignDoc>(`g_${id}`)
    await updateDesignDoc({ db: _db })
    // await updateClientDesignDoc(_db)
  }
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

      // TODO: use group schema to create typescript interface
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

  return response
}

export const addCredentialsToUser = async (
  userId: string,
  credentials: CredentialResponse
): Promise<User> => {
  const _res = await Users.upsert(userId, (oldDoc: User) => {
    const _groups = oldDoc.groups || []

    _groups.push({ groupId: credentials.groupId, role: Role.GroupAdmin })

    const _defaultPageId = uid()

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

export const addCredientialsToSession = async ({
  groupId,
  userId,
  session,
}: {
  groupId: string
  userId: string
  // TODO: SESSION SHOULD BE AN OBJECT
  session: any
}) => {
  const credentials = await addCredentialsToGroupId({
    groupId,
    userId,
  })

  session.user.groups = [
    {
      ...credentials,
    },
  ]
  return session
}
