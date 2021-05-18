import React, { useEffect, useState } from 'react'
import { Transforms, Text } from '@databyss-org/slate'
import { useEditor, ReactEditor } from '@databyss-org/slate-react'
import { menuLauncherSize } from '@databyss-org/ui/theming/buttons'
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
import { useEditorContext } from '../state/EditorProvider'
import { stateSelectionToSlateSelection } from '../lib/slateUtils'
import { getOpenAtomics } from '../state/util'

const BlockMenu = ({ element }) => {
  const [showMenu, setShowMenu] = useState(false)
  const editor = useEditor()

  const editorContext = useEditorContext()

  const onShowActions = () => {
    setShowMenu(!showMenu)
  }

  const handleEscKey = (e) => {
    if (e.key === 'Escape') {
      setShowMenu(false)
    }
  }

  const actions = (type) =>
    ({
      END_SOURCE: () => editor.insertText('/@'),
      END_TOPIC: () => editor.insertText('/#'),
      SOURCE: () => editor.insertText('@'),
      TOPIC: () => editor.insertText('#'),
      LOCATION: () => {
        Transforms.setNodes(
          editor,
          { location: true, type: 'location' },
          { match: (n) => Text.isText(n), split: true }
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
    console.log('BLOCK MENU', _slateSelection)

    // selection needs to be reset because editor could loose focus
    Transforms.select(editor, _slateSelection)
    ReactEditor.focus(editor)

    e.preventDefault()
    actions(tag)()
    setShowMenu(false)
  }

  // only display closure items that are currently open
  let _closureItems = [
    {
      action: 'END_SOURCE',
      textSymbol: '/@',
      shortcut: '',
      label: 'End source',
      closureType: 'SOURCE',
    },
    {
      action: 'END_TOPIC',
      textSymbol: '/#',
      shortcut: '',
      label: 'End topic',
      closureType: 'TOPIC',
    },
  ]

  if (editorContext) {
    // filter out items not currently open
    const _openAtomics = getOpenAtomics(editorContext.state)
    _closureItems = _closureItems.filter(
      (i) => _openAtomics.findIndex((j) => j.type === i.closureType) > -1
    )
  }

  const menuItems = [
    ..._closureItems,
    {
      action: 'TOPIC',
      textSymbol: '#',
      label: 'Topic',
    },
    {
      action: 'SOURCE',
      textSymbol: '@',
      label: 'Source',
    },
    {
      action: 'LOCATION',
      textSymbol: '%',
      label: 'Location',
    },
  ]

  const BlockMenuActions = ({ menuItems, unmount, showMenu }) => {
    useEffect(() => () => unmount(), [])

    return (
      <DropdownContainer
        position={{
          top: menuLauncherSize,
          left: menuLauncherSize,
        }}
        open={showMenu}
        widthVariant="dropdownMenuSmall"
      >
        {menuItems.map((menuItem, i) => (
          <React.Fragment key={menuItem.action}>
            <DropdownListItem
              {...menuItem}
              onPress={(e) => onMenuAction(e, menuItem.action)}
              onKeyDown={handleEscKey}
            />
            {_closureItems.length && _closureItems.length - 1 === i ? (
              <Separator color="border.3" spacing="extraSmall" />
            ) : null}
          </React.Fragment>
        ))}
      </DropdownContainer>
    )
  }

  return (
    <Grid singleRow columnGap="small">
      <View
        height={menuLauncherSize}
        width={menuLauncherSize}
        justifyContent="center"
      >
        <BaseControl
          onPress={onShowActions}
          onKeyDown={handleEscKey}
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
      <View justifyContent="center" height={menuLauncherSize}>
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
