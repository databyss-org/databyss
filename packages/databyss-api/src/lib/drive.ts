import request from 'request'
import { ApiError } from './Errors'

export type AccessLevel = 'admin' | 'readwrite' | 'readonly'

export function setAccess(
  {
    secret,
    groupId,
    fileId,
    token,
    isPublic,
    accessLevel,
  }: {
    secret: string
    groupId: string
    fileId?: string
    token: string
    isPublic?: boolean
    accessLevel: AccessLevel
  },
  authorize: boolean
) {
  if (!secret) {
    throw new ApiError('ERR: Admin token is required')
  }
  if (!groupId) {
    throw new ApiError('ERR: Group ID is required')
  }
  if (!isPublic && !token) {
    throw new ApiError('ERR: Token is required if not public')
  }
  let url = `https://${process.env.REACT_APP_DRIVE_HOST}/auth/${groupId}`
  if (fileId) {
    url += `/${fileId}`
  }
  const body: {
    accessLevel: AccessLevel
    public?: boolean
    token?: string
  } = { accessLevel }

  if (isPublic) {
    body.public = true
  } else {
    body.token = token
  }
  return new Promise((resolve, reject) => {
    request(url, {
      method: authorize ? 'POST' : 'DELETE',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
        resolve(
          `ACL request accepted: ${response.body ?? response.statusMessage}`
        )
      })
      .on('error', (err) => {
        reject(new ApiError(`[drive] setAccess failed: ${err.message}`))
      })
  })
}
