import React, { useState } from 'react'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import buttons, {
  editorMarginMenuItemHeight,
} from '@databyss-org/ui/theming/buttons'
import space from '@databyss-org/ui/theming/space'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { View, Button, Icon } from '@databyss-org/ui/primitives'
import Close from '@databyss-org/ui/assets/close-menu.svg'
import Add from '@databyss-org/ui/assets/add.svg'

import { useEditorContext } from '../EditorProvider'
import { startTag } from '../state/actions'

const EditorBlockMenu = ({ node }) => {
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
          <Grid singleRow columnGap="tiny">
            {menuActionButtons}
          </Grid>
        )}
      </View>
    </Grid>
  ) : null
}

export default EditorBlockMenu
