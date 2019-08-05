import React, { useContext } from 'react'
import Login from '@databyss-org/ui/modules/Login/Login'
import { ServiceContext } from '@databyss-org/services/components/ServiceProvider'
import {
  registerWithEmail,
  checkToken,
  setGoogleAuthToken,
  checkCode,
} from './actions'

export default () => {
  const serviceContext = useContext(ServiceContext)
  const { auth } = serviceContext

  const urlParams = new URLSearchParams(window.location.search)

  if (urlParams.has('code')) {
    checkCode(auth)(urlParams.get('code'))
  }

  return (
    <div style={{ height: '90vh' }}>
      <Login
        registerWithEmail={registerWithEmail(auth)}
        checkToken={checkToken(auth)}
        setGoogleAuthToken={setGoogleAuthToken(auth)}
        checkCode={checkCode(auth)}
        getAuthToken={auth.getAuthToken}
      />
    </div>
  )
}
