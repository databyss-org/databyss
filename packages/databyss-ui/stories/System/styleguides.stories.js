import React from 'react'
import { storiesOf } from '@storybook/react'
import { ViewportDecorator } from '../decorators'
import Typography from './Typography'
import Views from './Views'
import Controls from './Controls'
import Buttons from './Buttons'
import EditorMenu from './EditorMenu'
import Icons from './Icons'
import ListControl from './ListControl'
import Dark from './Dark'

storiesOf('Design System', module)
  .addDecorator(ViewportDecorator)
  .add('Typography', () => <Typography />)
  .add('Views', () => <Views />)
  .add('Controls', () => <Controls />)
  .add('Buttons', () => <Buttons />)
  .add('EditorMenu', () => <EditorMenu />)
  .add('Icons', () => <Icons />)
  .add('ListControl', () => <ListControl />)
  .add('Dark', () => <Dark />)
