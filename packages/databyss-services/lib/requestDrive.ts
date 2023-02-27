import request, { RequestOptions, FETCH_TIMEOUT } from './request'
import { getAccountId, getAuthToken } from './../session/clientStorage'
import { version as databyssVersion } from './../version'
import { ConcurrentUpload } from './ConcurrentUpload'

export const activeUploads: { [uploadId: string]: ConcurrentUpload } = {}

export type WithStorageMeta<T> = T & {
  storageKey: string
  fileUrl: string
}

export const requestDrive = async <T>(
  path: string,
  options: RequestOptions = { headers: {} }
): Promise<WithStorageMeta<T>> => {
  const groupId = await getAccountId()
  const token = await getAuthToken()
  const url = `https://${process.env.DRIVE_HOST}/b/${groupId}/${path}`

  return {
    ...(await request(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'x-databyss-version': databyssVersion,
      },
      timeout: options.timeout || FETCH_TIMEOUT * 3,
    })),
    storageKey: `${groupId}/${path}`,
    fileUrl: url,
  }
}

export const httpGet = async (path: string) => requestDrive(path)

export const httpPost = async (path: string, body: any) =>
  requestDrive(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

export const httpDelete = (path: string) =>
  requestDrive(path, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

// export const uploadFile = async ({
//   file,
//   fileId,
//   contentType,
// }: {
//   file: File
//   fileId: string
//   contentType?: string // TODO replace with MIME
// }) => {
//   const upload = new ConcurrentUpload({ file, fileId, contentType })
//   await upload.initUpload()
//   if (!upload.uploadId) {
//     throw new NetworkUnavailableError('[uploadFile] initUpload failed')
//   }
//   activeUploads[upload.uploadId] = upload
//   upload.upload().then(() => {
//     delete activeUploads[upload.uploadId!]
//   })
//   return upload
// }

export interface UploadFileResponse {
  contentType: string
}

export const uploadFile = ({
  file,
  fileId,
}: {
  file: File
  fileId: string
  // TODO: add contentType
}) => {
  const chunkForm = new FormData()
  chunkForm.append('file', file, file.name)
  return requestDrive<UploadFileResponse>(encodeURI(fileId), {
    method: 'PUT',
    body: chunkForm,
  })
}
