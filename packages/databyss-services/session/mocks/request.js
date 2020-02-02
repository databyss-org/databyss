import { NotAuthorizedError, ResourceNotFoundError } from '../../lib/errors'
import { delay } from '../../lib/mocks'

const validAuthToken = '5e1767601a16fb802874a5cd'
const validCode = '5e17693fcfd842d830117981'
const validAccountId = '5e1767a3e79ef56ab3328bb7'

export const mockSession1 = {
  token: validAuthToken,
  user: {
    firstName: 'Jeri',
    lastName: 'Reno',
  },
  account: {
    id: validAccountId,
    name: 'returntocinder',
  },
}

const validSessionResponse = { data: { session: mockSession1 } }

export default async (path, options) => {
  const body = (options.body && JSON.parse(options.body)) || {}
  console.log('MOCK REQUEST', path, options)
  const _path = path.replace(process.env.API_URL, '')
  await delay(3)
  switch (_path) {
    case '/auth': {
      if (
        options.headers['x-auth-token'] === validAuthToken &&
        options.headers['x-databyss-account'] === validAccountId
      ) {
        return validSessionResponse
      }
      throw new NotAuthorizedError()
    }
    case '/users/google': {
      // assume valid token
      return validSessionResponse
    }
    case '/auth/code': {
      if (body.code === validCode) {
        return validSessionResponse
      }
      throw new NotAuthorizedError()
    }
    case '/users/email': {
      return {}
    }
    default: {
      throw new ResourceNotFoundError()
    }
  }
}
