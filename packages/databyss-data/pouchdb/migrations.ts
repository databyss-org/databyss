import { httpPost } from '@databyss-org/services/lib/requestApi'
import { getAccountFromLocation } from '@databyss-org/services/session/utils'
import PouchDB from 'pouchdb'

export async function runMigration(
  db: PouchDB.Database<any>,
  migrationId: string
) {
  switch (migrationId) {
    case '2.8.6_AUTH_DRIVE': {
      const groupId = getAccountFromLocation()
      await httpPost(`/auth/drive/${groupId}`, {})
      break
    }
    default:
      throw new Error(`[runMigration] bad migration id: ${migrationId}`)
  }
}
