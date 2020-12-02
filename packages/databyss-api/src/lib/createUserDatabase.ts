import { cloudant } from '@databyss-org/services/lib/cloudant'

export const createGroupId = async () => {
  const Groups = cloudant.db.use('groups')
  const group = await Groups.insert({ name: 'untitled' })
  return group.id
}

const createGroupDatabase = async (id: string) => {
  try {
    await cloudant.db.get(`g_${id}`)
  } catch (err) {
    await cloudant.db.create(`g_${id}`)
  }
}

export const createUserDatabaseCredentials = async (
  groupId: string | null
): { dbKey: string; dbPassword: string; groupId: string } => {
  let _groupId: string = groupId

  if (_groupId) {
    const _group = await cloudant.db.get(_groupId)
    console.log(_group)
  } else {
    _groupId = await createGroupId()
  }

  // creates a database if not yet defined
  await createGroupDatabase(_groupId)

  const response = await setSecurity(_groupId)
  return response
}

const setSecurity = (groupId: string) =>
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

      console.log('API key: %s', api.key)
      console.log('Password for this key: %s', api.password)

      const security: { [key: string]: string[] } = {}
      // define permissions
      security[api.key] = ['_reader', '_writer']
      const groupDb = cloudant.db.use(`g_${groupId}`)

      await groupDb.set_security(security, (err, result) => {
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
