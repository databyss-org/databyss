import React from 'react'
import { storiesOf } from '@storybook/react'
import { ViewportDecorator } from '../decorators'
import Typography from './Typography'
import Views from './Views'
import Controls from './Controls'
import Buttons from './Buttons'
import Icons from './Icons'
import ListControl, { ItemSeparators, ComplexItems } from './ListControl'
import Modals from './Modals'

storiesOf('Design System|Buttons', module)
  .addDecorator(ViewportDecorator)
  .add('UI Buttons', () => <Buttons />)
storiesOf('Design System|Typography', module)
  .addDecorator(ViewportDecorator)
  .add('Typography', () => <Typography />)
storiesOf('Design System|Views', module)
  .addDecorator(ViewportDecorator)
  .add('Views', () => <Views />)
storiesOf('Design System|Controls', module)
  .addDecorator(ViewportDecorator)
  .add('Controls', () => <Controls />)
storiesOf('Design System|Icons', module)
  .addDecorator(ViewportDecorator)
  .add('Icons', () => <Icons />)
storiesOf('Design System|ListControl', module)
  .addDecorator(ViewportDecorator)
  .add('Scrolling', () => <ListControl />)
  .add('Separators', () => <ItemSeparators />)
  .add('Complex', () => <ComplexItems />)
storiesOf('Design System|Modals', module)
  .addDecorator(ViewportDecorator)
  .add('Default', () => <Modals />)
