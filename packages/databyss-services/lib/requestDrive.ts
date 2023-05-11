import { addFile } from '@databyss-org/data/drivedb/files'
import request, { RequestOptions, FETCH_TIMEOUT } from './request'
import {
  getAccountId,
  getAuthToken,
  getUserId,
} from './../session/clientStorage'
import { version as databyssVersion } from './../version'
import { ConcurrentUpload } from './ConcurrentUpload'

export const activeUploads: { [uploadId: string]: ConcurrentUpload } = {}

export type DriveRoute = 'auth' | 'b' | 'user'

export const requestDrive = async <T>(
  route: DriveRoute,
  path: string,
  options?: RequestOptions
): Promise<T> => {
  const groupId = getAccountId()
  const userId = getUserId()
  const token = await getAuthToken()
  let url = `https://${process.env.DRIVE_HOST}/${route}`
  if (path.startsWith('/') && path.length > 1) {
    url += path
  } else {
    url += `/${route === 'user' ? userId : groupId}`
    if (path.length) {
      url += `/${path}`
    }
  }

  return request(url, {
    ...options,
    headers: {
      ...(options?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      'x-databyss-version': databyssVersion,
    },
    timeout: options?.timeout ?? FETCH_TIMEOUT * 3,
  })
}

export const httpGet = async <T>(
  route: DriveRoute,
  path: string,
  options?: RequestOptions
) => requestDrive<T>(route, path, options)

export const httpPost = async <T>(
  route: DriveRoute,
  path: string,
  body: any = {}
) =>
  requestDrive<T>(route, path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

export const httpDelete = (route: DriveRoute, path: string) =>
  requestDrive(route, path, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

export interface UploadFileResponse {
  contentType: string
}

export async function uploadFile({
  file,
  fileId,
}: {
  file: File
  fileId: string
  // TODO: add contentType
}) {
  // save to IDB
  return addFile({ id: fileId, file })
}
