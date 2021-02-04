import React, { useState, useEffect, forwardRef, useCallback } from 'react'
import { debounce } from 'lodash'
import { useEditorPageContext } from '@databyss-org/services'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import { isMobile } from '../../lib/mediaQuery'
import { TitleInput } from './TitleInput'

const noPageTitle = 'untitled'

const PageHeader = forwardRef(({ pageId, onNavigateDownFromHeader }, ref) => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const setPageHeader = useEditorPageContext((c) => c.setPageHeader)
  const pagesRes = usePages()
  const page = pagesRes.data?.[pageId]

  const [pageName, setPageName] = useState('')

  useEffect(() => {
    if (!pagesRes.isSuccess) {
      return
    }
    const pageDataName = page.name
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
  }, [pageId, pagesRes])

  const throttledAutosave = useCallback(
    debounce((val) => {
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

  if (!pagesRes.isSuccess) {
    return null
  }

  return (
    <TitleInput
      readonly={isPublicAccount() || isMobile() || page.archive}
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
      ml="medium"
      mb="em"
    />
  )
})

export default PageHeader
