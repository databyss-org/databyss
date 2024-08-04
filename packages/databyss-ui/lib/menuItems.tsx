import React from 'react'
import { ExportContextType } from '@databyss-org/services/export/ExportProvider'
import ExportAllSvg from '@databyss-org/ui/assets/export-all.svg'
import DownloadSvg from '@databyss-org/ui/assets/download.svg'
import { version } from '@databyss-org/services'
import HelpSvg from '@databyss-org/ui/assets/help.svg'
import SaveSvg from '@databyss-org/ui/assets/save.svg'
import { MenuItem } from '../components/Menu/DropdownList'
import { PathTokens } from '../components/Navigation/NavigationProvider/interfaces'

export const addMenuFooterItems = (menuItems) => {
  if (menuItems.length > 0) {
    menuItems.push({ separator: true })
  }

  menuItems.push({
    icon: <HelpSvg />,
    label: 'Help...',
    href: '/g_7v9n4vjx2h7511',
    target: '_blank',
    actionType: 'help',
    light: true,
    shortcut: `v${version}`,
    // TODO: detect platform and render correct modifier key
    // shortcut: 'Ctrl + Del',
  })
}

export const sourceExportMenuItems = (
  exportContext: ExportContextType,
  path: PathTokens
): MenuItem[] => [
  {
    icon: <SaveSvg />,
    label: path.params ? 'Export Citation' : 'Export Bibliography',
    action: () =>
      exportContext.exportBibliography({
        sourceId: path.params,
        author: path.author,
      }),
    actionType: 'exportBiblio',
  },
]

export const exportMenuItems = (
  exportContext: ExportContextType,
  markdownItems: MenuItem[]
): MenuItem[] => [
  {
    separator: true,
    label: 'Export Markdown',
  },
  ...markdownItems,
  {
    icon: <ExportAllSvg />,
    label: 'Export everything',
    subLabel: 'Download the whole collection',
    action: () => {
      // setShowMenu(false)
      exportContext.exportAllPages()
    },
    actionType: 'exportAll',
  },
  {
    separator: true,
    label: 'Manage Database',
  },
  {
    icon: <DownloadSvg />,
    label: 'Export database',
    subLabel: 'Download a backup of the whole database',
    action: () => {
      // setShowMenu(false)
      exportContext.exportDatabase()
    },
    actionType: 'exportDb',
  },
]
