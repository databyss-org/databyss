import React, { useState, useEffect } from 'react'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { Text, View, TextControl } from '@databyss-org/ui/primitives'

const PageHeader = ({ isFocused, pageId }) => {
  const { getPage, setPage } = usePageContext()

  const [pageName, setPageName] = useState({ textValue: '' })

  useEffect(
    () => {
      const pageData = getPage(pageId)
      setPageName({ textValue: pageData.page.name })
    },
    [pageId]
  )

  const onPageNameChange = val => {
    setPageName(val)
  }

  const onBlur = () => {
    const _pageData = {
      page: { name: pageName.textValue, _id: pageId },
    }
    setPage(_pageData)
    isFocused(false)
  }
  /*
  header input too long maxwidth 500
  alphabatize pages
  */

  return (
    <View p="medium">
      <Text
        variant="bodyLarge"
        id="headerstuff"
        color="text.3"
        maxWidth={pxUnits(500)}
      >
        <TextControl
          onBlur={onBlur}
          onFocus={() => isFocused(true)}
          value={pageName}
          onChange={onPageNameChange}
          labelVariant="bodyLarge"
          inputVariant="bodyLarge"
          labelColor="text.3"
          activeLabelColor="text.1"
        />
      </Text>
    </View>
  )
}

export default PageHeader
