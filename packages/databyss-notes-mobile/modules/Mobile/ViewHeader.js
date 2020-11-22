import React from 'react'

import LogoImage from '@databyss-org/ui/assets/logo-v2.png'

import styled from '@databyss-org/ui/primitives/styled'
import { View, BaseControl } from '@databyss-org/ui/primitives'
import ViewHeaderNavItem from './ViewHeaderNavItem'

export const ViewHeaderHeight = 50

// styled components
const imgStyles = () => ({
  height: '25px',
})

const Logo = styled('img', imgStyles)

/*
interface ViewHeaderProps {
  navItems: ViewHeaderNavItemProps[]
}
*/

// component
const ViewHeader = (props) => {
  const render = () => (
    <View
      height={`${ViewHeaderHeight}px`}
      className="view-header"
      bg="background.6"
      zIndex={1}
      px="small"
      alignItems="center"
      flexDirection="row"
    >
      <View flexGrow="1" flexDirection="row">
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
      </View>
      <BaseControl href="https://databyss.org" target="_blank">
        <Logo src={LogoImage} alt="Databyss" />
      </BaseControl>
    </View>
  )

  return render()
}

export default ViewHeader
