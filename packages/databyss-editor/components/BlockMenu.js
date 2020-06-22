import React, { useEffect, useState } from 'react'
import { Transforms, Text } from '@databyss-org/slate'
import { useEditor, ReactEditor } from 'slate-react'
import buttons, {
  editorMarginMenuItemHeight,
} from '@databyss-org/ui/theming/buttons'
import {
  View,
  Button,
  Icon,
  Grid,
  Separator,
  Text as TextPrimitive,
} from '@databyss-org/ui/primitives'
import Close from '@databyss-org/ui/assets/close-menu.svg'
import AddSvg from '@databyss-org/ui/assets/add.svg'
import { stateSelectionToSlateSelection } from '../lib/slateUtils'
import DropdownMenu from './DropdownMenu'
import { pxUnits } from '@databyss-org/ui/theming/views'

const BlockMenuActions = ({ menuActionButtons, unmount, showMenu }) => {
  useEffect(() => () => unmount(), [])
  return (
    <DropdownMenu
      position={{
        top: editorMarginMenuItemHeight,
        left: editorMarginMenuItemHeight,
      }}
      py="extraSmall"
      open={showMenu}
    >
      {menuActionButtons}
    </DropdownMenu>
  )
}

const BlockMenu = ({ element }) => {
  const [showMenu, setShowMenu] = useState(false)
  const editor = useEditor()

  const { buttonVariants } = buttons

  const onShowActions = () => {
    setShowMenu(!showMenu)
  }

  const actions = type =>
    ({
      ENDSOURCE: () => undefined,
      ENDLOCATION: () => undefined,
      SOURCE: () => editor.insertText('@'),
      TOPIC: () => editor.insertText('#'),
      LOCATION: () => {
        Transforms.setNodes(
          editor,
          { location: true, type: 'location' },
          { match: n => Text.isText(n), split: true }
        )
      },
    }[type])

  const onMenuAction = (e, tag) => {
    const _index = ReactEditor.findPath(editor, element)[0]

    const _selection = {
      anchor: { index: _index, offset: 0 },
      focus: { index: _index, offset: 0 },
    }

    const _slateSelection = stateSelectionToSlateSelection(
      editor.children,
      _selection
    )

    // selection needs to be reset because editor could loose focus
    Transforms.select(editor, _slateSelection)
    ReactEditor.focus(editor)

    e.preventDefault()
    actions(tag)()
    setShowMenu(false)
  }

  const menuActions = [
    {
      action: 'ENDSOURCE',
      symbol: '/@',
      shortcut: '//@',
      label: 'End source',
    },
    {
      action: 'ENDLOCATION',
      symbol: '/%',
      shortcut: '//%',
      label: 'End location',
    },
    {
      action: 'TOPIC',
      symbol: '#',
      shortcut: '#',
      label: 'Topic',
    },
    {
      action: 'SOURCE',
      symbol: '@',
      shortcut: '@',
      label: 'Source',
    },
    {
      action: 'LOCATION',
      symbol: '%',
      shortcut: '%',
      label: 'Location',
    },
  ]

  const menuActionButtons = menuActions.map((menuAction, i) => (
    <>
      <Button
        variant="editorMarginMenuItem"
        data-test-block-menu={menuAction.action}
        key={i}
        onMouseDown={e => onMenuAction(e, menuAction.action)}
        alignItems="flex-start"
        childViewProps={{ width: '100%' }}
      >
        <View flexDirection="row" justifyContent="space-between" width="100%">
          <View flexDirection="row">
            <TextPrimitive
              variant="uiTextSmall"
              width={pxUnits(20)}
              textAlign="center"
              mr="small"
              color="text.2"
            >
              {menuAction.symbol}
            </TextPrimitive>
            <TextPrimitive variant="uiTextSmall">
              {menuAction.label}
            </TextPrimitive>
          </View>
          <TextPrimitive variant="uiTextSmall" color="text.3">
            {menuAction.shortcut}
          </TextPrimitive>
        </View>
      </Button>
      {menuAction.shortcut === '//%' && (
        <Separator color="border.3" spacing="extraSmall" />
      )}
    </>
  ))

  return (
    <Grid singleRow columnGap="small">
      <View
        height={editorMarginMenuItemHeight}
        width={editorMarginMenuItemHeight}
        justifyContent="center"
      >
        <Button
          variant="editorMarginMenu"
          onClick={onShowActions}
          data-test-block-menu="open"
          aria-haspopup="true"
        >
          <Icon
            sizeVariant="medium"
            color={buttonVariants.editorMarginMenu.color}
          >
            <AddSvg />
          </Icon>
        </Button>
      </View>
      <View justifyContent="center" height={editorMarginMenuItemHeight}>
        {showMenu && (
          <BlockMenuActions
            unmount={
              () => null
              //   dispatchEditor(onShowMenuActions(false, editableState))
            }
            menuActionButtons={menuActionButtons}
            showMenu={showMenu}
          />
        )}
      </View>
    </Grid>
  )
}

export default BlockMenu
