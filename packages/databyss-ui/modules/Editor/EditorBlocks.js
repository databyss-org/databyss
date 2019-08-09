import React, { useEffect } from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { useStateValue } from '@databyss-org/services/editor/ServiceProvider'
import TextArea from './TextArea'
import ActiveBlock from './ActiveBlock'
import { menuAction, styleSelector } from './_helpers'

const EditorBlocks = ({ data }) => {
  const [{ blocks, editRef }, dispatch] = useStateValue()

  const setRef = ref => {
    dispatch({ type: 'SET_REF', data: ref.current })
  }

  const setEditRef = (ref, i) => {
    dispatch({ type: 'EDIT_REF', data: ref.current, index: i })
  }

  const logKey = e => {
    // detect keystrokes
    if (e.keyCode === 8) {
      dispatch({ type: 'BACKSPACE_EDIT' })
    } else if (e.keyCode === 13) {
      dispatch({ type: 'NEW_LINE_EDIT' })
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
      if (editRef instanceof Element) {
        editRef.addEventListener('keydown', logKey)
        editRef.addEventListener('paste', pasteListener)
        return () => {
          editRef.removeEventListener('keydown', logKey)
          editRef.removeEventListener('paste', pasteListener)
        }
      }
    },
    [editRef]
  )

  let blocksRender = blocks.map((i, k) => {
    return (
      <Grid columnGap={1} mb={3} width={1}>
        <View width={1 / 12} />
        <View width={9 / 12}>
          <Text variant={styleSelector(i.type)}>
            <TextArea
              editRef={setEditRef}
              blockState={i}
              dispatch={dispatch}
              setRef={setRef}
              key={k}
            />
          </Text>
        </View>
      </Grid>
    )
  })

  blocksRender = blocksRender.concat(
    <ActiveBlock symbol={'*'} key={data.length} />
  )

  return <View>{blocksRender}</View>
}

export default EditorBlocks
