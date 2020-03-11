import React, { useState, useEffect } from 'react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { Text, View, TextControl } from '@databyss-org/ui/primitives'

const PageHeader = ({ isFocused }) => {
  const { session } = useSessionContext()
  const { getPage, setPage } = usePageContext()

  const pageId = session.account.defaultPage

  const [pageName, setPageName] = useState({ textValue: '' })

  const pageData = getPage(pageId)

  useEffect(() => {
    setPageName({ textValue: pageData.page.name })
  }, [])

  const onPageNameChange = val => {
    setPageName(val)
  }

  const onBlur = () => {
    const _pageData = {
      page: { name: pageName.textValue, _id: pageData.page._id },
    }
    setPage(_pageData)
    isFocused(false)
  }

  return (
    <View p="medium">
      <Text variant="bodyLarge" id="headerstuff" color="text.3">
        {pageName.textValue}
        <TextControl
          onBlur={onBlur}
          onFocus={() => isFocused(true)}
          value={pageName}
          onChange={onPageNameChange}
          labelVariant="bodyLarge"
          labelColor="text.3"
        />
      </Text>
    </View>
  )
}

export default PageHeader
