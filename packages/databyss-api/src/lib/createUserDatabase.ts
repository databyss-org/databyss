import { cloudant } from '@databyss-org/services/lib/cloudant'
import { Users, Groups } from '@databyss-org/data/serverdbs/index'
import { User, Role } from '@databyss-org/data/interfaces'

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
      security[api.key] = ['_reader', '_writer']

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

export const createUserDatabaseCredentials = async (
  user: User
): Promise<CredentialResponse> => {
  const _groupId = await createGroupId()

  // creates a database if not yet defined
  await createGroupDatabase(_groupId)

  const response = await setSecurity(_groupId)

  // add the user session to groups
  await addSessionToGroup(user._id, response)

  return response
}

export const addCredentialsToUser = async (
  userId: string,
  credentials: CredentialResponse
): Promise<User> => {
  const _res = await Users.upsert(userId, (oldDoc: User) => {
    // TODO: do not upload the password
    const _groups = oldDoc.groups || []
    _groups.push({ groupId: credentials.groupId, role: Role.GroupAdmin })
    return { ...oldDoc, groups: _groups, defaultGroupId: credentials.groupId }
  })

  return _res
}
