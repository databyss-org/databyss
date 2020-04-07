import React, { useState, useEffect, useRef } from 'react'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { Text, View, TextControl } from '@databyss-org/ui/primitives'
import AutoSave from '@databyss-org/ui/editor/AutoSave'
import { PagesLoader } from '@databyss-org/ui/components/Loaders'

const PageHeader = ({ pageId }) => {
  const { getPage, setPage, setPageHeader, getPages } = usePageContext()

  const [pageName, setPageName] = useState({ textValue: '' })
  const pageNameRef = useRef({ textValue: '' })

  useEffect(
    () => {
      const _pageHeaders = getPages()
      //  const _pageHeader = _pageHeaders[pageId]

      console.log(_pageHeaders)
      // setPageName({ textValue: pageData.page.name })
      // pageNameRef.current = { textValue: pageData.page.name }
    },
    [pageId]
  )

  const onPageNameChange = val => {
    setPageName(val)
    pageNameRef.current = val
  }

  const onBlur = () => {
    // const _pageData = {
    //   page: { name: pageName.textValue, _id: pageId },
    // }
    // console.log('here on blur header')
    // setPage(_pageData)
    // //  isFocused(false)
  }

  /*
  header input too long maxwidth 500
  alphabatize pages
  */

  const onSave = () => {
    const _pageData = {
      page: { name: pageNameRef.current.textValue, _id: pageId },
    }
    setPageHeader(_pageData)

    // TODO set page header
  }

  return (
    <PagesLoader>
      {pages => (
        <PageHeaderContent pageHeader={pages[pageId]} pageId={pageId} />
      )}
    </PagesLoader>
    // <AutoSave onSave={onSave}>
    //   <View p="medium">
    //     <Text variant="bodyLarge" color="text.3" maxWidth={pxUnits(500)}>
    //       <TextControl
    //         //  onFocus={() => isFocused(true)}
    //         value={pageName}
    //         onChange={onPageNameChange}
    //         labelVariant="bodyLarge"
    //         inputVariant="bodyLarge"
    //         labelColor="text.3"
    //         activeLabelColor="text.1"
    //       />
    //     </Text>
    //   </View>
    // </AutoSave>
  )
}

const PageHeaderContent = ({ pageHeader }) => {
  const [pageName, setPageName] = useState({ textValue: pageHeader.name })
  const pageNameRef = useRef({ textValue: pageHeader.name })
  const { setPageHeader } = usePageContext()
  // useEffect(
  //   () => {
  //     setPageName({ textValue: pageHeader.name })
  //   },
  //   [pageHeader]
  // )

  const onPageNameChange = val => {
    setPageName(val)
    pageNameRef.current = val
  }

  const onSave = () => {
    const _pageData = {
      page: { name: pageNameRef.current.textValue, _id: pageHeader._id },
    }

    console.log('PAGE DATGA', _pageData)
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
