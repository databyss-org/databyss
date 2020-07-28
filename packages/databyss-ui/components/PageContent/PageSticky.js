import React, { useEffect } from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import { getPagePath } from './_helpers'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'

const PageSticky = ({ page }) => {
  let pageName = ''

  // get page name from headerCache
  const getPages = usePageContext(c => c && c.getPages)

  const pages = getPages()
  if (page) {
    pageName = pages[page.pageHeader._id].name
  }

  return (
    <View pl="medium" ml="extraSmall">
      <Text color="gray.4">
        <div
          dangerouslySetInnerHTML={{ __html: getPagePath(page, pageName) }}
        />
      </Text>
    </View>
  )
}

export default PageSticky
