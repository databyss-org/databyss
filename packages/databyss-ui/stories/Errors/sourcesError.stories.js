import React from 'react'
import { storiesOf } from '@storybook/react'
import ErrorFallback from '@databyss-org/ui/components/Notify/ErrorFallback'
import { ViewportDecorator } from '../decorators'

storiesOf('Notify//Sources', module)
  .addDecorator(ViewportDecorator)
  .add('error', () => <ErrorFallback message="No Source Found" />)
