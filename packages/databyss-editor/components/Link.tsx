import React, { useCallback } from 'react'
import colors from '@databyss-org/ui/theming/colors'
import { urlSafeName, validUriRegex } from '@databyss-org/services/lib/util'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { EM } from '@databyss-org/data/pouchdb/utils'

const { blue, purple } = colors

export const Link = ({ _children, atomicId, readOnly, text }) => {
  const { navigate } = useNavigationContext()
  const location = window.location
  // compose external url
  const _regex = new RegExp(validUriRegex, 'gi')
  const isAtomicIdUrl = _regex.test(atomicId)
  let _nice = ''
  if (text) {
    _nice = `/${urlSafeName(text)}`
  }

  // compose external url
  const url = isAtomicIdUrl
    ? atomicId
    : `${location.protocol}//${location.hostname}${
        location.port ? `:${location.port}` : ''
      }/${location.pathname.split('/')[1]}/pages/${atomicId}${_nice}`

  // internal redirect
  const onNavigation = useCallback(() => {
    // save changes before switching pages
    EM?.process()
    requestAnimationFrame(() => {
      navigate(`/pages/${atomicId}${_nice}`)
    })
  }, [])

  return (
    <a
      onClick={(e) => {
        if (readOnly) {
          e.preventDefault()
        }
        if (e.metaKey || isAtomicIdUrl) {
          window.open(url, '_blank')
        } else {
          onNavigation()
        }
      }}
      style={{
        color: isAtomicIdUrl ? blue[2] : purple[1],
        cursor: 'pointer',
      }}
      href={url}
    >
      {_children}
    </a>
  )
}
