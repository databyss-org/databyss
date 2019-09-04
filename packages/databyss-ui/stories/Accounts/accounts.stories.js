import React, { useState, useEffect } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Button, Text } from '@databyss-org/ui/primitives'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import {
  register,
  getAuthToken,
  checkToken,
  login,
} from '@databyss-org/services/auth'
import {
  getAccountId,
  newAccountFromToken,
  setAccountId,
  getAccount,
} from '@databyss-org/services/pages'

import { ViewportDecorator } from '../decorators'

const AccountDemo = () => {
  const [userState, setUserState] = useState({ account: null, token: null })

  const checkUserStatus = async () => {
    const token = getAuthToken()
    const isValid = await checkToken(token)
    if (isValid) {
      setUserState(s => ({ ...s, token }))
      let account = getAccountId()
      if (account) {
        const res = await getAccount()
        setAccountId(res._id)
        setUserState(s => ({ ...s, account: res._id }))
      } else {
        account = await newAccountFromToken(token)
        if (account) {
          setAccountId(account._id)
          setUserState(s => ({ ...s, account: res._id }))
        }
      }
    }
  }

  const registerUser = async () => {
    let token = await register({
      email: 'email@test.com',
      password: 'password',
      name: 'joe',
    })
    if (token) {
      checkUserStatus()
    } else {
      login({
        email: 'email@test.com',
        password: 'password',
      }).then(() => {
        checkUserStatus()
      })
    }
  }

  useEffect(() => {
    checkUserStatus()
  }, [])

  return (
    <View>
      <Grid mb="medium">
        <View>
          <Button onPress={() => registerUser()}>
            CREATE USER AND ACCOUNT
          </Button>
        </View>
      </Grid>
      <Grid>
        <View>
          <Text>
            Token is {userState.token ? `valid: ${userState.token}` : 'null'} {}
          </Text>
          <Text>
            Account is{' '}
            {userState.account ? `valid: ${userState.account}` : 'null'} {}
          </Text>
        </View>
      </Grid>
    </View>
  )
}

storiesOf('Login and Create Account Id', module)
  .addDecorator(ViewportDecorator)
  .add('Login/Accounts', () => {
    return (
      <View>
        <AccountDemo />
      </View>
    )
  })
