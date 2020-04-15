import React, { useEffect } from 'react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { BaseControl, Icon } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import TrashSvg from '@databyss-org/ui/assets/trash.svg'

export const Trash = () => {
  const { getSession } = useSessionContext()
  const { account } = getSession()

  const { getTokensFromPath, navigate } = useNavigationContext()

  const { id } = getTokensFromPath()

  const { removePage } = usePageContext()
  //   useEffect(() => {
  //     removePage('page')
  //   }, [])

  const onClick = () => {
    if (account.defaultPage !== id) {
      navigate(`/pages/${account.defaultPage}`)
      window.requestAnimationFrame(() => removePage(id))
    } else {
      console.log('default page cant be deleted')
    }
  }

  return (
    <BaseControl onClick={onClick}>
      <Icon sizeVariant="small" color="text.3">
        <TrashSvg />
      </Icon>
    </BaseControl>
  )
}

export default Trash
