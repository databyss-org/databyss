import React, { useState } from 'react'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import buttons from '@databyss-org/ui/theming/buttons'
import space from '@databyss-org/ui/theming/space'

import {
  View,
  MenuTagButton,
  SidebarButton,
  Icon,
} from '@databyss-org/ui/primitives'
import Close from '@databyss-org/ui/assets/close-menu.svg'
import Add from '@databyss-org/ui/assets/add.svg'
import { useEditorContext } from '../EditorProvider'
import { addTag } from '../state/actions'

const LabeledIcon = ({ label, sizeVariant, children, color, ...others }) => (
  <View alignItems="center" justifyContent="center" {...others}>
    <Icon sizeVariant={sizeVariant} color={color} flexGrow={1}>
      {children}
    </Icon>
  </View>
)

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
    dispatchEditor(addTag(tag, editorState.editableState))
    showActions(false)
  }

  return isVisible ? (
    <Grid m="none" rowGap="small" columnGap="none">
      <View
        height={space.menuHeight}
        width={1 / 10}
        paddingLeft={space.small}
        justifyContent="center"
      >
        <SidebarButton
          variant="sidebarAction"
          onClick={onShowActions}
          data-test-block-menu-opener
        >
          <LabeledIcon
            label="Tiny"
            sizeVariant="tiny"
            color={buttonVariants.sidebarAction.color}
          >
            <View>{actions ? <Close /> : <Add />}</View>
          </LabeledIcon>
        </SidebarButton>
      </View>
      <View
        ml="smallNegative"
        justifyContent="center"
        height={space.menuHeight}
      >
        {actions && (
          <Grid mb="none" rowGap="small" columnGap="small">
            <View>
              <MenuTagButton
                data-test-block-menu-source
                variant="menuAction"
                onClick={() => onMenuAction('SOURCE')}
              >
                @ source
              </MenuTagButton>
            </View>

            <View>
              <MenuTagButton
                data-test-block-menu-topic
                variant="menuAction"
                onClick={() => onMenuAction('TOPIC')}
              >
                # topic
              </MenuTagButton>
            </View>
            <View>
              <MenuTagButton
                data-test-block-menu-location
                variant="menuAction"
                onClick={() => onMenuAction('LOCATION')}
              >
                location
              </MenuTagButton>
            </View>
          </Grid>
        )}
      </View>
    </Grid>
  ) : null
}

export default EditorMenu
