import React, { useState, useEffect } from 'react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import {
  BaseControl,
  Icon,
  View,
  SwitchControl,
  Text,
  Separator,
} from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import ArchiveSvg from '@databyss-org/ui/assets/archive.svg'
import LinkSvg from '@databyss-org/ui/assets/link.svg'
import MenuSvg from '@databyss-org/ui/assets/menu_horizontal.svg'
import DropdownContainer from '@databyss-org/ui/components/Menu/DropdownContainer'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import ClickAwayListener from '@databyss-org/ui/components/Util/ClickAwayListener'
import { menuLauncherSize } from '@databyss-org/ui/theming/buttons'

function copyToClipboard(text) {
  var dummy = document.createElement('textarea')
  // to avoid breaking orgain page when copying more words
  // cant copy when adding below this code
  // dummy.style.display = 'none'
  document.body.appendChild(dummy)
  //Be careful if you use texarea. setAttribute('value', value), which works with "input" does not work with "textarea". – Eduard
  dummy.value = text
  dummy.select()
  document.execCommand('copy')
  document.body.removeChild(dummy)
}

export const ArchiveBin = ({ pages }) => {
  const { getSession } = useSessionContext()
  const { account } = getSession()
  const [showMenu, setShowMenu] = useState(false)
  const [isPagePublic, setIsPagePublic] = useState(false)

  const { getTokensFromPath, navigate } = useNavigationContext()

  const { params } = getTokensFromPath()

  const archivePage = usePageContext(c => c.archivePage)
  const setDefaultPage = usePageContext(c => c.setDefaultPage)
  const getPage = usePageContext(c => c.getPage)

  const setPagePublic = usePageContext(c => c.setPagePublic)

  const canBeArchived = Object.values(pages).filter(p => !p.archive).length > 1

  // if page is shared, toggle public page
  useEffect(() => {
    if (pages[params].publicAccountId) {
      setIsPagePublic(true)
    }
  }, [])

  const onArchivePress = () => {
    archivePage(params).then(() => {
      // if default page is archived set new page as default page
      let redirect = account.defaultPage
      if (account.defaultPage === params) {
        redirect = Object.keys(pages).find(_id => _id !== params)
        setDefaultPage(redirect)
      }
      navigate(`/pages/${redirect}`)
    })
  }

  const handleEscKey = e => {
    if (e.key === 'Escape') {
      setShowMenu(false)
    }
  }

  const onCopyLink = () => {
    const _page = getPage(params)
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
    const baseUrl = `${getUrl.protocol}//${
      getUrl.host
    }/${_accountId}/pages/${params}`

    copyToClipboard(baseUrl)
  }

  const menuItems = [
    {
      icon: <LinkSvg />,
      label: 'Copy link',
      action: () => onCopyLink(),

      // TODO: detect platform and render correct modifier key
      // shortcut: 'Ctrl + Del',
    },
  ]

  if (canBeArchived) {
    menuItems.push({
      icon: <ArchiveSvg />,
      label: 'Archive',
      action: () => onArchivePress(),
      // TODO: detect platform and render correct modifier key
      // shortcut: 'Ctrl + Del',
    })
  }

  const togglePublicPage = () => {
    if (isPagePublic) {
      setPagePublic(params, !isPagePublic)
    } else {
      setPagePublic(params, !isPagePublic)
    }
    setIsPagePublic(!isPagePublic)
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
            <View
              flexDirection="row"
              mx="small"
              my="small"
              justifyContent="space-between"
              bottomBorder="1px"
              alignItems="center"
            >
              <Text variant="uiTextSmall">Page is public</Text>
              <SwitchControl value={isPagePublic} onChange={togglePublicPage} />
            </View>
            <Separator color="border.2" />
            {menuItems.map(menuItem => (
              <DropdownListItem
                {...menuItem}
                action="archive"
                onPress={() => menuItem.action()}
                onKeyDown={handleEscKey}
                key={menuItem.label}
              />
            ))}
          </DropdownContainer>
        </ClickAwayListener>
      )}
    </View>
  )
}
