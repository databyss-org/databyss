import React, { useEffect, useState } from 'react'
import { Transforms, Text } from '@databyss-org/slate'
import { useEditor, ReactEditor } from 'slate-react'
import buttons, {
  editorMarginMenuItemHeight,
} from '@databyss-org/ui/theming/buttons'
import { View, Button, Icon, Grid } from '@databyss-org/ui/primitives'
import Close from '@databyss-org/ui/assets/close-menu.svg'
import AddSvg from '@databyss-org/ui/assets/add.svg'
import { stateSelectionToSlateSelection } from '../lib/slateUtils'

const BlockMenuActions = ({ menuActionButtons, unmount }) => {
  useEffect(() => () => unmount(), [])
  return (
    <Grid singleRow columnGap="tiny">
      {menuActionButtons}
    </Grid>
  )
}

const BlockMenu = ({ element }) => {
  const [showMenuActions, setShowMenuActions] = useState(false)
  const editor = useEditor()

  const { buttonVariants } = buttons

  const onShowActions = () => {
    setShowMenuActions(!showMenuActions)
  }

  const actions = type =>
    ({
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
    setShowMenuActions(false)
  }

  const menuActions = [
    {
      action: 'SOURCE',
      label: '@ source',
    },
    {
      action: 'TOPIC',
      label: '# topic',
    },
    {
      action: 'LOCATION',
      label: 'location',
    },
  ]

  const menuActionButtons = menuActions.map((a, i) => (
    <Button
      variant="editorMarginMenuItem"
      data-test-block-menu={a.action}
      key={i}
      onMouseDown={e => onMenuAction(e, a.action)}
    >
      {a.label}
    </Button>
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
        >
          <Icon
            sizeVariant="tiny"
            color={buttonVariants.editorMarginMenu.color}
          >
            <View>{showMenuActions ? <Close /> : <AddSvg />}</View>
          </Icon>
        </Button>
      </View>
      <View justifyContent="center" height={editorMarginMenuItemHeight}>
        {showMenuActions && (
          <BlockMenuActions
            unmount={
              () => null
              //   dispatchEditor(onShowMenuActions(false, editableState))
            }
            menuActionButtons={menuActionButtons}
          />
        )}
      </View>
    </Grid>
  )
}

export default BlockMenu
