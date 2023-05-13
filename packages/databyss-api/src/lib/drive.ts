import request from 'request'
import { ApiError } from './Errors'

export type AccessLevel = 'admin' | 'readwrite' | 'readonly'

export interface SetAccessOptions {
  groupId: string
  fileId?: string
  userId?: string
  isPublic?: boolean
  accessLevel: AccessLevel
}

export function activateToken(
  {
    userId,
    token,
  }: {
    userId: string
    token: string
  },
  activate: boolean
) {
  const url = `https://${process.env.REACT_APP_DRIVE_HOST}/auth`
  return new Promise<string>((resolve, reject) => {
    request(url, {
      method: activate ? 'POST' : 'DELETE',
      headers: {
        Authorization: `Bearer ${process.env.DRIVE_ROOT_SECRET!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, token }),
    })
      .on('response', (response) => {
        if (!(response.statusCode >= 200 && response.statusCode < 300)) {
          reject(
            new ApiError(
              `[drive] activateToken failed: ${
                response.body ?? response.statusMessage
              }`
            )
          )
          return
        }
        console.log('[DRIVE] activate token', token, response.statusCode)
        resolve(
          `ACL request accepted: ${response.body ?? response.statusMessage}`
        )
      })
      .on('error', (err) => {
        reject(new ApiError(`[activateToken] setAccess failed: ${err.message}`))
      })
  })
}

export function setAccess(
  { groupId, fileId, isPublic, accessLevel, userId }: SetAccessOptions,
  authorize: boolean
) {
  let url = `https://${process.env.REACT_APP_DRIVE_HOST}/auth/${groupId}`
  url += fileId ? `/${fileId}` : `/*`
  url += `/${accessLevel}`
  url += isPublic ? '/public' : `/${userId}`

  return new Promise<string>((resolve, reject) => {
    request(url, {
      method: authorize ? 'POST' : 'DELETE',
      headers: {
        Authorization: `Bearer ${process.env.DRIVE_ROOT_SECRET!}`,
        'Content-Type': 'application/json',
      },
    })
      .on('response', (response) => {
        if (!(response.statusCode >= 200 && response.statusCode < 300)) {
          reject(
            new ApiError(
              `[drive] setAccess failed: ${
                response.body ?? response.statusMessage
              }`
            )
          )
          return
        }
        console.log('[DRIVE]', url, response.statusCode)
        resolve(
          `ACL request accepted: ${response.body ?? response.statusMessage}`
        )
      })
      .on('error', (err) => {
        reject(new ApiError(`[drive] setAccess failed: ${err.message}`))
      })
  })
}

export function setQuotaAllowed({
  userId,
  allowed,
}: {
  userId: string
  allowed: number
}) {
  return new Promise<string>((resolve, reject) => {
    const url = `https://${process.env.REACT_APP_DRIVE_HOST}/user/${userId}/quota/allowed`
    request(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.DRIVE_ROOT_SECRET!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ allowed: allowed * 1000000 }),
    })
      .on('response', (response) => {
        if (!(response.statusCode >= 200 && response.statusCode < 300)) {
          reject(
            new ApiError(
              `[drive] setQuotaAllowed failed: ${
                response.body ?? response.statusMessage
              } (${url})`
            )
          )
          return
        }
        resolve(
          `Quota request accepted: ${response.body ?? response.statusMessage}`
        )
      })
      .on('error', (err) => {
        reject(new ApiError(`[drive] setQuotaAllowed failed: ${err.message}`))
      })
  })
}
