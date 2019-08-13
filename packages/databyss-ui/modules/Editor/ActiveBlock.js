import React, { useEffect } from 'react'
import _ from 'lodash'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { View, Text } from '@databyss-org/ui/primitives'
import { useStateValue } from '@databyss-org/services/editor/ServiceProvider'
import { styleSelector } from './_helpers'
import TextArea from './TextArea'

const ActiveBlock = ({ text, ...others }) => {
  const [{ blockState, contentRef }, dispatch] = useStateValue()

  const setRef = ({ ref, index }) => {
    dispatch({ type: 'SET_REF', data: { ref, index } })
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
        contentRef.addEventListener('paste', pasteListener)
        return () => {
          contentRef.removeEventListener('paste', pasteListener)
        }
      }
    },
    [contentRef]
  )

  const setEditRef = ref => {
    dispatch({ type: 'EDIT_REF', data: ref.current, index: -1 })
  }

  return (
    <Grid columnGap={1} mb={3} {...others}>
      <View width={1 / 12} />
      <View width={10 / 12}>
        <Text variant={styleSelector(blockState.type)}>
          <TextArea
            editRef={setEditRef}
            blockState={blockState}
            dispatch={dispatch}
            setRef={setRef}
          />
        </Text>
      </View>
    </Grid>
  )
}

export default ActiveBlock
