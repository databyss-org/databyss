import React, { useState, useEffect } from 'react'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import {
  Text,
  View,
  List,
  BaseControl,
  Grid,
  Icon,
  Separator,
  TextControl,
  Button,
} from '@databyss-org/ui/primitives'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'

const PageContent = ({ children }) => {
  const [pageName, setPageName] = useState({ textValue: '' })
  const { session } = useSessionContext()
  const pageId = session.account.defaultPage

  const { getPage } = usePageContext()
  const pageData = getPage(pageId)

  useEffect(
    () => {
      setPageName({ textValue: pageData.page.name })
    },
    [pageData]
  )

  const onPageNameChange = val => {
    setPageName(val)
  }

  // TODO:
  // TEXT CONTROL SHOULD ACCEPT TEXT VARIANT

  return (
    <View p="medium">
      <View p="medium">
        <Text variant="bodyLarge" id="headerstuff" color="text.3">
          {pageName.textValue}
          {/* <TextControl value={pageName} onChange={onPageNameChange} /> */}
        </Text>
      </View>
      <Grid>{children}</Grid>
    </View>
  )
}

export default PageContent
