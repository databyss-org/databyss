import contentDisposition from 'content-disposition'
import { InsufficientPermissionError } from '@databyss-org/services/interfaces'
import { httpGet } from '@databyss-org/services/lib/requestDrive'
import { ddbRef, DriveDBRecordSchema } from './ddb'

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
    shareQueue: [],
    shareQueueDirty: 0,
    sharedWithGroups: [],
  }
  await ddbRef.current!.put('files', _rec)
}

export async function shareFileWithGroup({
  id,
  groupId,
  revokeAccess,
}: {
  id: string
  groupId: string
  revokeAccess: boolean
}) {
  const rec = await ddbRef.current!.get('files', id)
  if (!rec) {
    throw new Error(`[DDB] cannot share file, id not found: ${id}`)
  }
  // remove any actions for the groupId
  rec.shareQueue = rec.shareQueue.filter((share) => share.groupId !== groupId)
  // add the action
  rec.shareQueue.push({
    accessLevel: 'readonly', // TODO: this is for sharing public groups/pages only rn
    groupId,
    revokeAccess,
  })
}

export async function getFileUrl(groupId, fileId) {
  if (fileUrlCache[fileId]) {
    return fileUrlCache[fileId]
  }
  let file: File | null = null
  let url: string | null = null
  console.log('[DDB] getFileUrl', fileId)
  const fileRec = await ddbRef.current?.get('files', fileId)
  if (!fileRec) {
    // Cache miss
    // If we have an auth token, try to download the file
    file = await fetchFile(fileId)
    if (!file) {
      // TODO handle broken files with placeholder image
      return URL.createObjectURL(new Blob())
    }
    // Cache the downloaded file
    await addFile({ id: fileId, file, syncProgress: 1 })
  } else {
    file = new File([fileRec.data], fileRec.filename, {
      type: fileRec.contentType,
    })
  }
  url = URL.createObjectURL(file)
  fileUrlCache[fileId] = url
  return url
}

async function fetchFile(id) {
  try {
    console.log('[DDB] fetchFile', id)
    const res = await httpGet<Response>('b', id, { rawResponse: true })
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
    console.error('[DDB] fetchFile failed', err)
    if (err instanceof InsufficientPermissionError) {
      return null
    }
    throw err
  }
}

export async function getFilesPendingSync() {
  if (!ddbRef.current) {
    return []
  }
  return (
    await ddbRef.current.getAllFromIndex(
      'files',
      'by-sync-progress',
      IDBKeyRange.upperBound(1, true)
    )
  ).concat(
    await ddbRef.current.getAllFromIndex(
      'files',
      'by-share-queue-dirty',
      IDBKeyRange.only(1)
    )
  )
}
