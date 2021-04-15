import React, { useState } from 'react'
import styled from '@databyss-org/ui/primitives/styled'
import View from '@databyss-org/ui/primitives/View/View'
import Tabs from '../../constants/Tabs'
import NavBar from '../../components/NavBar'
import ViewHeader from './ViewHeader'

// styled components
const areaStyles = () => ({
  position: 'relative',
  width: '100%',
  flexGrow: 1,
  flexShrink: 1,
  overflow: 'hidden',
})

const StyledArea = styled(View, areaStyles)

/*
interface MockPageProps {
  headerItems: ViewHeaderNavItemProps[]
  children?: HTMLDOMelement
}
*/

// component
const MobileView = (props) => {
  const [currentTab, setCurrentTab] = useState(Tabs.PAGES)

  const onNavBarChange = (item) => {
    if (item.name !== currentTab) {
      setCurrentTab(item.name)

      if (window) {
        window.scrollTo(0, 0)
      }
    }
  }

  const render = () => (
    <StyledArea>
      <ViewHeader navItems={props.headerItems} />
      <View flexGrow={1} flexShrink={1} overflow="hidden">
        {props.children}
      </View>
      <NavBar onChange={onNavBarChange} />
    </StyledArea>
  )

  return render()
}

export default MobileView
