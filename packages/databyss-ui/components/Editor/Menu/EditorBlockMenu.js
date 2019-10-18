import React, { useState, useEffect } from 'react'
import buttons, {
  editorMarginMenuItemHeight,
} from '@databyss-org/ui/theming/buttons'
import { View, Button, Icon, Grid } from '@databyss-org/ui/primitives'
import Close from '@databyss-org/ui/assets/close-menu.svg'
import Add from '@databyss-org/ui/assets/add.svg'
import EditorBlockMenuActions from './EditorBlockMenuActions'
import { useEditorContext } from '../EditorProvider'
import { startTag } from '../state/actions'

const EditorBlockMenu = ({ node, hideCursor }) => {
  const [editorState, dispatchEditor] = useEditorContext()
  const [actions, showActions] = useState(false)
  let isVisible = false
  if (node.key === editorState.activeBlockId) {
    isVisible = true
  }

  const { buttonVariants } = buttons

  const onShowActions = () => {
    showActions(!actions)
  }

  const onMenuAction = tag => {
    dispatchEditor(startTag(tag, editorState.editableState))
    showActions(false)
  }

  useEffect(
    () => {
      if (actions) {
        hideCursor(true)
      } else {
        hideCursor(false)
      }
    },
    [actions]
  )

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
      onClick={() => onMenuAction(a.action)}
    >
      {a.label}
    </Button>
  ))

  return isVisible ? (
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
            <View>{actions ? <Close /> : <Add />}</View>
          </Icon>
        </Button>
      </View>
      <View justifyContent="center" height={editorMarginMenuItemHeight}>
        {actions && (
          <EditorBlockMenuActions
            unmount={() => showActions(false)}
            menuActionButtons={menuActionButtons}
          />
        )}
      </View>
    </Grid>
  ) : null
}

export default EditorBlockMenu
