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

export const request = (path, options) => {
  const _path = path.replace(process.env.REACT_APP_API_URL, '')
  switch (_path) {
    case '/auth': {
      if (
        options.headers['x-auth-token'] === validAuthToken &&
        options.headers['x-databyss-account'] === validAccountId
      ) {
        return { data: { session: mockSession1 } }
      }
      throw new Error()
    }
    default: {
      throw new Error()
    }
  }
}
