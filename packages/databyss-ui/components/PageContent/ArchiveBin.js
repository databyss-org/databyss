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

  const canBeArchived = Object.values(pages).filter(p => !p.archive).length > 1

  const onClick = () => {
    archivePage(id).then(() => {
      // if default page is archived set new page as default page
      let redirect = account.defaultPage
      if (account.defaultPage === id) {
        redirect = Object.keys(pages).find(_id => _id !== id)
        setDefaultPage(redirect)
      }
      navigate(`/pages/${redirect}`)
    })
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
