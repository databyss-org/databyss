import React, { useState } from 'react'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import buttons from '@databyss-org/ui/theming/buttons'
import space from '@databyss-org/ui/theming/space'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { View, Button, Icon } from '@databyss-org/ui/primitives'
import Close from '@databyss-org/ui/assets/close-menu.svg'
import Add from '@databyss-org/ui/assets/add.svg'
import { useEditorContext } from '../EditorProvider'
import { startTag } from '../state/actions'

const EditorMenu = ({ node }) => {
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
      ACTION: 'SOURCE',
      label: '@ source',
      testLabel: 'source',
    },
    {
      ACTION: 'TOPIC',
      label: '# topic',
      testLabel: 'topic',
    },
    {
      ACTION: 'LOCATION',
      label: 'location',
      testLabel: 'location',
    },
  ]

  const menuActionButtons = menuActions.map((a, i) => (
    <Button
      variant="menuAction"
      data-test-block-menu={a.testLabel}
      key={i}
      onClick={() => onMenuAction(a.ACTION)}
    >
      {a.label}
    </Button>
  ))

  return isVisible ? (
    <Grid singleRow rowGap="small" columnGap="none">
      <View
        height={space.menuHeight}
        width={pxUnits(32)}
        paddingLeft={space.small}
        justifyContent="center"
      >
        <Button
          variant="sidebarAction"
          onClick={onShowActions}
          data-test-block-menu="open"
        >
          <Icon
            label="Tiny"
            sizeVariant="tiny"
            color={buttonVariants.sidebarAction.color}
          >
            <View>{actions ? <Close /> : <Add />}</View>
          </Icon>
        </Button>
      </View>
      <View ml={pxUnits(8)} justifyContent="center" height={space.menuHeight}>
        {actions && (
          <Grid mb="none" rowGap="small" columnGap="small">
            {menuActionButtons}
          </Grid>
        )}
      </View>
    </Grid>
  ) : null
}

export default EditorMenu
