import React from 'react'

import { sans } from '../../theming/fonts'
import { Text, View } from '../../primitives'
import theme from '../../theming/theme'

import Loading from '../Notify/LoadingFallback'

// constants
const hiddenBottom = '-200vh'
const visibleBottom = '0'

// styled components
const areaStyles = () => ({
  position: 'absolute',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  border: '4px dashed #5d5040',
  borderRadius: '5px',
  height: '92%',
  left: '0',
  margin: '0 auto',
  transition: '350ms',
  transitionTimingFunction: 'ease-in-out',
  width: '100%',
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
  const getBottom = () => (props.isVisible ? visibleBottom : hiddenBottom)

  const getOpacity = () => (props.isVisible ? 1 : 0)

  const render = () => (
    <View
      {...areaStyles()}
      zIndex="modal"
      className="dashed-area"
      bottom={getBottom()}
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
