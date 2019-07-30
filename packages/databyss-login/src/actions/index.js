import * as auth from '@databyss-org/services/lib/auth'

export const login = async formData => {
  const { email, password } = formData
  if (await auth.login({ email, password })) {
    window.location = '/'
  }
}

export const checkToken = async token => {
  if (await auth.checkToken(token)) {
    window.location = '/'
  }
}

export const register = async formData => {
  if (await auth.register(formData)) {
    window.location = '/'
  }
}

export const registerWithEmail = async ({ formData, history }) => {
  if (await auth.registerWithEmail(formData)) {
    history.push('/verify')
    // SEND TO A CHECK EMAIL PAGE
    // REDIRECT HERE
  }
}

export const setGoogleAuthToken = async token => {
  if (await auth.setGoogleAuthToken(token)) {
    window.location = '/'
  }
}
