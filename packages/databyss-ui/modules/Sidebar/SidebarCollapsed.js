import React, { useState } from 'react'
import { View, List } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PagesSvg from '@databyss-org/ui/assets/pages.svg'
import SearchSvg from '@databyss-org/ui/assets/search.svg'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import ArchiveSvg from '@databyss-org/ui/assets/archive.svg'
import ReferencesSvg from '@databyss-org/ui/assets/references.svg'
import DatabyssImg from '@databyss-org/ui/assets/logo-thick.png'
import PublishSvg from '@databyss-org/ui/assets/publish.svg'
import MediaSvg from '@databyss-org/ui/assets/play.svg'
import { pxUnits } from '@databyss-org/ui/theming/views'
import SidebarIconButton from '@databyss-org/ui/components/Sidebar/SidebarIconButton'
import Footer from '@databyss-org/ui/components/Sidebar/Footer'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { usePageReferences } from '@databyss-org/data/pouchdb/hooks'
import { darkTheme } from '../../theming/theme'
import { sidebar } from '../../theming/components'
import { DatabyssMenu } from '../../components/Menu/DatabyssMenu'

const SidebarCollapsed = () => {
  const {
    navigateSidebar,
    getSidebarPath,
    isMenuOpen,
    setMenuOpen,
    getTokensFromPath,
  } = useNavigationContext()
  const { params: pageId } = getTokensFromPath()
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const activeItem = getSidebarPath()
  const pageReferencesRes = usePageReferences(pageId)
  const [showDatabyssMenu, setShowDatabyssMenu] = useState(false)

  const onItemClick = (item) => {
    if (!isMenuOpen) {
      return setMenuOpen(true) && navigateSidebar(`/${item}`)
    }
    return activeItem === item
      ? setMenuOpen(!isMenuOpen)
      : navigateSidebar(`/${item}`)
  }

  const isIconButtonActive = (item) => activeItem === item.name && isMenuOpen

  const sideBarCollapsedItems = [
    {
      name: 'databyss',
      title: 'Databyss',
      icon: <img src={DatabyssImg} />,
      sizeVariant: 'large',
      // height: pxUnits(55),
      onClick: () => {
        setShowDatabyssMenu(!showDatabyssMenu)
      },
      hamburger: true,
      pt: 'em',
    },
    {
      name: 'search',
      title: 'Search',
      icon: <SearchSvg />,
      onClick: () => onItemClick('search'),
    },
    {
      name: 'pages',
      title: 'Pages',
      icon: <PagesSvg />,
      onClick: () => onItemClick('pages'),
    },
    {
      name: 'sources',
      title: 'Sources',
      icon: <SourceSvg />,
      onClick: () => onItemClick('sources'),
    },
    {
      name: 'topics',
      title: 'Topics',
      icon: <TopicSvg />,
      onClick: () => onItemClick('topics'),
    },
    {
      name: 'references',
      title: 'Backlinks',
      icon: <ReferencesSvg />,
      onClick: () => onItemClick('references'),
      badgeText:
        pageReferencesRes.data &&
        pageReferencesRes.data.length > 0 &&
        pageReferencesRes.data.length,
    },
    {
      name: 'media',
      title: 'Media',
      icon: <MediaSvg />,
      onClick: () => onItemClick('media'),
    },
    {
      name: 'groups',
      title: 'Shared Collections',
      icon: <PublishSvg />,
      sizeVariant: 'large',
      onClick: () => onItemClick('groups'),
    },
  ]

  if (!isPublicAccount()) {
    sideBarCollapsedItems.push({
      name: 'archive',
      title: 'Archive',
      icon: <ArchiveSvg />,
      onClick: () => {
        onItemClick('archive')
      },
    })
  }

  return (
    <>
      {showDatabyssMenu && (
        <DatabyssMenu onDismiss={() => setShowDatabyssMenu(false)} />
      )}
      <View theme={darkTheme} bg="background.1" width={sidebar.collapsedWidth}>
        <List
          verticalItemPadding={2}
          horizontalItemPadding={1}
          py="none"
          flexGrow={1}
        >
          {sideBarCollapsedItems.map((item, i) => (
            <SidebarIconButton
              key={item.name}
              isActive={isIconButtonActive(item)}
              seperatorTop={
                sideBarCollapsedItems.length === i + 1 && !isPublicAccount()
              }
              {...item}
            />
          ))}
        </List>
        <Footer collapsed />
      </View>
    </>
  )
}

export default SidebarCollapsed
