import React, { useState, useEffect } from 'react'

import { View, Text, Grid } from '@databyss-org/ui/primitives'
import { withSource } from './SourcesProvider'
import { Section } from '@databyss-org/ui/stories/System'

const ShowFirstCitation = ({ source }) => {
  return source ? (
    <Text>{source.citations[0].textValue}</Text>
  ) : (
    <View>none</View>
  )
}
export default withSource(ShowFirstCitation)
