import React, { useState, useEffect, forwardRef, useCallback } from 'react'
import { debounce } from 'lodash'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { View, TextInput } from '@databyss-org/ui/primitives'
import { theme } from '@databyss-org/ui/theming'
import styledCss from '@styled-system/css'
import { isMobile } from '../../lib/mediaQuery'

const noPageTitle = 'untitled'

const PageHeader = forwardRef(({ pageId, onNavigateDownFromHeader }, ref) => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const getPage = usePageContext((c) => c.getPage)
  const setPageHeader = usePageContext((c) => c.setPageHeader)

  const [pageName, setPageName] = useState({ textValue: '' })

  useEffect(() => {
    const pageData = getPage(pageId)
    const pageDataName = pageData.name

    if (pageDataName === noPageTitle) {
      setPageName({ textValue: '' })
      // if no page name is provided, focus on page name
      setTimeout(() => {
        if (ref.current) {
          ref.current.focus()
        }
      }, 10)
    } else {
      setPageName({ textValue: pageDataName })
    }
  }, [pageId])

  const throttledAutosave = useCallback(
    debounce((val) => {
      const _pageData = {
        name: val.textValue ? val.textValue : noPageTitle,
        _id: pageId,
      }
      setPageHeader(_pageData)
    }, process.env.SAVE_PAGE_THROTTLE),
    []
  )

  const onPageNameChange = (val) => {
    setPageName(val)
    throttledAutosave(val)
  }

  return (
    <View
      p={isMobile() ? 'none' : 'medium'}
      flexGrow={0}
      mb={isMobile() ? 'small' : 'none'}
    >
      <TextInput
        readonly={isPublicAccount() || isMobile() || getPage(pageId)?.archive}
        ref={ref}
        data-test-element="page-header"
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            if (onNavigateDownFromHeader) {
              e.preventDefault()
              e.stopPropagation()
              onNavigateDownFromHeader()
            }
          }
        }}
        value={pageName}
        onChange={onPageNameChange}
        placeholder={noPageTitle}
        variant="bodyHeading1"
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
})

export default PageHeader
