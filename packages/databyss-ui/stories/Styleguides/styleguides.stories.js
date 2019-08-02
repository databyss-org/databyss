import { storiesOf } from '@storybook/react'
import { ViewportDecorator } from '../decorators'
import Typography from './Typography'
import Views from './Views'

storiesOf('Styleguides', module)
  .addDecorator(ViewportDecorator)
  .add('Typography', Typography)
  .add('Views', Views)
