import React, { useState, useEffect } from 'react'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { View, TextInput } from '@databyss-org/ui/primitives'
import { theme } from '@databyss-org/ui/theming'
import styledCss from '@styled-system/css'

const noPageTitle = 'untitled'

const PageHeader = ({ isFocused, pageId }) => {
  const { getPage, setPage } = usePageContext()
  const [pageName, setPageName] = useState({ textValue: '' })

  useEffect(
    () => {
      const pageData = getPage(pageId)
      const pageDataName = pageData.page.name

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
      page: {
        name: pageName.textValue ? pageName.textValue : noPageTitle,
        _id: pageId,
      },
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
