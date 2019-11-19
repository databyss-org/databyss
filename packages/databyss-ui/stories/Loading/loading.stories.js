import React from 'react'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import { storiesOf } from '@storybook/react'
import { ViewportDecorator } from '../decorators'

storiesOf('Notify//Sources', module)
  .addDecorator(ViewportDecorator)
  .add('loading', () => <Loading />)
