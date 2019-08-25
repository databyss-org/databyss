import React from 'react'
import { EditorBlock } from 'draft-js'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { Text, View } from '@databyss-org/ui/primitives'

const styleSelector = type => {
  switch (type) {
    case 'RESOURCE':
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

const DraftBlock = ({ block, ...others }) => (
  <Grid mb="medium" flexWrap="nowrap" columnGap="small">
    <View
      contentEditable="false"
      suppressContentEditableWarning
      css={{ userSelect: 'none' }}
    >
      +
    </View>
    <View>
      <Text
        variant={styleSelector(block.getType()).style}
        color={styleSelector(block.getType()).color}
      >
        <EditorBlock block={block} {...others}>
          {block.getText()}
        </EditorBlock>
      </Text>
    </View>
  </Grid>
)

export default DraftBlock
