import React, { useEffect, useState } from 'react'
import { Button, Text, Grid, View } from '@databyss-org/ui/primitives'
import queryString from 'query-string'
import GoogleSvg from '@databyss-org/ui/assets/google_g.svg'
import ObjectId from 'bson-objectid'
import { openOauthWindow } from '../../lib/browser'

const GoogleLoginButton = ({
  onSuccess,
  onFailure,
  children,
  onPress,
  ...others
}) => {
  const [oauthHash] = useState(ObjectId().toHexString())

  const makeOauthUrl = () => {
    const url = 'https://accounts.google.com/signin/oauth/oauthchooseaccount'
    const qs = {
      scope: 'email profile',
      access_type: 'online',
      prompt: 'select_account',
      response_type: 'code',
      state: oauthHash,
      redirect_uri: `${window.location.protocol}//${
        window.location.host
      }/oauth/google`,
      client_id: process.env.GAPI_CLIENT_ID,
      flowName: 'GeneralOAuthFlow',
    }
    return `${url}?${queryString.stringify(qs)}`
  }

  const onReceiveMessage = msg => {
    if (!msg || !msg.data || !msg.data.code || !msg.data.state) {
      return onFailure('bad response', msg)
    }
    if (msg.data.state !== oauthHash) {
      return onFailure('bad oauth hash', msg.data.state)
    }
    if (msg && msg.data && msg.data.code) {
      console.log(msg.data.code)
      onSuccess({ code: msg.data.code })
    }
    return true
  }

  const onButtonPress = () => {
    if (onPress) {
      onPress()
    }
    openOauthWindow({
      url: makeOauthUrl(),
      name: 'google_oauth',
    })
  }

  useEffect(() => {
    window.addEventListener('message', evt => onReceiveMessage(evt), false)
    return () => {
      window.removeEventListener('message', onReceiveMessage)
    }
  }, [])

  return (
    <Button variant="googleSignIn" onPress={onButtonPress} {...others}>
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
