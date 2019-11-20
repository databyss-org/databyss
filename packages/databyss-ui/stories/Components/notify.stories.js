import React from 'react'
import { storiesOf } from '@storybook/react'
import ErrorFallback from '@databyss-org/ui/components/Notify/ErrorFallback'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import { ViewportDecorator, NotifyDecorator } from '../decorators'
import { NotifyMessage, NotifyError, TriggerError } from './Notifys'

storiesOf('Components|Notify', module)
  .addDecorator(NotifyDecorator)
  .addDecorator(ViewportDecorator)
  .add('Notify', () => (
    <React.Fragment>
      <NotifyMessage />
      <NotifyError />
      <TriggerError />
    </React.Fragment>
  ))
  .add('Error', () => <ErrorFallback message="No Source Found" />)
  .add('Loading', () => <Loading />)
