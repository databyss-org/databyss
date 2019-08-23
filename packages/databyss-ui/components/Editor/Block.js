import React from 'react'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { Text } from '@databyss-org/ui/primitives'

const Block = ({ block, ...others }) => (
  <Grid mb={3} flexWrap="nowrap" columnGap="small" height={30} {...others}>
    <Text id={block._id} data-byss-block>
      {block.rawText}
    </Text>
  </Grid>
)

export default Block
