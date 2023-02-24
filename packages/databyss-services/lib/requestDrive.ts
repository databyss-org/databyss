import request, { RequestOptions, FETCH_TIMEOUT } from './request'
import { getAccountId, getAuthToken } from './../session/clientStorage'
import { version as databyssVersion } from './../version'
import { ConcurrentUpload } from './ConcurrentUpload'
import { NetworkUnavailableError } from '../interfaces'

export const activeUploads: { [uploadId: string]: ConcurrentUpload } = {}

export const requestDrive = async (
  path: string,
  options: RequestOptions = { headers: {} }
) => {
  const _accountId = await getAccountId()
  const _token = await getAuthToken()

  return request(process.env.DRIVE_HOST + path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${_token}`,
      'x-databyss-version': databyssVersion,
      'x-databyss-account': `${_accountId}`,
    },
    timeout: options.timeout || FETCH_TIMEOUT * 3,
  })
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

export const uploadFile = async ({
  file,
  fileId,
  contentType,
}: {
  file: File
  fileId: string
  contentType?: string // TODO replace with MIME
}) => {
  const upload = new ConcurrentUpload({ file, fileId, contentType })
  await upload.initUpload()
  if (!upload.uploadId) {
    throw new NetworkUnavailableError('[uploadFile] initUpload failed')
  }
  activeUploads[upload.uploadId] = upload
  upload.upload().then(() => {
    delete activeUploads[upload.uploadId!]
  })
  return upload
}
