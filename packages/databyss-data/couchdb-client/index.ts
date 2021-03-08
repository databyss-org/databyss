import request from '@databyss-org/services/lib/request'
import { Base64 } from 'js-base64'
import { getPouchSecret } from '@databyss-org/services/session/clientStorage'

// export const couchDbRef = {
//   current: null,
// }

export const init = async (groupId?: string) => {
  // assume only one entry in pouch_secrets, so use first key as groupId
  // TODO: pass the groupId from session when we need multiple active logins
  //   or pull the groupId from the URL
  const _secrets = getPouchSecret()
  const _groupId = groupId || Object.keys(_secrets)[0]
  console.log('couchdb-client.init.groupId', _groupId)
  const { dbKey: _username, dbPassword: _password } = _secrets[_groupId]
  console.log('couchdb-client.init.user', _username)
  console.log('couchdb-client.init.pass', _password)
  const _dbName = `g_${_groupId}`
  const _doc = await request(
    `https://${process.env.CLOUDANT_HOST}/${_dbName}/user_preference`,
    {
      headers: {
        Authorization: `Basic ${Base64.btoa(`${_username}:${_password}`)}`,
      },
    }
  )

  // log user_preferences to test connection
  console.log('couchdb-client.init', _doc)
}
