import React, { useState } from 'react'
import css from '@styled-system/css'

import { Text, View } from '@databyss-org/ui/primitives'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { editorMarginMenuItemHeight } from '@databyss-org/ui/theming/buttons'

import { pxUnits } from '@databyss-org/ui/theming/views'

import EditorBlockMenu from './Menu/EditorBlockMenu'

const TextBlock = ({ children, variant, color }) => (
  <Text
    onBlur={() => console.log('is blurred')}
    onFocus={() => console.log('is focused')}
    variant={variant}
    color={color}
  >
    {children}
  </Text>
)

const textSelector = ({ children, type }) => {
  const textStyle = type =>
    ({
      SOURCE: { variant: 'bodyNormalUnderline', color: 'text.0' },
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
        variant: 'bodyNormalSemibold',
        color: 'text.0',
      },
      TAG: { variant: 'BodySmall', color: 'grey' },
      ENTRY: { variant: 'bodyNormal', color: 'text.0' },
    }[type])
  return TextBlock({ children, ...textStyle(type) })
}

const EditorBlock = ({ children, node }) => {
  const [menuActive, setMenuActive] = useState(false)

  return (
    <Grid singleRow mb="tiny" flexWrap="nowrap" columnGap="small">
      <View
        contentEditable="false"
        suppressContentEditableWarning
        css={{ userSelect: 'none' }}
        width={editorMarginMenuItemHeight}
        height={editorMarginMenuItemHeight}
        overflow="visible"
      >
        {node.text.length < 1 && (
          <EditorBlockMenu
            hideCursor={bool => setMenuActive(bool)}
            node={node}
          />
        )}
      </View>
      <View
        flexShrink={1}
        overflow="visible"
        justifyContent="center"
        css={css({ caretColor: menuActive && 'transparent' })}
      >
        {textSelector({ children, type: node.type })}
      </View>
    </Grid>
  )
}

export default EditorBlock
