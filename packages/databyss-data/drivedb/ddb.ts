import { getAccountFromLocation } from '@databyss-org/services/session/utils'
import { openDB, IDBPDatabase, DBSchema } from 'idb'
import { init as initSync } from './sync'

export interface DriveDBRecordSchema {
  id: string
  data: ArrayBuffer
  filename: string
  contentType?: string // TODO: replace with MIME
  syncProgress: number // 0 to 1
  retryCount: number
}

interface DriveDBSchema extends DBSchema {
  files: {
    key: string
    value: DriveDBRecordSchema
    indexes: { 'by-sync-progress': number }
  }
}

export interface DdbRef {
  name: string | null
  current: IDBPDatabase<DriveDBSchema> | null
}

export const ddbRef: DdbRef = {
  name: null,
  current: null,
}

const _groupId = getAccountFromLocation()
if (_groupId) {
  initDriveDb(_groupId as string)
}

export async function initDriveDb(groupId: string) {
  if (ddbRef.current) {
    return
  }
  ddbRef.name = `ddb_${groupId}`
  ddbRef.current = await getDriveDb(ddbRef.name)
  await initSync()
}

export function getDriveDb(name: string) {
  return openDB<DriveDBSchema>(name, 1, {
    upgrade(db) {
      const store = db.createObjectStore('files', {
        keyPath: 'id',
      })
      store.createIndex('by-sync-progress', 'syncProgress')
    },
  })
}
