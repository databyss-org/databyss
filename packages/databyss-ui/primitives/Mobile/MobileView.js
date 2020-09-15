import React from 'react'

import styled from '../styled'
import View from '../View/View'

import ViewHeader from './ViewHeader'

// styled components
const areaStyles = () => ({
  position: 'relative',
  width: '100%',
})

const StyledArea = styled(View, areaStyles)

/*
interface MockPageProps {
  headerItems: ViewHeaderNavItemProps[]
  children?: HTMLDOMelement
}
*/

// component
const MobileView = props => {
  const render = () => (
    <StyledArea>
      <ViewHeader navItems={props.headerItems} />
      <View>{props.children}</View>
    </StyledArea>
  )

  return render()
}

export default MobileView
