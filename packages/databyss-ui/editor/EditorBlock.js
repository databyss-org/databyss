import React, { useState, useEffect } from 'react'
import css from '@styled-system/css'
import { isMobileOs } from '@databyss-org/ui/'
import { Text, View, Grid } from '@databyss-org/ui/primitives'
import { editorMarginMenuItemHeight } from '@databyss-org/ui/theming/buttons'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { useEditorContext } from '@databyss-org/ui/editor/EditorProvider'
import { newBlockMenu } from '@databyss-org/ui/editor/state/page/actions'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import EditorBlockMenu from './Menu/EditorBlockMenu'
import { hasSelection } from './slate/slateUtils'

const TextBlock = ({ children, variant, color }) => (
  <Text variant={variant} color={color}>
    {children}
  </Text>
)

const textSelector = ({ children, type }) => {
  const textStyle = type =>
    ({
      SOURCE: { variant: 'bodyHeaderUnderline', color: 'text.0' },
      // WRAP INLINE IN VIEW WITH BOTTOM BORDER
      // TRY CHANGE DISLAY TO INLINE FLEX
      LOCATION: {
        variant: 'bodyNormal',
        color: 'text.0',
        children: (
          <View
            borderBottomWidth={pxUnits(1)}
            borderStyle="dashed"
            borderColor="text.4"
            display="inline"
            borderRadius={0}
          >
            {children}
          </View>
        ),
      },
      TOPIC: {
        variant: 'bodyHeader',
        color: 'text.0',
      },
      TAG: { variant: 'BodySmall', color: 'grey' },
      ENTRY: { variant: 'bodyNormal', color: 'text.0' },
      TEXT: { variant: 'bodyNormal', color: 'text.0' },
    }[type])
  return TextBlock({ children, ...textStyle(type) })
}

export const EditorBlock = ({ children, node }) => {
  const [menuActive, setMenuActive] = useState(false)

  const pageContext = usePageContext()

  const [editorState, dispatchEditor] = useEditorContext()
  const { editableState, showNewBlockMenu, activeBlockId } = editorState

  useEffect(
    () => {
      if (editableState) {
        // disable '+' when editor has selection
        if (hasSelection(editableState.value) && showNewBlockMenu) {
          dispatchEditor(newBlockMenu(false))
          return
        }
        if (
          !hasSelection(editableState.value) &&
          activeBlockId === node.key &&
          node.text.length === 0 &&
          !showNewBlockMenu
        ) {
          dispatchEditor(newBlockMenu(true))
        }
        if (
          showNewBlockMenu &&
          activeBlockId === node.key &&
          node.text.length !== 0
        ) {
          dispatchEditor(newBlockMenu(false))
        }
      }
    },
    [node.text, activeBlockId]
  )

  const _children = (
    <View
      ref={ref =>
        pageContext &&
        !pageContext.getBlockRef(node.key) &&
        pageContext.registerBlockRef(node.key, ref)
      }
      flexShrink={1}
      overflow="visible"
      justifyContent="center"
      css={css({
        caretColor: menuActive && node.text.length === 0 && 'transparent',
      })}
    >
      {textSelector({ children, type: node.type })}
    </View>
  )

  return !isMobileOs() ? (
    <Grid
      singleRow
      mb="small"
      flexWrap="nowrap"
      columnGap="small"
      position="relative"
    >
      <View
        contentEditable="false"
        suppressContentEditableWarning
        css={{ userSelect: 'none' }}
        width={editorMarginMenuItemHeight}
        height={editorMarginMenuItemHeight}
        overflow="visible"
      >
        {showNewBlockMenu && (
          <EditorBlockMenu
            hideCursor={bool => setMenuActive(bool)}
            node={node}
          />
        )}
      </View>
      {_children}
    </Grid>
  ) : (
    <View mb="small">{_children}</View>
  )
}

export const renderBlock = ({ node, children }) => (
  <EditorBlock node={node}>{children}</EditorBlock>
)
