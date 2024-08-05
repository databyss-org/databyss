import React, { useState, useEffect } from 'react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useEditorPageContext } from '@databyss-org/services'
import {
  BaseControl,
  Icon,
  View,
  // Separator,
  // Text,
} from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import ArchiveSvg from '@databyss-org/ui/assets/archive.svg'
// import { getAccountFromLocation } from '@databyss-org/services/session/utils'
import PageSvg from '@databyss-org/ui/assets/page.svg'
// import LinkSvg from '@databyss-org/ui/assets/link.svg'
import TrashSvg from '@databyss-org/ui/assets/trash.svg'
// import CheckSvg from '@databyss-org/ui/assets/check.svg'
import MenuSvg from '@databyss-org/ui/assets/menu_horizontal.svg'
import SaveSvg from '@databyss-org/ui/assets/save.svg'
// import { saveGroup } from '@databyss-org/services/groups'
// import { Group } from '@databyss-org/services/interfaces'
import DropdownContainer from '@databyss-org/ui/components/Menu/DropdownContainer'
// import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import ClickAwayListener from '@databyss-org/ui/components/Util/ClickAwayListener'
import { menuLauncherSize } from '@databyss-org/ui/theming/buttons'
import { usePages, useGroups } from '@databyss-org/data/pouchdb/hooks'
import { useExportContext } from '@databyss-org/services/export'
// import { urlSafeName } from '@databyss-org/services/lib/util'
import LoadingFallback from '../Notify/LoadingFallback'
// import { pxUnits } from '../../theming/views'
import { DropdownList } from '../Menu/DropdownList'
import { addMenuFooterItems, exportMenuItems } from '../../lib/menuItems'

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
  const groupsRes = useGroups()
  const exportContext = useExportContext()

  const pages = pagesRes.data
  const groups = groupsRes.data

  // const getSession = useSessionContext((c) => c && c.getSession)
  const isReadOnly = useSessionContext((c) => c && c.isReadOnly)
  const navigateToDefaultPage = useSessionContext(
    (c) => c && c.navigateToDefaultPage
  )
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)

  // const { defaultPageId } = getSession()
  const [showMenu, setShowMenu] = useState(false)
  // const [isPagePublic, setIsPagePublic] = useState(false)
  // const [pageInGroups, setPageInGroups] = useState([])
  const [, setPageInGroups] = useState([])
  const [showCopiedCheck, setShowCopiedCheck] = useState(false)

  const {
    getTokensFromPath,
    // navigate,
    navigateSidebar,
  } = useNavigationContext()

  const { params } = getTokensFromPath()

  const archivePage = useEditorPageContext((c) => c.archivePage)
  const deletePage = useEditorPageContext((c) => c.deletePage)
  const {
    // exportSinglePage,
    // exportAllPages,
    setCurrentPageId,
  } = useExportContext()

  useEffect(() => {
    setCurrentPageId(params)
    return () => {
      setCurrentPageId(null)
    }
  }, [])

  // const setPagePublic = useEditorPageContext((c) => c && c.setPagePublic)

  const canBeArchived =
    Object.values(pages).filter((p) => !p.archive).length > 1

  // if page is shared, toggle public page
  useEffect(() => {
    if (groupsRes.isSuccess) {
      if (groups[`p_${params}`]) {
        // get public status of page
        // const _pageGroup = groups[`p_${params}`]
        // setIsPagePublic(_pageGroup.public)
      }

      // get all groups page appears in
      const pageGroups = Object.values(groupsRes.data).filter(
        (group) => !!group.name && group.pages.includes(params)
      )
      setPageInGroups(pageGroups)
    }
  }, [groupsRes.isSuccess])

  const onArchivePress = (bool) => {
    archivePage(params, bool).then(() => {
      if (bool) {
        navigateToDefaultPage()
      } else {
        navigateSidebar('/pages')
      }
    })
  }

  const handleEscKey = (e) => {
    if (e.key === 'Escape') {
      setShowMenu(false)
    }
  }

  const _page = pages?.[params]

  // const onCopyLink = () => {
  //   // getAccountFromLocation()
  //   // generate url and copy to clipboard
  //   const getUrl = window.location
  //   const baseUrl = `${getUrl.protocol}//${
  //     getUrl.host
  //   }/${getAccountFromLocation(true)}/pages/${params}/${urlSafeName(
  //     _page.name
  //   )}`
  //   copyToClipboard(baseUrl)
  //   setShowCopiedCheck(true)
  // }

  const onPageDelete = () => {
    deletePage(params)
    navigateToDefaultPage()
    navigateSidebar('/pages')

    // delete page
  }

  const menuItems = []

  if (!isPublicAccount()) {
    if (canBeArchived && !_page.archive) {
      menuItems.push({
        icon: <ArchiveSvg />,
        label: 'Archive',
        action: () => onArchivePress(true),
        actionType: 'archive',
        disabled: isReadOnly,
        // TODO: detect platform and render correct modifier key
        // shortcut: 'Ctrl + Del',
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
        // TODO: detect platform and render correct modifier key
        // shortcut: 'Ctrl + Del',
      })
      // add delete option
      menuItems.push({
        icon: <TrashSvg />,
        label: 'Delete page forever',
        action: () => onPageDelete(),
        actionType: 'delete',
        disabled: isReadOnly,
        // TODO: detect platform and render correct modifier key
        // shortcut: 'Ctrl + Del',
      })
    }
  }

  menuItems.push(
    ...exportMenuItems(exportContext, [
      {
        icon: <SaveSvg />,
        label: 'Export page',
        subLabel: 'Including references',
        action: () => exportContext.exportSinglePage(params),
        actionType: 'exportPage',
      },
    ])
  )

  addMenuFooterItems(menuItems)

  // const togglePublicPage = () => {
  //   setPagePublic(params, !isPagePublic)
  //   setIsPagePublic(!isPagePublic)
  // }

  useEffect(() => {
    if (showCopiedCheck && !showMenu) {
      setShowCopiedCheck(false)
    }
  }, [showMenu])

  // const publicLinkItem = showCopiedCheck ? (
  //   <DropdownListItem
  //     icon={<CheckSvg />}
  //     iconColor="green.0"
  //     action="none"
  //     label="Link copied to clipboard"
  //     onPress={() => null}
  //   />
  // ) : (
  //   <DropdownListItem
  //     icon={<LinkSvg />}
  //     action="copy-link"
  //     label="Copy link"
  //     onPress={onCopyLink}
  //   />
  // )

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
            {/* {!isPublicAccount() && !_page.archive ? (
              <>
                <DropdownListItem
                  height={pxUnits(34)}
                  justifyContent="center"
                  label={isPagePublic ? 'Page is public' : 'Make page public '}
                  value={isPagePublic}
                  onPress={togglePublicPage}
                  action="togglePublic"
                  disabled={isReadOnly}
                  switchControl
                />
                {isPagePublic ? (
                  <>
                    <Separator secondary />
                    {publicLinkItem}
                  </>
                ) : null}
                <Separator />
              </>
            ) : null} */}

            <DropdownList menuItems={menuItems} />
            {/* {Object.values(groups).length ? <Separator /> : null}
            {groupsRes.isSuccess && Object.values(groups).length ? (
              collections()
            ) : (
              <>
                <Separator />
                <View
                  ml="small"
                  height={pxUnits(34)}
                  justifyContent="center"
                  key="is-in-groups"
                >
                  <Text color="text.3" variant="uiTextSmall">
                    Add to Collection:
                  </Text>
                </View>
                <DropdownListItem
                  key="new-collection"
                  mx="small"
                  justifyContent="center"
                  label="New collection..."
                  // value={isPagePublic}
                  onPress={() => addPageToNewCollection(params)}
                  action="groups_click"
                />
              </>
            )} */}
          </DropdownContainer>
        </ClickAwayListener>
      )}
    </View>
  )
})

export default PageMenu
