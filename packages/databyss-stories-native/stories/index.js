import React from 'react'
import { storiesOf } from '@storybook/react-native'
import Text from '@databyss-org/ui/primitives/Text/Text'
import { ThemeDecorator } from './decorators'

storiesOf('CenteredView', module)
  .addDecorator(ThemeDecorator)
  .add('default view', () => <Text>Hello Storybook</Text>)
