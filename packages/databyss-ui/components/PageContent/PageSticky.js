import React, { useEffect } from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import { getPagePath } from './_helpers'

const PageSticky = ({ page }) => {
  // TODO: get page header from page cache
  return (
    <View pl="medium" ml="extraSmall">
      <Text color="gray.4">
        <div dangerouslySetInnerHTML={{ __html: getPagePath(page) }} />
      </Text>
    </View>
  )
}

export default PageSticky
