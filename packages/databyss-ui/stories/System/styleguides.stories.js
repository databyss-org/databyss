import { storiesOf } from '@storybook/react'
import { ViewportDecorator } from '../decorators'
import Typography from './Typography'
import Views from './Views'
import Controls from './Controls'
import Buttons from './Buttons'

storiesOf('Design System', module)
  .addDecorator(ViewportDecorator)
  .add('Typography', Typography)
  .add('Views', Views)
  .add('Controls', Controls)
  .add('Buttons', Buttons)
