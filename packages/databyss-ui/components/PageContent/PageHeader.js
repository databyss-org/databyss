import React, { useState, useEffect } from 'react'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { View, TextInput } from '@databyss-org/ui/primitives'

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

  const updatePageName = () => {
    const _pageData = {
      page: { name: pageName.textValue, _id: pageId },
    }
    setPage(_pageData)
    isFocused(false)
  }
  /*
  alphabatize pages
  */

  return (
    <View p="medium" flexGrow={1} ml="extraSmall">
      <TextInput
        onBlur={updatePageName}
        onFocus={() => isFocused(true)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            updatePageName()
          }
        }}
        value={pageName}
        onChange={onPageNameChange}
        placeholder="Enter title"
        variant="bodyLarge"
        color="text.3"
      />
    </View>
  )
}

export default PageHeader
