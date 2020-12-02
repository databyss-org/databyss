import { cloudant } from '@databyss-org/services/lib/cloudant'

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

interface credentialResponse {
  dbKey: string
  dbPassword: string
  groupId: string
}

const setSecurity = (groupId: string): Promise<credentialResponse> =>
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
  credentialResponse
> => {
  const _groupId = await createGroupId()

  // creates a database if not yet defined
  await createGroupDatabase(_groupId)

  const response = await setSecurity(_groupId)
  return response
}
