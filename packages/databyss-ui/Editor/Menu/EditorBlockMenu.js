import React, { useEffect } from 'react'
import buttons, {
  editorMarginMenuItemHeight,
} from '@databyss-org/ui/theming/buttons'
import { View, Button, Icon, Grid } from '@databyss-org/ui/primitives'
import Close from '@databyss-org/ui/assets/close-menu.svg'
import Add from '@databyss-org/ui/assets/add.svg'
import EditorBlockMenuActions from './EditorBlockMenuActions'
import { useEditorContext } from '../EditorProvider'
import { startTag, onShowMenuActions } from '../state/page/actions'

const EditorBlockMenu = ({ node, hideCursor }) => {
  const [editorState, dispatchEditor] = useEditorContext()
  const { activeBlockId, showMenuActions, editableState } = editorState
  let isVisible = false
  if (node.key === activeBlockId) {
    isVisible = true
  }

  const { buttonVariants } = buttons

  const onShowActions = () => {
    dispatchEditor(onShowMenuActions(!showMenuActions, editableState))
  }

  const onMenuAction = tag => {
    dispatchEditor(onShowMenuActions(false, editableState))
    dispatchEditor(startTag(tag, editableState))
  }

  useEffect(
    () => {
      if (showMenuActions) {
        hideCursor(true)
      } else {
        hideCursor(false)
      }
    },
    [showMenuActions]
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
            <View>{showMenuActions ? <Close /> : <Add />}</View>
          </Icon>
        </Button>
      </View>
      <View justifyContent="center" height={editorMarginMenuItemHeight}>
        {showMenuActions && (
          <EditorBlockMenuActions
            unmount={() =>
              dispatchEditor(onShowMenuActions(false, editableState))
            }
            menuActionButtons={menuActionButtons}
          />
        )}
      </View>
    </Grid>
  ) : null
}

export default EditorBlockMenu
