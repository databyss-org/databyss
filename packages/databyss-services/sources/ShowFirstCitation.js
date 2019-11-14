import React from 'react'

import { Text } from '@databyss-org/ui/primitives'
import { withSource } from './SourcesProvider'

const ShowFirstCitation = ({ source }) => (
  <Text>{source.citations[0].textValue}</Text>
)

export default withSource(ShowFirstCitation)
