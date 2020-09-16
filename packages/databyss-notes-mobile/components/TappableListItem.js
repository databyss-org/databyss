import React from 'react'

import { styled, Text, View } from '@databyss-org/ui/primitives'
import ArrowSvg from '@databyss-org/ui/assets/arrowRight.svg'

// styled components
const areaStyles = () => ({
  position: 'relative',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  height: '60px',
  width: '100%',
  cursor: 'pointer',
})
const labelStyles = () => ({
  lineHeight: '60px',
})
const arrowStyles = () => ({
  display: 'inline-block',
  height: '10px',
  position: 'absolute',
  right: 0,
  top: '20px',
  width: '10px',
})

const StyledArea = styled(View, areaStyles)
const StyledLabel = styled(Text, labelStyles)
const ArrowIcon = styled(View, arrowStyles)

/*
interface ListItemProps {
  _id: string
  label: string
  href: string
  icon: <SVG/>
  onTap?: (_id) => void
}
*/

// component
const TappableListItem = props => {
  const onClick = () => {
    if (props.onTap) {
      props.onTap(props._id)
    }
  }

  const render = () => (
    <StyledArea borderBottomColor="background.3" onClick={onClick}>
      <StyledLabel>{props.label}</StyledLabel>
      <ArrowIcon>
        <ArrowSvg />
      </ArrowIcon>
    </StyledArea>
  )

  return render()
}

export default TappableListItem
