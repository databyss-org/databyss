import { NetworkUnavailableError } from '@databyss-org/services/interfaces'
import { ConcurrentUpload } from '@databyss-org/services/lib/ConcurrentUpload'
import { ddbRef, DriveDBRecordSchema } from './ddb'
import { getFilesPendingSync } from './files'

export const activeUploads: { [uploadId: string]: ConcurrentUpload } = {}

interface SyncQueueRef {
  current: DriveDBRecordSchema[]
}

export interface SyncStatus {
  isBusy: boolean
  writesPending: number
}

const INTERVAL_TIME = 1000
const MAX_RETRIES = 3

let isProcessing = false
export const syncQueue: SyncQueueRef = {
  current: [],
}

export async function init() {
  // seed the queue with unsynched files from IDB
  const files = await getFilesPendingSync()
  console.log('[DDB] sync init', files)
  syncQueue.current = files
  // start the sync interval
  setInterval(sync, INTERVAL_TIME)
}

async function sync() {
  if (isProcessing) {
    // already processing, bail now
    return
  }

  const rec = syncQueue.current.shift()
  if (!rec) {
    // db is not pending any writes
    setBusy(false)
    return
  }

  console.log('[DDB] sync file', rec)
  setBusy(true, syncQueue.current.length + 1)
  console.log('[DDB] status', JSON.stringify(getBusy()))
  // upload the next file in the queue
  isProcessing = true

  try {
    await upload(rec)
  } catch (err) {
    if (rec.retryCount < MAX_RETRIES) {
      rec.retryCount += 1
      syncQueue.current.unshift(rec)
    }
    console.log('[DDB] sync failed', err)
  }
  rec.syncProgress = 1
  rec.retryCount = 0
  await ddbRef.current?.put('files', rec)
  isProcessing = false
  setBusy(false)
}

let _isBusy = false
let _writesPending = 0

export function setBusy(isBusy: boolean, writesPending?: number) {
  _writesPending = writesPending ?? syncQueue.current.length
  // only set busy to false if no writes are left in queue
  _isBusy = !!(_writesPending || writesPending) || isBusy
}

export function getBusy(): SyncStatus {
  return {
    isBusy: _isBusy,
    writesPending: _writesPending,
  }
}

async function upload(fileRec: DriveDBRecordSchema) {
  const file = new File([fileRec.data], fileRec.filename)
  const upload = new ConcurrentUpload({
    file,
    fileId: fileRec.id,
  })
  await upload.initUpload()
  if (!upload.uploadId) {
    throw new NetworkUnavailableError('[uploadFile] initUpload failed')
  }
  activeUploads[upload.uploadId] = upload
  await upload.upload()
  delete activeUploads[upload.uploadId!]
}
