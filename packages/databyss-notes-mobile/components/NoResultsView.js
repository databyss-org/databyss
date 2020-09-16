import React from 'react'

import { sans } from '@databyss-org/ui/theming/fonts'
import { Text, styled } from '@databyss-org/ui/primitives'

import { getScrollViewMaxHeight } from '../utils/getScrollViewMaxHeight'

// styled components
const textStyles = () => ({
  backgroundColor: 'transparent',
  fontFamily: sans,
  height: `${getScrollViewMaxHeight()}px`,
  lineHeight: `${getScrollViewMaxHeight()}px`,
  textAlign: 'center',
  width: '100%',
})

const TextArea = styled(Text, textStyles)

// component
const NoResultsView = props => {
  // render methods
  const render = () => <TextArea>{props.text}</TextArea>

  return render()
}

export default NoResultsView
