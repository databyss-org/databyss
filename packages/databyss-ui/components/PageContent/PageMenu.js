import React, { useState, useEffect } from 'react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { useTopicContext } from '@databyss-org/services/topics/TopicProvider'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import {
  BaseControl,
  Icon,
  View,
  Separator,
  pxUnits,
} from '@databyss-org/ui/primitives'
import MakeLoader from '@databyss-org/ui/components/Loaders/MakeLoader'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import ArchiveSvg from '@databyss-org/ui/assets/archive.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import LinkSvg from '@databyss-org/ui/assets/link.svg'
import TrashSvg from '@databyss-org/ui/assets/trash.svg'
import CheckSvg from '@databyss-org/ui/assets/check.svg'
import MenuSvg from '@databyss-org/ui/assets/menu_horizontal.svg'
import DropdownContainer from '@databyss-org/ui/components/Menu/DropdownContainer'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import ClickAwayListener from '@databyss-org/ui/components/Util/ClickAwayListener'
import { menuLauncherSize } from '@databyss-org/ui/theming/buttons'

function copyToClipboard(text) {
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

const PageMenu = ({ pages }) => {
  const getSession = useSessionContext((c) => c && c.getSession)
  const setDefaultPage = useSessionContext((c) => c && c.setDefaultPage)
  const { account } = getSession()
  const [showMenu, setShowMenu] = useState(false)
  const [isPagePublic, setIsPagePublic] = useState(false)
  const [showCopiedCheck, setShowCopiedCheck] = useState(false)

  const {
    getTokensFromPath,
    navigate,
    navigateSidebar,
  } = useNavigationContext()

  const { params } = getTokensFromPath()

  const archivePage = usePageContext((c) => c.archivePage)
  const deletePage = usePageContext((c) => c.deletePage)
  const getPage = usePageContext((c) => c.getPage)

  const setPagePublic = usePageContext((c) => c && c.setPagePublic)

  const getPublicAccount = usePageContext((c) => c && c.getPublicAccount)

  const resetSourceHeaders = useSourceContext((c) => c && c.resetSourceHeaders)

  const resetTopicHeaders = useTopicContext((c) => c && c.resetTopicHeaders)

  const canBeArchived =
    Object.values(pages).filter((p) => !p.archive).length > 1

  // if page is shared, toggle public page
  useEffect(() => {
    if (pages[params]?.publicAccountId) {
      setIsPagePublic(true)
    }
  }, [])

  const onArchivePress = (bool) => {
    archivePage(params, bool).then(() => {
      // reset headers
      resetSourceHeaders()
      resetTopicHeaders()
      if (bool) {
        // if default page is archived set new page as default page
        let redirect = account.defaultPage
        if (account.defaultPage === params) {
          redirect = Object.keys(pages).find((_id) => _id !== params)
          setDefaultPage(redirect)
        }
        navigate(`/pages/${redirect}`)
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

  const _page = getPage(params)

  const onCopyLink = () => {
    let _accountId
    // if account is shared, get public account
    if (_page?.publicAccountId) {
      _accountId = _page.publicAccountId
    } else {
      // if account is private, get private account
      _accountId = account._id
    }

    // generate url and copy to clipboard
    const getUrl = window.location
    const baseUrl = `${getUrl.protocol}//${getUrl.host}/${_accountId}/pages/${params}`

    copyToClipboard(baseUrl)
    setShowCopiedCheck(true)
  }

  const onPageDelete = () => {
    deletePage(params)
    navigate(`/pages/${account.defaultPage}`)
    navigateSidebar('/pages')

    // delete page
  }

  const menuItems = []

  if (canBeArchived && !_page.archive) {
    menuItems.push({
      icon: <ArchiveSvg />,
      label: 'Archive',
      action: () => onArchivePress(true),
      actionType: 'archive',
      // TODO: detect platform and render correct modifier key
      // shortcut: 'Ctrl + Del',
    })
  }

  if (_page.archive) {
    // add restore option
    menuItems.push({
      icon: <PageSvg />,
      label: 'Restore Page',
      action: () => onArchivePress(false),
      actionType: 'restore',
      // TODO: detect platform and render correct modifier key
      // shortcut: 'Ctrl + Del',
    })
    // add delete option
    menuItems.push({
      icon: <TrashSvg />,
      label: 'Delete page forever',
      action: () => onPageDelete(),
      actionType: 'delete',
      // TODO: detect platform and render correct modifier key
      // shortcut: 'Ctrl + Del',
    })
  }

  const togglePublicPage = () => {
    if (isPagePublic) {
      const _page = getPage(params)
      // if account is shared, get public account
      const _accountId = _page.publicAccountId
      setPagePublic(params, !isPagePublic, _accountId)
    } else {
      setPagePublic(params, !isPagePublic)
    }
    setIsPagePublic(!isPagePublic)
    setShowCopiedCheck(false)
  }

  const SharedPageLoader = ({ children }) => (
    <MakeLoader resources={getPublicAccount(params)} children={children} />
  )

  const DropdownList = () =>
    menuItems.map((menuItem) => (
      <DropdownListItem
        {...menuItem}
        action={menuItem.actionType}
        onPress={() => menuItem.action()}
        key={menuItem.label}
      />
    ))

  useEffect(() => {
    if (showCopiedCheck && !showMenu) {
      setShowCopiedCheck(false)
    }
  }, [showMenu])

  const publicLinkItem = showCopiedCheck ? (
    <DropdownListItem
      icon={<CheckSvg />}
      iconColor="green.0"
      action="none"
      label="Link copied to clipboard"
      onPress={() => null}
    />
  ) : (
    <SharedPageLoader>
      {(res) =>
        res.length ? (
          <DropdownListItem
            icon={<LinkSvg />}
            action="copy-link"
            label="Copy link"
            onPress={onCopyLink}
          />
        ) : null
      }
    </SharedPageLoader>
  )

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
        onKeyDown={handleEscKey}
        hoverColor="background.2"
        p="tiny"
        data-test-element="archive-dropdown"
        label="Archive Page"
      >
        <Icon sizeVariant="medium" color="text.1">
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
            <DropdownListItem
              px="small"
              height={pxUnits(34)}
              justifyContent="center"
              label={isPagePublic ? 'Page is public' : 'Make page public '}
              value={isPagePublic}
              onPress={togglePublicPage}
              action="togglePublic"
              switchControl
            />
            {getPublicAccount(params).length ? (
              <>
                <Separator />
                {publicLinkItem}
              </>
            ) : null}
            {!_page.archive && menuItems.length ? <Separator /> : null}
            <DropdownList />
          </DropdownContainer>
        </ClickAwayListener>
      )}
    </View>
  )
}

export default PageMenu
