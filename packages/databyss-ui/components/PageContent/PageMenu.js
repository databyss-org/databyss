import React, { useState, useEffect, useCallback } from 'react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useEditorPageContext } from '@databyss-org/services'
import { BaseControl, Icon, View } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import ArchiveSvg from '@databyss-org/ui/assets/archive.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import TrashSvg from '@databyss-org/ui/assets/trash.svg'
import MenuSvg from '@databyss-org/ui/assets/menu_horizontal.svg'
import ShareSvg from '@databyss-org/ui/assets/share.svg'
import DropdownContainer from '@databyss-org/ui/components/Menu/DropdownContainer'
import ClickAwayListener from '@databyss-org/ui/components/Util/ClickAwayListener'
import { menuLauncherSize } from '@databyss-org/ui/theming/buttons'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import { useExportContext } from '@databyss-org/services/export'
import LoadingFallback from '../Notify/LoadingFallback'
import { DropdownList } from '../Menu/DropdownList'
import { addMenuFooterItems } from '../../lib/menuItems'

export function copyToClipboard(text) {
  const dummy = document.createElement('textarea')
  // to avoid breaking orgain page when copying more words
  // cant copy when adding below this code
  // dummy.style.display = 'none'
  document.body.appendChild(dummy)
  // Be careful if you use texarea. setAttribute('value', value), which works with "input" does not work with "textarea". – Eduard
  dummy.value = text
  dummy.select()
  document.execCommand('copy')
  document.body.removeChild(dummy)
}

const PageMenu = React.memo(() => {
  const pagesRes = usePages()
  const showModal = useNavigationContext((c) => c && c.showModal)
  const isReadOnly = useSessionContext((c) => c && c.isReadOnly)
  const navigateToDefaultPage = useSessionContext(
    (c) => c && c.navigateToDefaultPage
  )
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)

  const pages = pagesRes.data

  const [showMenu, setShowMenu] = useState(false)

  const { getTokensFromPath, navigateSidebar } = useNavigationContext()

  const { params } = getTokensFromPath()

  const archivePage = useEditorPageContext((c) => c.archivePage)
  const deletePage = useEditorPageContext((c) => c.deletePage)
  const { setCurrentPageId } = useExportContext()

  useEffect(() => {
    setCurrentPageId(params)
    return () => {
      setCurrentPageId(null)
    }
  }, [])

  const canBeArchived =
    Object.values(pages).filter((p) => !p.archive).length > 1

  const onArchivePress = useCallback(
    (bool) => {
      archivePage(params, bool).then(() => {
        if (bool) {
          navigateToDefaultPage()
        } else {
          navigateSidebar('/pages')
        }
      })
    },
    [archivePage, navigateToDefaultPage, navigateSidebar]
  )

  const handleEscKey = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        setShowMenu(false)
      }
    },
    [setShowMenu]
  )

  const _page = pages?.[params]

  const onPageDelete = useCallback(() => {
    deletePage(params)
    navigateToDefaultPage()
    navigateSidebar('/pages')
  }, [deletePage, navigateToDefaultPage, navigateSidebar])

  const showExportModal = useCallback(() => {
    showModal({
      component: 'EXPORTDB',
      visible: true,
    })
  }, [showModal])

  const menuItems = []

  if (!isPublicAccount()) {
    if (canBeArchived && !_page.archive) {
      menuItems.push({
        icon: <ArchiveSvg />,
        label: 'Archive',
        action: () => onArchivePress(true),
        actionType: 'archive',
        disabled: isReadOnly,
      })
    }

    if (_page?.archive) {
      // add restore option
      menuItems.push({
        icon: <PageSvg />,
        label: 'Restore Page',
        action: () => onArchivePress(false),
        actionType: 'restore',
        disabled: isReadOnly,
      })
      // add delete option
      menuItems.push({
        icon: <TrashSvg />,
        label: 'Delete page forever',
        action: () => onPageDelete(),
        actionType: 'delete',
        disabled: isReadOnly,
      })
    }
  }

  menuItems.push({
    icon: <ShareSvg />,
    label: 'Export…',
    action: showExportModal,
    actionType: 'export',
  })

  addMenuFooterItems(menuItems)

  if (!pagesRes.isSuccess) {
    return <LoadingFallback size="extraTiny" queryObserver={pagesRes} />
  }

  return (
    <View
      position="relative"
      height={menuLauncherSize}
      width={menuLauncherSize}
      alignItems="center"
      justifyContent="center"
    >
      <BaseControl
        onPress={() => setShowMenu(!showMenu)}
        // draggable={{
        //   payload: _page,
        //   type: 'PAGE',
        // }}
        onKeyDown={handleEscKey}
        hoverColor="background.1"
        p="tiny"
        data-test-element="archive-dropdown"
        label="Archive Page"
      >
        <Icon sizeVariant="medium" color="text.2">
          <MenuSvg />
        </Icon>
      </BaseControl>
      {showMenu && (
        <ClickAwayListener onClickAway={() => setShowMenu(false)}>
          <DropdownContainer
            widthVariant="dropdownMenuMedium"
            open={showMenu}
            position={{
              top: menuLauncherSize + 8,
              right: 0,
            }}
          >
            <DropdownList menuItems={menuItems} />
          </DropdownContainer>
        </ClickAwayListener>
      )}
    </View>
  )
})

export default PageMenu
