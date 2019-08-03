import React from 'react'
import { storiesOf } from '@storybook/react'
import { ServiceProviderDecorator } from './decorators'
import Login from '../src/Login'

storiesOf('Demos//Login', module)
  .addDecorator(ServiceProviderDecorator)
  .add('default', () => <Login />)
