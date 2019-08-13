import React, { useEffect } from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { useStateValue } from '@databyss-org/services/editor/ServiceProvider'
import TextArea from './TextArea'
import { styleSelector } from './_helpers'

const EditorBlocks = ({ data }) => {
  const [{ blocks, editRef, editIndex }, dispatch] = useStateValue()

  const setRef = ({ ref, index }) => {
    dispatch({ type: 'SET_REF', data: { ref, index } })
  }

  const setEditRef = (ref, i) => {
    dispatch({ type: 'EDIT_REF', data: ref.current, index: i })
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
        editRef.addEventListener('paste', pasteListener)
        return () => {
          editRef.removeEventListener('paste', pasteListener)
        }
      }
    },
    [editRef]
  )
  let blocksRender = blocks.map((i, k) => {
    return (
      <Grid columnGap={1} mb={3} width={1} key={k}>
        <View width={1 / 12} />
        <View width={9 / 12}>
          <Text variant={styleSelector(i.type)}>
            <TextArea
              activeIndex={editIndex}
              editRef={setEditRef}
              blockState={i}
              dispatch={dispatch}
              setRef={setRef}
            />
          </Text>
        </View>
      </Grid>
    )
  })

  return <View>{blocksRender}</View>
}

export default EditorBlocks
