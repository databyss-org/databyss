import React, { useEffect, useState } from 'react'
import { Transforms, Text } from '@databyss-org/slate'
import { useEditor, ReactEditor } from 'slate-react'
import { editorMarginMenuItemHeight } from '@databyss-org/ui/theming/buttons'
import {
  View,
  BaseControl,
  Icon,
  Grid,
  Separator,
} from '@databyss-org/ui/primitives'
import AddSvg from '@databyss-org/ui/assets/add.svg'
import DropdownContainer from '@databyss-org/ui/components/Menu/DropdownContainer'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import { stateSelectionToSlateSelection } from '../lib/slateUtils'

const BlockMenu = ({ element }) => {
  const [showMenu, setShowMenu] = useState(false)
  const editor = useEditor()

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

  const menuItems = [
    {
      action: 'ENDSOURCE',
      textSymbol: '/@',
      shortcut: '',
      label: 'End source',
    },
    {
      action: 'ENDLOCATION',
      textSymbol: '/%',
      shortcut: '',
      label: 'End location',
    },
    {
      action: 'TOPIC',
      textSymbol: '#',
      shortcut: 'Ctrl + 3',
      label: 'Topic',
    },
    {
      action: 'SOURCE',
      textSymbol: '@',
      shortcut: 'Ctrl + 2',
      label: 'Source',
    },
    {
      action: 'LOCATION',
      textSymbol: '%',
      shortcut: 'Ctrl + 5',
      label: 'Location',
    },
  ]

  const BlockMenuActions = ({ menuItems, unmount, showMenu }) => {
    useEffect(() => () => unmount(), [])

    return (
      <DropdownContainer
        position={{
          top: editorMarginMenuItemHeight,
          left: editorMarginMenuItemHeight,
        }}
        open={showMenu}
        separatorAfterItemNr={1}
      >
        {menuItems.map(menuItem => (
          <React.Fragment key={menuItem.action}>
            <DropdownListItem
              menuItem={menuItem}
              onClick={e => onMenuAction(e, menuItem.action)}
            />
            {menuItem.action === 'ENDLOCATION' && (
              <Separator color="border.3" spacing="extraSmall" />
            )}
          </React.Fragment>
        ))}
      </DropdownContainer>
    )
  }

  return (
    <Grid singleRow columnGap="small">
      <View
        height={editorMarginMenuItemHeight}
        width={editorMarginMenuItemHeight}
        justifyContent="center"
      >
        <BaseControl
          onClick={onShowActions}
          data-test-block-menu="open"
          aria-haspopup="true"
          hoverColor="background.2"
          activeColor="primary.2"
          borderRadius="round"
          alignItems="center"
        >
          <Icon sizeVariant="medium" color="text.2">
            <AddSvg />
          </Icon>
        </BaseControl>
      </View>
      <View justifyContent="center" height={editorMarginMenuItemHeight}>
        {showMenu && (
          <BlockMenuActions
            unmount={
              () => null
              //   dispatchEditor(onShowMenuActions(false, editableState))
            }
            menuItems={menuItems}
            showMenu={showMenu}
          />
        )}
      </View>
    </Grid>
  )
}

export default BlockMenu
