import React from 'react'
import { storiesOf } from '@storybook/react'
import { ViewportDecorator, NotifyDecorator } from '../decorators'
import { NotifyMessage } from './Notifys'

storiesOf('Components|Notify', module)
  .addDecorator(NotifyDecorator)
  .addDecorator(ViewportDecorator)
  .add('Notify Message', () => <NotifyMessage />)
