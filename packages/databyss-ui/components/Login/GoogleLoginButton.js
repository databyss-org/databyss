import React, { useEffect, useRef, useState } from 'react'
import { Button, Text, Grid, View } from '@databyss-org/ui/primitives'
import GoogleSvg from '@databyss-org/ui/assets/google_g.svg'
import { getGapi } from '../../lib/gapi'

const GoogleLoginButton = ({
  onSuccess,
  onFailure,
  disabled,
  children,
  onPress,
  ...others
}) => {
  const buttonRef = useRef()
  const [GoogleAuth, setGoogleAuth] = useState(null)

  const onButtonPress = () => {
    if (onPress) {
      onPress()
    }
    GoogleAuth.grantOfflineAccess({
      prompt: 'select_account',
      response_type: 'id_token',
    })
      .then(res => {
        onSuccess({ code: res.code })
      })
      .catch(err => {
        onFailure(err)
      })
  }

  const initGapi = async () => {
    const gapi = await getGapi()
    gapi.load('auth2', () => {
      gapi.auth2
        .init({
          client_id: process.env.GAPI_CLIENT_ID,
        })
        .then(_googleAuth => {
          setGoogleAuth(_googleAuth)
        })
    })
  }

  // on mount, initialize GAPI auth2 and signin2 services
  useEffect(
    () => {
      if (buttonRef.current) {
        initGapi()
      }
    },
    [buttonRef.current]
  )

  return (
    <Button
      variant="googleSignIn"
      disabled={disabled || !GoogleAuth}
      ref={buttonRef}
      onPress={onButtonPress}
      {...others}
    >
      <Grid colummGap="20px" singleRow alignItems="center">
        <View>
          <GoogleSvg />
        </View>
        <View>
          <Text variant="uiTextNormal" color="gray.3">
            {children}
          </Text>
        </View>
      </Grid>
    </Button>
  )
}

export default GoogleLoginButton
