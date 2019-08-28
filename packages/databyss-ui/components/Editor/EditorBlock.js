import React from 'react'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { Text, View } from '@databyss-org/ui/primitives'

const styleSelector = type => {
  switch (type) {
    case 'SOURCE':
      return { style: 'bodyNormalUnderline', color: '' }
    case 'LOCATION':
      return { style: 'bodySmall', color: '' }
    case 'HEADER':
      return { style: 'bodyNormalSemibold', color: '' }
    case 'TAG':
      return { style: 'BodySmall', color: 'grey' }
    default:
      return { style: 'bodyNormal', color: '' }
  }
}

const EditorBlock = ({ type, children }) => (
  <Grid mb="medium" flexWrap="nowrap" columnGap="small" alignItems="baseline">
    <View
      contentEditable="false"
      suppressContentEditableWarning
      css={{ userSelect: 'none' }}
    >
      +
    </View>
    <View flexShrink={1}>
      <Text
        variant={styleSelector(type).style}
        color={styleSelector(type).color}
      >
        {children}
      </Text>
    </View>
  </Grid>
)

export default EditorBlock
