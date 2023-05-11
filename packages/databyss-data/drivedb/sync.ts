import { NetworkUnavailableError } from '@databyss-org/services/interfaces'
import { ConcurrentUpload } from '@databyss-org/services/lib/ConcurrentUpload'
import { httpPost } from '@databyss-org/services/lib/requestDrive'
import { ddbRef, DriveDBRecordSchema } from './ddb'
import { getFilesPendingSync } from './files'

export const activeUploads: { [uploadId: string]: ConcurrentUpload } = {}

export interface SyncStatus {
  isBusy: boolean
  writesPending: number
}

const INTERVAL_TIME = 3000
let _intervalTime = INTERVAL_TIME
const _backoffMultiplier = 1.5
let _interval: number | null = null

let isProcessing = false

export async function init() {
  // seed the queue with unsynched files from IDB
  console.log('[DDB] sync init')
  // start the sync interval
  resetInterval()
}

function resetInterval(time: number = INTERVAL_TIME) {
  if (_interval) {
    window.clearInterval(_interval)
  }
  _intervalTime = time
  _interval = window.setInterval(sync, _intervalTime)
}

export function pauseSync() {
  if (_interval) {
    window.clearInterval(_interval)
  }
}

export function startSync() {
  resetInterval()
}

async function sync() {
  if (isProcessing) {
    // already processing, bail now
    return
  }

  const filesPendingSync = await getFilesPendingSync()
  const rec = filesPendingSync.shift()
  if (!rec) {
    // db is not pending any writes
    setBusy(false)
    return
  }

  console.log('[DDB] sync file', rec)
  setBusy(true, filesPendingSync.length + 1)
  console.log('[DDB] status', JSON.stringify(getBusy()))

  // process the next file in the queue
  isProcessing = true

  if (rec.syncProgress < 1) {
    try {
      await upload(rec)
      resetInterval()
      rec.syncProgress = 1
      rec.retryCount = 0
    } catch (err) {
      console.error(`[DDB] upload attempt ${rec.retryCount} failed: ${err}`)
      rec.retryCount += 1
      resetInterval(_intervalTime * _backoffMultiplier)
    }
  }
  if (rec.shareQueueDirty) {
    try {
      for (const shareInfo of rec.shareQueue) {
        await httpPost(
          'auth',
          `${shareInfo.groupId}/${rec.id}/inherit/public`,
          {}
        )
      }
      rec.shareQueueDirty = 0
      rec.retryCount = 0
    } catch (err) {
      console.error(`[DDB] share attempt ${rec.retryCount} failed: ${err}`)
      rec.retryCount += 1
      resetInterval(_intervalTime * _backoffMultiplier)
    }
  }
  await ddbRef.current?.put('files', rec)
  isProcessing = false
  setBusy(false)
}

let _isBusy = false
let _writesPending = 0

export function setBusy(isBusy: boolean, writesPending: number = 0) {
  _writesPending = writesPending
  _isBusy = isBusy
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
