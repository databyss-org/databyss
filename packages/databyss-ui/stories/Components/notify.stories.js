import React from 'react'
import { storiesOf } from '@storybook/react'
import ErrorFallback from '@databyss-org/ui/components/Notify/ErrorFallback'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import NotifyProvider from '@databyss-org/ui/components/Notify/NotifyProvider'
import { ViewportDecorator } from '../decorators'
import { NotifyMessage, NotifyError, TriggerError } from './Notifys'

storiesOf('Components|Notify', module)
  .addDecorator(ViewportDecorator)
  .add('Notify', () => (
    <NotifyProvider envPrefix="STORYBOOK" shouldCheckOnlineStatus={false}>
      <NotifyMessage />
      <NotifyError />
      <TriggerError />
    </NotifyProvider>
  ))
  .add('Error', () => <ErrorFallback message="No Source Found" />)
  .add('Loading', () => <Loading />)
