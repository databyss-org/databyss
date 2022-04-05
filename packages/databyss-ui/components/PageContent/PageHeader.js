import React, { useState, useEffect, forwardRef } from 'react'
import { useEditorPageContext } from '@databyss-org/services'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import { dbRef } from '@databyss-org/data/pouchdb/db'
import { isMobile } from '../../lib/mediaQuery'
import { TitleInput } from './TitleInput'

const noPageTitle = 'untitled'

const PageHeader = forwardRef(({ pageId, onNavigateDownFromHeader }, ref) => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const setPageHeader = useEditorPageContext((c) => c.setPageHeader)
  const pagesRes = usePages()
  const page = pagesRes.data?.[pageId]

  const [pageName, setPageName] = useState('')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    // if text field is focused, do not allow name update from external sources
    if (!focused) {
      setPageName(pagesRes.data?.[pageId]?.name)
    }
  }, [pagesRes.data?.[pageId]])

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
    } else if (!pageName?.length) {
      // only set page name on initial mount
      setPageName(pageDataName)
    }
  }, [pageId, pagesRes.isSuccess])

  const onPageNameChange = (val) => {
    setPageName(val)
    const _pageData = {
      name: val || noPageTitle,
      _id: pageId,
    }
    setPageHeader(_pageData)
  }

  if (!pagesRes.isSuccess) {
    return null
  }

  return (
    <TitleInput
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      readonly={
        dbRef.readOnly || isPublicAccount() || isMobile() || page.archive
      }
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
      ml={process.env.FORCE_MOBILE ? 'none' : 'medium'}
      mb={!process.env.FORCE_MOBILE ? 'em' : 'none'}
      mt={process.env.FORCE_MOBILE ? 'em' : 'none'}
    />
  )
})

export default PageHeader
