import React from 'react'
import { storiesOf } from '@storybook/react-native'
import Typography from '@databyss-org/ui/stories/System/Typography'
import Views from '@databyss-org/ui/stories/System/Views'
import Control from '@databyss-org/ui/stories/System/Control'
import { ThemeDecorator, ContentDecorator } from './decorators'

storiesOf('Design System', module)
  .addDecorator(ThemeDecorator)
  .addDecorator(ContentDecorator)
  .add('Typography', () => <Typography />)
  .add('Views', () => <Views />)
  .add('Control', () => <Control />)
