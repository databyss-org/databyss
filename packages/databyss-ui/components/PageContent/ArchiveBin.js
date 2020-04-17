import React from 'react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { BaseControl, Icon } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import TrashSvg from '@databyss-org/ui/assets/trash.svg'

export const ArchiveBin = () => {
  const { getSession } = useSessionContext()
  const { account } = getSession()

  const { getTokensFromPath, navigate } = useNavigationContext()

  const { id } = getTokensFromPath()

  const { archivePage } = usePageContext()

  const onClick = () => {
    navigate(`/pages/${account.defaultPage}`)
    window.requestAnimationFrame(() => archivePage(id))
  }

  return account.defaultPage !== id ? (
    <BaseControl
      onClick={onClick}
      hoverColor="background.2"
      p="tiny"
      title="Archive Page"
    >
      <Icon sizeVariant="small" color="text.3">
        <TrashSvg />
      </Icon>
    </BaseControl>
  ) : null
}
