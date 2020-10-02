import React from 'react'

import { Button, ScrollView } from '@databyss-org/ui/primitives'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { MobileView } from '../Mobile'
import { getScrollViewMaxHeight } from '../../utils/getScrollViewMaxHeight'

import ConfigMetadata from './ConfigMetadata'

const headerItems = [ConfigMetadata]

// component
const ConfigIndex = () => {
  const endSession = useSessionContext(c => c && c.endSession)

  // render methods
  const render = () => (
    <MobileView headerItems={headerItems}>
      <ScrollView padding="medium" maxHeight={getScrollViewMaxHeight()}>
        <Button onPress={endSession}>Logout</Button>
      </ScrollView>
    </MobileView>
  )

  return render()
}

export default ConfigIndex
