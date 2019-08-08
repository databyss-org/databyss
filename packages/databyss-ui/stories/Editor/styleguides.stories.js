import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { ViewportDecorator, ServiceProviderDecorator } from '../decorators'
import EditorBlock from './EditorBlock'
// import Views from './Views'

storiesOf('Editor', module)
  .addDecorator(ViewportDecorator)
  .addDecorator(ServiceProviderDecorator)
  .add('Editor', () => <EditorBlock text="EXAMPLE TEXT" />)
