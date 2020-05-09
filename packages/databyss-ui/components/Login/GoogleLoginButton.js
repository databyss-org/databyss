import React, { useEffect, useRef, useState } from 'react'
import { Button, Text, Grid, View } from '@databyss-org/ui/primitives'
import GoogleSvg from '@databyss-org/ui/assets/google_g.svg'
import { getGapi } from '../../lib/gapi'

// constructs the object passed to the `onSuccess` callback
// this follows the format used by `react-google-login`
// https://www.npmjs.com/package/react-google-login
const formatResponse = res => {
  const basicProfile = res.getBasicProfile()
  const authResponse = res.getAuthResponse()
  res.googleId = basicProfile.getId()
  res.tokenObj = authResponse
  res.tokenId = authResponse.id_token
  res.accessToken = authResponse.access_token
  res.profileObj = {
    googleId: basicProfile.getId(),
    imageUrl: basicProfile.getImageUrl(),
    email: basicProfile.getEmail(),
    name: basicProfile.getName(),
    givenName: basicProfile.getGivenName(),
    familyName: basicProfile.getFamilyName(),
  }
  return res
}

const GoogleLoginButton = ({
  onSuccess,
  onFailure,
  disabled,
  children,
  ...others
}) => {
  const buttonRef = useRef()
  const [isReady, setIsReady] = useState(false)

  const attachGapiToButton = GoogleAuth => {
    GoogleAuth.attachClickHandler(
      buttonRef.current,
      {},
      res => onSuccess(formatResponse(res)),
      onFailure
    )
  }

  const initGapi = async () => {
    const gapi = await getGapi()
    gapi.load('auth2', () => {
      gapi.auth2
        .init({
          client_id: process.env.GAPI_CLIENT_ID,
        })
        .then(GoogleAuth => {
          attachGapiToButton(GoogleAuth)
          setIsReady(true)
        })
    })
  }

  // on mount, initialize GAPI auth2 and signin2 services
  useEffect(
    () => {
      // SKIP this if in TEST environment because GAPI breaks on Circle
      if (process.env.NODE_ENV !== 'test') {
        if (buttonRef.current) {
          initGapi()
        }
      }
    },
    [buttonRef.current]
  )

  return (
    <Button
      variant="googleSignIn"
      disabled={disabled || !isReady}
      ref={buttonRef}
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
