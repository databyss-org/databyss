import React from 'react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { BaseControl, Icon } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import TrashSvg from '@databyss-org/ui/assets/trash.svg'

export const ArchiveBin = ({ pages }) => {
  const { getSession } = useSessionContext()
  const { account } = getSession()

  const { getTokensFromPath, navigate } = useNavigationContext()

  const { id } = getTokensFromPath()

  const archivePage = usePageContext(c => c.archivePage)
  const setDefaultPage = usePageContext(c => c.setDefaultPage)

  const canBeArchived = Object.keys(pages).length > 1

  const onClick = () => {
    let redirect = account.defaultPage
    // if default page is archived set new page as default page
    if (account.defaultPage === id) {
      const _pages = pages
      delete _pages[id]
      redirect = Object.keys(_pages)[0]
      setDefaultPage(redirect)
    }
    navigate(`/pages/${redirect}`)
    setTimeout(() => archivePage(id), 50)
  }

  return canBeArchived ? (
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
