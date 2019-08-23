import React from 'react'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { View, Text } from '@databyss-org/ui/primitives'

const Block = ({ block, ...others }) => {
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

  return (
    <pre>
      <Grid mb={3} flexWrap="nowrap" columnGap="small" height={30} {...others}>
        <Text
          variant={styleSelector(block.type).style}
          color={styleSelector(block.type).color}
        >
          <View flexShrink={1} id={block._id} data-byss-block>
            {block.rawText}
          </View>
        </Text>
      </Grid>
    </pre>
  )
}

export default Block
