import React, { useEffect } from 'react'
import { Icon } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import MenuSvg from '@databyss-org/ui/assets/menu_horizontal.svg'
import SaveSvg from '@databyss-org/ui/assets/save.svg'
import { useExportContext } from '@databyss-org/services/export'
import { DropdownMenu } from '../Menu/DropdownMenu'
import { MenuItem } from '../Menu/DropdownList'
import {
  addMenuFooterItems,
  exportMenuItems,
  sourceExportMenuItems,
} from '../../lib/menuItems'
import { PathTokens } from '../Navigation/NavigationProvider/interfaces'

export const PublicGroupMenu = ({ ...others }) => {
  const exportContext = useExportContext()
  const { getTokensFromPath } = useNavigationContext()
  const { setCurrentPageId } = useExportContext()
  const path: PathTokens = getTokensFromPath()

  useEffect(() => {
    if (path.type === 'pages') {
      setCurrentPageId(path.params)
    } else {
      setCurrentPageId(null)
    }
    return () => {
      setCurrentPageId(null)
    }
  }, [path.params])

  const _additionalMenuItems: MenuItem[] = []
  if (path.type === 'pages') {
    _additionalMenuItems.push({
      icon: <SaveSvg />,
      label: 'Export page',
      subLabel: 'Including references',
      action: () => exportContext.exportSinglePage(path.params),
      actionType: 'exportPage',
    })
  }
  if (path.type === 'sources') {
    _additionalMenuItems.push(...sourceExportMenuItems(exportContext, path))
  }

  const menuItems: MenuItem[] = exportMenuItems(
    exportContext,
    _additionalMenuItems
  )

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
