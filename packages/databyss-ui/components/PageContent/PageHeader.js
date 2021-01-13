import React, { useState, useEffect, forwardRef, useCallback } from 'react'
import { throttle } from 'lodash'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { isMobile } from '../../lib/mediaQuery'
import { TitleInput } from './TitleInput'

const noPageTitle = 'untitled'

const PageHeader = forwardRef(({ pageId, onNavigateDownFromHeader }, ref) => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const getPage = usePageContext((c) => c.getPage)
  const setPageHeader = usePageContext((c) => c.setPageHeader)

  const [pageName, setPageName] = useState('')

  useEffect(() => {
    const pageData = getPage(pageId)
    const pageDataName = pageData.name

    if (pageDataName === noPageTitle) {
      setPageName('')
      // if no page name is provided, focus on page name
      setTimeout(() => {
        if (ref.current) {
          ref.current.focus()
        }
      }, 10)
    } else {
      setPageName(pageDataName)
    }
  }, [pageId])

  const throttledAutosave = useCallback(
    throttle((val) => {
      const _pageData = {
        name: val || noPageTitle,
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
    <TitleInput
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
      mb="em"
    />
  )
})

export default PageHeader
