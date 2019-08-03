export const login = auth => async formData => {
  const { email, password } = formData
  if (await auth.login({ email, password })) {
    window.location = '/'
  }
}

export const checkToken = auth => async token => {
  if (await auth.checkToken(token)) {
    window.location = '/'
  }
}

export const checkCode = auth => async code => {
  if (await auth.checkCode(code)) {
    window.location = '/'
  }
}

export const registerWithEmail = auth => async ({
  formData,
  onEmailSuccess,
}) => {
  if (await auth.registerWithEmail(formData)) {
    onEmailSuccess()
  }
}

export const setGoogleAuthToken = auth => async token => {
  if (await auth.setGoogleAuthToken(token)) {
    window.location = '/'
  }
}
