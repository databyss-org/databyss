import React, { useState, useEffect, useRef } from 'react'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { Text, View, TextControl } from '@databyss-org/ui/primitives'
import AutoSave from '@databyss-org/ui/editor/AutoSave'
import { PagesLoader } from '@databyss-org/ui/components/Loaders'

const PageHeader = ({ pageId }) => {
  return (
    <PagesLoader>
      {pages => <PageHeaderContent pageHeader={pages[pageId]} />}
    </PagesLoader>
  )
}

const PageHeaderContent = ({ pageHeader }) => {
  const [pageName, setPageName] = useState({ textValue: pageHeader.name })
  const pageNameRef = useRef({ textValue: pageHeader.name })
  const { setPageHeader } = usePageContext()

  const onPageNameChange = val => {
    setPageName(val)
    pageNameRef.current = val
  }

  const onSave = () => {
    const _pageData = {
      page: { name: pageNameRef.current.textValue, _id: pageHeader._id },
    }
    setPageHeader(_pageData)
  }

  return (
    <AutoSave onSave={onSave}>
      <View p="medium">
        <Text variant="bodyLarge" color="text.3" maxWidth={pxUnits(500)}>
          <TextControl
            value={pageName}
            onChange={onPageNameChange}
            labelVariant="bodyLarge"
            inputVariant="bodyLarge"
            labelColor="text.3"
            activeLabelColor="text.1"
          />
        </Text>
      </View>
    </AutoSave>
  )
}

export default PageHeader
