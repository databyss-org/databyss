import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { View } from '@databyss-org/ui/primitives'
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
    } else if (e.keyCode === 13) {
      dispatch({ type: 'NEW_LINE' })
    } else {
      // clear()
    }
  }

  const pasteListener = e => {
    e.preventDefault()
    const text = (e.originalEvent || e).clipboardData.getData('text/plain')

    // insert text manually
    document.execCommand('insertHTML', false, text)
  }

  useEffect(
    () => {
      if (contentRef instanceof Element) {
        contentRef.addEventListener('keydown', logKey)
        contentRef.addEventListener('paste', pasteListener)
        return () => {
          contentRef.removeEventListener('keydown', logKey)
          contentRef.removeEventListener('paste', pasteListener)
        }
      }
    },
    [contentRef]
  )
  const symbol = menuAction(blockState).text
  return (
    <Grid columnGap={1} mb={3} {...others}>
      <View width={1 / 12} />
      <View width={10 / 12}>
        <TextArea blockState={blockState} dispatch={dispatch} setRef={setRef} />
      </View>
    </Grid>
  )
}

export default ActiveBlock
