import { cloudant } from '@databyss-org/services/lib/cloudant'
import { Users } from '@databyss-org/data/serverdbs/index'

interface ICredentialResponse {
  dbKey: string
  dbPassword: string
  groupId: string
}

enum Role {
  Admin = 'ADMIN',
  Read = 'READ',
  Write = 'WRITE',
}

interface IUserCredentials extends ICredentialResponse {
  role: Role
}

interface IUser {
  _id: string
  email: string
  name: string
  googleId: string
  defaultGroupId: string
  groups: IUserCredentials[]
}

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

const setSecurity = (groupId: string): Promise<ICredentialResponse> =>
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

export const createUserDatabaseCredentials = async (): Promise<
  ICredentialResponse
> => {
  const _groupId = await createGroupId()

  // creates a database if not yet defined
  await createGroupDatabase(_groupId)

  const response = await setSecurity(_groupId)
  return response
}

export const addCredentialsToUser = async (
  userId: string,
  credentials: ICredentialResponse
): Promise<IUser> => {
  const _res = await Users.upsert(userId, (oldDoc: IUser) => {
    const _groups = oldDoc.groups || []
    _groups.push({ ...credentials, role: Role.Admin })
    return { ...oldDoc, groups: _groups, defaultGroupId: credentials.groupId }
  })

  return _res
}
