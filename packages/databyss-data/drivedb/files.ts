import contentDisposition from 'content-disposition'
import { InsufficientPermissionError } from '@databyss-org/services/interfaces'
import { httpGet } from '@databyss-org/services/lib/requestDrive'
import { ddbRef, DriveDBRecordSchema } from './ddb'
import { syncQueue } from './sync'

export const fileUrlCache: { [id: string]: string } = {}

export async function addFile({
  id,
  file,
  contentType,
  syncProgress,
}: {
  id: string
  file: File
  contentType?: string
  syncProgress?: number
}) {
  const _syncProgress = syncProgress ?? 0
  const _rec: DriveDBRecordSchema = {
    id,
    filename: file.name,
    data: await file.arrayBuffer(),
    syncProgress: _syncProgress,
    contentType: contentType ?? file.type,
    retryCount: 0,
  }
  await ddbRef.current!.put('files', _rec)
  if (_syncProgress < 1) {
    syncQueue.current.push(_rec)
  }
}

export async function getFileUrl(groupId, fileId) {
  if (fileUrlCache[fileId]) {
    return fileUrlCache[fileId]
  }
  let file: File | null = null
  let url: string | null = null
  const fileRec = await ddbRef.current?.get('files', fileId)
  if (!fileRec) {
    // Cache miss
    // If we have an auth token, try to download the file
    file = await fetchFile(fileId)
    if (!file) {
      // If we don't have a token to download the file, return the remote drive URL
      // so that if the file is public, the browser can load it over HTTP
      url = `https://${process.env.DRIVE_HOST}/b/${groupId}/${fileId}`
      fileUrlCache[fileId] = url
      return url
    }
    // Cache the downloaded file
    await addFile({ id: fileId, file, syncProgress: 1 })
  } else {
    file = new File([fileRec.data], fileRec.filename)
  }
  url = URL.createObjectURL(file)
  fileUrlCache[fileId] = url
  return url
}

async function fetchFile(id) {
  try {
    const res = await httpGet<Response>(id, { rawResponse: true })
    const data = await res.arrayBuffer()
    const dispositionHeader = res.headers.get('content-disposition')
    const disposition = dispositionHeader
      ? contentDisposition.parse(dispositionHeader)
      : null
    const contentType =
      res.headers.get('content-type') ?? 'application/octet-stream'
    return new File([data], disposition?.parameters?.filename ?? id, {
      type: contentType,
    })
  } catch (err) {
    if (err instanceof InsufficientPermissionError) {
      return null
    }
    throw err
  }
}

export function getFilesPendingSync() {
  return ddbRef.current!.getAllFromIndex(
    'files',
    'by-sync-progress',
    IDBKeyRange.upperBound(1, true)
  )
}
