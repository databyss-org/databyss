import React from 'react'

import LogoImage from '@databyss-org/ui/assets/logo-v2.png'

import styled from '../styled'
import View from '../View/View'
import ViewHeaderNavItem from './ViewHeaderNavItem'

export const ViewHeaderHeight = 50

// styled components
const areaStyles = () => ({
  position: 'relative',
  display: 'inline-block',
  height: `${ViewHeaderHeight}px`,
  paddingLeft: '25px',
  paddingRight: '25px',
  width: '100%',
})
const imgStyles = () => ({
  height: '30px',
  display: 'inline-block',
  position: 'absolute',
  verticalAlign: 'top',
  right: '25px',
  top: '10px',
})

const Header = styled(View, areaStyles)
const Logo = styled('img', imgStyles)

/*
interface ViewHeaderProps {
  navItems: ViewHeaderNavItemProps[]
}
*/

// component
const ViewHeader = props => {
  const render = () => (
    <Header className="view-header" bg="background.6" zIndex={1}>
      {props.navItems.map((item, index) => (
        <ViewHeaderNavItem
          key={index}
          depthIndex={index}
          totalDepth={props.navItems.length}
          label={item.title}
          url={item.url}
          icon={item.icon}
        />
      ))}
      <Logo src={LogoImage} alt="Databyss" />
    </Header>
  )

  return render()
}

export default ViewHeader
