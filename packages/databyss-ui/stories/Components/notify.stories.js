import React from 'react'
import { storiesOf } from '@storybook/react'
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
