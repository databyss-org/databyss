import React, { useRef, useState, useEffect } from 'react'

import { sans } from '../../theming/fonts'
import { useNavigationContext } from '../../components/Navigation/NavigationProvider'

import Icon from '../Icon/Icon'
import styled from '../styled'
import Text from '../Text/Text'
import View from '../View/View'

import { ViewHeaderHeight } from './ViewHeader'

// styled components
const areaStyles = () => ({
  display: 'inline-block',
})
const iconStyles = () => ({
  display: 'inline-block',
  height: `${ViewHeaderHeight}px`,
  marginRight: '10px',
  verticalAlign: 'top',
})
const labelStyles = () => ({
  display: 'inline-block',
  fontFamily: sans,
  lineHeight: `${ViewHeaderHeight}px`,
  maxHeight: `${ViewHeaderHeight}px`,
  overflow: 'hidden',
  textAlign: 'left',
  textOverflow: 'ellipsis',
  verticalAlign: 'top',
  whiteSpace: 'nowrap',
})

const Area = styled(View, areaStyles)
const LabelIcon = styled(Icon, iconStyles)
const Label = styled(Text, labelStyles)

/*
interface ViewHeaderNavItemProps {
  depthIndex: number
  totalDepth: number
  label: string
  url: string
  icon?: <svg>
}
*/

// component
const ViewHeaderNavItem = props => {
  const { navigate } = useNavigationContext()

  const labelRef = useRef()

  const [maxWidth, setMaxWidth] = useState('max-content')

  const updateLabelWidth = () => {
    if (labelRef.current && props.depthIndex > 0) {
      // FIXME: js is completely wrong with labelElement.offsetLeft()
      // const labelElement = labelRef.current
      const offsetLeft = 75
      const spaceForLogo = 90
      const availableWidth = window.innerWidth - offsetLeft - spaceForLogo
      const newMaxWidth = `${availableWidth}px`
      setMaxWidth(newMaxWidth)
    }
  }

  const onWindowResize = () => {
    updateLabelWidth()
  }

  useEffect(
    () => {
      updateLabelWidth()

      // add listeners
      window.addEventListener('resize', onWindowResize)

      return () => {
        // cleanup
        window.removeEventListener('resize', onWindowResize)
      }
    },
    [labelRef]
  )

  // render methods
  const renderIcon = () =>
    props.icon ? (
      <LabelIcon
        className="label-icon"
        sizeVariant="medium"
        color="text.4"
        title={props.label}
        onClick={() => navigate(props.url)}
      >
        {props.icon}
      </LabelIcon>
    ) : null

  const renderLabel = () => {
    if (props.depthIndex === 0 && props.totalDepth > 1) {
      return null
    }

    const separator = () => (
      <Label className="separator" color="text.4" marginRight="small">
        /
      </Label>
    )

    const label = () => (
      <Label
        className="label"
        color="text.4"
        ref={labelRef}
        maxWidth={maxWidth}
      >
        {props.label}
      </Label>
    )

    if (props.depthIndex > 0) {
      return (
        <View display="block">
          {separator()}
          {label()}
        </View>
      )
    }
    return label()
  }

  const render = () => (
    <Area className="view-header-nav-item">
      {renderIcon()}
      {renderLabel()}
    </Area>
  )

  return render()
}

export default ViewHeaderNavItem
