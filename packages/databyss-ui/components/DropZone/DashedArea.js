import React from 'react'

import { sans } from '../../theming/fonts'
import { Text, View } from '../../primitives'
import theme from '../../theming/theme'

import Loading from '../Notify/LoadingFallback'

// styled components
const areaStyles = () => ({
  position: 'absolute',
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  border: '4px dashed #5d5040',
  borderRadius: '5px',
  top: '2%',
  left: '2%',
  right: '2%',
  bottom: '2%',
  transition: '350ms',
  transitionTimingFunction: 'ease-in-out',
})

const textStyles = () => ({
  color: '#5d5040',
  fontFamily: sans,
  fontSize: 48,
  fontWeight: theme.fontWeights.bold,
  margin: 'auto',
  position: 'relative',
})

// component
const DashedArea = (props) => {
  const getOpacity = () => (props.isVisible ? 1 : 0)

  const render = () => (
    <View
      {...areaStyles()}
      zIndex="modal"
      className="dashed-area"
      opacity={getOpacity()}
    >
      {props.isParsing ? (
        <Loading />
      ) : (
        <Text {...textStyles()}>{props.label}</Text>
      )}
    </View>
  )

  return render()
}

export default DashedArea
