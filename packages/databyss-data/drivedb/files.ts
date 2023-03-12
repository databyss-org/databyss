import contentDisposition from 'content-disposition'
import { InsufficientPermissionError } from '@databyss-org/services/interfaces'
import { httpGet } from '@databyss-org/services/lib/requestDrive'
import { ddbRef } from './ddb'

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
  return ddbRef.current!.put('files', {
    id,
    filename: file.name,
    data: await file.arrayBuffer(),
    syncProgress: syncProgress ?? 0,
    contentType: contentType ?? file.type,
  })
}

export async function getFileUrl(groupId, fileId) {
  let file: File | null = null
  const fileRec = await ddbRef.current?.get('files', fileId)
  if (!fileRec) {
    // Cache miss
    // If we have an auth token, try to download the file
    file = await fetchFile(fileId)
    if (!file) {
      // If we don't have a token to download the file, return the remote drive URL
      // so that if the file is public, the browser can load it over HTTP
      return `https://${process.env.DRIVE_HOST}/b/${groupId}/${fileId}`
    }
    // Cache the downloaded file
    await addFile({ id: fileId, file, syncProgress: 1 })
  } else {
    file = new File([fileRec.data], fileRec.filename)
  }
  return URL.createObjectURL(file)
}

async function fetchFile(id) {
  try {
    const res: Response = await httpGet(id, { rawResponse: true })
    const data = await res.arrayBuffer()
    const disposition = contentDisposition.parse(
      res.headers.get('content-disposition') ?? ''
    )
    const contentType =
      res.headers.get('content-type') ?? 'application/octet-stream'
    return new File([data], disposition.parameters?.filename, {
      type: contentType,
    })
  } catch (err) {
    if (err instanceof InsufficientPermissionError) {
      return null
    }
    throw err
  }
}
