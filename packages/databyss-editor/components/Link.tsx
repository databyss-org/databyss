import React, { useCallback } from 'react'
import { useNavigationContext } from '../../databyss-ui/components/Navigation/NavigationProvider/NavigationProvider'

export const Link = ({ _children, atomicId }) => {
  const { navigate } = useNavigationContext()
  const location = window.location
  // compose external url
  const url = `${location.protocol}//${location.hostname}${
    location.port ? `:${location.port}` : ''
  }/${location.pathname.split('/')[1]}/pages/${atomicId}`

  // internal redirect
  const onNavigation = useCallback(() => {
    // TODO: OPEN IN NEW TAB
    navigate(`/pages/${atomicId}`)
  }, [])

  return (
    <a
      onClick={(e) => {
        if (e.metaKey) {
          window.open(url, '_blank')
        } else {
          onNavigation()
        }
      }}
      // onClick={() => window.open(url, '_blank')}
      style={{
        // color: blue[2],s
        cursor: 'pointer',
      }}
      href={url}
    >
      {_children}
    </a>
  )
}
