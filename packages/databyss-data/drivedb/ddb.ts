import { getAccountFromLocation } from '@databyss-org/services/session/utils'
import { getDefaultGroup } from '@databyss-org/services/session/clientStorage'
import { openDB, IDBPDatabase, DBSchema } from 'idb'
import { init as initSync } from './sync'

export interface DriveDBShareInfo {
  groupId: string
  accessLevel: 'admin' | 'readwrite' | 'readonly'
  revokeAccess: boolean
}

export interface DriveDBRecordSchema {
  id: string
  data: ArrayBuffer
  filename: string
  contentType?: string // TODO: replace with MIME
  syncProgress: number // 0 to 1
  retryCount: number
  shareQueue: DriveDBShareInfo[]
  shareQueueDirty: number
  sharedWithGroups: string[]
}

interface DriveDBSchema extends DBSchema {
  files: {
    key: string
    value: DriveDBRecordSchema
    indexes: {
      'by-sync-progress': number
      'by-share-queue-dirty': number
    }
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

// try to load pouch_secrets from local storage to init db
const defaultGroup = getDefaultGroup()
const groupIdFromUrl = getAccountFromLocation()

// if you're logged-in but not on your own group's URL (you're on a public group url, eg),
//   skip initialization of pouchDb - it happens in initDb
if (
  defaultGroup &&
  (!groupIdFromUrl || groupIdFromUrl === defaultGroup || process.env.STORYBOOK)
) {
  connectDriveDb({ groupId: defaultGroup })
}

export async function connectDriveDb({ groupId }: { groupId: string }) {
  console.log('[DDB] connect', groupId)
  const dbName = `ddb_${groupId}`
  if (ddbRef.name === dbName) {
    return
  }
  ddbRef.name = dbName
  ddbRef.current = await getDriveDb(ddbRef.name)
}

export async function initDriveDb({ groupId }: { groupId: string }) {
  await connectDriveDb({ groupId })
  await initSync()
}

export function getDriveDb(name: string) {
  return openDB<DriveDBSchema>(name, 1, {
    upgrade(db) {
      const store = db.createObjectStore('files', {
        keyPath: 'id',
      })
      store.createIndex('by-sync-progress', 'syncProgress')
      store.createIndex('by-share-queue-dirty', 'sharedDirty')
    },
  })
}
