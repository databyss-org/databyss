import React, { useState, useEffect } from 'react'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { View, TextInput } from '@databyss-org/ui/primitives'
import { theme } from '@databyss-org/ui/theming'
import styledCss from '@styled-system/css'

const noPageTitle = 'untitled'

const PageHeader = ({ isFocused, pageId }) => {
  const getPage = usePageContext(c => c.getPage)
  const setPageHeader = usePageContext(c => c.setPageHeader)

  const [pageName, setPageName] = useState({ textValue: '' })

  useEffect(
    () => {
      const pageData = getPage(pageId)
      const pageDataName = pageData.name

      if (pageDataName === noPageTitle) {
        setPageName({ textValue: '' })
      } else {
        setPageName({ textValue: pageDataName })
      }
    },
    [pageId]
  )

  const onPageNameChange = val => {
    setPageName(val)
  }

  const updatePageName = () => {
    const _pageData = {
      name: pageName.textValue ? pageName.textValue : noPageTitle,
      _id: pageId,
    }
    setPageHeader(_pageData)
    isFocused(false)
  }
  /*
  alphabatize pages
  */

  return (
    <View p="medium" flexGrow={1} ml="extraSmall">
      <TextInput
        data-test-element="page-header"
        onBlur={updatePageName}
        onFocus={() => isFocused(true)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            updatePageName()
          }
        }}
        value={pageName}
        onChange={onPageNameChange}
        placeholder="untitled"
        variant="bodyLarge"
        color="text.3"
        concatCss={styledCss({
          '::placeholder': {
            color: 'text.3',
            opacity: 0.6,
          },
        })(theme)}
      />
    </View>
  )
}

export default PageHeader
