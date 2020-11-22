import React from 'react'

import { Button, Icon, Text, pxUnits, styled } from '../../primitives'
import { sans } from '../../theming/fonts'

export const TabHeight = 50

/*
export interface TabProps {
  // the DOM id of the panel, so it can be targetted by aria-controls
  id: string

  icon?: <SVG />
  label: string
  onClick: () => void
  isActive: boolean
  width: css-accepted width value
}
*/

// styled components
const tabStyles = () => ({
  backgroundColor: 'transparent',
  borderBottomStyle: 'solid',
  borderLeft: 'none',
  borderRadius: '0',
  borderRight: 'none',
  borderTop: 'none',
  boxShadow: 'none',
  display: 'inline-flex',
  flexDirection: 'row',
  height: `${TabHeight}px`,
  margin: '0',
})

const labelStyles = () => ({
  fontFamily: sans,
})

const TabButton = styled(Button, tabStyles)
const Label = styled(Text, labelStyles)

// component
const Tab = (props) => {
  const { id, icon, label, onClick, isActive, width } = props

  // render methods
  const renderIcon = () =>
    icon ? (
      <Icon
        className="icon"
        sizeVariant="small"
        color="text.1"
        mt={pxUnits(2)}
        mr={pxUnits(10)}
      >
        {icon}
      </Icon>
    ) : null

  const render = () => (
    <TabButton
      id={`${id}Tab`}
      className="tab-button"
      aria-controls={`${id}Panel`}
      aria-selected={isActive}
      borderBottomColor={isActive ? 'purple.2' : 'background.3'}
      borderBottomWidth={isActive ? pxUnits(3) : pxUnits(1)}
      childViewProps={{ flexDirection: 'row' }}
      onPress={onClick}
      role="tab"
      width={width}
    >
      {renderIcon()}
      <Label className="label" color="text.1">
        {label}
      </Label>
    </TabButton>
  )

  return render()
}

export default Tab
