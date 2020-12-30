import React from 'react'
import { storiesOf } from '@storybook/react'
import { ViewportDecorator, GestureDecorator } from '../decorators'
import Typography from './Typography'
import Views from './Views'
import Controls from './Controls'
import Buttons from './Buttons'
import Icons from './Icons'
import TextInputs from './TextInputs'
import List, {
  ItemSeparators,
  ComplexItems,
  Sections,
  KeyboardNavigationList,
} from './List'
import Modals, { Editable as EditableModals, Dialogs } from './Modals'
import { SimpleDragAndDrop } from './Gestures/simpleDnd'
import { SimpleDragAndDropWithControls } from './Gestures/simpleDndWithControls'

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
  .add('TextInputs', () => <TextInputs />)
  .add('RichTextInputs', () => <TextInputs rich />)
storiesOf('Design System|Icons', module)
  .addDecorator(ViewportDecorator)
  .add('Icons', () => <Icons />)
storiesOf('Design System|List', module)
  .addDecorator(ViewportDecorator)
  .add('Scrolling', () => <List />)
  .add('Separators', () => <ItemSeparators />)
  .add('Complex', () => <ComplexItems />)
  .add('Sections', () => <Sections />)
  .add('Keyboard Navigation', () => <KeyboardNavigationList />)
storiesOf('Design System|Modals', module)
  .addDecorator(ViewportDecorator)
  .add('Default', () => <Modals />)
  .add('Editable', () => <EditableModals />)
  .add('Dialogs', () => <Dialogs />)
storiesOf('Design System|Gestures', module)
  .addDecorator(ViewportDecorator)
  .addDecorator(GestureDecorator)
  .add('Simple Drag and Drop', () => <SimpleDragAndDrop />)
  .add('Draggable BaseControls', () => <SimpleDragAndDropWithControls />)
