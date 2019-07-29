import { storiesOf } from '@storybook/react'
import { ViewportDecorator, ContentDecorator } from '../decorators'
import Typography from './Typography'

storiesOf('Styleguides', module)
  .addDecorator(ContentDecorator)
  .addDecorator(ViewportDecorator)
  .add('Typography', Typography)
