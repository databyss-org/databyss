import React, { useEffect } from 'react'
import { Icon } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import MenuSvg from '@databyss-org/ui/assets/menu_horizontal.svg'
import SaveSvg from '@databyss-org/ui/assets/save.svg'
import { useExportContext } from '@databyss-org/services/export'
import { DropdownMenu } from '../Menu/DropdownMenu'
import { MenuItem } from '../Menu/DropdownList'
import { addMenuFooterItems, exportMenuItems } from '../../lib/menuItems'

export const PublicGroupMenu = ({ ...others }) => {
  const exportContext = useExportContext()

  const { getTokensFromPath } = useNavigationContext()

  const { params } = getTokensFromPath()

  const { setCurrentPageId } = useExportContext()

  useEffect(() => {
    setCurrentPageId(params)
    return () => {
      setCurrentPageId(null)
    }
  }, [params])

  const menuItems: MenuItem[] = exportMenuItems(exportContext, [
    {
      icon: <SaveSvg />,
      label: 'Export page',
      subLabel: 'Including references',
      action: () => exportContext.exportSinglePage(params),
      actionType: 'exportPage',
    },
  ])

  addMenuFooterItems(menuItems)

  return (
    <DropdownMenu
      menuIcon={
        <Icon sizeVariant="medium" color="text.2">
          <MenuSvg />
        </Icon>
      }
      menuItems={menuItems}
      hoverColor="background.2"
      {...others}
    />
  )
}
