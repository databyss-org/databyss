import React from 'react'

import { Button, ScrollView } from '@databyss-org/ui/primitives'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'

import { getScrollViewMaxHeight } from '../../utils/getScrollViewMaxHeight'
import { MobileView } from '../Mobile'

import ConfigMetadata from './ConfigMetadata'

const headerItems = [ConfigMetadata]

// component
const ConfigIndex = () => {
  const { logout } = useSessionContext()

  const onLogout = () => {
    logout()
    window.requestAnimationFrame(() => (window.location.href = '/'))
  }

  // render methods
  const render = () => (
    <MobileView headerItems={headerItems}>
      <ScrollView padding="medium" maxHeight={getScrollViewMaxHeight()}>
        <Button onPress={onLogout}>Logout</Button>
      </ScrollView>
    </MobileView>
  )

  return render()
}

export default ConfigIndex
