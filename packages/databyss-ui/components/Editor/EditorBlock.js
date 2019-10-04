import React from 'react'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { Text, View } from '@databyss-org/ui/primitives'
import EditorMenu from './EditorMenu/EditorMenu'

const styleSelector = type => {
  switch (type) {
    case 'SOURCE':
      return { style: 'bodyNormalUnderline', color: '' }
    case 'LOCATION':
      return { style: 'bodySmall', color: '' }
    case 'TOPIC':
      return { style: 'bodyNormalSemibold', color: '' }
    case 'TAG':
      return { style: 'BodySmall', color: 'grey' }
    default:
      return { style: 'bodyNormal', color: '' }
  }
}

const EditorBlock = ({ children, node }) => (
  // use context editor here
  <Grid mb="medium" flexWrap="nowrap" columnGap="small" alignItems="flex-start">
    <View
      contentEditable="false"
      suppressContentEditableWarning
      css={{ userSelect: 'none' }}
      width={1 / 10}
      overflow="visible"
    >
      <View position="absolute">
        {node.text.length < 1 && <EditorMenu node={node} />}
      </View>
    </View>

    <View flexShrink={1} overflow="visible">
      <Text
        variant={styleSelector(node.type).style}
        color={styleSelector(node.type).color}
      >
        {children}
      </Text>
    </View>
  </Grid>
)

export default EditorBlock
