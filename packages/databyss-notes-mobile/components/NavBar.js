import React, { useState, useEffect } from 'react'

import { styled, View } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import SidebarIconButton from '@databyss-org/ui/components/Sidebar/SidebarIconButton'

import { parseLocation } from '../utils/parseLocation'
import NavBarItems from '../constants/NavBarItems'
import Tabs from '../constants/Tabs'

export const NavBarHeight = 50

// styled components
const areaStyles = () => ({
  bottom: 0,
  height: `${NavBarHeight}px`,
  position: 'fixed',
  width: '100%',
})

const listStyles = () => ({
  flexDirection: 'row',
  justifyContent: 'center',
  paddingLeft: '25px',
  paddingRight: '25px',
})

const listItemStyles = () => ({
  flexDirection: 'row',
  height: `${NavBarHeight}px`,
  margin: '0 15px',
  width: `${NavBarHeight}px`,
})

const buttonStyles = () => ({
  margin: 'auto auto',
})

const Component = styled(View, areaStyles)
const List = styled(View, listStyles)
const ListItem = styled(View, listItemStyles)
const NavButton = styled(SidebarIconButton, buttonStyles)

// component
const NavBar = props => {
  const navigationContext = useNavigationContext()
  const isPublicAccount = useSessionContext(c => c && c.isPublicAccount)

  const { location } = navigationContext

  const navBarItems = NavBarItems(isPublicAccount())
  const getItemByName = name => navBarItems.find(i => i.name === name)

  const [activeItem, setActiveItem] = useState(Tabs.PAGES)

  const isItemActive = item => item.name === activeItem

  const dispatchItemChange = item => {
    if (!item) {
      // no item provided, set pages as default
      /* eslint-disable no-param-reassign */
      item = getItemByName(Tabs.PAGES)
      /* eslint-enable no-param-reassign */
    }

    if (isItemActive(item)) {
      // item is currently already active, do nothing
      return
    }

    setActiveItem(item.name)

    if (props.onChange) {
      props.onChange(item)
    }
  }

  const onItemClick = item => {
    navigationContext.navigate(item.url)
  }

  useEffect(
    () => {
      const { breadCrumbs } = parseLocation(location)

      if (!Array.isArray(breadCrumbs) || !breadCrumbs.length) {
        // When loading index page, before redirection,
        // location is empty, and throws an error.
        // Ignore case, redirection will go to page
        // with proper content for breadcrumbs.
        return
      }

      const navItem = breadCrumbs[0].index
      dispatchItemChange(navItem)
    },
    [dispatchItemChange, location]
  )

  // render methods
  const render = () => (
    <Component bg="background.6">
      <List className="nav-bar-list">
        {navBarItems.map((item, index) => (
          <ListItem className="list-item" key={index}>
            <NavButton
              name={item.name}
              key={item.name}
              title={item.title}
              icon={item.icon}
              isBottomNav
              isActive={isItemActive(item)}
              onClick={() => onItemClick(item)}
            />
          </ListItem>
        ))}
      </List>
    </Component>
  )

  return render()
}

export default NavBar
