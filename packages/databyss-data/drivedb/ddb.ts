import { getDefaultGroup } from '@databyss-org/services/session/clientStorage'
import { openDB, IDBPDatabase, DBSchema } from 'idb'

interface DriveDBSchema extends DBSchema {
  files: {
    key: string
    value: {
      id: string
      data: ArrayBuffer
      filename: string
      contentType?: string // TODO: replace with MIME
      syncProgress: number // 0 to 1
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

initDefaultGroupDb()

async function initDefaultGroupDb() {
  const defaultGroup = getDefaultGroup()
  if (!defaultGroup) {
    throw new Error('[DDB] no default groupid found')
  }
  ddbRef.name = `ddb_${defaultGroup}`
  ddbRef.current = await getDriveDb(ddbRef.name)
}

export function getDriveDb(name: string) {
  return openDB<DriveDBSchema>(name, 1, {
    upgrade(db) {
      db.createObjectStore('files', {
        keyPath: 'id',
      })
    },
  })
}
