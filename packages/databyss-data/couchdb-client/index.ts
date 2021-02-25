import Slouch from 'couch-slouch'
import { getPouchSecret } from '@databyss-org/services/session/clientStorage'

let slouch

export const init = async (groupId) => {
  slouch = new Slouch(`https://${process.env.CLOUDANT_HOST}`)
  console.log('couchdb-client.init', slouch)

  // assume only one entry in pouch_secrets, so use first key as groupId
  // TODO: pass the groupId from session when we need multiple active logins
  //   or pull the groupId from the URL
  const _secrets = getPouchSecret()
  const _groupId = groupId || Object.keys(_secrets)[0]
  const { dbKey: _username, dbPassword: _password } = _secrets
  const _dbName = `g_${_groupId}`

  await slouch.user.logIn(_username, _password)

  // log user_preferences to test connection
  const doc = await slouch.doc.get(_dbName, 'user_preference')
  console.log('couchdb-client.init', doc)
}
