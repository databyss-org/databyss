import React from 'react'
import { storiesOf } from '@storybook/react'
import { Text, View } from '@databyss-org/ui/primitives'
import ServiceProvider from '@databyss-org/services/lib/ServiceProvider'
import SessionProvider from '@databyss-org/services/session/SessionProvider'
import { connect, couchDbRef } from '@databyss-org/data/couchdb-client/couchdb'
import { getPouchSecret } from '@databyss-org/services/session/clientStorage'
import { SessionInfo } from '../Modules/login.stories'
import { ViewportDecorator } from '../decorators'

storiesOf('Services|Auth', module)
  .addDecorator(ViewportDecorator)
  .add('Login', () => (
    <View data-test-id="login-page">
      <ServiceProvider>
        <SessionProvider>
          <Text variant="uiTextNormalSemibold" data-test-id="authorized">
            Authorized
          </Text>
          <SessionInfo />
        </SessionProvider>
      </ServiceProvider>
    </View>
  ))
  .add('CouchDb', () => {
    const _secrets = getPouchSecret()
    const _groupId = Object.keys(_secrets)[0]
    const _dbName = `g_${_groupId}`
    connect(_dbName)
    couchDbRef.current!.get('user_preference').then((_doc) => {
      console.log('_doc', _doc)
    })
    couchDbRef
      .current!.find({
        '\\$type': 'BLOCK',
      })
      .then((_doc) => {
        console.log('_doc', _doc)
      })
    return (
      <View>
        <Text variant="uiTextNormal">CouchDb!</Text>
      </View>
    )
  })
