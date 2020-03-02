import React, { useEffect, useState } from 'react'
import { Transforms, Editor, Text, Node } from 'slate'
import { useEditor, ReactEditor } from 'slate-react'

import buttons, {
  editorMarginMenuItemHeight,
} from '@databyss-org/ui/theming/buttons'
import { View, Button, Icon, Grid } from '@databyss-org/ui/primitives'
import Close from '@databyss-org/ui/assets/close-menu.svg'
import AddSvg from '@databyss-org/ui/assets/add.svg'

const BlockMenuActions = ({ menuActionButtons, unmount }) => {
  useEffect(() => () => unmount(), [])
  return (
    <Grid singleRow columnGap="tiny">
      {menuActionButtons}
    </Grid>
  )
}

const BlockMenu = ({ showButton }) => {
  const [showMenuActions, setShowMenuActions] = useState(false)
  const editor = useEditor()

  const { buttonVariants } = buttons

  const onShowActions = () => {
    setShowMenuActions(!showMenuActions)
  }

  const onMenuAction = (tag, e) => {
    e.preventDefault()
    setShowMenuActions(false)
    actions(tag)()
  }

  const actions = type =>
    ({
      SOURCE: () => editor.insertText('@'),
      TOPIC: () => editor.insertText('#'),
      LOCATION: () =>
        Transforms.setNodes(
          editor,
          { location: true, type: 'location' },
          { match: n => Text.isText(n), split: true }
        ),
    }[type])

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
      onMouseDown={e => onMenuAction(a.action, e)}
    >
      {a.label}
    </Button>
  ))

  return showButton ? (
    <Grid singleRow columnGap="small" position="absolute">
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
  ) : null
}

export default BlockMenu
