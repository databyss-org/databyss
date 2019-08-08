import React, { useEffect, useRef } from 'react'
import _ from 'lodash'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { Text, View } from '@databyss-org/ui/primitives'
import { useStateValue } from '@databyss-org/services/editor/ServiceProvider'
import { menuAction } from './_helpers'
import TextArea from './TextArea'

const ActiveBlock = ({ text, ...others }) => {
  const [{ blockState, contentRef }, dispatch] = useStateValue()

  const setRef = ref => {
    dispatch({ type: 'SET_REF', data: ref.current })
  }

  const logKey = e => {
    // detect keystrokes
    if (e.keyCode === 8) {
      dispatch({ type: 'BACKSPACE' })
    }
    if (e.keyCode === 13) {
      dispatch({ type: 'NEW_LINE' })
    }
    if (e.key === '@') {
      //  dispatch({ type: 'IN_SOURCE' })
    }
  }

  useEffect(
    () => {
      if (contentRef instanceof Element) {
        contentRef.addEventListener('keydown', logKey)
        return () => {
          contentRef.removeEventListener('keydown', logKey)
        }
      }
    },
    [contentRef]
  )
  const symbol = menuAction(blockState).text
  return (
    <Grid columnGap={1} mb={1} {...others}>
      <View width={1 / 12}>
        <Text variant="uiTextNormal" color="gray.4" textAlign="right">
          {symbol}
        </Text>
      </View>
      <View width={10 / 12}>
        <TextArea blockState={blockState} dispatch={dispatch} setRef={setRef} />
      </View>
    </Grid>
  )
}

export default ActiveBlock
