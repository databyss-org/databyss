import React from 'react'

import { pxUnits, widthVariants } from '@databyss-org/ui/theming/views'
import { Text, View, ScrollView } from '@databyss-org/ui/primitives'

import { isMobile } from '../../lib/mediaQuery'
import { sidebar } from '../../theming/components'

const getStyles = () => {
  if (isMobile()) {
    return { width: `calc(100vw - ${sidebar.collapsedWidth}px)` }
  }
  return widthVariants.content
}

const IndexPageContent = ({ title, children }) => (
  <ScrollView p="medium" flex="1" maxHeight="98vh" style={getStyles()}>
    <View py="medium" px={pxUnits(28)}>
      <Text variant="bodyHeading1" color="text.3">
        {title}
      </Text>
    </View>
    {children}
  </ScrollView>
)

export default IndexPageContent
