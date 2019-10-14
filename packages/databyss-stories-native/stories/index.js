import React from 'react'
import { storiesOf } from '@storybook/react-native'
import Typography from '@databyss-org/ui/stories/System/Typography'
import Views from '@databyss-org/ui/stories/System/Views'
import Controls from '@databyss-org/ui/stories/System/Controls'
import Buttons from '@databyss-org/ui/stories/System/Buttons'
import Icons from '@databyss-org/ui/stories/System/Icons'
import Modals from '@databyss-org/ui/stories/System/Modals'
import ListControl, {
  ItemSeparators,
  ComplexItems,
} from '@databyss-org/ui/stories/System/List'
import { ThemeDecorator, ContentDecorator } from './decorators'

storiesOf('Design System', module)
  .addDecorator(ThemeDecorator)
  .addDecorator(ContentDecorator)
  .add('Typography', () => <Typography />)
  .add('Views', () => <Views />)
  .add('Controls', () => <Controls />)
  .add('Buttons', () => <Buttons />)
  .add('Icons', () => <Icons />)
  .add('List', () => (
    <React.Fragment>
      <ListControl />
      <ItemSeparators />
      <ComplexItems />
    </React.Fragment>
  ))
  .add('Modals', () => <Modals />)
